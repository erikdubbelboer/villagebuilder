// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Globals = pc.createScript('globals');

const saveName = 'save4';

Globals.prototype.initialize = function () {
    this.app.isWithEditor = window.location.href.indexOf('launch.playcanvas.com') !== -1;

    const el = document.createElement('audio');
    this.app.canPlayOpus = (navigator.vendor.indexOf('Apple') === -1) && !!el.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, '');

    this.app.once('game:levelloaded', () => {
        if (this.app.canPlayOpus) {
            // Audio converted using Audacity.
            this.app.root.findByName('sounds-opus').enabled = true;
        } else {
            // Audio compressed using: https://ocompress.com/mp3
            this.app.root.findByName('sounds-mp3').enabled = true;
        }
    });

    this.app.previousPacks = [];

    this.app.menuOpen = 0;

    this.app.globals = {
        // Rendering settings:
        batchSize: 1000,
        tileXSize: 1, // Add + 0.01 to add gap between tiles.
        tileYSize: 0.86,

        white: pc.Color.WHITE,
        lightgrey: new pc.Color(0.9, 0.9, 0.9, 1),
        red: pc.Color.RED,
        green: pc.Color.GREEN,
        yellow: pc.Color.YELLOW,

        levelNames: [
            'THE MEADOW',
            'THE ISLAND',
            'THE MOUNTAIN',
            'THE PLAINS',
            'THE FOREST',
        ],

        heights: {
            'Grain': 0.6,
            'Road': 0.6,
            'Sheep': 0.8,
            'Farm': 0.8,
            'Square': 0.8,
            'Market': 0.8,
            'Mill': 1.2,
            'Stable': 1.2,
            'Tower': 1.2,
            'Church': 1.2,
            'Hunting Cabin': 1.2,
            'Castle': 1.3,
        },
        scoreHeight: 0.5,

        renderTiles: [
            'House',
            'Road',
            'Lumberjack',
            'Sheep',
            'Grain',
            'Horses',
            'Carpenter',
            'Tavern',
            'Market',
            'Church',
            'Mine',
            'Smelter',
            'Hunting Cabin',
            'Mill',
            'Water Mill',
            'Fishing Hut',
            'Stable',
            'Castle',
            'Tower',
            'Statue',
            'Campfire',
            'Forest',
            'Grass Hill',
            'Stone Hill',
            'Water',
            'Grass',
            'River',
            'Water Rocks',
        ],

        namePrefixes: {
            'House': 'a',
            'Road': 'a',
            'Lumberjack': 'a',
            'Sheep': '',
            'Grain': '',
            'Horses': '',
            'Carpenter': 'a',
            'Tavern': 'a',
            'Market': 'a',
            'Church': 'a',
            'Mine': 'a',
            'Smelter': 'a',
            'Hunting Cabin': 'a',
            'Mill': 'a',
            'Water Mill': 'a',
            'Fishing Hut': 'a',
            'Stable': 'a',
            'Castle': 'a',
            'Tower': 'a',
            'Statue': 'a',
            'Campfire': 'a',
            'Forest': 'a',
            'Grass Hill': 'a',
            'Stone Hill': 'a',
            'Water': '',
            'Grass': '',
            'River': 'a',
            'Water Rocks': '',
        },

        cantRotate: [
            'Road',
            'Fishing Hut',
            'Water Mill',
            'Grass Hill',
            'Stone Hill',
            'Forest',
            'River',
            'Mountain',
            'Stone Rocks',
            'Water Rocks',
            'Field',
        ],
    };

    const decks = this.app.root.findByName('Decks');
    if (!decks) {
        return;
    }
    decks.enabled = false;

    this.app.buttons = [
        {
            tile: 'Plus',
            count: 0,
        },
        {
            tile: 'Random',
            count: 0,
        },
        {
            tile: 'Undo',
            count: 0,
        },
        {
            tile: 'Road',
            count: 0,
        }
    ];

    this.app.decks = [];

    this.app.tileNameToModel = function (name) {
        if (name === 'Road') {
            return 'path_straight';
        } else if (name === 'River') {
            return 'river_straight';
        }
        return name;
    };

    const hovers = {};
    this.app.hover = (id, on) => {
        if (on) {
            hovers[id] = true;
        } else {
            delete hovers[id];
        }

        if (Object.keys(hovers).length > 0) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'auto';
        }
    };

    let playing = false;
    this.app.gameplayStart = () => {
        if (!playing) {
            playing = true;

            if (window.PokiSDK) {
                PokiSDK.gameplayStart();
            }
        }
    };
    this.app.gameplayStop = () => {
        if (playing) {
            playing = false;

            if (window.PokiSDK) {
                PokiSDK.gameplayStop();
            }
        }
    };
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            this.app.gameplayStart();
        } else {
            this.app.gameplayStop();
        }
    });
    window.addEventListener('blur', () => {
        this.app.gameplayStop();
    });
    window.addEventListener('focus', () => {
        this.app.gameplayStart();
    });

    this.app.commercialBreak = () => {
        if (window.PokiSDK) {
            PokiSDK.commercialBreak(() => {
                //this.app.systems.sound.volume = 0;

                this.app.fire('game:pausemusic');
            }).then(() => {
                /*let sound = true;
                try {
                    sound = localStorage.getItem('sound') !== '0';
                } catch (ignore) { }

                if (sound) {
                    this.app.systems.sound.volume = 1;
                }*/

                this.app.fire('game:unpausemusic');
            });
        }
    };

    //const uiBatchGroup = this.app.batcher.getGroupByName('UI').id;
    this.app.markUIDirty = () => {
        //this.app.batcher.markGroupDirty(uiBatchGroup);
    };

    this.app.setBatchGroupId = (entity, batchGroupId) => {
        if (entity.render) {
            entity.render.batchGroupId = batchGroupId;
        }

        for (let i = 0; i < entity.children.length; i++) {
            this.app.setBatchGroupId(entity.children[i], batchGroupId);
        }
    };

    const cardButtons = this.app.root.findByName('CardButtons');

    this.app.on('game:updatecard', () => {
        const activeButtons = cardButtons.children.reduce(function (a, b) {
            if (b.enabled) {
                return a + 1;
            }
            return a;
        }, 0);

        const scale = Math.max(Math.min(8 / activeButtons, 1), 0.7);

        cardButtons.setLocalScale(scale, scale, scale);

        cardButtons.children.forEach(child => {
            child.children[2].setLocalScale(1 / scale, 1 / scale, 1 / scale);
        });
    });

    this.app.undo = () => {
        this.app.root.findByName('UndoGroup').enabled = false;

        if (this.app.undoState) {
            this.app.pointsTier = this.app.undoState.pointsTier;
            this.app.points = this.app.undoState.points;
            this.app.minPoints = this.app.undoState.minPoints;
            this.app.maxPoints = this.app.undoState.maxPoints;
            this.app.buttons[0].count = this.app.undoState.tileCount;

            const lastTile = this.app.undoState.lastTile;
            this.app.undoState = false;

            if (lastTile.buildingTile === 'Hunting Cabin') {
                this.app.levelStoneHillsLeft++;
            }
            if (lastTile.buildingTile === 'Mine') {
                this.app.levelGrassHillsLeft++;
            }
            if (lastTile.buildingTile === 'Fishing Hut') {
                this.app.levelFishingHutLeft++;
            }

            this.app.addTile(lastTile.buildingTile, 1);

            lastTile.buildingTile = '';

            lastTile.building.destroy();
            lastTile.building = undefined;

            this.app.root.find('name', 'MovingPoint').forEach(n => {
                n.destroy();
            });

            this.app.fire('game:updatebuttons');
            this.app.fire('game:updatecard');
            this.app.fire('game:updatesave');
            this.app.fire('game:resetpicker');
            this.app.fire('game:points');

            this.app.root.findByName('sun').light.updateShadow();
        }
    };

    this.app.addTile = (tile, count) => {
        for (let j = 0; j < this.app.buttons.length; j++) {
            const button = this.app.buttons[j];

            if (button.tile === tile) {
                button.count += count;

                if (button.count > 0) {
                    cardButtons.children[j].enabled = true;
                }
                return;
            }
        }

        this.app.buttons.push({
            tile: tile,
            count: count,
        });

        const newButton = cardButtons.children[cardButtons.children.length - 1].clone();
        newButton.children[0].script.CardButton.index = this.app.buttons.length - 1;
        newButton.enabled = count > 0;
        cardButtons.addChild(newButton);

        this.app.buildingsSeen[tile] = (this.app.buildingsSeen[tile] || 0) + 1;
    };

    this.app.levelName = '';
    this.app.levelState = {};
    this.app.openLevel = (type, attributes) => {
        this.app.levelName = type;
        this.app.levelState = attributes;

        const oldLevel = this.app.root.findByName('Level');
        if (oldLevel) {
            oldLevel.destroy();
        }

        for (let i = 0; i < this.app.buttons.length; i++) {
            this.app.buttons[i].count = 0;
        }

        this.app.fire('game:destroygrid');
        this.app.fire('game:resetscore');
        this.app.fire('game:resetpicker');
        this.app.fire('game:clearhelp');
        this.app.fire('game:updatebuttons');

        const level = new pc.Entity('Level');
        level.addComponent('script');
        level.script.create(type, {
            attributes: attributes,
        });

        this.app.root.addChild(level);

        this.app.root.findByName('MainMenu').enabled = false;
        this.app.root.findByName('LevelsMenu').enabled = false;

        const camera = this.app.root.findByName('camera');
        camera.script.orbitCamera.yaw = 0;
        camera.script.orbitCamera.pitch = -45;
        camera.script.orbitCamera.pivotPoint = new pc.Vec3(0, 0, 5);
        camera.script.orbitCamera.distance = 8;

        setTimeout(() => {
            this.app.root.findByName('sun').light.updateShadow();
        }, 10);
    };

    this.app.saveCurrentLevel = () => {
        const state = {
            level: {
                name: this.app.levelName,
                attributes: this.app.levelState,
            },
            buttons: this.app.buttons.map(b => [b.tile, b.count]),
            buildings: [],
            score: {
                points: this.app.points,
                maxPoints: this.app.maxPoints,
                minPoints: this.app.minPoints,
                pointsTier: this.app.pointsTier,
            },
            previousPacks: this.app.previousPacks,
        };

        if (this.app.decksOpen) {
            state.buttons[0][1]++;
        }

        const include = Object.keys(this.app.globals.extrapoints);
        for (let i = 1; i < this.app.levelSize - 1; i++) {
            for (let j = 1; j < this.app.levelSize - 1; j++) {
                const tile = this.app.tiles[i][j];

                if (tile.specialRoad) {
                    continue;
                }

                if (tile.buildingTile && include.includes(tile.buildingTile)) {
                    state.buildings.push([
                        i,
                        j,
                        tile.buildingTile,
                        Math.round(tile.angle),
                    ]);
                }
            }
        }

        return state;
    };

    this.app.loadLevel = state => {
        this.app.openLevel(state.level.name, state.level.attributes);

        this.app.once('game:levelloaded', () => {
            this.app.points = state.score.points;
            this.app.maxPoints = state.score.maxPoints;
            this.app.minPoints = state.score.minPoints;
            this.app.pointsTier = state.score.pointsTier;
            this.app.previousPacks = state.previousPacks || [];

            state.buildings.forEach(t => {
                const tile = this.app.tiles[t[0]][t[1]];

                if (tile.building) {
                    tile.building.destroy();
                }

                tile.buildingTile = t[2];
                tile.angle = t[3];

                this.app.buildingsSeen[tile.buildingTile] = 1;

                const template = this.app.assets.find(this.app.tileNameToModel(tile.buildingTile), "template");
                const entity = template.resource.instantiate();

                entity.setPosition(tile.x, tile.y, tile.z);
                entity.setRotation(new pc.Quat().setFromEulerAngles(0, tile.angle, 0));

                tile.building = entity;

                const batchGroupId = this.app.buildingBatchGroups[Math.floor(tile.i / this.app.globals.batchSize)][Math.floor(tile.j / this.app.globals.batchSize)].id;
                this.app.setBatchGroupId(entity, batchGroupId);

                this.app.root.findByName('Level').addChild(entity);

                if (tile.buildingTile === 'Fishing Hut' && tile.baseTile === 'Water') {
                    // We don't remove the model as we can render over it, but we have to remove this otherwise you can place Grain next to it.
                    tile.baseTile = 'Grass';
                }
                if (tile.buildingTile === 'Hunting Cabin') {
                    this.app.levelStoneHillsLeft--;
                }
                if (tile.buildingTile === 'Mine') {
                    this.app.levelGrassHillsLeft--;
                }
                if (tile.buildingTile === 'Fishing Hut') {
                    this.app.levelFishingHutLeft--;
                }

                this.app.globals.firstpoints[tile.buildingTile] = 0;
            });

            state.buttons.forEach(b => {
                this.app.buildingsSeen[b[0]] = 1;
                this.app.addTile(b[0], b[1]);
            });

            if (this.app.levelGrassHillsLeft > 0) {
                this.app.buildingsSeen['Grass Hill'] = 1;
            }
            if (this.app.levelStoneHillsLeft > 0) {
                this.app.buildingsSeen['Stone Hill'] = 1;
            }

            this.app.fire('game:fixroads');
            this.app.fire('game:points');
            this.app.fire('game:updatebuttons');
            this.app.fire('game:updatecard');
            this.app.fire('game:updatesave');
            this.app.fire('game:updateunlock');

            // Uncomment this to show the map name in the start.
            //this.app.root.findByName('LevelName').enabled = true;

            setTimeout(() => {
                this.app.root.findByName('sun').light.updateShadow();
            }, 100);

            if (this.app.state.current !== 0 || this.app.pointsTier >= 8) {
                this.app.root.findByName('RandomGroup').enabled = true;
            }

            if (!this.app.touch && this.app.state.current === 0 && this.app.pointsTier < 8) {
                let notip = false;
                try {
                    notip = localStorage.getItem('notip') === '1';
                } catch (ignore) { }

                if (!notip) {
                    const controlsTooltip = this.app.root.findByName('ControlsTooltip');
                    if (controlsTooltip) {
                        controlsTooltip.enabled = true;
                    }
                }
            }
        });
    };

    this.app.state = {
        current: 0,
        max: 0,
        levels: [],
        unlocked: {},
    };

    let saveTimeout;
    this.app.on('game:updatesave', () => {
        if (saveTimeout) {
            return;
        }

        saveTimeout = setTimeout(() => {
            saveTimeout = false;

            this.app.state.levels[this.app.state.current] = this.app.saveCurrentLevel();

            try {
                localStorage.setItem(saveName, this.app.compress(JSON.stringify(this.app.state)));
            } catch (unused) { }
        }, 500);
    });

    this.app.switchToLevel = (level, restart) => {
        if (window.PokiSDK) {
            PokiSDK.customEvent('game', 'segment', { segment: 'level-' + level });
        }
        if (restart) {
            if (window.PokiSDK) {
                PokiSDK.customEvent('game', 'segment', { segment: 'restart' });
            }
        }

        this.app.commercialBreak();

        this.app.state.current = level;

        this.app.fire('game:deselect');

        if (!restart && this.app.state.levels[level] && this.app.state.levels[level].level) {
            this.app.loadLevel(this.app.state.levels[level]);
            return;
        }

        if (level === 0) { // The Meadow
            this.app.openLevel('grass', {
                // Only use a random seed if the user progressed far enough into the level.
                levelSeed: (restart && (this.app.previousPacks.length > 7)) ? 0 : 78932,
                levelSize: 30,
                waterSize: 3,
                waterOffset: 7,
                forestNew: 5,
                forestNear: 35,
                rocks: 0,
                rocksNew: 3,
                rocksNear: 20,
                waterRocks: 18,
                river: true,
                island: false,
                fields: 0.1,
            });
        } else if (level === 1) { // The Island
            this.app.openLevel('grass', {
                levelSeed: 0, // Random
                levelSize: 25,
                waterSize: 0,
                waterOffset: 0,
                forestNew: 2,
                forestNear: 50,
                rocks: 0,
                rocksNew: 5,
                rocksNear: 40,
                waterRocks: 12,
                river: false,
                island: true,
            });
        } else if (level === 2) { // The Mountain
            this.app.openLevel('grass', {
                levelSeed: 0, // Random
                levelSize: 50,
                waterSize: 0,
                forestNew: 2,
                forestNear: 40,
                rocks: 4,
                rocksNew: 2,
                rocksNear: 10,
                waterRocks: 3,
                river: true,
                island: false,
                mountain: true,
            });
        } else if (level === 3) { // The Plains
            this.app.openLevel('grass', {
                levelSeed: 0, // Random
                levelSize: 50,
                waterSize: 5,
                waterOffset: 10,
                forestNew: 2,
                forestNear: 40,
                rocks: 4,
                rocksNew: 2,
                rocksNear: 10,
                waterRocks: 3,
                river: true,
                island: false,
            });
        } else if (level === 4) { // The Forest
            this.app.openLevel('grass', {
                levelSeed: 0, // Random
                levelSize: 45,
                waterSize: 7,
                waterOffset: 10,
                forestNew: 10,
                forestNear: 50,
                rocks: 4,
                rocksNew: 1,
                rocksNear: 3,
                waterRocks: 5,
                river: true,
                island: false,
            });
        }

        this.app.once('game:levelloaded', () => {
            if (this.app.levelGrassHillsLeft > 0) {
                this.app.buildingsSeen['Grass Hill'] = 1;
            }
            if (this.app.levelStoneHillsLeft > 0) {
                this.app.buildingsSeen['Stone Hill'] = 1;
            }

            if (level === 0) {
                this.app.addTile('House', 2);
            } else {
                this.app.addTile('Plus', 1);
            }

            this.app.root.findByName('UndoGroup').enabled = false;
            this.app.root.findByName('RandomGroup').enabled = false;

            this.app.undoState = false;
            this.app.previousPacks = [];

            this.app.fire('game:updatebuttons');
            this.app.fire('game:updatesave');
            this.app.fire('game:updateunlock');

            if (!this.app.touch && level === 0) {
                let notip = false;
                try {
                    notip = localStorage.getItem('notip') === '1';
                } catch (ignore) { }

                if (!notip) {
                    const controlsTooltip = this.app.root.findByName('ControlsTooltip');
                    if (controlsTooltip) {
                        controlsTooltip.enabled = true;
                    }
                }
            }
        });
    };
};

Globals.prototype.postInitialize = function () {
    // Skip when not in our main scene.
    if (!this.app.root.findByName('Decks')) {
        return;
    }

    this.app.gameplayStart();

    this.app.buildingsSeen = {
        'Road': 1,
        'Forest': 1,
        'Water': 1,
        'Grass': 1,
        'River': 1,
        'Water Rocks': 1,
        'Field': 1,
    };

    try {
        const data = this.app.decompress(localStorage.getItem(saveName));
        if (data) {
            const state = JSON.parse(data);

            this.app.state = state;
            this.app.switchToLevel(state.current, false);
            return;
        }
    } catch (err) {
        console.error(err);
    }

    this.app.switchToLevel(0, false);
};
