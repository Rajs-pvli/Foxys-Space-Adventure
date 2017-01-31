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

        this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);


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
