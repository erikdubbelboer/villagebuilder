// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Lookatcamera = pc.createScript('lookatcamera');

Lookatcamera.prototype.initialize = function () {
    this.camera = this.app.root.findByName('camera');
};

Lookatcamera.prototype.update = function () {
    this.entity.lookAt(this.camera.getPosition());

    // Need to rotate because lookAt actually looks away.
    // See: https://github.com/playcanvas/engine/issues/167
    this.entity.rotateLocal(0, 180, 0);
};
