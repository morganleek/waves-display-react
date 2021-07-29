import React, { Component } from "react";
import { GoogleMap, LoadScript, MarkerClusterer, Marker, Polyline, Polygon } from '@react-google-maps/api';
// import { GoogleMap, useLoadScript, MarkerClusterer, Marker, Polyline } from '@react-google-maps/api';

import { getBuoys, getDriftingBuoys } from '../api/buoys';
import { wadRawDataToChartData } from '../api/chart';
import { ChartDownloadModal } from "../chart/ChartDownloadModal";

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
			polylines: [],
			polylineMarkers: {},
			minLat: 90,
			maxLat: -90,
			minLng: 180,
			maxLng: -180,
			boundsSet: false,
			initBoundsSet: false,
			icon: '',
			labelIcon: '',
			decommissionedIcon: '',
			label: '',
			focus: null,
			historic: false,
			buoyDownloadText: '',
			downloadPath: '',
			currentZoom: 0
    }

		this.handleModalClose = this.handleModalClose.bind( this );
    this.handleDownloadClick = this.handleDownloadClick.bind( this );
  }

	// Init
	componentDidMount() {
		// Set zoom
		this.setState( { currentZoom: this.props.zoom } );
		// Get buoys
    getBuoys().then( json => {
			if( json.length > 0 ) {
				json.forEach( ( element, index ) => {
					if( parseInt( element.drifting ) == 0 ) {
						let marker = {
							buoyId: element.id,
							label: element.web_display_name,
							lat: parseFloat( element.lat ),
							lng: parseFloat( element.lng ),
							isEnabled: parseInt( element.is_enabled ),
							buoyDownloadText: element.download_text,
							downloadPath: '',
						};

						this.setState( { markers: [...this.state.markers, marker] } );
					}
				} );
			}
			// Bounds
			this.state.markers.forEach( ( buoy, i ) => {
				this.setState( { minLat : ( this.state.minLat < buoy.lat ) ? this.state.minLat : buoy.lat } );
				this.setState( { maxLat : ( this.state.maxLat > buoy.lat ) ? this.state.maxLat : buoy.lat } );
				this.setState( { minLng : ( this.state.minLng < buoy.lng ) ? this.state.minLng : buoy.lng } );
				this.setState( { maxLng : ( this.state.maxLng > buoy.lng ) ? this.state.maxLng : buoy.lng } );
			} );
			this.setState( { boundsSet: true } );
			this.setBounds( );
    } );

		// Get drifting
		getDriftingBuoys().then( json => {
			if( json.length > 0 ) {
				// let driftingMap = json.map( ( row, index ) => {
				json.forEach( ( element, index ) => {

					const processed = wadRawDataToChartData( element.data );
					
					let path = [];
					let pathTimes = [];
					
					for( let j = 0; j < processed.length; j++ ) {
						if( !isNaN( parseFloat( processed[j]["Latitude (deg)"] ) ) && !isNaN( parseFloat( processed[j]["Longitude (deg) "] ) ) ) {
							path.push( { lat: parseFloat( processed[j]["Latitude (deg)"] ), lng: parseFloat( processed[j]["Longitude (deg) "] ) } );
							pathTimes.push( {
								time: parseInt( processed[j]['Time (UNIX/UTC)'] ),
								lat: parseFloat( processed[j]["Latitude (deg)"] ), 
								lng: parseFloat( processed[j]["Longitude (deg) "] )
							} );
						}
					}

					if( path.length > 0 ) {
						const buoyId = parseInt( processed[0]["buoy_id"] );
						const polyline = <MapPolyline 
							buoyId={ buoyId } 
							key={ this.state.polylines.length } 
							polylineFocus={ this.onMapPolylineClick }
							pathTimes={ pathTimes }
							options={ {
								path: path,
								geodesic: true,
								strokeColor: "#FF0000",
								strokeOpacity: 1.0,
								strokeWeight: 2,
								clickable: true
							} 
						} />;
						this.setState( { polylines: [...this.state.polylines, polyline] } );

						// Add Marker
						let marker = {
							buoyId: element.id,
							label: element.web_display_name,
							lat: path[0].lat, // First path lat/lng
							lng: path[0].lng, // First path lat/lng
							isEnabled: parseInt( element.is_enabled )
						};
						
						this.setState( { markers: [...this.state.markers, marker] } );

						// Polyline markers 
						this.initPolylineMarkers( { buoyId: element.id, pathTimes: pathTimes } );
					}
				} );
			}
		} );
  }
	
	initPolylineMarkers = ( polyline ) => {
		const { ref, polylineMarkers, labelIcon } = this.state;
		const { buoyId, pathTimes } = polyline;

		if( ref ) {
			if( polylineMarkers[buoyId] != undefined ) {
				// Remove
				let newPolylineMarkers = Object.assign( {}, polylineMarkers );
				delete( newPolylineMarkers[buoyId] );
				this.setState( { polylineMarkers: newPolylineMarkers } );
			}
			else {
				// Setup empty array
				const newMarkers = [];
				
				// Starting day
				const startDate = new Date( pathTimes[0].time * 1000 )
				let currentDay = startDate.getDate();
				// Fetch first point of every day except the first
				for( let n = 0; n < pathTimes.length; n++ ) { 
					const pathDate = new Date( pathTimes[n].time * 1000 );
					if( currentDay != pathDate.getDate() ) {
						// Friend date format
						currentDay = pathDate.getDate();
						const day = pathDate.getDate().toString().padStart( 2, "0" );
						const month = pathDate.getMonth().toString().padStart( 2, "0" );
						let label = day + '/' + month;
						// Add year for first entry
						if( newMarkers.length == 0 ) {
							label += "/" + pathDate.getFullYear();
						}
						
						// Add to markers
						const marker = <Marker 
							position={ { lat: pathTimes[n].lat, lng: pathTimes[n].lng } } 
							icon={ labelIcon } 
							label={ { text: label, fontSize: '11px' } } 
							key={ n + 1000 } 
							clickable={ false }
						/>
						newMarkers.push( marker );
					}
				}

				const updateMarkers = Object.assign( {}, polylineMarkers );
				updateMarkers[buoyId] = newMarkers;

				this.setState( { polylineMarkers: updateMarkers } ); 
			}
		}
	}

	onMapPolylineClick = ( polyline ) => {
		this.initPolylineMarkers( polyline );
	}

	onMapMarkerClick = ( marker ) => {
		const { ref } = this.state;
		if( ref ) {
			const newCenter = { 
				lat: parseFloat( marker.position.lat ), 
				lng: parseFloat( marker.position.lng ) 
			};
			
			// Pan to and zoom
			ref.panTo( newCenter );
			ref.setZoom( 8 );

			// Update Chart list position
			this.props.updateFocus( marker.buoyId );
		}
	}

	onMapDecommissionedMarkerClick = ( marker ) => {
		const buoyId = marker.buoyId;
		const end = Date.now() / 1000;
		const path = "?action=waf_rest_list_buoy_datapoints_csv&id=" + buoyId + "&start=0&end=" + end;
		
		this.setState( { downloadPath: wad.ajax + path, buoyDownloadText: marker.buoyDownloadText });
	}

	onLoad = ( ref ) => {
		const icon = {
			url: wad.plugin + "dist/images/marker@2x.png",
			labelOrigin: new window.google.maps.Point(0, 24),
			scaledSize: new window.google.maps.Size(14,14),
			anchor: new window.google.maps.Point(7,7)
		};

		const decommissionedIcon = {
			url: wad.plugin + "dist/images/marker-decom@2x.png",
			labelOrigin: new window.google.maps.Point(0, 24),
			scaledSize: new window.google.maps.Size(14,14),
			anchor: new window.google.maps.Point(7,7)
		};

		const labelIcon = {
			url: wad.plugin + "dist/images/label-marker@2x.png",
			labelOrigin: new window.google.maps.Point(0, 20),
			scaledSize: new window.google.maps.Size(8,8),
			anchor: new window.google.maps.Point(4,4)
		}

		this.setState( { icon: icon, decommissionedIcon: decommissionedIcon, labelIcon: labelIcon, ref: ref } );
	}
	// onLoad = () => React.useCallback( function callback( map ) {
  //   // const bounds = new window.google.maps.LatLngBounds();
  //   // map.fitBounds(bounds);
  //   // setMap(map)
	// 	this.setState( { ref: map } );
  // }, [] )

	onBoundsChanged = ( ) => {
		this.setBounds( );
	}

	onZoomChanged = ( ) => {
		const { ref } = this.state;
		if( ref ) {
			this.setState( { currentZoom: ref.getZoom() } );
		}
	}

	onHistoricChange = ( newState ) => {
		this.setState( { historic: newState.target.checked } );
	}

	handleDownloadClick() {
    const { downloadPath } = this.state;
    window.location = downloadPath;
    this.setState( { downloadPath: '', buoyDownloadText: '' } );
  }

  handleModalClose() {
    this.setState( { downloadPath: '', buoyDownloadText: '' } );
  }
	
	setBounds = ( ) => {
		// Set initial bounds
		const { boundsSet, initBoundsSet, ref } = this.state;
		if( ref && boundsSet && !initBoundsSet ) {
			const { minLat, minLng, maxLat, maxLng } = this.state;
			// Ensure it doesn't happen on resize
			this.setState( { initBoundsSet: true } );
			// Set bounds
			ref.fitBounds( {
				east: maxLng, 
				west: minLng,
				north: maxLat, 
				south: minLat 
			} );
		}
	}

  render() {
		const { center } = this.props;
		const { markers, polylines, polylineMarkers, icon, decommissionedIcon, historic, downloadPath, buoyDownloadText, currentZoom } = this.state;
		

		// Show polyline markers when zoom is >= 7
		let polylineLabels = [];
		if( Object.keys( polylineMarkers ).length !== 0 && currentZoom >= 7 ) {
			for ( const [key, value] of Object.entries( polylineMarkers ) ) {
				polylineLabels = [ ...polylineLabels, ...value ];
			}
		}
		

		let cluster;
		if( markers ) {
			cluster = <MarkerClusterer gridSize={ 30 } maxZoom={ 7 }>
				{ ( clusterer ) => 
					markers.map( ( marker, i ) => {
						if( marker.isEnabled !== 1 && !historic ) {
							// Hide historic buoys
							return;
						}
						return (
							<MapMarker 
								buoyId={ marker.buoyId } 
								icon={ ( marker.isEnabled == 1 ) ? icon : decommissionedIcon } 
								position={ { lat: marker.lat, lng: marker.lng } } 
								label={ { text: marker.label, fontSize: '13px' } } 
								key={ i } 
								clusterer={ clusterer } 
								markerFocus={ (marker.isEnabled == 1 ) ? this.onMapMarkerClick : this.onMapDecommissionedMarkerClick } 
								buoyDownloadText={ marker.buoyDownloadText }
							/>
						) 
					} )
				}
			</MarkerClusterer>
		}

		// Download popup 
		let chartModal;
		if( downloadPath.length > 0 ) {
			const ref = React.createRef();
			chartModal = <ChartDownloadModal 
				title="Terms and Conditions"
				license={ buoyDownloadText }
				close={ this.handleModalClose }
				download={ this.handleDownloadClick }
				ref={ ref }
			/>;
		}

		let mapRender = <h2>Loading&hellip;</h2>;
		// Load when markers, zoom and center are defined
		if( center && currentZoom && markers ) {
			mapRender = <LoadScript
				googleMapsApiKey={ ( typeof( wad ) != "undefined" ) ? wad.googleApiKey : '' }
			>
				<GoogleMap
					mapContainerStyle={ containerStyle }
					center={ center }
					zoom={ currentZoom }
					options={{ styles: mapStyles }}
					onLoad={ this.onLoad }
					onBoundsChanged={ this.onBoundsChanged }
					onZoomChanged={ this.onZoomChanged }
				>
					<>{ cluster }{ polylines }{ polylineLabels }</>
				</GoogleMap>
				<div id="historic-data">
					<label for="show-historic">
						<input 
							type="checkbox"
							name="show-historic"
							checked={ historic }
							onChange={ this.onHistoricChange }
							/>&nbsp;Decommissioned
					</label>
				</div>
			</LoadScript>;
		}

    return (
			<div className="maps">
				{ chartModal }
				{ mapRender }
			</div>
    )
  }
}

const MapMarker = ( props ) => {
	const onMarkerClick = ( e ) => {
		props.markerFocus( { buoyId: props.buoyId, position: props.position, buoyDownloadText: props.buoyDownloadText } );
	}

	return (
		<Marker onClick={ onMarkerClick } { ...props } />
	);
}

const MapPolyline = ( props ) => {
	const onPolylineClick = ( e ) => {
		props.polylineFocus( { buoyId: props.buoyId, pathTimes: props.pathTimes } );
	}

	return (
		<Polyline onClick={ onPolylineClick } { ...props } />
	)
}
