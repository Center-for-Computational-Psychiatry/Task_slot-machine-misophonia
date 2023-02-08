import BaseScene from './BaseScene.js'
import OtherScene from './OtherScene.js';
import EndScene from './EndScene.js'

export default class MoneyScene extends BaseScene {

    constructor() {
        super('moneybar');
    }

    preload() {

    }

    create(data) {
        this.participant_id = data.pid;
        this.other_key = data.other_key;
        this.block_order = data.block_order;
        this.reversal_timings = data.reversal_timings;

        this.current_block = data.current_block;
        this.current_block += 1;
        this.block_type = 'money'

        super.create();
        console.log('MoneyScene loading.');

        if (this.reversal_timings == 'A') {
            // Left better first
            // reversals at 12, 11, 12, 14, 11
            this.probs_1 = [].concat(
                Array(12).fill(0.8),
                Array(11).fill(0.2),
                Array(12).fill(0.8),
                Array(14).fill(0.2),
                Array(11).fill(0.8),
            )
        } else if (this.reversal_timings == 'B') {
            // Left better first
            // reversals at 14, 11, 11, 12, 12
            this.probs_1 = [].concat(
                Array(14).fill(0.8),
                Array(11).fill(0.2),
                Array(11).fill(0.8),
                Array(12).fill(0.2),
                Array(12).fill(0.8),
            )
        } else if (this.reversal_timings == 'C') {
            // Right better first
            // reversals at 12, 11, 12, 14, 11
            this.probs_1 = [].concat(
                Array(12).fill(0.2),
                Array(11).fill(0.8),
                Array(12).fill(0.2),
                Array(14).fill(0.8),
                Array(11).fill(0.2),
            )
        } else if (this.reversal_timings == 'D') {
            // Right better first
            // reversals at 14, 11, 11, 12, 12
            this.probs_1 = [].concat(
                Array(14).fill(0.2),
                Array(11).fill(0.8),
                Array(11).fill(0.2),
                Array(12).fill(0.8),
                Array(12).fill(0.2),
            )
        }
        this.probs_2 = this.probs_1.map(function (value) {
            return 1 - value;
        });

        this.load_start_page();
    }

    load_start_page() {
        // Draws the splash page
        console.log('Loading Money Splash Page');
        this.keySPACE.enabled = false;
        this.text_content = 'MONEY BLOCK';
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
        this.text_content = 'You have completed this block and earned a total of ' + this.score + ' points!\n\n' +
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
            other_key: this.other_key,
            block_order: this.block_order,
            reversal_timings: this.reversal_timings,
            current_block: this.current_block
        };
        if (this.block_order[this.current_block] == 'end') {
            this.scene.add('EndScene', EndScene, true, transfer_data);
        } else if (this.block_order[this.current_block] == 'other') {
            this.scene.add('OtherScene', OtherScene, true, transfer_data);
        }
    }
}