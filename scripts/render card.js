// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const RenderCameraToElement = pc.createScript('renderCameraToElement');

RenderCameraToElement.attributes.add('renderResolution', {
    type: 'vec2',
    description: 'Resolution to render at'
});

RenderCameraToElement.prototype.initialize = function () {
    this.on('destroy', function () {
        this.renderTarget.destroy();
    }, this);

    this.modelContainer = this.app.root.findByTag('tile-render-model')[0];
    this.camera = this.app.root.findByName('Card World Camera');

    this.entity.lookAt(new pc.Vec3(0, 0.1, 0).add(this.modelContainer.getPosition()));

    this.app.tileTextures = {
        Empty: this.createNewRenderTexture(),
    };
    this.models = JSON.parse(JSON.stringify(this.app.globals.renderTiles));
    this.next();
};

RenderCameraToElement.prototype.next = function () {
    if (this.models.length === 0) {
        this.entity.parent.destroy();
        return;
    }

    // Sort this.models based on this.app.buildingsSeen and the order
    // of this.app.globals.renderTiles.
    // This way we'll render the tiles the player might be seeing first.
    if (this.app.buildingsSeen) {
        this.models.sort((a, b) => {
            const as = this.app.buildingsSeen[a];
            const bs = this.app.buildingsSeen[b];

            if (as && bs) {
                return this.app.globals.renderTiles.indexOf(a) - this.app.globals.renderTiles.indexOf(b);
            } else if (as) {
                return -1;
            } else {
                return 1;
            }
        });
    }

    const tile = this.models.shift();
    const texture = this.createNewRenderTexture();
    this.lastTile = tile;
    this.lastTexture = texture;

    while (this.modelContainer.children.length > 0) {
        this.modelContainer.children[0].destroy();
    }

    let model = tile;
    let base = 'Grass With Bottom';
    let angle = 0;
    let distance = 0.9;

    if (tile === 'Grass') {
        base = '';
    } else if (tile === 'Water') {
        base = '';
    } else if (tile === 'Road') {
        model = 'path_straight';
    } else if (tile === 'River') {
        model = 'river_straight';
        base = '';
        angle = 60;
    } else if (tile === 'Bridge') {
        model = 'path_straight';
        base = 'river_straight';
        angle = 120;
    } else if (tile === 'Water Mill') {
        base = 'river_straight';
    } else if (tile === 'Fishing Hut') {
        base = 'Water';
    } else if (tile === 'Blacksmith') {
        angle = 120;
    } else if (tile === 'Church') {
        angle = 120;
        distance = 1.15;
    } else if (tile === 'Market') {
        angle = 120;
    } else if (tile === 'Stable') {
        angle = 180;
    } else if (tile === 'Tavern') {
        angle = 240;
    } else if (tile === 'Grass Hill') {
        angle = 60;
    } else if (tile === 'Horses') {
        angle = 60;
    } else if (tile === 'House') {
        angle = 60;
    } else if (tile === 'Carpenter') {
        angle = 180;
    } else if (tile === 'Water Rocks') {
        base = 'Water';
    } else if (tile === 'Castle') {
        distance = 1.2;
    } else if (tile === 'Tower') {
        distance = 1.05;
    } else if (tile === 'Campfire') {
        angle = 180;
    } else if (tile === 'Ship') {
        base = 'Water';
        angle = 60;
    } else if (tile == 'Townhall') {
        angle = -60;
    } else if (tile == 'Jousting') {
        angle = 60;
    } else if (tile == 'Storehouse') {
        angle = -120;
    } else if (tile == 'Winery') {
        angle = 240;
    } else if (tile == 'Shipyard') {
        angle = -60;
    } else if (tile == 'Bathhouse') {
        angle = -120;
    } else if (tile == 'Noria') {
        angle = -60;
    } else if (tile == 'Pigs') {
        angle = -60;
    } else if (tile == 'Chapel') {
        angle = -120;
    }

    const p = new pc.Vec3(-0.9, 1.2, 0.9);
    p.mulScalar(distance);
    this.camera.setLocalPosition(p);

    if (base != '') {
        let template = this.app.assets.find(base, "template");
        if (!template) {
            console.log('Could not load asset: ' + base);
            return;
        }
        const baseEntity = template.resource.instantiate();

        this.fixLayer(baseEntity);

        this.modelContainer.addChild(baseEntity);
    }

    let template = this.app.assets.find(model, "template");
    if (!template) {
        console.log('Could not load asset: ' + model);
        return;
    }
    const entity = template.resource.instantiate();

    this.fixLayer(entity);

    entity.setRotation(new pc.Quat().setFromEulerAngles(0, angle, 0));

    this.modelContainer.addChild(entity);

    this.rendering = tile;
    this.renderOnceFrameCount = 0;
};

RenderCameraToElement.prototype.update = function () {
    if (this.rendering) {
        this.renderOnceFrameCount += 1;
        if (this.renderOnceFrameCount > 1) {
            if (this.lastTexture) {
                this.app.tileTextures[this.lastTile] = this.lastTexture;
            }

            this.next();
        }
    } else {
        this.next();
    }
};

RenderCameraToElement.prototype.createNewRenderTexture = function () {
    const device = this.app.graphicsDevice;

    // Create a new texture based on the current width and height of 
    // the screen reduced by the scale
    const colorBuffer = new pc.Texture(device, {
        width: this.renderResolution.x,
        height: this.renderResolution.y,
        format: pc.PIXELFORMAT_R8_G8_B8_A8,
        mipmaps: true,
        anisotropy: 1,
        minFilter: pc.FILTER_LINEAR_MIPMAP_NEAREST,
        magFilter: pc.FILTER_LINEAR,
        addressU: pc.ADDRESS_CLAMP_TO_EDGE,
        addressV: pc.ADDRESS_CLAMP_TO_EDGE,
        addressW: pc.ADDRESS_CLAMP_TO_EDGE,
    });

    const pixels = colorBuffer.lock();
    for (let x = 0; x < this.renderResolution.x; x++) {
        for (let y = 0; y < this.renderResolution.y; y++) {
            const border = 4;
            const isBorder = x < border || y < border || x >= this.renderResolution.x - border || y >= this.renderResolution.y - border;
            pixels[((y * this.renderResolution.x) + x) * 4 + 0] = isBorder ? 255 : 40;
            pixels[((y * this.renderResolution.x) + x) * 4 + 1] = isBorder ? 255 : 60;
            pixels[((y * this.renderResolution.x) + x) * 4 + 2] = isBorder ? 255 : 80;
            pixels[((y * this.renderResolution.x) + x) * 4 + 3] = isBorder ? 255 : 150;
        }
    }
    colorBuffer.unlock();

    if (this.renderTarget) {
        this.renderTarget.destroy();
    }

    this.renderTarget = new pc.RenderTarget(device, colorBuffer, {
        depth: true,
        flipY: true,
        samples: 1,
    });

    this.entity.camera.renderTarget = this.renderTarget;

    return colorBuffer;
};

RenderCameraToElement.prototype.fixLayer = function (entity) {
    if (entity.render) {
        entity.render.layers[0] = 1000;
    }

    if (entity.children) {
        for (let i = 0; i < entity.children.length; i++) {
            this.fixLayer(entity.children[i]);
        }
    }
};
