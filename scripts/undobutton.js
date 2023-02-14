// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const UndoButton = pc.createScript('undobutton');

UndoButton.prototype.initialize = function () {
    this.entity.button.on('click', this.onSelect, this);
    if (this.app.touch) {
        this.entity.button.on('touchstart', this.onTouchStart, this);
        this.entity.button.on('touchend', this.onTouchEnd, this);
    }

    this.entity.button.on('mouseenter', this.onHoverStart, this);
    this.entity.button.on('mouseleave', this.onHoverEnd, this);

    this.touchStarted = 0;

    this.onHoverEnd();

    this.undoMenu = this.app.root.findByName('UndoMenu');

    this.isDisabled = false;

    this.on('enable', () => {
        if (this.app.undoMenuSeen) {
            if (window.PokiSDK) {
                PokiSDK.customEvent('game', 'rewardedButton', 'show', {
                    category: 'revive',
                    placement: 'gameplay',
                });
            }
        }
    });
};

UndoButton.prototype.onSelect = function () {
    if (this.app.touch && this.touchStarted + 500 < performance.now()) {
        return;
    }
    if (this.isDisabled) {
        return;
    }

    this.entity.parent.setLocalScale(1, 1, 1);

    this.app.playSound('pick');

    this.app.fire('game:deselect');
    this.app.fire('tooltip:close');

    this.onHoverEnd();

    if (!this.app.undoMenuSeen) {
        this.undoMenu.enabled = true;
    } else {
        if (this.app.isWithEditor || !window.PokiSDK) {
            this.app.undo();
        } else {
            this.app.fire('game:disablecamera');

            let buildingTile = '';
            if (this.app.undoState && this.app.undoState.lastTile) {
                buildingTile = this.app.undoState.lastTile.buildingTile;
            }

            this.isDisabled = true;
            PokiSDK.rewardedBreak(() => {
                this.app.fire('game:pausemusic');
            }, 'revive', buildingTile, 'gameplay').then(reward => {
                this.app.fire('game:enablecamera');
                this.app.fire('game:unpausemusic');

                if (reward) {
                    this.app.undo();
                }

                this.isDisabled = false;
            });
        }
    }
};

UndoButton.prototype.onTouchStart = function () {
    this.touchStarted = performance.now();
    this.onHoverStart();
};

UndoButton.prototype.onTouchEnd = function () {
    this.onHoverEnd();
};

UndoButton.prototype.onHoverStart = function () {
    this.entity.parent.children[2].enabled = true;
    this.entity.parent.setLocalScale(1.1, 1.1, 1.1);

    this.app.noPickerHover = true;
};

UndoButton.prototype.onHoverEnd = function () {
    this.entity.parent.children[2].enabled = false;
    this.entity.parent.setLocalScale(1, 1, 1);

    this.app.noPickerHover = false;
};
