// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Mousetip = pc.createScript('mousetip');

Mousetip.prototype.initialize = function () {
    if (this.app.buttons[0].count !== 1 || this.app.state.max !== 0 || this.app.points > 0 || this.app.pointsTier > 0) {
        this.entity.destroy();
        return;
    }

    this.entity.button.once('mouseenter', () => {
        this.fadeOut = 1;
    });

    this.app.once('mousetip:fadeout', () => {
        this.fadeOut = 1;
    });

    this.animationLeft = 0;
    this.fadeOut = 10;
};

Mousetip.prototype.update = function (dt) {
    const aminationTime = 1;
    if (this.animationLeft > 0) {
        this.animationLeft = Math.max(this.animationLeft - dt, 0);

        if (this.animationLeft >= (aminationTime / 2)) {
            const s = 1 + ((aminationTime - this.animationLeft) / (aminationTime / 2)) / 10;
            this.entity.setLocalScale(s, s, s);
        } else {
            const s = 1 + (this.animationLeft / (aminationTime / 2)) / 10;
            this.entity.setLocalScale(s, s, s);
        }
    } else {
        this.animationLeft = aminationTime;
    }

    if (this.fadeOut < 10) {
        this.fadeOut -= dt * 2;

        if (this.fadeOut <= 0) {
            this.entity.destroy();
            return;
        }

        this.entity.element.opacity = this.fadeOut;
    }
};
