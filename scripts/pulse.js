var Pulse = pc.createScript('pulse');

// initialize code called once per entity
Pulse.prototype.initialize = function () {
    this.time = 0;
};

Pulse.prototype.update = function (dt) {
    this.time += dt * 3;

    this.entity.element.opacity = 0.2 + (1 + Math.sin(this.time)) / 5;
};
