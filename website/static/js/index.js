import InstructionsScene from './scenes/InstructionsScene.js'

// Generate the game variable
var config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    // backgroundColor: '#FFFFFF', black
    // backgroundColor: '#4a5896', blue-purple
    // backgroundColor: '#4488aa', nice blue
    // textColor: '#000000', white
    scene: [InstructionsScene],
    scale: {
        mode: Phaser.Scale.FIT,
        // possible way to improve text quality and blurriness
        // https://www.html5gamedevs.com/topic/31404-scaling-to-fill-screen-maintain-pixel-ratio-but-not-aspect-ratio/
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
