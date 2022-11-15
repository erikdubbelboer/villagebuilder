// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Riverfixer = pc.createScript('riverfixer');

Riverfixer.prototype.initialize = function () {
    this.app.on('game:fixrivers', this.fixRivers, this);
};

Riverfixer.prototype.isRiver = function (i, j, notJustRiver) {
    if (i < 0 || i >= this.app.levelSize || j < 0 || j >= this.app.levelSize) {
        return false;
    }

    const tile = this.app.tiles[i][j];

    if (this.app.placingEntity && this.app.placingEntity.tile[0] === i && this.app.placingEntity.tile[1] === j) {
        if (this.app.placingTileName === 'River') {
            return true;
        }
    }

    if (notJustRiver && (tile.baseTile === 'Water' || !tile.baseTile)) {
        return true;
    }

    return tile.baseTile === 'River';
};

Riverfixer.prototype.fixRivers = function () {
    for (let i = 0; i < this.app.levelSize; i++) {
        for (let j = 0; j < this.app.levelSize; j++) {
            const tile = this.app.tiles[i][j];

            if (this.isRiver(i, j, false)) {
                const isPlacingEntity = this.app.placingEntity && this.app.placingEntity.tile[0] === i && this.app.placingEntity.tile[1] === j && this.app.placingTileName === 'River';
                let bitmap = [
                    this.isRiver((i - 1) + (1 - j % 2), j - 1, true),
                    this.isRiver((i + 0) + (1 - j % 2), j - 1, true),
                    this.isRiver(i + 1, j, true),
                    this.isRiver((i + 0) + (1 - j % 2), j + 1, true),
                    this.isRiver((i - 1) + (1 - j % 2), j + 1, true),
                    this.isRiver(i - 1, j, true),
                ].map(function (x) { return x ? '1' : '0'; }).join('');

                if (bitmap === '000000') {
                    const n = Math.floor(Math.random() * 3);
                    bitmap = '100100'.slice(n) + '100100'.slice(0, n);
                }

                if (isPlacingEntity) {
                    this.fixTile(i, j, bitmap, this.app.placingEntity, this.app.placingEntity, false);
                }

                if (tile.baseTile === 'River' && tile.base) {
                    this.fixTile(i, j, bitmap, tile.base, tile, true);
                }
            }
        }
    }
};

Riverfixer.prototype.fixTile = function (i, j, bitmap, tofix, tile, batch) {
    const batchSize = this.app.globals.batchSize;
    const riverTiles = [
        { template: 'river_straight', bitmap: '100100' },
        { template: 'river_start', bitmap: '100000' },
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

    for (let b = 0; b < riverTiles.length; b++) {
        const r = (riverTiles[b].bitmap + riverTiles[b].bitmap).indexOf(bitmap);
        if (r > -1) {
            const template = riverTiles[b].template;
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

            tile.isStraightRiver = 0;
            if (template === 'river_straight') {
                tile.isStraightRiver = 1;
            } else if (template === 'river_corner') {
                tile.isStraightRiver = 2;
            }

            const angle = (r - 1) * 60;
            tofix.setRotation(new pc.Quat().setFromEulerAngles(0, angle, 0));

            tile.riverTemplate = template;
            tile.riverAngle = angle;

            return;
        }
    }
};
