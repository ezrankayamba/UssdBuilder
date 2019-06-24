import * as El from './elements.js'
import * as menuUtils from './menu-utils.js';
import {
    menuTypes
} from './menu-types.js'
import {
    Menu
} from './menu.js'
let ROOT = null
let menuStack = []
let selectedId = 0
let langValue = 'eng'
let addNewMenu = (menu) => {
    let orderNos = menu.menus.map((m) => m.orderNo)
    orderNos = orderNos.filter((n) => n > 0)

    let newMenu = new Menu()
    newMenu.id = menuUtils.getSn()
    newMenu.name = 'New menu'
    let len = orderNos.length
    newMenu.orderNo = len ? parseInt(orderNos[len - 1]) + 1 : 1
    menu.menus.push(newMenu)
    editMenu(newMenu, menu)
}

export let setRoot = (root) => {
    ROOT = root
}
let deleteFrom = (menu) => {
    let m = menu.menus.filter(m => m.id === selectedId)[0]
    let orderNo = parseInt(m.orderNo)
    console.log('Deleted: ', orderNo)
    menu.menus = menu.menus.filter(m => m.id !== selectedId)
    if (orderNo) {
        menu.menus.forEach((m1) => {
            console.log(`Order No: ${m1.orderNo}, The Ornder No: ${orderNo}`)
            if (parseInt(m1.orderNo) > orderNo) {
                m1.orderNo = orderNo
                orderNo += 1
            }
        })
    }
    renderRoot(menu)
}
let toolbarBtn = (cls, cb, tooltip) => {
    let btn = El.crEl('button', `btn ${cls}`)
    btn.innerHTML = `<img src="static/mbuilder/img/${cls}_icon_256.png"/>`
    btn.title = tooltip
    btn.addEventListener('click', cb)
    return btn
}
let settingsBtn = (cls, cb, tooltip) => {
    return toolbarBtn(cls, cb, tooltip)
}
let switchLang = (e, menu) => {
    langValue = e.target.checked ? 'eng' : 'swa'
    renderRoot(menu)
}
/* Render menu from root of a specific menu or from ROOT */
export let renderRoot = (otherMenu) => {
    let menu = otherMenu || ROOT
    let editor = El.emptyElementById('editor')
    let menuLabel = El.crEl('div', 'menu-label')
    let theLabel = El.crEl('label')
    theLabel.textContent = menu.name;

    let lang = El.crEl('div')
    lang.id = 'switch-wrap'
    let check = El.crEl('input')
    check.type = 'checkbox'
    check.id = 'lang'
    check.checked = langValue === 'eng'
    check.addEventListener('change', (e) => switchLang(e, menu))
    let langLabel = El.crEl('label')
    langLabel.setAttribute('for', 'lang')
    langLabel.addEls([El.crEl('span', 'text'), El.crEl('span', 'switch')])
    lang.addEls([check, langLabel])
    menuLabel.addEls([theLabel, lang])
    editor.appendChild(menuLabel)

    let topbar = El.crEl('div', 'topbar')
    let btnBack = toolbarBtn('back', () => renderRoot(menuStack.pop()))
    btnBack.disabled = menuStack.length === 0
    let btnAdd = toolbarBtn('add', () => addNewMenu(menu), 'Add new menu')
    let btnDel = toolbarBtn('delete', () => deleteFrom(menu), 'Delete selected menu')
    btnDel.disabled = !selectedId
    let btnSave = toolbarBtn('save', () => menuUtils.saveMenu(ROOT), 'Save all changes')
    let btnExport = toolbarBtn('export', () => menuUtils.exportMenu(), 'Export entire menu')
    topbar.addEls([btnBack, btnAdd, btnDel, btnSave, btnExport])
    editor.appendChild(topbar)
    renderMenu(menu)
};
export let renderMenu = (menu) => {
    menu = sortMenus(menu)
    let editor = document.getElementById('editor')
    if (menu.menus.length) {
        let chars = 0;
        menu.menus.forEach((m) => {
            let arrowWrapper = El.crEl('span', 'arrow')
            arrowWrapper.appendChild(El.crEl('i', 'right'))
            arrowWrapper.addEventListener('click', () => nextMenu(m, menu))
            let line = El.crEl('div', 'option');
            let text = El.crEl('span', 'text')
            text.addEventListener('dblclick', () => dblClickHandler(m, menu))
            text.addEventListener('click', () => clickHandler(m, menu))
            text.textContent = `${m[langValue]}`
            chars += text.textContent.length;
            if (menu.type === 'TEXT') {
                line.addEls([text, arrowWrapper])
                editor.appendChild(line)
            } else if (m.type === 'MESSAGE' || m.type === 'SMS') {
                arrowWrapper.style.display = m.type === 'SMS' ? 'none' : 'inline-block'
                line.addEls([text, arrowWrapper])
                editor.appendChild(line)
            } else {
                let num = El.crEl('span', 'num')
                num.textContent = `${m.orderNo}. `;
                chars += m.orderNo === 0 ? 0 : num.textContent.length;
                line.addEls(m.orderNo > 0 ? [settings(m, menu), num, text, arrowWrapper] : [text])
                editor.appendChild(line)
                line.className = selectedId === m.id ? 'option active' : 'option'
            }
        })
        let totalChars = El.crEl('div', 'total' + ((chars > 155 && menu.type !== 'MESSAGE') ? ' exceed' : ''))
        totalChars.addEls([El.crEl('span', 'dummy'), El.crEl('span', 'label', 'No. of characters'), El.crEl('span', 'number', `${chars}`)])
        editor.appendChild(totalChars)
    } else {
        let line = El.crEl('div', 'option');
        line.textContent = 'No menu options yet, kindly add!'
        editor.appendChild(line)
    }
};

export let editMenu = (menu, parent) => {
    let form = El.emptyElementById('overlay')
    form.style.display = 'block';
    let wrap = El.crEl('div', 'form-wrap')
    let hd = El.crEl('h3')
    hd.textContent = `Edit Menu - ${menu.name}`
    let temp = {};
    let type = El.crInput('select', 'Type', (e) => temp.type = e.target.value, menu.type, menuTypes())
    let name = El.crInput('text', 'Name', (e) => temp.name = e.target.value, menu.name)
    let testValue = El.crInput('text', 'Test Value', (e) => temp.testValue = e.target.value, menu.testValue)
    testValue.style.display = (parent && parent.type === 'TEXT') ? 'block' : 'none'
    let textEng = El.crInput('textarea', 'Text ENG', (e) => temp.eng = e.target.value, menu.eng)
    let textSwa = El.crInput('textarea', 'Text SWA', (e) => temp.swa = e.target.value, menu.swa)
    wrap.addEls([hd, type, name, textEng, textSwa, testValue, formControls(parent, form, menu, temp)])
    form.appendChild(wrap)
    form.addEventListener('click', () => {
        if (event.target.closest('.form-wrap')) return;
        form.style.display = 'none';
    })
}
let formControls = (parent, form, menu, temp) => El.crContrs([{
    label: 'Make As Top Label',
    cls: 'make-label',
    cb: () => {
        form.style.display = 'none';
        menu.orderNo = 0
        renderRoot(parent)
    }
}, {
    label: 'Cancel',
    cls: 'cancel',
    cb: () => {
        form.style.display = 'none';
        renderRoot(parent)
    }
}, {
    label: 'Save',
    cls: 'primary',
    cb: () => {
        form.style.display = 'none';
        for (var attr in temp) {
            if (temp.hasOwnProperty(attr)) menu[attr] = temp[attr];
        }
        renderRoot(parent)
    }
}])

let sortMenus = (menu) => {
    menu.menus = menu.menus.sort((m1, m2) => {
        return m1.orderNo - m2.orderNo;
    });
    return menu
}
let clickHandler = (m, menu) => {
    selectedId = m.id;
    renderRoot(menu)
}
let dblClickHandler = (m, menu) => {
    selectedId = m.id;
    editMenu(m, menu)
}
let nextMenu = (m, menu) => {
    menuStack.push(menu)
    selectedId = 0
    renderRoot(m)
}
let settings = (m, menu) => {
    let orderNos = menu.menus.map((m) => m.orderNo)
    orderNos = orderNos.filter((n) => n > 0)
    let order = {}
    order.isFirst = m.orderNo === orderNos[0]
    order.isLast = m.orderNo === orderNos[orderNos.length - 1]

    let wrap = El.crEl('div', 'settings')
    let orderNo = parseInt(m.orderNo)
    let up = settingsBtn('arrow_up', () => {
        menu.menus.forEach(m1 => {
            if (parseInt(m1.orderNo) === orderNo - 1) {
                m1.orderNo = orderNo
                m.orderNo = orderNo - 1
            }
        })
        renderRoot(menu)
    }, 'Move up')
    up.disabled = order.isFirst
    let stngs = settingsBtn('settings', () => {
        console.log('Settings')
        editMenu(m, menu)
    }, 'Menu settings')
    let down = settingsBtn('arrow_down', () => {
        menu.menus.forEach(m1 => {
            if (parseInt(m1.orderNo) === orderNo + 1) { //higher menu
                m1.orderNo = orderNo
                m.orderNo = orderNo + 1
            }
        })
        renderRoot(menu)
    }, 'Move down')
    down.disabled = order.isLast
    wrap.addEls([up, stngs, down])
    return wrap;
}