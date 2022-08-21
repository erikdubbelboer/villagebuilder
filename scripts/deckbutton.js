// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.
//
// TODO: Rename to something better since it's not just used for decks anymore.

const DeckButton = pc.createScript('deckbutton');

DeckButton.attributes.add('alpha', {
    type: 'number',
    default: 100,
});

DeckButton.attributes.add('scale', {
    type: 'number',
    default: 1.05,
});

DeckButton.attributes.add('texture', {
    type: 'asset',
    assetType: 'texture',
});

DeckButton.prototype.initialize = function () {
    if (this.entity.button) {

        if (this.app.touch) {
            this.entity.button.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
            this.entity.button.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        }

        this.entity.button.on('mouseenter', this.onHoverStart, this);
        this.entity.button.on('mouseleave', this.onHoverEnd, this);
        this.entity.button.on('mousedown', this.onMouseDown, this);
        this.entity.button.on('mouseup', this.onMouseUp, this);

        this.entity.button.on('click', () => {
            this.app.hover('deckbutton', false);
        });

        this.on('disable', () => {
            this.onHoverEnd();
        });
    }

    this.entity.element.texture = this.getTexture();
    this.entity.element.opacity = 1;
};

DeckButton.prototype.onHoverStart = function () {
    this.entity.setLocalScale(this.scale, this.scale, this.scale);
    this.app.hover('deckbutton', true);
};

DeckButton.prototype.onHoverEnd = function () {
    this.entity.setLocalScale(1, 1, 1);
    this.app.hover('deckbutton', false);
};

DeckButton.prototype.onTouchStart = function () {
    this.onHoverStart();
};

DeckButton.prototype.onTouchEnd = function () {
    this.onHoverEnd();
};

DeckButton.prototype.onMouseUp = function () {
    this.entity.setLocalScale(this.scale, this.scale, this.scale);
};

DeckButton.prototype.getTexture = function () {
    const width = Math.round(this.entity.element.calculatedWidth);
    const height = Math.round(this.entity.element.calculatedHeight);
    const id = width + 'x' + height + ':' + (this.texture ? '1' : '0');

    if (width < 10 || height < 10) {
        return;
    }

    if (!this.app.deckButtons) {
        this.app.deckButtons = {};
    }

    if (this.app.deckButtons[id]) {
        return this.app.deckButtons[id];
    }

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

    if (this.texture) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(this.texture.resource.getSource(), 0, 0, width, height);
        const data = canvas.getContext('2d').getImageData(0, 0, width, height).data;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const border = 2;
                const isBorder = x < border || y < border || x >= width - border || y >= height - border;

                if (isBorder) {
                    pixels[((y * width) + x) * 4 + 0] = 255;
                    pixels[((y * width) + x) * 4 + 1] = 255;
                    pixels[((y * width) + x) * 4 + 2] = 255;
                    pixels[((y * width) + x) * 4 + 3] = 255;
                } else if (data[((y * width) + x) * 4 + 3] === 0) {
                    pixels[((y * width) + x) * 4 + 0] = 40;
                    pixels[((y * width) + x) * 4 + 1] = 60;
                    pixels[((y * width) + x) * 4 + 2] = 80;
                    pixels[((y * width) + x) * 4 + 3] = this.alpha;
                } else {
                    pixels[((y * width) + x) * 4 + 0] = data[((y * width) + x) * 4 + 0];
                    pixels[((y * width) + x) * 4 + 1] = data[((y * width) + x) * 4 + 1];
                    pixels[((y * width) + x) * 4 + 2] = data[((y * width) + x) * 4 + 2];
                    pixels[((y * width) + x) * 4 + 3] = data[((y * width) + x) * 4 + 3];
                }
            }
        }
    } else {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const border = 2;
                const isBorder = x < border || y < border || x >= width - border || y >= height - border;
                pixels[((y * width) + x) * 4 + 0] = isBorder ? 255 : 40;
                pixels[((y * width) + x) * 4 + 1] = isBorder ? 255 : 60;
                pixels[((y * width) + x) * 4 + 2] = isBorder ? 255 : 80;
                pixels[((y * width) + x) * 4 + 3] = isBorder ? 255 : this.alpha;
            }
        }
    }
    colorBuffer.unlock();

    this.app.deckButtons[id] = colorBuffer;

    return colorBuffer;
};
