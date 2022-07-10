// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const UpdateNextLevel = pc.createScript('updatenextlevel');

UpdateNextLevel.prototype.initialize = function () {
    this.app.on('game:points', this.setScore, this);

    this.setScore();
};

UpdateNextLevel.prototype.setScore = function () {
    if (this.app.pointsTier >= 20) {
        this.entity.element.text = this.app.pointsTier;
    } else {
        this.entity.element.text = this.app.pointsTier + '/20';
    }
    this.app.markUIDirty();
};
