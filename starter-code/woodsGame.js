var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = '30px Arial';
 
var HEIGHT = 800;
var WIDTH = 800;
 
var frameCount = 0;
var score = 0;
//player 
var player = {
    x:50,
    spdX:30,
    y:40,
    spdY:5,
    name:'P',
    hp:100,
    width:20,
    height:20,
    color:'green',
        //
    atkSpd:1,
    attackCounter:0,
    goDown: false, 
    goUp: false,
    goLeft: false,
    goRight: false,
    aimAngle:0,
};
//returns distance between player and obstacle 
var lumberjacks = {};
var plants = {};
var protectiveForces = {};
 
getDistance = function (a,b){ 
        var vx = a.x - b.x;
        var vy = a.y - b.y;
        //returns square root of values/coordinates = distance
        return Math.sqrt(vx*vx+vy*vy);
}
//compares between the calculate distances and returns a bollean response 
theCollision = function (a,b){       
        var rect1 = {
                x:a.x-a.width/2,
                y:a.y-a.height/2,
                width:a.width,
                height:a.height,
        }
        var rect2 = {
                x:b.x-b.width/2,
                y:b.y-b.height/2,
                width:b.width,
                height:b.height,
        }
        return testCollision(rect1,rect2);
       
}
//constructor for lumberjacks as obstacles
Lumberjack = function (id,x,y,spdX,spdY,width,height){
        var Lumberjack = {
          x:x,
          spdX:spdX,
          y:y,
          spdY:spdY,
          name:'E',
          id:id,
          width:width,
          height:height,
          color:'blue',
        };
        lumberjacks[id] = Lumberjack;
       
}
//constructor to generate random lumberjacks 
randomLumberjacks = function(){
        //Math.random() returns a number between 0 and 1
        var x = Math.random()*WIDTH;
        var y = Math.random()*HEIGHT;
        var height = 10 + Math.random()*30;     //between 10 and 40
        var width = 10 + Math.random()*30;
        var id = Math.random();
        var spdX = 5 + Math.random() * 5;
        var spdY = 5 + Math.random() * 5;
        Lumberjack(id,x,y,spdX,spdY,width,height);
       
}
//constructor for health/booster and damaging plants 
Plant = function (id,x,y,spdX,spdY,width,height,category,color){
        var plant = {
         x:x,
         spdX:spdX,
         y:y,
         spdY:spdY,
         name:'E',
         id:id,
         width:width,
         height:height,
         color:color,
                //
        category:category,
        };
        plants[id] = plant;
}
//function to randomly generate plants on canvs 
randomPlants = function(){
        //Math.random() returns a number between 0 and 1
        var x = Math.random()*WIDTH;
        var y = Math.random()*HEIGHT;
        var height = 10;
        var width = 10;
        var id = Math.random();
        var spdX = 0;
        var spdY = 0;
    //one third of plants are harmful
    //one third add to healt
    //one third of plants boost score by 100 pts
        if(Math.random()<0.35){
          category = 'harmful';
          color = 'red';
        } else if(Math.random()<0.35){
          category = 'beneficial';
          color = 'yellow';
        } else{
          category = 'powerboost';
          color = 'orange';
           };
       
        Plant(id,x,y,spdX,spdY,width,height,category,color);
}
//constructor for forced used to fight lumberjacks 
ProtectiveForce = function (id,x,y,spdX,spdY,width,height){
        var protectiveForce = {
                x:x,
                spdX:spdX,
                y:y,
                spdY:spdY,
                name:'E',
                id:id,
                width:width,
                height:height,
                color:'black',
                //
                timer:0,
        };
        protectiveForces[id] = protectiveForce;
}
//function to randomly generate forces 
randomProtectiveForce = function(actor,aimOverwrite){
        //Math.random() returns a number between 0 and 1
        var x = player.x;
        var y = player.y;
        var height = 10;
        var width = 10;
        var id = Math.random();
       
        var angle;
        if(aimOverwrite !== undefined)
                angle = aimOverwrite;
        else angle = actor.aimAngle;
       //cos and sin needed to return angle, math.pi used to return in degrees
        var spdX = Math.cos(angle/180*Math.PI)*5;
        var spdY = Math.sin(angle/180*Math.PI)*5;
        ProtectiveForce (id,x,y,spdX,spdY,width,height);
}
 //values of x and y change according to the added spd values 
updateEntity = function (something){
        updateEntityPosition(something);
        drawEntity(something);
}
//values of x and y change according to the added spd values  
updateEntityPosition = function(something){
        something.x += something.spdX;
        something.y += something.spdY;
         //verifies position of player and stops it from going outside of canvas               
        if(something.x < 0 || something.x > WIDTH){
                something.spdX = -something.spdX;
        }
        if(something.y < 0 || something.y > HEIGHT){
                something.spdY = -something.spdY;
        }
}
//verifies position of player and stops it from going outside of canvas 
testCollision = function(rect1,rect2){
        return rect1.x <= rect2.x+rect2.width
                && rect2.x <= rect1.x+rect1.width
                && rect1.y <= rect2.y + rect2.height
                && rect2.y <= rect1.y + rect1.height;
}
//function to draw player on canvas 
drawEntity = function(something){
        ctx.save();
        ctx.fillStyle = something.color;
        ctx.fillRect(something.x-something.width/2,something.y-something.height/2,something.width,something.height);
        ctx.restore();
}
//function for protective forces to be shot with mouse click 
document.onclick = function(mouse){
        if(player.attackCounter > 25){  //every 1 sec
                player.attackCounter = 0;
                randomProtectiveForce(player);
        }
}
 //mouse right click produces a special power
document.oncontextmenu = function(mouse){
        if(player.attackCounter > 50){  //every 1 sec
                player.attackCounter = 0;
                //360 forces drawn on canvas
                for(var i = 0 ; i < 360; i++){
                        randomProtectiveForce(player,i);
                }
                
                // randomProtectiveForce(player,player.aimAngle - 5);
                // randomProtectiveForce(player,player.aimAngle);
                // randomProtectiveForce(player,player.aimAngle + 5);
        }
        mouse.preventDefault();
}
//it gives interactivity to the player by using the mouse  
document.onmousemove = function(mouse){
        var mouseX = mouse.clientX - document.getElementById('ctx').getBoundingClientRect().left;
        var mouseY = mouse.clientY - document.getElementById('ctx').getBoundingClientRect().top;
         //mouse position becomes relative to player - direct aiming
        mouseX -= player.x;
        mouseY -= player.y;
       
        player.aimAngle = Math.atan2(mouseY,mouseX) / Math.PI * 180;
}
 //function to control keys
 //records event when key is pressed down 
document.onkeydown = function(event){
  if(event.keyCode === 40){
    player.goDown = true;
    } else if(event.keyCode ===38){
    player.goUp  = true;
    } else if(event.keyCode === 37){
    player.goLeft = true;
    } else if(event.keyCode === 39){
    player.goRight = true;
    }
}
//clears prior position from pressing key down
document.onkeyup = function(event){
  if(event.keyCode === 40){
    player.goDown = false;
    } else if(event.keyCode ===38){
    player.goUp  = false;
    } else if(event.keyCode === 37){
    player.goLeft = false;
    } else if(event.keyCode === 39){
    player.goRight = false;
    }
}
//returns position of player 
updatePlayerPosition = function(){
  if(player.goDown)
  player.y +=10;
 if (player.goUp)
  player.y -=10;
 if (player.goLeft)
  player.x -=10;
 if (player.goRight)
  player.x += 10;
       
         //verifies position of player and stops it from going outside of canvas
        if(player.x < player.width/2)
                player.x = player.width/2;
        if(player.x > WIDTH-player.width/2)
                player.x = WIDTH - player.width/2;
        if(player.y < player.height/2)
                player.y = player.height/2;
        if(player.y > HEIGHT - player.height/2)
                player.y = HEIGHT - player.height/2;
       
       
}
//updates canvas during the game, updates every single frame 
update = function(){
        //clears the repetitions made with the intervals
        ctx.clearRect(0,0,WIDTH,HEIGHT);
        //25 frames per second
        frameCount++;
        score++;
       //condition to generate more obstacles every 4 seconds
        if(frameCount % 100 === 0)      //every 4 sec
                randomLumberjacks();
 
        if(frameCount % 50 === 0)       //every 2 sec
                randomPlants();
       
        player.attackCounter += player.atkSpd;
       
       
        for(var key in protectiveForces){
                updateEntity(protectiveForces[key]);
               
                var toRemove = false;
                protectiveForces[key].timer++;
                if(protectiveForces[key].timer > 75){
                        toRemove = true;
                }
               
                for(var key2 in lumberjacks){
                        var isColliding = theCollision(protectiveForces[key],lumberjacks[key2]);
                        if(isColliding){
                                toRemove = true;
                                delete lumberjacks[key2];
                                break;
                        }                      
                }
                if(toRemove){
                        delete protectiveForces[key];
                }
        }
       
        for(var key in plants){
                updateEntity(plants[key]);
                var isColliding = theCollision(player,plants[key]);
                if(isColliding){
                  // console.log('Colliding');
                  if(plants[key].category === 'harmful'){
                    player.hp -= 10; 
                  }else if (plants[key].category === 'beneficial'){ 
                    player.hp += 5;
                  }else if(plants[key].category === 'powerboost'){
                    score += 100;
                  }
                        delete plants[key];
                }
        }
       
        for(var key in lumberjacks){
                updateEntity(lumberjacks[key]);
               
                var isColliding = theCollision(player,lumberjacks[key]);
                if(isColliding){
                        player.hp = player.hp - 10;
                }
        }
        if(player.hp <= 0){
                alert("You didn't make it :( !");            
                startNewGame();
        }
        updatePlayerPosition();
        drawEntity(player);
        ctx.fillText(player.hp + " Hp",0,30);
        ctx.fillText('Score: ' + score,200,30);
}
//load new game 
startNewGame = function(){
        player.hp = 100;
        timeWhenGameStarted = Date.now();
        frameCount = 0;
        score = 0;
        lumberjacks = {};
        Plants = {};
        protectiveForces = {};
        randomLumberjacks();
        randomLumberjacks();
        randomLumberjacks();
       
}
 
startNewGame();
//setInterval in ms - repeats the drawing of the function in the canvas 
setInterval(update,40);








