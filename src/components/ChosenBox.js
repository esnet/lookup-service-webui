import React from "react";


export default class ChosenBox extends React.Component {

  constructor(props) {
    super();
    this.state = {
      
    }
    
  }

  render() {
    return (
      <div>
        <p className="howToBox"><b>Key:&nbsp;</b>{(this.props.chosenKey.length > 0) ? this.props.chosenKey[0].value : ""} </p>
        <p className="howToBox"><b>Search:&nbsp;</b> {this.props.searchTerm}</p>
        <p className="howToBox"><b>Communities:&nbsp;</b>{this.props.selectedGroupCommunity} </p>
        <p className="howToBox"><b>pScheduler:&nbsp;</b>{this.props.chosenpSchedulers.toString()}</p>
      </div>
    );
  }
}
