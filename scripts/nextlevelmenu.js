const NextLevelMenu = pc.createScript('nextlevelmenu');

NextLevelMenu.prototype.initialize = function () {
    this.app.keyboard.on(pc.EVENT_KEYUP, event => {
        if (event.key === pc.KEY_ESCAPE) {
            this.app.playSound('menu');

            this.entity.enabled = false;
        }
    });

    this.app.root.findByName('NextLevelMenuBlur').button.on('click', () => {
        this.entity.enabled = false;

        this.app.playSound('menu');
    }, this);

    const nextLevelContinueButton = this.app.root.findByName('NextLevelContinueButton');

    nextLevelContinueButton.button.on('click', () => {
        this.entity.enabled = false;

        this.app.playSound('menu');
    }, this);

    this.on('enable', this.onEnable, this);
    this.onEnable();

    this.on('disable', () => {
        this.app.menuOpen--;

        this.app.fire('game:enablecamera');

        if (this.app.menuOpen === 0) {
            this.app.gameplayStart();
        }
    });
};

NextLevelMenu.prototype.onEnable = function () {
    this.app.menuOpen++;

    this.app.playSound('completed');

    this.app.fire('game:disablecamera');
    this.app.fire('game:clearhelp');

    this.app.gameplayStop();

    const nextLevelUnlock1 = this.app.root.findByName('NextLevelUnlock1');
    const nextLevelUnlock2 = this.app.root.findByName('NextLevelUnlock2');

    if (!this.app.nextUnlock1 && !this.app.nextUnlock1) {
        nextLevelUnlock1.parent.parent.enabled = false;
    } else {
        nextLevelUnlock1.parent.parent.enabled = true;

        nextLevelUnlock1.script.rewardimage.tile = this.app.nextUnlock1;

        if (!this.app.nextUnlock2) {
            nextLevelUnlock2.enabled = false;
        } else {
            nextLevelUnlock2.enabled = true;
            nextLevelUnlock2.script.rewardimage.tile = this.app.nextUnlock2;
        }
    }

    this.app.root.findByName('NextLevelNumber').element.text = this.app.pointsTier;

    const nextLevelPercentage = this.app.root.findByName('NextLevelPercentage');
    nextLevelPercentage.parent.enabled = false;

    fetch('https://vb.dubbelboer.com/level', {
        mode: 'cors',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            level: this.app.pointsTier,
            name: this.app.levelName,
            seed: this.app.levelState.levelSeed,
        }),
    }).then(response => response.json()
    ).then(data => {
        if (!this.entity.enabled) {
            return;
        }

        const percentage = data.percentage;

        this.app.root.findByName('NextLevelOnly').enabled = percentage < 50;
        nextLevelPercentage.element.text = percentage + '%';

        nextLevelPercentage.parent.enabled = true;
    }).catch(err => {
        console.log(err);
    });
};
