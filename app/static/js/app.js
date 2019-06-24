import * as mbuilderApp from '../mbuilder/js/app.js';
import * as transtestApp from '../transtest/js/app.js';
(function (modules) {
    console.log('Main app is running!')
    let tabsContainer = document.getElementById('tabs')
    let tabs = tabsContainer.getElementsByClassName('tab')
    let tabIds = []
    for (let i = 0; i < tabs.length; i++) {
        let tab = tabs[i];
        tabIds.push(tab.id)
        tab.style.display = 'none'
    }

    let headersContainer = document.getElementById('headers')
    let hds = headersContainer.getElementsByTagName('h2')
    let handleClick = (hd) => {
        for (let i = 0; i < hds.length; i++) {
            let hd = hds[i];
            hd.className = ''
            if (hd.tab) {
                hd.tab.style.display = 'none'
            }
        }
        hd.className = 'active'
        hd.tab.style.display = 'block'
        hd.module.refreshApp()
    }
    for (let i = 0; i < hds.length; i++) {
        let hd = hds[i];
        let id = hd.dataset.tab
        let tab = document.getElementById(id)
        let tmp = modules.filter((m) => m.getTabId() === id)
        if (tab && tmp.length) {
            hd.tab = tab
            hd.addEventListener('click', () => handleClick(hd))
            hd.module = tmp[0]
        }

        if (i === 0) {
            handleClick(hd)
        }
    }
})([mbuilderApp, transtestApp]);