// Village Builder (c) by Erik Dubbelboer and Rens Gehling
// 
// Village Builder is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <https://creativecommons.org/licenses/by-nc-sa/4.0/>.

pc.script.createLoadingScreen(function (app) {
    const showSplash = function () {
        // splash wrapper
        const wrapper = document.createElement('div');
        wrapper.setAttribute('id', 'application-splash-wrapper');
        document.body.appendChild(wrapper);

        // splash
        const splash = document.createElement('div');
        splash.setAttribute('id', 'application-splash');
        wrapper.appendChild(splash);
        splash.style.display = 'block';

        const container = document.createElement('div');
        container.setAttribute('id', 'progress-bar-container');
        splash.appendChild(container);

        const bar = document.createElement('div');
        bar.setAttribute('id', 'progress-bar');
        container.appendChild(bar);

        // Wait for all assets to be added before we can get the URL
        app.once('preload:start', function () {
            const logo = document.createElement('img');
            logo.setAttribute('src', app.assets.find('logo.png', 'texture').getFileUrl());
            splash.insertBefore(logo, container);
        });
    };

    const hideSplash = function () {
        const splash = document.getElementById('application-splash-wrapper');
        if (splash) {
            splash.remove();
        }
    };

    const setProgress = function (value) {
        const bar = document.getElementById('progress-bar');
        if (bar) {
            value = Math.min(1, Math.max(0, value));
            bar.style.width = value * 100 + '%';
        }
    };

    const createCss = function () {
        let css = [
            'body {',
            '    background-color: #283538;',
            '}',
            '',
            'a {',
            '    color: blue;',
            '}',
            '',
            '#application-splash-wrapper {',
            '    position: absolute;',
            '    top: 0;',
            '    left: 0;',
            '    height: 100%;',
            '    width: 100%;',
            '    background-color: #283538;',
            '}',
            '',
            '#application-splash {',
            '    position: absolute;',
            '    top: calc(50% - 28px);',
            '    width: 264px;',
            '    left: calc(50% - 132px);',
            '}',
            '',
            '#application-splash img {',
            '    width: 100%;',
            '}',
            '',
            '#progress-bar-container {',
            '    margin: 20px auto 0 auto;',
            '    height: 2px;',
            '    width: 100%;',
            '    background-color: #1d292c;',
            '}',
            '',
            '#progress-bar {',
            '    width: 0%;',
            '    height: 100%;',
            '    background-color: #f60;',
            '}',
            '',
            '@media (max-width: 480px) {',
            '    #application-splash {',
            '        width: 170px;',
            '        left: calc(50% - 85px);',
            '    }',
            '}',
            'canvas{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;outline:0;-webkit-tap-highlight-color:rgba(255,255,255,0)}' +
            'body{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;outline:0}',
            ':root { --notch-left: env(safe-area-inset-left); }',
        ].join('\n');

        const style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        document.head.appendChild(style);
    };

    if (window.PokiSDK) {
        PokiSDK.init();
        PokiSDK.gameLoadingStart();
        try {
            setTimeout(() => {
                navigator.sendBeacon('https://leveldata.poki.io/data', '94176748-9ef8-42c9-a44e-a95b70ec5680');
            }, Math.random() * 2000);
        } catch (ignore) { }
    }

    createCss();
    showSplash();

    app.on('preload:end', function () {
        if (window.PokiSDK) {
            PokiSDK.gameLoadingFinished();
        }
        app.off('preload:progress');
    });
    app.on('preload:progress', setProgress);
    app.on('start', hideSplash);

    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        const resize = () => {
            window.scrollTo(0, 0);
            const canvas = document.getElementsByTagName('canvas');
            if (canvas.length > 0) {
                canvas[0].style.width = window.innerWidth + 'px';
                canvas[0].style.height = window.innerHeight + 'px';
            }
        };
        window.addEventListener('resize', resize);
        resize();
        setTimeout(() => {
            resize();
        }, 3000);
    }
});
