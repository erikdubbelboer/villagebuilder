// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Controlstooltip = pc.createScript('controlstooltip');

Controlstooltip.prototype.initialize = function () {
    this.fadeOut = 0;
    let fadeTimeout = -1;

    const startTimeout = d => {
        clearTimeout(fadeTimeout);

        fadeTimeout = setTimeout(() => {
            this.fadeOut = 1;
        }, d);
    };

    startTimeout(60 * 1000);

    this.entity.button.on('mouseenter', () => {
        this.fadeOut = 0;
        this.entity.element.opacity = 1;
        this.entity.children[0].element.opacity = 1;
        clearTimeout(fadeTimeout);
        this.hoverStart = performance.now();
    });

    this.entity.button.on('mouseleave', () => {
        startTimeout(2 * 1000);

        // If the user hovered for more than 2 seconds they got it.
        if (performance.now() - this.hoverStart > 2000) {
            try {
                localStorage.setItem('notip', '1');
            } catch (ignore) { }
        }
    });

    this.entity.button.on('click', () => {
        this.entity.enabled = false;
        try {
            localStorage.setItem('notip', '1');
        } catch (ignore) { }
    });
};

Controlstooltip.prototype.update = function (dt) {
    if (this.fadeOut > 0) {
        this.fadeOut -= dt;

        if (this.fadeOut <= 0) {
            this.entity.enabled = false;
            return;
        }

        this.entity.element.opacity = this.fadeOut;
        this.entity.children[0].element.opacity = this.fadeOut;
    }
};
