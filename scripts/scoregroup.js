// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Scoregroup = pc.createScript('scoregroup');

Scoregroup.prototype.initialize = function () {
    this.app.on('game:fireworks', this.fire, this);

    this.start = 2;

    window.addEventListener('orientationchange', () => {
        this.orientationChange();
    }, false);

    this.orientationChange();
};

Scoregroup.prototype.orientationChange = function () {
    const landscape = (typeof window.orientation === 'undefined') || (Math.abs(window.orientation) === 90);
    const position = this.entity.getLocalPosition();
    position.y = landscape ? 112 : 230;
    this.entity.setLocalPosition(position);
};

Scoregroup.prototype.fire = function () {
    this.start = 0;
};

Scoregroup.prototype.update = function (dt) {
    if (this.start < 1) {
        const scale = 1 + (this.start / 2);
        this.entity.setLocalScale(scale, scale, scale);

        this.start += dt * 5;
    } else if (this.start < 2) {
        const scale = 1.5 - ((this.start - 1) / 2);
        this.entity.setLocalScale(scale, scale, scale);

        this.start += dt * 6;
    }
};
