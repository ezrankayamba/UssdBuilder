(function () {
    console.log('App is running');
    let ROOT = null;
    let activeMenuLabel = null
    let ready = (success, data) => {
        const ROOT = data.name ? data : new Menu();
        console.log('Ready')
        console.log(ROOT)
        let editor = document.getElementById('editor')
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
        emptyElement(ul)
        parentLi.className = menu.menus.length > 0 ? (parentLi.className == 'expanded' ? 'collapsed' : 'expanded') : 'leaf'
        menu.menus.forEach((m, i) => {
            console.log(m.name)
            let li = document.createElement('li')
            let span = document.createElement('span')
            span.textContent = m.name
            let ul2 = document.createElement('ul')
            span.addEventListener('click', (e) => {
                menuClick(ul2, m, span)
            })
            li.appendChild(span)
            li.appendChild(ul2)
            if (newMenu && menu.menus.length == (i + 1)) {
                menuClick(ul2, m, span)
            }
            ul.appendChild(li)
            li.className = m.menus.length ? 'collapsed' : 'leaf'
            //renderMenu(ul, m)
        });
        if (newMenu) {
            parentLi.className = 'expanded'
        }
    };
    let menuClick = (ul, menu, menuText) => {
        console.log(menu, ul, menuText);
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
            newMenu.name = 'Untitled'
            menu.menus.push(newMenu)
            renderMenu(ul, menu, newMenu)
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
    Api.fetchMenu(ready);
})();