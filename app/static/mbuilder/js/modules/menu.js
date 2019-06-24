class Menu {
  constructor(orderNo = 1, menus = [], name = "ROOT") {
    this.orderNo = orderNo;
    this.menus = menus;
    this.name = name;
    this.id = 0
    this.type = "OPTIONS"
  }
}

class Api {
  static fetchMenu(cb) {
    const URL = "/mbuilder/get_menu";
    const params = {
      headers: {
        "Accept": "text/json"
      },
      method: "GET"
    };
    fetch(URL, params)
      .then(response => {
        return response.json();
      })
      .then(data => {
        cb(true, data);
      })
      .catch(error => {
        console.log(error);
        cb(false, error);
      });
  }
  static saveMenu(ROOT, cb) {
    const URL = "/mbuilder/update_menu";
    const params = {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(ROOT)
    };
    fetch(URL, params)
      .then(response => {
        return response.text();
      })
      .then(data => {
        cb(true, data);
      })
      .catch(error => {
        console.log(error);
        cb(false, error);
      });
  }
}

export {
  Menu,
  Api
}