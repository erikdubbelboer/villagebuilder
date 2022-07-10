// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Wind = pc.createScript('wind');

Wind.attributes.add('vs', {
    type: 'asset',
    assetType: 'shader',
    title: 'Vertex Shader'
});

Wind.attributes.add('fs', {
    type: 'asset',
    assetType: 'shader',
    title: 'Fragment Shader'
});

Wind.attributes.add('uDiffuseMap', {
    type: 'asset',
    assetType: 'texture',
    title: 'Grid Map'
});

Wind.attributes.add('linesMap', {
    type: 'asset',
    assetType: 'texture',
    title: 'Line Map'
});

Wind.prototype.initialize = function () {
    this.time = 0;
    this.speed = 0.4;
    this.windDirection = 90;

    this.gusts = [];

    const shaderDefinition = {
        attributes: {
            aPosition: pc.SEMANTIC_POSITION,
            aUv0: pc.SEMANTIC_TEXCOORD0
        },
        vshader: this.vs.resource,
        fshader: "precision " + this.app.graphicsDevice.precision + " float;\n" + this.fs.resource,
    };

    const shader = new pc.Shader(this.app.graphicsDevice, shaderDefinition);

    this.material = new pc.Material();
    this.material.blendType = pc.BLEND_NORMAL;
    this.material.shader = shader;

    this.material.setParameter('time', 0);
    this.material.setParameter('uDiffuseMap', this.uDiffuseMap.resource);
    this.material.setParameter('linesMap', this.linesMap.resource);

    for (let i = 0; i < 10; i++) {
        const entity = new pc.Entity();
        entity.name = 'Gust';
        entity.addComponent('render', {
            type: 'plane'
        });
        entity.render.castShadows = false;
        entity.render.meshInstances[0].material = this.material;

        this.entity.addChild(entity);

        this.gusts.push(entity);
    }
    this.update(2);
};

Wind.prototype.update = function (dt) {
    this.time += dt * this.speed;

    if (this.time > 2) {
        this.time = 0;

        this.windDirection += Math.random() * 20;
        this.speed = 0.4 + Math.random() * 0.4;

        const areas = this.openAreas();

        for (let i = 0; i < this.gusts.length; i++) {
            if (areas.length === 0) {
                this.gusts[i].enabled = false;
            } else {
                this.gusts[i].enabled = true;
            }
            const a = areas.splice(Math.floor(Math.random() * areas.length), 1)[0];
            const x = a[0]; //(Math.random() - 0.5) * this.app.levelSize * this.app.globals.tileXSize * 0.8;
            const z = a[1]; //(Math.random() - 0.5) * this.app.levelSize * this.app.globals.tileYSize * 0.8;

            const scale = 4 + Math.random() * 2;
            this.gusts[i].setLocalScale(scale, scale, scale);
            this.gusts[i].setRotation(new pc.Quat().setFromEulerAngles(0, this.windDirection, 0));
            this.gusts[i].setPosition(new pc.Vec3(x, 0.2, z));
        }
    }

    if (this.material) {
        this.material.setParameter('time', this.time);
    }
};

Wind.prototype.isTile = function (i, j, tile) {
    if (i < 0 || i >= this.app.levelSize || j < 0 || j >= this.app.levelSize) {
        return false;
    }

    const t = this.app.tiles[i][j];

    return t.baseTile === tile;
};

Wind.prototype.openAreas = function () {
    const levelSize = this.app.levelSize;
    const levelSizeHalf = levelSize / 2;
    const tileXSize = this.app.globals.tileXSize;
    const tileYSize = this.app.globals.tileYSize;
    const areas = [];

    for (let i = 0; i < levelSize; i++) {
        for (let j = 0; j < levelSize; j++) {

            if (this.isTile(i - 1, j, 'Grass') &&
                this.isTile((i - 1) + (1 - j % 2), j + 1, 'Grass') &&
                this.isTile((i + 0) + (1 - j % 2), j + 1, 'Grass') &&
                this.isTile(i + 1, j, 'Grass') &&
                this.isTile((i + 0) + (1 - j % 2), j - 1, 'Grass') &&
                this.isTile((i - 1) + (1 - j % 2), j - 1, 'Grass')) {
                const z = (j - levelSizeHalf) * tileYSize;
                let x = (i - levelSizeHalf) * tileXSize;
                if (j % 2 == 0) {
                    x += 0.5;
                }

                areas.push([x, z]);
            }
        }
    }

    return areas;
};
