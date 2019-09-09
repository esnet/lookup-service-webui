import React from "react";
import {Dropdown} from 'react-bootstrap'


export default class Schedulers extends React.PureComponent {


    getPschedulers(props) {    
        const pSchedulers = props.pSchedulers;
        const listSchedulers = pSchedulers.map((scheduler) =>
          <label key={scheduler}>
            <input type="checkbox" className="schedulerCheckBox" id={scheduler} onClick={() => {
              var outer = { scheduler }.scheduler
              const contains = props.chosenSchedulers.includes(outer);
              if (contains) {
                var remainingItems = props.chosenSchedulers.filter(function (scheduler) {
                  return scheduler !== outer
                });
                props.parentCallBack(remainingItems)
              } else {
                props.chosenSchedulers.push(outer)
                props.parentCallBack(props.chosenSchedulers);
              }
    
            }}>
            </input>
            {scheduler}
          </label>
        );
        return (
          <Dropdown.Menu className="scrollBox">
            {listSchedulers}
          </Dropdown.Menu>
        );
      }

    render() {
        return (
            <Dropdown className="dropdownDiv">
            <Dropdown.Toggle variant="dark" id="dropdown-basic">
              pScheduler Tests
      </Dropdown.Toggle>

            <this.getPschedulers pSchedulers={this.props.pSchedulers} parentCallBack={this.props.parentCallBack} chosenSchedulers={this.props.chosenSchedulers}/>

          </Dropdown>
        );
    }
}
