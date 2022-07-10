// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const RandomButton = pc.createScript('randombutton');

RandomButton.prototype.initialize = function () {
    this.entity.button.on('click', this.onSelect, this);
    if (this.app.touch) {
        this.entity.button.on('touchstart', this.onTouchStart, this);
        this.entity.button.on('touchend', this.onTouchEnd, this);
    } else {
        this.entity.button.on('mouseenter', this.onHoverStart, this);
        this.entity.button.on('mouseleave', this.onHoverEnd, this);
    }

    this.touchStarted = 0;
};

RandomButton.prototype.onSelect = function () {
    if (this.app.touch && this.touchStarted + 500 < performance.now()) {
        return;
    }

    this.entity.parent.setLocalScale(1, 1, 1);

    this.app.playSound('pick');

    this.app.fire('game:deselect');
    this.app.fire('tooltip:close');

    this.onHoverEnd();

    this.app.root.findByName('RandomMenu').enabled = true;
};

RandomButton.prototype.onTouchStart = function () {
    this.touchStarted = performance.now();
    this.onHoverStart();
};

RandomButton.prototype.onTouchEnd = function () {
    this.onHoverEnd();
};

RandomButton.prototype.onHoverStart = function () {
    this.entity.parent.children[2].enabled = true;
    this.entity.parent.setLocalScale(1.1, 1.1, 1.1);
};

RandomButton.prototype.onHoverEnd = function () {
    this.entity.parent.children[2].enabled = false;
    this.entity.parent.setLocalScale(1, 1, 1);
};
