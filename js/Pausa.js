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