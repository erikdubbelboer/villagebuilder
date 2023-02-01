// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const ExtraButton = pc.createScript('extrabutton');

ExtraButton.prototype.initialize = function () {
    this.entity.button.on('click', this.onSelect, this);
    if (this.app.touch) {
        this.entity.button.on('touchstart', this.onTouchStart, this);
        this.entity.button.on('touchend', this.onTouchEnd, this);
    }

    this.entity.button.on('mouseenter', this.onHoverStart, this);
    this.entity.button.on('mouseleave', this.onHoverEnd, this);

    this.touchStarted = 0;

    this.onHoverEnd();

    this.extraMenu = this.app.root.findByName('ExtraMenu');

    this.isDisabled = false;
    this.tileName = '';
};

ExtraButton.prototype.onSelect = function () {
    if (this.app.touch && this.touchStarted + 500 < performance.now()) {
        return;
    }
    if (this.isDisabled) {
        return;
    }

    this.entity.parent.setLocalScale(1, 1, 1);

    this.app.playSound('pick');

    this.app.fire('game:deselect');
    this.app.fire('tooltip:close');

    this.onHoverEnd();

    this.extraMenu.enabled = true;
};

ExtraButton.prototype.onTouchStart = function () {
    this.touchStarted = performance.now();
    this.onHoverStart();
};

ExtraButton.prototype.onTouchEnd = function () {
    this.onHoverEnd();
};

ExtraButton.prototype.onHoverStart = function () {
    this.entity.parent.children[2].enabled = true;
    this.entity.parent.setLocalScale(1.1, 1.1, 1.1);

    this.app.noPickerHover = true;
};

ExtraButton.prototype.onHoverEnd = function () {
    this.entity.parent.children[2].enabled = false;
    this.entity.parent.setLocalScale(1, 1, 1);

    this.app.noPickerHover = false;
};

ExtraButton.prototype.update = function () {
    if (this.tileName !== this.app.extraBuilding) {
        this.tileName = this.app.extraBuilding;
        this.textureAssigned = false;
    }

    if (!this.textureAssigned && this.tileName) {
        const t = this.app.tileTextures[this.tileName];
        if (t) {
            this.textureAssigned = true;
            this.entity.element.texture = t;
        }
    }
};
