import game from '../index.js'

// vreate variable for miso images because they are called in multiple methods
    // and this is the only way they will be recognized
// var miso_1A_image;
// var miso_1A_sound;

export default class BaseScene extends Phaser.Scene {

    constructor() {
        super();
    }

    preload() {
    }

    create() {
        var debug = false; //CHANGE BEFORE LAUNCH
        // Define total number of trials
        // 40 for full phase, 2 for debugging
        if (debug == true) {
            this.total_num_trials = 10;
            this.spacebar_delay = 100;
            this.trial_delay = 1000;
            this.basespintime = 100;
        } else {
            this.total_num_trials = 60;
            this.spacebar_delay = 3000;
            this.trial_delay = 1000;
            this.basespintime = 1500;
        }

        console.log('BaseScene loading.');

        this.gametimer = this.time.addEvent({ delay: 6000000, callback: this.onClockEvent, callbackScope: this, repeat: 1 });

        // Set the text params
        this.text_params = {
            fontFamily: 'Helvetica',
            fontSize: 20,
            'wordWrap': { width: this.game.canvas.width - 200 },
            'align': 'center',
        };

        // Keys used to select slot machine and advance to next slide
        this.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyLEFT = this.input.keyboard.addKey('LEFT');
        this.keyRIGHT = this.input.keyboard.addKey('RIGHT');

        // Initialize the flags that advance slides on keypress
        this.trial_incomplete = false; // wait for input during the slots slide
        this.rating_incomplete = false; // wait for rating during the ratings slide
        this.goto_next_trial = false; // wait for spacebar input to advance to next trial
        this.goto_end = false; // wait for spacebar input to advance to end page
        this.goto_rating = false; // wait for spacebar input to advance to next rating
        this.goto_attention = false; // wait for spacebar input to advance to attention check
        this.next_phase = false; // advance the experiment

        // Initialize the trial number counter and score
        this.trial_num = 0;

        // objGroup is a Phaser group that contains all the objects on a displayed page
        // It is cleared every time a new page is loaded
        this.objGroup = this.add.group();

        // Initialize mood/attention rating trials
        // 60 trials, poisson-distributed at lambda=3
        // 1 - attention check
        // 2 - mood rating

        // MISO TRIALS (switch any non-zero number, except 1, into a 2 to make it mood trial only)
        this.rating_trials = [
            0, 2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0,
            2, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 2,
            2, 0, 0, 0, 2, 0, 2, 2, 0, 2, 0, 1,
            2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0,
            2, 0, 2, 0, 0, 2, 2, 0, 0, 0, 0, 2];

        // Initialize spin speeds
        this.spinspeed = [
            1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2,
            1, 2, 1, 1, 2, 2, 2, 1, 1, 2, 2, 2,
            1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2,
            1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 1, 2,
            1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2];
    }

    update(time, delta) {
        // Check the active flags in every update cycle to determine what action to take
        if (this.next_phase == true) {
            if (Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
                this.next_phase = false;
                this.goto_next_trial = true;
                this.start_next_phase();
            }
        }
        // Check if current trial is a rating trial
        else if (this.check_trial) {
            this.check_trial = false;

            this.rating_code = this.rating_trials[this.trial_num - 1];
            if (this.rating_code == 0) { // Do this for non-rating trials
                this.rating_type = 'none';
                this.save_trial_flag = true;
            }
            else { // Do this if there is a rating trial to do
                if (this.rating_code == 1) {
                    this.rating_type = 'attention';
                } else if (this.rating_code == 2) {
                    this.rating_type = 'mood';
                }
                this.goto_rating = true;
            }
        }
        // Check if current trial is the last trial of the series
        else if (this.save_trial_flag) {
            this.save_trial_flag = false;
            this.save_trial_data();
            if (this.trial_num == this.total_num_trials) {
                this.goto_end = true;
            } else {
                this.goto_next_trial = true;
            }
        }
        // If goto_next is active, spacebar advances to next trial and increments the trial number
        else if (this.goto_next_trial) {
            this.goto_next_trial = false;
            var timedEvent = this.time.delayedCall(this.trial_delay, this.draw_trial_page, [], this);
        }
        // if goto_attention is active, spacebar advances to attention check WITHOUT incrementing trial number
        else if (this.goto_rating) {
            this.goto_rating = false;
            var timedEvent = this.time.delayedCall(this.trial_delay, this.draw_rating_page, [this.rating_type], this);
        }

        else if (this.goto_end == true) {
            this.goto_end = false;
            var timedEvent = this.time.delayedCall(this.trial_delay, this.end_page, [], this);
        }

        else if (this.redcap_enabled == true) {
            if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('P'))) {
                console.log('Manually moving to redcap');
                this.load_redcap();
            }
        }
        // if trial_incomplete is active, left/right selects a slot machine and locks the keys
        else if (this.trial_incomplete == true) {
            if (this.keyLEFT.isDown) {
                this.startSpin.call(this, 1);
            } else if (this.keyRIGHT.isDown) {
                this.startSpin.call(this, 2);
            }
        }
        // if rating_incomplete is active, left/right moves slider, spacebar selects rating and locks keys
        else if (this.rating_incomplete == true) {
            if (Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
                this.handleRatingSelect();
            } else if (this.keyLEFT.isDown || this.keyRIGHT.isDown) {
                this.handleRatingMove();
            }
        }
    }

    draw_trial_page() {
        // increment trial_num
        this.trial_num += 1;
        // Record cue presentation
        this.cue_time = (new Date()).getTime() / 1000

        // Set mood and craving rating to -1 by default
        this.mood_rating = -1;
        // this.craving_rating = -1;

        // Without this function, every key needs to be pressed twice to work
        this.input.keyboard.resetKeys()

        // Remove all objects currently on the screen
        this.objGroup.clear(true, true);

        // Disable spacebar to prevent advancing until the trial is complete
        this.keySPACE.enabled = false;

        // Set offset
        var y_offset = -70

        // Draw the left slot machine
        this.slots1 = this.add.sprite(
            this.game.canvas.width / 2 - 130,
            this.game.canvas.height / 2 + 100 + y_offset,
            'slots');
        this.slots1.setOrigin(0.5, 0.5);
        this.slots1.setTint(0x29c3f1); // blue tinted
        this.slots1.scale = 0.7; // scale the model down
        this.slots1_handle = this.add.circle(
            this.game.canvas.width / 2 - 49,
            this.game.canvas.height / 2 + 30 + y_offset,
            10,
            0xe71212);
        this.slots1_handle.setOrigin(0.5, 0.5);
        // note that location of slot machine is based on size and cropping of picture
        this.objGroup.add(this.slots1);
        this.objGroup.add(this.slots1_handle);

        // Draw the right slot machine
        this.slots2 = this.add.sprite(
            this.game.canvas.width / 2 + 130,
            this.game.canvas.height / 2 + 100 + y_offset,
            'slots');
        this.slots2.setOrigin(0.5, 0.5);
        this.slots2.setTint(0x0ec905); // blue tinted
        this.slots2.scale = 0.7; // scale the model down
        this.slots2_handle = this.add.circle(
            this.game.canvas.width / 2 + 211,
            this.game.canvas.height / 2 + 30 + y_offset,
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
            this.game.canvas.height / 2 + 350 + y_offset,
            'misobar');
        // this.bar1.setOrigin(0.5, 0.5);
        this.bar2 = this.add.sprite(
            this.game.canvas.width / 2 + 122,
            this.game.canvas.height / 2 + 350 + y_offset,
            'misobar');
        // this.bar2.setOrigin(0.5, 0.5);

        // Draw the images that covers the spinning slot machine until selection
        this.shutter1 = this.add.sprite(
            this.game.canvas.width / 2 - 138,
            this.game.canvas.height / 2 + 100 + y_offset,
            'shutter');
        this.shutter1.setOrigin(0.5, 0.5);
        this.shutter1.scale = 0.3333; // scale down
        this.shutter1.setTint(0xe7d012); // set gold tint
        this.shutter2 = this.add.sprite(
            this.game.canvas.width / 2 + 122,
            this.game.canvas.height / 2 + 100 + y_offset,
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
            this.game.canvas.height / 2 + 50 + y_offset,
            100, 100);
        tempRect.setOrigin(0.5, 0.5);
        graphicsMask.fillRectShape(tempRect);
        barContainer_left.mask = new Phaser.Display.Masks.BitmapMask(this, graphicsMask);
        var graphicsMask2 = this.make.graphics();
        graphicsMask2.fillStyle(0x00ffff);
        var tempRect2 = this.add.rectangle(
            this.game.canvas.width / 2 + 69,
            this.game.canvas.height / 2 + 50 + y_offset,
            100, 100);
        tempRect2.setOrigin(0.5, 0.5);
        graphicsMask2.fillRectShape(tempRect2);
        barContainer_right.mask = new Phaser.Display.Masks.BitmapMask(this, graphicsMask2);

        // Once the trial page is drawn, enable left/right to listen for selection
        this.keyLEFT.enabled = true;
        this.keyRIGHT.enabled = true;

        // Enable the trial_incomplete flag, and disallow moving to next trial
        this.trial_incomplete = true;
        this.goto_next_trial = false;
    }

    startSpin(slot_num) {
        if (this.spinspeed[this.trial_num - 1] == 2) {
            this.trial_speed = 'slow';
        } else {
            this.trial_speed = 'fast';
        }

        // Slot_num = 1 -> left slot machine
        // Slot_num = 2 -> right slot machine
        // For each choice, set the appropriate probabilities,
        // Select strip, handle, shutter for animation

        if (slot_num == 1) {
            this.action = 0;
            var doorprobs = this.probs_1;
            var thisbar = this.bar1;
            var thishandle = this.slots1_handle;
            var thisshutter = this.shutter1;
        } else if (slot_num == 2) {
            this.action = 1;
            var doorprobs = this.probs_2;
            var thisbar = this.bar2;
            var thishandle = this.slots2_handle;
            var thisshutter = this.shutter2;
        }
        this.action_time = (new Date()).getTime() / 1000

        // Compare random number to probs to obtain trial success or failure

        var random_num = Phaser.Math.FloatBetween(0, 1);
        console.log(random_num);
        if (random_num < doorprobs[this.trial_num - 1]) {
            this.reward = 1;
            // console.log(doorprobs[this.trial_num - 1], random_num, 'success');
            thisbar.y -= 150
        }
        else {
            // console.log(doorprobs[this.trial_num - 1], random_num, 'failure');
            this.reward = 0;
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
        // First spins (fast spins), 5 spins, 1.5s total
        var timeline = this.tweens.createTimeline();
        var num_spins_fast = 5;
        timeline.add({
            targets: thisbar,
            y: thisbar.y - 300,
            ease: 'Linear',
            duration: this.basespintime / num_spins_fast,
            repeat: num_spins_fast - 1,
        });
        // Second spins (medium spins), 2 spins, 1.0s fast trials, 2.5s slow trials
        var num_spins_med = 2;
        if (this.spinspeed[this.trial_num - 1] == 2) {
            num_spins_med += 3;
        }
        timeline.add({
            targets: thisbar,
            y: thisbar.y - 300,
            ease: 'Linear',
            duration: this.basespintime - 1000,
            // duration: 100, // FOR DEBUG
            repeat: num_spins_med - 1,
            onStart: function () { thisbar.y += 300 }
        });
        // Final spin (lands on money/nothing image), 0.5s total
        timeline.add({
            targets: thisbar,
            y: thisbar.y - 150 - 25,
            ease: 'Linear',
            duration: this.basespintime - 1000,
            // duration: 100*success, // FOR DEBUG
            onStart: function () { thisbar.y += 300 }
        });
        // Handle up animation at the end of spinning
        timeline.add({
            targets: thishandle,
            duration: 200,
            y: thishandle.y,
            onStart: this.onCompleteHandler, // this function executes at the end of the spinning animation
            onStartParams: [this, this.reward, slot_num, thisshutter]
        });
        timeline.play()
    }

    draw_corner_square() {
        this.corner = this.add.rectangle(0, this.game.canvas.height - 175,
            175, 175, 0xffffff);
        this.corner.setOrigin(0);
        this.objGroup.add(this.corner);
    }

    save_trial_data() {
        var trial_data = {
            participant_id: this.participant_id,
            trial_num: this.trial_num,
            cue_time: this.cue_time,
            action: this.action,
            action_time: this.action_time,
            reward: this.reward,
            reward_time: this.reward_time,
            trial_speed: this.trial_speed,
            mood_rating: this.mood_rating,
            attention_rating: this.attention_rating
        };
        // Send to Flask view
        fetch('/save-trial-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trial_data),
        });
    }

    onCompleteHandler(tween, targets, context, success, slot_num, thisshutter) {

        // Trial is complete
        context.trial_incomplete = false;

        // Record reward presentation time
        context.reward_time = (new Date()).getTime() / 1000

        // If it was a winning trial, add the "WINNER!" text on the slot machine image
        if (success == 1) {
            if (slot_num == 1) {
                var reward_text = context.add.text(
                    context.slots1.x - 40,
                    context.slots1.y - 95,
                    'WINNER!', { 'color': '#000000' });
                context.objGroup.add(reward_text);
            }
            else if (slot_num == 2) {
                var reward_text = context.add.text(
                    context.slots2.x - 40,
                    context.slots1.y - 95,
                    'WINNER!', { 'color': '#000000' });
                context.objGroup.add(reward_text);
            }
        }
        else if (success == 0) {
            // Randomize which miso image and sound to use
            var x = (Math.floor(Math.random() * 2) == 0);
            console.log("Randomizer result: " + x)
            if (x) {
                var miso_image = context.add.sprite(
                    context.game.canvas.width/2,
                    context.game.canvas.height/2 - 200,
                    context.trigger_image_A);
                var miso_sound = context.sound.add(context.trigger_sound_A);
            } else {
                var miso_image = context.add.sprite(
                    context.game.canvas.width/2,
                    context.game.canvas.height/2 - 200,
                    context.trigger_image_B);
                var miso_sound = context.sound.add(context.trigger_sound_B);
            }
            // Show miso image and play sound
            miso_image.setOrigin(0.5, 0.5).setScale(0.1);
            context.objGroup.add(miso_image);
            miso_sound.play();
        }
        // If it is a rating trial, defined in scene constructor, activate the rating page, otherwise go to next trial
        // context.draw_corner_square();
        context.check_trial = true;
    }

    draw_rating_page(rating_type) {
        console.log('Rating for ' + this.rating_type)

        // Without this function, every key needs to be pressed twice to work
        this.input.keyboard.resetKeys();

        // Remove all objects currently on the screen
        this.objGroup.clear(true, true);

        // Draw the rating prompt
        // 1 - Attention check
        if (rating_type == 'attention') {
            var text_content = 'Select the highest option if you are paying attention.'
        } // 2 - Mood check
        else if (rating_type == 'mood') {
            var text_content = 'What is your mood right now?';
        }

        this.rating_text = this.add.text(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2 - 50,
            text_content, this.text_params);
        this.rating_text.setOrigin(0.5);
        this.objGroup.add(this.rating_text);

        // Draw the rectangle/circle for the rating bar
        this.r1 = this.add.rectangle(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2 + 50,
            500, 5, 0xffffff);
        this.objGroup.add(this.r1);
        this.selector = this.add.circle(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2 + 50,
            10, 0xffffff);
        this.objGroup.add(this.selector);
        this.low_text = this.add.text(
            this.game.canvas.width / 2 - 250,
            this.game.canvas.height / 2 + 20, 'Low', this.text_params);
        this.low_text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.low_text);
        this.high_text = this.add.text(
            this.game.canvas.width / 2 + 250,
            this.game.canvas.height / 2 + 20, 'High', this.text_params);
        this.high_text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.high_text);

        // Set flags to listen for input
        this.trial_incomplete = false;
        this.goto_next_trial = false;
        this.rating_incomplete = true;

        // Enable keys for selecting craving
        this.keySPACE.enabled = true;
        this.keyLEFT.enabled = true;
        this.keyRIGHT.enabled = true;
    }

    handleRatingSelect() {
        // Once spacebar is pressed to select the rating, execute the following

        // Rating is complete
        this.rating_incomplete = false;

        // Save the rating based on location of circle on bar
        // Scaled and pushed to ratings array
        if (this.rating_type == 'attention') {
            this.attention_rating = (this.selector.x - 250) / 10;
        }
        else if (this.rating_type == 'mood') {
            this.mood_rating = (this.selector.x - 250) / 10;
        }

        // Enlarge and change color of selector circle to show selection
        this.selector.setFillStyle(0xe82424);
        this.selector.setRadius(20);

        // Check if current trial is the last trial; if not, allow moving to next tria; //MISO REMOVED IF ELSE FLOW
        this.save_trial_flag = true;
    }

    handleRatingMove() {

        // If left key is down, move selector circle to left, if within bounds of bar
        if (this.keyLEFT.isDown) {
            this.keyLEFT.isDown = false;
            if (this.selector.x - 10 >= (this.game.canvas.width - this.r1.width) / 2) {
                this.selector.x = this.selector.x - 10;
            }
        }

        // If right key is down, move selector circle to right, if within bounds of bar
        else if (this.keyRIGHT.isDown) {
            this.keyRIGHT.isDown = false;
            if (this.selector.x + 10 <= (this.game.canvas.width - this.r1.width) / 2 + this.r1.width) {
                this.selector.x = this.selector.x + 10;
            }
        }
    }

}
