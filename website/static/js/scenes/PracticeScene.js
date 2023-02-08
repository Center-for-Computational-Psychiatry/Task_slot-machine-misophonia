import { saveTrialData } from '../util.js';
import BaseScene from './BaseScene.js'
import MoneyScene from './MoneyScene.js'
import OtherScene from './OtherScene.js';

export default class PracticeScene extends BaseScene {

    constructor() {
        super();
    }

    preload() {
        console.log(this.miso_trigger)
    }

    create(data) {
        this.participant_id = data.pid;
        this.miso_trigger = data.miso_trigger;
        this.reversal_timings = data.reversal_timings;
        this.trigger_image_A = data.trigger_image_A
        this.trigger_image_B = data.trigger_image_B
        this.trigger_sound_A = data.trigger_sound_A
        this.trigger_sound_B = data.trigger_sound_B

        // this.current_block = 0; // Not needed unless running multiple blocks
        // this.block_type = 'practice'; // Already accounted for in data save
        this.total_num_trials = 5;

        super.create();
        console.log('Practice Scene loading.');

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
        console.log('Loading Practice Splash Page');
        this.keySPACE.enabled = false;
        this.text_content = 'PRACTICE SESSION';
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
        this.text_content = 'You have completed the practice!\n\nPress SPACEBAR to continue to the experiment.'
        this.text = this.add.text(this.game.canvas.width / 2,
            this.game.canvas.height / 2,
            this.text_content, this.text_params);
        this.text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.text);

        if (this.pav) {
            this.save_practice_block();
        }
        this.time.removeEvent(this.gametimer);

        // Set restart flag to true
        this.next_phase = true;
        this.keySPACE.enabled = true;
    }

    save_practice_block() {
        // Save ratings, score, choices, time elapsed
        console.log(this.ratings);
        console.log(this.gametimer.getElapsedSeconds())
        this.registry.set("practice_phase", {
            prolific_id: this.prolific_id,
            phase: 'practice',
            attention_responses: this.attention_responses,
            mood_ratings: this.mood_ratings,
            outcomes: this.outcomes,
            choices: this.presses,
            choicetimes: this.presstimes,
            cuetimes: this.cuepresentations,
            rewardtimes: this.rewardpresentations,
            timeelapsed: this.gametimer.getElapsedSeconds()
        });
        saveTrialData(this.registry.get(`practice_phase`));
    }

    start_next_phase() {
        this.scene.remove();
        // this.current_block = 0; // Not needed unless running multiple blocks
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

        //MISO changed flow to only other page
        this.scene.add('OtherScene', OtherScene, true, transfer_data);
    }
}
