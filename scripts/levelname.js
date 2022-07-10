// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Levelname = pc.createScript('levelname');

Levelname.prototype.initialize = function () {
    this.on('enable', this.onEnable, this);
    this.onEnable();
};

Levelname.prototype.onEnable = function () {
    this.entity.element.text = this.app.globals.levelNames[this.app.state.current].replace(' ', '\n');
    this.timeLeft = 2.5;
    this.entity.element.opacity = 0;
};

Levelname.prototype.update = function (dt) {
    this.timeLeft -= dt;

    let a;

    if (this.timeLeft < 1) {
        a = Math.max(this.timeLeft, 0);
    } else if (this.timeLeft > 2) {
        a = 1 - ((this.timeLeft - 2) * 2);
    } else {
        a = 1;
    }

    this.entity.element.opacity = a;
    //this.entity.element.outlineThickness = a * 0.1;

    if (this.timeLeft <= 0) {
        this.entity.enabled = false;
    }
};
