// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const NextMapButton = pc.createScript('nextmapbutton');

NextMapButton.prototype.initialize = function () {
    this.entity.button.on('click', this.onSelect, this);
    if (this.app.touch) {
        this.entity.button.on('touchstart', this.onTouchStart, this);
        this.entity.button.on('touchend', this.onTouchEnd, this);
    }

    this.entity.button.on('mouseenter', this.onHoverStart, this);
    this.entity.button.on('mouseleave', this.onHoverEnd, this);

    this.touchStarted = 0;

    this.onHoverEnd();

    this.levelsMenu = this.app.root.findByName('LevelsMenu');
};

NextMapButton.prototype.onSelect = function () {
    if (this.app.touch && this.touchStarted + 500 < performance.now()) {
        return;
    }

    this.entity.parent.setLocalScale(1, 1, 1);

    this.app.playSound('menu');

    this.app.fire('game:deselect');
    this.app.fire('tooltip:close');

    this.onHoverEnd();

    this.levelsMenu.enabled = true;
};

NextMapButton.prototype.onTouchStart = function () {
    this.touchStarted = performance.now();
    this.onHoverStart();
};

NextMapButton.prototype.onTouchEnd = function () {
    this.onHoverEnd();
};

NextMapButton.prototype.onHoverStart = function () {
    this.entity.parent.children[2].enabled = true;
    this.entity.parent.setLocalScale(1.1, 1.1, 1.1);

    this.app.noPickerHover = true;
};

NextMapButton.prototype.onHoverEnd = function () {
    this.entity.parent.children[2].enabled = false;
    this.entity.parent.setLocalScale(1, 1, 1);

    this.app.noPickerHover = false;
};
