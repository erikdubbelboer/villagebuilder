// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Movingpoint = pc.createScript('movingpoint');

Movingpoint.prototype.initialize = function () {
    this.target = this.app.root.findByName('ScoreBarProgress');
    this.camera = this.app.root.findByName('camera');

    if (this.entity.bouncePosition) {
        this.distance = new pc.Vec3().sub2(this.entity.getPosition(), this.entity.bouncePosition).length();
    } else {
        const now = this.entity.getPosition();
        const end = new pc.Vec3();

        this.camera.camera.screenToWorld(
            //this.target.element.canvasCorners[2].x + (this.target.element.canvasCorners[0].x - this.target.element.canvasCorners[2].x) / 2,
            this.target.element.canvasCorners[2].x,
            this.target.element.canvasCorners[2].y + (this.target.element.canvasCorners[0].y - this.target.element.canvasCorners[2].y) / 2,
            2,
            end,
        );

        this.distance = end.sub(now).length();
    }
};

Movingpoint.prototype.update = function (dt) {
    const now = this.entity.getPosition();
    let end = new pc.Vec3();

    if (this.entity.bouncePosition) {
        end = new pc.Vec3(this.entity.bouncePosition.x, now.y, this.entity.bouncePosition.z);
    } else {
        this.camera.camera.screenToWorld(
            this.target.element.canvasCorners[2].x,
            this.target.element.canvasCorners[2].y + (this.target.element.canvasCorners[0].y - this.target.element.canvasCorners[2].y) / 2,
            2,
            end,
        );
    }

    const r = new pc.Vec3();

    r.sub2(end, now);

    const currentDist = r.length();
    let speed = this.app.pointSpeed;

    if (!this.entity.bouncePosition) {
        //r.y += 5 * (Math.max(currentDist - 2, 0) / this.distance);
        r.y -= 1 * (Math.max(currentDist - 2, 0) / this.distance);
    } else {
        speed = this.app.pointSpeed / 5;
    }

    r.normalize();
    r.mulScalar(dt * speed);

    // Are we going to overshoot the target?
    if (r.length() > currentDist || currentDist < 0.1) {
        if (this.entity.bouncePosition) {
            if (!this.entity.isPoint) {
                this.entity.destroy();
                return;
            }

            this.entity.bouncePosition = null;

            const now = this.entity.getPosition();
            const end = new pc.Vec3();

            this.camera.camera.screenToWorld(
                this.target.element.canvasCorners[2].x,
                this.target.element.canvasCorners[2].y + (this.target.element.canvasCorners[0].y - this.target.element.canvasCorners[2].y) / 2,
                2,
                end,
            );

            this.distance = end.sub(now).length();
        } else {
            this.app.points++;

            if (this.app.points >= this.app.maxPoints) {
                this.app.root.findByName('Plus').script.plusbutton.addDeck();

                this.app.points -= this.app.maxPoints;
                this.app.minPoints = 0;
                this.app.pointsTier++;

                if (window.PokiSDK) {
                    PokiSDK.customEvent('game', 'segment', {
                        segment: 'pointstier-' + this.app.state.current + '-' + this.app.pointsTier,
                        tilesleft: this.app.buttons.map(t => t.count).reduce((a, b) => a + b, 0),
                    });
                }
                if (window.GameAnalytics) {
                    GameAnalytics("addProgressionEvent", "Start", "world" + ('000' + this.app.state.current).substr(-3), "stage001", "level" + ('000' + this.app.pointsTier).substr(-3));
                }

                if (this.app.state.current === 0) {
                    this.app.maxPoints = 4 + (this.app.pointsTier * 6);
                } else if (this.app.state.current === 1) {
                    this.app.maxPoints = 15 + (this.app.pointsTier * 4);
                } else if (this.app.state.current === 2) {
                    this.app.maxPoints = 15 + (this.app.pointsTier * 5);
                } else {
                    this.app.maxPoints = 15 + (this.app.pointsTier * 6);
                }

                this.app.fire('game:fireworks');
                this.app.fire('game:shake', 0.4);
                this.app.fire('tooltip:close');

                if (this.app.state.current !== 0 || this.app.pointsTier >= 7) {
                    this.app.root.findByName('RandomGroup').enabled = true;
                }

                if (this.app.pointsTier === 20) {
                    const rewards = [
                        'Statue',
                        'Ship',
                        'Campfire',
                        'Townhall',
                        'Forest',
                    ];
                    const reward = rewards[this.app.state.current];
                    if (reward) {
                        this.app.nowUnlocked = reward;
                        this.app.state.unlocked[reward] = true;
                        this.app.root.findByName('CompletedMenu').enabled = true;
                        this.app.fire('game:deselect');
                    }
                }
            }

            this.app.fire('game:points');
            this.app.fire('game:updatesave');
            this.app.playSound('point');

            this.entity.destroy();
            return;
        }
    }

    r.add(now);

    if (this.entity.bouncePosition) {
        r.y = Math.sin((currentDist / this.distance) * Math.PI);
    }

    this.entity.setPosition(r);
};
