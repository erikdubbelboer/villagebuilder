// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Deckimage = pc.createScript('deckimage');

Deckimage.attributes.add('pack', {
    type: 'number',
    default: 0,
});

Deckimage.attributes.add('index', {
    type: 'number',
    default: 1,
});

Deckimage.attributes.add('maxHelpHeight', {
    type: 'number',
    default: 100000,
});

Deckimage.attributes.add('doHover', {
    type: 'boolean',
    default: true,
});

Deckimage.prototype.initialize = function () {
    this.app.on('game:updatedeck', this.updateDeck, this);

    this.entity.button.on('mouseenter', this.onHoverStart, this);
    this.entity.button.on('mouseleave', this.onHoverEnd, this);
    this.entity.button.on('touchstart', this.onTouchStart, this);
    this.entity.button.on('touchend', this.onTouchEnd, this);

    this.entity.parent.children[1].enabled = false;

    this.help = this.app.root.findByName('Help');
};

Deckimage.prototype.updateDeck = function () {
    const tile = this.app.decks[this.pack].tiles[this.index];

    if (tile) {
        this.entity.element.enabled = false;
        this.tileName = tile[0];
        this.textureAssigned = false;

        if (tile[1] > 1) {
            this.entity.children[0].enabled = true;
            this.entity.children[0].element.text = tile[1];
        } else {
            this.entity.children[0].enabled = false;
        }

        this.entity.parent.children[1].element.text = tile[0];

        if (this.index > 0) {
            this.entity.parent.parent.children[(this.index * 2) - 1].enabled = true;
        }
    } else {
        this.entity.parent.enabled = false;

        if (this.index > 0) {
            this.entity.parent.parent.children[(this.index * 2) - 1].enabled = false;
        }
    }
};

Deckimage.prototype.update = function (dt) {
    if (!this.textureAssigned && this.tileName) {
        const t = this.app.tileTextures[this.tileName];
        if (t) {
            this.textureAssigned = true;
            this.entity.element.texture = t;
            this.entity.element.enabled = true;
        }
    }
};

Deckimage.prototype.onHoverStart = function () {
    if (this.doHover) {
        this.entity.setLocalScale(1.1, 1.1, 1.1);
    }

    this.app.hover('deckimage', true);

    this.entity.parent.children[1].enabled = true;

    this.help.reparent(this.entity.parent.children[1]);
    this.app.fire('game:showhelp', this.tileName, 0, 0, this.maxHelpHeight, this.entity.parent.children[1], 250);
};

Deckimage.prototype.onHoverEnd = function (event) {
    this.entity.setLocalScale(1, 1, 1);

    this.app.hover('deckimage', false);

    this.entity.parent.children[1].enabled = false;
};

Deckimage.prototype.onTouchStart = function () {
    this.onHoverStart();
};

Deckimage.prototype.onTouchEnd = function () {
    this.onHoverEnd();
};
