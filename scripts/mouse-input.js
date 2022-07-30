// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const MouseInput = pc.createScript('mouseInput');

MouseInput.attributes.add('orbitSensitivity', {
    type: 'number',
    default: 0.3,
    title: 'Orbit Sensitivity',
    description: 'How fast the camera moves around the orbit. Higher is faster'
});

MouseInput.attributes.add('distanceSensitivity', {
    type: 'number',
    default: 0.15,
    title: 'Distance Sensitivity',
    description: 'How fast the camera moves in and out. Higher is faster'
});

const mouseMoveFromEdge = 40;

MouseInput.prototype.initialize = function () {
    this.orbitCamera = this.entity.script.orbitCamera;

    this.dontMove = 0;
    this.mouseX = mouseMoveFromEdge + 10;
    this.mouseY = mouseMoveFromEdge + 10;

    this.app.on('game:disablecamera', () => {
        this.dontMove++;
    });
    this.app.on('game:enablecamera', () => {
        this.dontMove--;
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') {
            this.onMouseOut();
        }
    });

    if (this.orbitCamera) {
        const onMouseOut = e => {
            this.onMouseOut(e);
        };

        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

        // Listen to when the mouse travels out of the window.
        window.addEventListener('mouseout', onMouseOut, false);

        // Remove the listeners so if this entity is destroyed.
        this.on('destroy', function () {
            this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
            this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
            this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
            this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

            window.removeEventListener('mouseout', onMouseOut, false);
        });

        this.app.keyboard.on(pc.EVENT_KEYUP, event => {
            if (this.app.placingEntity) {
                if (event.key === pc.KEY_BACKSPACE || event.key === pc.KEY_DELETE) {
                    this.app.fire('game:deselect');
                }

                if (event.key === pc.KEY_COMMA) {
                    this.app.placingAngle += 60;
                    this.app.placingEntity.setRotation(new pc.Quat().setFromEulerAngles(0, this.app.placingAngle, 0));
                }
                if (event.key === pc.KEY_PERIOD) {
                    this.app.placingAngle -= 60;
                    this.app.placingEntity.setRotation(new pc.Quat().setFromEulerAngles(0, this.app.placingAngle, 0));
                }
            }
        });
    }

    // Disabling the context menu stops the browser displaying a menu when
    // you right-click the page
    this.app.mouse.disableContextMenu();

    this.lookButtonDown = false;
    this.moveButtonDown = false;

    this.nextRotate = 0;

    this.edgeMovement = document.body.clientWidth === screen.width;
    window.addEventListener('resize', () => {
        this.edgeMovement = document.body.clientWidth === screen.width;
    });
};

MouseInput.prototype.update = function (dt) {
    if (this.dontMove > 0) {
        return;
    }

    let left = this.app.keyboard.isPressed(pc.KEY_LEFT) || this.app.keyboard.isPressed(pc.KEY_A);
    let right = this.app.keyboard.isPressed(pc.KEY_RIGHT) || this.app.keyboard.isPressed(pc.KEY_D);
    let up = this.app.keyboard.isPressed(pc.KEY_UP) || this.app.keyboard.isPressed(pc.KEY_W);
    let down = this.app.keyboard.isPressed(pc.KEY_DOWN) || this.app.keyboard.isPressed(pc.KEY_S);
    const q = this.app.keyboard.isPressed(pc.KEY_Q);
    const e = this.app.keyboard.isPressed(pc.KEY_E);
    const r = this.app.keyboard.isPressed(pc.KEY_R);
    const f = this.app.keyboard.isPressed(pc.KEY_F);
    const z = this.app.keyboard.isPressed(pc.KEY_Z);
    const x = this.app.keyboard.isPressed(pc.KEY_X);

    let horizontalSpeed = 1;
    let verticalSpeed = 1;

    if (left || right || up || down) {
        if (window.PokiSDK) {
            if (!this.segmentWASD) {
                PokiSDK.customEvent('game', 'segment', { segment: 'keymove' });
                this.segmentWASD = true;
            }
        }
    } else if (!this.app.touch && this.edgeMovement) {
        //const height = this.app.graphicsDevice.height;
        const width = this.app.graphicsDevice.width;

        if (this.mouseX < mouseMoveFromEdge) {
            left = true;
            horizontalSpeed = (mouseMoveFromEdge - this.mouseX) / mouseMoveFromEdge;
        } else if (this.mouseX > width - mouseMoveFromEdge) {
            right = true;
            horizontalSpeed = (mouseMoveFromEdge - (width - this.mouseX)) / mouseMoveFromEdge;
        }
        /*if (this.mouseY < mouseMoveFromEdge) {
            up = true;
            verticalSpeed = (mouseMoveFromEdge - this.mouseY) / mouseMoveFromEdge;
        } else if (this.mouseY > height - mouseMoveFromEdge) {
            down = true;
            verticalSpeed = (mouseMoveFromEdge - (height - this.mouseY)) / mouseMoveFromEdge;
        }*/
    }

    if (this.app.keyboard.isPressed(pc.KEY_SHIFT)) {
        if (left) {
            this.orbitCamera.yaw -= 100 * dt;
        }
        if (right) {
            this.orbitCamera.yaw += 100 * dt;
        }
        if (up) {
            this.orbitCamera.pitch -= 100 * dt;
        }
        if (down) {
            this.orbitCamera.pitch += 100 * dt;
        }
    } else {
        if (left || right || up || down) {
            const speed = this.orbitCamera.distance;
            const d = new pc.Vec3(0, 0, 0);

            if (left) {
                d.x -= speed * dt * horizontalSpeed;
            }
            if (right) {
                d.x += speed * dt * horizontalSpeed;
            }
            if (up) {
                d.z -= speed * dt * verticalSpeed;
            }
            if (down) {
                d.z += speed * dt * verticalSpeed;
            }

            const newPivotPoint = this.orbitCamera.pivotPoint.clone().add(new pc.Quat().setFromEulerAngles(0, this.orbitCamera.yaw, 0).transformVector(d));
            const halfLevelSize = (this.app.levelSize - 2) / 2;
            const xBounds = (this.app.globals ? this.app.globals.tileXSize : 1000) * halfLevelSize;
            const yBounds = (this.app.globals ? this.app.globals.tileYSize : 1000) * halfLevelSize;

            if (newPivotPoint.x < -xBounds) newPivotPoint.x = -xBounds;
            if (newPivotPoint.x > xBounds) newPivotPoint.x = xBounds;
            if (newPivotPoint.z < -yBounds) newPivotPoint.z = -yBounds;
            if (newPivotPoint.z > yBounds) newPivotPoint.z = yBounds;

            this.orbitCamera.pivotPoint = newPivotPoint;
        }
    }
    if (q) {
        this.orbitCamera.yaw -= 100 * dt;
    }
    if (e) {
        this.orbitCamera.yaw += 100 * dt;
    }
    if (r) {
        this.orbitCamera.pitch -= 100 * dt;
    }
    if (f) {
        this.orbitCamera.pitch += 100 * dt;
    }
    if (z) {
        this.orbitCamera.distance -= dt * 10;
    }
    if (x) {
        this.orbitCamera.distance += dt * 10;
    }
};


MouseInput.prototype.onMouseDown = function (event) {
    switch (event.button) {
        case pc.MOUSEBUTTON_LEFT: {
            this.moveButtonDown = true;
        } break;
        case pc.MOUSEBUTTON_RIGHT: {
            this.lookButtonDown = true;
        } break;
        case pc.MOUSEBUTTON_MIDDLE: {
            this.lookButtonDown = true;
        } break;
    }
};


MouseInput.prototype.onMouseUp = function (event) {
    switch (event.button) {
        case pc.MOUSEBUTTON_LEFT: {
            this.moveButtonDown = false;
        } break;
        case pc.MOUSEBUTTON_RIGHT: {
            this.lookButtonDown = false;
        } break;
        case pc.MOUSEBUTTON_MIDDLE: {
            this.lookButtonDown = false;
        } break;
    }
};


MouseInput.prototype.onMouseMove = function (event) {
    if (this.dontMove > 0) {
        return;
    }

    this.mouseX = event.x;
    this.mouseY = event.y;

    if (this.lookButtonDown) {
        this.orbitCamera.pitch -= event.dy * this.orbitSensitivity;
        this.orbitCamera.yaw -= event.dx * this.orbitSensitivity;

        if (window.PokiSDK) {
            if (!this.segmentLookround) {
                PokiSDK.customEvent('game', 'segment', { segment: 'lookaround' });
                this.segmentLookround = true;
            }
        }
    } else if (this.moveButtonDown) {
        const d = new pc.Vec3(-event.dx * 0.02, 0, -event.dy * 0.02);
        const newPivotPoint = this.orbitCamera.pivotPoint.clone().add(new pc.Quat().setFromEulerAngles(0, this.orbitCamera.yaw, 0).transformVector(d));
        const halfLevelSize = (this.app.levelSize - 2) / 2;
        const xBounds = (this.app.globals ? this.app.globals.tileXSize : 1000) * halfLevelSize;
        const yBounds = (this.app.globals ? this.app.globals.tileYSize : 1000) * halfLevelSize;

        if (newPivotPoint.x < -xBounds) newPivotPoint.x = -xBounds;
        if (newPivotPoint.x > xBounds) newPivotPoint.x = xBounds;
        if (newPivotPoint.z < -yBounds) newPivotPoint.z = -yBounds;
        if (newPivotPoint.z > yBounds) newPivotPoint.z = yBounds;

        this.orbitCamera.pivotPoint = newPivotPoint;
    }
};

MouseInput.prototype.onMouseWheel = function (event) {
    if (this.dontMove > 0) {
        return;
    }

    const fromBottom = document.body.clientHeight - event.y;
    if (fromBottom <= 100) {
        // Ignore, handled in card button.js
    } else {
        this.orbitCamera.distance -= event.wheel * this.distanceSensitivity * (this.orbitCamera.distance * 0.1);
        event.event.preventDefault();

        if (window.PokiSDK) {
            if (!this.segmentZoomed) {
                PokiSDK.customEvent('game', 'segment', { segment: 'zoomed' });
                this.segmentZoomed = true;
            }
        }
    }
};

MouseInput.prototype.onMouseOut = function () {
    this.moveButtonDown = false;
    this.lookButtonDown = false;
    this.mouseX = mouseMoveFromEdge + 10;
    this.mouseY = mouseMoveFromEdge + 10;
};
