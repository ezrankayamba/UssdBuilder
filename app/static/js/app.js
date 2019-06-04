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
        if (ROOT.menus.length) {
            ROOT.menus.forEach(m => {
                max = max <= m.id ? m.id : max;
            })
        }
        idTracker.id = max;
        renderRoot()
    };
    let crEl = (type, cls) => {
        let el = document.createElement(type);
        if (cls) {
            el.className = cls
        }

        return el;
    }

    let menuStack = []
    let selectedId = 0
    let renderRoot = (otherMenu) => {
        console.log(menuStack, menuStack.length)
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
            let toolbar = emptyElementById('toolbar')
            renderRoot(menu)
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
    let renderMenu = (menu, newMenu) => {
        let editor = document.getElementById('editor')
        let toolbar = emptyElementById('toolbar')
        if (menu.menus.length) {
            let sn = 0;
            menu.menus.forEach((m) => {
                let line = crEl('div', 'option');
                let num = crEl('span', 'num')
                num.textContent = `${++sn}.`;
                let text = crEl('span', 'text')
                text.textContent = m.name
                text.addEventListener('click', () => {
                    console.log('Selected...', m)
                    selectedId = m.id
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

                    //Menu Type
                    let selWrap = crEl('div', 'input-wrap horizontal')
                    let selLabel = crEl('label')
                    selLabel.textContent = "Menu Type: "
                    let updateType = (ev) => {
                        let val = ev.target.value;
                        console.log(`Changed: ${val}`)
                        m.type = val
                    }
                    let selType = crEl('select')
                    menuTypes.forEach(t => {
                        let opt = crEl('option')
                        opt.value = t.name
                        opt.textContent = t.label
                        if (t.name === m.type) {
                            console.log(`Type found: ${t.name}`)
                            opt.selected = true
                        }
                        selType.appendChild(opt)
                    })
                    selType.addEventListener('change', updateType)
                    selLabel.appendChild(selType)
                    selWrap.appendChild(selLabel)
                    toolbar.appendChild(selWrap)

                    toolbar.appendChild(crInput('input', 'ENG', (ev) => {
                        let val = ev.target.value
                        m.eng = val
                    }, m.eng))
                    toolbar.appendChild(crInput('input', 'SWA', (ev) => {
                        let val = ev.target.value
                        m.swa = val
                    }, m.swa))
                }
            })
        } else {
            let line = crEl('div', 'option');
            line.textContent = 'No menu options yet, kindly add!'
            editor.appendChild(line)
        }
    };
    let crInput = (type, lbl, onChange, value) => {
        let wrap = crEl('div', 'input-wrap')
        let label = crEl('label')
        label.textContent = `${lbl}: `
        let input = crEl('input')
        input.type = type
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
        });
    }
    let btnSave = document.getElementById('saveMenu')
    btnSave.addEventListener('click', saveMenu);
    Api.fetchMenu(ready);
})();