// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Globals = pc.createScript('globals');

Globals.EnvMain = 1;
Globals.EnvModels = 2;
Globals.EnvLevelEditor = 3;

Globals.attributes.add('env', {
    type: 'number',
    enum: [
        { 'Main': Globals.EnvMain },
        { 'Models': Globals.EnvModels },
        { 'LevelEditor': Globals.EnvLevelEditor }
    ],
});

Globals.prototype.initialize = function () {
    Globals.env = this.env;

    this.app.saveName = 'save5';

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

    if (!this.app.touch) {
        const cardButtonsScroll = this.app.root.findByName('CardButtonsScroll');
        if (cardButtonsScroll) {
            cardButtonsScroll.enabled = false;
        }
    }

    // dummy function to use until sound system is loaded.
    this.app.playSound = () => { };

    this.app.previousPacks = [];

    this.app.movingPointCount = 0;

    this.app.menuOpen = 0;

    this.app.globals = {
        // Rendering settings:
        batchSize: 1000,
        tileXSize: 1, // Add + 0.01 to add gap between tiles.
        tileYSize: 0.86,

        white: pc.Color.WHITE,
        black: pc.Color.BLACK,
        darkgrey: new pc.Color(0.2, 0.2, 0.2, 1),
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
            'Townhall': 1.1,
            'Ship': 1.1,
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
            'Ship',
            'Townhall',
            'Jousting',
            'Storehouse',
            'Vineyard',
            'Winery',
            'Noria',
            'Bathhouse',
            'Shipyard',
            'Pigs',
            'Chapel',
            'Papermill',
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
            'Ship': 'a',
            'Townhall': 'a',
            'Jousting': '',
            'Storehouse': 'a',
            'Vineyard': 'a',
            'Winery': 'a',
            'Noria': 'a',
            'Bathhouse': 'a',
            'Shipyard': 'a',
            'Pigs': '',
            'Chapel': 'a',
            'Papermill': 'a',
        },

        cantRotate: [
            'Road',
            'Fishing Hut',
            'Water Mill',
            'Grass Hill',
            'Stone Hill',
            'Forest',
            'River',
            'Water',
            'Mountain',
            'Stone Rocks',
            'Water Rocks',
            'Field',
            'Shipyard',
        ],
    };

    const decks = this.app.root.findByName('Decks');
    if (!decks) {
        return;
    }
    decks.enabled = false;

    this.app.buttons = [
        {
            tile: 'NextMap',
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
        setTimeout(() => {
            if (this.app.menuOpen === 0) {
                if (!playing) {
                    playing = true;

                    console.log('gameplayStart');
                    if (window.PokiSDK) {
                        PokiSDK.gameplayStart();
                    }
                }
            }
        }, 10);
    };
    this.app.gameplayStop = () => {
        setTimeout(() => {
            if (this.app.menuOpen > 0) {
                if (playing) {
                    playing = false;

                    console.log('gameplayStop');
                    if (window.PokiSDK) {
                        PokiSDK.gameplayStop();
                    }
                }
            }
        }, 10);
    };
    /*document.addEventListener('visibilitychange', () => {
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
    });*/

    this.app.commercialBreak = () => {
        if (window.PokiSDK) {
            this.app.fire('game:disablecamera');

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

                this.app.fire('game:enablecamera');
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

            const lastTile = this.app.undoState.lastTile;

            if (lastTile.buildingTile === 'Hunting Cabin') {
                this.app.levelStoneHillsLeft++;
            }
            if (lastTile.buildingTile === 'Mine') {
                this.app.levelGrassHillsLeft++;
            }
            if (lastTile.buildingTile === 'Fishing Hut') {
                this.app.levelFishingHutLeft++;

                this.app.fire('game:updateleft');
            }
            if (lastTile.buildingTile === 'Shipyard') {
                this.app.levelShipyardLeft++;
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
            this.app.fire('game:fixroads');

            this.app.root.findByName('sun').light.updateShadow();

            this.app.undoState = false;
        }
    };

    this.app.addTile = (tile, count, replace) => {
        if (tile === 'Plus') {
            return;
        }

        for (let j = 0; j < this.app.buttons.length; j++) {
            const button = this.app.buttons[j];

            if (button.tile === tile) {
                if (replace) {
                    button.count = count;
                } else {
                    button.count += count;
                }

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

        const oldButton = cardButtons.children[cardButtons.children.length - 1];
        if (oldButton.children[2].children.length > 0) {
            this.app.fire('game:clearhelp');
            oldButton.children[2].children[0].reparent(cardButtons.parent);
        }
        const newButton = oldButton.clone();
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

        this.app.once('game:levelloaded', () => {
            setTimeout(() => {
                this.app.root.findByName('sun').light.updateShadow();
            }, 10);
        });

        const level = new pc.Entity('Level');
        level.addComponent('script');
        level.script.create(type, {
            attributes: attributes,
        });

        this.app.root.addChild(level);

        this.app.fire('mainmenu', false);
        this.app.root.findByName('LevelsMenu').enabled = false;

        const camera = this.app.root.findByName('camera');
        camera.script.orbitCamera.yaw = 0;
        camera.script.orbitCamera.pitch = -45;
        camera.script.orbitCamera.pivotPoint = new pc.Vec3(0, 0, 5);
        camera.script.orbitCamera.distance = 8;
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

        const include = Object.keys(this.app.globals.extrapoints);
        for (let i = 1; i < this.app.levelSize - 1; i++) {
            for (let j = 1; j < this.app.levelSize - 1; j++) {
                const tile = this.app.tiles[i][j];

                if (tile.specialRoad) {
                    continue;
                }

                // No need to save the Forest, it's part of the level seed.
                if (tile.buildingTile === 'Forest') {
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
        this.app.once('game:levelloaded', () => {
            this.app.points = state.score.points;
            this.app.maxPoints = state.score.maxPoints;
            this.app.minPoints = state.score.minPoints;
            this.app.pointsTier = state.score.pointsTier;
            this.app.previousPacks = state.previousPacks || [];

            let nextBuildingTimeout = 0;

            if (this.app.thumbnailVideo) {
                const order = [
                    'Stable',
                    'Sheep',
                    'Mill',
                    'Grain',
                    'Market',
                    'House',
                    'Tavern',
                    'Church',
                    'Water Mill',
                    'Castle',
                ];

                state.buildings.sort((a, b) => {
                    const ai = order.indexOf(a[2]);
                    const bi = order.indexOf(b[2]);

                    if (ai === bi) {
                        return b[1] - a[1];
                    }

                    return ai - bi;
                });

                nextBuildingTimeout = 5000;

                setTimeout(() => {
                    this.app.thumbnailVideoRotateCamera = true;
                }, nextBuildingTimeout + 500);
                setTimeout(() => {
                    this.app.thumbnailVideoZoomCamera = true;
                }, nextBuildingTimeout + 2000);
                setTimeout(() => {
                    this.app.thumbnailVideoZoomCamera = false;
                    this.app.thumbnailVideoRotateCamera = false;
                }, nextBuildingTimeout + 6000);

                const camera = this.app.root.findByName('camera');
                camera.script.orbitCamera.yaw = 147.6000000000001;
                camera.script.orbitCamera.pitch = -36.600000000000065;
                camera.script.orbitCamera.pivotPoint = new pc.Vec3(0.6248876755058734, 0, 3.0812933498276616);
                camera.script.orbitCamera.distance = 12;
            }

            state.buildings.forEach(t => {
                // Don't re-build the Forest, they are already placed by the level generator.
                if (t[2] === 'Forest') {
                    return;
                }

                let timeout = nextBuildingTimeout;

                if (t[2] === 'Road' || t[2] === 'Lumberjack') {
                    timeout = 0;
                } else {
                    nextBuildingTimeout += 150;
                }

                const placeBuilding = () => {
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
                    if (tile.buildingTile === 'Shipyard') {
                        this.app.levelShipyardLeft--;
                    }

                    this.app.fire('game:fixroads');
                };

                if (this.app.thumbnailVideo && timeout > 0) {
                    setTimeout(() => {
                        placeBuilding();

                        setTimeout(() => {
                            this.app.root.findByName('sun').light.updateShadow();
                        }, 10);
                    }, timeout);
                } else {
                    placeBuilding();
                }
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

            this.app.root.findByName('UndoGroup').enabled = false;
            this.app.root.findByName('RandomGroup').enabled = this.app.previousPacks.length > 4;
            this.app.root.findByName('NextMapGroup').enabled = this.app.pointsTier >= 10;

            this.app.animateCardButtons = false;

            this.app.undoState = false;

            this.app.fire('game:fixroads');
            this.app.fire('game:points');
            this.app.fire('game:updatebuttons');
            this.app.fire('game:updatecard');
            this.app.fire('game:updatesave');
            this.app.fire('game:nextunlock');
            this.app.fire('game:levelloaded2');

            setTimeout(() => {
                this.app.root.findByName('sun').light.updateShadow();
            }, 100);

            /*if (!this.app.touch && this.app.state.current === 0 && this.app.pointsTier < 8) {
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
            }*/
        });

        this.app.openLevel(state.level.name, state.level.attributes);
    };

    this.app.state = {
        current: 0,
        max: 0,
        levels: [],
        unlocked: {},
    };

    let saveTimeout;
    this.app.on('game:updatesave', () => {
        if (Globals.env !== Globals.EnvMain) {
            return;
        }

        if (saveTimeout) {
            return;
        }

        saveTimeout = setTimeout(() => {
            saveTimeout = false;

            this.app.state.levels[this.app.state.current] = this.app.saveCurrentLevel();

            try {
                localStorage.setItem(this.app.saveName, this.app.compress(JSON.stringify(this.app.state)));
            } catch (unused) { }
        }, 500);
    });

    this.app.switchToLevel = (level, restart, force) => {
        if (window.PokiSDK) {
            PokiSDK.customEvent('game', 'segment', {
                segment: 'level-' + level,
            });
        }
        if (restart) {
            if (window.PokiSDK) {
                PokiSDK.customEvent('game', 'segment', { segment: 'restart' });
            }
        }

        this.app.state.current = level;

        this.app.fire('game:deselect');

        if (!restart && this.app.state.levels[level] && this.app.state.levels[level].level) {
            this.app.loadLevel(this.app.state.levels[level]);
            return;
        }

        this.app.once('game:levelloaded', () => {
            if (this.app.levelGrassHillsLeft > 0) {
                this.app.buildingsSeen['Grass Hill'] = 1;
            }
            if (this.app.levelStoneHillsLeft > 0) {
                this.app.buildingsSeen['Stone Hill'] = 1;
            }

            this.app.root.findByName('UndoGroup').enabled = false;
            this.app.root.findByName('RandomGroup').enabled = false;
            this.app.root.findByName('NextMapGroup').enabled = false;

            this.app.undoState = false;
            this.app.previousPacks = [];

            this.app.fire('game:updatebuttons');
            this.app.fire('game:updatesave');
            this.app.fire('game:nextunlock');
            this.app.fire('game:levelloaded2');

            this.app.root.children[0].script.plusbutton.addDeck();

            /*if (!this.app.touch && level === 0) {
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
            }*/

            if (window.PokiSDK) {
                PokiSDK.customEvent('game', 'segment', {
                    segment: 'pointstier-' + this.app.state.current + '-' + this.app.pointsTier,
                    tilesleft: this.app.buttons.map(t => t.count).reduce((a, b) => a + b, 0),
                });
            }
        });

        if (level === 0) { // The Meadow
            /*this.app.openLevel('grass', {
                // Only use a random seed if the user progressed far enough into the level.
                levelSeed: (restart && (this.app.pointsTier > 7 || force)) ? 0 : 78932,
                levelSize: 30,
                waterSize: 3,
                waterOffset: 7,
                forestNew: 5,
                forestNear: 35,
                rocks: 0,
                rocksNew: 3,
                rocksNear: 20,
                waterRocks: 14,
                river: true,
                island: false,
                fields: 0.1,
            });*/
            this.app.openLevel('grass2', {
                name: 'level1',
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
    };
};

Globals.prototype.postInitialize = function () {
    // Skip when not in our main scene.
    if (Globals.env !== Globals.EnvMain) {
        return;
    }

    if (!this.app.graphicsDevice.extInstancing) {
        this.app.root.findByName('NotSupportedMenu').enabled = true;
        this.app.root.findByName('ScoreBar').enabled = false;
        return;
    }

    let sound = true;
    try {
        sound = localStorage.getItem('sound') !== '0';
    } catch (ignore) { }
    if (sound) {
        this.app.systems.sound.volume = 1;
    } else {
        this.app.systems.sound.volume = 0;
    }

    let music = true;
    try {
        music = localStorage.getItem('music') !== '0';
    } catch (ignore) { }
    if (music) {
        this.app.fire('game:restartmusic');
    } else {
        this.app.fire('game:stopmusic');
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
        let ls = localStorage.getItem(this.app.saveName);

        if (this.app.thumbnailVideo) {
            ls = 'N4IgxgrgTlCmB2AXEAuADAGhAWwIYA9VMQAbWAN1hIGdUBtUMyk1UeXbWVEAcyl2q0suRIigBLAEYREsWikYUqAZViwAJqgDsADgCcAZgBMWJivEAvLigPEA7iNhRll6wawPZUAPIAzX9SwyChaWL4A9nDUiABysHaoAKxhkXKxsLhQqAbJIFDhYADW8sT5RdRxCTZYZcVxmahG9o5QAEoFxagAjAAsNeKUWShiELBY4tQkuPCaKL64NGMgvuJU6iUAdF0AvttY0qLh8PJ0dCBx+IgAsrgADiAYaAC6GGet0+rh2A/PryAAqjNwj8Xm9wrhNBguqCQABhASIMgPaF/G5QQpBZEwgAS4QggSxLxA0nEJHU4ngPBOdD6XRMIAAYqlosidL8aVC+ozmcgMAA2dnJLrEJlRXkC0FC+mitKswVQ9zcsUPIw9eW9LAyllQpqSqF8zU85G614Grq5LW81Xs0JdUJK2U6m1QnSG5Uu51dPRux22dmurquh3awP+qHe4O89neroGyNy0Ex+2WlVqxMun3a6MYIxxlNO0HCnNc/OhwuYIwWo0e8s5vPV9lFozJ6sS15dLoYRX5v2Fzsl6t0xudqvu3vtztB/PWvsZkDtCEPAC0bboHZzLfdjZMA/dZfbJk3jtXdP1majhZMgawC8hJ5MTSwABkINhJE4AFa4Iqp7cb88ggeOZTg2hbuLujozu27hHtqUFru45oAV2aCNoh9ZbmBUL2i+b6ft+hSAQhc63gm0HhshjZ9KOjpURgsEXu2fQgWOqGFn0Ealmy7GclgADi/AUsadFISAAm4EJNZMWeYmCfAv48XaWC4viXAYCuIlBqR/IiRG8LREiOmFskNHauOa7JAxRFISxtHGbxskSfJjz2aJ4mSUOrlxlcpIsAW7ZCva2nmUh14gCpBJGQFFEgAAKrggzORp9mPuFeKRfBSFGJ2aWqQ8IVmpRhYGhBcFpu2ZpchFameRVUK5O5zmNmaEbVcumUGtlWBohivK1WutrISFoSlVa5UDQ5bVRRNonaf1SmxlgygABZqPc00LfayiILgkiGZltpBita0Ke2oSpfmjbndK1aZQGN2sY2AZcrCy3QGAy3Lj0JprgGuTaXdMnHbA60hQGW2rSDy4GCeAZHZD63Je2AYRrh75QF+P5Sb9OY5aWP3XkYD2Ovua4xv94KQvNSZLQjp1kzm9Jo/hWPUzm3bViF3qqshpNejmpljeyj4aiAADqLQAAQ+SQfnwSLFOLi5ryPpWvPcSrnazZTwmgkT9U3jr01GIheODhrdA8xhJM/Tz67xtjdu2dqq5q6L+au0K1shhbbtWcWwtmmbmEq2agtEbmMnTuNkdhT2bGhzF0fC7awd2SrtrEy7KcKrztu2t74o50pDvF87QtPES1BgKkrAgLc4QUog8g9EGeD4AACo3SDyAKWDYBSXdNyUWAN8PsWrEMeh7PXcDkOI6UdwRJwgMzGMEQ8kZQAAniATzbESEDwCQHQaKwuxAA=';
        }

        const data = this.app.decompress(ls);
        if (data) {
            const state = JSON.parse(data);

            this.app.state = state;
            this.app.switchToLevel(state.current, false, false);
            return;
        }
    } catch (err) {
        console.error(err);
    }

    this.app.switchToLevel(0, false, false);
};
