import React, { Component } from 'react';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';

export class MapContainer extends Component {
  render() {
    return (
      <Map google={this.props.google} 
        zoom={4}
        style={{width: '80%', height: '80%', position: 'relative'}}>
        <Marker
            name={'Test Loc 1'}
            position={{lat: 33.7490, lng: -84.3880}} />
      </Map>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: ('AIzaSyAxq_keYPnnngvRwzoLY5-UtvHGZX1JgxE')
})(MapContainer)