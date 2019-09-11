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
import { async } from 'q';

class App extends Component {

  constructor() {
    super();
    this.state = {
      groupCommunities: [], // initial list of group communities
      selectedGroupCommunity: "", // selected group community
      pSchedulerTests: [], // initial list of pscheduler tests
      chosenSchedulers: [], // chosen pscheduler values
      keys: [], // initial set of keys for autofill search
      chosenKey: "", // chosen key
      searchTerm: "", // typed in search term
      tableStart: 0, // start of table index
      tableEnd: 10, // end of table index
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

  /**
   * Loading initial data from api
   */
  componentDidMount() {
    // inital call to get group communities for dropdown
    fetch(serverURL + '/groupCommunities', { headers: { 'Access-Control-Allow-Origin': hostURL } })
      .then(res => res.json())
      .then((data) => {
        this.setState({ groupCommunities: data })
      })
      .catch(console.log)

    // gets all keys for autofill search
    fetch(serverURL + '/getAllKeys', { headers: { 'Access-Control-Allow-Origin': hostURL } })
      .then(res => res.json())
      .then((data) => {
        data = data.map(value => ({ id: 1, value: value }))
        this.setState({ keys: data })
      })
      .catch(console.log)

    // get pschedulers for dropdown
    fetch(serverURL + '/pSchedulerTests', { headers: { 'Access-Control-Allow-Origin': hostURL } })
      .then(res => res.json())
      .then((data) => {
        this.setState({ pSchedulerTests: data })
      })
      .catch(console.log)

    // gets coordinates to initialize map
    fetch(serverURL + '/getCoordinates', { headers: { 'Access-Control-Allow-Origin': hostURL } })
      .then(res => res.json())
      .then((data) => {
        this.setState({ allCoordinates: data })
      })
      .catch(console.log)
  }

  // callback for selcting community
  groupCommunitiesCallbackFunction = (selected) => {
    this.setState({ selectedGroupCommunity: selected })
  }

  // callback for choosing pScheduler
  schedulerCallbackFunction = (selected) => {
    this.setState({ chosenSchedulers: selected })
  }

  // update search value on change in search box
  updateSearch() {
    this.setState({ searchTerm: document.getElementById("searchBar").value })
  }

  // update chosen key on selecting key from dropdown
  keySelect(items) {
    if (items.length !== 0) {
      this.setState({ chosenKey: items });
    } else {
      this.setState({ chosenKey: "" });
    }
    var selector = document.getElementById("search-input");
    selector.value = "";
  }

  // on search button click search api
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

  // on click of host in host table
  hostTableCallBackFunction = (hostName, latitude, longitude, address) => {
    this.setState({ serviceVisibility: false });
    this.setState({ chosenHost: hostName, chosenLat: latitude, chosenLong: longitude, serviceAddress: address }, 
      function () { 
        this.searchService("all") // search for services with all types of servers
      })
  }

  // on click of host using map
  chooseHostFromMap(hostName, type) {
    this.setState({ serviceVisibility: false });
    this.setState({ chosenHost: hostName }, function () { this.searchService(type) })
  }

  // search service on choosing a host
  searchService(type) {
    fetch(serverURL + '/searchService?hosts=' + this.state.chosenHost + "&type=" + type, { headers: { 'Access-Control-Allow-Origin': hostURL } })
      .then(res => res.json())
      .then((data) => {
        this.setState({ serviceResults: data })
      })
      .catch(console.log)
    document.getElementById("informationTabs-tab-second").click();
  }

  // render service table
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

  // clicking next on host table
  hostTableNext() {
    if (this.state.hostResults.length > this.state.tableEnd) {
      this.setState({ tableEnd: this.state.tableEnd + 10, tableStart: this.state.tableStart + 10 })
    }
  }

  // clicking previous on host table
  hostTablePrev() {
    if (this.state.tableStart - 10 >= 0) {
      this.setState({ tableEnd: this.state.tableEnd - 10, tableStart: this.state.tableStart - 10 })
    }
  }

  // show json popup for service table
  showServiceJSON(host) {
    alert(host["service"]["JSON"])
  }

  // clear all values on clicking clear button
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

  // chosen values box
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
            {/* box to show chosen items */}
            <div className="grid-item" id="textBox2">
              <br></br>
              <h5>Chosen values</h5>
              <ChosenBox 
                chosenpSchedulers={this.state.chosenSchedulers} 
                chosenKey={this.state.chosenKey} 
                searchTerm={this.state.searchTerm} 
                selectedGroupCommunity={this.state.selectedGroupCommunity}>
              </ChosenBox>
            </div>
            <div className="grid-item">
              <div className="inlineSearch">
                {/* search box for keys */}
                <Search 
                  items={this.state.keys}
                  placeholder="key (optional) : "
                  maxSelected={1}
                  multiple={true}
                  onItemsChanged={this.keySelect.bind(this)}
                  className="searchBarField"
                  id="keySelector" />
                  {/* Search box for values */}
                <input
                  type="text" 
                  placeholder="Search.." 
                  className="searchBar"
                  onChange={this.updateSearch.bind(this)}
                  id="searchBar" />
              </div>
              <div className="dropdownDiv">
                {/* Group communities dropdown */}
                <GroupCommunities
                  communities={this.state.groupCommunities} 
                  parentCallBack={this.groupCommunitiesCallbackFunction} />
                {/* Pscheduler dropdown */}
                <Scheduler
                  pSchedulers={this.state.pSchedulerTests}
                  parentCallBack={this.schedulerCallbackFunction}
                  chosenSchedulers={this.state.chosenSchedulers} />

              </div>
              <div>
                <div className="inlineButtons">
                  {/* Button to submit search */}
                  <Button variant="warning" onClick={() => { this.searchHost() }}>Submit</Button>
                   {/* Button to clear all fields */}
                  <Button variant="danger" onClick={() => { this.clear() }} className="clearButton">Clear</Button>
                </div>
              </div>
            </div>
            <div className="grid-item" id="textbox">
              {/* How to use box */}
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
            {/* Left sidebar */}
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
            {/* Tables and Map */}
            <Col sm={9}>
              <Tab.Content>
                {/* Host table */}
                <Tab.Pane eventKey="first">
                  <div className="prevNextButton">
                    <p 
                      className="queryResults"
                      hidden={this.state.hostResults.length === 0}>
                        This query returned {this.state.hostResults.length} results
                    </p>
                    {/* previous button */}
                    <Button
                      variant="info"
                      onClick={this.hostTablePrev}
                      className="prevButton">
                        Previous
                    </Button>
                    {/* next button */}
                    <Button
                      variant="danger"
                      onClick={this.hostTableNext}
                      className="nextButton">
                        Next
                    </Button>
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
                    {/* Render host table */}
                    <HostTable 
                      hostInformation={this.state.hostResults}
                      parentCallBack={this.hostTableCallBackFunction}
                      tableStart={this.state.tableStart}
                      tableEnd={this.state.tableEnd} />
                  </Table>
                </Tab.Pane>
                {/* Service table */}
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
                    {/* Render service table */}
                    <this.getService serviceInformation={this.state.serviceResults} />
                  </Table>
                </Tab.Pane>
                 {/* Map */}
                <Tab.Pane eventKey="third">
                  <div className="map">
                    {/* Rendering the map */}
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
