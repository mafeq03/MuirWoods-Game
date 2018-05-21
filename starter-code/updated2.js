var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = "30px Arial";

var canvasHeight = 600;
var canvasWidth = 800;


var frameCount = 0;

var score = 0;
var player;
var lumberjacks = {};
var plants = {};
var combatForces = {};
//constructor for player
Player = function() {

  this.type = 'player';
  this.id = 'myId';
  this.x = 50;
  this.y = 40;
  this.spdX = 30;
  this.spdY = 5;
  this.width = 20;
  this.height = 20;
  this.color = 'green'
  this.health = 100;
  this.atkSpd = 1;
}
  var self = Actor("player", "myId", 50, 40, 30, 5, 20, 20, "green", 10, 1);

  self.updatePosition = function() {
    if (self.pressingRight) self.x += 10;
    if (self.pressingLeft) self.x -= 10;
    if (self.pressingDown) self.y += 10;
    if (self.pressingUp) self.y -= 10;

    //ispositionvalid
    if (self.x < self.canvasWidth / 2) self.x = self.canvasWidth / 2;
    if (self.x > canvasWidth - self.canvasWidth / 2) self.x = canvasWidth - self.canvasWidth / 2;
    if (self.y < self.canvasHeight / 2) self.y = self.canvasHeight / 2;
    if (self.y > canvasHeight - self.canvasHeight / 2) self.y = canvasHeight - self.canvasHeight / 2;
  };
  var super_update = self.update;
  self.update = function() {
    super_update();
    if (self.hp <= 0) {
      var timeSurvived = Date.now() - timeWhenGameStarted;
      console.log("You lost! You survived for " + timeSurvived + " ms.");
      startNewGame();
    }
  };

  self.pressingDown = false;
  self.pressingUp = false;
  self.pressingLeft = false;
  self.pressingRight = false;
  return self;
};

Entity = function(type, id, x, y, spdX, spdY, canvasWidth, canvasHeight, color) {
  var self = {
    type: type,
    id: id,
    x: x,
    y: y,
    spdX: spdX,
    spdY: spdY,
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
    color: color
  };
  self.update = function() {
    self.updatePosition();
    self.draw();
  };
  self.draw = function() {
    ctx.save();
    ctx.fillStyle = self.color;
    ctx.fillRect(
      self.x - self.canvasWidth / 2,
      self.y - self.canvasHeight / 2,
      self.canvasWidth,
      self.canvasHeight
    );
    ctx.restore();
  };
  self.getDistance = function(entity2) {
    //return distance (number)
    var vx = self.x - entity2.x;
    var vy = self.y - entity2.y;
    return Math.sqrt(vx * vx + vy * vy);
  };

  self.testCollision = function(entity2) {
    //return if colliding (true/false)
    var rect1 = {
      x: self.x - self.canvasWidth / 2,
      y: self.y - self.canvasHeight / 2,
      canvasWidth: self.canvasWidth,
      canvasHeight: self.canvasHeight
    };
    var rect2 = {
      x: entity2.x - entity2.canvasWidth / 2,
      y: entity2.y - entity2.canvasHeight / 2,
      canvasWidth: entity2.canvasWidth,
      canvasHeight: entity2.canvasHeight
    };
    return testCollisionRectRect(rect1, rect2);
  };
  self.updatePosition = function() {
    self.x += self.spdX;
    self.y += self.spdY;

    if (self.x < 0 || self.x > canvasWidth) {
      self.spdX = -self.spdX;
    }
    if (self.y < 0 || self.y > canvasHeight) {
      self.spdY = -self.spdY;
    }
  };

  return self;
};

Actor = function(type, id, x, y, spdX, spdY, canvasWidth, canvasHeight, color, hp, atkSpd) {
  var self = Entity(type, id, x, y, spdX, spdY, canvasWidth, canvasHeight, color);

  self.hp = hp;
  self.atkSpd = atkSpd;
  self.attackCounter = 0;
  self.aimAngle = 0;

  var super_update = self.update;
  self.update = function() {
    super_update();
    self.attackCounter += self.atkSpd;
  };

  self.performAttack = function() {
    if (self.attackCounter > 25) {
      //every 1 sec
      self.attackCounter = 0;
      generateBullet(self);
    }
  };

  self.performSpecialAttack = function() {
    if (self.attackCounter > 50) {
      //every 1 sec
      self.attackCounter = 0;
      /*
                        for(var i = 0 ; i < 360; i++){
                                generateBullet(self,i);
                        }
                        */
      generateBullet(self, self.aimAngle - 5);
      generateBullet(self, self.aimAngle);
      generateBullet(self, self.aimAngle + 5);
    }
  };

  return self;
};

Enemy = function(id, x, y, spdX, spdY, canvasWidth, canvasHeight) {
  var self = Actor("enemy", id, x, y, spdX, spdY, canvasWidth, canvasHeight, "red", 10, 1);

  var super_update = self.update;
  self.update = function() {
    super_update();
    self.performAttack();

    var isColliding = player.testCollision(self);
    if (isColliding) {
      player.hp = player.hp - 1;
    }
  };

  lumberjacks[id] = self;
};

randomlyGenerateEnemy = function() {
  //Math.random() returns a number between 0 and 1
  var x = Math.random() * canvasWidth;
  var y = Math.random() * canvasHeight;
  var canvasHeight = 10 + Math.random() * 30; //between 10 and 40
  var canvasWidth = 10 + Math.random() * 30;
  var id = Math.random();
  var spdX = 5 + Math.random() * 5;
  var spdY = 5 + Math.random() * 5;
  Enemy(id, x, y, spdX, spdY, canvasWidth, canvasHeight);
};

Upgrade = function(id, x, y, spdX, spdY, canvasWidth, canvasHeight, category, color) {
  var self = Entity("upgrade", id, x, y, spdX, spdY, canvasWidth, canvasHeight, color);

  var super_update = self.update;
  self.update = function() {
    super_update();
    var isColliding = player.testCollision(self);
    if (isColliding) {
      if (self.category === "score") score += 1000;
      if (self.category === "atkSpd") player.atkSpd += 3;
      delete plants[self.id];
    }
  };

  self.category = category;
  plants[id] = self;
};

randomlyGenerateUpgrade = function() {
  //Math.random() returns a number between 0 and 1
  var x = Math.random() * canvasWidth;
  var y = Math.random() * canvasHeight;
  var canvasHeight = 10;
  var canvasWidth = 10;
  var id = Math.random();
  var spdX = 0;
  var spdY = 0;

  if (Math.random() < 0.5) {
    var category = "score";
    var color = "orange";
  } else {
    var category = "atkSpd";
    var color = "purple";
  }

  Upgrade(id, x, y, spdX, spdY, canvasWidth, canvasHeight, category, color);
};

Bullet = function(id, x, y, spdX, spdY, canvasWidth, canvasHeight) {
  var self = Entity("bullet", id, x, y, spdX, spdY, canvasWidth, canvasHeight, "black");

  self.timer = 0;

  var super_update = self.update;
  self.update = function() {
    super_update();
    var toRemove = false;
    self.timer++;
    if (self.timer > 75) {
      toRemove = true;
    }

    for (var key2 in lumberjacks) {
      /*
                        var isColliding = self.testCollision(lumberjacks[key2]);
                        if(isColliding){
                                toRemove = true;
                                delete lumberjacks[key2];
                                break;
                        }      
                        */
    }
    if (toRemove) {
      delete bulletList[self.id];
    }
  };
  bulletList[id] = self;
};

generateBullet = function(actor, aimOverwrite) {
  //Math.random() returns a number between 0 and 1
  var x = actor.x;
  var y = actor.y;
  var canvasHeight = 10;
  var canvasWidth = 10;
  var id = Math.random();

  var angle;
  if (aimOverwrite !== undefined) angle = aimOverwrite;
  else angle = actor.aimAngle;

  var spdX = Math.cos(angle / 180 * Math.PI) * 5;
  var spdY = Math.sin(angle / 180 * Math.PI) * 5;
  Bullet(id, x, y, spdX, spdY, canvasWidth, canvasHeight);
};

testCollisionRectRect = function(rect1, rect2) {
  return (
    rect1.x <= rect2.x + rect2.canvasWidth &&
    rect2.x <= rect1.x + rect1.canvasWidth &&
    rect1.y <= rect2.y + rect2.canvasHeight &&
    rect2.y <= rect1.y + rect1.canvasHeight
  );
};

document.onclick = function(mouse) {
  player.performAttack();
};

document.oncontextmenu = function(mouse) {
  player.performSpecialAttack();
  mouse.preventDefault();
};

document.onmousemove = function(mouse) {
  var mouseX =
    mouse.clientX - document.getElementById("ctx").getBoundingClientRect().left;
  var mouseY =
    mouse.clientY - document.getElementById("ctx").getBoundingClientRect().top;

  mouseX -= player.x;
  mouseY -= player.y;

  player.aimAngle = Math.atan2(mouseY, mouseX) / Math.PI * 180;
};

document.onkeydown = function(event) {
  if (event.keyCode === 68)
    //d
    player.pressingRight = true;
  else if (event.keyCode === 83)
    //s
    player.pressingDown = true;
  else if (event.keyCode === 65)
    //a
    player.pressingLeft = true;
  else if (event.keyCode === 87)
    // w
    player.pressingUp = true;
};

document.onkeyup = function(event) {
  if (event.keyCode === 68)
    //d
    player.pressingRight = false;
  else if (event.keyCode === 83)
    //s
    player.pressingDown = false;
  else if (event.keyCode === 65)
    //a
    player.pressingLeft = false;
  else if (event.keyCode === 87)
    // w
    player.pressingUp = false;
};

update = function() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  frameCount++;
  score++;

  if (frameCount % 100 === 0)
    //every 4 sec
    randomlyGenerateEnemy();

  if (frameCount % 75 === 0)
    //every 3 sec
    randomlyGenerateUpgrade();

  for (var key in bulletList) {
    bulletList[key].update();
  }

  for (var key in plants) {
    plants[key].update();
  }

  for (var key in lumberjacks) {
    lumberjacks[key].update();
  }

  player.update();

  ctx.fillText(player.hp + " Hp", 0, 30);
  ctx.fillText("Score: " + score, 200, 30);
};

startNewGame = function() {
  player.hp = 10;
  timeWhenGameStarted = Date.now();
  frameCount = 0;
  score = 0;
  lumberjacks = {};
  plants = {};
  bulletList = {};
  randomlyGenerateEnemy();
  randomlyGenerateEnemy();
  randomlyGenerateEnemy();
};

player = Player();
startNewGame();

setInterval(update, 40);
