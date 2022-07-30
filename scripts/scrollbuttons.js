// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Scrollbuttons = pc.createScript('scrollbuttons');

Scrollbuttons.prototype.initialize = function () {
    this.isDisabled = false;
    this.hovering = false;

    this.entity.button.on('mouseenter', this.onHoverStart, this);
    this.entity.button.on('mouseleave', this.onHoverEnd, this);
    this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

    this.app.on('game:disablecamera', () => {
        this.isDisabled = true;
    });
    this.app.on('game:enablecamera', () => {
        this.isDisabled = false;
    });

    this.cardButtonsScroll = this.app.root.findByName('CardButtonsScroll');
};

Scrollbuttons.prototype.onHoverStart = function () {
    if (this.isDisabled) {
        return;
    }

    this.hovering = true;
};

Scrollbuttons.prototype.onHoverEnd = function () {
    if (this.isDisabled) {
        return;
    }

    this.hovering = false;
};

Scrollbuttons.prototype.onMouseWheel = function (event) {
    if (!this.hovering || this.isDisabled) {
        return;
    }

    const pos = this.entity.getLocalPosition();
    pos.x -= -event.event.deltaX + event.event.deltaY;
    this.entity.setLocalPosition(pos);

    this.cardButtonsScroll.scrollbar.value = (pos.x + 500) / 1000;
};
