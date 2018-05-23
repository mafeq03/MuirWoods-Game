// // hides game before it starts
// window.onload = function(){
// document.getElementById("ctx").style.display = 'none';
// }


// document.getElementById("start").onclick = function(){
//   update();
// }

var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = "30px Arial";
ctx.fillStyle = "white";
//set dimensions of canvas
var HEIGHT = 600;
var WIDTH = 900;
//counts frames in the game
var frameCount = 0; 
//score kept by the frames in canvas
var score = 0;
//div that contains Game Over screen
var gameOverMenu = document.getElementById("GameOver");
//button to restart Game
var restartButton = document.getElementById("restart");

//all images needed
var Img = {};
Img.player = new Image();
Img.player.src = "../images/hippie.png";
Img.lumberjack = new Image();
Img.lumberjack.src = "../images/lumberjack_.png"
Img.plant1 = new Image();
Img.plant1.src = "../images/powerdecrease.png";
Img.plant2 = new Image();
Img.plant2.src = "../images/healthincrease.png";
Img.power = new Image();
Img.power.src = "../images/powerboost.png";
Img.force = new Image();
Img.force.src = "../images/heart_.png";

// //launches force used by player by left clicking
// document.onclick = function(mouse) {
//   player.releaseAttack();
// };
// //launches special attack with right click
// document.oncontextmenu = function(mouse) {
//   //launches function to release 360 degrees attack
//   player.releaseSpecialAttack();
//   //clears menu that appears when you right click
//   mouse.preventDefault();
//  };
// //it gives interactivity to the player by using the mouse
// document.onmousemove = function(mouse) {
//   //determines exact position of the mouse in canvas 
//   //getBoundingClientRect()is a method that returns the positiion and size of an element relative to the viewport
//   var mouseX = mouse.clientX - document.getElementById("ctx").getBoundingClientRect().left;
//   var mouseY = mouse.clientY - document.getElementById("ctx").getBoundingClientRect().top;
//   //mouse position becomes relative to player instead pf canvas - direct aiming
//   mouseX -= player.x;
//   mouseY -= player.y;
//   //allows for attack to be launched where the mouse is aiming
//   //atan2 function from trigonometry returns the angle depending on the X and Y values
//   //since result is given in radian by multiplying it by PI and 180 it converts it to degrees
//   player.aimAngle = Math.atan2(mouseY, mouseX) / Math.PI * 180;
// };
//event that gives command to keys in keyboard for player to move with it
document.onkeydown = function(event) {
  if (event.keyCode === 32){
    player.releaseAttack();
  }
  if (event.keyCode === 66){
    player.releaseSpecialAttack();
  }
  if (event.keyCode === 40) {
    player.goDown = true;
  } else if (event.keyCode === 38) {
    player.goUp = true;
  } else if (event.keyCode === 37) {
    player.goLeft = true;
  } else if (event.keyCode === 39) {
    player.goRight = true;
  }
};
//event that gives value when key is released
document.onkeyup = function(event) {
  if (event.keyCode === 40) {
    player.goDown = false;
  } else if (event.keyCode === 38) {
    player.goUp = false;
  } else if (event.keyCode === 37) {
    player.goLeft = false;
  } else if (event.keyCode === 39) {
    player.goRight = false;
  }
};
//function to restart game when clicking restart button
function restart(){

}

//function to update canvas while game takes place
update = function() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  frameCount++;
  //score is increased 
  score++;
  //every 2 secs a lumberjack is generated
  if (frameCount % 50 === 0)
     generateLumberjacks();
  //every 3 secs a plant is generated randomly
  if (frameCount % 75 === 0)
      generatePlant();
 //loop to create attack forces, they are removed upon collision
  for (var key in protectiveForces) {
    protectiveForces[key].update();
    protectiveForces[key].timer++;
    if (protectiveForces[key].timer > 75) {
      delete protectiveForces[key];
      continue;
    }
    //
    for (var key2 in lumberjacks) {
       var isColliding = protectiveForces[key].theCollision(lumberjacks[key2]);
       if(isColliding){
        score += 500;
        delete lumberjacks[key2];
        
        break;
         }           
    }
     }
//loop to generate plants in canvas
  for (var key in plants) {
    plants[key].update();
    plants[key].timer++;
    var isColliding = player.theCollision(plants[key]);
    if (isColliding) {
      // console.log('Colliding');
      //plants that are harmful decrease helath by 10, beneficial add health by 5, powerboost adds attack power by 3
       if (plants[key].category === "harmful") {
        player.hp -= 10;
      } else if (plants[key].category === "beneficial") {
        player.hp += 15;
      } else if (plants[key].category === "powerboost") {
        player.atkSpd += 3;
        }
      delete plants[key];
    } else if (plants[key].timer > 75) {
      delete plants[key];
    }
  }

//loop to generate lumberjacks in game
  for (var key in lumberjacks) {
    lumberjacks[key].update();
    // lumberjacks[key].releaseAttack();
//when player and enemy collide 10 points are decreased
    var isColliding = player.theCollision(lumberjacks[key]);
    if (isColliding) {
      player.hp = player.hp - 10;
    }
  }
  //condition that stops game, game ends when health equals 0
  if (player.hp <= 0) {
    window.onload = function(){
      document.getElementById("ctx").style.display = 'none';
      }
    showMenu(gameOverMenu)
    // alert("You didn't make it :(");
    // startNewGame();
  }
  player.update();
  //health and scor are written within the canvas
  ctx.fillText(player.hp + " Hp", 0, 30);
  ctx.fillText("Score: " + score, 200, 30);
};
// function to load new game
  startNewGame = function() {
  player.hp = 100;
  frameCount = 0;
  score = 0;
  lumberjacks = {};
  plants = {};
  protectiveForces = {};
  generateLumberjacks();
  generateLumberjacks();
  generateLumberjacks();
};
//player is called as soon as new game is generated
player = Player();
startNewGame();
//setInterval in ms - repeats the drawing of the function in the canvas
setInterval(update, 40);

//function to display Game Over Screen
function displayMenu(menu){
  menu.style.visibility = "visible";
  }

function showMenu(){
  if(player.hp <= 0){
    displayMenu(gameOverMenu);
  }
}
