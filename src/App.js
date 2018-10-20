import React, { Component } from 'react';
import logo from './logo.svg';
import MapContainer from './MapWrapper'
import './App.css';
import './arcgis.css'
import { Map } from 'react-arcgis';

import background from './images/background.jpg';

class App extends Component {
  render() {
    return (
      <div style={{backgroundImage: `url(${background})`, top:'0', bottom:'0', left:'0', right:'0', position: 'absolute'}}>
          <h1>Map</h1>
          <Map />
      </div>
    );
  }
}

export default App;
