// Village Builder (c) by Erik Dubbelboer and Rens Gehling
//
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
//
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const NextLevelMenu = pc.createScript('nextlevelmenu');

NextLevelMenu.prototype.initialize = function () {
    this.app.keyboard.on(pc.EVENT_KEYUP, event => {
        if (event.key === pc.KEY_ESCAPE) {
            this.app.playSound('menu');

            this.entity.enabled = false;
        }
    });

    this.app.root.findByName('NextLevelMenuBlur').button.on('click', () => {
        this.entity.enabled = false;

        this.app.playSound('menu');
    }, this);

    this.nextLevelUnlock1 = this.app.root.findByName('NextLevelUnlock1');
    this.nextLevelUnlock2 = this.app.root.findByName('NextLevelUnlock2');
    this.nextLevelPercentage = this.app.root.findByName('NextLevelPercentage');
    this.nextLevelOnly = this.app.root.findByName('NextLevelOnly');
    const nextLevelContinueButton = this.app.root.findByName('NextLevelContinueButton');

    nextLevelContinueButton.button.on('click', () => {
        this.entity.enabled = false;

        this.app.playSound('menu');
    }, this);

    this.on('enable', this.onEnable, this);
    this.onEnable();

    this.on('disable', () => {
        this.app.menuOpen--;

        this.app.fire('game:enablecamera');

        if (this.app.menuOpen === 0) {
            this.app.gameplayStart();
        }
    });
};

NextLevelMenu.prototype.onEnable = function () {
    this.app.menuOpen++;

    this.app.playSound('completed');

    this.app.fire('game:disablecamera');
    this.app.fire('game:clearhelp');

    this.app.gameplayStop();

    if (!this.app.nextUnlock1 && !this.app.nextUnlock1) {
        this.nextLevelUnlock1.parent.parent.enabled = false;
    } else {
        this.nextLevelUnlock1.parent.parent.enabled = true;

        this.nextLevelUnlock1.script.rewardimage.tile = this.app.nextUnlock1;

        if (!this.app.nextUnlock2) {
            this.nextLevelUnlock2.enabled = false;
        } else {
            this.nextLevelUnlock2.enabled = true;
            this.nextLevelUnlock2.script.rewardimage.tile = this.app.nextUnlock2;
        }
    }

    this.app.root.findByName('NextLevelNumber').element.text = this.app.pointsTier;

    this.nextLevelPercentage.parent.enabled = false;

    fetch('https://vb.dubbelboer.com/level', {
        mode: 'cors',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            level: this.app.pointsTier,
            name: this.app.levelName + '-' + this.app.state.current,
            seed: this.app.levelState.levelSeed,
        }),
    }).then(response => response.json()
    ).then(data => {
        if (!this.entity.enabled) {
            return;
        }

        const percentage = data.percentage;

        this.nextLevelPercentage.element.text = percentage + '%';
        this.nextLevelOnly.enabled = percentage < 10;

        this.nextLevelPercentage.parent.enabled = true;
    }).catch(err => {
        console.log(err);
    });
};
