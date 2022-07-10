// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Progress = pc.createScript('progress');

Progress.prototype.initialize = function () {
    this._element = this.entity.element;

    this._current = 0;

    this.app.on('game:points', this.setScore, this);
    this.app.on('game:resetscore', this.resetscore, this);

    this.setScore();
};

Progress.prototype.resetscore = function () {
    this._current = 1;
    this._value = 1;
};

Progress.prototype.setScore = function () {
    this.setProgress(1 - Math.min((this.app.points - this.app.minPoints) / (this.app.maxPoints - this.app.minPoints), 1));
};

// Set progress - value is between 0 and 1
Progress.prototype.setProgress = function (value) {
    this._value = pc.math.clamp(value, 0, 1);
};

Progress.prototype.update = function (dt) {
    if (this._value > this._current) {
        this._current = pc.math.clamp(this._current + (dt * 1), 0, this._value);
    } else if (this._value < this._current) {
        this._current = pc.math.clamp(this._current - (dt * 1), this._value, 1);
    }

    // 0.001 to workaround > 0 optimisation check in engine code
    this._element.material.alphaTest = this._current + 0.001;
};
