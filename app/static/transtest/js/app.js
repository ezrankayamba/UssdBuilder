import {
    Service
} from './services.js'

var serviceObj = null;
var serviceSelector = document.getElementById('service');
serviceSelector.addEventListener("change", function (ev) {
    var val = ev.target.value;
    loadService(val);
});

let serviceSel = document.getElementById('service')
const services = Service.subClasses();
services.forEach(s => {
    let opt = document.createElement('option');
    opt.value = s.type.name;
    opt.appendChild(document.createTextNode(s.label));
    serviceSel.appendChild(opt);
});

function loadService(type) {
    var BreakException = {};
    try {
        services.forEach(s => {
            let sType = s.type;
            if (sType.name === type) {
                serviceObj = new sType();
                throw BreakException;
            }
        });
    } catch (error) {}

    serviceObj.renderForm()
    serviceObj.updateXml();
    clearMessage();
}

function executeApiCall(serviceObj) {
    overlayOn();
    serviceObj.apiCall(function (success, data) {
        overlayOff();
        if (success) {
            var result = data.getElementsByTagName("Result")[0].childNodes[0].nodeValue;
            let msgNode = data.getElementsByTagName("Message")[0].childNodes[0]
            var message = msgNode ? msgNode.nodeValue : 'No message';
            var _class = result == 0 ? "success" : "fail";
            var resultDiv = document.getElementById("result");
            var p = document.createElement('p');
            p.className = _class;
            p.textContent = message;
            while (resultDiv.firstChild) {
                resultDiv.removeChild(resultDiv.firstChild);
            }
            resultDiv.appendChild(p);
        }
    });
}

function clearMessage() {
    var resultDiv = document.getElementById("result");
    while (resultDiv.firstChild) {
        resultDiv.removeChild(resultDiv.firstChild);
    }
}

function overlayOn() {
    document.getElementById('execute').setAttribute('disabled', true)
    if (serviceObj) {
        serviceObj.updateXml();
    }
    document.getElementById("overlay").style.display = "block";
    clearMessage()
}

function overlayOff() {
    document.getElementById('execute').removeAttribute('disabled')
    document.getElementById("overlay").style.display = "none";
}

document.getElementById('execute').addEventListener('click', function () {
    let valid = document.getElementById('form').checkValidity();
    if (valid == true) {
        executeApiCall(serviceObj);
    }
});
export let refreshApp = () => {
    loadService(serviceSelector.value)
}
export let getTabId = () => {
    return 'trans-test'
}

(function (refreshApp) {
    console.log('Transaction Test App is running');
    let cssId = 'transtest'; // you could encode the css path itself to generate id..
    if (!document.getElementById(cssId)) {
        let head = document.getElementsByTagName('head')[0];
        let link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = '/static/transtest/css/style.css';
        link.media = 'all';
        head.appendChild(link);
    }
    refreshApp()
})(refreshApp);