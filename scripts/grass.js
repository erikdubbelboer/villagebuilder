// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Grass = pc.createScript('grass');

Grass.attributes.add('levelSeed', {
    title: 'Seed',
    description: 'Level seed, 0 for random.',
    type: 'number',
    default: 0,
});

Grass.attributes.add('levelSize', {
    title: 'Size',
    description: 'Size of the level in tiles.',
    type: 'number',
    default: 30,
});

Grass.attributes.add('waterSize', {
    title: 'Water Size',
    description: 'Size of water in tiles.',
    type: 'number',
    default: 3,
});

Grass.attributes.add('waterOffset', {
    title: 'Water Offset',
    description: 'How far the water is placed from the edge.',
    type: 'number',
    default: 7,
});

Grass.attributes.add('forestNew', {
    title: 'Forest New',
    description: 'Chance in % for a tile to be a new Forest tile.',
    type: 'number',
    default: 5,
});

Grass.attributes.add('forestNear', {
    title: 'Forest Near',
    description: 'Chance in % for a tile to be a Forest tile if the neighbor is already a Forest tile.',
    type: 'number',
    default: 40,
});

Grass.attributes.add('rocks', {
    title: 'Rocks',
    description: 'How many rocky spots the level should have.',
    type: 'number',
    default: 2,
});

Grass.attributes.add('rocksNew', {
    title: 'Rock New',
    description: 'Chance in % for a rocky tile near a rock spot.',
    type: 'number',
    default: 1,
});

Grass.attributes.add('rocksNear', {
    title: 'Rock Near',
    description: 'Chance in % for a tile to be a rocky tile if the neighbor is already a rocky tile.',
    type: 'number',
    default: 10,
});

Grass.attributes.add('waterRocks', {
    title: 'Water Rock',
    description: 'Change in % for a Water tile to be a Water Rock tile.',
    type: 'number',
    default: 2,
});

Grass.attributes.add('river', {
    title: 'River',
    description: 'Put a river in the map or not.',
    type: 'boolean',
    default: true,
});

Grass.attributes.add('island', {
    title: 'Island',
    type: 'boolean',
    default: false,
});

Grass.attributes.add('snow', {
    title: 'Snow',
    type: 'boolean',
    default: false,
});

Grass.attributes.add('mountain', {
    title: 'Mountain',
    type: 'boolean',
    default: false,
});

Grass.attributes.add('fields', {
    title: 'Fields',
    description: 'How many field spots the level should have.',
    type: 'number',
    default: 0.2,
});

function mulberry32(a) {
    return function () {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

Grass.prototype.initialize = function () {
    /*const gd = this.app.graphicsDevice;
    const vertexShader = this.app.assets.find('grass_vertex', "shader").resource;
    const fragmentShader = "precision " + gd.precision + " float;\n" + this.app.assets.find('grass_fragment', "shader").resource;

    const shaderDefinition = {
        attributes: {
            aPosition: pc.SEMANTIC_POSITION,
            instance_line1: pc.SEMANTIC_ATTR12,
            instance_line2: pc.SEMANTIC_ATTR13,
            instance_line3: pc.SEMANTIC_ATTR14,
            instance_line4: pc.SEMANTIC_ATTR15,
        },
        vshader: vertexShader,
        fshader: fragmentShader,
    };

    this.grassMaterial = new pc.Material();
    this.grassMaterial.shader = new pc.Shader(gd, shaderDefinition);

    this.grassMaterial.setParameter('uTime', 0.5);
    this.grassMaterial.setParameter('uRotation', 0);
    this.grassMaterial.setParameter('uHeightMap', this.app.assets.find('grass_wind.png', 'texture').resource);
    this.snow = true;*/

    let seed = this.levelSeed;
    if (seed === 0) {
        seed = Math.floor(Math.random() * 100000);

        this.app.levelState.levelSeed = seed;

        console.log('level seed: ' + seed);
    }
    this.random = mulberry32(seed);

    const levelSize = this.levelSize;
    this.app.levelSize = levelSize;

    this.app.levelStoneHillsLeft = 0;
    this.app.levelGrassHillsLeft = 0;
    this.app.levelFishingHutLeft = 0;
    this.app.mountain = this.mountain;
    this.app.hasRiver = this.river;

    const levelSizeHalf = levelSize / 2;
    const levelDiagonal = Math.sqrt(Math.pow(levelSize - 1, 2) + Math.pow(levelSize - 1, 2));
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
                bitmap: '000000',
            };
        }
    }

    const waterBase = [levelSize - this.waterOffset, levelSize - this.waterOffset];

    const pathOffset = levelSizeHalf / 10;
    const pathBase = [
        Math.round(levelSizeHalf + (pathOffset - (Math.round(this.random() * pathOffset * 2)))),
        Math.round(levelSizeHalf + (pathOffset - (Math.round(this.random() * pathOffset * 2)))),
    ];
    const pathBaseI = Math.round(levelSizeHalf - 5);

    const riverBaseI = Math.round(levelSizeHalf);

    const mountains = new Array(Math.ceil(this.random() * this.rocks));
    for (let i = 0; i < mountains.length; i++) {
        mountains[i] = [Math.floor(this.random() * levelSize), Math.floor(this.random() * levelSize)];
    }

    let pathPlaced = true;
    let skipPath = 0;
    let pathStarted = false;
    let riverStarted = false;
    let riverPlaced = true;
    let skipRiver = 0;
    let riversPlaced = 0;
    let singleRiver = true;
    let lastRiverI = 0;
    let riverReachedWater = false;

    for (let j = 0; j < levelSize; j++) {
        pathPlaced = false;
        skipPath = (this.random() < (this.mountain ? 0.6 : 0.5)) ? 1 : 0;
        riverPlaced = false;

        singleRiver = riversPlaced > 1;
        if (singleRiver) {
            skipRiver = riversPlaced - 0;
        } else {
            skipRiver = (this.random() < ((this.mountain ? 0.2 : 0.4) + (waterBase[0] - lastRiverI) / levelSizeHalf) ? 1 : 0);
        }
        if (skipRiver === 0) {
            singleRiver = true;
        }
        riversPlaced = 0;

        for (let i = 0; i < levelSize; i++) {
            const z = (j - levelSizeHalf) * tileYSize;
            let x = (i - levelSizeHalf) * tileXSize;
            if (j % 2 == 0) {
                x += 0.5;
            }

            let y = 0;
            if (this.mountain) {
                const sx = x - (levelSize * tileXSize * 0.5);
                const sz = z - (levelSize * tileYSize * 0.5);
                y = Math.min(Math.floor(sx * sz * 0.006), 12) * 0.15;
            }

            const distanceFromCenter = Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2));

            // Make the map round.
            if (distanceFromCenter > (levelSizeHalf * tileYSize)) {
                continue;
            }

            const isNeighborWater = this.isNeighbor(i, j, 'Water');
            const isNeighborRiver = this.isNeighbor(i, j, 'River');
            const isNeighborRocky = this.isNeighbor(i, j, 'Mountain') || this.isNeighbor(i, j, 'Stone Rocks') || this.isNeighbor(i, j, 'Stone Hill') || this.isNeighbor(i, j, 'Grass Hill');
            let isWater = Math.sqrt(Math.pow(waterBase[0] - i, 2) + Math.pow(waterBase[1] - j, 2)) < this.waterSize || (isNeighborWater && (this.random() < 0.2));

            if (this.island) {
                const islandRandomness = 3;
                const outsideOfIsland = distanceFromCenter - ((levelSizeHalf * tileYSize) - islandRandomness);
                if (outsideOfIsland > 0) {
                    if (this.random() * islandRandomness * 0.5 < outsideOfIsland) {
                        isWater = true;
                    }
                }
            }

            if (isWater && !riverReachedWater && isNeighborRiver) {
                riverReachedWater = true;
            }

            let isRiver = !riverStarted && (i === riverBaseI);

            if (!riverReachedWater && !isWater && !isRiver && !riverPlaced && isNeighborRiver) {
                if (skipRiver === 0) {
                    if (this.random() < 0.6) {
                        riverPlaced = true;
                    }
                    if (singleRiver) {
                        riverPlaced = true;
                    }
                    isRiver = true;
                    lastRiverI = i;
                    riversPlaced++;
                } else {
                    skipRiver--;
                }
            }

            if (isRiver) {
                riverStarted = true;
            }

            if (!this.river) {
                isRiver = false;
            }

            let isRoad = !isWater && (i === pathBase[0] && j === pathBase[1]);
            if (this.mountain) {
                isRoad = !pathStarted && (i === pathBaseI);
                if (isRoad) {
                    pathPlaced = true;
                }
            }

            if (!isWater && !isRoad && !pathPlaced && this.isNeighbor(i, j, 'Road')) {
                if (skipPath === 0) {
                    pathPlaced = true;
                    isRoad = true;
                } else {
                    skipPath--;
                }
            }

            if (this.island) {
                if (distanceFromCenter > (levelSizeHalf * tileYSize) / 2) {
                    isRoad = false;
                }
            }

            if (isRoad) {
                pathStarted = true;
            }

            const isForest = (!isWater && !isRiver && !isRoad) && this.random() < (this.isNeighbor(i, j, 'Forest') ? (this.forestNear / 100) : (this.forestNew / 100));
            let isGrassHill = false;
            let isStoneHill = false;
            let isMountain = false;
            let isStoneRocks = false;

            if (mountains.length > 0) {
                const rockDistance = mountains.map(m => {
                    return Math.sqrt(Math.pow(m[0] - i, 2) + Math.pow(m[1] - j, 2));
                }).reduce(function (a, b) {
                    return Math.min(a, b);
                });

                let rockyChance = (((levelDiagonal - rockDistance) / levelDiagonal) * ((isNeighborRocky ? this.rocksNear : this.rocksNew) / 100));
                if (y > 0.2) {
                    rockyChance += 0.05;
                }


                if (!isWater && !isRiver && !isRoad && !isForest && !isNeighborWater) {
                    if (this.random() < rockyChance) {
                        const r = this.random();
                        /*if (r < 0.5) {
                            isGrassHill = true;
                        } else if (r < 0.66) {
                            isStoneHill = true;
                        } else if (r < 0.75) {
                            isMountain = true;
                        } else {
                            isStoneRocks = true;
                        }*/
                        if (r < 0.5) {
                            isGrassHill = true;
                        } else {
                            isStoneHill = true;
                        }
                    } else if (this.mountain && y > 0.2 && this.random() < 0.05) {
                        isStoneRocks = true;
                    }
                }
            }

            const isWaterRocks = isWater && this.random() < (this.waterRocks / 100);

            let baseTile = '';
            let buildingTile = '';

            if (isWater && !isWaterRocks) {
                baseTile = 'Water';
                buildingTile = '';
            } else if (isRiver) {
                baseTile = 'River';
                buildingTile = '';
            } else if (isForest) {
                baseTile = 'Grass';
                buildingTile = 'Forest';
            } else if (isStoneHill) {
                baseTile = 'Grass';
                buildingTile = 'Stone Hill';
                this.app.levelStoneHillsLeft++;
            } else if (isMountain) {
                baseTile = '';
                buildingTile = 'Mountain';
            } else if (isStoneRocks) {
                baseTile = '';
                buildingTile = 'Stone Rocks';
            } else if (isGrassHill) {
                baseTile = 'Grass';
                buildingTile = 'Grass Hill';
                this.app.levelGrassHillsLeft++;
            } else if (isRoad) {
                baseTile = 'Grass';
                buildingTile = 'Road';
            } else if (isWaterRocks) {
                baseTile = 'Water';
                buildingTile = 'Water Rocks';
            } else {
                baseTile = 'Grass';
                buildingTile = '';
            }

            if (baseTile === '' && this.isNeighborLower(i, j)) {
                baseTile = 'Grass';
            }

            this.app.tiles[i][j].baseTile = baseTile;
            this.app.tiles[i][j].buildingTile = buildingTile;

            if (isRoad) {
                this.app.tiles[i][j].specialRoad = true;
            }
        }
    }

    /*for (let i = 0; i < levelSize; i++) {
        for (let j = 0; j < levelSize; j++) {
            const tile = this.app.tiles[i][j];

            if (tile.baseTile === 'Grass' && !tile.buildingTile) {
                if (this.isOnlyNeighbor(i, j, 'Grass')) {
                    if (this.random() < this.fields) {
                        tile.buildingTile = 'Field';
                    }
                }
            }
        }
    }*/

    this.j = 0;
    this.i = -1;
    this.z = -levelSizeHalf * tileYSize;
    this.x = (-levelSizeHalf * tileXSize) + 0.5;

    this.instanceEntities = {};
    this.instanceMaterials = {};
    this.childNames = {};
    this.childOffsetMatrices = {};
    this.childMatrices = {};
    this.childMatriceIndexes = {};
    this.vertexBuffers = [];

    this.on('destroy', () => {
        while (this.vertexBuffers.length > 0) {
            this.vertexBuffers.pop().destroy();
        }

        Object.values(this.instanceEntities).forEach(entity => {
            entity.destroy();
        });

        Object.values(this.instanceMaterials).forEach(material => {
            material.destroy();
        });

        delete this.instanceEntities;
        delete this.instanceMaterials;
    });
};

/*let completelyDone = false;
let gtime = 0;
let lastRotation = 0;
Grass.prototype.update = function(dt) {
    if (this.reverse) {
        gtime += dt * 0.5;
    } else {
        gtime -= dt * 0.5;
    }
 
    if (gtime > 1) {
        gtime = 1;
        this.reverse = false;
        lastRotation += 0.25;
        if (lastRotation >= 1) {
            lastRotation = 0;
        }
        this.grassMaterial.setParameter('uRotation', lastRotation);
    } else if (gtime < 0) {
        gtime = 0;
        this.reverse = true;
    }
 
    this.grassMaterial.setParameter('uTime', gtime);
    if (completelyDone) {
        return;
    }*/
Grass.prototype.update = function () {
    const end = performance.now() + 10;
    let done = false;
    do {
        done = this.step();
        if (done) {
            break;
        }
    } while (performance.now() < end);

    this.app.fire('game:fixroads');

    this.updateInstance();

    if (done) {
        delete this.childNames;
        delete this.childOffsetMatrices;
        delete this.childMatrices;
        delete this.childMatriceIndexes;

        this.enabled = false;
        //completelyDone = true;
    }
};

Grass.prototype.step = function () {
    const levelSize = this.levelSize;
    const batchSize = this.app.globals.batchSize;
    const tileXSize = this.app.globals.tileXSize;
    const tileYSize = this.app.globals.tileYSize;

    this.i++;

    if (this.i >= levelSize) {
        this.j++;

        if (this.j >= levelSize) {
            this.updateLevelFishingHutLeft();
            this.app.fire('game:levelloaded');
            return true;
        }

        this.z += tileYSize;

        this.i = 0;

        this.x = (-levelSize / 2) * tileXSize;

        if (this.j % 2 == 0) {
            this.x += 0.5;
        }
    }

    const i = this.i;
    const j = this.j;
    const x = this.x;
    const z = this.z;
    const tile = this.app.tiles[i][j];

    let y = 0;

    if (this.mountain) {
        y = this.getHeight(i, j);
    }

    let baseModel = tile.baseTile;
    let building = null;
    let angle = Math.floor(pc.math.random(0, 6)) * 60;

    if (baseModel === 'River') {
        const r = this.getRiverModelAndRotation(i, j);
        baseModel = r[0];
        angle = r[1];
    }

    if (this.isNeighbor(i, j, 'Water') || this.isNeighborLower(i, j) || this.isNeighborEdge(i, j)) {
        if (baseModel === 'Grass' || (baseModel === '' && tile.buildingTile !== '')) {
            baseModel = 'Grass With Bottom';
        }
    }

    if (tile.buildingTile !== '') {
        if (tile.buildingTile === 'Forest') {
            this.addInstance(tile.buildingTile, x, y, z, angle);
        } else {
            building = this.app.assets.find(this.nameToModel(tile.buildingTile), "template").resource.instantiate();
            building.setPosition(x, y, z);

            this.app.setBatchGroupId(building, this.app.buildingBatchGroups[Math.floor(i / batchSize)][Math.floor(j / batchSize)].id);

            this.entity.addChild(building);
        }
    }

    if (baseModel !== '') {
        this.addInstance(baseModel, x, y, z, angle);
    }

    let isStraightRiver = 0;
    if (baseModel === 'river_straight') {
        isStraightRiver = 1;
    } else if (baseModel === 'river_corner') {
        isStraightRiver = 2;
    }

    this.app.tiles[i][j] = {
        x: x,
        y: y,
        z: z,
        i: i,
        j: j,
        baseTile: tile.baseTile,
        buildingTile: tile.buildingTile,
        building: building,
        scoreEntity: null,
        bitmap: '000000',
        isStraightRiver: isStraightRiver,
        angle: angle,
        specialRoad: tile.specialRoad,
    };

    this.x += tileXSize;

    return false;
};

Grass.prototype.addInstance = function (model, x, y, z, angle) {
    const isBelow = y <= 0.2;

    const entityKey = model + (isBelow ? '0' : '1');

    if (!this.instanceEntities[entityKey]) {
        const entity = this.app.assets.find(model, "template").resource.instantiate();
        this.instanceEntities[entityKey] = entity;

        this.entity.addChild(entity);

        this.childNames[entityKey] = [];
        this.childOffsetMatrices[entityKey] = [];
        this.childMatrices[entityKey] = {};
        this.childMatriceIndexes[entityKey] = {};

        for (let c = 0; c < entity.children.length; c++) {
            const child = entity.children[c];

            const matrix = new pc.Mat4();
            matrix.setTRS(child.getLocalPosition(), child.getLocalRotation(), child.getLocalScale());

            this.childNames[entityKey].push(child.name);
            this.childOffsetMatrices[entityKey].push(matrix);

            for (let m = 0; m < child.render.meshInstances.length; m++) {
                const meshInstance = child.render.meshInstances[m];
                let materialName = meshInstance.material.name;

                if (this.snow && materialName === 'grass') {
                    materialName = 'snow';
                }
                if (this.mountain && materialName === 'grass') {
                    if (y > 0.2) {
                        materialName = 'stone';
                    }
                }

                if (this.instanceMaterials[materialName]) {
                    meshInstance.material = this.instanceMaterials[materialName];
                } else {
                    let material;

                    if (this.mountain && materialName === 'stone') {
                        material = this.app.assets.find('stone', "material").resource.clone();
                    } else if (this.snow && materialName === 'snow') {
                        material = this.app.assets.find('snow', "material").resource.clone();
                        //material = this.grassMaterial.clone();
                    } else {
                        material = meshInstance.material.clone();
                    }

                    material.onUpdateShader = function (options) {
                        options.useInstancing = true;
                        return options;
                    };
                    material.update();
                    meshInstance.material = material;

                    this.instanceMaterials[materialName] = material;
                }
            }

            if (!this.childMatrices[entityKey][child.name]) {
                this.childMatrices[entityKey][child.name] = [new Float32Array(16384 * 16)];
                this.childMatriceIndexes[entityKey][child.name] = [0];
            } else {
                child.enabled = false;
            }
        }
    }

    const matrix = new pc.Mat4();
    matrix.setTRS(
        new pc.Vec3(x, y, z),
        new pc.Quat().setFromEulerAngles(0, angle, 0),
        this.instanceEntities[entityKey].getScale()
    );

    for (let c = 0; c < this.childNames[entityKey].length; c++) {
        const lm = new pc.Mat4();
        lm.mul2(matrix, this.childOffsetMatrices[entityKey][c]);

        const childName = this.childNames[entityKey][c];

        if (this.childMatriceIndexes[entityKey][childName][0] == this.childMatrices[entityKey][childName][0].length) {
            this.childMatriceIndexes[entityKey][childName].unshift(0);
            this.childMatrices[entityKey][childName].unshift(new Float32Array(16384 * 16));
        }

        for (let m = 0; m < 16; m++) {
            this.childMatrices[entityKey][childName][0][this.childMatriceIndexes[entityKey][childName][0]++] = lm.data[m];
        }
    }
};

Grass.prototype.updateInstance = function () {
    while (this.vertexBuffers.length > 0) {
        this.vertexBuffers.pop().destroy();
    }

    const entityNames = Object.keys(this.instanceEntities);
    for (let i = 0; i < entityNames.length; i++) {
        const baseModel = entityNames[i];
        const entity = this.instanceEntities[baseModel];

        const uniqueChilds = {};

        for (let c = 0; c < entity.children.length; c++) {
            const child = entity.children[c];
            const name = child.name;

            if (uniqueChilds[name]) {
                continue;
            }
            uniqueChilds[name] = true;

            for (let j = 0; j < this.childMatriceIndexes[baseModel][name].length; j++) {
                const indexes = this.childMatriceIndexes[baseModel][name][j];

                if (indexes === 0) {
                    continue;
                }

                const vertexBuffer = new pc.VertexBuffer(
                    this.app.graphicsDevice,
                    pc.VertexFormat.defaultInstancingFormat,
                    indexes / 16,
                    pc.BUFFER_STATIC,
                    this.childMatrices[baseModel][name][j].slice(0, indexes)
                );

                this.vertexBuffers.push(vertexBuffer);

                for (let m = 0; m < child.render.meshInstances.length; m++) {
                    child.render.meshInstances[m].setInstancing(vertexBuffer);
                }
            }
        }
    }
};

Grass.prototype.getRiverModelAndRotation = function (i, j) {
    const riverTiles = [
        { template: 'river_straight', bitmap: '100100' },
        { template: 'river_start', bitmap: '100000' }, // or river_end
        { template: 'river_intersectionH', bitmap: '111100' },
        { template: 'river_intersectionG', bitmap: '111110' },
        { template: 'river_intersectionF', bitmap: '101010' },
        { template: 'river_intersectionE', bitmap: '110110' },
        { template: 'river_intersectionD', bitmap: '101110' },
        { template: 'river_intersectionC', bitmap: '100110' },
        { template: 'river_intersectionB', bitmap: '101100' },
        { template: 'river_intersectionA', bitmap: '111000' },
        { template: 'river_crossing', bitmap: '111111' },
        { template: 'river_cornerSharp', bitmap: '110000' },
        { template: 'river_corner', bitmap: '101000' },
    ];

    let bitmap = [
        this.isRiver((i - 1) + (1 - j % 2), j - 1),
        this.isRiver((i + 0) + (1 - j % 2), j - 1),
        this.isRiver(i + 1, j),
        this.isRiver((i + 0) + (1 - j % 2), j + 1),
        this.isRiver((i - 1) + (1 - j % 2), j + 1),
        this.isRiver(i - 1, j),
    ].map(function (x) { return x ? '1' : '0'; }).join('');

    if (bitmap === '000000') {
        const n = Math.floor(Math.random() * 3);
        bitmap = '100100'.slice(n) + '100100'.slice(0, n);
    }

    for (let b = 0; b < riverTiles.length; b++) {
        const r = (riverTiles[b].bitmap + riverTiles[b].bitmap).indexOf(bitmap);
        if (r > -1) {
            const angle = (r - 1) * 60;

            return [riverTiles[b].template, angle];
        }
    }

    return ['river_straight', 0];
};

Grass.prototype.isTile = function (i, j, tile, orInvalid, onlyBase) {
    if (i < 0 || i >= this.levelSize || j < 0 || j >= this.levelSize) {
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

Grass.prototype.isNeighbor = function (i, j, tile) {
    if (this.isTile((i - 1) + (1 - j % 2), j - 1, tile, false, false)) return true;
    if (this.isTile((i + 0) + (1 - j % 2), j - 1, tile, false, false)) return true;
    if (this.isTile(i + 1, j, tile, false, false)) return true;
    if (this.isTile((i + 0) + (1 - j % 2), j + 1, tile, false, false)) return true;
    if (this.isTile((i - 1) + (1 - j % 2), j + 1, tile, false, false)) return true;
    if (this.isTile(i - 1, j, tile, false, false)) return true;
    return false;
};

Grass.prototype.isOnlyNeighbor = function (i, j, tile) {
    if (!this.isTile((i - 1) + (1 - j % 2), j - 1, tile, false, true)) return false;
    if (!this.isTile((i + 0) + (1 - j % 2), j - 1, tile, false, true)) return false;
    if (!this.isTile(i + 1, j, tile, false, true)) return false;
    if (!this.isTile((i + 0) + (1 - j % 2), j + 1, tile, false, true)) return false;
    if (!this.isTile((i - 1) + (1 - j % 2), j + 1, tile, false, true)) return false;
    if (!this.isTile(i - 1, j, tile, false, true)) return false;
    return true;
};

Grass.prototype.isNoTile = function (i, j) {
    if (i < 0 || i >= this.levelSize || j < 0 || j >= this.levelSize) {
        return true;
    }

    const t = this.app.tiles[i][j];

    if (!t.baseTile && !t.buildingTile) {
        return true;
    }

    return false;
};

Grass.prototype.isNeighborEdge = function (i, j) {
    if (this.isNoTile((i - 1) + (1 - j % 2), j - 1)) return true;
    if (this.isNoTile((i + 0) + (1 - j % 2), j - 1)) return true;
    if (this.isNoTile(i + 1, j)) return true;
    if (this.isNoTile((i + 0) + (1 - j % 2), j + 1)) return true;
    if (this.isNoTile((i - 1) + (1 - j % 2), j + 1)) return true;
    if (this.isNoTile(i - 1, j)) return true;
    return false;
};

Grass.prototype.getHeight = function (i, j) {
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

Grass.prototype.isNeighborLower = function (i, j) {
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

Grass.prototype.isRiver = function (i, j) {
    if (i < 0 || i >= this.levelSize || j < 0 || j >= this.levelSize) {
        return false;
    }

    const tile = this.app.tiles[i][j].baseTile;

    return tile === 'River' || tile === 'Water';
};

Grass.prototype.nameToModel = function (name) {
    if (name === 'Road') {
        return 'path_straight';
    }
    return name;
};

Grass.prototype.updateLevelFishingHutLeft = function () {
    this.app.levelFishingHutLeft = 0;

    for (let i = 1; i < this.app.levelSize - 1; i++) {
        for (let j = 1; j < this.app.levelSize - 1; j++) {
            if (!this.isTile(i, j, 'Water', false, false)) {
                continue;
            }

            if (this.app.tiles[i][j].buildingTile !== '') {
                continue;
            }

            const bitmap = [
                this.isTile(i - 1, j, 'Water', true, false),
                this.isTile((i - 1) + (1 - j % 2), j + 1, 'Water', true, false),
                this.isTile((i + 0) + (1 - j % 2), j + 1, 'Water', true, false),
                this.isTile(i + 1, j, 'Water', true, false),
                this.isTile((i + 0) + (1 - j % 2), j - 1, 'Water', true, false),
                this.isTile((i - 1) + (1 - j % 2), j - 1, 'Water', true, false),
            ].map(function (x) { return x ? '1' : '0'; }).join('');

            let r = (bitmap + bitmap).indexOf('111000');
            if (r === -1) {
                r = (bitmap + bitmap).indexOf('110000');
            }
            if (r > -1 && !this.isNeighbor(i, j, 'River')) {
                this.app.levelFishingHutLeft++;
            }
        }
    }
};
