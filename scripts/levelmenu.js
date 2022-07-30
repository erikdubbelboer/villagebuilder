// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const LevelMenu = pc.createScript('levelmenu');

LevelMenu.prototype.initialize = function () {
    this.tintUnlocked = new pc.Color(1, 1, 1, 1);
    this.tintLocked = new pc.Color(0.953, 0.541, 0.541, 1);

    this.app.keyboard.on(pc.EVENT_KEYUP, event => {
        if (event.key === pc.KEY_ESCAPE) {
            this.app.playSound('menu');

            this.entity.enabled = false;
        }
    });

    this.app.root.findByName('LevelMenuBlur').button.on('click', () => {
        this.entity.enabled = false;

        this.app.playSound('menu');
    }, this);

    this.app.root.findByName('LevelContinueButton').button.on('click', () => {
        this.entity.enabled = false;

        this.app.playSound('menu');
    }, this);

    for (let i = 0; i < 5; i++) {
        const button = this.app.root.findByName('Level' + (i + 1) + 'Button');

        button.button.on('click', () => {
            this.app.playSound('pick');

            this.app.switchToLevel(i, false, false);
        }, this);

        button.button.on('mouseenter', () => {
            if (button.children[3].enabled) {
                button.children[4].enabled = true;
            }
        });
        button.button.on('mouseleave', () => {
            button.children[4].enabled = false;
        });
    }

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

LevelMenu.prototype.onEnable = function () {
    this.app.menuOpen++;

    this.app.fire('game:disablecamera');

    const rewards = [
        'Townhall',
        'Ship',
        'Campfire',
        'Statue',
        'Forest',
    ];

    for (let i = 0; i < 5; i++) {
        const button = this.app.root.findByName('Level' + (i + 1) + 'Button');

        button.element.text = this.app.globals.levelNames[i];

        if (rewards[i]) {
            button.children[3].enabled = true;
            if (this.app.state.unlocked[rewards[i]]) {
                button.children[3].script.fillimage.tile = rewards[i];
                button.children[3].children[0].enabled = false;
                button.children[3].element.color = this.tintUnlocked;
                button.children[4].element.text = 'REWARD UNLOCKED!';
            } else {
                button.children[3].element.color = this.tintLocked;
                button.children[4].element.text = 'REWARD LOCKED';
            }
        } else {
            button.children[3].enabled = false;
        }

        button.children[4].enabled = false;

        let t = '0/20';
        if (this.app.state.levels[i]) {
            t = '' + this.app.state.levels[i].score.pointsTier;
            if (this.app.state.levels[i].score.pointsTier < 20) {
                t = this.app.state.levels[i].score.pointsTier + '/20';
            }
        }

        button.children[2].element.text = '      ' + t;
        button.children[1].element.text = 'LEVEL ' + ' '.repeat(t.length);
        button.children[1].enabled = true;
        button.children[2].enabled = true;
    }
};
