// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const MainMenu = pc.createScript('mainmenu');

MainMenu.prototype.initialize = function () {
    const menu = this.app.root.findByName('MainMenu');
    const creditsButton = this.app.root.findByName('CreditsButton');
    const decks = this.app.root.findByName('Decks');
    const levelsMenu = this.app.root.findByName('LevelsMenu');
    const creditsMenu = this.app.root.findByName('CreditsMenu');
    const restartButton = this.app.root.findByName('RestartButton');
    const lostMenu = this.app.root.findByName('LostMenu');
    const controlsTooltip = this.app.root.findByName('ControlsTooltip');

    const setMenuEnabled = enabled => {
        menu.enabled = enabled;
        creditsButton.enabled = enabled;

        if (enabled) {
            this.app.menuOpen++;

            this.app.gameplayStop();

            levelsMenu.enabled = false;
            creditsMenu.enabled = false;
            lostMenu.enabled = false;

            restartButton.children[1].enabled = false;

            this.app.fire('game:disablecamera');
            this.app.fire('game:clearhelp');

            if (window.PokiSDK) {
                PokiSDK.customEvent('game', 'segment', { segment: 'mainmenu' });
            }

            if (!this.app.touch) {
                controlsTooltip.enabled = true;
            }
        } else {
            this.app.menuOpen--;

            this.app.fire('game:enablecamera');

            if (this.app.menuOpen === 0) {
                this.app.gameplayStart();
            }

            controlsTooltip.enabled = false;
        }
    };

    this.app.keyboard.on(pc.EVENT_KEYUP, event => {
        if (event.key === pc.KEY_ESCAPE) {
            if (this.app.placingEntity) {
                this.app.playSound('cancel');
                this.app.fire('game:deselect');
            } else if (!decks.enabled) {
                this.app.playSound('menu');
                setMenuEnabled(!menu.enabled);
            }
        }

        if (this.app.isWithEditor) {
            if (event.key === pc.KEY_K) {
                this.app.switchToLevel(this.app.state.current, true, true);
            } else if (event.key === pc.KEY_J) {
                //this.app.root.findByName('LostMenu').enabled = true;
                localStorage.clear();
                location.reload();
            }
        }
    });

    const mainMenuButton = this.app.root.findByName('MainMenuButton');
    mainMenuButton.button.on('click', () => {
        this.app.fire('game:deselect');

        if (decks.enabled) {
            return;
        }

        setMenuEnabled(!menu.enabled);

        this.app.playSound('menu');
    }, this);
    mainMenuButton.button.on('mouseenter', () => {
        this.app.fire('game:disablecamera');
    });
    mainMenuButton.button.on('mouseleave', () => {
        this.app.fire('game:enablecamera');
    });

    /*const orientationChange = () => {
        const style = window.getComputedStyle(document.documentElement);
        const hasNotch = parseInt(style.getPropertyValue('--notch-left') || '-1', 10) > 0;

        const position = mainMenuButton.getLocalPosition();
        position.x = hasNotch ? 60 : 10;
        mainMenuButton.setLocalPosition(position);

        // const mobile = /(?:phone|windows\s+phone|ipod|blackberry|(?:android|bb\d+|meego|silk|googlebot) .+? mobile|palm|windows\s+ce|opera\smini|avantgo|mobilesafari|docomo)/i;
        //const tablet = /(?:ipad|playbook|(?:android|bb\d+|meego|silk)(?! .+? mobile))/i;

        //function detectDevice() {
        //    let device = 'desktop';
        //    if (mobile.test(navigator.userAgent)) {
        //        device = 'mobile';
        //    } else if (tablet.test(navigator.userAgent)) {
        //        device = 'tablet';
        //    }
        //
        //    return device;
        //}
    };

    window.addEventListener('orientationchange', () => {
        orientationChange();
    }, false);

    orientationChange();*/

    this.app.root.findByName('MainMenuBlur').button.on('click', () => {
        setMenuEnabled(false);

        this.app.playSound('menu');
    }, this);

    this.app.root.findByName('ContinueButton').button.on('click', () => {
        setMenuEnabled(false);

        this.app.playSound('menu');
    }, this);

    restartButton.button.on('click', () => {
        setMenuEnabled(false);
        this.app.switchToLevel(this.app.state.current, true, false);

        this.app.playSound('menu');
    }, this);
    restartButton.button.on('mouseenter', () => {
        restartButton.children[1].enabled = true;
    });
    restartButton.button.on('mouseleave', () => {
        restartButton.children[1].enabled = false;
    });

    this.app.root.findByName('LevelsButton').button.on('click', () => {
        levelsMenu.enabled = true;

        setMenuEnabled(false);

        this.app.playSound('menu');
    }, this);

    creditsButton.button.on('click', () => {
        creditsMenu.enabled = true;

        setMenuEnabled(false);

        this.app.playSound('menu');
    }, this);

    // Sound.
    let sound = true;
    try {
        sound = localStorage.getItem('sound') !== '0';
    } catch (ignore) { }
    const soundButton = this.app.root.findByName('SoundButton');

    const updateSound = () => {
        if (sound) {
            this.app.systems.sound.volume = 1;
            soundButton.children[0].element.text = soundButton.children[0].element.text.replace(' ON', ' OFF');
        } else {
            this.app.systems.sound.volume = 0;
            soundButton.children[0].element.text = soundButton.children[0].element.text.replace(' OFF', ' ON');

            if (window.PokiSDK) {
                PokiSDK.customEvent('game', 'segment', { segment: 'soundoff' });
            }
        }
    };
    updateSound();

    soundButton.button.on('click', () => {
        sound = !sound;

        try {
            localStorage.setItem('sound', sound ? '1' : '0');
        } catch (ignore) { }

        updateSound();

        this.app.playSound('menu');
    }, this);

    // Music.
    let music = true;
    try {
        music = localStorage.getItem('music') !== '0';
    } catch (ignore) { }
    const musicButton = this.app.root.findByName('MusicButton');

    const updateMusic = () => {
        if (music) {
            musicButton.children[0].element.text = musicButton.children[0].element.text.replace(' ON', ' OFF');

            this.app.fire('game:restartmusic');
        } else {
            musicButton.children[0].element.text = musicButton.children[0].element.text.replace(' OFF', ' ON');

            this.app.fire('game:stopmusic');

            if (window.PokiSDK) {
                PokiSDK.customEvent('game', 'segment', { segment: 'musicoff' });
            }
        }
    };
    updateMusic();

    musicButton.button.on('click', () => {
        music = !music;

        try {
            localStorage.setItem('music', music ? '1' : '0');
        } catch (ignore) { }

        updateMusic();

        this.app.playSound('menu');
    }, this);
};
