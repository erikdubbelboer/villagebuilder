// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Progressbackground = pc.createScript('progressbackground');

Progressbackground.prototype.initialize = function () {
    this.entity.element.material = this.entity.element.material.clone();

    this.entity.element.material.alphaTest = 0.001;
};
