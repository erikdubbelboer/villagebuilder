// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Plusbutton = pc.createScript('plusbutton');

Plusbutton.prototype.initialize = function () {
    this.app.on('game:resetscore', this.resetscore, this);
    this.app.on('game:confirmdeck', this.confirmdeck, this);
    this.app.on('game:nextunlock', () => {
        this.pickNextUnlock();
    });

    this.app.globals.packs.forEach(p => {
        p.bias = 1;
    });

    this.app.once('game:levelloaded2', () => {
        this.packsSeen = {};
        this.buildingsSeenThisRound = {
            'Road': true,
            'Forest': true,
            'Water': true,
            'Grass': true,
            'River': true,
            'Water Rocks': true,
            'Field': true,
            'Grass Hill': true,
            'Stone Hill': true,
        };

        if (this.app.previousPacks) {
            this.app.previousPacks.forEach(prev => {
                this.packsSeen[prev] = true;

                this.app.globals.packs.forEach(p => {
                    if (p.title === prev) {
                        p.bias /= 3;

                        p.tiles.forEach(t => {
                            this.buildingsSeenThisRound[t[0]] = true;
                        });
                    } else {
                        p.bias = Math.min(p.bias * 1.1, 1);
                    }
                });
            });
        } else {
            this.app.previousPacks = [];
        }
    });

    this.first = -1;
    this.second = -1;
    this.nextPack = -1;

    this.nextUnlock = this.app.root.findByName('NextUnlock');
    this.nextUnlockTile1 = this.app.root.findByName('NextUnlockTile1');
    this.nextUnlockTile2 = this.app.root.findByName('NextUnlockTile2');
    this.nextLevelMenu = this.app.root.findByName('NextLevelMenu');
    this.decks = this.app.root.findByName('Decks');
    this.decksLevelNumber = this.app.root.findByName('DecksLevelNumber');
};

Plusbutton.prototype.enableDeck = function (name) {
    const entity = this.decks.findByName(name);

    const tiles = entity.children[1].children;
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].enabled = true;
    }
};

Plusbutton.prototype.resetscore = function () {
    this.app.globals.packs.forEach(p => {
        p.bias = 1;
    });

    this.app.previousPacks = [];
    this.packsSeen = {};
    this.buildingsSeenThisRound = {
        'Road': true,
        'Forest': true,
        'Water': true,
        'Grass': true,
        'River': true,
        'Water Rocks': true,
        'Field': true,
        'Grass Hill': true,
        'Stone Hill': true,
    };

    this.first = -1;
    this.second = -1;
    this.nextPack = -1;
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

    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i][0];

        if (['Townhall', 'Campfire', 'Statue', 'Ship', 'Papermill', 'Jousting'].includes(tile)) {
            if (!this.app.state.unlocked[tile]) {
                tiles.splice(i, 1);
                i--;
            }
        } else if (tile === 'Hunting Cabin' && this.app.levelStoneHillsLeft <= 0) {
            tiles.splice(i, 1);
            i--;
        } else if (tile === 'Mine' && this.app.levelGrassHillsLeft <= 0) {
            tiles.splice(i, 1);
            i--;
        } else if (tile === 'Fishing Hut' && this.app.levelFishingHutLeft <= 0) {
            tiles.splice(i, 1);
            i--;
        } else if (tile === 'Shipyard' && this.app.levelShipyardLeft <= 0) {
            tiles.splice(i, 1);
            i--;
        } else if (tile === 'Water Mill' && !this.app.hasRiver) {
            tiles.splice(i, 1);
            i--;
        }
    }

    return copy;
};

Plusbutton.prototype.seenAllBuildings = function (p) {
    for (let i = 0; i < p.tiles.length; i++) {
        if (!this.buildingsSeenThisRound[p.tiles[i][0]]) {
            return false;
        }
    }
    return true;
};

Plusbutton.prototype.randomPack = function (ignore, lessChecks) {
    const packs = [];
    let total = 0;

    this.app.globals.packs.forEach((p, i) => {
        if (p.minLevel > this.app.pointsTier) {
            return;
        } else if (p.maxLevel > 0 && p.maxLevel < this.app.pointsTier) {
            return;
        } else if (i === ignore) {
            return;
        }

        if (!lessChecks) {
            if (this.app.pointsTier > 1 && !this.packsSeen[p.title] && !this.seenAllBuildings(p)) {
                return;
            }

            if (this.app.previousPacks > 0) {
                let can = false;
                for (let i = 0; i < p.tiles.length; i++) {
                    const need = this.app.globals.needs[p.tiles[i][0]];

                    for (let j = 0; j < need.or.length; j++) {
                        if (this.buildingsSeenThisRound[need.or[j]]) {
                            can = true;
                            break;
                        }
                    }
                    for (let j = 0; j < need.on.length; j++) {
                        if (this.buildingsSeenThisRound[need.on[j]]) {
                            can = true;
                            break;
                        }
                    }

                    if (!can) {
                        continue;
                    }

                    let allAnd = need.and.length === 0;
                    for (let j = 0; j < need.and.length; j++) {
                        if (!this.buildingsSeenThisRound[need.and[j]]) {
                            allAnd = false;
                            break;
                        }
                    }
                    if (!allAnd) {
                        can = false;
                    } else if (can) {
                        break;
                    }
                }

                if (!can) {
                    return;
                }

                // Make sure each tile in the pack has at least one positive point.
                /*let allPositive = true;
                for (let i = 0; i < p.tiles.length; i++) {
                    const extra = this.app.globals.extrapoints[p.tiles[i][0]];
                    const extraTiles = Object.keys(extra);
                    let positive = false;
    
                    for (let j = 0; j < extraTiles.length; j++) {
                        const tile = extraTiles[j];
    
                        if (this.app.globals.basepoints[tile] > 0) {
                            positive = true;
                            break;
                        }
    
                        if (extra[tile] > 0 && this.buildingsSeenThisRound[tile]) {
                            positive = true;
                            break;
                        }
                    }
    
                    if (!positive) {
                        allPositive = false;
                        break;
                    }
                }
                if (!allPositive) {
                    return;
                }*/
            }
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

Plusbutton.prototype.addDeck = function () {
    if (this.nextLevelMenu.enabled) {
        setTimeout(() => {
            this.addDeck();
        }, 100);
        return;
    }

    this.app.playSound('pick');

    this.app.fire('game:deselect');
    this.app.fire('tooltip:close');

    const packs = this.app.globals.packs;

    this.first = this.nextPack;

    if (this.first < 0) {
        this.first = this.randomPack(-1, false);
    }

    this.second = this.randomPack(this.first, false);

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

    if (this.first < 0) {
        this.first = this.randomPack(-1, true);
    }
    if (this.second < 0) {
        this.second = this.randomPack(-1, true);
    }

    this.app.decks[0] = this.fixDeck(packs[this.first]);
    this.app.decks[1] = this.fixDeck(packs[this.second]);

    this.packsSeen[packs[this.first].title] = true;
    this.packsSeen[packs[this.second].title] = true;

    this.enableDeck('LeftDeck');
    this.enableDeck('RightDeck');

    this.decks.enabled = true;
    this.decksLevelNumber.element.text = '' + this.app.pointsTier;

    this.app.fire('game:updatedeck');

    this.app.decksOpen = true;

    for (let i = 0; i < this.app.decks[0].tiles.length; i++) {
        const tile = this.app.decks[0].tiles[i][0];
        this.app.buildingsSeen[tile] = (this.app.buildingsSeen[tile] || 0) + 1;
        this.buildingsSeenThisRound[tile] = true;
    }
    for (let i = 0; i < this.app.decks[1].tiles.length; i++) {
        const tile = this.app.decks[1].tiles[i][0];
        this.app.buildingsSeen[tile] = (this.app.buildingsSeen[tile] || 0) + 1;
        this.buildingsSeenThisRound[tile] = true;
    }
};

Plusbutton.prototype.pickNextUnlock = function () {
    if (this.app.previousPacks.length === 0) {
        this.app.nextUnlock1 = '';
        this.app.nextUnlock2 = '';
        this.nextUnlockTile1.enabled = false;
        this.nextUnlockTile2.enabled = false;
        this.nextUnlock.enabled = false;
        this.nextPack = -1;
        return;
    }

    const nextLevel = this.app.pointsTier + 1;
    const packs = this.app.globals.packs;
    const possiblePacks = [];

    packs.forEach((p, i) => {
        if (p.minLevel > nextLevel) {
            return;
        } else if (p.maxLevel > 0 && p.maxLevel < nextLevel) {
            return;
        } else if (this.packsSeen[p.title]) {
            return;
        }

        const unlocks = [];
        for (let i = 0; i < p.tiles.length; i++) {
            const tile = p.tiles[i][0];
            let count = p.tiles[i][1];

            if (count <= 0) {
                continue;
            }

            if (['Townhall', 'Campfire', 'Statue', 'Ship', 'Papermill', 'Jousting'].includes(tile)) {
                continue;
            }

            if (tile === 'Hunting Cabin' && this.app.levelStoneHillsLeft <= 0) {
                continue;
            } else if (tile === 'Mine' && this.app.levelGrassHillsLeft <= 0) {
                continue;
            } else if (tile === 'Fishing Hut' && this.app.levelFishingHutLeft <= 0) {
                continue;
            } else if (tile === 'Shipyard' && this.app.levelShipyardLeft <= 0) {
                continue;
            } else if (tile === 'Water Mill' && !this.app.hasRiver) {
                continue;
            }

            if (this.buildingsSeenThisRound[tile]) {
                continue;
            }

            unlocks.push(tile);
        }

        if (unlocks.length > 0) {
            possiblePacks.push([i, unlocks]);
        }
    });

    if (possiblePacks.length === 0) {
        this.app.nextUnlock1 = '';
        this.app.nextUnlock2 = '';
        this.nextUnlockTile1.enabled = false;
        this.nextUnlockTile2.enabled = false;
        this.nextUnlock.enabled = false;
        this.nextPack = -1;
    } else {
        const tuple = possiblePacks[Math.floor(Math.random() * possiblePacks.length)];

        this.nextPack = tuple[0];
        const tiles = tuple[1];

        let i = Math.floor(Math.random() * tiles.length);

        this.app.nextUnlock1 = tiles[i];
        this.nextUnlockTile1.script.rewardimage.tile = tiles[i];
        this.nextUnlockTile1.enabled = true;

        if (tiles.length > 1) {
            tiles.splice(i, 1);

            i = Math.floor(Math.random() * tiles.length);

            this.app.nextUnlock2 = tiles[i];
            this.nextUnlockTile2.script.rewardimage.tile = tiles[i];
            this.nextUnlockTile2.enabled = true;
        } else {
            this.app.nextUnlock2 = '';
            this.nextUnlockTile2.enabled = false;
        }

        this.nextUnlock.enabled = true;
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
