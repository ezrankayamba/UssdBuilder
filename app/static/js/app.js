import * as menuUtils from './modules/menu-utils.js';
import {
    Menu,
    Api
} from './modules/menu.js';
import * as MV from './modules/menu-view.js';
(function (menuUtils, Menu, Api, MV) {
    console.log('App is running');
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
        console.log(ROOT)
        menuUtils.setSn(max)
        MV.setRoot(ROOT)
        MV.renderRoot()
    };
    Api.fetchMenu(ready);
})(menuUtils, Menu, Api, MV);