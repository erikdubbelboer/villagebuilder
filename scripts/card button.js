// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const CardButton = pc.createScript('CardButton');

CardButton.attributes.add('index', {
    type: 'number',
    default: 1,
});

CardButton.prototype.initialize = function () {
    this.tileName = '';
    this.isDisabled = false;
    this.cardButtonsScroll = this.app.root.findByName('CardButtonsScroll');

    if (this.app.touch) {
        this.entity.button.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    }

    this.entity.button.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    this.entity.button.on('mouseenter', this.onHoverStart, this);
    this.entity.button.on('mouseleave', this.onHoverEnd, this);
    this.entity.button.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);

    // Enable this to enable dragging the buttons on desktop.
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

    this.app.on('game:disablecamera', () => {
        this.isDisabled = true;
    });
    this.app.on('game:enablecamera', () => {
        this.isDisabled = false;
    });

    this.on('destroy', () => {
        throw new Error('CardButton destroy');
    });

    this.app.on('game:updatebuttons', this.updateButtons, this);

    this.updateButtons();

    this.touchStarted = 0;
    this.wasPlacingTileName = '';

    this.entity.parent.setLocalScale(1, 1, 1);

    this.cardButtons = this.entity.parent.parent;

    this.dragStartedAt = this.dragCurrentAt = false;
    this.dragPlacing = false;

    this.hovering = false;

    this.isClicking = false;

    this.animating = false;
    this.animationLeft = 0.5;

    this.scoreTemplate = this.app.root.findByName('score-template');
    this.help = this.app.root.findByName('Help');
};

CardButton.prototype.onSelect = function (xy) {
    if (this.app.touch && !this.dragPlacing && this.touchStarted !== 0 && this.touchStarted + 500 < performance.now()) {
        return;
    }

    if (this.wasPlacingTileName === this.tileName) {
        this.app.playSound('cancel');
        this.app.fire('game:deselect');
        return;
    }

    this.app.playSound('pick');

    if (this.app.placingEntity) {
        this.app.placingEntity.score.destroy();
        this.app.placingEntity.destroy();
        this.app.placingEntity = null;

        this.app.fire('game:fixroads');
        this.app.fire('game:clearscore');
    }

    this.app.placingTileName = this.tileName;

    const entity = this.app.assets.find(this.app.tileNameToModel(this.tileName), "template").resource.instantiate();

    this.app.placingAngle = Math.floor(pc.math.random(0, 6)) * 60;
    if (this.app.placingTileName === 'Ship') {
        this.app.placingAngle += 30;
    }
    entity.setRotation(new pc.Quat().setFromEulerAngles(0, this.app.placingAngle, 0));

    const size = this.app.globals.auras[this.app.placingTileName];
    const tileXSize = this.app.globals.tileXSize;
    const tileYSize = this.app.globals.tileYSize;

    entity.grid = [];
    const ss = Math.ceil(size * 1.1);
    for (let i = -ss; i <= ss; i++) {
        for (let j = -ss; j <= ss; j++) {
            const z = j * tileYSize;
            let x = i * tileXSize;
            if (j % 2 !== 0) {
                x += 0.5;
            }

            const p = new pc.Vec3(x, 0, z);

            const d = p.distance(new pc.Vec3());
            if (d <= size * 1.1) {
                entity.grid.push({ i, j });
            }
        }
    }

    const score = this.scoreTemplate.clone();
    score.children[0].element.text = '';
    score.setLocalScale(0.7, 0.7, 0.7);

    entity.tile = [0, 0];
    entity.score = score;
    entity.size = size;
    entity.points = 1;
    entity.bitmap = '000000';

    if (this.tileName === 'Water Mill') {
        entity.waterMillBase = 1;
    }

    this.app.placingEntity = entity;

    entity.enabled = false;
    score.enabled = false;

    this.app.root.addChild(entity);
    this.app.root.addChild(score);

    // This seems to have no effect on the number of drawcalls.
    // this.app.setBatchGroupId(entity, this.app.pickerBratchGroup.id);

    this.app.fire('game:newselect', xy);
};

CardButton.prototype.update = function (dt) {
    if (!this.textureAssigned && this.tileName) {
        const t = this.app.tileTextures[this.tileName];
        if (t) {
            this.textureAssigned = true;
            this.entity.element.texture = t;
        }
    }

    if (this.app.animateCardButtons) {
        this.animating = true;
        const aminationTime = 1;
        if (this.animationLeft > 0) {
            this.animationLeft = Math.max(this.animationLeft - dt, 0);

            if (this.animationLeft >= (aminationTime / 2)) {
                const s = 1 + ((aminationTime - this.animationLeft) / (aminationTime / 2)) / 10;
                this.entity.parent.setLocalScale(s, s, s);
            } else {
                const s = 1 + (this.animationLeft / (aminationTime / 2)) / 10;
                this.entity.parent.setLocalScale(s, s, s);
            }
        } else {
            this.animationLeft = aminationTime;
        }
    } else if (this.animating) {
        this.animating = false;

        if (!this.hovering) {
            this.entity.parent.setLocalScale(1, 1, 1);
        }
    }
};

CardButton.prototype.updateButtons = function () {
    this.app.markUIDirty();

    const data = this.app.buttons[this.index];

    if (!data.tile || !data.count) {
        this.entity.parent.enabled = false;
        return;
    }

    if (this.tileName !== data.tile) {
        this.tileName = data.tile;
        this.textureAssigned = false;
    }

    this.entity.parent.children[1].enabled = true;
    this.entity.parent.children[1].element.text = data.count;
};

CardButton.prototype.onTouchStart = function (event) {
    this.wasPlacingTileName = this.app.placingTileName;
    this.app.fire('game:deselect');
    this.touchStarted = performance.now();
    this.onHoverStart();
    this.dragStartedAt = this.dragCurrentAt = [event.touches[0].clientX, event.touches[0].clientY];
    this.app.fire('game:disablecamera');
    if (!this.app.draggingButtons) {
        this.isClicking = true;
    }
};

CardButton.prototype.onTouchEnd = function (event) {
    if (this.touchStarted === 0) {
        return;
    }

    // Show the tooltip for at least X milliseconds.
    // This helps players realize that there are tooltips when pressing down on buttons.
    if (this.app.pointsTier < 5 && performance.now() - this.touchStarted < 300) {
        setTimeout(() => {
            this.touchStarted = 0;
            this.onHoverEnd();
        }, 300);
    } else {
        this.touchStarted = 0;
        this.onHoverEnd();
    }

    if (this.isClicking) {
        this.app.fire('game:enablecamera');

        this.onSelect(this.dragPlacing ? this.dragCurrentAt : false);

        this.dragPlacing = false;
        this.isClicking = false;
    }

    if (this.app.draggingButtons) {
        this.app.fire('game:enablecamera');
    }

    this.app.draggingButtons = false;
    this.dragStartedAt = this.dragCurrentAt = false;
};

CardButton.prototype.onHoverStart = function () {
    if (this.isDisabled) {
        return;
    }
    if (this.app.draggingButtons) {
        return;
    }

    this.entity.parent.setLocalScale(1.1, 1.1, 1.1);

    this.app.noPickerHover = true;

    this.app.hover('cardbutton', true);

    this.entity.parent.children[2].enabled = true;

    this.help.reparent(this.entity.parent.children[2]);
    this.app.fire('game:showhelp', this.tileName, 0.5, 0.5, 0, null, 200);

    this.hovering = true;

    this.app.animateCardButtons = false;
};

CardButton.prototype.onHoverEnd = function () {
    this.entity.parent.setLocalScale(1, 1, 1);

    this.app.noPickerHover = false;

    this.app.hover('cardbutton', false);

    this.entity.parent.children[2].enabled = false;

    this.app.fire('game:clearhelp');

    this.hovering = false;
};

CardButton.prototype.onMouseDown = function (event) {
    if (this.isDisabled) {
        return;
    }

    this.wasPlacingTileName = this.app.placingTileName;
    this.app.fire('game:deselect');
    this.entity.parent.setLocalScale(1.05, 1.05, 1.05);
    this.dragStartedAt = this.dragCurrentAt = [event.x, event.y];
    this.app.fire('game:disablecamera');
    this.isClicking = true;
};

CardButton.prototype.onMouseUp = function (event) {
    if (this.hovering) {
        this.entity.parent.setLocalScale(1.1, 1.1, 1.1);
    }

    if (this.isClicking) {
        this.app.fire('game:enablecamera');

        this.onSelect(this.dragPlacing ? this.dragCurrentAt : [event.x, event.y]);

        this.dragPlacing = false;
        this.isClicking = false;
    }

    if (this.app.draggingButtons) {
        this.app.fire('game:enablecamera');
    }

    this.app.draggingButtons = false;
    this.dragStartedAt = this.dragCurrentAt = false;
};

CardButton.prototype.onTouchMove = function (event) {
    if (this.dragStartedAt === false) {
        return;
    }
    if (this.touchStarted === 0) {
        return;
    }

    this.dragTo(event.touches[0].x, event.touches[0].y);
};

CardButton.prototype.onMouseMove = function (event) {
    if (this.dragStartedAt === false) {
        return;
    }

    this.dragTo(event.x, event.y);
};

CardButton.prototype.dragTo = function (x, y) {
    if (this.dragPlacing) {
        this.dragCurrentAt = [x, y];
        return;
    }

    const d = this.dragCurrentAt[0] - x;

    if (this.app.buttons.length > 10 && Math.abs(d) > 30) {
        const pos = this.cardButtons.getLocalPosition();
        pos.x -= d;
        this.cardButtons.setLocalPosition(pos);

        this.cardButtonsScroll.scrollbar.value = (pos.x + 500) / 1000;

        this.dragCurrentAt[0] = x;
        this.app.draggingButtons = true;
        this.isClicking = false;
        this.dragPlacing = false;
    } else if (!this.app.draggingButtons && this.dragStartedAt[1] - y > 50) {
        this.onHoverEnd();
        this.dragCurrentAt = [x, y];
        this.dragPlacing = true;

        this.app.fire('game:showgrid');
    }
};

CardButton.prototype.onMouseWheel = function (event) {
    if (!this.hovering || this.isDisabled) {
        return;
    }

    const pos = this.cardButtons.getLocalPosition();
    pos.x -= -event.event.deltaX + event.event.deltaY;
    this.cardButtons.setLocalPosition(pos);

    this.cardButtonsScroll.scrollbar.value = (pos.x + 500) / 1000;
};
