// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

const Config = pc.createScript('config');

// Automatically generated from Google Sheets.
Config.prototype.initialize = function () {
  this.app.globals.auras = {
    'House': 2.5,
    'Tavern': 3.5,
    'Market': 2,
    'Church': 4,
    'Mine': 1,
    'Smelter': 5,
    'Blacksmith': 2,
    'Carpenter': 4,
    'Lumberjack': 2,
    'Hunting Cabin': 3,
    'Mill': 2,
    'Water Mill': 2,
    'Fishing Hut': 4,
    'Grain': 1.5,
    'Stable': 2.5,
    'Horses': 3,
    'Sheep': 2,
    'Castle': 4,
    'Tower': 4,
    'Road': 1,
    'Statue': 1,
    'Campfire': 4,
    'Ship': 3,
    'Townhall': 3,
    'Jousting': 3,
    'Forest': 0,
    'Noria': 2,
    'Winery': 2,
    'Vineyard': 1,
    'Storehouse': 3,
    'Bathhouse': 2,
    'Shipyard': 3,
    'Pigs': 3,
    'Papermill': 4,
    'Chapel': 3,
  };
  this.app.globals.basepoints = {
    'House': 2,
    'Tavern': 3,
    'Market': 2,
    'Church': 5,
    'Mine': 5,
    'Smelter': 5,
    'Blacksmith': 4,
    'Carpenter': 4,
    'Lumberjack': 2,
    'Hunting Cabin': 6,
    'Mill': 3,
    'Water Mill': 6,
    'Fishing Hut': 4,
    'Grain': 1,
    'Stable': 4,
    'Horses': 2,
    'Sheep': 2,
    'Castle': 15,
    'Tower': 10,
    'Road': 0,
    'Statue': 30,
    'Campfire': 10,
    'Ship': 30,
    'Townhall': 12,
    'Jousting': 8,
    'Forest': 0,
    'Noria': 2,
    'Winery': 6,
    'Vineyard': 2,
    'Storehouse': 3,
    'Bathhouse': 6,
    'Shipyard': 6,
    'Pigs': 2,
    'Papermill': 10,
    'Chapel': 8,
  };
  this.app.globals.needs = {
    'House': {
      'or': [
        'Road',
        'Market'
      ],
      'and': [],
      'on': [],
    },
    'Tavern': {
      'or': [
        'Road',
        'Market'
      ],
      'and': [],
      'on': [],
    },
    'Market': {
      'or': [
        'Road',
        'Castle',
        'Church',
        'Tower',
      ],
      'and': [],
      'on': [],
    },
    'Church': {
      'or': [
        'Market',
        'House'
      ],
      'and': [],
      'on': [],
    },
    'Mine': {
      'or': [],
      'and': [],
      'on': [
        'Grass Hill',
        'Stone Hill',
      ],
    },
    'Smelter': {
      'or': [
        'Road'
      ],
      'and': [],
      'on': [],
    },
    'Blacksmith': {
      'or': [
        'Road'
      ],
      'and': [],
      'on': [],
    },
    'Carpenter': {
      'or': [],
      'and': [],
      'on': [],
    },
    'Lumberjack': {
      'or': [
        'Forest'
      ],
      'and': [],
      'on': [],
    },
    'Hunting Cabin': {
      'or': [],
      'and': [],
      'on': [
        'Stone Hill',
        'Grass Hill',
      ],
    },
    'Mill': {
      'or': [
        'Road'
      ],
      'and': [],
      'on': [],
    },
    'Water Mill': {
      'or': [],
      'and': [
        'Road',
      ],
      'on': [
        'River'
      ],
    },
    'Papermill': {
      'or': [
        'River',
      ],
      'and': [],
      'on': [],
    },
    'Fishing Hut': {
      'or': [
        'Water'
      ],
      'and': [],
      'on': [],
    },
    'Grain': {
      'or': [
        'Grain',
        'Mill',
        'Water Mill',
      ],
      'and': [],
      'on': [],
    },
    'Stable': {
      'or': [
        'Road',
        'Market',
        'Castle'
      ],
      'and': [],
      'on': [],
    },
    'Horses': {
      'or': [
        'Stable',
        'Castle',
        'Storehouse',
        'Campfire',
        'Tavern'
      ],
      'and': [],
      'on': [],
    },
    'Sheep': {
      'or': [
        'Sheep',
        'Stable',
        'Water Mill'
      ],
      'and': [],
      'on': [],
    },
    'Castle': {
      'or': [
        'Road'
      ],
      'and': [],
      'on': [],
    },
    'Tower': {
      'or': [],
      'and': [],
      'on': [],
    },
    'Road': {
      'or': [
        'Road',
        'Market',
        'Hunting Cabin'
      ],
      'and': [],
      'on': [],
    },
    'Statue': {
      'or': [
        'Road',
      ],
      'and': [
        'Church',
        'House',
      ],
      'on': [],
    },
    'Campfire': {
      'or': [
        'Lumberjack',
        'House',
        'Hunting Cabin',
        'Carpenter',
      ],
      'and': [],
      'on': [],
    },
    'Ship': {
      'or': [],
      'and': [],
      'on': [
        'Water',
      ],
    },
    'Townhall': {
      'or': [
        'Road',
        'Market',
      ],
      'and': [],
      'on': [],
    },
    'Forest': {
      'or': [],
      'and': [],
      'on': [],
    },
    'Jousting': {
      'or': [
        'Castle',
        'Tavern',
        'Tower',
      ],
      'and': [],
      'on': [],
    },
    'Noria': {
      'or': [
        'House',
        'Road',
        'Horses',
      ],
      'and': [],
      'on': [],
    },
    'Winery': {
      'or': [
        'Road',
      ],
      'and': [],
      'on': [],
    },
    'Vineyard': {
      'or': [
        'Winery',
        'Noria',
        'Vineyard',
      ],
      'and': [],
      'on': [],
    },
    'Storehouse': {
      'or': [
        'Grain',
        'Vineyard',
      ],
      'and': [],
      'on': [],
    },
    'Bathhouse': {
      'or': [
        'Church',
        'Statue',
      ],
      'and': [],
      'on': [],
    },
    'Shipyard': {
      'or': [
        'Road',
      ],
      'and': [
        'Water',
      ],
      'on': [],
    },
    'Chapel': {
      'or': [
        'Road',
      ],
      'and': [],
      'on': [],
    },
    'Pigs': {
      'or': [
        'Grain',
        'Stable',
        'Mill',
      ],
      'and': [],
      'on': [],
    },
  };




  this.app.globals.packs = [
    {
      "title": "Housing",
      "minLevel": 0,
      "maxLevel": 5,
      "tiles": [
        [
          "House",
          3
        ],
        [
          "Road",
          1
        ]
      ]
    },
    {
      "title": "Town",
      "minLevel": 0,
      "maxLevel": 5,
      "tiles": [
        [
          "Tavern",
          1
        ],
        [
          "Market",
          1
        ],
        [
          "Road",
          1
        ]
      ]
    },
    {
      "title": "Lumberjack",
      "minLevel": 0,
      "maxLevel": 5,
      "tiles": [
        [
          "House",
          1
        ],
        [
          "Lumberjack",
          1
        ]
      ]
    },
    {
      "title": "Mill",
      "minLevel": 0,
      "maxLevel": 5,
      "tiles": [
        [
          "Mill",
          1
        ],
        [
          "Grain",
          2
        ],
        [
          "Road",
          2
        ]
      ]
    },
    {
      "title": "Stable",
      "minLevel": 0,
      "maxLevel": 5,
      "tiles": [
        [
          "Stable",
          1
        ],
        [
          "Sheep",
          2
        ],
        [
          "Road",
          2
        ]
      ]
    },
    {
      "title": "Church",
      "minLevel": 4,
      "maxLevel": 8,
      "tiles": [
        [
          "House",
          2
        ],
        [
          "Church",
          1
        ],
        [
          "Road",
          3
        ]
      ]
    },
    {
      "title": "Watermill",
      "minLevel": 4,
      "maxLevel": 8,
      "tiles": [
        [
          "House",
          1
        ],
        [
          "Water Mill",
          1
        ],
        [
          "Grain",
          1
        ],
        [
          "Sheep",
          1
        ],
        [
          "Road",
          3
        ]
      ]
    },
    {
      "title": "Mine",
      "minLevel": 5,
      "maxLevel": 8,
      "tiles": [
        [
          "House",
          1
        ],
        [
          "Mine",
          1
        ],
        [
          "Smelter",
          1
        ],
        [
          "Road",
          3
        ]
      ]
    },
    {
      "title": "Hunting",
      "minLevel": 5,
      "maxLevel": 8,
      "tiles": [
        [
          "Tavern",
          1
        ],
        [
          "Hunting Cabin",
          1
        ],
        [
          "Horses",
          1
        ],
        [
          "Tower",
          1
        ]
      ]
    },
    {
      "title": "Goods",
      "minLevel": 8,
      "maxLevel": 12,
      "tiles": [
        [
          "House",
          2
        ],
        [
          "Storehouse",
          1
        ],
        [
          "Pigs",
          1
        ],
        [
          "Road",
          2
        ]
      ]
    },
    {
      "title": "Castle",
      "minLevel": 8,
      "maxLevel": 12,
      "tiles": [
        [
          "Market",
          1
        ],
        [
          "Horses",
          1
        ],
        [
          "Castle",
          1
        ],
        [
          "Road",
          3
        ]
      ]
    },
    {
      "title": "Villlage",
      "minLevel": 5,
      "maxLevel": 0,
      "tiles": [
        [
          "House",
          4
        ],
        [
          "Tavern",
          1
        ],
        [
          "Market",
          1
        ],
        [
          "Road",
          4
        ],
        [
          "Townhall",
          1
        ]
      ]
    },
    {
      "title": "Forestry",
      "minLevel": 5,
      "maxLevel": 0,
      "tiles": [
        [
          "House",
          1
        ],
        [
          "Carpenter",
          1
        ],
        [
          "Lumberjack",
          2
        ],
        [
          "Fishing Hut",
          1
        ],
        [
          "Papermill",
          1
        ]
      ]
    },
    {
      "title": "Farming",
      "minLevel": 5,
      "maxLevel": 0,
      "tiles": [
        [
          "Mill",
          1
        ],
        [
          "Grain",
          4
        ],
        [
          "Noria",
          1
        ],
        [
          "Road",
          3
        ],
        [
          "Jousting",
          1
        ]
      ]
    },
    {
      "title": "Animals",
      "minLevel": 5,
      "maxLevel": 0,
      "tiles": [
        [
          "Hunting Cabin",
          1
        ],
        [
          "Stable",
          1
        ],
        [
          "Sheep",
          3
        ],
        [
          "Pigs",
          1
        ],
        [
          "Road",
          3
        ]
      ]
    },
    {
      "title": "Religion",
      "minLevel": 8,
      "maxLevel": 0,
      "tiles": [
        [
          "House",
          2
        ],
        [
          "Church",
          1
        ],
        [
          "Chapel",
          1
        ],
        [
          "Road",
          3
        ],
        [
          "Statue",
          1
        ]
      ]
    },
    {
      "title": "Mining",
      "minLevel": 8,
      "maxLevel": 0,
      "tiles": [
        [
          "House",
          2
        ],
        [
          "Mine",
          1
        ],
        [
          "Smelter",
          1
        ],
        [
          "Horses",
          1
        ],
        [
          "Road",
          3
        ]
      ]
    },
    {
      "title": "Expansion",
      "minLevel": 8,
      "maxLevel": 0,
      "tiles": [
        [
          "Water Mill",
          1
        ],
        [
          "Grain",
          2
        ],
        [
          "Sheep",
          2
        ],
        [
          "Storehouse",
          1
        ],
        [
          "Road",
          6
        ]
      ]
    },
    {
      "title": "Living",
      "minLevel": 8,
      "maxLevel": 0,
      "tiles": [
        [
          "House",
          3
        ],
        [
          "Tavern",
          1
        ],
        [
          "Market",
          1
        ],
        [
          "Bathhouse",
          1
        ],
        [
          "Campfire",
          1
        ]
      ]
    },
    {
      "title": "Industry",
      "minLevel": 12,
      "maxLevel": 0,
      "tiles": [
        [
          "Smelter",
          1
        ],
        [
          "Carpenter",
          1
        ],
        [
          "Shipyard",
          1
        ],
        [
          "Storehouse",
          1
        ],
        [
          "Road",
          4
        ]
      ]
    },
    {
      "title": "Hunting",
      "minLevel": 8,
      "maxLevel": 0,
      "tiles": [
        [
          "House",
          1
        ],
        [
          "Hunting Cabin",
          1
        ],
        [
          "Fishing Hut",
          1
        ],
        [
          "Horses",
          1
        ],
        [
          "Tower",
          1
        ]
      ]
    },
    {
      "title": "Defense",
      "minLevel": 12,
      "maxLevel": 0,
      "tiles": [
        [
          "Stable",
          1
        ],
        [
          "Horses",
          1
        ],
        [
          "Castle",
          1
        ],
        [
          "Tower",
          1
        ],
        [
          "Road",
          4
        ]
      ]
    },
    {
      "title": "Trading",
      "minLevel": 12,
      "maxLevel": 0,
      "tiles": [
        [
          "House",
          2
        ],
        [
          "Mill",
          1
        ],
        [
          "Grain",
          2
        ],
        [
          "Vineyard",
          2
        ],
        [
          "Pigs",
          1
        ]
      ]
    },
    {
      "title": "Luxury",
      "minLevel": 12,
      "maxLevel": 0,
      "tiles": [
        [
          "Mine",
          1
        ],
        [
          "Winery",
          1
        ],
        [
          "Vineyard",
          3
        ],
        [
          "Noria",
          1
        ],
        [
          "Bathhouse",
          1
        ]
      ]
    },
    {
      "title": "Travel",
      "minLevel": 12,
      "maxLevel": 0,
      "tiles": [
        [
          "House",
          2
        ],
        [
          "Tavern",
          1
        ],
        [
          "Chapel",
          1
        ],
        [
          "Road",
          8
        ],
        [
          "Ship",
          1
        ]
      ]
    },
    {
      "title": "Woodworks",
      "minLevel": 16,
      "maxLevel": 0,
      "tiles": [
        [
          "Lumberjack",
          2
        ],
        [
          "Water Mill",
          1
        ],
        [
          "Shipyard",
          1
        ],
        [
          "Winery",
          1
        ],
        [
          "Vineyard",
          2
        ]
      ]
    },
    {
      "title": "Capital",
      "minLevel": 16,
      "maxLevel": 0,
      "tiles": [
        [
          "House",
          4
        ],
        [
          "Church",
          1
        ],
        [
          "Castle",
          1
        ],
        [
          "Bathhouse",
          1
        ],
        [
          "Road",
          6
        ]
      ]
    }
  ];












  this.app.globals.extrapoints = {
    'House': {
      'House': 2,
      'Market': 4,
      'Church': 8,
      'Smelter': -2,
      'Horses': -2,
      'Castle': 4,
      'Tavern': 2,
      'Bathhouse': 4,
      'Statue': 8,
    },
    'Tavern': {
      'House': 2,
      'Market': 8,
      'Horses': 2,
      'Castle': 4,
      'Tavern': -10,
      'Pigs': 3,
    },
    'Market': {
      'House': 2,
      'Market': -6,
      'Tavern': 4,
      'Townhall': 4,
      'Church': 6,
      'Bathhouse': 4,
      'Storehouse': 2,
    },
    'Church': {
      'House': 4,
      'Tavern': -4,
      'Storehouse': -4,
      'Church': -15,
      'Townhall': 4,
      'Bathhouse': 4,
      //'Papermill': 6,
    },
    'Mine': {
      'Hunting Cabin': 4,
      'Stone Hill': 4,
      'Carpenter': 2,
      'Storehouse': 4,
      'Smelter': 3,
      'House': 2,
    },
    'Smelter': {
      'Stable': 4,
      'Mine': 8,
      'Castle': 6,
      'Lumberjack': 2,
      'Smelter': -10,
      'Carpenter': 6
    },
    'Carpenter': {
      'Carpenter': -30,
      'Castle': 10,
      'Lumberjack': 10,
      'Pigs': 2,
      'Campfire': 2,
      'Shipyard': 8,
    },
    'Lumberjack': {
      'Lumberjack': -10,
      'Tower': -6,
      'Forest': 2,
      'Campfire': 2,
      'Carpenter': 6,
      'Grass Hill': -4,
      'Stone Hill': -2,
    },
    'Hunting Cabin': {
      'Grass Hill': 3,
      'Stone Hill': 3,
      'Forest': 1,
      'River': 1,
      'Lumberjack': -3,
    },
    'Mill': {
      'Mill': -4,
      'Grain': 2,
      'Tower': 4,
      'Forest': -1,
      'Storehouse': 4
    },
    'Water Mill': {
      'Tavern': -6,
      'Water Mill': -20,
      'Tower': 10,
      'Water': 2,
      'River': 2,
      'Lumberjack': 2,
    },
    'Fishing Hut': {
      'Market': 4,
      'Water Mill': -4,
      'Fishing Hut': -8,
      'Horses': 2,
      'Tower': 4,
      'Water Rocks': 2,
    },
    'Grain': {
      'Mill': 8,
      'Water Mill': 8,
      'Grain': 3,
      'Tower': 2,
      'Water': 2,
      'River': 1,
      'Noria': 2,
      'Storehouse': 3,
    },
    'Stable': {
      'Stable': -12,
      'Castle': 6,
      'Tower': 4,
      'Horses': 4,
      'Sheep': 2,
      'Forest': -1,
    },
    'Horses': {
      'Market': -2,
      'Hunting Cabin': 4,
      'Tavern': 4,
      'Stable': 8,
      'Horses': -6,
      'Castle': 8,
      'Noria': 2,
      'Storehouse': 2,
      'Campfire': 4,
    },
    'Sheep': {
      'Smelter': -6,
      'Lumberjack': 2,
      'Hunting Cabin': 10,
      'Water Mill': 4,
      'Stable': 4,
      'Sheep': 2,
      'Tower': 10,
      'Grass Hill': 2,
      'Stone Hill': 2,
      'Storehouse': 2,
    },
    'Castle': {
      'Tavern': 10,
      'Carpenter': 10,
      'Stable': 10,
      'Smelter': 10,
      'House': 2,
      'Storehouse': 10,
      'Townhall': 20,
      'Church': -16,
      'Castle': -30,
    },
    'Tower': {
      'Horses': 2,
      'Grass Hill': 2,
      'Stone Hill': 2,
      'Castle': 10,
      'House': -2,
      'Tower': -20,
      'Fishing Hut': 4,
      'Lumberjack': 4,
      'Storehouse': 4,
      'Ship': 10,
    },
    'Road': {
    },
    'Statue': {
      'Bathhouse': 3,
    },
    'Campfire': {
      'Forest': 1,
      'Pigs': 12,
    },
    'Ship': {
      'House': 1,
      'Shipyard': 6,
    },
    'Townhall': {
      'House': 3,
      'Storehouse': 2,
      'Market': 4,
      //'Papermill': 4,
    },
    'Forest': {},
    'Jousting': {
      'Castle': 12,
      'Horses': 4,
      'Tavern': 4,
      'Stable': 12,
      'Jousting': -6,
      'Sheep': -6,
    },
    'Noria': {
      'Mill': 2,
      'Tower': 2,
      'Horses': 2,
      'Water': -3,
      'Pigs': -3,
      'Sheep': -3,
      'Winery': 4,
      'Vineyard': 4,
      'Grain': 2,
    },
    'Winery': {
      'Water Mill': 4,
      'Vineyard': 4,
      'Market': 2,
      'Tavern': 6,
      'Noria': 2,
      'Storehouse': 6,
      'Carpenter': 6,
      'Mine': -6,
      'Smelter': -6,
    },
    'Vineyard': {
      'Vineyard': 7,
      'Winery': 7,
      'Noria': 3,
      'Mine': -4,
      'Smelter': -4,
      'Water': -2,
      'Forest': -2,
      'Storehouse': 2,
    },
    'Storehouse': {
      'Road': 1,
      'Townhall': 10,
      'Mill': 5,
      'Water Mill': 5,
      'Winery': 5,
      'Tavern': -4,
      'Castle': -4,
    },
    'Bathhouse': {
      'Market': 2,
      'Townhall': 3,
      'Church': 3,
      'House': 2,
      'Mill': -4,
      'Castle': -4,
      'Stables': -4,
      'Pigs': -6,
    },
    'Pigs': {
      'Storehouse': 1,
      'Mill': 5,
      'Stable': 5,
      'Smelter': 1,
      'Grain': 1,
      'River': -2,
      'House': -2,
      'Bathhouse': -10,
    },
    'Shipyard': {
      'Carpenter': 5,
      'Smelter': 5,
      'Castle': 5,
      'Water': 1,
      'Ship': 8,
      'Water Rocks': -4,
      'Campfire': -3,
      'Tower': -3,
    },
    /*'Papermill': {
      'Church': 6,
      'Townhall': 6,
      'Forest': 1,
      'Lumberjack': 4,
      'Grain': -1,
      'Campfire': -6,
      'Sheep': -1,
    },*/
    'Chapel': {
      'House': -8,
      'Tavern': -8,
      'Market': -8,
      'Townhall': -8,
      'Sheep': 3,
      'Grass Hill': 2,
      'Stone Hill': 2,
    },
  };
};
