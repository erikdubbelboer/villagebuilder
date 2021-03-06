// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const UndoMenu = pc.createScript('undomenu');

UndoMenu.prototype.initialize = function () {
    this.app.root.findByName('UndoMenuBlur').button.on('click', () => {
        this.entity.enabled = false;

        this.app.playSound('menu');
    }, this);

    this.app.keyboard.on(pc.EVENT_KEYUP, event => {
        if (event.key === pc.KEY_ESCAPE) {
            this.app.playSound('menu');

            this.entity.enabled = false;
        }
    });

    this.app.root.findByName('UndoContinueButton').button.on('click', () => {
        this.entity.enabled = false;

        this.app.playSound('menu');
    }, this);

    const giveReward = () => {
        this.entity.enabled = false;

        this.app.undoMenuSeen = true;

        this.app.undo();
    };

    this.app.root.findByName('UndoVideoButton').button.on('click', () => {
        if (this.app.isWithEditor || !window.PokiSDK) {
            giveReward();
        } else {
            PokiSDK.rewardedBreak(() => {
                this.app.fire('game:disablecamera');
                this.app.fire('game:pausemusic');
            }).then(reward => {
                this.app.fire('game:enablecamera');
                this.app.fire('game:unpausemusic');

                if (reward) {
                    giveReward();
                }
            });
        }
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

UndoMenu.prototype.onEnable = function () {
    this.app.menuOpen++;

    this.app.fire('game:disablecamera');

    const decks = this.app.root.findByName('Decks');
    if (decks.enabled) {
        decks.enabled = false;
        this.app.root.findByName('Plus').script.plusbutton.putBackDeck();
    }

    if (!this.app.isWithEditor && (!window.PokiSDK || !window.PokiSDK.isAdBlocked || window.PokiSDK.isAdBlocked())) {
        this.entity.children[1].children[1].enabled = false;
        this.entity.children[1].children[0].element.text = 'PLEASE DISABLE YOUR ADBLOCKER';
    } else {
        this.entity.children[1].children[1].enabled = true;
        this.entity.children[1].children[0].element.text = 'WATCH A VIDEO AD TO UNDO YOUR LAST BUILDING';
    }
};
