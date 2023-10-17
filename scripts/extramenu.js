// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const ExtraMenu = pc.createScript('extramenu');

ExtraMenu.prototype.initialize = function () {
    this.isDisabled = false;

    this.app.root.findByName('ExtraMenuBlur').button.on('click', () => {
        if (this.isDisabled) {
            return;
        }

        this.entity.enabled = false;

        this.app.playSound('menu');
    }, this);

    this.app.keyboard.on(pc.EVENT_KEYUP, event => {
        if (this.isDisabled) {
            return;
        }

        if (event.key === pc.KEY_ESCAPE) {
            this.app.playSound('menu');

            this.entity.enabled = false;
        }
    });

    this.app.root.findByName('ExtraContinueButton').button.on('click', () => {
        if (this.isDisabled) {
            return;
        }

        this.entity.enabled = false;

        this.app.playSound('menu');

        //this.app.setExtraBuilding();
        this.app.fire('game:setextrabuilding');
    }, this);

    const giveReward = () => {
        this.entity.enabled = false;

        this.app.addTile(this.app.extraBuilding, 1);

        this.app.fire('game:updatebuttons');
        this.app.fire('game:updatesave');

        //this.app.setExtraBuilding();
        this.app.fire('game:setextrabuilding');
    };

    this.app.root.findByName('ExtraVideoButton').button.on('click', () => {
        if (this.isDisabled) {
            return;
        }

        if (this.app.isWithEditor || (!window.PokiSDK && !window.CrazyGames)) {
            giveReward();
        } else {
            this.isDisabled = true;
            this.app.fire('game:disablecamera');

            if (window.PokiSDK) {
                PokiSDK.rewardedBreak(() => {
                    this.app.fire('game:pausemusic');
                }, 'extra-ability', this.app.extraBuilding, 'gameplay').then(reward => {
                    this.isDisabled = false;

                    this.app.fire('game:enablecamera');
                    this.app.fire('game:unpausemusic');

                    if (window.GameAnalytics) {
                        GameAnalytics('addAdEvent', 'Show', 'RewardedVideo', 'Poki', 'extramenu');
                    }

                    if (reward) {
                        giveReward();
                    }
                });
            } else if (window.CrazyGames) {
                window.CrazyGames.SDK.ad.requestAd('rewarded', {
                    adFinished: () => {
                        console.log('adFinished');

                        this.isDisabled = false;

                        this.app.fire('game:enablecamera');
                        this.app.fire('game:unpausemusic');

                        if (reward) {
                            giveReward();
                        }
                    },
                    adError: () => {
                        console.log('adError');

                        this.isDisabled = false;

                        this.app.fire('game:enablecamera');
                        this.app.fire('game:unpausemusic');
                    },
                    adStarted: () => {
                        this.app.fire('game:pausemusic');
                    },
                });
            }
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

ExtraMenu.prototype.onEnable = function () {
    this.app.menuOpen++;

    this.app.fire('game:disablecamera');

    this.app.gameplayStop();

    if (!this.app.isWithEditor && !window.PokiSDK && !window.CrazyGames) {
        this.entity.children[1].children[1].enabled = false;
        this.entity.children[1].children[0].element.text = 'PLEASE DISABLE YOUR ADBLOCKER';
    } else {
        this.entity.children[1].children[1].enabled = true;
        this.entity.children[1].children[0].element.text = 'WATCH A VIDEO AD TO GET THIS BUILDING';
    }

    this.entity.children[1].children[1].children[0].script.rewardimage.tile = this.app.extraBuilding;

    if (window.PokiSDK) {
        PokiSDK.customEvent('game', 'showRewardedButton', {
            category: 'extra-ability',
            placement: 'gameplay',
        });
    }
};
