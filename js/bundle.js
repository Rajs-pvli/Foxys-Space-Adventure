(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//Enumerados: PlayerState son los estado por los que pasa el player. Directions son las direcciones a las que se puede
//mover el player.
var PlayerState = {'JUMP':0, 'RUN':1, 'FALLING':2, 'STOP':3, 'GRAB': 4};
var Direction = {'LEFT':0, 'RIGHT':1, 'NONE':3}

var nextJump = 0;//Contador para el próximo salto


 ////////////ENTITY////////////////////////
function Entity(game,speed,direction,posX,posY,name){
    this.game=game;
    this._speed = speed;
    this._direction = direction;
    Phaser.Sprite.call(this,game,posX,posY,name);
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;

}

Entity.prototype = Object.create(Phaser.Sprite.prototype);//Ajustamos el prototipo
Entity.constructor = Entity;

Entity.prototype.changeDirectionLeft= function()
{
    if(this.scale.x > 0)
        this.scale.x *= -1; 
    
};

Entity.prototype.changeDirectionRight= function()
{
    if(this.scale.x < 0)
        this.scale.x *= -1; 

};

Entity.prototype.getEntity = function(){
    return this;
};

Entity.prototype.movement= function(x)
{
    this.body.velocity.x =x;
};

Entity.prototype.isTouchingRight = function()
{
    return (this.body.touching.right || this.body.blocked.right);
}

Entity.prototype.isTouchingLeft = function()
{
    return (this.body.touching.left || this.body.blocked.left);
}

Entity.prototype.getAnimations = function(){
    return this.animations;
};
 ////////////ENTITY////////////////////////




/////////////////ENEMY////////////////////


function Enemy(game,posX,posY){

    Entity.call(this,game,200,Direction.LEFT,posX, posY,'enemy'); 
    this.animations.add('walk',[1,2],10,true);
    this.animations.add('dead',[3],1,false);
    this.animations.play('walk');
};

Enemy.prototype = Object.create(Entity.prototype);//Ajustamos el prototipo
Enemy.constructor = Enemy;

Enemy.prototype.updateEnemy_ = function()
{
    var moveDirection = new Phaser.Point(0, 0);
    if(this._direction === Direction.RIGHT){
        moveDirection.x = this._speed;
        this.changeDirectionLeft();
    }
    else if (this._direction === Direction.LEFT){
        moveDirection.x = -this._speed;
        this.changeDirectionRight();
    }

    this.changeDirectionEnemy();
    this.movement(moveDirection.x);

};

Enemy.prototype.changeDirectionEnemy = function(){//Cambia la dirección al chocar una pared
    if(this.isTouchingRight())
        this._direction = Direction.LEFT;


    else if(this.isTouchingLeft())
        this._direction = Direction.RIGHT;

};

Enemy.prototype.isTouchingUp = function()
{
    return (this.body.touching.up || this.body.blocked.up);
};

/////////////////ENEMY////////////////////


///////////////PLAYER///////////////////////

function Player(game,posX,posY)
{
    Entity.call(this,game,400,Direction.NONE,posX,posY,'fox');
    this._jumpSpeed = 630; //velocidad de salto
    this._playerState= PlayerState.STOP; //estado del player
    this.gravityFall = false;
    this.gravityValue = 900;
    this.valueUnhandSpeed = 450;

	//nombre de la animación, frames, framerate, isloop
    this.animations.add('run',[3,4,5],10,true);
    this.animations.add('stop',[0,1,2],7,true);
    this.animations.add('jump',[6,7],5,false);
    this.animations.add('fall',[8],5,false);
    this.animations.add('unhand',[21,22,23],10,false);
    this.animations.add('grab',[19,20],30,false);//Animación de agarre

    this.jumpSound = this.game.add.audio('jumpSound');
    this.jumpSound.volume = 0.5;

    //Gravedad del juego
    //this.body.bounce.y = 0.2;
    this.body.gravity.y = this.gravityValue;
    this.body.gravity.x = 0;

    //Velocidad del jugador
    this.body.velocity.x = 0;

    this.game.camera.follow(this,Phaser.Camera.FOLLOW_LOCKON);//La cámara te sigue

};

Player.prototype = Object.create(Entity.prototype);//Ajustamos el prototipo
Player.constructor = Player;


Player.prototype.update_ = function()
{
	var moveDirection = new Phaser.Point(0, 0);
    var movement = this.GetMovement();

    //transitions
    switch(this._playerState)
    {
        case PlayerState.STOP:
        case PlayerState.RUN:
            if(this.isJumping() && this.game.time.now > nextJump)
            {
                this._playerState = PlayerState.JUMP;
                moveDirection.y = -this._jumpSpeed;
                this.jump(moveDirection.y);
                this.jumpSound.play();

                this.animations.play('jump');
                nextJump = this.game.time.now + 1000;
            }
            else if (this.isStanding())
            {
                if(movement !== Direction.NONE)
                {
                    this._playerState = PlayerState.RUN;
                    this.animations.play('run');
                }
                else
                {
                    this._playerState = PlayerState.STOP;
                    this.animations.play('stop');
                }
            }    
            else
            {
                this._playerState = PlayerState.FALLING;
                this.animations.play('fall');

            }
            break;
                
        case PlayerState.JUMP:
            if(this.isGrabbing())//Comprobamos si está colisionando
                {
                    this.body.allowGravity = false;
                    this._playerState = PlayerState.GRAB;
                    this.animations.play('grab');
                }

            else
            {
                this._playerState = (this.isFalling() || this.isTouchingCeiling() || this.isTouchingRight() || this.isTouchingLeft())
                ? PlayerState.FALLING : PlayerState.JUMP;

                if (this._playerState == PlayerState.FALLING)
                    this.animations.play('fall');


            }
            break;
          
        case PlayerState.FALLING:
            if(this.isStanding())
            {
                if(movement !== Direction.NONE)
                {
                    this._playerState = PlayerState.RUN;
                    this.animations.play('run');
                }
                else
                {
                    this._playerState = PlayerState.STOP;
                    this.animations.play('stop');
                }
                nextJump = 0;

            }
            else if(this.isGrabbing())
            {
                this.body.allowGravity = false;
                this._playerState = PlayerState.GRAB; 
                this.animations.play('grab');
            }
            break;

        case PlayerState.GRAB://Caso agarre
            
                if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && this.game.time.now > nextJump){//Caso en el que salta estando agarrado     
                    this.body.allowGravity = true;
             
                    this._playerState = PlayerState.UNHAND;
                    this.animations.play('unhand');
                    this.jumpSound.play();
                    moveDirection.y = -this._jumpSpeed;
                    this.jump(moveDirection.y / 1.2);


                    if(this.jumpDirection === Direction.RIGHT)
                        this.unhandSpeed =  this.valueUnhandSpeed;
                    else
                        this.unhandSpeed = - this.valueUnhandSpeed;


                    nextJump = this.game.time.now + 1000;                    

                } 
                else if(this.game.input.keyboard.isDown(Phaser.Keyboard.H)){//Caso en el que se suelta estando agarrado
                    this.body.allowGravity = true;
                    this._playerState = PlayerState.FALLING;   
                    this.animations.play('fall');
                } 
                break; 

        case PlayerState.UNHAND://Caso soltarse

                if(this.isGrabbing())//Caso en el que se agarra
                {
                    this.body.allowGravity = false;
                    this._playerState = PlayerState.GRAB;
                    this.animations.play('grab');
                }
                else if(this.isStanding())
                {
                    this._playerState = PlayerState.STOP;
                }
                else if(this.isTouchingRight() || this.isTouchingLeft() || (this.jumpDirection ===Direction.RIGHT && this.unhandSpeed< 0) || (this.jumpDirection ===Direction.LEFT && this.unhandSpeed> 0))
                 {   
                    this._playerState = PlayerState.FALLING;
                    this.animations.play('fall');
                 }


            break;

    }
    //States
    switch(this._playerState)
    {       
        case PlayerState.STOP:
            this.body.velocity.x = 0;

            break;
        case PlayerState.JUMP:
        case PlayerState.RUN:
        case PlayerState.FALLING:
            if(movement === Direction.RIGHT)
            {
                moveDirection.x = this._speed;
                this.changeDirectionRight();
            }
            else if (movement === Direction.LEFT)
            {
                moveDirection.x = -this._speed;
                this.changeDirectionLeft();
            }
            this.movement(moveDirection.x);

            if (this._playerState === PlayerState.FALLING)
                if(this.body.velocity.y > 1000)
                {
                    console.log(this.body.velocity.y);
                    this.body.velocity.y = 1000;

                }
            break;    

        case PlayerState.GRAB:
            this.body.velocity.y = 0;
            break;


        case PlayerState.UNHAND:
            if(this.jumpDirection === Direction.RIGHT)
            {
                this.unhandSpeed = this.unhandSpeed - 2000/this.unhandSpeed;
                this.changeDirectionRight();

            }
            else
            {
                this.unhandSpeed = (this.unhandSpeed - 2000/this.unhandSpeed);
                this.changeDirectionLeft();
            }

            this.movement(this.unhandSpeed);                         

            break;
    }

    //Movimiento del jugador
};



//Obtiene el Input del jugador
Player.prototype.GetMovement= function()
{
    var movement = Direction.NONE
    //Move Right
    if(this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
        movement = Direction.RIGHT;
        
    //Move Left
    if(this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
        movement = Direction.LEFT;


        
    return movement;

};

Player.prototype.jump= function(y)
{
    this.body.velocity.y = y;
};


Player.prototype.isFalling= function(){
    if (!this.gravityFall)
        return(this.body.velocity.y > 0);
    
    else
        return(this.body.velocity.y < 0);

};

//Deteccion de si el jugador salta
Player.prototype.isJumping = function()
{
   return this.isStanding()  
         && this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR);
};

Player.prototype.isStanding= function()
{
	if (!this.gravityFall && this.body.blocked.down || this.body.touching.down)
	{
   		return true;
    }
    else
    {
    	return this.body.blocked.up//No te puedes mover hacia abajo
         || this.body.touching.up;//Colisionas por debajo
     }

};

Player.prototype.isTouchingCeiling= function()//Caso en el que el personaje se choca con el techo
{
    if (!this.gravityFall)
    {
        return this.body.blocked.up//No te puedes mover hacia abajo
         || this.body.touching.up;//Colisionas por debajo
    }
    else
    {
        return this.body.blocked.down//No te puedes mover hacia abajo
         || this.body.touching.down;//Colisionas por debajo
     }

};

Player.prototype.isGrabbing= function()
{
    //Si el personaje se agarra a la pared por la izquierda, la dir de salto es derecha
    if (this.body.touching.left || this.body.blocked.left) 
        this.jumpDirection = Direction.RIGHT;
     
    //Si el personaje se agarra a la pared por la derecha, la dir de salto es izquierda
    else if (this.body.touching.right || this.body.blocked.right)
        this.jumpDirection = Direction.LEFT;
            
    return this.game.input.keyboard.isDown(Phaser.Keyboard.G) &&  (this.isTouchingRight() || this.isTouchingLeft());
};


Player.prototype.swapGravity= function()
{
	this.gravityFall= !this.gravityFall;
    this.body.gravity.y = -this.body.gravity.y;

    this.scale.y *= -1; 
    this._jumpSpeed = -this._jumpSpeed;

    this._playerState = PlayerState.FALLING;
    this.animations.play('fall');

};



///////////////PLAYER///////////////////////

module.exports = {Player: Player, Enemy: Enemy, Entity: Entity};

},{}],2:[function(require,module,exports){
'use strict';

var Objetos = require('./Objects.js');
var Personajes = require('./Entidades.js');

var ObjectPhysical = Objetos.ObjectPhysical;
var Rocket = Objetos.Rocket;
var Gem = Objetos.Gem;
var Flag = Objetos.Flag;


var Entity= Personajes.Entity;
var Player= Personajes.Player;
var Enemy= Personajes.Enemy;

function BuildMap(game)
{
	this.game = game;

	if(this.game.currentLevel === 1)
	{
        //Cargamos el tilemap en el map
        this.game.map =  game.add.tilemap('tilemap1');

    	//Asignamos al tileset 'patrones' la imagen de sprites tiles
        //patrones es lo de tiled y tiles, el nombre que tu le das en el main
        this.game.map.addTilesetImage('background','fondo');
    	this.game.map.addTilesetImage('patrones','tiles');
        this.game.map.addTilesetImage('sheet','grassTiles');


    	//Creacion de las layers
        this.game.fondo = game.map.createLayer('Fondo');
    	this.game.backgroundLayer = game.map.createLayer('BackgroundLayer');
    	this.game.groundLayer = game.map.createLayer('GroundLayer');
        this.game.trigger = game.map.createLayer('Trigger');
        this.game.trigger.visible = false;


    	//plano de muerte
    	this.game.death = game.map.createLayer('Death');

    	//Colisiones con el plano de muerte y con el plano de muerte y con suelo.
    	this.game.map.setCollisionBetween(1, 500, true, 'Death');
    	this.game.map.setCollisionBetween(1, 500, true, 'GroundLayer');
        this.game.map.setCollisionBetween(1,500,true, 'Trigger');

        //Limites de colisiones
        this.game.world.setBounds(0, 0, this.game.map.widthInPixels, this.game.map.heightInPixels);//Límite del mundo
        
        this.player = new Personajes.Player(this.game,3570,1050);
        this.game.world.addChild(this.player);

        var enemy = new Personajes.Enemy(this.game,210,750);
        var enemy2 = new Personajes.Enemy(this.game,1700,600);
        var enemy3 = new Personajes.Enemy(this.game,700,2000);
        var enemy4 = new Personajes.Enemy(this.game,1610,2000);
        var enemy5 = new Personajes.Enemy(this.game,2450,1100);
        var enemy6 = new Personajes.Enemy(this.game,5390,1370);

        this.enemies = this.game.add.group();
        this.enemies.add(enemy);
        this.enemies.add(enemy2);
        this.enemies.add(enemy3);
        this.enemies.add(enemy4);
        this.enemies.add(enemy5);
        this.enemies.add(enemy6);

        this.game.world.addChild(this.enemies);


        var gemBlue = new Gem(this.game,900,190,'gemaAzul');
        var gemGreen = new Gem(this.game,300,1720,'gemaVerde');
        var gemRed = new Gem(this.game,6740,480,'gemaRoja');
        var gemYellow = new Gem(this.game,6740,1390,'gemaAmarilla');
        
        this.gems = this.game.add.group();

        this.gems.add(gemBlue);
        this.gems.add(gemGreen);
        this.gems.add(gemRed);
        this.gems.add(gemYellow);
        this.game.world.addChild(this.gems);

        this.currentGems = 4;

        this.rocket = new Objetos.Rocket(this.game,3570,295); 
        this.game.world.addChild(this.rocket);

        this.musica = this.game.add.audio('musica1');
        this.musica.loop = true;
        this.musica.play();
    }

    else if(this.game.currentLevel === 2)
    {
          //Cargamos el tilemap en el map
        this.game.map =  game.add.tilemap('mapaFinal');

        //Asignamos al tileset 'patrones' la imagen de sprites tiles
        //patrones es lo de tiled y tiles, el nombre que tu le das en el main
        this.game.map.addTilesetImage('tiles_spritesheet','tiles');
        this.game.map.addTilesetImage('back','background');

        //Creacion de las layers
        this.game.backgroundLayer = game.map.createLayer('BackgroundLayer');
        this.game.groundLayer = game.map.createLayer('GroundLayer');
        this.game.trigger = game.map.createLayer('Trigger');
        this.game.trigger.visible = false;

        //plano de muerte
        this.game.death = game.map.createLayer('Death');
        this.game.gravity = game.map.createLayer('Gravity');

    
        //Colisiones con el plano de muerte y con el plano de muerte y con suelo.
        this.game.map.setCollisionBetween(1, 500, true, 'Death');
        this.game.map.setCollisionBetween(1, 500, true, 'GroundLayer');
        this.game.map.setCollisionBetween(1,500,true, 'Gravity');
        this.game.map.setCollisionBetween(1,500,true, 'Trigger');

        //Limites de colisiones
        this.game.world.setBounds(0, 0, this.game.map.widthInPixels, this.game.map.heightInPixels);//Límite del mundo


        this.player = new Personajes.Player(this.game, 140,9660);


        var enemy = new Personajes.Enemy(this.game,3570,8650);
        var enemy2 = new Personajes.Enemy(this.game,350,8790);
        var enemy3 = new Personajes.Enemy(this.game,350,7460);
        var enemy4 = new Personajes.Enemy(this.game,3570,7180);
        var enemy5 = new Personajes.Enemy(this.game,2310,6130);
        var enemy6 = new Personajes.Enemy(this.game,350,6270);
        var enemy7 = new Personajes.Enemy(this.game,770,4660);
        var enemy8 = new Personajes.Enemy(this.game,1050,880);

        var enemy9 = new Personajes.Enemy(this.game,2940,5350);
        var enemy10 = new Personajes.Enemy(this.game,2590,3590);
        var enemy11 = new Personajes.Enemy(this.game,1540,2960);

        enemy9.scale.y *= -1;
        enemy10.scale.y *= -1;
        enemy11.scale.y *= -1;

        this.enemies = this.game.add.group();
        this.enemies.add(enemy);
        this.enemies.add(enemy2);
        this.enemies.add(enemy3);
        this.enemies.add(enemy4);
        this.enemies.add(enemy5);
        this.enemies.add(enemy6);
        this.enemies.add(enemy7);
        this.enemies.add(enemy8);
        this.enemies.add(enemy9);
        this.enemies.add(enemy10);
        this.enemies.add(enemy11);
        

        this.flag = new Objetos.Flag(this.game,2730,490);
        this.game.world.addChild(this.flag);



        this.game.world.addChild(this.player);
        this.game.world.addChild(this.enemies);

        this.musica = this.game.add.audio('musica2');
        this.musica.loop = true;
        this.musica.play();


    }

    game.groundLayer.resizeWorld(); //resize world and adjust to the screen

};


BuildMap.prototype.update_ = function(){

    this.player.update_();
    this.enemies.forEach(function(enemy) {
        enemy.updateEnemy_();
    });
}

BuildMap.prototype.getGroundLayer = function()
{
	return this.game.groundLayer;
};

BuildMap.prototype.getDeathLayer = function()
{
	return this.game.death;
};

BuildMap.prototype.getGravityLayer = function()
{
	return this.game.gravity;
};

BuildMap.prototype.getTriggerLayer = function()
{
    return this.game.trigger;
};

BuildMap.prototype.destroy = function()
{
    //ENTIDADES
    this.player.destroy();
    this.enemies.destroy();

    //LAYERS
    this.game.groundLayer.destroy();
    this.game.backgroundLayer.destroy();
    this.game.death.destroy();
    this.game.trigger.destroy();
    this.game.fondo.destroy();
    if(this.game.currentLevel - 1=== 2)
        this.game.gravity.destroy();

    this.musica.destroy();

    //MAPA
    this.game.map.destroy();

};

module.exports = BuildMap;
},{"./Entidades.js":1,"./Objects.js":3}],3:[function(require,module,exports){
'use strict';

function PhysicalObject(game,posX,posY,nombreImagen)
{
    this.game = game;
    Phaser.Sprite.call(this,game,posX,posY,nombreImagen);
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.game.physics.arcade.enable(this);
}

PhysicalObject.prototype = Object.create(Phaser.Sprite.prototype);//Ajustamos el prototipo
PhysicalObject.constructor = PhysicalObject;


///////////////ROCKET///////////////////////
function Rocket(game,posX,posY)
{
    PhysicalObject.call(this,game,posX,posY,'Rocket');
    this.body.immovable = true;
    this.animations.add('idle',[0],1,false);
    this.animations.add('takingOff',[1],1,false);
    this.animations.play('idle');
}

Rocket.prototype = Object.create(PhysicalObject.prototype);//Ajustamos el prototipo
Rocket.constructor = Rocket;
///////////////ROCKET///////////////////////

///////////////COLLECTABLE///////////////////////
function Gem(game,posX,posY,color)
{
    PhysicalObject.call(this,game,posX,posY,color);
}

Gem.prototype = Object.create(PhysicalObject.prototype);//Ajustamos el prototipo
Gem.constructor = Gem;
///////////////ROCKET///////////////////////

function Flag(game,posX,posY)
{
    PhysicalObject.call(this,game,posX,posY,'flag');
}

Flag.prototype = Object.create(PhysicalObject.prototype);//Ajustamos el prototipo
Flag.constructor = Flag;

module.exports = {PhysicalObject: PhysicalObject, Rocket: Rocket, Gem: Gem,Flag: Flag};

},{}],4:[function(require,module,exports){
'use strict';

function Pause (game,pausePlayer,enem,mus) 
{
  this.game = game;
  this.returnMenu = false;
  this.pause = false;
  this.musica = mus;
  this.playerAnimations = pausePlayer;
  this.enemies = enem;
  this.sound = this.game.add.audio('buttonSound');
  this.createButton();
};

Pause.prototype.createButton = function ()
{
  this.buttonContinue = this.game.add.button(this.game.camera.x, 
                                        this.game.camera.y, 
                                        'button', 
                                        this.continueOnClick, 
                                        this, 2, 0, 0);
  var textContinue = this.game.add.text(this.buttonContinue.x, this.buttonContinue.y, "Continue");//Creamos el texto
  textContinue.font = 'Poppins';//Elegimos la fuente
  textContinue.anchor.set(0.5);//Anclamos el texto

  this.buttonContinue.addChild(textContinue);//Metemos el texto en el botón

  this.buttonContinue.visible = false;
  this.buttonContinue.inputEnabled = false;

  this.buttonMenu = this.game.add.button(this.game.camera.x, 
                                        this.game.camera.y, 
                                        'buttonExit', 
                                        this.menuOnClick, 
                                        this, 2, 0, 0);
  var textMenu = this.game.add.text(this.buttonMenu.x, this.buttonMenu.y, "Menu");//Creamos el texto
  textMenu.font = 'Poppins';//Elegimos la fuente
  textMenu.anchor.set(0.5);//Anclamos el texto

  this.buttonMenu.addChild(textMenu);//Metemos el texto en el botón

  this.buttonMenu.visible = false;
  this.buttonMenu.inputEnabled = false;
};

//Cuando se pulsa el boton
Pause.prototype.continueOnClick = function()
{
  this.sound.play();
  this.musica.volume= 1;

  this.game.physics.arcade.isPaused=false;
  this.playerAnimations.paused = false;//Paramos la animación  
  this.enemies.forEach(function(enemy) 
  {
      enemy.getAnimations().paused = false;
  }.bind(this));

  this.buttonContinue.visible = false;
  this.buttonContinue.inputEnabled = false;

  this.buttonMenu.visible = false;
  this.buttonMenu.inputEnabled = false;


  this.pause = false;
};

//Cuando se pulsa el boton
Pause.prototype.menuOnClick = function()
{
  this.sound.play();
  this.returnMenu = true;
};


//Se llama desde el update y detecta cuando se pulsa la p para activar la Pause
Pause.prototype.inputPause = function()
{
  if (this.game.input.keyboard.isDown(Phaser.Keyboard.P))
  {        
    this.musica.volume= 0;
    this.game.physics.arcade.isPaused=true;
    this.playerAnimations.paused = true;//Paramos la animación  
    this.enemies.forEach(function(enemy) 
    {
      enemy.getAnimations().paused = true;
    }.bind(this));

    this.buttonContinue.x = this.game.camera.x + 300;
    this.buttonContinue.y = this.game.camera.y + 300;

    this.buttonContinue.visible = true;
    this.buttonContinue.inputEnabled = true;
    this.buttonContinue.anchor.set(0.5);//Anclamos el botón


    this.buttonMenu.x = this.game.camera.x + 500;
    this.buttonMenu.y = this.game.camera.y + 300;

    this.buttonMenu.visible = true;
    this.buttonMenu.inputEnabled = true;
    this.buttonMenu.anchor.set(0.5);//Anclamos el botón

    this.pause = true;
  }
        
};

//Se le llama desde juego para comprobar si está Pausedo
Pause.prototype.isPaused = function()
{
  return this.pause;
};

Pause.prototype.goToMenu = function()
{
  return this.returnMenu;
};


module.exports = Pause;
},{}],5:[function(require,module,exports){
//State
var FinalScene = {
  //Al inicio del state
    create: function () {

        this.music = this.game.add.audio('musicaMenu');
        this.music.play();
        this.music.loop = true;
        //Añadimos sprite de logo
        var logo = this.game.add.sprite(this.game.world.centerX, 
                                        this.game.world.centerY, 
                                        'fondoFinal');
        logo.anchor.setTo(0.5, 0.5);//Anclamos el logo

        //Añadimos el botón
        var buttonMenu = this.game.add.button(this.game.world.centerX - 200, 
                                               this.game.world.centerY, 
                                               'button', 
                                               this.actionOnClick, 
                                               this, 2, 0, 0);
        buttonMenu.anchor.set(0.5);//Anclamos el botón

        buttonMenu.scale.x*= 1.2;
        buttonMenu.scale.y*= 1.2;


        var textMenu = this.game.add.text(0, 0, "Go to Menu");//Creamos el texto
        textMenu.font = 'Poppins';//Elegimos la fuente
        textMenu.anchor.set(0.5);//Anclamos el texto
        //textMenu.fill = '#43d637';//PODEMOS PODER COLOR ASÍ

        textMenu.fill = '#FFA500';
        textMenu.stroke = '#FF0000';
        textMenu.strokeThickness = 3;

        buttonMenu.addChild(textMenu);//Metemos el texto en el botón
    },
    
    //Al pulsar el botón
    actionOnClick: function(){
        this.sound = this.game.add.audio('buttonSound');
        this.sound.play();
        this.music.destroy();

        //IMAGENES DEL PRELOADER
        this.game.cache.removeImage('preloader_bar');
        this.game.cache.removeImage('backPreloader_bar');
        this.game.cache.removeImage('fondoFinal');
        this.game.cache.removeSound('musicaMenu');//Recurso


        this.game.state.start('boot');//Vamos al state de carga
    } 
};

module.exports = FinalScene;
},{}],6:[function(require,module,exports){
var GameOver = {
    create: function () {
        console.log("Game Over");
        
        this.sound = this.game.add.audio('buttonSound');

        this.music = this.game.add.audio('musicaMenu');
        this.music.play();
        this.music.loop = true;
        //Añadimos sprite de fondo

        var fondo = this.game.add.sprite(this.game.world.centerX, 
                                        this.game.world.centerY, 
                                        'gameOver');
        fondo.anchor.setTo(0.5, 0.5);//Anclamos el fondo

        var pj = this.game.add.sprite(370,400,'fox');
        pj.animations.add('exhausted',[24,25,26],10,true);
        pj.animations.play('exhausted');

        //Boton reset game
        var button = this.game.add.button(300, 300, 
                                          'button', 
                                          this.actionOnClick, 
                                          this, 2, 1, 0);
        button.anchor.set(0.5);

        //Texto dentro del botón
        var text = this.game.add.text(0, 0, "Reset Game");
        text.font = 'Poppins';//Elegimos la fuente
        text.anchor.set(0.5);
        button.addChild(text);
        
        //Botón vuelta al menu
        var button2 = this.game.add.button(500, 300, 
                                          'buttonExit', 
                                          this.returnMainMenu, 
                                          this, 2, 1, 0);
        button2.anchor.set(0.5);

        //Texto dentro del botón
        var text2 = this.game.add.text(0, 0, "Return menu");
        text2.font = 'Poppins';//Elegimos la fuente

        text2.anchor.set(0.5);
        button2.addChild(text2);

          //Texto en el menú
        var goText = this.game.add.text(400, 150, "GameOver");
        goText.font = 'Indie Flower';//Elegimos la fuente
        goText.fontSize = 100;
        goText.fill = '#FFA500';


        goText.anchor.set(0.5);
    },
    
    actionOnClick: function()
    {
        this.sound.play();
        this.music.destroy();
        if (this.game.currentLevel === 1)
            this.game.state.start('play');

        else if (this.game.currentLevel === 2)
            this.game.state.start('play2');

    },

    returnMainMenu: function()
    {
        this.sound.play();
        this.music.destroy();

        //IMAGENES DEL PRELOADER
        this.game.cache.removeImage('preloader_bar');
        this.game.cache.removeImage('backPreloader_bar');
        this.game.cache.removeImage('fondoFinal');
        this.game.cache.removeSound('musicaMenu');//Recurso
        
        this.game.state.start('boot');
    }

};

module.exports = GameOver;
},{}],7:[function(require,module,exports){
'use strict';

//Require de las escenas
var PlayScene = require('./play_scene.js');
var PlayScene2 = require('./play_scene2.js');
var GameOverScene = require('./gameover_scene.js');
var MenuScene = require('./menu_scene.js');
var FinalScene = require('./final_scene.js');


//Carga imágenes del menu y llama al state menu
var BootScene = {
  preload: function () {
    //Carga 
    this.game.load.image('preloader_bar', 'images/preloader_bar.png');//Barra de carga
    this.game.load.image('backPreloader_bar', 'images/fondoBarraCarga.png');//Barra de carga
    this.game.load.spritesheet('button', 'images/boton_azul.png', 190,46,3);//Imagen del botón
    this.game.load.spritesheet('buttonExit', 'images/boton_naranja.png', 190,45.5,3);//Imagen del botón
    this.game.load.image('logo', 'images/PantallaMenu.png');//Imagen del logo
    this.game.load.audio('musicaMenu','sound/musicaMenu.wav');
    this.game.load.audio('buttonSound','sound/buttonSound.wav');

    this.game.currentLevel = 1;
  },

  create: function () {
      this.game.state.start('menu');//Se carga la escena Menú
  }
};


var PreloaderScene = {
  
  preload: function () {
    //Barra de carga
    var fondoBarraCarga = this.game.add.sprite(80,300,'backPreloader_bar');
    fondoBarraCarga.anchor.setTo(0,0.5);
    this.loadingBar = this.game.add.sprite(100,300, 'preloader_bar');//Añadimos la barra de carga
    this.loadingBar.anchor.setTo(0, 0.5);//Anclamos la barra
    this.game.load.setPreloadSprite(this.loadingBar);//Añadimos el sprite de precarga

    //Color de fondo en la escena de carga
    this.game.stage.backgroundColor = "#000000";

    //Nos suscribimos al evento de cuando se inicia la carga
    this.load.onLoadStart.add(this.loadStart, this);

    if(this.game.currentLevel === 1)
    {
      this.game.cache.removeImage('logo');

      this.game.load.image('gameOver', 'images/cosmos.jpg');//Imagen del logo

      //MAPA
      this.game.load.tilemap('tilemap1', 'maps/mapa.json',null,Phaser.Tilemap.TILED_JSON);//Cargar el tilemap(hecho)
      
      //PERSONAJES
      this.game.load.spritesheet('fox','images/foxSpriteSheet.png',56,80);
      this.game.load.spritesheet('enemy','images/enemy.png',77,53);

      //TILES
      this.game.load.image('grassTiles', 'images/sheet.png');//cargar sprites del tilemap
      this.game.load.image('tiles', 'images/tiles_spritesheet.png');//cargar sprites del tilemap
      this.game.load.image('fondo', 'images/background.png');//cargar sprites del tilemap


      //OBJETOS
      this.game.load.image('gemaAzul','images/gemBlue.png');
      this.game.load.image('gemaRoja','images/gemRed.png');
      this.game.load.image('gemaAmarilla','images/gemYellow.png');
      this.game.load.image('gemaVerde','images/gemGreen.png');
      
      this.game.load.spritesheet('Rocket','images/cohetes.png',110,246);

      //SONIDO
      this.game.load.audio('musica1','sound/musica1.wav');
      this.game.load.audio('jumpSound','sound/jumpSound.wav');
      this.game.load.audio('spiderSound','sound/spiderSound.wav');
      this.game.load.audio('rocketSound','sound/rocketSound.mp3');
      this.game.load.audio('gemSound','sound/gemSound.wav');

    }

    else if(this.game.currentLevel === 2)
    {
      /////////////DESTRUIR CACHE/////////////
      //MAPA
      this.game.cache.removeTilemap('tilemap1');

      //TILES
      this.game.cache.removeImage('grassTiles');

      //OBJETOS
      this.game.cache.removeImage('Rocket');
      this.game.cache.removeImage('gemaRoja');
      this.game.cache.removeImage('gemaAmarilla');
      this.game.cache.removeImage('gemaAzul');
      this.game.cache.removeImage('gemaVerde');


      this.game.cache.removeSound('musica1');
      this.game.cache.removeSound('rocketSound');
      this.game.cache.removeSound('gemSound');
      ////////////////DESTRUIR CACHE/////////

      //MAPA
      this.game.load.tilemap('mapaFinal', 'maps/Mapa2.json',null,Phaser.Tilemap.TILED_JSON);//Cargar el tilemap(hecho)
      
      //TILES
      this.game.load.image('background', 'images/back.png');//cargar sprites del tilemap

      this.game.load.image('flag', 'images/flagRed.png');//cargar sprites del tilemap

      this.game.load.audio('gravitySound','sound/gravitySound.wav');
      this.game.load.audio('musica2','sound/musica2.wav');
    }

    else if(this.game.currentLevel === 3)
    {
       /////////////DESTRUIR CACHE/////////////
      //MAPA
      this.game.cache.removeTilemap('mapaFinal');

      //TILES
      this.game.cache.removeImage('tiles');

      //PERSONAJES
      this.game.cache.removeImage('fox');
      this.game.cache.removeImage('enemy');

      //OBJETOS
      this.game.cache.removeImage('flag');

      this.game.cache.removeImage('gameOver');

      this.game.load.image('fondoFinal', 'images/PantallaFinJuego.png');//Imagen del logo

      this.game.cache.removeSound('musica2');
      this.game.cache.removeSound('jumpSound');
      this.game.cache.removeSound('gravitySound');
      this.game.cache.removeSound('spiderSound');
      ////////////////DESTRUIR CACHE/////////

    }

    this.load.onLoadComplete.add(this.loadComplete, this);//Nos suscribimos al evento de cuando finaliza la carga
  },

  //Evento cuando inicia carga
  loadStart: function () {
    console.log("Game Assets Loading ...");
  },
    
  //Evento cuando termina la carga
  loadComplete: function ()
  {
    if (this.game.currentLevel === 1)
      this.game.state.start('play');
    else if  (this.game.currentLevel === 2)
      this.game.state.start('play2');
    else   
      this.game.state.start('final');
  },

  //Esto debería avanzar la barra de carga
  update: function(){
      this._loadingBar
  }
};

//Cuando termina la carga de la ventana
window.onload = function () {
  WebFont.load(wfconfig);//Cargamos la fuente de la web
};

//Configuración de la fuente
var wfconfig = {
    //Se llama al principio
    active: function() { 
        console.log("font loaded");
        init();//llamamos a iniciar el juego
    },
    
    //Tipo de fuente
    google: {
        families: ['Poppins','Indie Flower']//boton, titulo / game over
    }
 
};

//Inicia el juego
function init()
{
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');//Creación del juego

//Asignación de los states
  game.state.add('boot', BootScene);
  game.state.add('menu', MenuScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('play', PlayScene);
  game.state.add('play2', PlayScene2);
  game.state.add('gameOver', GameOverScene);
  game.state.add('final', FinalScene);


//iniciamos el state 'boot'
  game.state.start('boot');//Inicia el menú

};




},{"./final_scene.js":5,"./gameover_scene.js":6,"./menu_scene.js":8,"./play_scene.js":9,"./play_scene2.js":10}],8:[function(require,module,exports){
//State
var MenuScene = {
  //Al inicio del state
    create: function () {
        this.music = this.game.add.audio('musicaMenu');
        this.sound = this.game.add.audio('buttonSound');

        this.music.play();
        this.music.loop = true;

        //Añadimos sprite de logo
        var logo = this.game.add.sprite(this.game.world.centerX, 
                                        this.game.world.centerY, 
                                        'logo');
        logo.anchor.setTo(0.5, 0.5);//Anclamos el logo

        //Añadimos el botón
        var buttonStart = this.game.add.button(this.game.world.centerX  -50, 
                                               this.game.world.centerY, 
                                               'button', 
                                               this.actionOnClick, 
                                               this, 2, 0, 0);
        buttonStart.anchor.set(0.5);//Anclamos el botón

        buttonStart.scale.x*= 1.5;
        buttonStart.scale.y*= 1.5;

        var textStart = this.game.add.text(0, 0, "Start");//Creamos el texto
        textStart.font = 'Poppins';//Elegimos la fuente
        textStart.anchor.set(0.5);//Anclamos el texto
        //textStart.fill = '#43d637';//PODEMOS PODER COLOR ASÍ

        textStart.fill = '#FFA500';
        textStart.stroke = '#FF0000';
        textStart.strokeThickness = 3;

        buttonStart.addChild(textStart);//Metemos el texto en el botón

        this.buttonControl = this.game.add.button(this.game.world.centerX  -50, 
                                               this.game.world.centerY + 100, 
                                               'button', 
                                               this.controlOnClick, 
                                               this, 2, 0, 0);
        this.buttonControl.anchor.set(0.5);//Anclamos el botón

        var textControl = this.game.add.text(0, 0, "Controles");//Creamos el texto
        textControl.font = 'Poppins';//Elegimos la fuente
        textControl.anchor.set(0.5);//Anclamos el texto
        //textStart.fill = '#43d637';//PODEMOS PODER COLOR ASÍ

        textControl.fill = '#FFA500';

        this.textTutorial = this.game.add.text(30,400,"Controles:"+'\n'+"-Puedes moverte con las flechas de direccion" + '\n' +
            "-Puedes saltar con SpaceBar"+ '\n' + "-Puedes agarrarte a las paredes con la tecla G" + '\n' + "-Puedes saltar mientras estás agarrado con SpaceBar"
             + '\n' + "-Puedes soltarte de las paredes con la tecla H");
        this.textTutorial.fill = '#FFA500';

        this.textTutorial.fontSize = 20;

        this.textTutorial.visible = false;

         this.buttonControl.addChild(textControl);//Metemos el texto en el botón

    },
    
    //Al pulsar el botón
    actionOnClick: function(){
        this.sound.play();
        this.music.destroy();
        this.game.state.start('preloader');//Vamos al state de carga
    } ,

    controlOnClick: function(){
        this.sound.play();
        this.textTutorial.visible = true;
        this.buttonControl.visible = false;
    } 
};

module.exports = MenuScene;
},{}],9:[function(require,module,exports){
'use strict';

var Pausa = require('./Pausa.js');
var Mapa = require('./Mapa.js');

//Scena de juego.
var PlayScene = 
{
    //Método constructor...
    create: function () 
    {
        this.mapa = new Mapa(this.game);
     
        this.configure();

        //Creamos la pausa
        this.pausa = new Pausa(this.game,this.mapa.player.getAnimations(),this.mapa.enemies , this.mapa.musica);

        //Sonidos
        this.spiderSound = this.game.add.audio('spiderSound');
        this.gemSound = this.game.add.audio('gemSound');
        this.rocketSound = this.game.add.audio('rocketSound');
    },
    
    //IS called one per frame.
    update: function () 
    {
        if (!this.pausa.isPaused())
        {
            //UPDATE DE TODAS LAS ENTIDADES
            //COLISION JUGADOR - TILES
            this.game.physics.arcade.collide(this.mapa.player, this.mapa.getGroundLayer());

            //COLISION ENEMIGOS - TRIGGERS
            this.mapa.enemies.forEach(function(enemy) 
            {
                this.game.physics.arcade.collide(enemy, this.mapa.getTriggerLayer());
            }.bind(this));

            this.mapa.update_();


            //COLISION JUGADOR - MUERTE (ENEMIGOS Y CAPA MUERTE)
            this.checkPlayerDeath();

            //COLISION JUGADOR - COHETE
            //COLISION JUGADOR - GEMAS

            this.checkFinalLevel();
            this.checkCollisionWithGem();

            //Detectar input de pausa
            this.pausa.inputPause();
        }
        else if (this.pausa.goToMenu())
        {
            this.game.cache.destroy();
            this.destroy();
            this.game.state.start('boot');

        }
    },

    //Comprueba si el jugador ha muerto por colision con la capa muerte o con el enemigo
    checkPlayerDeath: function()
    {
        var enemyDeath = false;
        var playerDeath = false;
        this.mapa.enemies.forEach(function(enemy) 
        {
            if(this.game.physics.arcade.collide(enemy, this.mapa.player))
            {
                if (this.checkEnemyDeath(enemy))
                    enemyDeath = true;
                
                else
                    playerDeath = true;

            }
            
        }.bind(this));

        if(playerDeath  || this.game.physics.arcade.collide(this.mapa.player, this.mapa.getDeathLayer()))
        {
            this.game.state.start('gameOver');
            this.destroy();
        }
    },

  checkEnemyDeath: function(enemy){
    if(enemy.isTouchingUp()){
        this.spiderSound.play();
        enemy.destroy();
        return true;
    }
    return false;
  },

    checkCollisionWithGem: function()
    {
        this.mapa.gems.forEach(function(gem) 
        {
            var bool = this.game.physics.arcade.collide(gem, this.mapa.player)
            if (bool)
            {
                this.gemSound.play();
                this.mapa.currentGems--;
                gem.destroy();
            }
        }.bind(this));
            
    },

    checkFinalLevel: function()
    {
         if(this.game.physics.arcade.collide(this.mapa.player, this.mapa.rocket) 
            && this.mapa.currentGems === 0)
         {
            this.mapa.currentGems = -1;
            this.rocketSound.play();

            var timer = this.game.time.create(false);
            this.mapa.player.visible = false;

            this.mapa.rocket.animations.play('takingOff');   
            this.mapa.rocket.body.position.y += 50;

            this.mapa.rocket.body.velocity.y = -100;

        //  Set a TimerEvent to occur after 3 seconds
            timer.add(3000, this.goToNextNevel, this);
            timer.start();
        }
            
    },

    goToNextNevel: function()
    {
        this.game.currentLevel++;
        this.destroy();
        this.game.state.start('preloader');
        
    },

    //Configura la escena al inicio
    configure: function()
    {
        //Color de fondo
        this.game.stage.backgroundColor = '#a9f0ff';

        //Start the Arcade Physics systems
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
    },
    
    //Destruimos los recursos tilemap, tiles y logo.
    destroy: function()
    {
        this.spiderSound.destroy();
        this.gemSound.destroy();
        this.rocketSound.destroy();
        this.mapa.destroy();//Destruye todo lo referente al mapa

        this.game.world.setBounds(0,0,800,600);
    }

};

module.exports = PlayScene;

},{"./Mapa.js":2,"./Pausa.js":4}],10:[function(require,module,exports){
'use strict';

var Pausa = require('./Pausa.js');
var Mapa = require('./Mapa.js');


var nextGravityFall = 0;

//Scena de juego.
var PlayScene2 = 
{
    //Método constructor...
    create: function () 
    {
        this.mapa = new Mapa(this.game);
     
        this.configure();

        //Creamos la pausa
        this.pausa = new Pausa(this.game,this.mapa.player.getAnimations(),this.mapa.enemies ,this.mapa.musica);

        //Sonidos
        this.spiderSound = this.game.add.audio('spiderSound');
        this.gravitySound = this.game.add.audio('gravitySound');

    },
    
    //IS called one per frame.
    update: function () 
    {
        if (!this.pausa.isPaused())
        {
            //UPDATE DE TODAS LAS ENTIDADES
            //COLISION JUGADOR - TILES
            this.game.physics.arcade.collide(this.mapa.player, this.mapa.getGroundLayer());


            //COLISION ENEMIGOS - TRIGGERS
            this.mapa.enemies.forEach(function(enemy) 
            {
                this.game.physics.arcade.collide(enemy, this.mapa.getTriggerLayer());
            }.bind(this));

            this.mapa.update_();


            //COLISION JUGADOR - MUERTE (ENEMIGOS Y CAPA MUERTE)
            this.checkPlayerDeath();

      
            //COLISION JUGADOR - GRAVEDAD
            //COLISION JUGADOR - BANDERA
            this.checkModifyGravity();
            this.checkCollisionWithFlag();
            
          
            //Detectar input de pausa
            this.pausa.inputPause();
        }
        else if (this.pausa.goToMenu())
        {
            this.game.cache.destroy();
            this.destroy();
            this.game.state.start('boot');

        }
    },

    //Comprueba si el jugador ha muerto por colision con la capa muerte o con el enemigo
    checkPlayerDeath: function()
    {
        var enemyDeath = false;
        var playerDeath = false;
        this.mapa.enemies.forEach(function(enemy) 
        {
            if(this.game.physics.arcade.collide(enemy, this.mapa.player))
            {
                if (this.checkEnemyDeath(enemy))
                    enemyDeath = true;
                
                else
                    playerDeath = true;

            }
            
        }.bind(this));

        if(playerDeath  || this.game.physics.arcade.collide(this.mapa.player, this.mapa.getDeathLayer()))
        {
            this.game.state.start('gameOver');
            this.destroy();
        }
    },

  checkEnemyDeath: function(enemy){
    if(enemy.isTouchingUp()){
        this.spiderSound.play();
        enemy.destroy();
        return true;
    }
    return false;
  },


    goToNextNevel: function()
    {
        this.game.currentLevel++;
        this.destroy();
        this.game.state.start('preloader');
        
    },

    //Colision con gravityFall
    checkModifyGravity: function()
    {
        if(this.game.physics.arcade.collide(this.mapa.player, this.mapa.getGravityLayer())&& 
            this.game.time.now > nextGravityFall)
        {
            this.gravitySound.play();
            this.mapa.player.swapGravity();
            nextGravityFall = this.game.time.now + 1000;
        }

    },

    checkCollisionWithFlag: function()
    {
        if(this.game.physics.arcade.collide(this.mapa.flag, this.mapa.player))
            this.goToNextNevel();
 
    },

    //Configura la escena al inicio
    configure: function()
    {
        //Color de fondo
        this.game.stage.backgroundColor = '#a9f0ff';

        //Start the Arcade Physics systems
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
    },
    
    //Destruimos los recursos tilemap, tiles y logo.
    destroy: function()
    {
        this.spiderSound.destroy();
        this.gravitySound.destroy();
        this.mapa.destroy();//Destruye todo lo referente al mapa
        
        this.game.world.setBounds(0,0,800,600);
    }

};

module.exports = PlayScene2;

},{"./Mapa.js":2,"./Pausa.js":4}]},{},[7,1,5,6,2,8,3,4,9,10]);
