(function () {
    console.log('App is running');
    let ROOT = null;
    const menuTypes = [{
        name: "USSDCODE",
        label: "Is Ussd Code"
    }, {
        name: "OPTIONS",
        label: "Is Menu Otions"
    }, {
        name: "TEXT",
        label: "Is Text Input"
    }, {
        name: "MESSAGE",
        label: "Is Text Message"
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

                    //props
                    let props = emptyElementById('props')
                    let hd = crEl('h3')
                    hd.textContent = "Menu Type"
                    props.appendChild(hd)
                    let updateType = () => {
                        let val = document.querySelector('input[name="type"]:checked').value;
                        m.type = val
                    }

                    menuTypes.forEach(t => {
                        let grp = crEl('div', 'input-group')
                        let lbl = crEl('label')
                        let id = t.label.split(" ").join("")
                        lbl.setAttribute('for', id)
                        let input = crEl('input')
                        input.name = 'type'
                        input.value = t.name
                        input.id = id
                        input.type = 'radio'
                        if (t.name === menu.type) {
                            input.setAttribute('checked', true)
                        }
                        input.addEventListener('change', updateType)
                        lbl.appendChild(input)
                        let lblSpan = crEl('span')
                        lblSpan.textContent = t.label
                        lbl.appendChild(lblSpan)
                        grp.appendChild(lbl)
                        props.appendChild(grp)
                    })
                }
            })

            if (!selectedId) {
                emptyElementById('props')
            }
        } else {
            let line = crEl('div', 'option');
            line.textContent = 'No menu options yet, kindly add!'
            editor.appendChild(line)
        }
    };
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