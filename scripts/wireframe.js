///<reference path="/Users/erik/.vscode/extensions/playcanvas.playcanvas-0.1.5/node_modules/playcanvas/build/playcanvas.d.ts" />;
// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

var Wireframe = pc.createScript('wireframe');

// initialize code called once per entity
Wireframe.prototype.initialize = function () {
    if (this.entity.cloned) {
        this.entity.render.meshInstances[0].mesh.generateWireframe();
        this.entity.render.meshInstances[0].renderStyle = pc.RENDERSTYLE_WIREFRAME;
        this.entity.render.meshInstances[0].material = this.entity.render.meshInstances[0].material.clone();
        this.entity.render.meshInstances[0].material.blendType = pc.BLEND_NONE;
    } else {
        const clone = this.entity.clone();
        clone.cloned = true;
        this.entity.parent.addChild(clone);
    }
};
