(function () {
    console.log('App is running');
    let ROOT = null;
    let activeMenuLabel = null
    let newMenuId = 0;
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
    let renderRoot = () => {
        let editor = emptyElementById('editor')
        let root = document.createElement('ul')
        editor.appendChild(root)
        let li = document.createElement('li')
        let span = document.createElement('span')
        span.textContent = ROOT.name
        let ul = document.createElement('ul')
        span.addEventListener('click', (e) => {
            menuClick(ul, ROOT, span)
        })
        li.appendChild(span)
        root.appendChild(li)

        li.appendChild(ul)
        li.className = ROOT.menus.length ? 'collapsed' : 'leaf'
        renderMenu(ul, ROOT)
    };
    let renderMenu = (ul, menu, newMenu) => {
        let parentLi = ul.parentElement;
        parentLi.className = menu.menus.length > 0 ? (parentLi.className == 'expanded' ? 'collapsed' : 'expanded') : 'leaf'
        menu.menus.forEach((m, i) => {
            let li = document.createElement('li')
            let span = document.createElement('span')
            span.textContent = m.name
            let ul2 = document.createElement('ul')
            span.addEventListener('click', (e) => {
                menuClick(ul2, m, span)
            })
            li.appendChild(span)
            li.appendChild(ul2)
            if (m.id == newMenuId) {
                console.log("New one!")
                menuClick(ul2, m, span)
            }
            ul.appendChild(li)
            li.className = m.menus.length ? 'collapsed' : 'leaf'
            renderMenu(ul2, m)
        });
        if (newMenu) {
            parentLi.className = 'expanded'
        }
    };
    let menuClick = (ul, menu, menuText) => {
        let parentLi = ul.parentElement;
        parentLi.className = menu.menus.length > 0 ? (parentLi.className == 'expanded' ? 'collapsed' : 'expanded') : 'leaf'

        let toolbar = emptyElementById("toolbar")
        let label = document.createElement('label')
        label.textContent = menu.name
        label.setAttribute('contentEditable', true)
        label.addEventListener('keyup', (e) => {
            menu.name = label.textContent
            menuText.textContent = menu.name
        })
        toolbar.appendChild(label)
        let add = document.createElement('button')
        add.textContent = 'Add Menu'
        add.addEventListener('click', () => {
            console.log(`Add menu to ${menu.name}`)
            let newMenu = new Menu()
            newMenu.id = getSn()
            newMenu.name = 'Untitled'
            menu.menus.push(newMenu)
            newMenuId = newMenu.id;
            renderRoot()
        });
        toolbar.appendChild(add)
        if (activeMenuLabel) {
            activeMenuLabel.className = null
        }
        activeMenuLabel = menuText;
        activeMenuLabel.className = 'active'
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