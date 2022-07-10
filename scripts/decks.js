// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Decks = pc.createScript('decks');

Decks.prototype.initialize = function () {
    this.app.keyboard.on(pc.EVENT_KEYUP, event => {
        if (event.key === pc.KEY_ESCAPE && this.entity.enabled) {
            this.app.playSound('menu');

            this.entity.enabled = false;

            this.app.root.findByName('Plus').script.plusbutton.putBackDeck();
        }
    });

    this.app.root.findByName('DeckBlur').button.on('click', () => {
        this.app.playSound('menu');

        this.entity.enabled = false;

        this.app.root.findByName('Plus').script.plusbutton.putBackDeck();
    }, this);
};
