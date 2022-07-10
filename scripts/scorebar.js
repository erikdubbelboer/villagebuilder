// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const ScoreBar = pc.createScript('scorebar');

ScoreBar.prototype.initialize = function () {
    this.app.on('game:fireworks', this.fire, this);

    this.start = 2;

    window.addEventListener('resize', () => {
        this.onWindowResize();
    }, false);
    this.onWindowResize();
};

ScoreBar.prototype.onWindowResize = function () {
    const width = this.app.graphicsDevice.width;
    const m = Math.min(Math.max((width - 600) / 2, 50), 200);
    this.entity.element.margin = new pc.Vec4(m, this.entity.element.margin.y, m, this.entity.element.margin.w);
};

ScoreBar.prototype.fire = function () {
    this.start = 0;
};

ScoreBar.prototype.update = function (dt) {
    if (this.start < 1) {
        const scale = 1 + (this.start / 2);
        this.entity.setLocalScale(scale, scale, scale);

        this.start += dt * 5;
    } else if (this.start < 2) {
        const scale = 1.5 - ((this.start - 1) / 2);
        this.entity.setLocalScale(scale, scale, scale);

        this.start += dt * 6;
    } else if (this.start > 2) {
        this.entity.setLocalScale(1, 1, 1);
        this.start = 2;
    }
};
