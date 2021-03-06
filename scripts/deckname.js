// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Deckname = pc.createScript('deckname');

Deckname.attributes.add('pack', {
    type: 'number',
    default: 0,
});

// update code called every frame
Deckname.prototype.update = function (dt) {
    this.entity.element.text = this.app.decks[this.pack].title.toUpperCase();
};
