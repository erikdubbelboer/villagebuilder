// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Tooltip = pc.createScript('tooltip');

Tooltip.prototype.initialize = function () {
    this.seen = {};

    this.app.on('game:resetscore', () => {
        this.closeTooltip();

        this.seen = {};

        if (this.app.state.current === 0) {
            if (!this.app.touch) {
                this.showTooltip('mouselook');
            }
        }
    });

    this.tooltip = this.app.root.findByName('LeftTooltip');

    this.app.on('tooltip:show', this.showTooltip, this);
    this.app.on('tooltip:close', this.closeTooltip, this);

    if (this.app.state.current === 0) {
        if (!this.app.touch) {
            this.showTooltip('mouselook');
        }
    }

    this.tooltip.button.on('click', () => {
        this.closeTooltip();
    }, this);
};

Tooltip.prototype.showTooltip = function (index) {
    if (this.app.state.current !== 0) {
        return;
    }
    if (this.seen[index]) {
        return;
    }

    const tt = {
        'mouselook': 'MOUSE LEFT OR ARROW KEYS TO MOVE\n\nMOUSE RIGHT TO LOOK\n\nSCROLL TO ZOOM',
        'presstwice': 'PRESS TO MOVE THE BUILDING\n\nPRESS TWICE TO CONFIRM BUILDING LOCATION',
    }[index];

    if (this.closeTimeout) {
        clearTimeout(this.closeTimeout);
    }

    this.tooltip.children[0].element.text = tt;
    this.tooltip.enabled = true;

    this.closeTimeout = setTimeout(() => {
        this.closeTooltip();
    }, 15 * 1000);

    this.seen[index] = true;
};

Tooltip.prototype.closeTooltip = function () {
    if (this.closeTimeout) {
        clearTimeout(this.closeTimeout);
    }

    this.tooltip.enabled = false;
};
