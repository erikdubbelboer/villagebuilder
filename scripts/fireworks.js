// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Fireworks = pc.createScript('fireworks');

Fireworks.prototype.initialize = function () {
    this.arrowMat = this.app.assets.find('Point', 'material').resource;

    this.app.on('game:fireworks', this.spawnFireworks, this);
};

Fireworks.prototype.spawnFireworks = function () {
    const ignore = [
        'Road',
        'Forest',
    ];
    const include = Object.keys(this.app.globals.extrapoints);

    const withSound = [];
    //const cameraLocation = this.app.root.findByName('camera').getPosition();

    for (let i = 1; i < this.app.levelSize - 1; i++) {
        for (let j = 1; j < this.app.levelSize - 1; j++) {
            const tile = this.app.tiles[i][j];

            if (tile.buildingTile && include.includes(tile.buildingTile) && !ignore.includes(tile.buildingTile)) {
                const location = new pc.Vec3(tile.x, 0.2, tile.z);

                withSound.push([
                    //cameraLocation.distance(location),
                    Math.random() * 1000,
                    location,
                ]);
            }
        }
    }

    withSound.sort((a, b) => {
        return a[0] - b[0];
    });

    const delayBetweenSound = 200;
    let lastDelay = -delayBetweenSound;
    withSound.forEach((a, i) => {
        const delay = a[0];
        const sound = delay - lastDelay > delayBetweenSound;

        if (sound) {
            lastDelay = delay;
        }

        setTimeout(() => {
            this.spawn(a[1], sound);
        }, delay);
    });
};

Fireworks.prototype.spawn = function (location, sound) {
    const target = location.clone();
    target.add(new pc.Vec3(0, 2, 0));

    const firework = new pc.Entity();
    firework.addComponent('render', {
        type: 'sphere'
    });
    firework.render.material = this.arrowMat;
    firework.addComponent('script');
    firework.script.create('firework', {
        attributes: {
            target: target,
            sound: sound,
        },
    });
    firework.setLocalScale(0.05, 0.05, 0.05);
    firework.setPosition(location);

    this.app.root.addChild(firework);
};
