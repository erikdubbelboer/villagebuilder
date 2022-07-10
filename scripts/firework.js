// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Firework = pc.createScript('firework');

Firework.attributes.add('target', {
    type: 'vec3',
});

Firework.attributes.add('sound', {
    type: 'boolean',
});

Firework.prototype.initialize = function () {
    this.origin = this.entity.getPosition().clone();
    this.distance = new pc.Vec3().sub2(this.entity.getPosition(), this.target).length();
    this.randX = -2 + (Math.random() * 4);
    this.randZ = -2 + (Math.random() * 4);
    this.speed = 3 + (Math.random() * (1 + Math.abs(this.randX) + Math.abs(this.randZ)));
};

Firework.prototype.update = function (dt) {
    const now = this.entity.getPosition();

    // Are we going to overshoot the target?
    if (new pc.Vec3().sub2(now, this.origin).length() > this.distance) {
        const particles = this.app.root.findByName('Fireworks Explosion').clone();
        particles.name = 'Fireworks Explosion Clone';

        const colors = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
            [1, 1, 0],
            [1, 1, 0],
            [0, 1, 1],
        ];
        const c = colors[Math.floor(Math.random() * colors.length)];
        particles.particlesystem.colorGraph.curves[0].keys[0][1] = c[0];
        particles.particlesystem.colorGraph.curves[1].keys[0][1] = c[1];
        particles.particlesystem.colorGraph.curves[2].keys[0][1] = c[2];

        /*const rgb = HSLToRGB(Math.random() * 360, 100, 40);
        particles.particlesystem.colorGraph.curves[0].keys[0][1] = rgb[0] / 255;
        particles.particlesystem.colorGraph.curves[1].keys[0][1] = rgb[1] / 255;
        particles.particlesystem.colorGraph.curves[2].keys[0][1] = rgb[2] / 255;*/

        particles.setPosition(now);
        particles.enabled = true;
        setTimeout(() => {
            particles.destroy();
        }, particles.particlesystem.lifetime * 1000);

        this.app.root.addChild(particles);

        if (this.sound) {
            const entity = this.app.root.findByName('fireworksSound-' + (this.app.canPlayOpus ? 'opus' : 'mp3')).clone();
            entity.enabled = true;
            entity.setPosition(now);
            this.app.root.addChild(entity);

            entity.sound.on('end', () => {
                entity.destroy();
            });
        }

        this.entity.destroy();
        return;
    }

    const end = this.target;

    const r = new pc.Vec3();

    r.sub2(end, now);

    const currentDist = r.length();

    const m = Math.max(currentDist - 2, 0) / this.distance;
    r.add(new pc.Vec3(0, 5, 0).mulScalar(m));

    r.normalize();
    r.mulScalar(dt * this.speed);
    r.add(now);

    this.entity.setPosition(r);

    this.target.add(new pc.Vec3(dt * this.randX, 0, dt * this.randZ));
};
/*
function HSLToRGB(h, s, l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b];
}
*/