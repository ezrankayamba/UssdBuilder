import * as El from './modules/elements.js'
(function () {
    console.log('tabs')
    let tabsContainer = document.getElementById('tabs')
    let tabs = tabsContainer.getElementsByClassName('tab')
    let tabIds = []
    for (var i = 0; i < tabs.length; i++) {
        let tab = tabs[i];
        tabIds.push(tab.id)
        tab.style.display = 'none'
    }

    let headersContainer = document.getElementById('headers')
    let hds = headersContainer.getElementsByTagName('h2')
    let handleClick = (hd) => {
        for (var i = 0; i < hds.length; i++) {
            let hd = hds[i];
            hd.className = ''
            if (hd.tab) {
                hd.tab.style.display = 'none'
            }
        }
        hd.className = 'active'
        hd.tab.style.display = 'block'
    }
    for (var i = 0; i < hds.length; i++) {
        let hd = hds[i];
        let tab = document.getElementById(hd.dataset.tab)
        if (tab) {
            hd.tab = tab
            hd.addEventListener('click', () => handleClick(hd))
        }

        if (i === 0) {
            handleClick(hd)
        }
    }
})();