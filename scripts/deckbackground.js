// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const DeckBackground = pc.createScript('deckbackground');

DeckBackground.attributes.add('pack', {
    type: 'number',
    default: 0,
});

DeckBackground.prototype.initialize = function () {
    this.entity.button.on('click', this.onSelect, this);
    this.entity.button.on('mouseenter', this.onHoverStart, this);
    this.entity.button.on('mouseleave', this.onHoverEnd, this);
    this.entity.button.on('touchstart', this.onTouchStart, this);
    this.entity.button.on('touchend', this.onTouchEnd, this);

    this.touchStarted = 0;

    this.undoGroup = this.app.root.findByName('UndoGroup');
    this.decks = this.app.root.findByName('Decks');
    this.randomGroup = this.app.root.findByName('RandomGroup');
};

DeckBackground.prototype.onSelect = function () {
    if (this.app.touch && this.touchStarted !== 0 && this.touchStarted + 500 < performance.now()) {
        return;
    }

    this.app.playSound('place');

    const tiles = this.app.decks[this.pack].tiles;

    this.app.previousPacks.push(this.app.decks[this.pack].title);

    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i][0];
        const count = tiles[i][1];

        this.app.addTile(tile, count);
    }

    this.app.undoState = false;
    this.undoGroup.enabled = false;

    this.app.decksOpen = false;

    this.app.fire('game:updatebuttons');
    this.app.fire('game:updatecard');
    this.app.fire('game:clearhelp');
    this.app.fire('game:updatesave');
    this.app.fire('game:nextunlock');
    this.app.fire('game:confirmdeck', this.pack);

    this.decks.enabled = false;
    this.randomGroup.enabled = this.app.previousPacks.length > 4;

    this.app.hover('deckbackground', false);
    this.app.hover('deckbutton', false);
    this.app.hover('deckimage', false);

    // Don't show a commercialBreak for the first 6 packs on the first level.
    //if (this.app.state.current !== 0 || this.app.previousPacks.length > 3) {
    this.app.commercialBreak();
    //}

    if (this.app.previousPacks.length === 1) {
        this.app.animateCardButtons = true;
    }
};

DeckBackground.prototype.onHoverStart = function () {
    this.app.hover('deckbackground', true);
};

DeckBackground.prototype.onHoverEnd = function () {
    this.app.hover('deckbackground', false);
};

DeckBackground.prototype.onTouchStart = function () {
    this.touchStarted = performance.now();
};

DeckBackground.prototype.onTouchEnd = function () {
};
