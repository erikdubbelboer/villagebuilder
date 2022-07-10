// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Htmlelement = pc.createScript('htmlelement');

Htmlelement.prototype.initialize = function () {
    this.div = document.createElement('div');
    this.div.style.position = 'absolute';
    this.div.value = this.value;
    this.div.style.backgroundColor = 'white';
    this.div.style.overflow = 'scroll';
    this.div.style.padding = '10px';
    this.div.innerHTML = this.entity.element.text;
    this.entity.element.text = '';

    this.div.addEventListener('mouseup', e => {
        // Prevent clicks to propagate to the Blur which would close the menu.
        e.stopPropagation();
        e.preventDefault();
    }, { capture: true });

    this.div.addEventListener('wheel', e => {
        // Prevent the world from zooming when we are scrolling on top of the html element.
        e.stopPropagation();
    }, { capture: true });

    document.body.appendChild(this.div);

    this.on('enable', () => {
        this.div.style.display = 'block';

        this.div.focus();
    }, this);
    this.on('disable', () => {
        this.div.style.display = 'none';
    }, this);
};

Htmlelement.prototype.update = function () {
    const left = this.entity.element.canvasCorners[3].x + 'px';
    if (left != this.left) {
        this.left = left;
        this.div.style.left = left;
    }

    const top = this.entity.element.canvasCorners[3].y + 'px';
    if (top != this.top) {
        this.top = top;
        this.div.style.top = top;
    }

    const width = (this.entity.element.canvasCorners[1].x - this.entity.element.canvasCorners[3].x) + 'px';
    if (width != this.width) {
        this.width = width;
        this.div.style.width = width;
    }

    const height = ((this.entity.element.canvasCorners[1].y - this.entity.element.canvasCorners[3].y) - 20) + 'px';
    if (height != this.height) {
        this.height = height;
        this.div.style.height = height;
    }
};
