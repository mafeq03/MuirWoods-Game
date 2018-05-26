//global varibales 
var player;
var lumberjacks = {};
var plants = {};
var protectiveForces = {};
//constructor to create character with all traits and functions as methods
Player = function() {
  var character = Actor("player", "myId", 20, 400, 30, 5, 70, 140, Img.player, 100, 1);
//updates position of character
  character.updatePosition = function() {
    if (character.goRight) 
    character.x += 10;
    if (character.goLeft) 
    character.x -= 10;
    if (character.goDown) 
    character.y += 10;
    if (character.goUp) 
    character.y -= 10;

    //verifies position of player and stops it from going outside of canvas
    if (character.x < character.width / 2) 
    character.x = character.width / 2;
    if (character.x > WIDTH - character.width / 2) 
    character.x = WIDTH - character.width / 2;
    if (character.y < character.height/2) 
    character.y = character.height / 2;
    if (character.y > HEIGHT - character.height / 2) 
    character.y = HEIGHT - character.height / 2;
  };
  //defines the character's position before pressing the keys for commands
  character.goDown = false;
  character.goUp = false;
  character.goLeft = false;
  character.goRight = false;
  return character;
};

//constructor for different entities in game
Entity = function(type, id, x, y, spdX, spdY, width, height, img) {
  var character = {
    type: type,
    id: id,
    x: x,
    y: y,
    spdX: spdX,
    spdY: spdY,
    width: width,
    height: height,
    img: img,
  };
  //function that will load entities onto canvas when the game is loaded
    character.update = function() {
    character.updatePosition();
    character.draw();
  };
  //function to draw entity in canvas
    character.draw = function() {
    ctx.save();
    var x = character.x - character.width / 2;
    var y = character.y - character.height / 2;
    ctx.drawImage(character.img,x,y);
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
Actor = function(type, id, x, y, spdX, spdY, width, height, img, hp, atkSpd) {
  var character = Entity(type, id, x, y, spdX, spdY, width, height, img);
  //character's health
  character.hp = hp;
  //speed of the attack - affected by boosting plant
  character.atkSpd = atkSpd;
  //counter for the attacks done by the player/lumberjack
  character.attackCounter = 0;
  //angle at where the force is being released/drawn
  character.aimAngle = -15;

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
  //draws special attack when pressing 'B' - originally activated with right click
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

//constructor for the obstacles/lumberjack
Lumberjack = function(id, x, y, spdX, spdY, width, height) {
  var character = Actor("Lumberjack", id, x, y, spdX, spdY, width, height, Img.lumberjack, 10, 1);
  //generated lumberjacks will be added to the object lumberjacks
  lumberjacks[id] = character;
};

//function to generate random obstacles/lumberjacks
generateLumberjacks = function() {
  //Math.random() used to obtain random number 
  //the results are multiplied by the canvas' dimensions
  var x = Math.random() * WIDTH;
  var y = Math.random() * HEIGHT;
  var height = /*10 + Math.random() * */20; //between 10 and 30
  var width = /*10 + Math.random() * */20;
  var id = Math.random();
  var spdX = 5 + Math.random() * 5;
  var spdY = 5 + Math.random() * 5;
  Lumberjack(id, x, y, spdX, spdY, width, height);
};
//defines the specific properties for the plants in woods
Plant = function(id, x, y, spdX, spdY, width, height, category, img) {
  var character = Entity("Plant", id, x, y, spdX, spdY, width, height, img);
  //timer used to clear plants from canvas otherwise over populate
  character.timer = 0;
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
    var img = Img.plant1;
  } else if (Math.random() < 0.35) {
    category = "beneficial";
    var img = Img.plant2;
  } else {
    category = "powerboost";
    var img = Img.power;
  }
  Plant(id, x, y, spdX, spdY, width, height, category, img);
};

//constructor used for force used by player and lumberjacks
Force = function(id, x, y, spdX, spdY, width, height) {
  var character = Entity("Force", id, x, y, spdX, spdY, width, height, Img.force);
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
  var height = 40;
  var width = 40;
  var id = Math.random();
//angle is updated when the mouse moves
//when angle is undefined it will be overwriten by the current position of the mouse
  var angle;
  if (aimOverwrite !== undefined) angle = aimOverwrite;
  else angle = actor.aimAngle;
//sin and cos used to determine the speed of coordinates according to the angle, result is given in radian
//result is divided by 180 and multiplied by PI to obtain degrees
  var spdX = Math.cos(angle / 180 * Math.PI) * 15;
  var spdY = Math.sin(angle / 180 * Math.PI) * 15;
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