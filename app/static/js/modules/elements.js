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
let addEls = function (childs) {
    childs.forEach((c) => {
        this.appendChild(c)
    })
}
let crEl = (type, cls, text) => {
    let el = document.createElement(type);
    if (cls) {
        el.className = cls
    }
    if (text) {
        el.textContent = text
    }
    el.addEls = addEls
    return el;
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
    if (type === 'number') {
        input.value = value || 0
    }
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


export {
    crContrs,
    emptyElementById,
    emptyElement,
    crEl,
    crInput
}