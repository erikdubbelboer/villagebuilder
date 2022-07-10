// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Grid = pc.createScript('grid');

Grid.prototype.initialize = function () {
    this.app.on('game:showgrid', this.showGrid, this);
    this.app.on('game:hidegrid', this.hideGrid, this);
    this.app.on('game:destroygrid', this.destroyGrid, this);

    this.grid = null;
    this.previousTiles = [];

    this.gridBatchGroup = this.app.batcher.addGroup('Grid', true, 1000).id;

    this.normal = this.createMaterial('#00000066', false);
    this.red = this.createMaterial('#00000066', '#ff0000aa');
    this.green = this.createMaterial('#00000066', '#0000aaaa');
};

Grid.prototype.createMaterial = function (color, fill) {
    const w = 28;
    const h = 32;
    const a = 2 * Math.PI / 6;
    const lw = 2;
    const r = 32 - (lw / 2);

    const texture = new pc.Texture(this.app.graphicsDevice, {
        width: w * 2,
        height: h * 2,
        format: pc.PIXELFORMAT_R8_G8_B8_A8,
        mipmaps: false,
        anisotropy: 1,
    });

    texture.minFilter = pc.FILTER_LINEAR;
    texture.magFilter = pc.FILTER_LINEAR;
    texture.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
    texture.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
    texture.addressW = pc.ADDRESS_CLAMP_TO_EDGE;

    const canvas = document.createElement('canvas');

    canvas.width = w * 2;
    canvas.height = h * 2;

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#00000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = lw;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        ctx.lineTo(w + r * Math.cos(0.5 + a * i), h + r * Math.sin(0.5 + a * i));
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.stroke();
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }

    texture.setSource(canvas);

    const material = new pc.StandardMaterial();
    material.diffuse.set(0, 0, 0);
    material.diffuseMap = texture;
    material.opacity = 0.5;
    material.blendType = pc.BLEND_NORMAL;
    material.opacityMap = texture;
    material.opacityMapUv = 0;
    material.opacityMapChannel = 'a';
    material.depthWrite = false;
    material.update();

    return material;
};

Grid.prototype.hideGrid = function () {
    if (!this.grid) {
        return;
    }

    this.entity.children[0].enabled = false;
};

Grid.prototype.createGrid = function () {
    const levelSize = this.app.levelSize;

    this.grid = new Array(levelSize);

    for (let i = 0; i < levelSize; i++) {
        this.grid[i] = new Array(levelSize);

        for (let j = 0; j < levelSize; j++) {
            const tile = this.app.tiles[i][j];

            if (tile.baseTile === 'Water' || (tile.baseTile === '' && !tile.buildingTile)) {
                continue;
            }

            const entity = new pc.Entity();
            entity.name = 'grid';
            entity.addComponent('render', {
                type: 'plane',
            });

            entity.render.castShadows = false;
            entity.render.batchGroupId = this.gridBatchGroup;
            entity.render.meshInstances[0].material = this.normal;
            entity.setPosition(tile.x, tile.y + 0.21, tile.z);
            entity.setLocalScale(1, 1, 1.12);

            this.entity.children[0].addChild(entity);

            this.grid[i][j] = entity;
        }
    }
};

Grid.prototype.showGrid = function (i, j, offsets) {
    if (!this.grid) {
        this.createGrid();
    }

    this.entity.children[0].enabled = true;

    while (this.previousTiles.length > 0) {
        this.previousTiles.pop().render.meshInstances[0].material = this.normal;
    }

    const levelSize = this.app.levelSize;

    if (offsets) {
        offsets.forEach(t => {
            const tj = j + t.j;
            let ti = i + t.i;
            if (j % 2 === 0 && tj % 2 !== 0) {
                ti++;
            }

            if (ti < 0 || ti >= levelSize || tj < 0 || tj >= levelSize) {
                return;
            }

            const g = this.grid[ti][tj];
            if (g) {
                if (t.can) {
                    g.render.meshInstances[0].material = this.green;
                } else {
                    g.render.meshInstances[0].material = this.red;
                }

                this.previousTiles.push(g);
            }
        });
    }

    this.app.batcher.markGroupDirty(this.gridBatchGroup);
};

Grid.prototype.destroyGrid = function () {
    const levelSize = this.app.levelSize;

    this.hideGrid();

    if (this.grid) {
        for (let i = 0; i < levelSize; i++) {
            for (let j = 0; j < levelSize; j++) {
                const g = this.grid[i][j];
                if (g) {
                    g.destroy();
                }
            }
        }
    }

    this.grid = null;
    this.previousTiles = [];
};
