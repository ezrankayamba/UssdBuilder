(function () {
    console.log('App is running');
    let ROOT = null;
    const menuTypes = [{
        name: "USSDCODE",
        label: "Ussd Code"
    }, {
        name: "OPTIONS",
        label: "Menu Otions"
    }, {
        name: "TEXT",
        label: "Text Input"
    }, {
        name: "MESSAGE",
        label: "Text Message"
    }];
    const idTracker = {
        id: 0
    }
    let getSn = () => {
        idTracker.id = idTracker.id + 1;
        return idTracker.id;
    }
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
        idTracker.id = max;
        renderRoot()
    };
    let crEl = (type, cls, text) => {
        let el = document.createElement(type);
        if (cls) {
            el.className = cls
        }
        if (text) {
            el.textContent = text
        }

        return el;
    }

    let menuStack = []
    let selectedId = 0
    let renderRoot = (otherMenu) => {
        let menu = otherMenu || ROOT
        let editor = emptyElementById('editor')
        let topbar = crEl('div', 'topbar')
        let btnBack = crEl('button', 'btn-back arrow')
        btnBack.innerHTML = `<i class="left"></i> Back`
        if (menuStack.length == 0) {
            btnBack.setAttribute('disabled', 'true')
        }
        btnBack.addEventListener('click', () => {
            let prev = menuStack.pop()
            renderRoot(prev)
        })
        let label = crEl('label', 'label')
        label.textContent = menu.name
        label.setAttribute('contentEditable', true)
        label.addEventListener('keyup', (e) => {
            menu.name = label.textContent
        })
        let btnAdd = crEl('button', 'btn-add')
        btnAdd.addEventListener('click', () => {
            let newMenu = new Menu()
            newMenu.id = getSn()
            newMenu.name = 'Untitled'
            menu.menus.push(newMenu)
            editMenu(newMenu, menu)
        })
        btnAdd.textContent = "Add"
        let lang = crEl('div')
        lang.id = 'switch-wrap'
        let check = crEl('input')
        check.type = 'checkbox'
        check.id = 'lang'
        check.checked = true
        lang.appendChild(check)
        let langLabel = crEl('label')
        langLabel.setAttribute('for', 'lang')
        let span1 = crEl('span', 'text')
        let span2 = crEl('span', 'switch')
        langLabel.appendChild(span1)
        langLabel.appendChild(span2)
        lang.appendChild(langLabel)

        topbar.appendChild(btnBack)
        topbar.appendChild(label)
        topbar.appendChild(lang)
        topbar.appendChild(btnAdd)
        editor.appendChild(topbar)
        renderMenu(menu)
    };
    let editMenu = (menu, parent) => {
        let form = document.getElementById('overlay')
        form.style.display = 'block';
        let wrap = crEl('div', 'form-wrap')
        let hd = crEl('h3')
        hd.textContent = 'Edit Menu'
        wrap.appendChild(hd)
        let temp = {};
        let type = crInput('select', 'Type', (e) => {
            temp.type = e.target.value;
            console.log(temp)
        }, menu.type, menuTypes)
        wrap.appendChild(type)
        let name = crInput('text', 'Name', (e) => {
            temp.name = e.target.value;
        }, menu.name)
        wrap.appendChild(name)
        let textEng = crInput('textarea', 'Text ENG', (e) => {
            temp.eng = e.target.value;
        }, menu.eng)
        wrap.appendChild(textEng)
        let textSwa = crInput('textarea', 'Text SWA', (e) => {
            temp.swa = e.target.value;
        }, menu.swa)
        wrap.appendChild(textSwa)

        let controls = crContrs([{
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
        wrap.appendChild(controls)

        form.appendChild(wrap)
        form.addEventListener('click', () => {
            if (event.target.closest('.form-wrap')) return;
            form.style.display = 'none';
        })
    }
    let renderMenu = (menu, newMenu) => {
        let editor = document.getElementById('editor')
        if (menu.menus.length) {
            let sn = 0;
            let chars = 0;
            menu.menus.forEach((m) => {
                let line = crEl('div', 'option');
                let num = crEl('span', 'num')
                num.textContent = `${++sn}. `;
                chars += num.textContent.length;
                let text = crEl('span', 'text')
                text.textContent = `${m.name}`
                chars += text.textContent.length;
                text.addEventListener('dblclick', () => {
                    selectedId = m.id;
                    editMenu(m, menu)
                })
                text.addEventListener('click', () => {
                    selectedId = m.id;
                    renderRoot(menu)
                })
                let arrowWrapper = crEl('span', 'arrow')
                let arrow = crEl('i', 'right')
                arrowWrapper.appendChild(arrow)
                arrowWrapper.addEventListener('click', () => {
                    menuStack.push(menu)
                    selectedId = 0
                    renderRoot(m)
                })
                line.appendChild(num)
                line.appendChild(text)
                line.appendChild(arrowWrapper)
                editor.appendChild(line)
                if (selectedId === m.id) {
                    line.className = 'option active'
                }
            })
            let totalChars = crEl('div', 'total' + (chars > 143 ? ' exceed' : ''))
            totalChars.appendChild(crEl('span', 'dummy'))
            totalChars.appendChild(crEl('span', 'label', 'No. of characters'))
            totalChars.appendChild(crEl('span', 'number', `${chars}`))
            editor.appendChild(totalChars)
        } else {
            let line = crEl('div', 'option');
            line.textContent = 'No menu options yet, kindly add!'
            editor.appendChild(line)
        }
    };
    let crContrs = (buttons) => {
        let controls = crEl('div', 'controls');
        buttons.forEach((btn) => {
            let tmp = crEl('button')
            tmp.textContent = btn.label
            tmp.addEventListener('click', btn.cb)
            tmp.className = btn.cls
            controls.appendChild(tmp)
        })
        return controls;
    }
    let crInput = (type, lbl, onChange, value, options) => {
        let wrap = crEl('div', 'input-wrap')
        let label = crEl('label')
        label.textContent = `${lbl}: `
        let input = crEl('input')
        input.type = type
        if (type === 'textarea') {
            input = crEl('textarea')
            input.rows = 3;
        } else if (type === 'select') {
            input = crEl('select')
            if (options) {
                options.forEach((o) => {
                    let opt = crEl('option')
                    opt.value = o.name
                    opt.textContent = o.label
                    if (value === opt.name) {
                        opt.selected = true
                    }
                    input.appendChild(opt)
                })
            }
        }
        input.value = value || ''
        input.addEventListener('change', onChange)
        label.appendChild(input)
        wrap.appendChild(label)
        return wrap
    }
    let emptyElement = (el) => {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
        return el;
    }
    let emptyElementById = (id) => {
        var el = document.getElementById(id);
        return emptyElement(el)
    }
    let saveMenu = () => {
        console.log("Saving menu ...", ROOT);
        Api.saveMenu(ROOT, (success, data) => {
            console.log(data);
            renderRoot()
        });
    }
    let btnSave = document.getElementById('saveMenu')
    btnSave.addEventListener('click', saveMenu);
    Api.fetchMenu(ready);
})();