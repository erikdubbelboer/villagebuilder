// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Lostmenu = pc.createScript('lostmenu');

Lostmenu.prototype.initialize = function () {
    this.app.keyboard.on(pc.EVENT_KEYUP, event => {
        if (event.key === pc.KEY_ESCAPE) {
            this.app.playSound('menu');

            this.entity.enabled = false;
        }
    });

    const lostRewardButton = this.app.root.findByName('LostRewardButton');
    lostRewardButton.button.on('click', () => {
        PokiSDK.rewardedBreak(() => {
            this.app.fire('game:pausemusic');
        }).then(reward => {
            this.entity.enabled = false;

            this.app.fire('game:unpausemusic');

            if (reward) {
                this.app.root.findByName('Plus').script.plusbutton.addDeck();
            }
        });
    }, this);

    const lostNextLevelButton = this.app.root.findByName('LostNextLevelButton');
    lostNextLevelButton.button.on('click', () => {
        this.app.root.findByName('LevelsMenu').enabled = true;

        this.entity.enabled = false;

        this.app.playSound('menu');
    }, this);

    const lostRestartButton = this.app.root.findByName('LostRestartButton');
    lostRestartButton.button.on('click', () => {
        this.app.switchToLevel(this.app.state.current, true);

        this.entity.enabled = false;

        this.app.playSound('menu');
    }, this);

    this.app.root.findByName('LostContinueButton').button.on('click', () => {
        this.entity.enabled = false;

        this.app.playSound('menu');
    }, this);

    const onEnable = () => {
        this.app.menuOpen++;

        this.app.gameplayStop();

        if (window.PokiSDK && window.PokiSDK.isAdBlocked && !window.PokiSDK.isAdBlocked()) {
            lostRewardButton.enabled = true;
        } else {
            lostRewardButton.enabled = false;
        }

        this.app.fire('tooltip:close');
        this.app.fire('game:disablecamera');

        if (this.app.pointsTier < 20) {
            lostNextLevelButton.parent.children[2] = lostRestartButton;
            lostNextLevelButton.parent.children[3] = lostNextLevelButton;
        } else {
            lostNextLevelButton.parent.children[2] = lostNextLevelButton;
            lostNextLevelButton.parent.children[3] = lostRestartButton;
        }
    };

    this.on('enable', onEnable);
    onEnable();

    this.on('disable', () => {
        this.app.menuOpen--;

        this.app.fire('game:enablecamera');

        if (this.app.menuOpen === 0) {
            this.app.gameplayStart();
        }
    });
};
