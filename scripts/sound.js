// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Sound = pc.createScript('sound');

Sound.attributes.add('music', {
    type: 'asset',
    //assetType: 'audio', // If we do this we can't select .opus files as Playcanvas doesn't support .opus yet.
    array: true
});

Sound.prototype.initialize = function () {
    this.app.playSound = sound => {
        this.entity.sound.play(sound);
    };

    this.startMusicSystem();
};

Sound.prototype.startMusicSystem = function () {
    this.musicAudio = {};
    this.currentMusic = null;
    this.stopped = false;

    try {
        this.stopped = localStorage.getItem('music') === '0';
    } catch (ignore) { }

    this.app.on('game:restartmusic', () => {
        this.stopped = false;
        this.restartMusic();
    });

    this.app.on('game:stopmusic', () => {
        this.stopped = true;
        this.stopMusic();
    });

    this.paused = false;
    this.app.on('game:pausemusic', () => {
        if (!this.paused) {
            this.paused = true;
            this.stopMusic();
        }
    });
    this.app.on('game:unpausemusic', () => {
        if (this.paused) {
            this.paused = false;
            this.playMusic();
        }
    });

    this.app.on('game:levelloaded', () => {
        this.restartMusic();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            if (!this.paused) {
                this.playMusic();
            }
        } else {
            this.stopMusic();
        }
    });

    // Only pause the music when the users switches to a different tab.
    // Don't pause it when they go away from their browser, in that case we want to lure them back!
    /*window.addEventListener('blur', () => {
        this.stopMusic();
    });
    window.addEventListener('focus', () => {
        if (this.paused === 0) {
            this.playMusic();
        }
    });*/

    this.restartMusic();
};

Sound.prototype.stopMusic = function () {
    if (this.currentMusic) {
        this.currentMusic.pause();
    }
};

Sound.prototype.restartMusic = function () {
    this.stopMusic();

    this.playRandomMusic();
};

Sound.prototype.playRandomMusic = function () {
    if (this.stopped) {
        return;
    }

    let music = this.music[Math.floor(Math.random() * this.music.length)];

    if (!this.musicAudio[music.name]) {
        const a = new Audio(music.getFileUrl());

        a.autoplay = false;
        a.preload = 'auto';
        a.volume = 0.3;

        a.addEventListener('canplaythrough', () => {
            setTimeout(() => {
                this.playMusic();
            }, 1000);
        }, false);

        a.addEventListener('ended', () => {
            this.playRandomMusic();
        }, false);

        this.musicAudio[music.name] = a;
        this.currentMusic = a;
    } else {
        this.currentMusic = this.musicAudio[music.name];

        this.currentMusic.currentTime = 0;

        this.playMusic();
    }
};

Sound.prototype.playMusic = function () {
    if (this.stopped) {
        return;
    }
    if (!this.currentMusic) {
        return;
    }
    if (!this.currentMusic.paused) {
        return;
    }

    this.currentMusic.play()
        .catch(() => {
            const tryPlay = () => {
                document.removeEventListener('touchstart', tryPlay, true);
                document.removeEventListener('touchend', tryPlay, true);
                document.removeEventListener('click', tryPlay, true);
                document.removeEventListener('keydown', tryPlay, true);

                this.playMusic();
            };

            document.addEventListener('touchstart', tryPlay, true);
            document.addEventListener('touchend', tryPlay, true);
            document.addEventListener('click', tryPlay, true);
            document.addEventListener('keydown', tryPlay, true);
        });
};
