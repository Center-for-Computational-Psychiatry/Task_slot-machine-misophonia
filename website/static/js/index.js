import InstructionsScene from './scenes/InstructionsScene.js'

// Generate the game variable
var config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    scene: [InstructionsScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    dom: {
        createContainer: true
    },
    parent: 'game-container',
    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: rexuiplugin, //load the UI plugins here for all scenes
            mapping: 'rexUI'
        }]
    },
};

var game = new Phaser.Game(config);

export default game; // this line exports game to BaseScene.js file to be used there
