import React, { Component } from "react";
import { GoogleMap, LoadScript, MarkerClusterer, Marker, Polyline } from '@react-google-maps/api';

import { getBuoys, getDriftingBuoys } from '../api/buoys';
import { wadRawDataToChartData } from '../api/chart';

import mapStyles from './map-style';

const containerStyle = {
  width: '100%',
  height: '100%'
};

export class Map extends Component {
	constructor( props ) {
    super( props );
    
    this.state = {
			ref: null,
			markers: [],
			polylines: []
    }
  }

	// Init
	componentDidMount() {
		// Get buoys
    getBuoys().then( json => {
			if( json.length > 0 ) {
				json.forEach( ( element, index ) => {
					const marker = {
						label: element.web_display_name,
						lat: parseFloat( element.lat ),
						lng: parseFloat( element.lng )
					};
					this.setState( { markers: [...this.state.markers, marker] } );
				} );
			}
    } );

		// Get drifting
		getDriftingBuoys().then( json => {
			if( json.length > 0 ) {
				// let driftingMap = json.map( ( row, index ) => {
				json.forEach( ( element, index ) => {
					const processed = wadRawDataToChartData( element.data );
					
					let path = [];
					let times = [];
					
					for( let j = 0; j < processed.length; j++ ) {
						if( !isNaN( parseFloat( processed[j]["Latitude (deg)"] ) ) && !isNaN( parseFloat( processed[j]["Longitude (deg) "] ) ) ) {
							path.push( { lat: parseFloat( processed[j]["Latitude (deg)"] ), lng: parseFloat( processed[j]["Longitude (deg) "] ) } );
							times.push( parseInt( processed[j]['Time (UNIX/UTC)'] ) );
						}
					}

					const polyline = <Polyline key={ this.state.polylines.length } options={ {
						path: path,
						geodesic: true,
						strokeColor: "#FF0000",
						strokeOpacity: 1.0,
						strokeWeight: 2,
					} } />;
					this.setState( { polylines: [...this.state.polylines, polyline] } );
				} );

				// See 'waves-display' for labels
			}
		} );
  }

	// Marker click event
	onMarkerClick = ( marker ) => {
		const { ref } = this.state;
		if( ref ) {
			const newCenter = { 
				lat: parseFloat( marker.latLng.lat() ), 
				lng: parseFloat( marker.latLng.lng() ) 
			};
			console.log( ref.getZoom() );
			
			// Pan to and zoom
			ref.panTo( newCenter );
			ref.setZoom( 8 );
			// Offset when map is full width
			// ref.panBy( window.innerWidth / 4, 0 );
		}
	}

	onLoad = ( ref ) => {
		this.setState( { ref: ref } );
	}

  render() {
		const { center, zoom } = this.props;
		const { markers, polylines } = this.state;

		let cluster;
		if( markers ) {
			cluster = <MarkerClusterer gridSize={ 30 } maxZoom={ 7 }>
				{ ( clusterer ) => 
					markers.map( ( marker, i ) => (
						<Marker position={ { lat: marker.lat, lng: marker.lng } } label={ marker.label } key={ i } onClick={ this.onMarkerClick } clusterer={ clusterer } />
					) )
				}
			</MarkerClusterer>
		}

		let mapRender = <h2>Loading&hellip;</h2>;
		// Load when markers, zoom and center are defined
		if( center && zoom && markers ) {
			mapRender = <LoadScript
				googleMapsApiKey={ ( typeof( wad ) != "undefined" ) ? wad.googleApiKey : '' }
			>
				<GoogleMap
					mapContainerStyle={ containerStyle }
					center={ center }
					zoom={ zoom }
					options={{ styles: mapStyles }}
					onLoad={ this.onLoad }
				>
					<>{ cluster }{ polylines }</>
				</GoogleMap>
			</LoadScript>;
		}

    return (
			<div className="maps">
				{ mapRender }
			</div>
    )
  }
}
