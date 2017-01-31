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
