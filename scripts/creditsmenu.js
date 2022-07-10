// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const CreditsMenu = pc.createScript('creditsmenu');

CreditsMenu.prototype.initialize = function () {
    this.menu = this.app.root.findByName('CreditsMenu');

    this.app.keyboard.on(pc.EVENT_KEYUP, event => {
        if (event.key === pc.KEY_ESCAPE) {
            this.app.playSound('menu');

            this.menu.enabled = false;
        }
    });

    this.app.root.findByName('CreditsBlur').button.on('click', () => {
        this.menu.enabled = false;

        this.app.playSound('menu');
    }, this);

    this.app.root.findByName('CreditsContinueButton').button.on('click', () => {
        this.menu.enabled = false;

        this.app.playSound('menu');
    }, this);

    this.on('enable', this.onEnable, this);
    this.on('disable', this.onDisable, this);
    this.onEnable();
};

CreditsMenu.prototype.onEnable = function () {
    this.app.menuOpen++;

    this.app.fire('game:disablecamera');
};

CreditsMenu.prototype.onDisable = function () {
    this.app.menuOpen--;

    this.app.fire('game:enablecamera');

    if (this.app.menuOpen === 0) {
        this.app.gameplayStart();
    }
};
