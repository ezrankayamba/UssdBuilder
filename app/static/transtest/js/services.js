export class Service {
  constructor() {}
  xml() {
    return "Not implemented";
  }
  rand(min, max) {
    return Math.floor(Math.random() * (+max - +min)) + +min;
  }
  uid() {
    return `TTT${new Date().getTime()}R${this.rand(1000, 9999)}`;
  }
  inputs() {
    return [];
  }
  updateXml() {
    var ta = document.getElementById("xmlData");
    ta.value = this.xml();
    this.renderXml(ta);
  }
  renderXml(o) {
    o.style.height = "1px";
    o.style.height = 0 + o.scrollHeight + "px";

    o.style.width = "1px";
    o.style.width = 0 + o.scrollWidth + "px";
  }
  renderForm() {
    var sp = document.getElementById("serviceParams");
    while (sp.firstChild) {
      sp.removeChild(sp.firstChild);
    }
    this.inputs().forEach(input => {
      var grp = document.createElement("div");
      grp.className = "input-group";
      var lbl = document.createElement("label");
      lbl.setAttribute("for", input.name);
      lbl.textContent = `${input.label} *`;
      grp.appendChild(lbl);

      var inp = document.createElement("input");
      inp.name = input.name;
      inp.id = input.name;
      inp.value = input.value;
      inp.addEventListener("keyup", input.cb);
      lbl.appendChild(inp);

      sp.appendChild(grp);
    });
  }
  apiCall(cb) {
    const URL = "/transtest/api_call";
    const DATA = this.xml();
    const params = {
      headers: {
        "Content-type": "text/xml",
        ServiceName: this.constructor.name
      },
      body: DATA,
      method: "POST"
    };
    fetch(URL, params)
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
      .then(data => {
        cb(true, data);
      })
      .catch(error => {
        console.log(error);
        cb(false, error);
      });
  }
  static subClasses() {
    return [{
        type: SendMoney,
        label: "Send Money"
      },
      {
        type: B2WCommon,
        label: "Bank To Wallet"
      },
      {
        type: B2BTransfer,
        label: "B2B Transfer"
      },
      {
        type: CashIn,
        label: "Cash In"
      },
      {
        type: CashOut,
        label: "Cash Out"
      },
      {
        type: C2BCommon,
        label: "Bill Pay"
      },
      {
        type: ChangeGroup,
        label: "Change Group"
      }
    ];
  }
}
export class SendMoney extends Service {
  constructor() {
    super();
    this.sourceMSISDN = "";
    this.sourcePIN = "";
    this.destMSISDN = "";
    this.amount = 100;
    this.shortCode = 50001;
  }
  normalizedSourceMSISDN(raw) {
    return (raw.length > 9 && raw.startsWith("0")) ||
      (raw.length == 9 && (raw.startsWith("7") || raw.startsWith("6"))) ?
      `255${raw.substring(raw.length - 9)}` :
      raw;
  }

  xml() {
    var tab = "   ";
    var res2 = ``;
    res2 += `<TCSRequest>\n`;
    res2 += `${tab}<UserName>${this.sourceMSISDN}</UserName>\n`;
    res2 += `${tab}<TerminalType>USD</TerminalType>\n`;
    res2 += `${tab}<Password>${this.sourcePIN}</Password>\n`;
    res2 += `${tab}<Function name="PAYMENT">\n`;
    res2 += `${tab}${tab}<Param1>${this.destMSISDN}</Param1>\n`;
    res2 += `${tab}${tab}<Param2>${this.amount}</Param2>\n`;
    res2 += `${tab}${tab}<Param4>${this.shortCode}</Param4>\n`;
    res2 += `${tab}${tab}<Param11>${this.uid()}</Param11>\n`;
    res2 += `${tab}</Function>\n`;
    res2 += `</TCSRequest>`;
    return res2;
  }

  inputs() {
    var that = this;
    return [{
        name: "sourceMSISDN",
        label: "Sender MSISDN",
        value: this.sourceMSISDN,
        cb: src => {
          that.sourceMSISDN = this.normalizedSourceMSISDN(src.target.value);
          that.updateXml();
        }
      },
      {
        name: "sourcePIN",
        label: "Sender PIN",
        value: this.sourcePIN,
        cb: function (src) {
          that.sourcePIN = src.target.value;
          that.updateXml();
        }
      },
      {
        name: "destMSISDN",
        label: "Receiver MSISDN",
        value: this.destMSISDN,
        cb: function (src) {
          that.destMSISDN = src.target.value;
          that.updateXml();
        }
      },
      {
        name: "amount",
        label: "Amount",
        value: this.amount,
        cb: function (src) {
          that.amount = src.target.value;
          that.updateXml();
        }
      }
    ];
  }
}
export class ChangeGroup extends Service {
  constructor() {
    super();
    this.sourceMSISDN = "255656667";
    this.sourcePIN = "1920";
    this.destMSISDN = "";
    this.groupId = 20;
  }
  normalizedSourceMSISDN(raw) {
    return (raw.length > 9 && raw.startsWith("0")) ||
      (raw.length == 9 && (raw.startsWith("7") || raw.startsWith("6"))) ?
      `255${raw.substring(raw.length - 9)}` :
      raw;
  }

  xml() {
    var tab = "   ";
    var res2 = ``;
    res2 += `<TCSRequest>\n`;
    res2 += `${tab}<UserName>${this.sourceMSISDN}</UserName>\n`;
    res2 += `${tab}<TerminalType>USD</TerminalType>\n`;
    res2 += `${tab}<Password>${this.sourcePIN}</Password>\n`;
    res2 += `${tab}<Function name="CHANGEGROUP">\n`;
    res2 += `${tab}${tab}<Param1>${this.destMSISDN}</Param1>\n`;
    res2 += `${tab}${tab}<Param2>${this.groupId}</Param2>\n`;
    res2 += `${tab}</Function>\n`;
    res2 += `</TCSRequest>`;
    return res2;
  }

  inputs() {
    var that = this;
    return [{
        name: "sourceMSISDN",
        label: "Sender MSISDN",
        value: this.sourceMSISDN,
        cb: src => {
          that.sourceMSISDN = this.normalizedSourceMSISDN(src.target.value);
          that.updateXml();
        }
      },
      {
        name: "sourcePIN",
        label: "Sender PIN",
        value: this.sourcePIN,
        cb: function (src) {
          that.sourcePIN = src.target.value;
          that.updateXml();
        }
      },
      {
        name: "destMSISDN",
        label: "MSISDN",
        value: this.destMSISDN,
        cb: function (src) {
          that.destMSISDN = src.target.value;
          that.updateXml();
        }
      },
      {
        name: "groupId",
        label: "Group ID",
        value: this.groupId,
        cb: function (src) {
          that.groupId = src.target.value;
          that.updateXml();
        }
      }
    ];
  }
}
export class CashOut extends SendMoney {
  constructor() {
    super();
    //"", "", "500143", "1000"
    this.sourceMSISDN = "";
    this.sourcePIN = "";
    this.destMSISDN = "500143";
    this.amount = 1000;
    this.shortCode = 50010;
  }
  inputs() {
    var that = this;
    var inputs = super.inputs();
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      if (inp.name == "destMSISDN") {
        inputs[i] = {
          name: "destMSISDN",
          label: "Agent Code",
          value: this.destMSISDN,
          cb: function (src) {
            that.destMSISDN = src.target.value;
            that.updateXml();
          }
        };
      }
    }
    return inputs;
  }
}
export class C2BCommon extends SendMoney {
  constructor() {
    super();
    this.shortCode = "";
  }
  inputs() {
    var that = this;
    var inputs = super.inputs();
    inputs.push({
      name: "shortCode",
      label: "Short Code",
      value: this.shortCode,
      cb: function (src) {
        that.shortCode = src.target.value;
        that.updateXml();
      }
    });
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      if (inp.name == "destMSISDN") {
        inputs[i] = {
          name: "destMSISDN",
          label: "Business Number",
          value: this.destMSISDN,
          cb: function (src) {
            that.destMSISDN = src.target.value;
            that.updateXml();
          }
        };
      }
    }
    return inputs;
  }
}
export class CashIn extends SendMoney {
  constructor() {
    super();
    //"255715018825", "1920", "", "1000"
    this.sourceMSISDN = "255715018825";
    this.sourcePIN = "1920";
    this.amount = 100;
    this.shortCode = 61001;
  }
  inputs() {
    var that = this;
    var inputs = super.inputs();
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      if (inp.name == "sourceMSISDN") {
        inputs[i] = {
          name: "sourceMSISDN",
          label: "Agent MSISDN",
          value: this.sourceMSISDN,
          cb: function (src) {
            that.sourceMSISDN = src.target.value;
            that.updateXml();
          }
        };
      } else if (inp.name == "sourcePIN") {
        inputs[i] = {
          name: "sourcePIN",
          label: "Agent PIN",
          value: this.sourcePIN,
          cb: function (src) {
            that.sourcePIN = src.target.value;
            that.updateXml();
          }
        };
      }
    }
    return inputs;
  }
}

export class B2WCommon extends SendMoney {
  constructor() {
    super();
    this.sourceMSISDN = "255659632115";
    this.sourcePIN = "1902";
    this.destMSISDN = "";
    this.amount = 100;
    this.brandId = "187";
    this.remarks = "Ignore";
    this.paramsAdded = false;
  }
  inputs() {
    var that = this;
    var inputs = super.inputs();
    inputs.push({
      name: "brandId",
      label: "Brand ID",
      value: this.brandId,
      cb: function (src) {
        that.brandId = src.target.value;
        that.updateXml();
      }
    });
    inputs.push({
      name: "remarks",
      label: "Remarks",
      value: this.remarks,
      cb: function (src) {
        that.remarks = src.target.value;
        that.updateXml();
      }
    });
    return inputs;
  }
  xml() {
    var tab = "   ";
    var res2 = ``;
    res2 += `<TCSRequest>\n`;
    res2 += `${tab}<UserName>${this.sourceMSISDN}</UserName>\n`;
    res2 += `${tab}<TerminalType>USD</TerminalType>\n`;
    res2 += `${tab}<Password>${this.sourcePIN}</Password>\n`;
    res2 += `${tab}<Function name="PAYMENT">\n`;
    res2 += `${tab}${tab}<Param1>${this.destMSISDN}</Param1>\n`;
    res2 += `${tab}${tab}<Param2>${this.amount}</Param2>\n`;
    res2 += `${tab}${tab}<Param5>${this.brandId}</Param5>\n`;
    res2 += `${tab}${tab}<Param7>${this.remarks}</Param7>\n`;
    res2 += `${tab}${tab}<Param11>${this.uid()}</Param11>\n`;
    res2 += `${tab}</Function>\n`;
    res2 += `</TCSRequest>`;
    return res2;
  }
}
export class B2BTransfer extends B2WCommon {
  constructor() {
    super();
    this.sourceMSISDN = "255650071";
    this.sourcePIN = "1920";
    this.amount = 1000;
    this.brandId = "355";
  }
}