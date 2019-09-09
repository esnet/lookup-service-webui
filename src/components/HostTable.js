import React from "react";
import { Button} from 'react-bootstrap'


export default class HostTable extends React.PureComponent {

    getHost(props) {    
        const hostInformation = props.hostInformation;
        const hostTable = hostInformation.slice(props.tableStart, props.tableEnd).map((host) =>
          <tr key={host["Host Name"]} >
            <td onClick={() => { props.chooseHost(host["URI"], host["latitude"], host["longitude"], host["interfaceAddress"], props.parentCallBack)}}>{host["Host Name"]}</td>
            <td onClick={() => { props.chooseHost(host["URI"], host["latitude"], host["longitude"], host["interfaceAddress"],props.parentCallBack) }}>{host["Hardware"]}</td>
            <td onClick={() => { props.chooseHost(host["URI"], host["latitude"], host["longitude"], host["interfaceAddress"],props.parentCallBack) }}>{host["System Info"]}</td>
            <td onClick={() => { props.chooseHost(host["URI"], host["latitude"], host["longitude"], host["interfaceAddress"],props.parentCallBack) }}>{host["Toolkit Version"]}</td>
            <td onClick={() => { props.chooseHost(host["URI"], host["latitude"], host["longitude"], host["interfaceAddress"],props.parentCallBack) }}>{host["Communities"]}</td>
            <td onClick={() => { props.chooseHost(host["URI"], host["latitude"], host["longitude"], host["interfaceAddress"],props.parentCallBack) }}>{host["pSchedulers"]}</td>
            <td><Button variant="warning" onClick={() => { props.showHostJSON({ host }) }}>View JSON</Button></td>
          </tr>
        );
        return (
          <tbody>
            {hostTable}
          </tbody>
        );
      }

      showHostJSON(host) {
        alert(host["host"]["JSON"])
      }

      chooseHost(hostName, latitude, longitude, address, parentCallBack) {
        parentCallBack(hostName, latitude, longitude, address);
      }

    render() {
        return (
            <this.getHost hostInformation={this.props.hostInformation} parentCallBack={this.props.parentCallBack} tableStart = {this.props.tableStart} tableEnd= {this.props.tableEnd} chooseHost = {this.chooseHost} showHostJSON={this.showHostJSON}/>
        );
    }
}
