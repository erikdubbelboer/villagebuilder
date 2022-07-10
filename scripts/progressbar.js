// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const ProgressBar = pc.createScript('progressbar');

ProgressBar.prototype.initialize = function () {
    this._element = this.entity.element;

    this._current = 0;

    this.app.on('game:points', this.setScore, this);
    this.app.on('game:resetscore', this.resetscore, this);

    this.setScore();

    window.addEventListener('resize', () => {
        this.onWindowResize();
    }, false);
    this.onWindowResize();
};

ProgressBar.prototype.onWindowResize = function () {
    this.width = this.entity.parent.element.width;
};

ProgressBar.prototype.resetscore = function () {
    this._current = 1;
    this._value = 1;
};

ProgressBar.prototype.setScore = function () {
    this.setProgress(0.99 - Math.min((this.app.points - this.app.minPoints) / (this.app.maxPoints - this.app.minPoints), 1));
};

// Set progress - value is between 0 and 1
ProgressBar.prototype.setProgress = function (value) {
    this._value = pc.math.clamp(value, 0, 1);
};

ProgressBar.prototype.update = function (dt) {
    if (this._value > this._current) {
        this._current = pc.math.clamp(this._current + (dt * 1), 0, this._value);
    } else if (this._value < this._current) {
        this._current = pc.math.clamp(this._current - (dt * 1), this._value, 1);
    }

    this._element.width = this.width - (this.width * this._current);
};
