import BaseScene from './BaseScene.js';
import MoneyScene from './MoneyScene.js';
import EndScene from './EndScene.js';

export default class OtherScene extends BaseScene {

    constructor() {
        super();
    }

    preload() {

    }

    create(data) {
        this.participant_id = data.pid;
        this.reversal_timings = data.reversal_timings;
        this.miso_trigger = data.miso_trigger;
        this.trigger_image_A = data.trigger_image_A
        this.trigger_image_B = data.trigger_image_B
        this.trigger_sound_A = data.trigger_sound_A
        this.trigger_sound_B = data.trigger_sound_B

        // this.current_block = data.current_block;
        // this.current_block += 1;
        this.block_type = 'miso' // can change to "miso" type?

        super.create();
        console.log('OtherScene loading.');

        if (this.reversal_timings == 'A') {
            // Right better first
            // reversals at 12, 11, 12, 14, 11
            this.probs_1 = [].concat(
                Array(12).fill(0.2),
                Array(11).fill(0.8),
                Array(12).fill(0.2),
                Array(14).fill(0.8),
                Array(11).fill(0.2),
            )
        } else if (this.reversal_timings == 'B') {
            // Right better first
            // reversals at 14, 11, 11, 12, 12
            this.probs_1 = [].concat(
                Array(14).fill(0.2),
                Array(11).fill(0.8),
                Array(11).fill(0.2),
                Array(12).fill(0.8),
                Array(12).fill(0.2),
            )
        } else if (this.reversal_timings == 'C') {
            // Left better first
            // reversals at 12, 11, 12, 14, 11
            this.probs_1 = [].concat(
                Array(12).fill(0.8),
                Array(11).fill(0.2),
                Array(12).fill(0.8),
                Array(14).fill(0.2),
                Array(11).fill(0.8),
            )
        } else if (this.reversal_timings == 'D') {
            // Left better first
            // reversals at 14, 11, 11, 12, 12
            this.probs_1 = [].concat(
                Array(14).fill(0.8),
                Array(11).fill(0.2),
                Array(11).fill(0.8),
                Array(12).fill(0.2),
                Array(12).fill(0.8),
            )
        }
        this.probs_2 = this.probs_1.map(function (value) {
            return 1 - value;
        });

        this.load_start_page();
    }

    load_start_page() {
        // Draws the splash page
        console.log('Loading Miso Splash Page');
        this.keySPACE.enabled = false;
        this.text_content = 'MISO BLOCK'; // used to be "Food block"
        this.text = this.add.text(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2,
            this.text_content, this.text_params);
        this.text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.text); // Reminder that all objects need to be added to this group
        var timedEvent = this.time.delayedCall(this.spacebar_delay, this.draw_trial_page, [], this);
    }

    end_page() {
        // Clear all objects from page
        this.objGroup.clear(true, true);
        // Draw text to show end of task
        this.text_content = //MISO: remove this old text: 'You have completed this block and earned a total of ' + this.score + ' points!\n\n' +
            'Press SPACEBAR to continue.';
        this.text = this.add.text(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2,
            this.text_content, this.text_params);
        this.text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.text);

        // Set restart flag to true
        this.keySPACE.enabled = true;
        this.next_phase = true;
    }

    start_next_phase() {
        this.scene.remove();
        var transfer_data = {
            pid: this.participant_id,
            reversal_timings: this.reversal_timings,
            // current_block: this.current_block, // Not needed unless running multiple blocks
            miso_trigger: this.miso_trigger,
            trigger_image_A: this.trigger_image_A,
            trigger_image_B: this.trigger_image_B,
            trigger_sound_A: this.trigger_sound_A,
            trigger_sound_B: this.trigger_sound_B
        };

        // MISO  - ending because only doing one block total
        this.scene.add('EndScene', EndScene, true, transfer_data);

    }

}
