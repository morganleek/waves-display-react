import React, { Component } from "react";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { getBuoys } from './fetch';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: ( typeof( wad ) != "undefined" && 'googleLat' in wad ) ? parseFloat( wad.googleLat ) : 0.0,
	lng: ( typeof( wad ) != "undefined" && 'googleLng' in wad ) ? parseFloat( wad.googleLng ) : 0.0
};

const zoom = ( window.innerWidth < 1200 ) ? 4 : 5;

export class Map extends Component {
	constructor( props ) {
    super( props );
    
    this.state = {
      buoys: [],
    }
  }

	componentDidMount() {
    getBuoys().then( json => {
      this.setState( {
        buoys: json
      } );
    } );
  }

  render() {
		const { buoys } = this.state;
    let markers;

    if( buoys.length > 0 ) {
      // = <ChartsLoop buoyData={ buoys } />
			markers = buoys.map( ( row, index ) => {    
				const pin = {
					lat: parseFloat( row.lat ),
					lng: parseFloat( row.lng )
				}
				return <Marker position={ pin } label={ row.web_display_name } key={ index } />
			} );
    }

    return (
			<div className="maps">
				<LoadScript
					googleMapsApiKey={ ( typeof( wad ) != "undefined" ) ? wad.googleApiKey : '' }
				>
					<GoogleMap
						mapContainerStyle={ containerStyle }
						center={ center }
						zoom={ zoom }
					>
						<>{ markers }</>
					</GoogleMap>
				</LoadScript>
			</div>
    )
  }
}