import React from "react";
import { Button, Dropdown} from 'react-bootstrap'
import '../styles/App.css';


export default class GroupCommunities extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    getCommunities(props) {
        const communities = props.communities;
        const listCommunities = communities.map((community) =>
          <Dropdown.Item id={community} key={community} as={Button}
            onClick={() => {
              var current = document.getElementById("communitiesdropDown");
              current.textContent = "Communities: " + { community }.community; // changing dropdown name
              props.parentCallBack({community}.community)
            }}>
            {community}
    
          </Dropdown.Item>
        );
        return (
          <Dropdown.Menu className="scrollBox">{listCommunities}</Dropdown.Menu>
        );
      }

    render() {
        return (
            <Dropdown className="dropdownDiv">
                <Dropdown.Toggle variant="dark" id="communitiesdropDown" className="communitiesdropDown">
                    Group communities
                 </Dropdown.Toggle>
                <this.getCommunities communities={this.props.communities} parentCallBack ={this.props.parentCallBack} />
            </Dropdown>
        );
    }
}
