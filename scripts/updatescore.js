// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Updatescore = pc.createScript('updatescore');

Updatescore.prototype.initialize = function () {
    this.app.on('game:points', this.setScore, this);

    this.setScore();
};

Updatescore.prototype.setScore = function () {
    this.entity.element.text = this.app.points + "/" + this.app.maxPoints;
    this.app.markUIDirty();
};
