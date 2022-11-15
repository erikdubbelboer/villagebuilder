var Leveleditor = pc.createScript('leveleditor');

// initialize code called once per entity
Leveleditor.prototype.initialize = function () {
    this.level = new pc.Entity('Level');
    this.app.root.addChild(this.level);

    const levelSize = 50;
    this.app.levelSize = levelSize;

    const levelSizeHalf = levelSize / 2;
    const tileXSize = this.app.globals.tileXSize;
    const tileYSize = this.app.globals.tileYSize;

    if (!this.app.buildingBatchGroups) {
        const batchGroupN = Math.ceil(levelSize / this.app.globals.batchSize);
        this.app.buildingBatchGroups = new Array(batchGroupN);
        for (let i = 0; i < batchGroupN; i++) {
            this.app.buildingBatchGroups[i] = new Array(batchGroupN);

            for (let j = 0; j < batchGroupN; j++) {
                this.app.buildingBatchGroups[i][j] = this.app.batcher.addGroup('building-' + i + '-' + j, true, 100);
            }
        }
    }

    this.app.tiles = new Array(levelSize);

    for (let i = 0; i < levelSize; i++) {
        this.app.tiles[i] = new Array(levelSize);

        for (let j = 0; j < levelSize; j++) {
            let x = (i - levelSizeHalf) * tileXSize;
            const z = (j - levelSizeHalf) * tileYSize;

            if (j % 2 == 0) {
                x += 0.5;
            }

            const y = 0;

            const distanceFromCenter = Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2));

            // Make the map round.
            if (distanceFromCenter > (levelSizeHalf * tileYSize)) {
                this.app.tiles[i][j] = {
                    baseTile: '',
                    buildingTile: '',
                    //bitmap: '000000',
                };

                continue;
            }

            let model = 'Grass';
            if (x === 0 && z === 0) {
                model = 'Water';
            }

            const template = this.app.assets.find(model, "template");
            const entity = template.resource.instantiate();

            entity.setPosition(x, y, z);
            entity.setRotation(new pc.Quat().setFromEulerAngles(0, 0, 0));

            const batchGroupId = this.app.buildingBatchGroups[Math.floor(i / this.app.globals.batchSize)][Math.floor(j / this.app.globals.batchSize)].id;
            this.app.setBatchGroupId(entity, batchGroupId);

            this.level.addChild(entity);

            this.app.tiles[i][j] = {
                x: x,
                y: y,
                z: z,
                i: i,
                j: j,
                baseTile: model,
                base: entity,
                buildingTile: '',
                building: null,
                bitmap: '000000',
                isStraightRiver: 0,
                angle: 0,
                specialRoad: false,
                hasBottom: false,
            };
        }
    }

    this.app.on('game:fixedges', this.fixEdges, this);
    this.fixEdges();

    this.app.save = () => {
        return this.save();
    };
    this.app.load = str => {
        return this.load(str);
    };

    this.app.globals.cantRotate = [
        'Road',
        'Fishing Hut',
        'Water Mill',
        'River',
        'Water',
        'Shipyard',
    ];
};

Leveleditor.prototype.postInitialize = function () {
    this.app.buildingsSeen = {};

    const tiles = [
        'Grass',
        'Forest',
        'Grass Hill',
        'Stone Hill',
        'River',
        'Water',
        'Water Rocks',
        'Road',
    ];

    for (let i = 0; i < tiles.length; i++) {
        this.app.addTile(tiles[i], 99);
    }
    setInterval(() => {
        for (let i = 0; i < tiles.length; i++) {
            this.app.addTile(tiles[i], 99, true);
        }
        this.app.fire('game:updatebuttons');
    }, 5000);

    this.app.root.findByName('UndoGroup').enabled = false;
    this.app.root.findByName('RandomGroup').enabled = false;
    this.app.root.findByName('NextMapGroup').enabled = false;

    this.app.undoState = false;
    this.app.previousPacks = [];

    this.app.fire('game:updatebuttons');
    this.app.fire('game:updatesave');
    this.app.fire('game:nextunlock');
    this.app.fire('game:levelloaded');
    this.app.fire('game:levelloaded2');
};

Leveleditor.prototype.fixEdges = function () {
    for (let i = 0; i < this.app.levelSize; i++) {
        for (let j = 0; j < this.app.levelSize; j++) {
            const tile = this.app.tiles[i][j];

            if (tile.baseTile === 'Grass') {
                const needsBottom = this.isNeighbor(i, j, 'Water') || this.isNeighborLower(i, j) || this.isNeighborEdge(i, j);

                if (needsBottom !== tile.hasBottom) {
                    tile.base.destroy();

                    const template = this.app.assets.find(needsBottom ? 'Grass With Bottom' : 'Grass', "template");
                    const entity = template.resource.instantiate();

                    entity.setPosition(tile.x, tile.y, tile.z);
                    entity.setRotation(new pc.Quat().setFromEulerAngles(0, 0, 0));

                    const batchGroupId = this.app.buildingBatchGroups[Math.floor(i / this.app.globals.batchSize)][Math.floor(j / this.app.globals.batchSize)].id;
                    this.app.setBatchGroupId(entity, batchGroupId);

                    this.level.addChild(entity);

                    tile.base = entity;
                }

                tile.hasBottom = needsBottom;
            }
        }
    }
};

Leveleditor.prototype.isTile = function (i, j, tile, orInvalid, onlyBase) {
    if (i < 0 || i >= this.app.levelSize || j < 0 || j >= this.app.levelSize) {
        return orInvalid;
    }

    const t = this.app.tiles[i][j];

    if (!t.baseTile && !t.buildingTile) {
        return orInvalid;
    }

    if (onlyBase) {
        return t.baseTile === tile && !t.buildingTile;
    }

    return t.baseTile === tile || t.buildingTile === tile;
};

Leveleditor.prototype.isNeighbor = function (i, j, tile) {
    if (this.isTile((i - 1) + (1 - j % 2), j - 1, tile, false, false)) return true;
    if (this.isTile((i + 0) + (1 - j % 2), j - 1, tile, false, false)) return true;
    if (this.isTile(i + 1, j, tile, false, false)) return true;
    if (this.isTile((i + 0) + (1 - j % 2), j + 1, tile, false, false)) return true;
    if (this.isTile((i - 1) + (1 - j % 2), j + 1, tile, false, false)) return true;
    if (this.isTile(i - 1, j, tile, false, false)) return true;
    return false;
};

Leveleditor.prototype.isOnlyNeighbor = function (i, j, tile) {
    if (!this.isTile((i - 1) + (1 - j % 2), j - 1, tile, false, true)) return false;
    if (!this.isTile((i + 0) + (1 - j % 2), j - 1, tile, false, true)) return false;
    if (!this.isTile(i + 1, j, tile, false, true)) return false;
    if (!this.isTile((i + 0) + (1 - j % 2), j + 1, tile, false, true)) return false;
    if (!this.isTile((i - 1) + (1 - j % 2), j + 1, tile, false, true)) return false;
    if (!this.isTile(i - 1, j, tile, false, true)) return false;
    return true;
};

Leveleditor.prototype.isNoTile = function (i, j) {
    if (i < 0 || i >= this.app.levelSize || j < 0 || j >= this.app.levelSize) {
        return true;
    }

    const t = this.app.tiles[i][j];

    if (!t.baseTile && !t.buildingTile) {
        return true;
    }

    return false;
};

Leveleditor.prototype.isNeighborEdge = function (i, j) {
    if (this.isNoTile((i - 1) + (1 - j % 2), j - 1)) return true;
    if (this.isNoTile((i + 0) + (1 - j % 2), j - 1)) return true;
    if (this.isNoTile(i + 1, j)) return true;
    if (this.isNoTile((i + 0) + (1 - j % 2), j + 1)) return true;
    if (this.isNoTile((i - 1) + (1 - j % 2), j + 1)) return true;
    if (this.isNoTile(i - 1, j)) return true;
    return false;
};

Leveleditor.prototype.getHeight = function (i, j) {
    const levelSize = this.app.levelSize;
    const levelSizeHalf = levelSize / 2;
    const tileXSize = this.app.globals.tileXSize;
    const tileYSize = this.app.globals.tileYSize;

    const z = (j - levelSizeHalf) * tileYSize;
    let x = (i - levelSizeHalf) * tileXSize;
    if (j % 2 == 0) {
        x += 0.5;
    }

    const sx = x - (levelSize * tileXSize * 0.5);
    const sz = z - (levelSize * tileYSize * 0.5);
    return Math.min(Math.floor(sx * sz * 0.006), 12) * 0.15;
};

Leveleditor.prototype.isNeighborLower = function (i, j) {
    if (!this.mountain) {
        return false;
    }

    const b = this.getHeight(i, j);
    if (this.getHeight((i - 1) + (1 - j % 2), j - 1) < b) return true;
    if (this.getHeight((i + 0) + (1 - j % 2), j - 1) < b) return true;
    if (this.getHeight(i + 1, j) < b) return true;
    if (this.getHeight((i + 0) + (1 - j % 2), j + 1) < b) return true;
    if (this.getHeight((i - 1) + (1 - j % 2), j + 1) < b) return true;
    if (this.getHeight(i - 1, j) < b) return true;
    return false;
};

Leveleditor.prototype.save = function () {
    this.app.fire('game:fixrivers');

    const state = {
        size: this.app.levelSize,
        tiles: {},
    };

    for (let i = 1; i < this.app.levelSize - 1; i++) {
        for (let j = 1; j < this.app.levelSize - 1; j++) {
            const tile = this.app.tiles[i][j];

            if (tile.buildingTile) {
                const d = [
                    i,
                    j,
                ];

                const angle = Math.round(tile.angle);
                if (tile.buildingTile !== 'Road' && angle !== 0) {
                    d.push(angle);
                }

                if (!state.tiles[tile.buildingTile]) {
                    state.tiles[tile.buildingTile] = [];
                }
                state.tiles[tile.buildingTile].push(d);
            }

            if (tile.baseTile) {
                const d = [
                    i,
                    j,
                ];

                if (tile.baseTile === 'River') {
                    d.push(Math.round(tile.riverAngle));
                    d.push(tile.riverTemplate);
                } else if (tile.baseTile === 'Grass') {
                    if (tile.hasBottom) {
                        d.push(1);
                    } else {
                        continue;
                    }
                }

                if (!state.tiles[tile.baseTile]) {
                    state.tiles[tile.baseTile] = [];
                }
                state.tiles[tile.baseTile].push(d);
            }
        }
    }

    console.log(state);

    return this.app.compress(JSON.stringify(state));
};

Leveleditor.prototype.load = function (str) {
    const data = this.app.decompress(str);
    if (!data) {
        console.error('failed to decompress level data');
        return;
    }
    const state = JSON.parse(data);
    if (!state) {
        console.error('failed to parse level data');
        return;
    }

    this.level.destroy();
    this.level = new pc.Entity('Level');
    this.app.root.addChild(this.level);

    const levelSize = state.size;
    this.app.levelSize = levelSize;

    const levelSizeHalf = levelSize / 2;
    const tileXSize = this.app.globals.tileXSize;
    const tileYSize = this.app.globals.tileYSize;

    if (!this.app.buildingBatchGroups) {
        const batchGroupN = Math.ceil(levelSize / this.app.globals.batchSize);
        this.app.buildingBatchGroups = new Array(batchGroupN);
        for (let i = 0; i < batchGroupN; i++) {
            this.app.buildingBatchGroups[i] = new Array(batchGroupN);

            for (let j = 0; j < batchGroupN; j++) {
                this.app.buildingBatchGroups[i][j] = this.app.batcher.addGroup('building-' + i + '-' + j, true, 100);
            }
        }
    }

    this.app.tiles = new Array(levelSize);

    for (let i = 0; i < levelSize; i++) {
        this.app.tiles[i] = new Array(levelSize);

        for (let j = 0; j < levelSize; j++) {
            this.app.tiles[i][j] = {
                baseTile: '',
                buildingTile: '',
                hasBottom: false,
            };
        }
    }

    let models = Object.keys(state.tiles);

    for (let k = 0; k < models.length; k++) {
        const model = models[k];
        const ents = state.tiles[model];

        for (let n = 0; n < ents.length; n++) {
            const i = ents[n][0];
            const j = ents[n][1];
            const angle = ents[n][2] || 0;
            const hasBottom = ents[n][2];
            const riverTemplate = ents[n][3];
            const tile = this.app.tiles[i][j];

            let x = (i - levelSizeHalf) * tileXSize;
            const z = (j - levelSizeHalf) * tileYSize;

            if (j % 2 == 0) {
                x += 0.5;
            }

            const y = 0;

            let modelTemplate = model;
            if (model === 'Grass' && hasBottom) {
                modelTemplate = 'Grass With Bottom';
            } else if (model === 'River') {
                modelTemplate = riverTemplate;
            } else if (model === 'Road') {
                modelTemplate = 'path_straight';
            }

            const template = this.app.assets.find(modelTemplate, "template");
            const entity = template.resource.instantiate();

            entity.setPosition(x, y, z);
            entity.setRotation(new pc.Quat().setFromEulerAngles(0, angle, 0));

            const batchGroupId = this.app.buildingBatchGroups[Math.floor(i / this.app.globals.batchSize)][Math.floor(j / this.app.globals.batchSize)].id;
            this.app.setBatchGroupId(entity, batchGroupId);

            this.level.addChild(entity);

            const isBase = [
                'Grass',
                'River',
                'Water',
            ].includes(model);

            if (isBase) {
                tile.baseTile = model;
                tile.base = entity;
                tile.hasBottom = hasBottom;
                tile.isStraightRiver = 0;
            } else {
                tile.buildingTile = model;
                tile.building = entity;
                tile.angle = angle;

                if (model === 'Road') {
                    tile.specialRoad = true;
                }
            }

            tile.x = x;
            tile.y = y;
            tile.z = z;
            tile.i = i;
            tile.j = j;
            tile.bitmap = '000000';
        }
    }

    for (let i = 0; i < levelSize; i++) {
        for (let j = 0; j < levelSize; j++) {
            const tile = this.app.tiles[i][j];
            if (tile.baseTile) {
                continue;
            }

            let x = (i - levelSizeHalf) * tileXSize;
            const z = (j - levelSizeHalf) * tileYSize;

            if (j % 2 == 0) {
                x += 0.5;
            }

            const y = 0;

            const distanceFromCenter = Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2));

            // Make the map round.
            if (distanceFromCenter > (levelSizeHalf * tileYSize)) {
                continue;
            }

            const template = this.app.assets.find('Grass', "template");
            const entity = template.resource.instantiate();

            entity.setPosition(x, y, z);
            entity.setRotation(new pc.Quat().setFromEulerAngles(0, 0, 0));

            const batchGroupId = this.app.buildingBatchGroups[Math.floor(i / this.app.globals.batchSize)][Math.floor(j / this.app.globals.batchSize)].id;
            this.app.setBatchGroupId(entity, batchGroupId);

            this.level.addChild(entity);

            tile.x = x;
            tile.y = y;
            tile.z = z;
            tile.i = i;
            tile.j = j;
            tile.baseTile = 'Grass';
            tile.base = entity;
            tile.hasBottom = false;
            tile.isStraightRiver = 0;
            tile.bitmap = '000000';
        }
    }

    this.app.fire('game:fixroads');
    this.app.fire('game:levelloaded');

    setTimeout(() => {
        this.app.root.findByName('sun').light.updateShadow();
    }, 10);
};
