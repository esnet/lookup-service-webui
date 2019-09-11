import React from "react";
import { Marker } from "react-google-maps";
// import StethoscopeIcon from "../stethoscopeIcon.png";
import dot from "../image/dot.png"
import { InfoWindow } from 'react-google-maps'
import { Table } from 'react-bootstrap'
import { serverURL, hostURL } from "./config/config"



export default class Mark extends React.Component {

  constructor(props) {
    super();
    this.state = {
      isOpen: false,
      server: [],
      chosenHost: ""
    }
    this.onToggle = this.onToggle.bind(this);
    this.getServiceType = this.getServiceType.bind(this);
  }

  onToggle = () => {
    this.setState({ isOpen: !this.state.isOpen })
  }

  getServiceType(hostName) {
    if (this.state.server.length === 0) {
      fetch(serverURL + '/getTypeOfServiceHost?hosts=' + this.props.hostUri, { headers: { 'Access-Control-Allow-Origin': hostURL } })
        .then(res => res.json())
        .then((data) => {
          this.setState({ server: data })
        })
        .catch(console.log)
    }
    const serverTable = hostName.hostName.map((server) =>
      <tr key={Math.random()}>
        <td onClick={() => { this.props.callback(this.props.hostUri, server) }}>{server}</td>
      </tr>);
    return serverTable;
  }

  chooseHost(hostName, server) {
    fetch(serverURL + '/searchService?hosts=' + hostName + "&type=" + server, { headers: { 'Access-Control-Allow-Origin': hostURL } })
      .then(res => res.json())
      .then((data) => {
        this.setState({ serviceResults: data })
      })
      .catch(console.log)
    document.getElementById("informationTabs-tab-second").click();
  }

  render() {
    return (
      <Marker
        position={this.props.location}
        icon={dot}
        onClick={this.onToggle}
      >
        {this.state.isOpen &&
          <InfoWindow onCloseClick={this.onToggle}>
            <div><b>{this.props.host}</b>
              <br></br>
              <br></br>

              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Server Type</th>
                  </tr>
                </thead>
                <tbody>
                  <this.getServiceType hostName={this.state.server} ></this.getServiceType>
                </tbody>
              </Table>
            </div>

          </InfoWindow>}
      </Marker>
    );
  }
}
