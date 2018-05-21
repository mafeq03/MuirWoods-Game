var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = "30px Arial";
//set dimensions of canvas
var HEIGHT = 800;
var WIDTH = 800;
//counts frames in the game
var frameCount = 0;
//score kept by the frames in canvas
var score = 0;
//player in game
var player;
//obstacles - opponents
var lumberjacks = {};
//plants collected by player
var plants = {};
//force used to fight
var protectiveForces = {};

//constructor to create character with all traits and functions as methods
Player = function() {
  var character = Actor("player", "myId", 50, 40, 30, 5, 20, 20, "green", 100, 1);
//updates position of character
  character.updatePosition = function() {
    if (character.goRight) character.x += 10;
    if (character.goLeft) character.x -= 10;
    if (character.goDown) character.y += 10;
    if (character.goUp) character.y -= 10;
    //verifies position of player and stops it from going outside of canvas
    if (character.x < character.width / 2) character.x = character.width / 2;
    if (character.x > WIDTH - character.width / 2) character.x = WIDTH - character.width / 2;
    if (character.y < character.height / 2) character.y = character.height / 2;
    if (character.y > HEIGHT - character.height / 2) character.y = HEIGHT - character.height / 2;
  };
  //defines the character's position before pressing the keys for commands
  character.goDown = false;
  character.goUp = false;
  character.goLeft = false;
  character.goRight = false;
  return character;
};

//constructor for different entities in game
Entity = function(type, id, x, y, spdX, spdY, width, height, color) {
  var character = {
    type: type,
    id: id,
    x: x,
    y: y,
    spdX: spdX,
    spdY: spdY,
    width: width,
    height: height,
    color: color
  };
  //function that will load entities onto canvas when the game is loaded
    character.update = function() {
    character.updatePosition();
    character.draw();
  };
  //function to draw entity in canvas
  character.draw = function() {
    ctx.save();
    ctx.fillStyle = character.color;
    ctx.fillRect(
      character.x - character.width / 2,
      character.y - character.height / 2,
      character.width,
      character.height
    );
    //restores the canvas
    ctx.restore();
  };

 //function that returns distance between player and obstacle
  character.getDistance = function(entity2) {
    var vx = character.x - entity2.x;
    var vy = character.y - entity2.y;
    //returns square root of values/coordinates = distance
    return Math.sqrt(vx * vx + vy * vy);
  };
   //function that returns if character and entities are colliding: true or false
     character.theCollision = function(entity2) {
      var rect1 = {
      x: character.x - character.width / 2,
      y: character.y - character.height / 2,
      width: character.width,
      height: character.height
    };
    var rect2 = {
      x: entity2.x - entity2.width / 2,
      y: entity2.y - entity2.height / 2,
      width: entity2.width,
      height: entity2.height
    };
       return testCollision(rect1, rect2);
  };
 //function to provide character's position and prevents it from going outside canvas
  character.updatePosition = function() {
    character.x += character.spdX;
    character.y += character.spdY;
    if (character.x < 0 || character.x > WIDTH) {
      character.spdX = -character.spdX;
    }
    if (character.y < 0 || character.y > HEIGHT) {
      character.spdY = -character.spdY;
    }
  };
  return character;
};

//constructor for functionalities applied to player and lumberjacks
Actor = function(type, id, x, y, spdX, spdY, width, height, color, hp, atkSpd) {
  var character = Entity(type, id, x, y, spdX, spdY, width, height, color);
  //character's health
  character.hp = hp;
  //speed of the attack - affected by boosting plant
  character.atkSpd = atkSpd;
  //counter for the attacks done by the player/lumberjack
  character.attackCounter = 0;
  //angle at where the force is being released/drawn
  character.aimAngle = 0;

  var super_update = character.update;
  character.update = function() {
    super_update();
    character.attackCounter += character.atkSpd;
  };
  //draws force to combat depending on attack counter
  character.releaseAttack = function() {
    //character can shoot once every 25 frames
    if (character.attackCounter > 25) {
      //every 1 sec
      character.attackCounter = 0;
      generateForce(character);
    }
  };
  //draws special attack with right click of mouse
  character.releaseSpecialAttack= function() {
    if (character.attackCounter > 50) {
      //every 1 sec
      character.attackCounter = 0;
     //loop to draw an attack that increases angle until 360 degress
     //attack is drawn as a circle
     for(var i = 0 ; i < 360; i++){
      generateForce(character,i);
      }
      // generateForce(character, character.aimAngle - 5);
      // generateForce(character, character.aimAngle);
      // generateForce(character, character.aimAngle + 5);
    }
  };
  return character;
};

//conatructor for the obstacles/lumberjack
Lumberjack = function(id, x, y, spdX, spdY, width, height) {
  var character = Actor("Lumberjack", id, x, y, spdX, spdY, width, height, "blue", 10, 1);
  //generated lumberjacks will be added to the object lumberjacks
  lumberjacks[id] = character;
};

//function to generate random obstacles/lumberjacks
generateLumberjacks = function() {
  //Math.random() used to obtain random number 
  //the results are multiplied by the canvas' dimensions
  var x = Math.random() * WIDTH;
  var y = Math.random() * HEIGHT;
  var height = 10 + Math.random() * 30; //between 10 and 40
  var width = 10 + Math.random() * 30;
  var id = Math.random();
  var spdX = 5 + Math.random() * 5;
  var spdY = 5 + Math.random() * 5;
  Lumberjack(id, x, y, spdX, spdY, width, height);
};
//defines the specific properties for the plants in woods
Plant = function(id, x, y, spdX, spdY, width, height, category, color) {
  var character = Entity("Plant", id, x, y, spdX, spdY, width, height, color);
 //determines plants category 
  character.category = category;
  //will add generated plants to plants object
  plants[id] = character;
};

//function to generate plants accross canvas
generatePlant = function() {
  //Math.random() gives random number then multiplied by canvas' dimensions
  var x = Math.random() * WIDTH;
  var y = Math.random() * HEIGHT;
  var height = 10;
  var width = 10;
  var id = Math.random();
  var spdX = 0;
  var spdY = 0;
  //one third of plants are harmful
  //one third add to health
  //one third of plants boost attack power by 3
  if (Math.random() < 0.35) {
    category = "harmful";
    color = "red";
  } else if (Math.random() < 0.35) {
    category = "beneficial";
    color = "yellow";
  } else {
    category = "powerboost";
    color = "orange";
  }
  Plant(id, x, y, spdX, spdY, width, height, category, color);
};

//constructor used for force used by player and lumberjacks
Force = function(id, x, y, spdX, spdY, width, height) {
  var character = Entity("Force", id, x, y, spdX, spdY, width, height, "purple");
  //timer set to 0 because it will increase when the attack is launched
  character.timer = 0;
  //adds randomly generated results to protectiveForces object
  protectiveForces[id] = character;
};

//function to randomly generate forces, takes two parameters the actor and aimOverwrite
//aimOverwrite   
generateForce = function(actor, aimOverwrite) {
  //bullets are drawn according to the position of the character
  var x = actor.x;
  var y = actor.y;
  var height = 10;
  var width = 10;
  var id = Math.random();
//angle is updated when the mouse moves
//when angle is undefined it will be overwriten by the current position of the mouse
  var angle;
  if (aimOverwrite !== undefined) angle = aimOverwrite;
  else angle = actor.aimAngle;
//sin and cos used to determine the speed of coordinates according to the angle, result is given in radian
//result is divided by 180 and multiplied by PI to obtain degrees
  var spdX = Math.cos(angle / 180 * Math.PI) * 5;
  var spdY = Math.sin(angle / 180 * Math.PI) * 5;
  Force(id, x, y, spdX, spdY, width, height);
};
//tests collision between two entities
testCollision = function(rect1, rect2) {
  return (
    rect1.x <= rect2.x + rect2.width &&
    rect2.x <= rect1.x + rect1.width &&
    rect1.y <= rect2.y + rect2.height &&
    rect2.y <= rect1.y + rect1.height
  );
};
//launches force used by player by left clicking
document.onclick = function(mouse) {
  player.releaseAttack();
};
//launches special attack with right click
document.oncontextmenu = function(mouse) {
  //launches function to release 360 degrees attack
  player.releaseSpecialAttack();
  //clears menu that appears when you right click
  mouse.preventDefault();
 };
//it gives interactivity to the player by using the mouse
document.onmousemove = function(mouse) {
  //determines exact position of the mouse in canvas 
  //getBoundingClientRect()is a method that returns the positiion and size of an element relative to the viewport
  var mouseX = mouse.clientX - document.getElementById("ctx").getBoundingClientRect().left;
  var mouseY = mouse.clientY - document.getElementById("ctx").getBoundingClientRect().top;
  //mouse position becomes relative to player instead pf canvas - direct aiming
  mouseX -= player.x;
  mouseY -= player.y;
  //allows for attack to be launched where the mouse is aiming
  //atan2 function from trigonometry returns the angle depending on the X and Y values
  //since result is given in radian by multiplying it by PI and 180 it converts it to degrees
  player.aimAngle = Math.atan2(mouseY, mouseX) / Math.PI * 180;
};
//event that gives command to keys in keyboard for player to move with it
document.onkeydown = function(event) {
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
        delete lumberjacks[key2];
        break;
         }           
    }
   
  }
//loop to generate plants in canvas
  for (var key in plants) {
    plants[key].update();
    var isColliding = player.theCollision(plants[key]);
    if (isColliding) {
      // console.log('Colliding');
      //plants that are harmful decrease helath by 10, beneficial add health by 5, powerboost adds attack power by 3
       if (plants[key].category === "harmful") {
        player.hp -= 10;
      } else if (plants[key].category === "beneficial") {
        player.hp += 5;
      } else if (plants[key].category === "powerboost") {
        player.atkSpd += 3;
        }
      delete plants[key];
    }
  }

//loop to generate lumberjacks in game
  for (var key in lumberjacks) {
    lumberjacks[key].update();
    lumberjacks[key].releaseAttack();
//when player and enemy collide 10 points are decreased
    var isColliding = player.theCollision(lumberjacks[key]);
    if (isColliding) {
      player.hp = player.hp - 10;
    }
  }
  //condition that stops game, game ends when health equals 0
  if (player.hp <= 0) {
    alert("You didn't make it :(");
    startNewGame();
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