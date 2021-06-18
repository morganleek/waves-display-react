// Charts - React.js
import React, { useState, Component, Fragment } from "react";
import { render } from "react-dom";
import { Charts } from './chart';
import { Map } from './map';

const classNames = require('classnames');

// Map Position
// const center = {
//   lat: ( typeof( wad ) != "undefined" && 'googleLat' in wad ) ? parseFloat( wad.googleLat ) : 0.0,
// 	lng: ( typeof( wad ) != "undefined" && 'googleLng' in wad ) ? parseFloat( wad.googleLng ) : 0.0
// };
// const zoom = ( window.innerWidth < 1200 ) ? 4 : 5;

// function App() {
//   return <>
//     <Map center={ center } zoom={ zoom } /><Charts />
//   </>;
// }
// export function helloWorld() {
//   console.log('hello');
// }

export class App extends Component {
	constructor( props ) {
    super( props );

    this.state = {
      center: {
        lat: ( typeof( wad ) != "undefined" && 'googleLat' in wad ) ? parseFloat( wad.googleLat ) : 0.0,
        lng: ( typeof( wad ) != "undefined" && 'googleLng' in wad ) ? parseFloat( wad.googleLng ) : 0.0
      },
      zoom: ( window.innerWidth < 1200 ) ? 4 : 5
    }

    // Bind this state so buttons state doesn't rise up
    this.updateMapCenter = this.updateMapCenter.bind( this );
    this.updateMapZoom = this.updateMapZoom.bind( this );
  }

  updateMapCenter( newCenter ) {
    this.setState( { center: newCenter } );
  }
  
  updateMapZoom( newZoom ) {
    this.setState( { zoom: newZoom } );
  }

  render() {
    const { center, zoom } = this.state;
    return <>
      <Map center={ center } zoom={ zoom } />
      <Charts updateCenter={ this.updateMapCenter } 
              updateZoom={ this.updateMapZoom } />
    </>
  }
}

document.addEventListener("DOMContentLoaded", function(event) { 
  if( document.getElementsByClassName('page-template-wave-display-react').length ) {
    render( <App />, document.getElementById( "root" ) );
  }
} );