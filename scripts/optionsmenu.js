// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const OptionsMenu = pc.createScript('optionsmenu');

OptionsMenu.prototype.initialize = function () {
    const fullscreenButton = this.app.root.findByName('FullscreenButton');

    if (!window.electronAPI) {
        fullscreenButton.enabled = false;
    } else {
        let fullscreen = false;

        fullscreenButton.button.on('click', () => {
            fullscreen = !fullscreen;

            window.electronAPI.setFullscreen(fullscreen);

            if (fullscreen) {
                fullscreenButton.children[0].element.text = fullscreenButton.children[0].element.text.replace(' ON', ' OFF');
            } else {
                fullscreenButton.children[0].element.text = fullscreenButton.children[0].element.text.replace(' OFF', ' ON');
            }
        });
    }

    this.app.keyboard.on(pc.EVENT_KEYUP, event => {
        if (event.key === pc.KEY_ESCAPE) {
            this.app.playSound('menu');

            this.entity.enabled = false;
            this.app.fire('mainmenu', true);
        }
    });

    this.app.root.findByName('OptionsMenuBlur').button.on('click', () => {
        this.entity.enabled = false;
        this.app.fire('mainmenu', true);

        this.app.playSound('menu');
    }, this);

    this.app.root.findByName('OptionsBackButton').button.on('click', () => {
        this.entity.enabled = false;
        this.app.fire('mainmenu', true);

        this.app.playSound('menu');
    }, this);

    this.on('enable', this.onEnable, this);
    this.on('disable', this.onDisable, this);
    this.onEnable();


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

OptionsMenu.prototype.onEnable = function () {
    this.app.menuOpen++;

    this.app.fire('game:disablecamera');
};

OptionsMenu.prototype.onDisable = function () {
    this.app.menuOpen--;

    this.app.fire('game:enablecamera');

    if (this.app.menuOpen === 0) {
        this.app.gameplayStart();
    }
};
