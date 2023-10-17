// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.
//
// TODO: Rename to something better since it's not just used for decks anymore.

const RenderEmoji = pc.createScript('renderemoji');

RenderEmoji.attributes.add('emoji', {
    type: 'string',
    default: '',
});

RenderEmoji.attributes.add('alpha', {
    type: 'number',
    default: 1,
});

RenderEmoji.prototype.initialize = function () {
    this.entity.element.texture = this.getTexture();
};

RenderEmoji.prototype.getTexture = function () {
    const width = Math.round(this.entity.element.calculatedWidth);
    const height = Math.round(this.entity.element.calculatedHeight);
    const id = width + 'x' + height + ':' + this.emoji;

    if (width < 10 || height < 10) {
        return;
    }

    if (!this.app.renderEmojis) {
        this.app.renderEmojis = {};
    }

    if (this.app.renderEmojis[id]) {
        return this.app.renderEmojis[id];
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

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    ctx.font = (width * 0.75) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, ' + this.alpha + ')';
    ctx.fillText(this.emoji, width / 2, height / 2);

    const data = ctx.getImageData(0, 0, width, height).data;

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            pixels[((y * width) + x) * 4 + 0] = data[((y * width) + x) * 4 + 0];
            pixels[((y * width) + x) * 4 + 1] = data[((y * width) + x) * 4 + 1];
            pixels[((y * width) + x) * 4 + 2] = data[((y * width) + x) * 4 + 2];
            pixels[((y * width) + x) * 4 + 3] = data[((y * width) + x) * 4 + 3];
        }
    }
    colorBuffer.unlock();

    this.app.renderEmojis[id] = colorBuffer;

    return colorBuffer;
};
