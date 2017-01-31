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