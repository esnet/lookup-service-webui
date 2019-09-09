webpackHotUpdate("main",{

/***/ "./src/components/App.js":
/*!*******************************!*\
  !*** ./src/components/App.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _styles_App_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/App.css */ "./src/styles/App.css");
/* harmony import */ var _styles_App_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_App_css__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/es/index.js");
/* harmony import */ var react_search__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-search */ "./node_modules/react-search/lib/Search.js");
/* harmony import */ var react_search__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_search__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react_google_maps__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-google-maps */ "../../node_modules/react-google-maps/lib/index.js");
/* harmony import */ var react_google_maps__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_google_maps__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _Mark__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Mark */ "./src/components/Mark.js");
/* harmony import */ var _image_dot_png__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../image/dot.png */ "./src/image/dot.png");
/* harmony import */ var _image_dot_png__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_image_dot_png__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! http */ "./node_modules/stream-http/index.js");
/* harmony import */ var http__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(http__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _babel_types__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @babel/types */ "./node_modules/@babel/types/lib/index.js");
/* harmony import */ var _babel_types__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_babel_types__WEBPACK_IMPORTED_MODULE_9__);
var _jsxFileName = "/Users/kartik/Desktop/ls_dashboard/src/components/App.js";









 // import Map from "./Map"

const Map = Object(react_google_maps__WEBPACK_IMPORTED_MODULE_4__["withScriptjs"])(Object(react_google_maps__WEBPACK_IMPORTED_MODULE_4__["withGoogleMap"])(props => {
  const markers = props.hostResults.length === 0 ? props.all.map(coord => react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Mark__WEBPACK_IMPORTED_MODULE_5__["default"], {
    key: Math.random(),
    location: {
      lat: parseFloat(coord.latitude),
      lng: parseFloat(coord.longitude)
    },
    host: coord["Host Name"],
    hostUri: coord["URI"],
    callback: props.chooseHostCallback,
    icon: _image_dot_png__WEBPACK_IMPORTED_MODULE_6___default.a,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17
    },
    __self: undefined
  })) : props.hostResults.map(coord => react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Mark__WEBPACK_IMPORTED_MODULE_5__["default"], {
    key: Math.random(),
    location: {
      lat: parseFloat(coord.latitude),
      lng: parseFloat(coord.longitude)
    },
    host: coord["Host Name"],
    hostUri: coord["URI"],
    callback: props.chooseHostCallback,
    icon: _image_dot_png__WEBPACK_IMPORTED_MODULE_6___default.a,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 26
    },
    __self: undefined
  }));
  return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_google_maps__WEBPACK_IMPORTED_MODULE_4__["GoogleMap"], {
    defaultZoom: 3,
    center: {
      lat: 37.8715,
      lng: 122.2730
    },
    __source: {
      fileName: _jsxFileName,
      lineNumber: 35
    },
    __self: undefined
  }, markers);
}));

class App extends react__WEBPACK_IMPORTED_MODULE_0__["Component"] {
  constructor() {
    super();
    this.state = {
      groupCommunities: [],
      selectedGroupCommunity: "",
      pSchedulerTests: [],
      chosenSchedulers: [],
      keys: [],
      chosenKey: "",
      searchTerm: "",
      tableStart: 0,
      tableEnd: 10,
      hostResults: [],
      serviceVisibility: true,
      chosenHost: "",
      serviceResults: [],
      chosenLat: 0,
      chosenLong: 0,
      showMap: true,
      allCoordinates: []
    };
    this.getCommunities = this.getCommunities.bind(this);
    this.getPschedulers = this.getPschedulers.bind(this);
    this.searchHost = this.searchHost.bind(this);
    this.getHost = this.getHost.bind(this);
    this.chooseHost = this.chooseHost.bind(this);
    this.searchService = this.searchService.bind(this);
    this.getService = this.getService.bind(this);
    this.hostTableNext = this.hostTableNext.bind(this);
    this.hostTablePrev = this.hostTablePrev.bind(this);
    this.chooseHostFromMap = this.chooseHostFromMap.bind(this);
    this.clear = this.clear.bind(this);
    this.getChosenValues = this.getChosenValues.bind(this);
    this.getKeySearch = this.getKeySearch.bind(this);
  }

  componentDidMount() {
    fetch('http://localhost:8080/groupCommunities', {
      headers: {
        'Access-Control-Allow-Origin': "http://127.0.0.1:3000"
      }
    }).then(res => res.json()).then(data => {
      this.setState({
        groupCommunities: data
      });
    }).catch(console.log);
    fetch('http://localhost:8080/getAllKeys', {
      headers: {
        'Access-Control-Allow-Origin': "http://127.0.0.1:3000"
      }
    }).then(res => res.json()).then(data => {
      data = data.map(value => ({
        id: 1,
        value: value
      }));
      this.setState({
        keys: data
      });
    }).catch(console.log);
    fetch('http://localhost:8080/pSchedulerTests', {
      headers: {
        'Access-Control-Allow-Origin': "http://127.0.0.1:3000"
      }
    }).then(res => res.json()).then(data => {
      this.setState({
        pSchedulerTests: data
      });
    }).catch(console.log);
    fetch('http://localhost:8080/getCoordinates', {
      headers: {
        'Access-Control-Allow-Origin': "http://127.0.0.1:3000"
      }
    }).then(res => res.json()).then(data => {
      this.setState({
        allCoordinates: data
      });
    }).catch(console.log);
  }

  getCommunities(props) {
    const communities = props.communities;
    const listCommunities = communities.map(community => react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Dropdown"].Item, {
      id: community,
      key: community,
      as: react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Button"],
      onClick: () => {
        var current = document.getElementById("communitiesdropDown");
        current.textContent = "Communities: " + {
          community
        }.community; // changing dropdown name

        this.setState({
          selectedGroupCommunity: {
            community
          }.community
        });
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 120
      },
      __self: this
    }, community));
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Dropdown"].Menu, {
      className: "scrollBox",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 131
      },
      __self: this
    }, listCommunities);
  }

  getPschedulers(props) {
    const pSchedulers = props.pSchedulers;
    const listSchedulers = pSchedulers.map(scheduler => react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("label", {
      key: scheduler,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 138
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("input", {
      type: "checkbox",
      className: "schedulerCheckBox",
      id: scheduler,
      onClick: () => {
        // console.log(this.state.chosenSchedulers);
        var outer = {
          scheduler
        }.scheduler;
        const contains = this.state.chosenSchedulers.includes({
          scheduler
        }.scheduler);

        if (contains) {
          var remainingItems = this.state.chosenSchedulers.filter(function (scheduler) {
            console.log(scheduler + ":" + outer);
            return scheduler !== outer;
          });
          console.log(remainingItems);
          this.setState({
            chosenSchedulers: remainingItems
          });
        } else {
          this.state.chosenSchedulers.push({
            scheduler
          }.scheduler);
          this.setState({
            chosenSchedulers: this.state.chosenSchedulers
          });
        }
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 139
      },
      __self: this
    }), scheduler));
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Dropdown"].Menu, {
      className: "scrollBox",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 161
      },
      __self: this
    }, listSchedulers);
  }

  updateSearch() {
    this.setState({
      searchTerm: document.getElementById("searchBar").value
    });
  }

  keySelect(items) {
    if (items.length !== 0) {
      this.setState({
        chosenKey: items
      });
    }

    var selector = document.getElementById("search-input");
    selector.value = "";
  }

  searchHost() {
    if (this.state.chosenKey.length !== 0) {
      var key = this.state.chosenKey[0]["value"];
    } else {
      var key = "";
    }

    fetch('http://localhost:8080/search?key=' + key + "&groupCommunity=" + this.state.selectedGroupCommunity + "&pSchedulers=" + this.state.chosenSchedulers + "&searchTerm=" + this.state.searchTerm + "&limit=100", {
      headers: {
        'Access-Control-Allow-Origin': "http://127.0.0.1:3000"
      }
    }).then(res => res.json()).then(data => {
      this.setState({
        hostResults: data
      });
    }).catch(console.log);
    this.setState({
      serviceVisibility: true
    });
    document.getElementById("informationTabs-tab-first").click(); // console.log(this.state.hostResults)
  }

  getHost(props) {
    const hostInformation = props.hostInformation;
    const hostTable = hostInformation.slice(this.state.tableStart, this.state.tableEnd).map(host => react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("tr", {
      key: host["Host Name"],
      __source: {
        fileName: _jsxFileName,
        lineNumber: 199
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
      onClick: () => {
        this.chooseHost(host["URI"], host["latitude"], host["longitude"]);
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 200
      },
      __self: this
    }, host["Host Name"]), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
      onClick: () => {
        this.chooseHost(host["URI"], host["latitude"], host["longitude"]);
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 201
      },
      __self: this
    }, host["Hardware"]), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
      onClick: () => {
        this.chooseHost(host["URI"], host["latitude"], host["longitude"]);
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 202
      },
      __self: this
    }, host["System Info"]), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
      onClick: () => {
        this.chooseHost(host["URI"], host["latitude"], host["longitude"]);
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 203
      },
      __self: this
    }, host["Toolkit Version"]), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
      onClick: () => {
        this.chooseHost(host["URI"], host["latitude"], host["longitude"]);
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 204
      },
      __self: this
    }, host["Communities"]), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
      onClick: () => {
        this.chooseHost(host["URI"], host["latitude"], host["longitude"]);
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 205
      },
      __self: this
    }, host["pSchedulers"]), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 206
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Button"], {
      variant: "warning",
      onClick: () => {
        this.showHostJSON({
          host
        });
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 206
      },
      __self: this
    }, "View JSON"))));
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("tbody", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 210
      },
      __self: this
    }, hostTable);
  }

  chooseHost(hostName, latitude, longitude) {
    this.setState({
      serviceVisibility: false
    });
    this.setState({
      chosenHost: hostName,
      chosenLat: latitude,
      chosenLong: longitude
    }, function () {
      this.searchService("all");
    }); // this.searchService()
  }

  showHostJSON(host) {
    console.log(host);
    alert(host["host"]["JSON"]);
  }

  chooseHostFromMap(hostName, type) {
    this.setState({
      serviceVisibility: false
    });
    this.setState({
      chosenHost: hostName
    }, function () {
      this.searchService(type);
    });
  }

  searchService(type) {
    fetch('http://localhost:8080/searchService?hosts=' + this.state.chosenHost + "&type=" + type, {
      headers: {
        'Access-Control-Allow-Origin': "http://127.0.0.1:3000"
      }
    }).then(res => res.json()).then(data => {
      this.setState({
        serviceResults: data
      });
    }).catch(console.log);
    console.log(this.state.serviceResults);
    document.getElementById("informationTabs-tab-second").click();
  }

  getService(props) {
    const serviceInformation = props.serviceInformation;
    const serviceTable = serviceInformation.map(service => react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("tr", {
      key: Math.random(),
      __source: {
        fileName: _jsxFileName,
        lineNumber: 246
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 247
      },
      __self: this
    }, service["name"], " - ", service["type"]), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 248
      },
      __self: this
    }, service["address"]), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 249
      },
      __self: this
    }, this.state.chosenLat, " , ", this.state.chosenLong), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 250
      },
      __self: this
    }, service["communities"]), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 251
      },
      __self: this
    }, service["version"]), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 252
      },
      __self: this
    }, service["command"]), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 253
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Button"], {
      variant: "warning",
      onClick: () => {
        this.showServiceJSON({
          service
        });
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 253
      },
      __self: this
    }, "View JSON"))));
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("tbody", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 257
      },
      __self: this
    }, serviceTable);
  }

  hostTableNext() {
    if (this.state.hostResults.length > this.state.tableEnd) {
      this.setState({
        tableEnd: this.state.tableEnd + 10,
        tableStart: this.state.tableStart + 10
      });
    }
  }

  hostTablePrev() {
    if (this.state.tableStart - 10 >= 0) {
      this.setState({
        tableEnd: this.state.tableEnd - 10,
        tableStart: this.state.tableStart - 10
      });
    }
  }

  showServiceJSON(host) {
    console.log(host);
    alert(host["service"]["JSON"]);
  }

  clear() {
    this.setState({
      selectedGroupCommunity: "",
      chosenSchedulers: [],
      chosenKey: "",
      searchTerm: "",
      tableStart: 0,
      tableEnd: 10,
      hostResults: [],
      serviceVisibility: true,
      chosenHost: "",
      serviceResults: [],
      chosenLat: 0,
      chosenLong: 0,
      showMap: true
    });
    var communityDrop = document.getElementById("communitiesdropDown");
    communityDrop.textContent = "Group communities";
    var box = document.getElementsByClassName('schedulerCheckBox');

    for (var i = 0; i < box.length; i++) {
      if (box[i].type === 'checkbox') box[i].checked = false;
    } // var selector = document.getElementById("search-input");
    // console.log(selector.value)
    // var ul = document.getElementsByClassName("sc-htpNat cqaNcS")[0];
    // console.log(ul)
    // var lis = (ul.getElementsByTagName("li"))
    // if (lis.length > 0) {
    //   ul.removeChild(lis[0]);
    // }
    // selector.className = "sc-bwzfXH LBGII";
    // selector.placeholder = "key (optional) : ";


    var searchBar = document.getElementById("searchBar");
    searchBar.value = "";
  }

  getChosenValues(props) {
    console.log(props.chosenpSchedulers);
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 322
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
      className: "howToBox",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 323
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 323
      },
      __self: this
    }, "Key:"), this.state.chosenKey.length > 0 ? this.state.chosenKey[0].value : "", " "), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
      className: "howToBox",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 324
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 324
      },
      __self: this
    }, "Search:"), " ", this.state.searchTerm), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
      className: "howToBox",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 325
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 325
      },
      __self: this
    }, "Communities:"), this.state.selectedGroupCommunity, " "), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
      className: "howToBox",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 326
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 326
      },
      __self: this
    }, "pScheduler:"), props.chosenpSchedulers.toString()));
  }

  getKeySearch() {
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_search__WEBPACK_IMPORTED_MODULE_3___default.a, {
      items: this.state.keys,
      placeholder: "key (optional) : ",
      maxSelected: 1,
      multiple: true,
      onItemsChanged: this.keySelect.bind(this),
      className: "searchBarField",
      id: "keySelector",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 333
      },
      __self: this
    });
  }

  render() {
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 345
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Jumbotron"], {
      className: "head",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 346
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
      className: "grid-container",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 347
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
      className: "grid-item",
      id: "textBox2",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 348
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("br", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 349
      },
      __self: this
    }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h5", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 350
      },
      __self: this
    }, "Chosen values"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(this.getChosenValues, {
      chosenpSchedulers: this.state.chosenSchedulers,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 351
      },
      __self: this
    })), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
      className: "grid-item",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 353
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 354
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(this.getKeySearch, {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 355
      },
      __self: this
    }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("input", {
      type: "text",
      placeholder: "Search..",
      className: "searchBar",
      onChange: this.updateSearch.bind(this),
      id: "searchBar",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 361
      },
      __self: this
    })), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
      className: "dropdownDiv",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 363
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Dropdown"], {
      className: "dropdownDiv",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 364
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Dropdown"].Toggle, {
      variant: "dark",
      id: "communitiesdropDown",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 365
      },
      __self: this
    }, "Group communities"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(this.getCommunities, {
      communities: this.state.groupCommunities,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 368
      },
      __self: this
    })), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Dropdown"], {
      className: "dropdownDiv",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 371
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Dropdown"].Toggle, {
      variant: "dark",
      id: "dropdown-basic",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 372
      },
      __self: this
    }, "pScheduler Tests"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(this.getPschedulers, {
      pSchedulers: this.state.pSchedulerTests,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 376
      },
      __self: this
    }))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 380
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
      className: "inlineButtons",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 381
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Button"], {
      variant: "warning",
      onClick: () => {
        this.searchHost();
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 382
      },
      __self: this
    }, "Submit"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Button"], {
      variant: "danger",
      onClick: () => {
        this.clear();
      },
      className: "clearButton",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 383
      },
      __self: this
    }, "Clear")))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
      className: "grid-item",
      id: "textbox",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 387
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("br", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 388
      },
      __self: this
    }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h5", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 389
      },
      __self: this
    }, "How to use the LS Directory"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
      className: "howToBox",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 390
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 390
      },
      __self: this
    }, "Key:"), " The key signifies the \"key\" in the key-value schema of the database"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
      className: "howToBox",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 391
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 391
      },
      __self: this
    }, "Search:"), " The search is the value needed for the selected key"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
      className: "howToBox",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 392
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 392
      },
      __self: this
    }, "Communities:"), " Filter for the group community value"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
      className: "howToBox",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 393
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 393
      },
      __self: this
    }, "pScheduler:"), " Filter for the pScheduler tests")))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Tab"].Container, {
      id: "informationTabs",
      defaultActiveKey: "first",
      className: "informationTabs",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 399
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Row"], {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 400
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Col"], {
      sm: 2,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 401
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Nav"], {
      variant: "pills",
      className: "flex-column",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 402
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Nav"].Item, {
      id: "hostTab",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 403
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Nav"].Link, {
      eventKey: "first",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 404
      },
      __self: this
    }, "Host Information")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Nav"].Item, {
      id: "serviceTab",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 406
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Nav"].Link, {
      eventKey: "second",
      disabled: this.state.serviceVisibility,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 407
      },
      __self: this
    }, "Service Information")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Nav"].Item, {
      id: "mapTab",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 409
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Nav"].Link, {
      eventKey: "third",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 410
      },
      __self: this
    }, "Map")))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Col"], {
      sm: 9,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 414
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Tab"].Content, {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 415
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Tab"].Pane, {
      eventKey: "first",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 416
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
      className: "prevNextButton",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 417
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Button"], {
      variant: "info",
      onClick: this.hostTablePrev,
      className: "prevButton",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 418
      },
      __self: this
    }, "Previous"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Button"], {
      variant: "danger",
      onClick: this.hostTableNext,
      className: "nextButton",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 419
      },
      __self: this
    }, "Next")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Table"], {
      striped: true,
      bordered: true,
      hover: true,
      variant: "dark",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 422
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("thead", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 423
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("tr", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 424
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("th", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 425
      },
      __self: this
    }, "Host Name"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("th", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 426
      },
      __self: this
    }, "Hardware"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("th", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 427
      },
      __self: this
    }, "System Info"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("th", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 428
      },
      __self: this
    }, "Toolkit-Version"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("th", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 429
      },
      __self: this
    }, "Communities"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("th", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 430
      },
      __self: this
    }, "Pscheduler Tests"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("th", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 431
      },
      __self: this
    }, "JSON"))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(this.getHost, {
      hostInformation: this.state.hostResults,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 434
      },
      __self: this
    }))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Tab"].Pane, {
      eventKey: "second",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 437
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Table"], {
      striped: true,
      bordered: true,
      hover: true,
      variant: "dark",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 438
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("thead", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 439
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("tr", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 440
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("th", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 441
      },
      __self: this
    }, "Service Name"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("th", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 442
      },
      __self: this
    }, "Address"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("th", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 443
      },
      __self: this
    }, "geographic Location"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("th", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 444
      },
      __self: this
    }, "Communities"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("th", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 445
      },
      __self: this
    }, "Version"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("th", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 446
      },
      __self: this
    }, "Example Command"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("th", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 447
      },
      __self: this
    }, "JSON"))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(this.getService, {
      serviceInformation: this.state.serviceResults,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 450
      },
      __self: this
    }))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_bootstrap__WEBPACK_IMPORTED_MODULE_2__["Tab"].Pane, {
      eventKey: "third",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 453
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
      className: "map",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 454
      },
      __self: this
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Map, {
      lat: this.state.chosenLat,
      long: this.state.chosenLong,
      all: this.state.allCoordinates,
      hostResults: this.state.hostResults,
      chooseHostCallback: this.chooseHostFromMap,
      googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyAEW46KVttk6w0Ik_-hKNl7XqQ31t07q0U&v=3.exp&libraries=geometry,drawing,places",
      loadingElement: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        style: {
          height: "100%"
        },
        __source: {
          fileName: _jsxFileName,
          lineNumber: 462
        },
        __self: this
      }),
      containerElement: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        style: {
          height: "600px",
          width: "100%"
        },
        __source: {
          fileName: _jsxFileName,
          lineNumber: 463
        },
        __self: this
      }),
      mapElement: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        style: {
          height: "100%"
        },
        __source: {
          fileName: _jsxFileName,
          lineNumber: 464
        },
        __self: this
      }),
      __source: {
        fileName: _jsxFileName,
        lineNumber: 455
      },
      __self: this
    }))))))));
  }

}

;
/* harmony default export */ __webpack_exports__["default"] = (App);

/***/ })

})
//# sourceMappingURL=main.6a22503716dcf5d08826.hot-update.js.map