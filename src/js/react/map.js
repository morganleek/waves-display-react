import React, { Component } from "react";
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { getBuoys, getDriftingBuoys } from '../api/buoys';
import { wadRawDataToChartData } from '../chart';

import mapStyles from './map-style';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Markers
// Drifiting markers
// 

export class Map extends Component {
	constructor( props ) {
    super( props );
    
    this.state = {
			center: { lat: 0.0, lng: 0.0 }, 
			zoom: ( window.innerWidth < 1200 ) ? 4 : 5,
			ref: null,
			markers: []
			// drifting: null
    }
  }

	// Init
	componentDidMount() {
		const { center } = this.state;

		// Get centre
		if( ( typeof( wad ) != "undefined" && 'googleLat' in wad ) &&
				( typeof( wad ) != "undefined" && 'googleLng' in wad ) ) {
			this.setState( { 
				center: { 
					lat: parseFloat( wad.googleLat ), 
					lng: parseFloat( wad.googleLng ) 
				} 
			} );
		}

		// Get buoys
    getBuoys().then( json => {
			if( json.length > 0 ) {
				json.forEach( ( element, index ) => {
					const pin = {
						lat: parseFloat( element.lat ),
						lng: parseFloat( element.lng )
					}
					const marker = <Marker position={ pin } label={ element.web_display_name } key={ this.state.markers.length } onClick={ this.onMarkerClick } />;
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

					const polyline = <Polyline key={ this.state.markers.length } options={ {
						path: path,
						geodesic: true,
						strokeColor: "#FF0000",
						strokeOpacity: 1.0,
						strokeWeight: 2,
					} } />;
					this.setState( { markers: [...this.state.markers, polyline] } );
				} );
				// // Set as drifting
				// this.setState( { drifting: driftingMap } );
					
				// 	const MarkerWithLabel = require( 'markerwithlabel' )( window.myGoogleMaps );
					
				// 	let halfDays = [];
				// 	// path = path.reverse();
		
				// 	const isVisible = ( window.myMap.getZoom() >= 8 );
		
				// 	if( typeof( window.driftingPoints ) == "undefined" ) {
				// 		window.driftingPoints = [];
				// 	}
		
				// 	for( let n = 0; n < path.length; n += 24 ) {
				// 		const last = path.pop();
				// 		const lastTime = times.pop();
				// 		const labelDate = new Date( times[n] * 1000).toDateString();
				// 		const labelTime = new Date( times[n] * 1000).toTimeString().replace(/\s\(.*/, '');
		
				// 		var point = new MarkerWithLabel({
				// 			position: path[n],
				// 			map: window.myMap,
				// 			title: ( n === 0) ? '' : labelDate + '<br>' + labelTime,
				// 			labelContent: ( n === 0) ? '' : labelDate + '<br>' + labelTime,
				// 			visible: isVisible,
				// 			labelStyle: { opacity: 1 },
				// 			icon: 'https://maps.gstatic.com/mapfiles/transparent.png' // wad.plugin + 'dist/images/invisble-marker.png'
				// 		});
					
		
				// 		if( n === 0 ) {
				// 			// Move marker to align with start
				// 			if( typeof( window.myMapMarkers ) != undefined ) {
				// 				for( const[key, value] of window.myMapMarkers.entries() ) {
				// 					if( key == buoyId ) { 
				// 						value.setPosition( path[n] )
				// 					}
				// 				}
				// 			}
				// 		}
		
				// 		window.driftingPoints.push( point );
				// 	}
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
			// Pan to and zoom
			ref.panTo( newCenter );
			ref.setZoom( 8 );
			// Offset because of bad design
			ref.panBy( window.innerWidth / 4, 0 );
			// Animate
			console.log( this );
			// if( marker.getAnimation() > 0 ) {
			// 	marker.setAnimation( undefined );
			// }
			// marker.setAnimation( window.myGoogleMaps.Animation.BOUNCE ); 
			// window.setTimeout( () => { 
			// 	marker.setAnimation( undefined ); 
			// }, 2100 );
		}
	}

	onLoad = ( ref ) => {
		this.setState( { ref: ref } );
	}

  render() {
		const { center, zoom, markers } = this.state;

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
					<>{ markers }</>
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


// var point = new MarkerWithLabel({
// 	position: {
// 		lat: parseFloat(buoys[i].lat), 
// 		lng: parseFloat(buoys[i].lng)
// 	},
// 	map: window.myMap,
// 	title: buoys[i].label,
// 	labelContent: buoys[i].web_display_name,
// 	labelAnchor: new googleMaps.Point(0, -2),
// 	labelClass: "buoy-" + buoys[i].id,
// 	labelStyle: { opacity: 0.9 }
// });

