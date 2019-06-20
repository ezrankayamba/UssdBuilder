import {
    Api
} from './menu.js'
import {
    renderRoot
} from './menu-view.js'

let saveMenu = (ROOT) => {
    console.log("Saving menu ...", ROOT);
    Api.saveMenu(ROOT, (success, data) => {
        console.log(data);
        renderRoot(ROOT)
    });
}
let exportMenu = () => {
    console.log('Export')
    var form = document.createElement("form");
    form.method = "GET";
    form.action = "/export_menu";
    var tm = document.createElement("input");
    tm.value = Date.now();
    tm.name = "tm";
    form.appendChild(tm);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form)
}
const idTracker = {
    id: 0
}
let getSn = () => {
    idTracker.id = idTracker.id + 1;
    return idTracker.id;
}
let setSn = (id) => {
    idTracker.id = id;
}

export {
    saveMenu,
    exportMenu,
    getSn,
    setSn
}