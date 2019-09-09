import React, { Component } from 'react';
import '../styles/App.css';
import { Jumbotron, Button, Table, Tab, Row, Col, Nav } from 'react-bootstrap'
import Search from "react-search"
import ChosenBox from "./ChosenBox"
import GroupCommunities from "./GroupCommunities"
import Scheduler from "./Scheduler"
import HostTable from "./HostTable"
import Mapper from "./Mapper"
import { serverURL, hostURL } from "./config/config"

class App extends Component {


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
      allCoordinates: [],
      serviceAddress: ""
    }

    this.groupCommunitiesCallbackFunction = this.groupCommunitiesCallbackFunction.bind(this);
    this.searchHost = this.searchHost.bind(this);
    this.searchService = this.searchService.bind(this)
    this.getService = this.getService.bind(this);
    this.hostTableNext = this.hostTableNext.bind(this);
    this.hostTablePrev = this.hostTablePrev.bind(this);
    this.chooseHostFromMap = this.chooseHostFromMap.bind(this);
    this.clear = this.clear.bind(this);
    this.getChosenValues = this.getChosenValues.bind(this);
  }

  componentDidMount() {
    fetch(serverURL + '/groupCommunities', { headers: { 'Access-Control-Allow-Origin': hostURL } })
      .then(res => res.json())
      .then((data) => {
        this.setState({ groupCommunities: data })
      })
      .catch(console.log)

    fetch(serverURL + '/getAllKeys', { headers: { 'Access-Control-Allow-Origin': hostURL } })
      .then(res => res.json())
      .then((data) => {
        data = data.map(value => ({ id: 1, value: value }))
        this.setState({ keys: data })
      })
      .catch(console.log)

    fetch(serverURL + '/pSchedulerTests', { headers: { 'Access-Control-Allow-Origin': hostURL } })
      .then(res => res.json())
      .then((data) => {
        this.setState({ pSchedulerTests: data })
      })
      .catch(console.log)

    fetch(serverURL + '/getCoordinates', { headers: { 'Access-Control-Allow-Origin': hostURL } })
      .then(res => res.json())
      .then((data) => {
        this.setState({ allCoordinates: data })
      })
      .catch(console.log)
  }

  groupCommunitiesCallbackFunction = (selected) => {
    this.setState({ selectedGroupCommunity: selected })
  }

  schedulerCallbackFunction = (selected) => {
    this.setState({ chosenSchedulers: selected })
  }

  updateSearch() {
    this.setState({ searchTerm: document.getElementById("searchBar").value })
  }

  keySelect(items) {
    if (items.length !== 0) {
      this.setState({ chosenKey: items });
    } else {
      this.setState({ chosenKey: "" });
    }
    var selector = document.getElementById("search-input");
    selector.value = "";
  }

  searchHost() {
    var key = ""
    if (this.state.chosenKey.length !== 0) {
      key = this.state.chosenKey[0]["value"]
    } else {
      key = ""
    }
    if (key !== "" & this.state.searchTerm === "") {
      alert("Key must have a value specified")
    } else if (key === "" & this.state.searchTerm !== "") {
      alert("Search must have a value specified")
    } else if (key === "" & this.state.searchTerm === "" & this.state.selectedGroupCommunity === "" & this.state.chosenSchedulers.length === 0) {
      alert("Please fill in fields before searching")
    } else {
      fetch(serverURL + '/search?key=' + key + "&groupCommunity=" + this.state.selectedGroupCommunity + "&pSchedulers=" + this.state.chosenSchedulers + "&searchTerm=" + this.state.searchTerm + "&limit=1000", { headers: { 'Access-Control-Allow-Origin': hostURL } })
        .then(res => res.json())
        .then((data) => {
          this.setState({ hostResults: data })
        })
        .catch(console.log)
      this.setState({ serviceVisibility: true });
      document.getElementById("informationTabs-tab-first").click();
    }
  }

  hostTableCallBackFunction = (hostName, latitude, longitude, address) => {
    this.setState({ serviceVisibility: false });
    this.setState({ chosenHost: hostName, chosenLat: latitude, chosenLong: longitude, serviceAddress: address }, function () { this.searchService("all") })
  }

  chooseHostFromMap(hostName, type) {
    this.setState({ serviceVisibility: false });
    this.setState({ chosenHost: hostName }, function () { this.searchService(type) })
  }

  searchService(type) {
    fetch(serverURL + '/searchService?hosts=' + this.state.chosenHost + "&type=" + type, { headers: { 'Access-Control-Allow-Origin': hostURL } })
      .then(res => res.json())
      .then((data) => {
        this.setState({ serviceResults: data })
      })
      .catch(console.log)
    document.getElementById("informationTabs-tab-second").click();
  }

  getService(props) {
    const serviceInformation = props.serviceInformation;
    const serviceTable = serviceInformation.map((service) =>
      <tr key={Math.random()} >
        <td>{service["name"]} - {service["type"]}</td>
        <td>{this.state.serviceAddress}</td>
        <td>{this.state.chosenLat} , {this.state.chosenLong}<br /> {service["locationString"]}</td>
        <td>{service["communities"]}</td>
        <td>{service["version"]}</td>
        <td><Button variant="warning" onClick={() => { this.showServiceJSON({ service }) }}>View JSON</Button></td>
      </tr>
    );
    return (
      <tbody>
        {serviceTable}
      </tbody>
    );
  }

  hostTableNext() {
    if (this.state.hostResults.length > this.state.tableEnd) {
      this.setState({ tableEnd: this.state.tableEnd + 10, tableStart: this.state.tableStart + 10 })
    }
  }

  hostTablePrev() {
    if (this.state.tableStart - 10 >= 0) {
      this.setState({ tableEnd: this.state.tableEnd - 10, tableStart: this.state.tableStart - 10 })
    }
  }

  showServiceJSON(host) {
    alert(host["service"]["JSON"])
  }

  clear() {
    var key = this.state.keys
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
      showMap: true,
    }, function () {
      this.setState({ keys: key })
    })
    var communityDrop = document.getElementById("communitiesdropDown");
    communityDrop.textContent = "Group communities";
    var box = document.getElementsByClassName('schedulerCheckBox');
    for (var i = 0; i < box.length; i++) {
      if (box[i].type === 'checkbox')
        box[i].checked = false;
    }

    var searchBar = document.getElementById("searchBar");
    searchBar.value = "";
    alert("Key needs to be cleared manually")
  }

  getChosenValues(props) {
    return (
      <div>
        <p className="howToBox"><b>Key:&nbsp;</b>{(this.state.chosenKey.length > 0) ? this.state.chosenKey[0].value : ""} </p>
        <p className="howToBox"><b>Search:&nbsp;</b> {this.state.searchTerm}</p>
        <p className="howToBox"><b>Communities:&nbsp;</b>{this.state.selectedGroupCommunity} </p>
        <p className="howToBox"><b>pScheduler:&nbsp;</b>{props.chosenpSchedulers.toString()}</p>
      </div>
    );
  }



  render() {
    return (
      <div>
        <Jumbotron className="head">
          <div className="grid-container">
            <div className="grid-item" id="textBox2">
              <br></br>
              <h5>Chosen values</h5>
              <ChosenBox chosenpSchedulers={this.state.chosenSchedulers} chosenKey={this.state.chosenKey} searchTerm={this.state.searchTerm} selectedGroupCommunity={this.state.selectedGroupCommunity}></ChosenBox>
            </div>
            <div className="grid-item">
              <div className="inlineSearch">
                <Search items={this.state.keys}
                  placeholder="key (optional) : "
                  maxSelected={1}
                  multiple={true}
                  onItemsChanged={this.keySelect.bind(this)} className="searchBarField" id="keySelector" />
                <input type="text" placeholder="Search.." className="searchBar" onChange={this.updateSearch.bind(this)} id="searchBar" />
              </div>
              <div className="dropdownDiv">

                <GroupCommunities communities={this.state.groupCommunities} parentCallBack={this.groupCommunitiesCallbackFunction} />
                <Scheduler pSchedulers={this.state.pSchedulerTests} parentCallBack={this.schedulerCallbackFunction} chosenSchedulers={this.state.chosenSchedulers} />

              </div>
              <div>
                <div className="inlineButtons">
                  <Button variant="warning" onClick={() => { this.searchHost() }}>Submit</Button>
                  <Button variant="danger" onClick={() => { this.clear() }} className="clearButton">Clear</Button>
                </div>
              </div>
            </div>
            <div className="grid-item" id="textbox">
              <br></br>
              <h5>How to use the LS Directory</h5>
              <p className="howToBox"><b>Key:</b> The key signifies the "key" in the key-value schema of the database</p>
              <p className="howToBox"><b>Search:</b> The search is the value needed for the selected key</p>
              <p className="howToBox"><b>Communities:</b> Filter for the group community value</p>
              <p className="howToBox"><b>pScheduler:</b> Filter for the pScheduler tests</p>
            </div>
          </div>

        </Jumbotron>

        <Tab.Container id="informationTabs" defaultActiveKey="first" className="informationTabs">
          <Row>
            <Col sm={2}>
              <Nav variant="pills" className="flex-column">
                <Nav.Item id="hostTab">
                  <Nav.Link eventKey="first">Host Information</Nav.Link>
                </Nav.Item>
                <Nav.Item id="serviceTab">
                  <Nav.Link eventKey="second" disabled={this.state.serviceVisibility} >Service Information</Nav.Link>
                </Nav.Item>
                <Nav.Item id="mapTab">
                  <Nav.Link eventKey="third">Map</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col sm={9}>
              <Tab.Content>
                <Tab.Pane eventKey="first">
                  <div className="prevNextButton">
                    <p className="queryResults" hidden={this.state.hostResults.length === 0}>This query returned {this.state.hostResults.length} results</p>
                    <Button variant="info" onClick={this.hostTablePrev} className="prevButton">Previous</Button>
                    <Button variant="danger" onClick={this.hostTableNext} className="nextButton">Next</Button>
                  </div>

                  <Table striped bordered hover variant="dark">
                    <thead>
                      <tr>
                        <th>Host Name</th>
                        <th>Hardware</th>
                        <th>System Info</th>
                        <th>Toolkit-Version</th>
                        <th>Communities</th>
                        <th>Pscheduler Tests</th>
                        <th>JSON</th>
                      </tr>
                    </thead>
                    <HostTable hostInformation={this.state.hostResults} parentCallBack={this.hostTableCallBackFunction} tableStart={this.state.tableStart} tableEnd={this.state.tableEnd} />
                    {/* <this.getHost hostInformation={this.state.hostResults} /> */}
                  </Table>
                </Tab.Pane>
                <Tab.Pane eventKey="second">
                  <Table striped bordered hover variant="dark" >
                    <thead>
                      <tr>
                        <th>Service Name</th>
                        <th>Address</th>
                        <th>geographic Location</th>
                        <th>Communities</th>
                        <th>Version</th>
                        <th>JSON</th>
                      </tr>
                    </thead>
                    <this.getService serviceInformation={this.state.serviceResults} />
                  </Table>
                </Tab.Pane>
                <Tab.Pane eventKey="third">
                  <div className="map">
                    <Mapper
                      lat={this.state.chosenLat}
                      long={this.state.chosenLong}
                      all={this.state.allCoordinates}
                      hostResults={this.state.hostResults}
                      chooseHostCallback={this.chooseHostFromMap}
                    />
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    );
  }

};

export default App;
