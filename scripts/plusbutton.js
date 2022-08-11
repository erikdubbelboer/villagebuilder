// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Plusbutton = pc.createScript('plusbutton');

Plusbutton.prototype.initialize = function () {
    this.entity.button.on('click', () => {
        if (this.app.touch && this.touchStarted + 500 < performance.now()) {
            return;
        }
        this.onSelect();
    });
    if (this.app.touch) {
        this.entity.button.on('touchstart', this.onTouchStart, this);
        this.entity.button.on('touchend', this.onTouchEnd, this);
    } else {
        this.entity.button.on('mouseenter', this.onHoverStart, this);
        this.entity.button.on('mouseleave', this.onHoverEnd, this);
    }

    this.animationLeft = 0.5;

    this.app.on('game:updatebuttons', this.updateButtons, this);
    this.app.on('game:resetscore', this.resetscore, this);
    this.app.on('game:confirmdeck', this.confirmdeck, this);
    this.app.on('game:updateunlock', () => {
        if (this.app.state.current === 0) {
            this.pickNextUnlock(0);
        } else {
            this.nextUnlockTile.enabled = false;
            this.nextUnlock.enabled = false;
        }
    });

    this.updateButtons();

    this.touchStarted = 0;

    this.app.globals.packs.forEach(p => {
        p.bias = 1;
    });

    if (this.app.previousPacks) {
        this.app.previousPacks.forEach(prev => {
            this.app.globals.packs.forEach(p => {
                if (p.title === prev) {
                    p.bias /= 3;
                } else {
                    p.bias = Math.min(p.bias * 1.1, 1);
                }
            });
        });
    } else {
        this.app.previousPacks = [];
    }

    this.first = -1;
    this.second = -1;
    this.nextPack = -1;

    this.nextUnlock = this.app.root.findByName('NextUnlock');
    this.nextUnlockTile = this.app.root.findByName('NextUnlockTile');
};

Plusbutton.prototype.enableDeck = function (name) {
    const entity = this.app.root.findByName(name);

    const tiles = entity.children[1].children;
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].enabled = true;
    }
};

Plusbutton.prototype.updateButtons = function () {
    this.entity.parent.children[1].enabled = true;
    this.entity.parent.children[1].element.text = this.app.buttons[0].count;

    if (this.app.buttons[0].count > 0) {
        this.entity.parent.enabled = true;
    } else {
        this.entity.parent.enabled = false;
    }
};

Plusbutton.prototype.resetscore = function () {
    this.app.globals.packs.forEach(p => {
        p.bias = 1;
    });

    this.app.previousPacks = [];

    this.first = -1;
    this.second = -1;
    this.nextPack = -1;
};

Plusbutton.prototype.putBackDeck = function () {
    this.app.decksOpen = false;
    this.app.buttons[0].count++;

    this.updateButtons();

    this.entity.parent.enabled = true;
};

Plusbutton.prototype.addDeck = function () {
    this.app.buttons[0].count++;

    if (!this.app.decksOpen && this.app.menuOpen === 0) {
        // Instead of showing a + button we just immediatly show the new deck selection menu.
        this.onSelect();
    } else {
        this.updateButtons();

        this.entity.parent.enabled = true;
    }
};

Plusbutton.prototype.weightedRandom = function (a) {
    const keys = Object.keys(a);
    let total = 0;

    keys.forEach(k => {
        total += a[k];
    });

    const randomVal = Math.random() * total;

    for (let i = keys.length - 1; i >= 0; i--) {
        total -= a[keys[i]];
        if (randomVal > total) {
            return keys[i];
        }
    }

    return 'House';
};

Plusbutton.prototype.fixDeck = function (deck) {
    const copy = JSON.parse(JSON.stringify(deck));
    const tiles = copy.tiles;

    const add = (tile, count) => {
        for (let j = 0; j < tiles.length; j++) {
            if (tiles[j][0] === tile) {
                tiles[j][1] += count;
                return true;
            }
        }
        if (tiles.length < 5) {
            tiles.push([tile, count]);
            return true;
        }
        return false;
    };

    const random = {
        'House': 15,
        'Tavern': 12,
        'Lumberjack': 2,
        'Tower': 1,
        'Church': 1,
    };

    if (this.app.buildingsSeen['Mill']) {
        random['Grain'] = 10;
    }
    if (this.app.buildingsSeen['Stable']) {
        random['Sheep'] = 10;
        random['Horses'] = 5;
        random['Pigs'] = 5;
    }
    if (this.app.buildingsSeen['Tavern']) {
        random['Vineyard'] = 5;
    }

    Object.keys(this.app.state.unlocked).forEach(tile => {
        random[tile] = 2;
    });

    let toAdd = Math.floor(this.app.pointsTier / 4);

    for (let i = 0; i < 100 && toAdd > 0; i++) {
        const tile = this.weightedRandom(random);

        let cnt = 1;
        if (tile === 'Forest') {
            cnt = 3;
        }

        if (add(tile, cnt)) {
            toAdd--;
        }

        // Only give these random once per pack.
        if (['Tower', 'Church', 'Horses', 'Statue', 'Campfire', 'Ship', 'Townhall', 'Jousting'].includes(tile)) {
            delete random[tile];
        }
    }

    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i][0];
        let count = tiles[i][1];
        let addTile = '';
        let addCount = 0;

        if (tile === 'Hunting Cabin' && this.app.levelStoneHillsLeft < count) {
            addTile = 'House';
            addCount = count - this.app.levelStoneHillsLeft;
            count = this.app.levelStoneHillsLeft;
        } else if (tile === 'Mine' && this.app.levelGrassHillsLeft < count) {
            addTile = 'Lumberjack';
            addCount = count - this.app.levelGrassHillsLeft;
            count = this.app.levelGrassHillsLeft;
        } else if (tile === 'Fishing Hut' && this.app.levelFishingHutLeft < count) {
            addTile = 'Sheep';
            addCount = count - this.app.levelFishingHutLeft;
            count = this.app.levelFishingHutLeft;

            if (count === 0 && copy.title === 'Fishing') {
                copy.title = addTile;
            }
        } else if (tile === 'Water Mill' && !this.app.hasRiver) {
            addTile = 'Stable';
            addCount = 1;
            count = 0;
        }

        if (addCount === 0) {
            continue;
        }

        if (count === 0 && copy.title === tile) {
            copy.title = addTile;
        }

        if (count === 0) {
            tiles.splice(i, 1);
            i--;
        } else {
            tiles[i][1] = count;
        }

        if (addCount > 0) {
            add(addTile, addCount);
        }
    }

    return copy;
};

Plusbutton.prototype.getPredefinedPack = function (titles) {
    const t = [];
    titles.forEach(title => {
        if (!this.app.previousPacks.includes(title)) {
            t.push(this.findPackIndex(title));
        }
    });

    return t[Math.floor(Math.random() * t.length)];
};

Plusbutton.prototype.findPackIndex = function (title) {
    const packs = this.app.globals.packs;
    for (let i = 0; i < packs.length; i++) {
        if (packs[i].title === title) {
            return i;
        }
    }

    return -1;
};

Plusbutton.prototype.randomPack = function (ignore) {
    const packs = [];
    let total = 0;

    this.app.globals.packs.forEach((p, i) => {
        if (p.tier === -1) {
            return;
        } else if (p.tier > this.app.previousPacks.length) {
            return;
        } else if (i === ignore) {
            return;
        }

        packs.push([i, p.bias]);
        total += p.bias;
    });

    const randomVal = Math.random() * total;

    for (let i = packs.length - 1; i >= 0; i--) {
        total -= packs[i][1];
        if (randomVal > total) {
            return packs[i][0];
        }
    }

    return -1;
};

Plusbutton.prototype.onSelect = function () {
    this.entity.parent.setLocalScale(1, 1, 1);

    this.app.playSound('pick');

    this.app.fire('game:deselect');
    this.app.fire('tooltip:close');

    this.onHoverEnd();

    const packs = this.app.globals.packs;

    if (this.first === -1) {
        if (this.app.state.current === 0) {
            const predefined = [
                [['Lumber'], ['Village']],
                [['Lumber', 'Village'], ['Town']],
                [['Forestry'], ['Living']],
                [['Forestry', 'Living'], ['Animals']],
                [['Forestry', 'Living', 'Animals'], ['Farming']],
                [['Forestry', 'Living', 'Animals', 'Farming'], ['Religion']],
                [['Forestry', 'Living', 'Animals', 'Farming', 'Religion'], ['Economy']],
            ];

            const deckTier = this.app.previousPacks.length;
            if (deckTier < predefined.length) {
                this.first = this.getPredefinedPack(predefined[deckTier][0]);
                this.second = this.getPredefinedPack(predefined[deckTier][1]);
            }
        }

        if (this.first < 0 || this.second < 0) {
            this.first = this.nextPack;

            if (this.first < 0) {
                this.first = this.randomPack(-1);
            }

            this.second = this.randomPack(this.first);
        }

        this.app.globals.packs.forEach((p, i) => {
            if (i === this.first || i === this.second) {
                p.bias /= 3;
            } else {
                p.bias = Math.min(p.bias * 1.1, 1);
            }
        });

        if (Math.random() < 0.5) {
            const t = this.first;
            this.first = this.second;
            this.second = t;
        }
    }

    this.pickNextUnlock(1);

    this.app.decks[0] = this.fixDeck(packs[this.first]);
    this.app.decks[1] = this.fixDeck(packs[this.second]);

    this.enableDeck('LeftDeck');
    this.enableDeck('RightDeck');

    this.app.root.findByName('Decks').enabled = true;
    this.app.root.findByName('DecksLevelNumber').element.text = '' + (this.app.previousPacks.length + 1);

    this.app.fire('game:updatedeck');

    this.app.buttons[0].count--;
    this.app.decksOpen = true;

    this.updateButtons();

    this.entity.parent.enabled = false;

    this.entity.parent.children[2].enabled = false;

    for (let i = 0; i < this.app.decks[0].tiles.length; i++) {
        this.app.buildingsSeen[this.app.decks[0].tiles[i][0]] = (this.app.buildingsSeen[this.app.decks[0].tiles[i][0]] || 0) + 1;
    }
    for (let i = 0; i < this.app.decks[1].tiles.length; i++) {
        this.app.buildingsSeen[this.app.decks[1].tiles[i][0]] = (this.app.buildingsSeen[this.app.decks[1].tiles[i][0]] || 0) + 1;
    }
};

Plusbutton.prototype.pickNextUnlock = function (add) {
    const predefinedUnlocks = [
        'Lumberjack',
        'Tavern',
        'Carpenter',
        'Stable',
        'Mill',
        'Church',
    ];

    const nextTier = this.app.previousPacks.length + add;

    if (this.app.state.current === 0 && nextTier < predefinedUnlocks.length) {
        this.nextUnlockTile.script.rewardimage.tile = predefinedUnlocks[nextTier];
        this.nextUnlockTile.enabled = true;
        this.nextUnlock.enabled = true;
    } else {
        const packs = this.app.globals.packs;

        const possiblePacks = [];

        packs.forEach((p, i) => {
            if (p.tier === -1) {
                return;
            } else if (p.tier > nextTier) {
                return;
            } else if (i === this.first || i === this.second || this.app.previousPacks.indexOf(p.title) > -1) {
                return;
            } else if (!p.unlock) {
                return;
            } else if (p.title === 'Hunting' && !this.app.levelStoneHillsLeft) {
                return;
            } else if (p.title === 'Mining' && !this.app.levelGrassHillsLeft) {
                return;
            } else if (p.title === 'Fishing' && !this.app.levelFishingHutLeft) {
                return;
            } else if (p.title === 'Water Mill' && !this.app.hasRiver) {
                return;
            }

            possiblePacks.push(i);
        });

        if (possiblePacks.length === 0) {
            this.nextUnlockTile.enabled = false;
            this.nextUnlock.enabled = false;
        } else {
            this.nextPack = possiblePacks[Math.floor(Math.random() * possiblePacks.length)];

            this.nextUnlockTile.script.rewardimage.tile = packs[this.nextPack].unlock;
            this.nextUnlockTile.enabled = true;
            this.nextUnlock.enabled = true;
        }
    }
};

Plusbutton.prototype.onTouchStart = function () {
    this.touchStarted = performance.now();
    this.onHoverStart();
};

Plusbutton.prototype.onTouchEnd = function () {
    this.onHoverEnd();
};

Plusbutton.prototype.onHoverStart = function () {
    this.entity.parent.children[2].enabled = true;
    this.entity.parent.setLocalScale(1.1, 1.1, 1.1);
};

Plusbutton.prototype.onHoverEnd = function () {
    this.entity.parent.children[2].enabled = false;
    this.entity.parent.setLocalScale(1, 1, 1);
};

Plusbutton.prototype.update = function (dt) {
    const aminationTime = 1;
    if (this.animationLeft > 0) {
        this.animationLeft = Math.max(this.animationLeft - dt, 0);

        if (this.animationLeft >= (aminationTime / 2)) {
            const s = 1 + ((aminationTime - this.animationLeft) / (aminationTime / 2)) / 2;
            this.entity.children[0].setLocalScale(s, s, s);
        } else {
            const s = 1 + (this.animationLeft / (aminationTime / 2)) / 2;
            this.entity.children[0].setLocalScale(s, s, s);
        }
    } else {
        this.animationLeft = aminationTime;
    }
};

Plusbutton.prototype.confirmdeck = function (pack) {
    let other = 0;
    if (pack === 0) {
        other = 1;
    }
    for (let i = 0; i < this.app.decks[other].tiles.length; i++) {
        this.app.buildingsSeen[this.app.decks[other].tiles[i][0]]--;
    }

    this.first = -1;
    this.second = -1;
};
