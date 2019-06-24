import {
    Api
} from './menu.js'
import {
    renderRoot
} from './menu-view.js'

export let saveMenu = (ROOT) => {
    console.log("Saving menu ...", ROOT);
    Api.saveMenu(ROOT, (success, data) => {
        console.log(data);
        renderRoot(ROOT)
    });
}
export let exportMenu = () => {
    console.log('Export')
    var form = document.createElement("form");
    form.method = "GET";
    form.action = "/mbuilder/export_menu";
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
export let getSn = () => {
    idTracker.id = idTracker.id + 1;
    return idTracker.id;
}
export let setSn = (id) => {
    idTracker.id = id;
}