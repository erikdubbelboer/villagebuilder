// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Scores = pc.createScript('scores');

Scores.prototype.initialize = function () {
    this.pointMat = this.app.assets.find('Point', 'material').resource;

    this.app.on('game:updatescore', this.updatescore, this);
    this.app.on('game:lockscore', this.lockscore, this);
    this.app.on('game:clearscore', this.clearscore, this);
    this.app.on('game:resetscore', this.resetscore, this);
    this.app.on('game:stop', () => {
        this.currentPoints = 0;
        this.pointsToDo = [];
    }, this);

    this.currentPoints = 0;
    this.pointsToDo = [];
};

/*const onlyOnceRoadPointsTiles = [
    'Mine',
    'Fishing Hut',
    'Hunting Cabin',
];*/

Scores.prototype.updatescore = function () {
    if (!this.app.placingTileName) {
        return;
    }
    if (this.app.placingTileName === 'Road') {
        this.app.placingEntity.points = 0;
        return;
    }

    const cameraDistance = this.app.root.findByName('camera').script.orbitCamera.distance;
    const levelSize = this.app.levelSize;
    const size = this.app.globals.auras[this.app.placingTileName] * 1.1;
    const p = this.app.placingEntity.getPosition();
    let points = this.app.globals.firstpoints[this.app.placingTileName] || 0;
    let roads = 0;
    let roadDistance = 99999999;
    let roadTile = null;

    this.app.placingEntity.points = points;

    for (let i = 0; i < levelSize; i++) {
        for (let j = 0; j < levelSize; j++) {
            const tile = this.app.tiles[i][j];

            if (this.app.placingValid) {
                const d = Math.sqrt((p.x - tile.x) * (p.x - tile.x) + (p.z - tile.z) * (p.z - tile.z));
                if (d <= size) {
                    let pts = this.app.globals.extrapoints[this.app.placingTileName][tile.buildingTile] || 0;
                    if (!pts) {
                        pts = this.app.globals.extrapoints[this.app.placingTileName][tile.baseTile] || 0;
                    }

                    if (i === this.app.placingEntity.tile[0] && j === this.app.placingEntity.tile[1]) {
                        pts = 0;
                    }

                    if (pts) {
                        if (/*onlyOnceRoadPointsTiles.includes(this.app.placingTileName) && */tile.buildingTile === 'Road') {
                            roads++;

                            if (roads > 1) {
                                if (d < roadDistance) {
                                    roadDistance = d;
                                    roadTile.scoreEntity.destroy();
                                    roadTile.scoreEntity = null;
                                    roadTile = tile;
                                    points -= pts;
                                } else {
                                    pts = 0;
                                }
                            } else {
                                roadTile = tile;
                                roadDistance = d;
                            }
                        }

                        if (pts) {
                            points += pts;

                            if (!tile.scoreEntity) {
                                const score = this.app.root.findByName('score-template').clone();

                                score.setPosition(tile.x, tile.y + this.app.globals.scoreHeight, tile.z);
                                this.entity.addChild(score);
                                tile.scoreEntity = score;

                                score.enabled = true;
                            }

                            let s = Math.max(0.35, 0.035 * cameraDistance * 1.5);

                            if (pts > 0) {
                                tile.scoreEntity.children[0].element.text = '+' + pts;
                                tile.scoreEntity.children[0].element.color = this.app.globals.lightgrey;
                                tile.scoreEntity.children[0].element.outlineColor = this.app.globals.lightgrey;
                                tile.scoreEntity.children[0].element.outlineThickness = 0.1;
                            } else {
                                tile.scoreEntity.children[0].element.text = pts;
                                tile.scoreEntity.children[0].element.color = this.app.globals.red;
                                tile.scoreEntity.children[0].element.outlineColor = this.app.globals.white;
                                tile.scoreEntity.children[0].element.outlineThickness = 0.3;
                                s += 0.15;
                            }
                            tile.scoreEntity.points = pts;

                            tile.scoreEntity.setLocalScale(s, s, s);

                            continue;
                        }
                    }
                }
            }

            if (tile.scoreEntity) {
                tile.scoreEntity.destroy();
                tile.scoreEntity = null;
            }
        }
    }

    points = Math.max(points, 0);

    if (this.app.placingValid) {
        this.app.placingEntity.score.enabled = true;

        let s = Math.max(0.7, 0.07 * cameraDistance);

        if (points > 0) {
            this.app.placingEntity.score.children[0].element.text = points;
            this.app.placingEntity.score.children[0].element.color = this.app.globals.white;
            this.app.placingEntity.score.children[0].element.outlineColor = this.app.globals.white;
            this.app.placingEntity.score.children[0].element.outlineThickness = 0.1;
        } else {
            this.app.placingEntity.score.children[0].element.text = points;
            this.app.placingEntity.score.children[0].element.color = this.app.globals.red;
            this.app.placingEntity.score.children[0].element.outlineColor = this.app.globals.white;
            this.app.placingEntity.score.children[0].element.outlineThickness = 0.3;
            s += 0.15;
        }

        this.app.placingEntity.score.setLocalScale(s, s, s);
    } else {
        this.app.placingEntity.score.enabled = false;
    }

    this.currentPoints = points;
};

Scores.prototype.lockscore = function () {
    const duration = Math.min(0.5, Math.max(0.2, this.currentPoints / this.app.maxPoints));
    this.app.fire('game:shake', duration);

    const position = this.app.placingEntity.getPosition().clone();

    if (this.app.placingEntity.points > 0) {
        this.pointsToDo.push({
            points: this.app.placingEntity.points,
            actualPoints: this.app.placingEntity.points,
            position: position.clone(),
            bounce: null,
            dt: 0,
        });
    }

    let actualPointsLeft = this.currentPoints - this.app.placingEntity.points;

    for (let i = 0; i < this.app.levelSize; i++) {
        for (let j = 0; j < this.app.levelSize; j++) {
            const tile = this.app.tiles[i][j];

            if (tile.scoreEntity) {
                if (tile.scoreEntity.points > 0) {
                    const actualPoints = Math.min(tile.scoreEntity.points, actualPointsLeft);
                    actualPointsLeft -= actualPoints;

                    this.pointsToDo.push({
                        points: tile.scoreEntity.points,
                        actualPoints,
                        position: new pc.Vec3(tile.x, tile.y, tile.z),
                        bounce: position.clone(),
                        dt: 0,
                    });
                }

                tile.scoreEntity.destroy();
                tile.scoreEntity = null;
            }
        }
    }

    if (this.app.placingEntity) {
        this.app.placingEntity.score.enabled = false;
    }

    if (this.app.placingTileName !== 'Ship' && this.app.placingTileName !== 'Statue') {
        this.app.globals.firstpoints[this.app.placingTileName] = 0;
    }
};

Scores.prototype.clearscore = function () {
    for (let i = 0; i < this.app.levelSize; i++) {
        for (let j = 0; j < this.app.levelSize; j++) {
            const tile = this.app.tiles[i][j];

            if (tile.scoreEntity) {
                tile.scoreEntity.destroy();
                tile.scoreEntity = null;
            }
        }
    }

    if (this.app.placingEntity) {
        this.app.placingEntity.score.enabled = false;
    }
};

Scores.prototype.update = function (dt) {
    let done = false;
    this.pointsToDo = this.pointsToDo.filter(p => {
        if (done) {
            p.dt += dt;
            return true;
        }

        p.dt -= dt;

        if (p.dt <= 0) {
            --p.points;
            --p.actualPoints;
            p.dt = 0.2;

            const entity = new pc.Entity();
            entity.name = 'MovingPoint';
            entity.addComponent('render', {
                type: 'sphere'
            });
            entity.render.material = this.pointMat;
            entity.render.castShadows = false;
            entity.addComponent('script');
            entity.bouncePosition = p.bounce;
            entity.isPoint = p.actualPoints >= 0;
            entity.script.create('movingpoint');
            entity.setPosition(p.position);
            entity.setLocalScale(0.05, 0.05, 0.05);
            this.entity.addChild(entity);

            this.app.pointSpeed = Math.min(this.app.pointSpeed + 0.5, 12);

            done = entity.isPoint;
        }

        return p.points > 0;
    });
};

/*
Scores.prototype.isTile = function(i, j, tile) {
    if (i < 0 || i >= this.app.levelSize || j < 0 || j >= this.app.levelSize) {
        return false;
    }
    
    const t = this.app.tiles[i][j];
    return t.baseTile === tile || t.buildingTile === tile;
};

Scores.prototype.isNeighbor = function(i, j, tile) {
    if (this.isTile((i-1) + (1-j%2), j-1, tile)) return true;
    if (this.isTile((i+0) + (1-j%2), j-1, tile)) return true;
    if (this.isTile(i+1, j, tile)) return true;
    if (this.isTile((i+0) + (1-j%2), j+1, tile)) return true;
    if (this.isTile((i-1) + (1-j%2), j+1, tile)) return true;
    if (this.isTile(i-1, j, tile)) return true;
    return false;
};
*/

Scores.prototype.resetscore = function () {
    this.app.points = 0;
    this.app.maxPoints = (this.app.state.current === 0) ? 4 : 15;
    this.app.minPoints = 0;
    this.app.pointsTier = 0;

    this.currentPoints = 0;
    this.pointsToDo = [];

    while (this.entity.children.length > 0) {
        this.entity.children[0].destroy();
    }

    this.app.globals.firstpoints = structuredClone(this.app.globals.basepoints);

    setTimeout(() => {
        this.app.fire('game:points');
    }, 0);

    this.app.pointSpeed = (this.app.state.current === 0) ? 3 : 12;
};
