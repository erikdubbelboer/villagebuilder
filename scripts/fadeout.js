// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Fadeout = pc.createScript('fadeout');

// initialize code called once per entity
Fadeout.prototype.initialize = function () {
    this.timeLeft = 0;

    this.on('enable', this.onEnable, this);
    this.onEnable();

    // Bit hacky, but when we are still visible and we already reach the next level we want to restart the countdown.
    this.app.on('game:fireworks', () => {
        if (this.timeLeft > 0) {
            this.entity.children.forEach(e => {
                e.element.opacity = 1;
                e.element.outlineColor = new pc.Color(1, 1, 1, 1);
            });
            this.timeLeft = 1;
        }
    });
};

Fadeout.prototype.onEnable = function () {
    this.entity.children.forEach(e => {
        e.element.opacity = 1;
        e.element.outlineColor = new pc.Color(1, 1, 1, 1);
    });

    const start = () => {
        if (this.app.decksOpen || this.app.menuOpen > 0) {
            setTimeout(start, 100);
            return;
        }

        setTimeout(() => {
            this.timeLeft = 1;
        }, 5000);
    };

    start();
};

Fadeout.prototype.update = function (dt) {
    if (this.timeLeft <= 0) {
        return;
    }

    this.timeLeft = Math.max(this.timeLeft - (dt / 3), 0);

    this.entity.children.forEach(e => {
        e.element.opacity = this.timeLeft;
        e.element.outlineColor = new pc.Color(1, 1, 1, this.timeLeft);
    });

    if (this.timeLeft <= 0) {
        this.entity.enabled = false;
    }
};
