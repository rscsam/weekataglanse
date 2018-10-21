import React, { Component } from 'react';
import { Scene } from 'react-arcgis';

import SiteFeature from './siteFeature';
import background from './images/background.jpg';

import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';

import 'rc-slider/assets/index.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {currentTime: "Monday 8:00am", time: 8};
  }

  render() {
    return (
      <div style={{backgroundImage: `url(${background})`, top:'0', bottom:'0', left:'0', right:'0', position: 'absolute'}}>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{ width: 800, marginTop: 40, marginBottom: 10, marginLeft: 20}}>
        <p style={{color: "#FFFFFF", marginLeft: 80}}>Select the time of week you want to predict</p>
          <Slider min={0} max={167} defaultValue={9} handle={this.handleSliderChange.bind(this)} />
          <p style={{color: "#FFFFFF", marginLeft: 20}}>{this.state.currentTime}</p>
        </div>
        <img src={require('./images/week2.png')} align="right"/>
      </div>
        
          <Scene 
            style={{ width: '100%', height: '80%' }}
            mapProperties={{ basemap: 'streets' }}
            viewProperties={{
              center: [-84.12321, 32.772356],
              zoom: 8
            }}
            onLoad={this.handleMapLoad.bind(this)}
            onFail={this.handleFail.bind(this)}>
            <SiteFeature 
              time={this.state.time}/>
          </Scene>
      </div>
    );
  }

  handleSliderChange(props) {
    const { value, dragging, index, ...restProps } = props;
    const hour = value % 24;
    const day =  Math.floor(value/24);
    var dayString = "Monday";
    if (day == 1) {
      dayString = "Tuesday";
    } else if (day == 2) {
      dayString = "Wednesday";
    } else if (day == 3) {
      dayString = "Thursday";
    } else if (day == 4) {
      dayString = "Friday";
    } else if (day == 5) {
      dayString = "Saturday";
    } else if (day == 6) {
      dayString = "Sunday";
    }
    var hourString = hour + ":00am"
    if (hour == 0) {
      hourString = "12:00am"
    } else if (hour == 12) {
      hourString = hour + ":00pm"
    } else if (hour > 12) {
      hourString = (hour - 12) + ":00pm"
    }
    const display = dayString + " " + hourString;
    if (display != this.state.currentTime) {
      if (this.state.view != null) {
        this.state.view.environment.lighting.date = new Date("March 2, 2015 " + hour + ":00:00");
      }
      this.setState({currentTime: display, time: 24 * day + hour});
    }
    return (
      <Tooltip
        prefixCls="rc-slider-tooltip"
        overlay={display}
        visible={dragging}
        placement="top"
        key={index}
      >
        <Slider.Handle value={value} {...restProps} />
      </Tooltip>
    );
  }

  handleMapLoad(map, view) {
    this.setState({ map: map, view: view });
  }

  handleFail(e) {
    console.error(e);
    this.setState({ status: 'failed' });
  }
}

export default App;
