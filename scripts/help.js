// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Help = pc.createScript('help');

Help.prototype.initialize = function () {
    this.newContent = undefined;
    this.moveUp = 0;
    this.moveRight = 0;
    this.maxHeight = 0;
    this.opacity = 0;
    this.needUpdate = 0;
    this.colorBuffer = undefined;
    this.lastWidth = -1;
    this.lastHeight = -1;

    this.entity.parent.children[0].element.opacity = 1;

    this.app.on('game:showhelp', this.showHelp, this);
    this.app.on('game:clearhelp', this.clearHelp, this);

    window.addEventListener('resize', () => {
        this.onWindowResize();
    }, false);
    this.onWindowResize();
};

Help.prototype.onWindowResize = function () {
    const width = this.app.graphicsDevice.width;
    const height = this.app.graphicsDevice.height;
    const w = Math.min(1000 / width, 1);
    const h = Math.min(100 / height, 1);

    const s = Math.max(Math.max(w, h), 0.6);

    this.entity.parent.setLocalScale(s, s, s);

    this.scale = s; //this.entity.parent.getLocalScale().x;
};

Help.prototype.updateHelp = function (tile) {
    const needs = this.app.globals.needs[tile];
    const children = this.entity.children[1].children;

    this.entity.children[0].element.text = tile.toUpperCase();

    const basePoints = this.app.globals.basepoints[tile];
    if (basePoints) {
        this.entity.children[2].children[1].enabled = true;
        this.entity.children[2].children[1].element.text = basePoints;
        this.entity.children[2].children[1].element.color = this.app.globals.green;
    } else {
        this.entity.children[2].children[1].enabled = false;
    }

    if (needs.on.length > 0) {
        this.entity.children[1].enabled = true;

        children[0].element.text = 'ON TOP OF: ';

        let columnIndex = 0;
        for (let i = 0; i < needs.on.length; i++) {
            if (columnIndex > 0) {
                children[columnIndex].enabled = true;
                children[columnIndex].element.text = 'OR';
            }
            children[columnIndex + 1].enabled = true;
            children[columnIndex + 1].script.fillimage.tile = needs.on[i];

            columnIndex += 2;
        }
        for (let i = columnIndex; i < children.length; i++) {
            children[i].enabled = false;
        }
    } else if (needs.and.length > 0) {
        this.entity.children[1].enabled = true;

        children[0].element.text = 'NEXT TO:';
        children[1].enabled = true;

        if (needs.or.length === 0) {
            children[1].script.fillimage.tile = 'Empty';
            children[1].children[0].enabled = true;
        } else {
            children[1].script.fillimage.tile = needs.or[0];
            children[1].children[0].enabled = false;
        }
        children[2].enabled = true;
        children[2].element.text = 'AND';
        children[3].enabled = true;
        children[3].script.fillimage.tile = needs.and[0];
        if (needs.and.length == 2) {
            children[4].enabled = true;
            children[4].element.text = 'AND';
            children[5].enabled = true;
            children[5].script.fillimage.tile = needs.and[1];

            for (let i = 6; i < children.length; i++) {
                children[i].enabled = false;
            }
        } else {
            for (let i = 4; i < children.length; i++) {
                children[i].enabled = false;
            }
        }
    } else if (needs.or.length > 0) {
        this.entity.children[1].enabled = true;

        children[0].element.text = 'NEXT TO:';

        let columnIndex = 0;
        for (let i = 0; i < needs.or.length; i++) {
            if (!this.app.buildingsSeen[needs.or[i]]) {
                continue;
            }

            if (columnIndex === 0) {
                children[columnIndex + 1].children[0].enabled = false;
            } else {
                children[columnIndex].enabled = true;
                children[columnIndex].element.text = 'OR';
            }
            children[columnIndex + 1].enabled = true;
            children[columnIndex + 1].script.fillimage.tile = needs.or[i];

            columnIndex += 2;
        }
        if (columnIndex === 0) {
            children[columnIndex + 1].enabled = true;
            children[columnIndex + 1].script.fillimage.tile = 'Empty';
            children[columnIndex + 1].children[0].enabled = true;

            columnIndex += 2;
        }
        for (let i = columnIndex; i < children.length; i++) {
            children[i].enabled = false;
        }
    } else {
        this.entity.children[1].enabled = false;
    }

    const extrapoints = this.app.globals.extrapoints[tile];
    const points = {};
    Object.keys(extrapoints).forEach(tile => {
        if (extrapoints[tile] == 0) {
            return;
        }
        if (!this.app.buildingsSeen[tile]) {
            return;
        }

        points[extrapoints[tile]] = points[extrapoints[tile]] || [];
        points[extrapoints[tile]].push(tile);
    });

    let rowIndex = 3;

    const keys = Object.keys(points);
    keys.sort(function (a, b) {
        return parseInt(b, 10) - parseInt(a, 10);
    });

    keys.forEach(extraStr => {
        this.entity.children[rowIndex].enabled = true;

        const tiles = points[extraStr];
        const extra = parseInt(extraStr, 10);
        const children = this.entity.children[rowIndex].children;

        if (extra > 0) {
            children[0].element.text = '+' + extra;
            children[0].element.color = this.app.globals.green;
            children[0].element.outlineColor = this.app.globals.green;
        } else {
            children[0].element.text = extra;
            children[0].element.color = this.app.globals.red;
            children[0].element.outlineColor = this.app.globals.red;
        }

        tiles.sort();

        let columnIndex = 1;
        for (let i = 0; i < tiles.length; i++) {
            children[columnIndex].enabled = true;
            children[columnIndex].script.fillimage.tile = tiles[i];

            columnIndex++;
        }
        for (let i = columnIndex; i < children.length; i++) {
            children[i].enabled = false;
        }

        rowIndex++;
    });

    while (rowIndex < this.entity.children.length) {
        this.entity.children[rowIndex].enabled = false;
        rowIndex++;
    }
};

Help.prototype.showHelp = function (tile, moveRight, moveUp, maxHeight, maxHeightContainer, opacity) {
    this.newContent = tile;
    this.moveRight = moveRight;
    this.moveUp = moveUp;
    this.maxHeight = maxHeight;
    this.maxHeightContainer = maxHeightContainer;
    this.opacity = opacity;
    this.entity.parent.enabled = true;
};

Help.prototype.clearHelp = function () {
    this.newContent = null;
};

Help.prototype.update = function () {
    if (this.newContent !== false) {
        if (!this.newContent) {
            this.entity.parent.enabled = false;
            return;
        } else {
            this.updateHelp(this.newContent);
            this.newContent = false;
        }
    }

    const min = new pc.Vec2(100000, 100000);
    const max = new pc.Vec2(-100000, -100000);

    const visit = (child, origin) => {
        if (!child.enabled) {
            return;
        }

        if (child.element && (child.element.text || child.element.texture)) {
            let minX = 0;
            let maxX = child.element.width;
            const minY = origin.y;
            const maxY = origin.y + child.element.height;

            if (child.element.texture) {
                minX = origin.x;
                maxX += origin.x;
            } else {
                maxX += 60; // No idea why, some margin, also no idea why the position is off.
            }

            if (min.x > minX) {
                min.x = minX;
            }
            if (min.y > minY) {
                min.y = minY;
            }
            if (max.x < maxX) {
                max.x = maxX;
            }
            if (max.y < maxY) {
                max.y = maxY;
            }
        }

        child.children.forEach(child => visit(child, origin.clone().add(child.getLocalPosition())));
    };

    this.entity.forEach(child => visit(child, new pc.Vec2(0, 0)));

    if (min.x === 100000) {
        min.x = 0;
        min.y = 0;
        max.x = 0;
        max.y = 0;
    }

    let width = Math.ceil(max.x - min.x);
    const height = Math.ceil((max.y - min.y) + 20);

    if (width < 250) {
        width = 250;
    }

    this.entity.parent.children[0].element.width = width;
    this.entity.parent.children[0].element.height = height;

    if (this.maxHeight > 0) {
        const position = this.maxHeightContainer.getLocalPosition();
        position.y = Math.min(this.maxHeight - (height * 0.5), 0);
        this.maxHeightContainer.setLocalPosition(position);
    } else if (this.maxHeight < 0) {
        const position = this.maxHeightContainer.getLocalPosition();
        position.y = Math.max((height * 0.5) + this.maxHeight, 0);
        this.maxHeightContainer.setLocalPosition(position);
    }

    this.entity.parent.setLocalPosition(new pc.Vec3(-(width - 100) * this.moveRight * this.scale, height * this.moveUp * this.scale, 0));

    if (width === this.lastWidth && height === this.lastHeight) {
        return;
    }
    this.lastWidth = width;
    this.lastHeight = height;

    const colorBuffer = new pc.Texture(this.app.graphicsDevice, {
        width: width,
        height: height,
        format: pc.PIXELFORMAT_R8_G8_B8_A8,
        mipmaps: false,
        anisotropy: 1,
    });

    colorBuffer.minFilter = pc.FILTER_LINEAR;
    colorBuffer.magFilter = pc.FILTER_LINEAR;
    colorBuffer.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
    colorBuffer.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
    colorBuffer.addressW = pc.ADDRESS_CLAMP_TO_EDGE;

    const pixels = colorBuffer.lock();
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const border = 2;
            const isBorder = x < border || y < border || x >= width - border || y >= height - border;
            pixels[((y * width) + x) * 4 + 0] = isBorder ? 255 : 40;
            pixels[((y * width) + x) * 4 + 1] = isBorder ? 255 : 60;
            pixels[((y * width) + x) * 4 + 2] = isBorder ? 255 : 80;
            pixels[((y * width) + x) * 4 + 3] = isBorder ? 255 : this.opacity;
        }
    }
    colorBuffer.unlock();

    this.entity.parent.children[0].element.texture = colorBuffer;

    if (this.colorBuffer) {
        this.colorBuffer.destroy();
    }
    this.colorBuffer = colorBuffer;
};