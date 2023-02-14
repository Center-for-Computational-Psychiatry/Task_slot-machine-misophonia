import PracticeScene from './PracticeScene.js'

export default class InstructionsScene extends Phaser.Scene {

    constructor() {
        super('InstructionsScene');
    }

    preload() {
        // LOAD MISO SOUNDS + IMAGES
        this.load.audio('sound_A_gulping', './static/assets/audiovideo/gulping_A.wav')
        this.load.audio('sound_B_gulping', './static/assets/audiovideo/gulping_B.wav')
        this.load.image('image_A_gulping', './static/assets/audiovideo/gulping_A.png');
        this.load.image('image_B_gulping', './static/assets/audiovideo/gulping_B.png');

        this.load.audio('sound_A_sniffing', './static/assets/audiovideo/sniffing_A.wav')
        this.load.audio('sound_B_sniffing', './static/assets/audiovideo/sniffing_B.wav')
        this.load.image('image_A_sniffing', './static/assets/audiovideo/sniffing_A.png');
        this.load.image('image_B_sniffing', './static/assets/audiovideo/sniffing_B.png');

        this.load.audio('sound_A_swishing', './static/assets/audiovideo/swishing_A.wav')
        this.load.audio('sound_B_swishing', './static/assets/audiovideo/swishing_B.wav')
        this.load.image('image_A_swishing', './static/assets/audiovideo/swishing_A.png');
        this.load.image('image_B_swishing', './static/assets/audiovideo/swishing_B.png');

        this.load.audio('sound_A_sipping', './static/assets/audiovideo/sipping_A.wav')
        this.load.audio('sound_B_sipping', './static/assets/audiovideo/sipping_B.wav')
        this.load.image('image_A_sipping', './static/assets/audiovideo/sipping_A.png');
        this.load.image('image_B_sipping', './static/assets/audiovideo/sipping_B.png');

        this.load.audio('sound_A_wet_chewing', './static/assets/audiovideo/wet_chewing_A.wav')
        this.load.audio('sound_B_wet_chewing', './static/assets/audiovideo/wet_chewing_B.wav')
        this.load.image('image_A_wet_chewing', './static/assets/audiovideo/wet_chewing_A.png');
        this.load.image('image_B_wet_chewing', './static/assets/audiovideo/wet_chewing_B.png');

        this.load.audio('sound_A_scraping', './static/assets/audiovideo/scraping_plate_A.wav')
        this.load.audio('sound_B_scraping', './static/assets/audiovideo/scraping_plate_B.wav')
        this.load.image('image_A_scraping', './static/assets/audiovideo/scraping_plate_A.png');
        this.load.image('image_B_scraping', './static/assets/audiovideo/scraping_plate_B.png');

        // LOAD SLOT MACHINE IMAGES
        this.load.image('misobar', './static/assets/slot_win_audio_100x600.png');
        this.load.image('slots', './static/assets/slots.png');
        this.load.image('shutter', './static/assets/shutter.png');

        this.load.plugin('rexinputtextplugin', './static/js/ui/rexinputtextplugin.min.js', true);
        this.load.plugin('rexinputtextplugin', './static/js/ui/rexuiplugin.min.js', true);
    }

    create() {
        console.log('Instructions Scene loading.');

        this.gametimer = this.time.addEvent({ delay: 6000000, callback: this.onClockEvent, callbackScope: this, repeat: 1 });

        // if debug is on, spins are faster (to save time)
        var debug = false;

        if (debug == true) {
            this.spacebar_delay = 3000;
            this.basespintime = 1400;
        } else {
            this.spacebar_delay = 3000;
            this.basespintime = 1400;
        }

        // Keys used to select slot machine and advance to next slide
        this.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyLEFT = this.input.keyboard.addKey('LEFT');
        this.keyRIGHT = this.input.keyboard.addKey('RIGHT');
        this.keyUP = this.input.keyboard.addKey('UP');
        this.keyA = this.input.keyboard.addKey('A');
        this.keyB = this.input.keyboard.addKey('B');
        this.keyC = this.input.keyboard.addKey('C');
        this.keyD = this.input.keyboard.addKey('D');
        this.keyE = this.input.keyboard.addKey('E');
        this.keyF = this.input.keyboard.addKey('F');

        // Set the text params
        this.text_params = {
            fontFamily: 'Helvetica',
            fontSize: 20,
            'wordWrap': { width: this.game.canvas.width - 200 },
            'align': 'center',
        };

        // objGroup is a Phaser group that contains all the objects on a displayed page
        // It is cleared every time a new page is loaded
        this.objGroup = this.add.group();

        // Generate the block orders and reversal timings
        this.generate_random_orders();

        // Set the screen num and start the first screen
        this.screen_num = 0; // should be 0 to run the full study, but can be 6 to debug post-training scenes

        // Check if key is correct, and start the game
        var queryString = window.location.search;
        var urlParams = new URLSearchParams(queryString);
        var key = urlParams.get('key');
        this.url_pid = urlParams.get('prolific_pid');
        this.url_run = urlParams.get('run');
        if (key == '3128CCFF2D32845B4DD791315F7CA') {
            getID(this);
        }
        else {
            this.draw_no_key_screen();
        }
    }

    // SCREEN 1 (INTRO) FUNCTIONS
    draw_no_key_screen() {

        // Don't allow advancing to next scene before they read the instructions
        // this.keySPACE.enabled = false;

        var text_content = 'The key or ID is incorrect. Please check your url or try again.';
        var text = this.add.text(this.game.canvas.width / 2,
            this.game.canvas.height / 2 - 50,
            text_content, this.text_params);
        text.setOrigin(0.5, 0.5);
        this.objGroup.add(text);

        // var timedEvent = this.time.delayedCall(this.spacebar_delay, this.draw_spacebar, [], this);
        // // Listen for progression to next scene
        // this.draw_screen = true;
        // this.screen_num += 3;

    }

    // UTILITY FUNCTIONS
    generate_random_orders() {
        // Set reversal timings, and optimal machine for all blocks
        // A - BLOCK ONE (Left machine better first, 12-12-11)
        //     BLOCK TWO (Right machine better first, 12-12-11)
        // B - BLOCK ONE (Right machine better first, 13-12-10)
        //     BLOCK TWO (Left machine better first, 13-12-10)
        // C - BLOCK ONE (Left machine better first, 12-12-11)
        //     BLOCK TWO (Right machine better first, 12-12-11)
        // D - BLOCK ONE (Right machine better first, 13-12-10)
        //     BLOCK TWO (Left machine better first, 13-12-10)
        //
        // Maybe alter reversal for each block?
        var random = Phaser.Math.FloatBetween(0, 4);
        if (random < 1) {
            this.reversal_timings = 'A';
        } else if (random >= 1 && random < 2) {
            this.reversal_timings = 'B';
        } else if (random >= 2 && random < 3) {
            this.reversal_timings = 'C';
        } else if (random >= 3) {
            this.reversal_timings = 'D';
        }

        // console.log('BLOCK ORDER: ' + this.block_order);
        console.log('REVERSAL TIMINGS: ' + this.reversal_timings)
    }

    draw_spacebar() {
        // This function draws and enables a spacebar after a set delay

        this.spacebar_text_content = 'Press SPACEBAR to continue.'
        this.spacebar_text = this.add.text(this.game.canvas.width / 2,
            this.game.canvas.height - 100,
            this.spacebar_text_content, this.text_params);
        this.spacebar_text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.spacebar_text);
        this.keySPACE.enabled = true;
    }

    // SCREEN 1 (INTRO) FUNCTIONS
    draw_screen_1() {

        // Don't allow advancing to next scene before they read the instructions
        this.keySPACE.enabled = false;

        var text_content = 'Welcome to the Slot Machine game!\n\nIn this experiment ' +
            'you will be trying to minimize the displeasure you get from slot machines.\n\n' +
            'In this experiment, the slot machines will deliver a misophonia sound.' +
            '\n\n\nLet’s take a look at the setup.';
        var text = this.add.text(this.game.canvas.width / 2,
            this.game.canvas.height / 2 - 50,
            text_content, this.text_params);
        text.setOrigin(0.5, 0.5);
        this.objGroup.add(text);

        var timedEvent = this.time.delayedCall(this.spacebar_delay, this.draw_spacebar, [], this);
        // Listen for progression to next scene
        this.draw_screen = true;
        this.screen_num += 1;

    }

    // Choose random order for miso triggers to display on Screen 2
    randomize_choice_order() {
        var random_order_choices = ['Gulping water', 'Sniffing', 'Swishing water', 'Sipping', 'Wet chewing', 'Scraping on a plate']
        shuffle(random_order_choices);
        console.log(random_order_choices)
        this.choice_A = random_order_choices[0];
        this.choice_B = random_order_choices[1];
        this.choice_C = random_order_choices[2];
        this.choice_D = random_order_choices[3];
        this.choice_E = random_order_choices[4];
        this.choice_F = random_order_choices[5];
        console.log(this.choice_A)
        console.log(this.choice_B)
        console.log(this.choice_C)
        console.log(this.choice_D)
        console.log(this.choice_E)
        console.log(this.choice_F)
    }

    // SCREEN 2 (MISO TRIGGER SELECTION) FUNCTIONS
    draw_screen_2() {
        this.randomize_choice_order();

        // Without this function, every key needs to be pressed twice to work
        this.input.keyboard.resetKeys()
        this.keySPACE.enabled = false;
        this.keyA.enabled = true;
        this.keyB.enabled = true;
        this.keyC.enabled = true;
        this.keyD.enabled = true;
        this.keyE.enabled = true;
        this.keyF.enabled = true;

        // Remove all objects currently on the screen
        this.objGroup.clear(true, true);

        // Draw the trial number and score text
        this.text_content = 'Using your keyboard, please select your worst misophonia trigger.\n' +
        'Think carefully and press the LETTER key to indicate your worst misophonia trigger.\n\n' +
        'A. ' + this.choice_A + ' (press “A” key)\n\n' +
        'B. ' + this.choice_B + ' (press “B” key)\n\n' +
        'C. ' + this.choice_C + ' (press “C” key)\n\n' +
        'D. ' + this.choice_D + ' (press “D” key)\n\n' +
        'E. ' + this.choice_E + ' (press “E” key)\n\n' +
        'F. ' + this.choice_F + ' (press “F” key)';

        this.text = this.add.text(
            this.game.canvas.width / 2, // x position
            this.game.canvas.height / 2 - 50, // y position
            this.text_content, this.text_params);
        this.text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.text);

        this.record_option = true;
        this.rect_group = this.add.group();
    }

    randomize_choice_order() { // randomly choose order of miso triggers to display on screen 2
        var random_order_choices = ['Gulping water', 'Sniffing', 'Swishing water', 'Sipping', 'Wet chewing', 'Scraping on a plate'] // Remember to change names to match in "set_trigger_choices" function if changing any names in this array.

        random_order_choices.sort(() => Math.random() - 0.5); // randomize order of choices in array
        console.log(random_order_choices)

        this.choice_A = random_order_choices[0];
        this.choice_B = random_order_choices[1];
        this.choice_C = random_order_choices[2];
        this.choice_D = random_order_choices[3];
        this.choice_E = random_order_choices[4];
        this.choice_F = random_order_choices[5];
    }

    draw_select_box(choice) {
        this.rect_group.clear(true, true);
        this.r3 = this.add.rectangle(
            this.game.canvas.width / 2 , // x location
            this.game.canvas.height / 2 - 133 + choice * 48, // y location increments down for every choice
            375, 50); // x and y dimensions of rectangle
        this.r3.setOrigin(0.5, 0.5);
        this.r3.setStrokeStyle(5, 0xe82424);
        this.rect_group.add(this.r3);
    }

    confirm_choice() {
        this.record_option = false;
        this.screen_num += 1;
        this.draw_screen = true;
        this.objGroup.add(this.r3);
        this.draw_spacebar();
    }

    // Set the trigger choice, images, and sounds based on user choice
    set_trigger_choices(user_choice) {
        switch(user_choice) {
            case "Sipping":
                this.miso_trigger = 'sipping';
                this.trigger_image_A = 'image_A_sipping';
                this.trigger_image_B = 'image_B_sipping';
                this.trigger_sound_A = 'sound_A_sipping';
                this.trigger_sound_B = 'sound_B_sipping';
                break;
            case "Swishing water":
                this.miso_trigger = 'swishing';
                this.trigger_image_A = 'image_A_swishing';
                this.trigger_image_B = 'image_B_swishing';
                this.trigger_sound_A = 'sound_A_swishing';
                this.trigger_sound_B = 'sound_B_swishing';
                break;
            case "Scraping on a plate":
                this.miso_trigger = 'scraping_plate';
                this.trigger_image_A = 'image_A_scraping';
                this.trigger_image_B = 'image_B_scraping';
                this.trigger_sound_A = 'sound_A_scraping';
                this.trigger_sound_B = 'sound_B_scraping';
                break;
            case "Sniffing":
                this.miso_trigger = 'sniffing';
                this.trigger_image_A = 'image_A_sniffing';
                this.trigger_image_B = 'image_B_sniffing';
                this.trigger_sound_A = 'sound_A_sniffing';
                this.trigger_sound_B = 'sound_B_sniffing';
                break;
            case "Gulping water":
                this.miso_trigger = 'gulping';
                this.trigger_image_A = 'image_A_gulping';
                this.trigger_image_B = 'image_B_gulping';
                this.trigger_sound_A = 'sound_A_gulping';
                this.trigger_sound_B = 'sound_B_gulping';
                break;
            case "Wet chewing":
                this.miso_trigger = 'wet_chewing';
                this.trigger_image_A = 'image_A_wet_chewing';
                this.trigger_image_B = 'image_B_wet_chewing';
                this.trigger_sound_A = 'sound_A_wet_chewing';
                this.trigger_sound_B = 'sound_B_wet_chewing';
                break;
        }
    }
    // SCREEN 3 (REWARD COMPARISON) FUNCTIONS
    // draw_screen_3(image_key) {
    draw_screen_3() {
        console.log('Reward Comparison Page')

        // Without this function, every key needs to be pressed twice to work
        this.input.keyboard.resetKeys()
        this.keySPACE.enabled = false;

        // Remove all objects currently on the screen
        this.objGroup.clear(true, true);

        // Draw the trial number and score text
        // MISO FLOW TO FINISH:
        this.text_content = 'Let’s take a look at the possible outcomes for each trial.';
        this.screen_num += 1;
        this.draw_screen = true;

        this.text = this.add.text(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2 - 125,
            this.text_content, this.text_params);
        this.text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.text);

        // Draw the strips with money picture that will move during slot machine "spinning"
        var barContainer = this.add.container();
        var bar1 = this.add.sprite(
            this.game.canvas.width / 2 - 100,
            this.game.canvas.height / 2 - 165,
            'misobar');
        bar1.setOrigin(0.5, 0.5);
        var bar2 = this.add.sprite(
            this.game.canvas.width / 2 + 100,
            this.game.canvas.height / 2 - 25,
            'misobar');
        bar2.setOrigin(0.5, 0.5);

        // Add bars to barContainer and move container to location
        barContainer.add([bar1, bar2]);

        //Draw the mask that only shows the square at the center of slot machine
        var graphicsMask = this.make.graphics();
        graphicsMask.fillStyle(0x00ffff);
        graphicsMask.fillRect(0, 0, 2000, 100);
        graphicsMask.x = 0;
        graphicsMask.y = this.game.canvas.height / 2;
        barContainer.mask = new Phaser.Display.Masks.BitmapMask(this, graphicsMask);
        this.objGroup.add(barContainer);

        var barTextContainer = this.add.container();
        var bartext1 = this.add.text(
            this.game.canvas.width / 2 - 100,
            this.game.canvas.height / 2 - 35,
            'LOSS\n(Misophonia Sound)', this.text_params);
        bartext1.setOrigin(0.5, 0.5);
        var bartext2 = this.add.text(
            this.game.canvas.width / 2 + 100,
            this.game.canvas.height / 2 - 35,
            'WIN\n(No Sound)', this.text_params);
        bartext2.setOrigin(0.5, 0.5);
        barTextContainer.add([bartext1, bartext2]);
        this.objGroup.add(barTextContainer);

        var timedEvent = this.time.delayedCall(this.spacebar_delay, this.draw_spacebar, [], this);
    }

    // SCREEN 4 (RATINGS) FUNCTIONS
    draw_screen_4() {
        console.log('Rating Instructions Page')

        // Without this function, every key needs to be pressed twice to work
        this.input.keyboard.resetKeys()
        this.keySPACE.enabled = false;
        this.keyLEFT.enabled = false;
        this.keyRIGHT.enabled = false;

        // Remove all objects currently on the screen
        this.objGroup.clear(true, true);

        this.text_content = 'After some trials, you will be asked to rate your mood.\n\n\n' +
            'Mood is defined as:\n\n'+
            '- A non-specific persistent general feeling about your current mental state\n\n' +
            '- Distinct from emotions, which are short-lived and usually specific to a particular thing.';
        this.text = this.add.text(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2 - 50,
            this.text_content, this.text_params);
        this.text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.text);

        // Set flags to listen for input
        this.display_rating = true;
        this.rating_type = 'mood';

        // Enable keys for selecting mood
        var timedEvent = this.time.delayedCall(this.spacebar_delay, this.draw_spacebar, [], this);
    }

    draw_rating_screen() {
        console.log('Mood rating page')

        // Without this function, every key needs to be pressed twice to work
        this.input.keyboard.resetKeys()
        this.keySPACE.enabled = false;
        this.keyLEFT.enabled = false;
        this.keyRIGHT.enabled = false;

        // Remove all objects currently on the screen
        this.objGroup.clear(true, true);

        // Draw the rating prompt
        var text_content = 'What is your mood right now?\n\n' +
        'Use the LEFT and RIGHT arrow keys to select your rating. Press SPACEBAR to submit.\n' +
        'Try to use the FULL range of values when you rate.'

        this.rating_text = this.add.text(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2 - 150,
            text_content, this.text_params);
        this.rating_text.setOrigin(0.5);
        this.objGroup.add(this.rating_text);

        // Draw the rectangle/circle for the rating bar
        this.r1 = this.add.rectangle(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2 + 20,
            500, 5, 0xffffff);
        this.r1.setOrigin(0.5, 0.5)
        this.objGroup.add(this.r1);
        this.selector = this.add.circle(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2 + 20,
            10, 0xffffff);
        this.objGroup.add(this.selector);
        this.low_text = this.add.text(
            this.game.canvas.width / 2 - 250,
            this.game.canvas.height / 2, 'Low', this.text_params);
        this.low_text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.low_text);
        this.high_text = this.add.text(
            this.game.canvas.width / 2 + 250,
            this.game.canvas.height / 2, 'High', this.text_params);
        this.high_text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.high_text);

        // Set flags to listen for input
        this.rating_incomplete = true;

        // Enable keys for selecting craving
        var timedEvent = this.time.delayedCall(this.spacebar_delay - 2000, this.delayedEnable, [], this);
    }

    delayedEnable() {
        this.keySPACE.enabled = true;
        this.keyLEFT.enabled = true;
        this.keyRIGHT.enabled = true;
    }

    handleRatingMove() {

        // If left key is down, move selector circle to left, if within bounds of bar
        if (this.keyLEFT.isDown) {
            this.keyLEFT.isDown = false;
            if (this.selector.x - 10 >= (this.game.canvas.width - this.r1.width) / 2) {
                this.selector.x = this.selector.x - 10;
                // this.selector_text.setText(((this.selector.x-250)/50).toString())
            }
        }

        // If right key is down, move selector circle to right, if within bounds of bar
        else if (this.keyRIGHT.isDown) {
            this.keyRIGHT.isDown = false;
            if (this.selector.x + 10 <= (this.game.canvas.width - this.r1.width) / 2 + this.r1.width) {
                this.selector.x = this.selector.x + 10;
                // this.selector_text.setText(((this.selector.x-250)/50).toString())
            }
        }
    }

    handleRatingSelect() {

        // Once spacebar is pressed to select the mood rating, execute the following

        // Rating is complete
        this.rating_incomplete = false;

        // Enlarge and change color of selector circle to show selection
        this.selector.setFillStyle(0xe82424);
        this.selector.setRadius(20);

        // Add text to prompt move to next trial
        this.text_content = 'Press SPACEBAR to continue.'
        this.text = this.add.text(
            this.game.canvas.width / 2,
            this.game.height / 2 + 180,
            this.text_content, {
            fontFamily: 'Helvetica',
            fontSize: 20,
            align: 'center'
        });
        this.text.setOrigin(0.5, 0.5)
        this.text.x = this.game.canvas.width / 2;
        this.text.y = this.game.canvas.height / 2 + 180;
        this.objGroup.add(this.text);

        // Go to the end of the instructions to begin the Practice Phase
        if (this.rating_type == 'mood') {
            // Store base rating
            this.base_mood_rating = (this.selector.x - 250) / 10
            this.screen_num += 1;
            this.draw_screen = true;
        } //MISO: probably want to show up as error if it's something other than mood type

    }

    // SCREEN 5 (SLOT MACHINE) FUNCTIONS
    draw_screen_5() {

        console.log('Slot Machine Page')

        // Without this function, every key needs to be pressed twice to work
        this.input.keyboard.resetKeys()

        // Remove all objects currently on the screen
        this.objGroup.clear(true, true);

        // Slot instructions text
        var text_content = 'In each trial, you will be presented with a blue slot machine and a green ' +
            'slot machine. One of these machines is less likely to give a MISOPHONIA TRIGGER than the other. However, the better machine ' +
            'might change during the experiment! Your job is to discover which machine does not give you a misophonia sound!\n\n' +
            'Let’s try spinning one of the machines now.\nPress the RIGHT arrow to spin the slot machine on the right.';
        this.text = this.add.text(this.game.canvas.width / 2,
            this.game.canvas.height / 2 - 150,
            text_content, this.text_params);
        this.text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.text);

        // Draw the left slot machine
        this.slots1 = this.add.sprite(
            this.game.canvas.width / 2 - 130, // X-axis location
            this.game.canvas.height / 2 + 100, // Y-axis location
            'slots');
        this.slots1.setOrigin(0.5, 0.5);
        this.slots1.setTint(0x29c3f1); // blue tinted
        this.slots1.scale = 0.7; // scale the model down
        this.slots1_handle = this.add.circle(
            this.game.canvas.width / 2 - 49,
            this.game.canvas.height / 2 + 30,
            10,
            0xe71212);
        this.slots1_handle.setOrigin(0.5, 0.5);
        // note that location of slot machine is based on size and cropping of picture
        this.objGroup.add(this.slots1);
        this.objGroup.add(this.slots1_handle);

        // Draw the right slot machine
        this.slots2 = this.add.sprite(
            this.game.canvas.width / 2 + 130,
            this.game.canvas.height / 2 + 100,
            'slots');
        this.slots2.setOrigin(0.5, 0.5);
        this.slots2.setTint(0x0ec905); // blue tinted
        this.slots2.scale = 0.7; // scale the model down
        this.slots2_handle = this.add.circle(
            this.game.canvas.width / 2 + 211,
            this.game.canvas.height / 2 + 30,
            10,
            0xe71212);
        this.slots2_handle.setOrigin(0.5, 0.5);
        // note that location of slot machine is based on size and cropping of picture
        this.objGroup.add(this.slots2);
        this.objGroup.add(this.slots2_handle);

        // Draw the strips with money picture that will move during slot machine "spinning"
        var barContainer_left = this.add.container();
        var barContainer_right = this.add.container();
        this.bar1 = this.add.sprite(
            this.game.canvas.width / 2 - 138,
            this.game.canvas.height / 2 + 350,
            'misobar');
        // this.bar1.setOrigin(0.5, 0.5);
        this.bar2 = this.add.sprite(
            this.game.canvas.width / 2 + 122,
            this.game.canvas.height / 2 + 350,
            'misobar');
        // this.bar2.setOrigin(0.5, 0.5);

        // Draw the images that covers the spinning slot machine until selection
        this.shutter1 = this.add.sprite(
            this.game.canvas.width / 2 - 138,
            this.game.canvas.height / 2 + 100,
            'shutter');
        this.shutter1.setOrigin(0.5, 0.5);
        this.shutter1.scale = 0.3333; // scale down
        this.shutter1.setTint(0xe7d012); // set gold tint
        this.shutter2 = this.add.sprite(
            this.game.canvas.width / 2 + 122,
            this.game.canvas.height / 2 + 100,
            'shutter');
        this.shutter2.setOrigin(0.5, 0.5);
        this.shutter2.scale = 0.3333;
        this.shutter2.setTint(0xe7d012);

        // Add the left and right bars and shutters to barContainers
        barContainer_left.add([this.bar1, this.shutter1]);
        barContainer_right.add([this.bar2, this.shutter2]);
        this.objGroup.add(barContainer_left);
        this.objGroup.add(barContainer_right);

        // Draw the mask that only shows the square at the center of slot machine
        // Creates the "spinning" illusion
        var graphicsMask = this.make.graphics();
        graphicsMask.fillStyle(0x00ffff);
        var tempRect = this.add.rectangle(
            this.game.canvas.width / 2 - 188,
            this.game.canvas.height / 2 + 50,
            100, 100);
        tempRect.setOrigin(0.5, 0.5);
        graphicsMask.fillRectShape(tempRect);
        barContainer_left.mask = new Phaser.Display.Masks.BitmapMask(this, graphicsMask);
        var graphicsMask2 = this.make.graphics();
        graphicsMask2.fillStyle(0x00ffff);
        var tempRect2 = this.add.rectangle(
            this.game.canvas.width / 2 + 69,
            this.game.canvas.height / 2 + 50,
            100, 100);
        tempRect2.setOrigin(0.5, 0.5);
        graphicsMask2.fillRectShape(tempRect2);
        barContainer_right.mask = new Phaser.Display.Masks.BitmapMask(this, graphicsMask2);

        // Once the trial page is drawn, enable right to listen for selection
        this.keyLEFT.enabled = false;
        this.right_spin = true;
        this.keyRIGHT.enabled = true;
    }

    startSpinInstructions(slot_num) {
        // Slot_num = 1 -> left slot machine
        // Slot_num = 2 -> right slot machine
        // For each choice, set the appropriate GRW probabilities,
        // Select strip, handle, shutter for animation
        if (slot_num == 1) {
            var success = 1; // failure for left slot machine
            var thisbar = this.bar1;
            var thishandle = this.slots1_handle;
            var thisshutter = this.shutter1;
        } else if (slot_num == 2) {
            var success = 2; // success for right slot machine
            var thisbar = this.bar2;
            thisbar.y -= 150 // set start position for thisbar to correct point
            var thishandle = this.slots2_handle;
            var thisshutter = this.shutter2;
        }

        // Disable all keypresses while animations are active
        this.keyLEFT.isDown = false;
        this.keyRIGHT.isDown = false;
        this.keyLEFT.enabled = false;
        this.keyRIGHT.enabled = false;

        // Add the handle down animation
        this.tweens.add({
            targets: thishandle,
            duration: 500,
            y: thishandle.y + 160
        });

        // Add the shutter up animation
        this.tweens.add({
            targets: thisshutter,
            duration: 500,
            y: thisshutter.y - 100
        });

        // Spinning wheel animation
        // if (debug) {
        //     var spin_dur = 100;
        // }

        var timeline = this.tweens.createTimeline();
        // First spins (fast spins), 5 spins, 1.4s total
        var num_spins_fast = 5;
        timeline.add({
            targets: thisbar,
            y: thisbar.y - 300,
            ease: 'Linear',
            duration: this.basespintime / num_spins_fast,
            // duration: 100/num_spins, // FOR DEBUG
            repeat: num_spins_fast - 1,
        });
        // Second spins (medium spins), 2 spins, 0.9s total
        var num_spins_med = 2;
        timeline.add({
            targets: thisbar,
            y: thisbar.y - 300,
            ease: 'Linear',
            duration: (this.basespintime - 500) / num_spins_med,
            // duration: 100, // FOR DEBUG
            repeat: num_spins_med - 1,
            onStart: function () { thisbar.y += 300 }
        });
        // Final spin (lands on money/nothing image), 0.7s total
        timeline.add({
            targets: thisbar,
            y: thisbar.y - 150 - 25,
            ease: 'Linear',
            duration: this.basespintime - 700,
            // duration: 100*success, // FOR DEBUG
            onStart: function () { thisbar.y += 300 }
        });
        // Handle up animation at the end of spinning
        timeline.add({
            targets: thishandle,
            duration: 200,
            y: thishandle.y,
            onStart: this.onCompleteHandler, // this function executes at the end of the spinning animation
            onStartParams: [this, success, slot_num, thisshutter]
        });
        timeline.play()
    }
    onCompleteHandler(tween, targets, context, success, slot_num, thisshutter) {

        // If it was a winning trial, add the "WINNER!" text on the slot machine image
        if (slot_num == 1) { // NOT WINNING TRIAL

            context.left_spin = false;
            context.screen_num += 1;
            context.draw_screen = true;
            context.input.keyboard.resetKeys()
        }
        else if (slot_num == 2) { // WINNING TRIAL
            var reward_text = context.add.text(context.slots2.x - 40, context.slots1.y - 95, 'WINNER!', { 'color': '#000000' });
            context.objGroup.add(reward_text);
            context.right_complete = true;
        }

        // Draw the text and enable spacebar to advance to next trial/rating
        if (success == 2) {
            context.spacebar_text_content = 'WIN!\nPress SPACEBAR to continue.'
        } else if (success == 1) {
            context.text.destroy(); // clear out instruction text at the top to make room for miso image
            context.spacebar_text_content = 'NO WIN!\nPress SPACEBAR to continue.'
            // Show MISO image
            var miso_image = context.add.sprite(
                context.game.canvas.width/2,
                context.game.canvas.height/2 - 150,
                context.trigger_image_A);
            miso_image.setOrigin(0.5, 0.5).setScale(0.1);
            context.objGroup.add(miso_image);
            // Play MISO sound
            var miso_sound = context.sound.add(context.trigger_sound_A);
            miso_sound.play();

        }
        context.spacebar_text = context.add.text(
            context.game.canvas.width / 2,
            context.game.canvas.height / 2 + 260,
            context.spacebar_text_content, context.text_params);
        context.spacebar_text.setOrigin(0.5, 0.5);
        context.objGroup.add(context.spacebar_text);
        context.keySPACE.enabled = true;
    }
    prepLeft() {
        this.spacebar_text.destroy();
        this.text_content = 'Now try pressing the LEFT arrow to spin the left slot machine.'
        this.text.destroy();
        this.text = this.add.text(this.game.canvas.width / 2,
            this.game.canvas.height / 2 - 150,
            this.text_content, this.text_params);
        this.text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.text);
        this.keySPACE.enabled = false;
        this.keyRIGHT.enabled = false;
        this.keyLEFT.enabled = true;
    }

    // SCREEN 6 (PHONE OFF) FUNCTIONS
    draw_screen_6() {
        console.log('Turn Off Phone Page')

        // Without this function, every key needs to be pressed twice to work
        this.input.keyboard.resetKeys()
        this.keySPACE.enabled = false;

        // Remove all objects currently on the screen
        this.objGroup.clear(true, true);

        // Draw the trial number and score text
        this.text_content = 'This experiment will take about 20 minutes.\n\n' +
        'Please be sure to turn off your cell phone and any other devices that may distract you during the task.';
        this.text = this.add.text(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2 - 50,
            this.text_content, this.text_params);
        this.text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.text);

        var timedEvent = this.time.delayedCall(this.spacebar_delay, this.draw_spacebar, [], this);

        this.screen_num += 1;
        this.draw_screen = true;

    }

    // SCREEN 7 (END INSTRUCTIONS) FUNCTIONS
    draw_screen_7() {
        console.log('End Instructions Page')

        // Without this function, every key needs to be pressed twice to work
        this.input.keyboard.resetKeys()
        this.keySPACE.enabled = false;

        // Remove all objects currently on the screen
        this.objGroup.clear(true, true);

        // Draw the trial number and score text
        this.text_content = 'Now, let’s practice a few times before starting the experiment.\n\n' +
            'Remember, one of the slot machines is less likely to give you a misophonia sound. Over the course of the ' +
            'experiment, the better slot machine (no misophonia sound) might change! Do your best to ' +
            'find out which one it is!';
        this.text = this.add.text(this.game.canvas.width / 2,
            this.game.canvas.height / 2 - 50,
            this.text_content, this.text_params);
        this.text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.text);

        this.save_participant_info();

        var timedEvent = this.time.delayedCall(this.spacebar_delay, this.draw_spacebar, [], this);
        this.screen_num += 1;
        this.to_practice = true;
    }

    save_participant_info() {

        var participant_info = {
            participant_id: this.participant_id,
            miso_trigger: this.miso_trigger,
            reversal_timings: this.reversal_timings,
            base_mood_rating: this.base_mood_rating,
            timestamp: (new Date()).getTime() / 1000
        };
        // Send to Flask's task.py
        console.log('Saving participant data...')
        fetch('/save-participant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(participant_info),
        });
    }

    // UPDATE LOOP
    update(time, delta) {

        // SCREEN 1: INTRODUCTION SCREEN
        if (this.screen_num == 1) {
            if (this.draw_screen) {
                this.draw_screen = false;
                this.draw_screen_1()
            }
        }
        // SCREEN 2: SELECT STIMULI OF CHOICE
        else if (this.screen_num == 2) {
            if (this.draw_screen) {
                if (Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
                    this.draw_screen = false;
                    this.draw_screen_2();
                }
            } else if (this.record_option) {
                // MISO: capture user selection of worst trigger
                if (Phaser.Input.Keyboard.JustDown(this.keyA)) {
                    this.set_trigger_choices(this.choice_A);
                    this.draw_select_box(0);
                    this.draw_spacebar();
                }
                if (Phaser.Input.Keyboard.JustDown(this.keyB)) {
                    this.set_trigger_choices(this.choice_B);
                    this.draw_select_box(1);
                    this.draw_spacebar();
                }
                if (Phaser.Input.Keyboard.JustDown(this.keyC)) {
                    this.set_trigger_choices(this.choice_C);
                    this.draw_select_box(2);
                    this.draw_spacebar();
                }
                if (Phaser.Input.Keyboard.JustDown(this.keyD)) {
                    this.set_trigger_choices(this.choice_D);
                    this.draw_select_box(3);
                    this.draw_spacebar();
                }
                if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                    this.set_trigger_choices(this.choice_E);
                    this.draw_select_box(4);
                    this.draw_spacebar();
                }
                if (Phaser.Input.Keyboard.JustDown(this.keyF)) {
                    this.set_trigger_choices(this.choice_F);
                    this.draw_select_box(5);
                    this.draw_spacebar();
                }
                if (Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
                    if (this.miso_trigger != 'none') {
                        this.confirm_choice();
                    }
                }
            }
        }
        // SCREEN 3: REWARD COMPARISON
        else if (this.screen_num == 3) {
            this.draw_screen_3();
        }
        // SCREEN 4: RATING INSTRUCTIONS
        else if (this.screen_num == 4) {
            if (this.draw_screen) {
                if (Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
                    this.draw_screen = false;
                    this.draw_screen_4();
                }
            } else if (this.display_rating) {
                if (Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
                    this.display_rating = false;
                    this.draw_rating_screen(); // mood rating
                }
            } else if (this.rating_incomplete) {
                if (Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
                    this.rating_incomplete == false;
                    this.handleRatingSelect.call(this);
                } else if (this.keyLEFT.isDown || this.keyRIGHT.isDown) {
                    this.handleRatingMove.call(this);
                }
            }
        }
        // SCREEN 5: SLOTS INSTRUCTIONS
        else if (this.screen_num == 5) {
            if (this.draw_screen) {
                if (Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
                    this.draw_screen = false;
                    this.draw_screen_5();
                }
            } else if (this.right_spin) {
                if (Phaser.Input.Keyboard.JustDown(this.keyRIGHT)) {
                    this.right_spin = false;
                    this.startSpinInstructions(2);
                }
            } else if (this.right_complete) {
                if (Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
                    this.right_complete = false;
                    this.prepLeft();
                    this.left_spin = true;
                }
            } else if (this.left_spin) {
                if (Phaser.Input.Keyboard.JustDown(this.keyLEFT)) {
                    this.left_spin = false;
                    this.startSpinInstructions(1);
                }
            }
        }
        // SCREEN 6: TURN OFF PHONE
        else if (this.screen_num == 6) {
            if (this.draw_screen) {
                if (Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
                    this.draw_screen = false;
                    this.draw_screen_6();
                }
            }
        }
        // SCREEN 7: END INSTRUCTIONS PAGE
        else if (this.screen_num == 7) {
            if (this.draw_screen) {
                if (Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
                    this.draw_screen = false;
                    this.draw_screen_7();
                }
            }
        }
        // SEND TO PRACTICE SCENE
        else if (this.to_practice) {
            if (Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
                this.to_practice = false;
                this.scene.remove();
                var transfer_data = {
                    pid: this.participant_id,
                    reversal_timings: this.reversal_timings,
                    miso_trigger: this.miso_trigger,
                    trigger_image_A: this.trigger_image_A,
                    trigger_image_B: this.trigger_image_B,
                    trigger_sound_A: this.trigger_sound_A,
                    trigger_sound_B: this.trigger_sound_B
                };
                this.scene.add('PracticeScene', PracticeScene, true, transfer_data);
            }
        }
    }
}

var getID = function (scene) {

    if (scene.url_pid == null) {
        var id_text = `Input ID here`;
    } else {
        var id_text = scene.url_pid;
    }
    var id_caption = scene.add.text(
        scene.game.canvas.width / 2 - 220,
        scene.game.canvas.height / 2 - 115,
        'PID:', scene.text_params);
    scene.objGroup.add(id_caption);
    scene.id_text_content = scene.add.text(0, 0, id_text, scene.text_params);
    var id_textbox = createTextBox(scene,
        scene.game.canvas.width / 2 + 100,
        scene.game.canvas.height / 2 - 100,
        scene.id_text_content)
    id_textbox
        .setOrigin(0, 0)
        .setInteractive()
        .on('pointerdown', () => {
            scene.rexUI.edit(scene.id_text_content)
        })
    scene.objGroup.add(id_textbox)

    var buttons = scene.rexUI.add.buttons({
        x: scene.game.canvas.width / 2 - 100, y: scene.game.canvas.height / 2 + 100,
        // width: 100,
        // orientation: 'x',
        buttons: [
            createButton(scene, 'Continue'), // Add button in constructor
        ],
    })
        .layout()
    // .drawBounds(this.add.graphics(), COLOR_LIGHT)
    scene.objGroup.add(buttons)

    buttons
        .on('button.click', () => {
            console.log(`Running task for PID: ${scene.id_text_content.text}`);
            scene.objGroup.clear(true, true);
            scene.participant_id = scene.id_text_content.text;
            scene.draw_screen_1();
        })
}

var createTextBox = function (scene, x, y, text_content) {
    var textBox = scene.rexUI.add.textBox({
        x: x,
        y: y,
        text: text_content,
    })
        .layout();

    return textBox;
}
var createButton = function (scene, text) {
    return scene.rexUI.add.label({
        width: 40,
        height: 40,
        // background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, COLOR_LIGHT),
        text: scene.add.text(0, 0, text, {
            fontFamily: 'Helvetica',
            fontSize: 20,
            'wordWrap': { width: scene.game.canvas.width - 200 },
            'align': 'center'
        }),
        space: {
            left: 10,
            right: 10,
        },
        align: 'center',
        name: text
    });
}
