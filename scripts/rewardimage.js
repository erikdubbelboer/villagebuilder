// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Rewardimage = pc.createScript('rewardimage');

Rewardimage.attributes.add('tile', {
    type: 'string',
    default: 'Campfire',
});

Rewardimage.attributes.add('tooltip', {
    type: 'entity',
});

Rewardimage.attributes.add('moveRight', {
    type: 'number',
    default: 0,
});

Rewardimage.attributes.add('moveUp', {
    type: 'number',
    default: 0,
});

Rewardimage.prototype.initialize = function () {
    this.entity.button.on('mouseenter', this.onHoverStart, this);
    this.entity.button.on('mouseleave', this.onHoverEnd, this);
    this.entity.button.on('touchstart', this.onTouchStart, this);
    this.entity.button.on('touchend', this.onTouchEnd, this);

    this.touchStarted = 0;

    this.on('attr', () => {
        this.textureAssigned = false;
    });

    this.help = this.app.root.findByName('Help');
};

Rewardimage.prototype.update = function () {
    if (!this.textureAssigned && this.tile) {
        const t = this.app.tileTextures[this.tile];
        if (t) {
            this.textureAssigned = true;
            this.entity.element.texture = t;
        }
    }
};

Rewardimage.prototype.onHoverStart = function () {
    if (this.tile !== 'Empty') {
        this.app.hover('rewardimage', true);

        this.tooltip.enabled = true;
        this.app.noPickerHover = true;

        this.help.reparent(this.tooltip);
        this.app.fire('game:showhelp', this.tile, this.moveRight, this.moveUp, 0, null, 250);
    }
};

Rewardimage.prototype.onHoverEnd = function () {
    if (this.tile !== 'Empty') {
        this.app.hover('rewardimage', false);

        this.tooltip.enabled = false;
        this.app.noPickerHover = false;
    }
};

Rewardimage.prototype.onTouchStart = function () {
    this.onHoverStart();
};

Rewardimage.prototype.onTouchEnd = function () {
    this.onHoverEnd();
};
