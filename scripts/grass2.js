// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Grass2 = pc.createScript('grass2');

Grass2.attributes.add('name', {
    title: 'Name',
    description: 'Level name',
    type: 'string',
});

const levels = {
    'level1': 'N4IgzglgXgpiBcBWADAGhAFwgGxmBoA4gE4CGY+8A2lQCyoCMAHIwLqp2oBMaD7nXBmw70uXYQJZ8R3AJwT6AZl78l46VUSMAbBK0MA7HsbyNWsca6LLU/lsVCzqRdaeL6G3Qw/8v+39zqAVymAYr+HLqKXvxGDEEcca6x3MmJ3D7pIRJGyjnOcSmKthxSKqWMjvwsXJlULIqhFbTlVPIlbahNnbUS8lwRnXka8rRVHKMJVAxoHTMZEvPZGvO0UwxCMRwbqIXbQhYrB2nTB3MH3Tu0J1d18ahb0+KH/Pdce0+otHfWP6iDDGsL22QMegO4H3BtABvzB9DuohuojhXzB9kW5hu5juWlokKiiyM61yhK+kKMtDmNUWLEpi1M9K+d1GANGHx4jAkHOKXLQ115ZIFdI0gk5IqEinZEu6ov5IvUXPEksVzg6FkaKrl/CsYu1rimOrWXN+J0Nj0N7N+ao8XI8rV6OxFHlN8PGVF6tHN+i5+nt+lN+jqAy+fq+buD0K5XijlRjkZFcS5cXDcQNcSDFJTX0GXCkXKkptp4dpBtpQdpOYZItGJ2GEgcuo4DamDeF/EUz3r4jbTestdcjxcjA+Q+Y9aBrSHePrShnjEG7m4k/hI/RGnCX3rga3853ovX5hbuMHuJHujq0UYF90OvX58HRgXRgfu/XcW6ytv7YpF4pC5Yg5SP+Oj1jUtZlvW8gju0kHDrBX5NpMsFaiIswKLwHwtIwHRYQhdB8lMYxdAojitERDDdEReFEVhGg0W6RqOqo6iEeolHPCcRoOsxqoKEqlGuJxrh1HKAlLgoQIiX2jz8sqdEeIM3wgfJ3AMYiChKCJSiKfomH6Dh+iUeYZHYgo5gyeYBnOCZzgMfYhH2JxN4MTeTncIpN6YTeoTsCAADqpAYDAxAIDQiKqBkEUDFF2hRQYdiRRw5iIAlXCxUlELBIowS0MEKWRNw6VUJ5wRMCk0VZEVRLxVkZUVBV9SFdUmX1XVjUhPw/RFf0NU9G1/SyK8aANUsRVLL1SxtTstSvAc+WnE1+wtZ8VivM8uXbM881vGNQLZSCiXTEC22iBt0yiNtoxFRy3zany803ddEptbKZ2yg9Qietqn29bKL3dm93YPd213dr93Yvb8b2/A9HhcNq8LwxwHr7e68JvfCD36CK+hI+6uJ4xGqMRm9XiE14xPniK57k18lNMtqSSM18hMUsTP7arSqOLgwRU871PNtTzg1NvofO6e2+mSyY0s8O2fjyzoiuGMrQteCLVCXnLTbOYrYjfkrTZxALcRC0SyAG4Ilt4zyKtNlIQtSBrPLa5rNTrjUNumELpjO/0FuIap7b9HjtEa7hAf4UHqGBKoByR1RdEHKHzwJ88dHPKHQJ0UCWepKwvkBUFxAAAQAEoAPYAMYANaUDQyXlRNF2MK77x0w8kft7dgcUZ3wdLqow1oNoafiaPBfoAAYhXxB4BgoVUKbKR9/Ekc1MNLTNcUnXKUwkfe9hB8mBkx8cswZ+OK78gahfQ2MLwrvzNNW/bI//dv9hH/TLwN/IJHSxeD73vqKCen9b7AM/rhV+C1DDWQAY4UwT946twQbZVBs0wxHzWsRWoAD1Aj3wa3b+9wxxrxwRRHBDgqGuEgZ8Dc5DNohleNYDW4JHR0PYfqABE54EsPQYwo6zgPCcN+JvAB9AyYSOInfbYHhvbSPPk/UQEp/6vFECxABWhcZaNjLI6Y5hVG6KNGAgxdNXi4jhsY7EADdA2NeLoIkMDeaoCkE/LwIjbF7y8XAvBDjrIYO2FEFYUR5CmJcUpZQXjIzhIpK8Iwz4AFGCmkYMJSSH6BOmLkQh8T0F+O2LkJB6S5RPxYNkgBDQcnbAaI4ThDQlRqOqcI0+rx5D2O2DfA4zib4NIATfPsjTpijC7mgfSIyHjYORsNWp4yGymO5Nwu6zhdDzL5F3IQOjvoTPmaRSZ7oDibHWYEPZopcx8ORhKAZRyiLzPEAo7UzwVld2eODbgNQYEWCIlEvUMi6E6hdh89E3zkbaO1FoACXdzyZLSv8E5uh3ldyJC05GFITlxCAYi9y3924wvye6XIvTOacjxWcwlyMGhErGUS3xHyahaHmTUG8tKIQnPqdihoxN+jnPdDfbUow+ULHmV1ZFPKBF/Jvk4ruN8NbZBiVK1E388jqDoXkK57ZeDWFMcMKx6rUh7KVTqpsw0nm6obMCzWaBRyu1VVI3VkTBl5EjHis17Yr6usYGqpsxx9VzRFWa21XqCjuqUs6z6mymxKn1eoWhkcOzePbOoU2saOJRvcgm5ZmS40AuTc4NJ7ZBKZtcOU/NzgbZ9npbG6SJblRarEX634V9K3Zn1bCTN9BJXtnoJU2NyJO2lsVZjNtCr9EbjjYIrW9gHU3gDZrTymaojKtjVEGNitFzms/KmWNuQV1G2ac6v87YCx+tMJ6zWphDVR3BOa2inih67jxbRE1MdLz6PIqjL5p0E4SnaXQCUXg6FGjjQ+pU76lRnUAzO2SMzVB9nWgnPsO66CiCqUh1SIr7Xf0iSpBhwDfIkHIGAEuAAJHA2BF7m0yQ7b+TsSESk0ZgxomCsLmvuGsdRhszEuNWf2wRN1i0XJDCc34CNnDcphYhuNnoB1YvHclRV5luWjrOhuOVBs3GxulcewT17hrqbvR1Z94dHA/sYiZ9QkGBz918gAZQwBXAAdjAYjpHyPOEWekRceLcgzo5Xsho80GhREGT0vZN9b0TGcNtS1eN5hWoAZai9sXw0LSHOEiUZ0dg4bQZeFjYHMlXtPVeqlHSsUsZvgipZpC/nDTJe6Ya7m6u8XNdyIpWz7jNe9bxiUSatkQOeQ/B5xzmspt40qfj7olQQsG7fNurhxE/My4MnU+tkZ9hlXW5r9BWvIztNijw0GQXEWa76aFuh7nIy8ChmF8Y/n3hFe3foHy/yst+V3MoRKlK8YrB9plb3BQktMFd0Yn7dXzC1bs2tubM32D06LKHI6oiJINtEZH42eThEPQUTNphN0D0FhpyL3LaK45jmOB9lr32OEg44Env6v6vsQXsxi43GJtUYuHItTPaFc5liIXh175FWfQGXCAAA3YKi9KmoPQMQMXwUAD6EB7PFzADAKuWAHMAGEQDbzgzLuXxB5dV1no5kK29P36/F4bsAGBSDEAXrvOZaAQCy6t0bk3EvHeaud67hXxviCm519sOTa9LcK6VyrtXGv7MACEg9mJhQAWlHmHw3/vA/+JhT7g38ubdkAgAAcwABYO6CcO/eqf3cB892X6ceDK8R+Cqr9XEAHNx9yVnyvefSCF5L/HuBUns9u+7730v0xGXS5dzn9PNfx8KqHwrkfxex993bsnhf1uMD5+X/3/oLB1+V5n2bqZbzUAb8V8rpvUfW/2anvH05njD8e+P/srF9ep9u6P/fg4Tyn/V5f6cokl3lvj3jvlstkAfh/oviAaPt/gEinlAWns/nAc2FhIgVXhngJnGpAb7pvtvn3r1pIufkvgQVgTYn/pga/peDgdPsgYNr0MQTAWAcjCBp3BQbPuqFIuwQAZJGftwffn2EYDQZ/nQTtnqhfPwSJsqIwfgWPsGC4u/rgRgRwfpKfJIYdhYAgUoSQXIZiHwegV/mCljqHgYaIfjLxMIdAbIffh4mwegY3sQM3tHu3hdruFoTnjoTYXBO4SIf/l4X3JYXgaAaQe6DeGgIERfpHi3lrl4aAufg4U4TftrtqKEqgBEZ4SkYJj4X7mYTijMg3pfo4dfjEUSufBXqYX4aUUIOfoYcjP7PoUobURavTuUY0WYcMGksAdYe6mODIcEWPmOupuoZrK4PIBEU0SGuIH0bAaoIeA0R4UwQQb5JXKQAACaLwKExbTqZ4TTmwd4rBEiow0od7bQbytLzjnG8yXFTS+yVa/Q06DZ2wTbYQLbraDxiFWwfGEyYhGEzQaHXSTqZENS4q/Q3gvTeSZHUKuEdjMwuCwlvT+YCoY51HLKmrKaWrzSqoCyWpCyWrOxrLBp8CsAAC+xJQAA=',
};

Grass2.prototype.initialize = function () {
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

    const data = this.app.decompress(levels[this.name]);
    if (!data) {
        console.error('failed to decompress level data');
        return;
    }
    const state = JSON.parse(data);
    if (!state) {
        console.error('failed to parse level data');
        return;
    }

    this.snow = false;
    this.mountain = false;

    this.app.levelStoneHillsLeft = 0;
    this.app.levelGrassHillsLeft = 0;
    this.app.levelFishingHutLeft = 0;
    this.app.levelShipyardLeft = 0;
    this.app.mountain = this.mountain;
    this.app.hasRiver = false;

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
            } else if (model === 'Stone Hill') {
                this.app.levelStoneHillsLeft++;
            } else if (model === 'Grass Hill') {
                this.app.levelGrassHillsLeft++;
            }

            let isStraightRiver = 0;
            if (modelTemplate === 'river_straight') {
                isStraightRiver = 1;
                this.app.hasRiver = true;
            } else if (modelTemplate === 'river_corner') {
                isStraightRiver = 2;
                this.app.hasRiver = true;
            }

            const isStatic = [
                'Grass',
                'River',
                'Water',
                'Forest',
                'Water Rocks',
            ].includes(model);

            if (isStatic) {
                this.addInstance(modelTemplate, x, y, z, angle);
            } else {
                const template = this.app.assets.find(modelTemplate, "template");
                const entity = template.resource.instantiate();

                entity.setPosition(x, y, z);
                entity.setRotation(new pc.Quat().setFromEulerAngles(0, angle, 0));

                const batchGroupId = this.app.buildingBatchGroups[Math.floor(i / this.app.globals.batchSize)][Math.floor(j / this.app.globals.batchSize)].id;
                this.app.setBatchGroupId(entity, batchGroupId);

                this.entity.addChild(entity);

                tile.building = entity;
            }

            const isBase = [
                'Grass',
                'River',
                'Water',
            ].includes(model);

            if (isBase) {
                tile.baseTile = model;
                tile.hasBottom = hasBottom;
                tile.isStraightRiver = isStraightRiver;
            } else {
                tile.buildingTile = model;
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

            this.addInstance('Grass', x, y, z, 0);

            tile.x = x;
            tile.y = y;
            tile.z = z;
            tile.i = i;
            tile.j = j;
            tile.baseTile = 'Grass';
            tile.hasBottom = false;
            tile.isStraightRiver = 0;
            tile.bitmap = '000000';
        }
    }

    this.app.fire('game:fixroads');

    this.updateInstance();

    delete this.childNames;
    delete this.childOffsetMatrices;
    delete this.childMatrices;
    delete this.childMatriceIndexes;

    setTimeout(() => {
        this.app.fire('game:levelloaded');
    }, 10);

    this.enabled = false;
};

Grass2.prototype.addInstance = function (model, x, y, z, angle) {
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

Grass2.prototype.updateInstance = function () {
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

Grass2.prototype.isTile = function (i, j, tile, orInvalid, onlyBase) {
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

Grass2.prototype.updateLevelFishingHutLeft = function () {
    this.app.levelFishingHutLeft = 0;
    this.app.levelShipyardLeft = 0;

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

            if (bitmap.indexOf('1') > -1) {
                this.app.levelShipyardLeft++;
            }
        }
    }
};
