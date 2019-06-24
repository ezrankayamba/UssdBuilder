import * as menuUtils from './modules/menu-utils.js';
import {
    Menu,
    Api
} from './modules/menu.js';
import * as MV from './modules/menu-view.js';

let ROOT = null;

let ready = (success, data) => {
    ROOT = data.name ? data : new Menu();
    console.log('Ready')
    let max = 0;
    let recur = (menu, lvl) => {
        if (menu.menus.length) {
            menu.menus.forEach(m => {
                max = max <= m.id ? m.id : max;
                recur(m, lvl + 1)
            })
        }
    }
    recur(ROOT, 0)
    menuUtils.setSn(max)
    MV.setRoot(ROOT)
    MV.renderRoot()
};
let cssId = 'mbuilder'; // you could encode the css path itself to generate id..
if (!document.getElementById(cssId)) {
    let head = document.getElementsByTagName('head')[0];
    let link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = '/static/mbuilder/css/style.css';
    link.media = 'all';
    head.appendChild(link);
}

export let refreshApp = () => {
    Api.fetchMenu(ready);
}

export let getTabId = () => {
    return 'menu-builder'
}

(function (refreshApp) {
    console.log('Menu Builder App is running');
    refreshApp()
})(refreshApp);