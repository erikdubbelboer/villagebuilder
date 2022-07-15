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
    'Campfire': 5,
    'Ship': 3,
    'Townhall': 3,
    'Forest': 0,
  };
  this.app.globals.firstpoints = {
    // Should be empty.
  };
  this.app.globals.basepoints = {
    'House': 2,
    'Mill': 2,
    'Stable': 4,
    'Fishing Hut': 10,
    'Statue': 15,
    'Ship': 15,
  };
  this.app.globals.needs = {
    'House': {
      'or': [
        'Road',
        'Market'
      ],
      'and': [],
      'on': []
    },
    'Tavern': {
      'or': [
        'Road',
        'Market'
      ],
      'and': [],
      'on': []
    },
    'Market': {
      'or': [
        'Road',
        'Castle',
        'Church',
        'Tower',
      ],
      'and': [],
      'on': []
    },
    'Church': {
      'or': [
        'Market',
        'House'
      ],
      'and': [],
      'on': []
    },
    'Mine': {
      'or': [],
      'and': [],
      'on': [
        'Grass Hill',
        'Stone Hill',
      ]
    },
    'Smelter': {
      'or': [
        'Road'
      ],
      'and': [],
      'on': []
    },
    'Blacksmith': {
      'or': [
        'Road'
      ],
      'and': [],
      'on': []
    },
    'Carpenter': {
      'or': [],
      'and': [],
      'on': []
    },
    'Lumberjack': {
      'or': [
        'Forest'
      ],
      'and': [],
      'on': []
    },
    'Hunting Cabin': {
      'or': [],
      'and': [],
      'on': [
        'Stone Hill',
        'Grass Hill',
      ]
    },
    'Mill': {
      'or': [
        'Road'
      ],
      'and': [],
      'on': []
    },
    'Water Mill': {
      'or': [
        'Road'
      ],
      'and': [
        'River'
      ],
      'on': []
    },
    'Fishing Hut': {
      'or': [
        'Water'
      ],
      'and': [],
      'on': []
    },
    'Grain': {
      'or': [
        'Grain',
        'Mill'
      ],
      'and': [],
      'on': []
    },
    'Stable': {
      'or': [
        'Road',
        'Market',
        'Castle'
      ],
      'and': [],
      'on': []
    },
    'Horses': {
      'or': [
        'Stable',
        'Castle',
        'Tavern'
      ],
      'and': [],
      'on': []
    },
    'Sheep': {
      'or': [
        'Sheep',
        'Stable',
        'Water Mill'
      ],
      'and': [],
      'on': []
    },
    'Castle': {
      'or': [
        'Road'
      ],
      'and': [],
      'on': []
    },
    'Tower': {
      'or': [],
      'and': [],
      'on': []
    },
    'Road': {
      'or': [
        'Road',
        'Market',
        'Hunting Cabin'
      ],
      'and': [],
      'on': []
    },
    'Statue': {
      'or': [
        'Road',
      ],
      'and': [
        'Church',
        'House',
      ],
      'on': []
    },
    'Campfire': {
      'or': [
        'Lumberjack',
        'House',
        'Hunting Cabin',
        'Carpenter',
      ],
      'and': [],
      'on': []
    },
    'Ship': {
      'or': [],
      'and': [],
      'on': [
        'Water',
      ]
    },
    'Townhall': {
      'or': [
        'Road',
        'Market',
      ],
      'and': [],
      'on': []
    },
    'Forest': {
      'or': [],
      'and': [],
      'on': []
    },
  };
  this.app.globals.packs = [
    {
      'title': 'Lumber',
      'tier': -1,
      'tiles': [
        [
          'Lumberjack',
          2
        ]
      ]
    },
    {
      'title': 'Village',
      'tier': -1,
      'tiles': [
        [
          'House',
          3
        ],
        [
          'Road',
          4
        ]
      ]
    },
    {
      'title': 'Town',
      'tier': -1,
      'tiles': [
        [
          'House',
          1
        ],
        [
          'Market',
          1
        ],
        [
          'Tavern',
          1
        ],
      ]
    },
    {
      'title': 'Forestry',
      'tier': 0,
      'unlock': 'Lumberjack',
      'tiles': [
        [
          'Lumberjack',
          2
        ],
        [
          'Carpenter',
          1
        ],
        [
          'House',
          1
        ],
        [
          'Road',
          3
        ]
      ]
    },
    {
      'title': 'Living',
      'tier': 0,
      'unlock': 'Tavern',
      'tiles': [
        [
          'House',
          4
        ],
        [
          'Market',
          1
        ],
        [
          'Tavern',
          1
        ],
        [
          'Road',
          4
        ]
      ]
    },
    {
      'title': 'Religion',
      'tier': 1,
      'unlock': 'Church',
      'tiles': [
        [
          'House',
          1
        ],
        [
          'Church',
          1
        ],
        [
          'Road',
          2
        ]
      ]
    },
    {
      'title': 'Animals',
      'tier': 2,
      'unlock': 'Stable',
      'tiles': [
        [
          'Stable',
          1
        ],
        [
          'Horses',
          1
        ],
        [
          'Sheep',
          3
        ]
      ]
    },
    {
      'title': 'Farming',
      'tier': 3,
      'unlock': 'Mill',
      'tiles': [
        [
          'Mill',
          1
        ],
        [
          'Grain',
          4
        ],
        [
          'Road',
          2
        ]
      ]
    },
    {
      'title': 'Economy',
      'tier': 3,
      'tiles': [
        [
          'House',
          1
        ],
        [
          'Tavern',
          1
        ],
        [
          'Market',
          1
        ],
        [
          'Carpenter',
          1
        ],
        [
          'Road',
          3
        ]
      ]
    },
    {
      'title': 'Hunting',
      'tier': 4,
      'unlock': 'Hunting Cabin',
      'tiles': [
        [
          'Hunting Cabin',
          1
        ],
        [
          'Horses',
          2
        ],
        [
          'Lumberjack',
          1
        ],
      ]
    },
    {
      'title': 'Fishing',
      'tier': 4,
      'unlock': 'Fishing Hut',
      'tiles': [
        [
          'Fishing Hut',
          1
        ],
        [
          'House',
          2
        ],
        [
          'Sheep',
          2
        ],
        [
          'Road',
          3
        ]
      ]
    },
    {
      'title': 'Mining',
      'tier': 4,
      'unlock': 'Mine',
      'tiles': [
        [
          'Mine',
          1
        ],
        [
          'Smelter',
          1
        ],
        [
          'House',
          1
        ],
        [
          'Stable',
          1
        ],
        [
          'Road',
          3
        ]
      ]
    },
    {
      'title': 'Water Mill',
      'tier': 5,
      'unlock': 'Water Mill',
      'tiles': [
        [
          'Water Mill',
          1
        ],
        [
          'Grain',
          2
        ],
        [
          'Sheep',
          1
        ],
        [
          'Road',
          3
        ]
      ]
    },
    {
      'title': 'Smelter',
      'tier': 5,
      'unlock': 'Smelter',
      'tiles': [
        [
          'Smelter',
          1
        ],
        [
          'Lumberjack',
          1
        ],
        [
          'Water Mill',
          1
        ],
        [
          'Horses',
          1
        ],
        [
          'Road',
          2
        ]
      ]
    },
    {
      'title': 'Travel',
      'tier': 5,
      'tiles': [
        [
          'House',
          1
        ],
        [
          'Market',
          1
        ],
        [
          'Horses',
          1
        ],
        [
          'Road',
          10
        ]
      ]
    },
    {
      'title': 'Expansion',
      'tier': 6,
      'tiles': [
        [
          'Church',
          1
        ],
        [
          'Tower',
          1
        ],
        [
          'Road',
          3
        ]
      ]
    },
    {
      'title': 'Defense',
      'tier': 6,
      'unlock': 'Tower',
      'tiles': [
        [
          'House',
          1
        ],
        [
          'Tower',
          1
        ],
        [
          'Horses',
          1
        ],
        [
          'Road',
          4
        ]
      ]
    },
    {
      'title': 'Castle',
      'tier': 7,
      'unlock': 'Castle',
      'tiles': [
        [
          'Mine',
          1
        ],
        [
          'Castle',
          1
        ],
        [
          'Road',
          4
        ]
      ]
    },
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
    },
    'Tavern': {
      'House': 2,
      'Market': 8,
      'Horses': 2,
      'Castle': 4,
      'Tavern': -10
    },
    'Market': {
      'House': 2,
      'Market': -2,
      'Lumberjack': -4,
      'Mill': 4,
      'Water Mill': 6,
      'Fishing Hut': 6,
      'Stable': 4,
      'Horses': -4
    },
    'Church': {
      'House': 4,
      'Tavern': -6,
      'Market': -4,
      'Church': -20
    },
    'Mine': {
      'Hunting Cabin': 4,
      'Stone Hill': 4,
      'Carpenter': 2,
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
      'Lumberjack': 10
    },
    'Lumberjack': {
      'Lumberjack': -10,
      'Tower': -6,
      'Forest': 2,
      'Carpenter': 6,
      'Grass Hill': -4,
      'Stone Hill': -2
    },
    'Hunting Cabin': {
      'Grass Hill': 2,
      'Stone Hill': 2,
      'Forest': 1,
      'River': 1
    },
    'Mill': {
      'Mill': -8,
      'Grain': 2,
      'Tower': 4,
      'Forest': -1,
    },
    'Water Mill': {
      'Tavern': -6,
      'Water Mill': -20,
      'Tower': 10,
      'Water': 2,
      'River': 2
    },
    'Fishing Hut': {
      'Market': 4,
      'Water Mill': -4,
      'Fishing Hut': -10,
      'Horses': 2,
      'Tower': 4,
      'Water Rocks': 2
    },
    'Grain': {
      'Mill': 8,
      'Water Mill': 4,
      'Grain': 3,
      'Tower': 2,
      'Water': 2,
      'River': 1
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
      'Market': -8,
      'Hunting Cabin': 4,
      'Stable': 8,
      'Horses': -2,
      'Castle': 8,
      'Forest': 1
    },
    'Sheep': {
      'Smelter': -6,
      'Lumberjack': 2,
      'Hunting Cabin': 10,
      'Water Mill': 10,
      'Stable': 4,
      'Sheep': 2,
      'Tower': 10,
      'Grass Hill': 2,
      'Stone Hill': 2,
      'River': 1
    },
    'Castle': {
      'Tavern': 10,
      'Carpenter': 10,
      'Stable': 10,
      'Water Mill': 20,
      'Market': -4,
      'Church': -20,
      'Lumberjack': -4,
      'Mill': -4,
      'Castle': -40
    },
    'Tower': {
      'Horses': 2,
      'Grass Hill': 2,
      'Stone Hill': 2,
      'Castle': 10,
      'House': -2,
      'Tower': -20,
      'Fishing Hut': 5,
      'Lumberjack': 4,
    },
    'Road': {
    },
    'Statue': {
    },
    'Campfire': {
      'Forest': 1,
    },
    'Ship': {
      'House': 1,
    },
    'Townhall': {
      'House': 3,
    },
    'Forest': {},
  };
};
