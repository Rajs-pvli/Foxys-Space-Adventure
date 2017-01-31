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