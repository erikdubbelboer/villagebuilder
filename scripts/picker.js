// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const PickerFramebuffer = pc.createScript('pickerFramebuffer');

PickerFramebuffer.prototype.initialize = function () {
    this.mouseDownAt = [0, 0];
    this.lastTile = [-1000000, -100000];

    if (this.app.touch) {
        this.touchStartedAt = new pc.Vec2(0, 0);
        this.touchStarted = 0;
        this.touchActive = false;

        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);

        // Take the game fullscreen.
        // This is disabled because it's not allowed on Poki which handles fullscreen itself.
        /*this.app.touch.once(pc.EVENT_TOUCHEND, () => {
            if (this.app.isWithEditor) {
                return;
            }

            if (document.fullscreenElement === null) {
                try {
                    document.body.requestFullscreen({ navigationUI: 'hide' }).catch(() => { });
                } catch (ignore) { }
            }
        });*/
    } else {
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMove, this);
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onSelect, this);
    }

    this.lostCheckTimeout = -1;

    this.app.on('game:newselect', this.newSelect, this);
    this.app.on('game:deselect', this.deselect, this);
    this.app.on('game:resetpicker', () => {
        clearTimeout(this.lostCheckTimeout);
        this.lostCheckTimeout = setTimeout(() => this.lostCheck(), 5000);

        this.app.undoState = false;
    });

    this.suggestMaterials = [];
    this.suggestAlpha = 0;
    this.suggestionTimeout = false;

    this.tooltip = this.app.root.findByName('WorldTooltip');
};

PickerFramebuffer.prototype.makeTransparent = function (thing) {
    if (thing.render && thing.render.meshInstances) {
        thing.render.castShadows = false;

        /*for (let i = 0; i < thing.render.meshInstances.length; i++) {
            const material = thing.render.meshInstances[i].material.clone();
            material.opacity = 0.9;
            material.blendType = pc.BLEND_NORMAL;
            material.update();
            thing.render.meshInstances[i].material = material;
        }*/
    }

    if (thing.children) {
        for (let i = 0; i < thing.children.length; i++) {
            this.makeTransparent(thing.children[i]);
        }
    }
};

PickerFramebuffer.prototype.makeTransparentFading = function (thing) {
    if (thing.render && thing.render.meshInstances) {
        thing.render.castShadows = false;

        for (let i = 0; i < thing.render.meshInstances.length; i++) {
            const material = thing.render.meshInstances[i].material.clone();
            material.opacity = 0.7;
            material.blendType = pc.BLEND_NORMAL;
            material.update();
            thing.render.meshInstances[i].material = material;

            this.suggestMaterials.push(material);
        }
    }

    if (thing.children) {
        for (let i = 0; i < thing.children.length; i++) {
            this.makeTransparentFading(thing.children[i]);
        }
    }
};

PickerFramebuffer.prototype.update = function (dt) {
    this.suggestAlpha += dt * 3;

    const opacity = 0.3 + Math.abs(Math.sin(this.suggestAlpha)) * 0.6;

    this.suggestMaterials.forEach(m => {
        m.opacity = opacity;
        m.update();
    });
};

PickerFramebuffer.prototype.newSelect = function (xy) {
    if (this.lastTile) {
        this.lastTile = null;
    }

    // Hacky way to foce an update.
    this.mouseIsDown = false;
    this.touchActive = false;
    this.movedWhileDown = !this.app.touch;

    if (xy) {
        let p = this.getIJ({
            x: xy[0],
            y: xy[1],
        });
        this.moveTo(p[0], p[1], 0);
    } else if (this.app.touch) {
        let p = this.getIJ({
            x: this.app.graphicsDevice.canvas.clientWidth / 2,
            y: this.app.graphicsDevice.canvas.clientHeight / 2,
        });
        p = this.freeSpotNextTo(this.app.placingTileName, p);
        this.moveTo(p[0], p[1], 0);
    }

    /*this.dropSuggestion();
    if (this.app.state.current === 0) {
        this.suggestionTimeout = setTimeout(() => {
            this.newSuggestion();
        }, 5000);
    }*/

    if (this.app.touch) {
        this.makeTransparentFading(this.app.placingEntity);
    } else {
        this.makeTransparent(this.app.placingEntity);
    }
};

PickerFramebuffer.prototype.newSuggestion = function () {
    this.dropSuggestion();

    const r = this.bestPlace(this.app.placingTileName);
    const tile = r[0];

    if (tile) {
        const entity = this.app.assets.find(this.app.tileNameToModel(this.app.placingTileName), "template").resource.instantiate();
        this.makeTransparentFading(entity);
        entity.setPosition(tile.x, tile.y, tile.z + 0.01);
        this.app.root.addChild(entity);

        this.suggestEntity = entity;
    }
};

PickerFramebuffer.prototype.dropSuggestion = function () {
    if (this.suggestionTimeout !== false) {
        clearTimeout(this.suggestionTimeout);
        this.suggestionTimeout = false;
    }

    if (this.suggestEntity) {
        this.suggestEntity.destroy();
    }
};

PickerFramebuffer.prototype.findLinePlaneIntersectionCoords = function (p, q, a, b, c, d) {
    const tDenom = a * (q.x - p.x) + b * (q.y - p.y) + c * (q.z - p.z);
    if (tDenom == 0) return null;

    const t = - (a * p.x + b * p.y + c * p.z + d) / tDenom;

    return new pc.Vec3(
        p.x + t * (q.x - p.x),
        p.y + t * (q.y - p.y),
        p.z + t * (q.z - p.z),
    );
};

PickerFramebuffer.prototype.onMouseDown = function (event) {
    this.mouseIsDown = true;
    this.mouseDownAt = [event.x, event.y];
    this.movedWhileDown = false;
};


PickerFramebuffer.prototype.onTouchStart = function (event) {
    if (event.touches.length !== 1) {
        this.touchActive = false;
        return;
    }

    this.touchStartedAt = new pc.Vec2(event.touches[0].x, event.touches[0].y);
    this.touchStarted = performance.now();
    this.touchActive = true;

    const p = this.getIJ(this.touchStartedAt);
    this.moveTo(p[0], p[1], 2);
};

PickerFramebuffer.prototype.onTouchEnd = function () {
    if (!this.touchActive) {
        return;
    }

    this.tooltip.enabled = false;

    if (this.touchStarted + 500 < performance.now()) {
        return;
    }

    const p = this.getIJ(this.touchStartedAt);
    if (this.moveTo(p[0], p[1], 0) || !this.app.placingTileName) {
        this.onSelect(this.touchStartedAt);
    }
};

PickerFramebuffer.prototype.onTouchMove = function (event) {
    if (event.touches.length !== 1) {
        return;
    }

    if (!this.touchActive) {
        return;
    }

    if (new pc.Vec2(event.touches[0].x, event.touches[0].y).distance(this.touchStartedAt) > 10) {
        this.touchActive = false;
    }
};

PickerFramebuffer.prototype.onMove = function (event) {
    if (this.mouseIsDown) {
        if (Math.abs(event.x - this.mouseDownAt[0]) > 2 || Math.abs(event.y - this.mouseDownAt[1]) > 2) {
            this.movedWhileDown = true;
        }
        return;
    }

    const p = this.getIJ(event);
    this.moveTo(p[0], p[1], 1);
};

PickerFramebuffer.prototype.findVs = function (event) {
    const wc = new pc.Vec3();
    this.entity.camera.screenToWorld(event.x, event.y, 100.0, wc);
    const camera = this.entity.camera.entity.getPosition();
    const v = [];

    for (let i = 0; i <= 12; i++) {
        const y = i * 0.15;

        v.push(this.findLinePlaneIntersectionCoords(camera, wc, 0, 1, 0, -y + -0.15));
    }

    return v;
};

PickerFramebuffer.prototype.getIJ = function (event) {
    const vs = this.findVs(event);
    const levelSize = this.app.levelSize;
    const levelSizeHalf = levelSize / 2;
    const tileXSize = this.app.globals.tileXSize;
    const tileYSize = this.app.globals.tileYSize;
    const ejm = Math.round((vs[Math.round(vs.length / 2)].z / tileYSize) + levelSizeHalf);
    let vx = vs[Math.round(vs.length / 2)].x;
    if (ejm % 2 == 0) {
        vx -= 0.5;
    }
    let eim = Math.round((vx / tileXSize) + levelSizeHalf);

    let i = 0;
    let j = 0;
    let closest = 1000000;

    const radius = 4;
    for (let ii = eim - radius; ii <= eim + radius; ii++) {
        for (let jj = ejm - radius; jj <= ejm + radius; jj++) {
            let x = (ii - levelSizeHalf) * tileXSize;
            const z = (jj - levelSizeHalf) * tileYSize;

            if (jj % 2 == 0) {
                x += 0.5;
            }

            let h = 0;
            if (this.app.mountain) {
                const sx = x - (levelSize * tileXSize * 0.5);
                const sz = z - (levelSize * tileYSize * 0.5);
                h = Math.floor(sx * sz * 0.006);

                if (h > 12) {
                    h = 12;
                } else if (h < 0) {
                    h = 0;
                }
            }

            const d = Math.pow(vs[h].x - x, 2) + Math.pow(vs[h].z - z, 2);
            if (d < closest) {
                closest = d;
                i = ii;
                j = jj;
            }
        }
    }

    return [i, j];
};

// tooltip: 0=no, 1=yes, 2=only
PickerFramebuffer.prototype.moveTo = function (i, j, tooltip) {
    this.lastBuildingPlace = [i, j];

    const levelSize = this.app.levelSize;
    const levelSizeHalf = levelSize / 2;
    const tileXSize = this.app.globals.tileXSize;
    const tileYSize = this.app.globals.tileYSize;

    let tile = null;
    const lastTile = this.lastTile;

    if (i >= 0 && i < levelSize && j >= 0 && j < levelSize) {
        tile = this.app.tiles[i][j];
    }

    this.lastTile = tile;

    if (!this.app.placingTileName || !this.app.placingEntity) {
        /*if (tile && tile.building && !this.app.globals.cantRotate.includes(tile.buildingTile)) {
            this.app.hover('picker', true);
        } else {
            this.app.hover('picker', false);
        }*/

        if (tooltip > 0 && tile && !this.app.decksOpen && this.app.menuOpen == 0 && !this.app.noPickerHover && tile.buildingTile && this.app.globals.needs[tile.buildingTile]) {
            this.tooltip.enabled = true;
            this.app.root.findByName('Help').reparent(this.tooltip);
            this.app.fire('game:showhelp', tile.buildingTile, 1, 0, 0, null, 200);
        } else {
            this.tooltip.enabled = false;
        }

        return false;
    }

    if (tooltip === 2) {
        return false;
    }

    if (lastTile) {
        if (!tile || tile.i !== lastTile.i || tile.j !== lastTile.j) {
            if (lastTile.building && !lastTile.building.enabled) {
                lastTile.building.enabled = true;
            }
        }
    }

    const placingEntity = this.app.placingEntity;

    if (i === placingEntity.tile[0] && j === placingEntity.tile[1]) {
        return true;
    }

    const z = (j - levelSizeHalf) * tileYSize;
    let x = (i - levelSizeHalf) * tileXSize;
    if (j % 2 == 0) {
        x += 0.5;
    }
    let y = 0;
    if (tile) {
        y = tile.y;
    }

    placingEntity.enabled = true;
    placingEntity.score.enabled = true;
    placingEntity.tile = [i, j];
    placingEntity.setPosition(x, y + 0.01, z);
    placingEntity.score.setPosition(x, y + (this.app.globals.heights[this.app.placingTileName] || 1), z);

    placingEntity.grid.forEach(t => {
        const tj = j + t.j;
        let ti = i + t.i;
        if (j % 2 === 0 && tj % 2 !== 0) {
            ti++;
        }

        if (ti < 0 || ti >= levelSize || tj < 0 || tj >= levelSize) {
            return;
        }

        const tile = this.app.tiles[ti][tj];
        t.can = this.canPlace(tile, this.app.placingTileName, false);
    });

    this.app.fire('game:showgrid', i, j, placingEntity.grid);

    this.app.placingValid = this.canPlace(tile, this.app.placingTileName, true);

    if (!this.app.placingValid && tile && tile.buildingTile === this.app.placingTileName) {
        const angles = [-120, -60, 60, 120];
        this.app.placingAngle = tile.angle + angles[Math.floor(Math.random() * angles.length)];
        if (this.app.placingTileName === 'Ship') {
            this.app.placingAngle += 30;
        }
        this.app.placingEntity.setRotation(new pc.Quat().setFromEulerAngles(0, this.app.placingAngle, 0));
    }

    if (this.app.placingTileName === 'Road' || this.app.placingTileName === 'Square' || this.app.placingTileName === 'Market') {
        this.app.fire('game:fixroads');
    }

    this.app.fire('game:updatescore');

    if (this.app.placingValid) {
        this.makeNormal(placingEntity);

        this.app.hover('picker', false);
    } else {
        this.makeRed(placingEntity);

        this.app.hover('picker', true);
    }

    return false;
};

PickerFramebuffer.prototype.makeNormal = function (entity) {
    if (entity.render && entity.render.meshInstances) {
        for (let i = 0; i < entity.render.meshInstances.length; i++) {
            const meshInstance = entity.render.meshInstances[i];

            if (meshInstance.originalMaterial) {
                const oldMaterial = meshInstance.material;

                meshInstance.material = meshInstance.originalMaterial;

                delete meshInstance.originalMaterial;

                oldMaterial.destroy();
            }
        }
    }

    for (let i = 0; i < entity.children.length; i++) {
        this.makeNormal(entity.children[i]);
    }
};

PickerFramebuffer.prototype.makeRed = function (entity) {
    if (entity.render && entity.render.meshInstances) {
        for (let i = 0; i < entity.render.meshInstances.length; i++) {
            const meshInstance = entity.render.meshInstances[i];

            if (!meshInstance.originalMaterial) {
                const material = meshInstance.material.clone();
                material.diffuse = new pc.Color(0.6, 0, 0, 0);
                //material.blendType = pc.BLEND_NONE;
                //material.opacity = 0.6;
                material.update();
                meshInstance.originalMaterial = meshInstance.material;
                meshInstance.material = material;
            }
        }
    }

    for (let i = 0; i < entity.children.length; i++) {
        this.makeRed(entity.children[i]);
    }
};

PickerFramebuffer.prototype.onSelect = function (event) {
    this.mouseIsDown = false;

    if (!this.lastTile) {
        return;
    }
    if (this.movedWhileDown) {
        return;
    }
    if (!this.app.placingTileName) {
        if (this.lastTile.building) {
            if (this.app.isWithEditor && this.app.keyboard.isPressed(pc.KEY_L)) {
                this.lastTile.building.destroy();
                this.lastTile.building = null;
                this.lastTile.buildingTile = '';

                this.app.fire('game:fixroads');
                this.app.root.findByName('sun').light.updateShadow();
            } else {
                // Uncomment this to allow clicking on a building to rotate it.
                /*if (!this.app.globals.cantRotate.includes(this.lastTile.buildingTile)) {
                    this.lastTile.angle += (event.button === pc.MOUSEBUTTON_LEFT || this.app.touch) ? -60 : 60;
                    this.lastTile.building.setRotation(new pc.Quat().setFromEulerAngles(0, this.lastTile.angle, 0));
                    this.app.fire('game:updatesave');
                    this.app.root.findByName('sun').light.updateShadow();
                }*/
            }
        } else {
            // Uncomment this to allow clicking on the Grass to move the camera to that location.
            //const camera = this.app.root.findByName('camera');
            //camera.script.orbitCamera.moveToPoint = new pc.Vec3(this.lastTile.x, 0, this.lastTile.z);
        }
        return;
    }

    if (event.button === pc.MOUSEBUTTON_LEFT || this.app.touch) {
        if (!this.app.placingValid) {
            this.app.playSound('cantplace');
            return;
        }

        this.app.playSound('place');

        if (navigator.vibrate) {
            navigator.vibrate(100);
        }

        const lastTile = this.lastTile;
        let templateName = this.app.tileNameToModel(this.app.placingTileName);
        if (templateName === 'Water Mill' && lastTile.isStraightRiver === 2) {
            templateName = 'Water Mill Bend';
        }
        const template = this.app.assets.find(templateName, "template");
        const entity = template.resource.instantiate();

        entity.setPosition(lastTile.x, lastTile.y, lastTile.z);
        entity.setRotation(new pc.Quat().setFromEulerAngles(0, this.app.placingAngle, 0));

        const batchGroupId = this.app.buildingBatchGroups[Math.floor(lastTile.i / this.app.globals.batchSize)][Math.floor(lastTile.j / this.app.globals.batchSize)].id;
        this.app.setBatchGroupId(entity, batchGroupId);

        if (lastTile.building) {
            lastTile.building.destroy();
        }

        lastTile.building = entity;
        lastTile.buildingTile = this.app.placingTileName;
        lastTile.angle = this.app.placingAngle;

        this.app.root.findByName('Level').addChild(entity);

        if (this.app.placingTileName === 'Fishing Hut' && lastTile.baseTile === 'Water') {
            // We don't remove the model as we can render over it, but we have to remove this otherwise you can place Grain next to it.
            lastTile.baseTile = 'Grass';
        }
        if (this.app.placingTileName === 'Hunting Cabin') {
            this.app.levelStoneHillsLeft--;
        }
        if (this.app.placingTileName === 'Mine') {
            this.app.levelGrassHillsLeft--;
        }
        if (this.app.placingTileName === 'Fishing Hut') {
            this.app.levelFishingHutLeft--;
        }

        let button = 0;
        for (let i = 0; i < this.app.buttons.length; i++) {
            if (this.app.buttons[i].tile === this.app.placingTileName) {
                button = i;
                break;
            }
        }

        this.app.undoState = {
            lastTile,
            pointsTier: this.app.pointsTier,
            points: this.app.points + this.app.root.find('name', 'MovingPoint').length,
            minPoints: this.app.minPoints,
            maxPoints: this.app.maxPoints,
            plusCount: this.app.buttons[0].count,
            firstpoints: this.app.globals.firstpoints[this.app.placingTileName],
        };
        this.app.root.findByName('UndoGroup').enabled = true;

        this.app.fire('game:lockscore');

        this.app.buttons[button].count--;

        if (this.app.buttons[button].count === 0) {
            this.deselect();
        } else if (this.app.placingEntity) {
            this.app.placingAngle = Math.floor(pc.math.random(0, 6)) * 60;
            if (this.app.placingTileName === 'Ship') {
                this.app.placingAngle += 30;
            }
            this.app.placingEntity.setRotation(new pc.Quat().setFromEulerAngles(0, this.app.placingAngle, 0));

            this.app.placingValid = false;

            this.makeRed(this.app.placingEntity);

            if (this.app.placingTileName === 'Road' || this.app.placingTileName === 'Square' || this.app.placingTileName === 'Market') {
                this.app.fire('game:fixroads');
            }

            /*this.dropSuggestion();
            if (this.app.state.current === 0) {
                this.suggestionTimeout = setTimeout(() => {
                    this.newSuggestion();
                }, 5000);
            }*/

            if (this.app.touch) {
                const p = this.freeSpotNextTo(this.app.placingTileName, [lastTile.i, lastTile.j]);
                this.moveTo(p[0], p[1], 0);
            }

            if (this.app.touch) {
                this.makeTransparentFading(this.app.placingEntity);
            } else {
                //this.makeTransparent(this.app.placingEntity);
            }
        }

        this.app.fire('game:updatebuttons');
        this.app.fire('game:updatecard');
        this.app.fire('game:updatesave');
        this.app.fire('game:shake', 0.2);

        this.app.root.findByName('sun').light.updateShadow();

        clearTimeout(this.lostCheckTimeout);
        this.lostCheckTimeout = setTimeout(() => this.lostCheck(), 1000);
    } else {
        this.app.playSound('cancel');

        this.deselect();
    }

    this.lastTile = null;
};

PickerFramebuffer.prototype.deselect = function () {
    this.dropSuggestion();

    if (this.app.placingEntity) {
        this.app.placingEntity.score.destroy();
        this.app.placingEntity.destroy();
        this.app.placingEntity = null;
    }
    this.app.placingTileName = '';

    this.app.fire('game:fixroads');
    this.app.fire('game:clearscore');
    this.app.fire('game:clearhelp');
    this.app.fire('game:hidegrid');

    this.app.hover('picker', false);

    if (this.lastTile && this.lastTile.building && !this.lastTile.building.enabled) {
        this.lastTile.building.enabled = true;
    }

    this.lastTile = null;
};

PickerFramebuffer.prototype.isTile = function (i, j, tile, orInvalid, y) {
    if (i < 0 || i >= this.app.levelSize || j < 0 || j >= this.app.levelSize) {
        return orInvalid;
    }

    const t = this.app.tiles[i][j];

    if (!t.baseTile && !t.buildingTile) {
        return orInvalid;
    }

    if (y > -1 && t.y !== y) {
        return false;
    }

    return t.baseTile === tile || t.buildingTile === tile;
};

PickerFramebuffer.prototype.getHeight = function (i, j) {
    if (i < 0 || i >= this.app.levelSize || j < 0 || j >= this.app.levelSize) {
        return 0;
    }

    return this.app.tiles[i][j].y;
};

PickerFramebuffer.prototype.isNeighbor = function (i, j, tile, checkY) {
    let y = -1;
    if (checkY) {
        // Uncomment to not allow to build roads of cliffs
        //y = this.getHeight(i, j);
    }

    if (this.isTile((i - 1) + (1 - j % 2), j - 1, tile, false, y)) return true;
    if (this.isTile((i + 0) + (1 - j % 2), j - 1, tile, false, y)) return true;
    if (this.isTile(i + 1, j, tile, false, y)) return true;
    if (this.isTile((i + 0) + (1 - j % 2), j + 1, tile, false, y)) return true;
    if (this.isTile((i - 1) + (1 - j % 2), j + 1, tile, false, y)) return true;
    if (this.isTile(i - 1, j, tile, false, y)) return true;
    return false;
};

PickerFramebuffer.prototype.placeFishingHut = function (i, j) {
    const bitmap = [
        this.isTile(i - 1, j, 'Water', true, -1),
        this.isTile((i - 1) + (1 - j % 2), j + 1, 'Water', true, -1),
        this.isTile((i + 0) + (1 - j % 2), j + 1, 'Water', true, -1),
        this.isTile(i + 1, j, 'Water', true, -1),
        this.isTile((i + 0) + (1 - j % 2), j - 1, 'Water', true, -1),
        this.isTile((i - 1) + (1 - j % 2), j - 1, 'Water', true, -1),
    ].map(function (x) { return x ? '1' : '0'; }).join('');

    let r = (bitmap + bitmap).indexOf('111000');
    if (r === -1) {
        r = (bitmap + bitmap).indexOf('110000');
    }
    const valid = r > -1 && !this.isNeighbor(i, j, 'River', false);

    if (r === -1) {
        r = (bitmap + bitmap).indexOf('111');
    }
    if (r === -1) {
        r = (bitmap + bitmap).indexOf('11');
    }

    if (this.app.placingEntity) {
        this.app.placingAngle = (r + 1) * 60;
        this.app.placingEntity.setRotation(new pc.Quat().setFromEulerAngles(0, this.app.placingAngle, 0));
    }

    return valid;
};

PickerFramebuffer.prototype.rotateShipyard = function (i, j) {
    if (!this.app.placingEntity) {
        return;
    }

    const bitmap = [
        this.isTile(i - 1, j, 'Water', false, -1),
        this.isTile((i - 1) + (1 - j % 2), j + 1, 'Water', false, -1),
        this.isTile((i + 0) + (1 - j % 2), j + 1, 'Water', false, -1),
        this.isTile(i + 1, j, 'Water', false, -1),
        this.isTile((i + 0) + (1 - j % 2), j - 1, 'Water', false, -1),
        this.isTile((i - 1) + (1 - j % 2), j - 1, 'Water', false, -1),
    ].map(function (x) { return x ? '1' : '0'; }).join('');

    let r = (bitmap + bitmap).indexOf('11');
    if (r === -1) {
        r = (bitmap + bitmap).indexOf('1');
    }
    this.app.placingAngle = (r + 4) * 60;
    this.app.placingEntity.setRotation(new pc.Quat().setFromEulerAngles(0, this.app.placingAngle, 0));
};

PickerFramebuffer.prototype.canPlace = function (tile, placingTileName, modify) {
    placingValid = false;

    if (tile) {
        placingValid = tile.buildingTile === '' && tile.baseTile !== '' && tile.baseTile !== 'River';

        if (placingTileName === 'Mine' && (tile.buildingTile === 'Grass Hill' || tile.buildingTile === 'Stone Hill')) {
            if (modify) {
                tile.building.enabled = false;
            }
            placingValid = true;
        } else if (placingTileName === 'Hunting Cabin' && (tile.buildingTile === 'Grass Hill' || tile.buildingTile === 'Stone Hill')) {
            if (modify) {
                tile.building.enabled = false;
            }
            placingValid = true;
        }

        if (!placingValid && placingTileName === 'Road' && tile.baseTile === 'River' && tile.buildingTile === '') {
            placingValid = true;
        }

        if (placingTileName === 'Water Mill') {
            if (!tile.isStraightRiver || tile.buildingTile !== '') {
                placingValid = false;
            } else {
                placingValid = true;

                if (modify && this.app.placingEntity) {
                    if (this.app.placingEntity.waterMillBase !== tile.isStraightRiver) {
                        this.app.placingEntity.waterMillBase = tile.isStraightRiver;

                        let template = 'Water Mill';
                        if (tile.isStraightRiver === 2) {
                            template = 'Water Mill Bend';
                        }

                        const entity = this.app.assets.find(template, "template").resource.instantiate();

                        for (let i = entity.children.length - 1; i >= 0; i--) {
                            entity.children[i].render.castShadows = false;

                            this.app.placingEntity.children[i].destroy();
                            entity.children[i].reparent(this.app.placingEntity, i);
                        }
                        entity.destroy();
                    }

                    this.app.placingAngle = tile.angle;
                    this.app.placingEntity.setRotation(new pc.Quat().setFromEulerAngles(0, tile.angle, 0));
                }
            }
        }

        if (placingTileName === 'Fishing Hut') {
            if (this.isTile(tile.i, tile.j, 'Water', false, tile.y) && tile.buildingTile === '') {
                placingValid = this.placeFishingHut(tile.i, tile.j);
            } else {
                placingValid = false;
            }
        } else if (tile.baseTile === 'Water') {
            if (placingTileName === 'Ship' && !tile.buildingTile) {
                placingValid = true;
            } else {
                placingValid = false;
            }
        } else if (placingValid) {
            const needs = this.app.globals.needs[placingTileName];
            if (needs) {
                let valid = needs.or.length === 0;
                for (let n = 0; n < needs.or.length; n++) {
                    if (this.isNeighbor(tile.i, tile.j, needs.or[n], placingTileName === 'Road')) {
                        valid = true;
                    }
                }
                for (let n = 0; n < needs.and.length; n++) {
                    if (!this.isNeighbor(tile.i, tile.j, needs.and[n], false)) {
                        valid = false;
                    }
                }
                if (needs.on.length > 0) {
                    let isOn = false;
                    for (let n = 0; n < needs.on.length; n++) {
                        if (tile.buildingTile === needs.on[n]) {
                            isOn = true;
                            break;
                        }
                    }
                    if (!isOn) {
                        valid = false;
                    }
                }
                if (!valid) {
                    placingValid = false;
                }
            }

            if (placingTileName === 'Shipyard') {
                this.rotateShipyard(tile.i, tile.j);
            }
        }
    }

    return placingValid;
};

PickerFramebuffer.prototype.lostCheck = function () {
    const levelSize = this.app.levelSize;

    if (this.app.decksOpen) {
        return;
    }

    if (this.app.buttons[0].count > 0) {
        return;
    }

    if (this.app.root.findByName('MovingPoint')) {
        this.lostCheckTimeout = setTimeout(() => this.lostCheck(), 1000);
        return;
    }

    // 0 = Plus
    // 1 = Roads
    // Roads don't give points so ignore them.
    for (let t = 2; t < this.app.buttons.length; t++) {
        const count = this.app.buttons[t].count;

        if (count > 0) {
            const placingTileName = this.app.buttons[t].tile;

            for (let i = 0; i < levelSize; i++) {
                for (let j = 0; j < levelSize; j++) {
                    const tile = this.app.tiles[i][j];
                    const can = this.canPlace(tile, placingTileName, false);

                    if (can) {
                        let points = this.getPoints(tile, placingTileName);

                        if (points > 0) {
                            // return so we don't show the lost menu.
                            return;
                        }
                    }
                }
            }
        }
    }

    this.app.root.findByName('LostMenu').enabled = true;
};

PickerFramebuffer.prototype.bestPlace = function (placingTileName) {
    if (placingTileName === 'Road') {
        return [null, 0];
    }

    const levelSize = this.app.levelSize;
    let bestTile = null;
    let bestPoints = -100000;

    const center = this.getIJ({
        x: this.app.graphicsDevice.canvas.clientWidth / 2,
        y: this.app.graphicsDevice.canvas.clientHeight / 2,
    });

    for (let i = 0; i < levelSize; i++) {
        for (let j = 0; j < levelSize; j++) {
            const tile = this.app.tiles[i][j];
            const can = this.canPlace(tile, placingTileName, false);

            if (can) {
                let points = this.getPoints(tile, placingTileName);

                if (points > bestPoints) {
                    bestPoints = points;
                    bestTile = tile;
                } else if (points === bestPoints) {
                    const nd = (center[0] - i) * (center[0] - i) + (center[1] - j) * (center[1] - j);
                    const bd = (center[0] - bestTile.i) * (center[0] - bestTile.i) + (center[1] - bestTile.j) * (center[1] - bestTile.j);

                    if (nd < bd) {
                        bestTile = tile;
                    }
                }
            }
        }
    }

    return [bestTile, bestPoints];
};

// See Scores.prototype.updatescore.
PickerFramebuffer.prototype.getPoints = function (position, placingTileName) {
    const levelSize = this.app.levelSize;
    const size = this.app.globals.auras[placingTileName] * 1.1;
    let points = this.app.globals.firstpoints[placingTileName] || 0;

    for (let i = 1; i < levelSize - 1; i++) {
        for (let j = 1; j < levelSize - 1; j++) {
            const tile = this.app.tiles[i][j];

            const d = Math.sqrt((position.x - tile.x) * (position.x - tile.x) + (position.z - tile.z) * (position.z - tile.z));
            if (d <= size) {
                let pts = this.app.globals.extrapoints[placingTileName][tile.baseTile] || 0;
                pts += this.app.globals.extrapoints[placingTileName][tile.buildingTile] || 0;

                points += pts;
            }
        }
    }

    return Math.max(points, 0);
};

PickerFramebuffer.prototype.freeSpotNextTo = function (placingTileName, center) {
    const levelSize = this.app.levelSize;
    let bestTile = null;
    let bestDist = 100000;

    for (let i = 0; i < levelSize; i++) {
        for (let j = 0; j < levelSize; j++) {
            const tile = this.app.tiles[i][j];
            const can = this.canPlace(tile, placingTileName, false);

            if (can) {
                const dist = (center[0] - i) * (center[0] - i) + (center[1] - j) * (center[1] - j);

                if (dist < bestDist) {
                    bestTile = tile;
                    bestDist = dist;
                }
            }
        }
    }

    if (bestDist > 100) {
        return center;
    } else {
        return [bestTile.i, bestTile.j];
    }
};
