// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const CompletedMenu = pc.createScript('completedmenu');

CompletedMenu.prototype.initialize = function () {
    this.app.keyboard.on(pc.EVENT_KEYUP, event => {
        if (event.key === pc.KEY_ESCAPE) {
            this.app.playSound('menu');

            this.entity.enabled = false;
        }
    });

    const completedContinueButton = this.app.root.findByName('CompletedContinueButton');
    completedContinueButton.children[1].enabled = false;

    completedContinueButton.button.on('click', () => {
        this.entity.enabled = false;

        this.app.playSound('menu');
    }, this);

    completedContinueButton.button.on('mouseenter', () => {
        completedContinueButton.children[1].enabled = true;
    });
    completedContinueButton.button.on('mouseleave', () => {
        completedContinueButton.children[1].enabled = false;
    });

    this.app.root.findByName('NextLevelButton').button.on('click', () => {
        this.app.root.findByName('LevelsMenu').enabled = true;
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

CompletedMenu.prototype.onEnable = function () {
    this.app.menuOpen++;

    this.app.playSound('completed');

    this.app.fire('game:disablecamera');
    this.app.fire('game:clearhelp');

    this.app.gameplayStop();

    if (this.app.nowUnlocked) {
        this.entity.children[1].children[1].children[0].script.rewardimage.tile = this.app.nowUnlocked;
    }
};
