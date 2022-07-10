// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Roadfixer = pc.createScript('roadfixer');

Roadfixer.prototype.initialize = function () {
    this.app.on('game:fixroads', this.fixRoads, this);
};

Roadfixer.prototype.buildingNeedsFix = function (buildingTile, onlyRoad) {
    return buildingTile === 'Road' || (!onlyRoad && (buildingTile === 'Square' || buildingTile === 'Market'));
};

Roadfixer.prototype.isRoad = function (i, j, onlyRoad, ignoreRiver, y, specialRoad) {
    if (i < 0 || i >= this.app.levelSize || j < 0 || j >= this.app.levelSize) {
        return false;
    }

    const tile = this.app.tiles[i][j];

    if (this.app.placingEntity && this.app.placingEntity.tile[0] === i && this.app.placingEntity.tile[1] === j) {
        if (this.buildingNeedsFix(this.app.placingTileName, onlyRoad)) {
            return true;
        }
    }

    if (ignoreRiver && tile.baseTile === 'River') {
        return false;
    }

    return this.buildingNeedsFix(tile.buildingTile, onlyRoad);
};

Roadfixer.prototype.fixRoads = function () {
    for (let i = 0; i < this.app.levelSize; i++) {
        for (let j = 0; j < this.app.levelSize; j++) {
            const tile = this.app.tiles[i][j];

            if (this.isRoad(i, j, true, false, tile.y, tile.specialRoad)) {
                const isPlacingEntity = this.app.placingEntity && this.app.placingEntity.tile[0] === i && this.app.placingEntity.tile[1] === j && this.app.placingTileName === 'Road';
                const onARiver = false; //this.app.tiles[i][j].baseTile === 'River';
                let bitmap = [
                    this.isRoad((i - 1) + (1 - j % 2), j - 1, false, onARiver, tile.y, tile.specialRoad),
                    this.isRoad((i + 0) + (1 - j % 2), j - 1, false, onARiver, tile.y, tile.specialRoad),
                    this.isRoad(i + 1, j, false, onARiver, tile.y, tile.specialRoad),
                    this.isRoad((i + 0) + (1 - j % 2), j + 1, false, onARiver, tile.y, tile.specialRoad),
                    this.isRoad((i - 1) + (1 - j % 2), j + 1, false, onARiver, tile.y, tile.specialRoad),
                    this.isRoad(i - 1, j, false, onARiver, tile.y, tile.specialRoad),
                ].map(function (x) { return x ? '1' : '0'; }).join('');

                if (bitmap === '000000') {
                    const n = Math.floor(Math.random() * 3);
                    bitmap = '100100'.slice(n) + '100100'.slice(0, n);
                }

                if (isPlacingEntity) {
                    this.fixTile(i, j, bitmap, this.app.placingEntity, this.app.placingEntity, false);
                }

                if (tile.buildingTile === 'Road' && tile.building) {
                    this.fixTile(i, j, bitmap, tile.building, tile, true);
                }
            }
        }
    }
};

Roadfixer.prototype.fixTile = function (i, j, bitmap, tofix, tile, batch) {
    const batchSize = this.app.globals.batchSize;
    const roadTiles = [
        { template: 'path_straight', bitmap: '100100' },
        { template: 'path_end', bitmap: '100000' }, // or path_start
        { template: 'path_intersectionH', bitmap: '111100' },
        { template: 'path_intersectionG', bitmap: '111110' },
        { template: 'path_intersectionF', bitmap: '101010' },
        { template: 'path_intersectionE', bitmap: '110110' },
        { template: 'path_intersectionD', bitmap: '101110' },
        { template: 'path_intersectionC', bitmap: '100110' },
        { template: 'path_intersectionB', bitmap: '101100' },
        { template: 'path_intersectionA', bitmap: '111000' },
        { template: 'path_crossing', bitmap: '111111' },
        { template: 'path_cornerSharp', bitmap: '110000' },
        { template: 'path_corner', bitmap: '101000' },
    ];

    for (let b = 0; b < roadTiles.length; b++) {
        const r = (roadTiles[b].bitmap + roadTiles[b].bitmap).indexOf(bitmap);
        if (r > -1) {
            if ((tile.bitmap + tile.bitmap).indexOf(bitmap) === -1) {
                tile.bitmap = bitmap;

                const template = roadTiles[b].template;
                /*if (template === 'path_end') {
                    if (Math.random() < 0.5) {
                        template = 'path_start';
                    }
                }*/

                const entity = this.app.assets.find(template, "template").resource.instantiate();

                if (batch) {
                    const batchGroupId = this.app.buildingBatchGroups[Math.floor(i / batchSize)][Math.floor(j / batchSize)].id;
                    this.app.setBatchGroupId(entity.children[0], batchGroupId);
                } else {
                    entity.children[0].render.castShadows = false;
                }

                tofix.children[0].destroy();
                entity.children[0].reparent(tofix, 0);
                entity.destroy();
            }

            const angle = (r - 1) * 60;
            tofix.setRotation(new pc.Quat().setFromEulerAngles(0, angle, 0));

            return;
        }
    }
};
