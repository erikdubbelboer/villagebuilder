// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const RandomMenu = pc.createScript('randommenu');

RandomMenu.prototype.initialize = function () {
    this.isDisabled = false;

    this.app.root.findByName('RandomMenuBlur').button.on('click', () => {
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

    this.app.root.findByName('RandomContinueButton').button.on('click', () => {
        if (this.isDisabled) {
            return;
        }

        this.entity.enabled = false;

        this.app.playSound('menu');
    }, this);

    const randomVideoButton = this.app.root.findByName('RandomVideoButton');

    const giveReward = () => {
        /*randomVideoButton.enabled = false;

        const tiles = Object.keys(this.app.buildingsSeen).filter(t => !!this.app.globals.auras[t]);
        const tile = tiles[Math.floor(Math.random() * tiles.length)];

        this.entity.children[1].children[1].children[0].script.rewardimage.tile = tile;
        this.entity.children[1].children[1].children[0].children[0].enabled = false;

        let prefix = this.app.globals.namePrefixes[tile];
        if (prefix) {
            prefix += ' ';
        }
        this.entity.children[1].children[0].element.text = 'YOU RECEIVED ' + prefix.toUpperCase() + tile.toUpperCase();

        this.entity.children[1].children[3].children[0].element.color = new pc.Color(1, 1, 1, 1);
        this.entity.children[1].children[3].children[0].element.outlineColor = new pc.Color(1, 1, 1, 1);

        this.app.addTile(tile, 1);

        this.app.fire('game:updatebuttons');
        this.app.fire('game:updatesave');

        this.app.root.findByName('RandomGroup').enabled = false;*/
        this.entity.enabled = false;

        /*this.app.buttons.forEach(t => {
            // Loose everything except for your roads.
            if (t.tile !== 'Road') {
                t.count = 0;
            }
        });
        this.app.fire('game:updatebuttons');*/
        this.app.root.children[0].script.plusbutton.addDeck();
    };

    randomVideoButton.button.on('click', () => {
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
                    this.app.playingVideo = true;
                }, 'level-skip', this.app.pointsTier, 'gameplay').then(reward => {
                    this.isDisabled = false;

                    this.app.fire('game:enablecamera');
                    this.app.fire('game:unpausemusic');
                    this.app.playingVideo = false;

                    if (window.GameAnalytics) {
                        GameAnalytics('addAdEvent', 'Show', 'RewardedVideo', 'Poki', 'randommenu');
                    }

                    if (reward) {
                        giveReward();
                    }
                });
            } else if (window.CrazyGames) {
                window.CrazyGames.SDK.ad.requestAd('rewarded', {
                    adFinished: () => {
                        this.isDisabled = false;

                        this.app.fire('game:enablecamera');
                        this.app.fire('game:unpausemusic');

                        if (reward) {
                            giveReward();
                        }
                    },
                    adError: () => {
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

RandomMenu.prototype.onEnable = function () {
    this.app.menuOpen++;

    this.app.fire('game:disablecamera');

    this.app.gameplayStop();

    this.entity.children[1].children[1].children[0].script.rewardimage.tile = 'Empty';
    this.entity.children[1].children[1].children[0].children[0].enabled = true;
    this.entity.children[1].children[3].children[0].element.color = new pc.Color(0.9, 0.9, 0.9, 1);
    this.entity.children[1].children[3].children[0].element.outlineColor = new pc.Color(0.9, 0.9, 0.9, 1);

    if (!this.app.isWithEditor && !window.PokiSDK && !window.CrazyGames) {
        this.entity.children[1].children[2].enabled = false;
        this.entity.children[1].children[0].element.text = 'PLEASE DISABLE YOUR ADBLOCKER';
    } else {
        this.entity.children[1].children[2].enabled = true;
        this.entity.children[1].children[0].element.text = 'WATCH A VIDEO AD TO SKIP TO THE NEXT BUILDINGS';
    }

    if (window.PokiSDK) {
        PokiSDK.customEvent('game', 'showRewardedButton', {
            category: 'level-skip',
            placement: 'gameplay',
        });
    }
};
