// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Putontop = pc.createScript('putontop');

Putontop.attributes.add('material', { type: 'asset', assetType: 'material' });

Putontop.prototype.initialize = function () {
    this.material.resource.msdfMap = this.entity.element._text._font;
    this.entity.element._text._setMaterial(this.material.resource);
};
