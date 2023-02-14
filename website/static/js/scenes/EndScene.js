import BaseScene from './BaseScene.js'

export default class EndScene extends Phaser.Scene {
// export default class EndScene extends BaseScene {

    constructor() {
        super();
    }

    preload() {

    }

    create(data) {
        // this.reversal_timings = data.reversal_timings;
        // this.current_block = data.current_block;
        // this.current_block += 1;

        // super.create(); // this line was causing errors after changing inheritance from BaseScene to Phaser.Scene

        console.log('EndScene loading.');

        // Set the text params (same as BaseScene)
        this.text_params = {
            fontFamily: 'Helvetica',
            fontSize: 20,
            'wordWrap': { width: this.game.canvas.width - 200 },
            'align': 'center',
        };

        this.end_page();
    }

    end_page() {
        // Clear all objects from page
        this.objGroup = this.add.group();
        this.objGroup.clear(true, true);
        // Draw text to show end of task
        this.text_content = 'You have completed the experiment!\n\n' +
            'Thanks for your participation! The next page should load automatically.';
        this.text = this.add.text(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2 - 200,
            this.text_content, this.text_params);
        this.text.setOrigin(0.5, 0.5);
        this.objGroup.add(this.text);
        this.redcap_enabled = true;

        var timedEvent = this.time.delayedCall(this.spacebar_delay, this.load_redcap, [], this);
    }

    load_redcap() {
        // Redirect to Redcap
        var subID;
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        subID = urlParams.get('prolific_pid'); //make sure this parameter is same as how you defined it in Prolific (aka case sensitive)
        console.log(subID);

        this.direct_content = this.add.text(
            this.game.canvas.width / 2 - 120,
            this.game.canvas.height / 2,
            'If it does not, follow this link.',
            this.text_params);

        var task_id = 'miso-slots-task';
        // new MISO REDCAP URL
        var url = `https://redcap.mountsinai.org/redcap/surveys/?s=C3WYXCNHYFHKC88N` + `&study_id=` + task_id;

        // var url = `https://redcap.mountsinai.org/redcap/surveys/?s=C3WYXCNHYFHKC88N&prolific_pid=` + subID + `&study_id=` + task_id + `&session_id=1`; //embed ID to your red cap
        this.url_content = this.add.text(0, 0, url, {
            fontFamily: 'Helvetica',
            fontSize: 15,
            'wordWrap': { width: 450, useAdvancedWrap: true },
            'align': 'center',
        });

        var linkBox = this.rexUI.add.textBox({
            x: this.game.canvas.width / 2,
            y: this.game.canvas.height / 2 + 100,
            text: this.url_content
        })
            .layout()
            .setOrigin(0, 0)
            .setInteractive()
            .on('pointerdown', () => {
                this.rexUI.edit(this.url_content)
            })
        this.objGroup.add(linkBox)

        var s = window.open(url, '_blank');
        if (s && s.focus) {
            s.focus();
        } else if (!s) {
            window.location.href = url;
        }
    }
}
