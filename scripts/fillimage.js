// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Fillimage = pc.createScript('fillimage');

Fillimage.attributes.add('tile', {
    type: 'string',
    default: 'House',
});

Fillimage.prototype.initialize = function () {
    this.textureAssigned = false;

    this.on('attr', () => {
        this.textureAssigned = false;
    });
};

Fillimage.prototype.update = function () {
    if (!this.textureAssigned && this.tile) {
        const t = this.app.tileTextures[this.tile];
        if (t) {
            this.textureAssigned = true;
            this.entity.element.texture = t;
        }
    }
};
