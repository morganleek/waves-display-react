import $ from 'jquery';
import { wadRawDataToChartData } from '../chart';
const loadGoogleMapsApi = require('load-google-maps-api'); // Google Maps

export function wadInitMap( buoys ) {
	wadDrawMap( buoys );
}

// Map - Render + Markers
function wadDrawMap( buoys ) {
	if( wad.googleApiKey != undefined ) { // Maps API Key Setup
		// Maps
		if( document.getElementById( 'map' ) ) {
			// Load API
			loadGoogleMapsApi( {
				key: wad.googleApiKey
			} ).then( ( googleMaps ) => {
				// For later 
				window.myGoogleMaps = googleMaps; // Global Maps Class
				// Centre Map + Set Zoom
				const lat = parseFloat( wad.googleLat );
				const lng = parseFloat( wad.googleLng );
				const zoom = ( window.innerWidth < 1200 ) ? 4 : 5;
				const latLng = { lat: lat, lng: lng };
				// Create Map
				window.myMap = new googleMaps.Map(
					document.getElementById( 'map' ), {
						center: latLng,
						zoom: zoom,
						styles: mapStyles,
						disableDefaultUI: true,
					}
				);

				// Zoom for Drifting Date Labels
				window.myMap.addListener( 'zoom_changed', wadToggleDriftingLabels );

				// Draw Markers
				wadDrawMarkers( buoys );
				
				// Fetch Drifting Buoy Data
				wadDrifting( );
			}).catch( (e) => {
				console.error(e);
			});
		}
	}
}

// Markers - Render 
function wadDrawMarkers( buoys ) {
	// Local global 
	let googleMaps = window.myGoogleMaps;

	// Labels
	const MarkerWithLabel = require( 'markerwithlabel' )( googleMaps );
	
	// Key/value pair for Makers
	window.myMapMarkers = new Map();

	// Set markers
	for(var i = 0; i < buoys.length; i++) {
		// Create Point + Title
		var point = new MarkerWithLabel({
			position: {
				lat: parseFloat(buoys[i].lat), 
				lng: parseFloat(buoys[i].lng)
			},
			map: window.myMap,
			title: buoys[i].label,
			labelContent: buoys[i].web_display_name,
			labelAnchor: new googleMaps.Point(0, -2),
			labelClass: "buoy-" + buoys[i].id,
			labelStyle: { opacity: 0.9 }
		});

		// Push on to marker stack
		window.myMapMarkers.set( parseInt( buoys[i].id ), point );

		// Add listener for each marker
		googleMaps.event.addListener( point, "click", function( e ) { 
			const buoy = this.labelClass;
			if( document.getElementById( buoy ) ) {
				document.getElementById( buoy )
					.scrollIntoView({ behavior: 'smooth' });
			}
		} );
	}
}

// Markers - Click Event
export function wadMapLocator ( trigger ) {
	if( trigger != "undefined" ) {
		trigger.addEventListener( 'click', ( e ) => {
			const buoyId = parseInt( e.target.dataset.buoyId );
			if( window.myMapMarkers.has( buoyId ) ) {
				const marker = window.myMapMarkers.get( buoyId );
				const center = { 
					lat: marker.position.lat(),
					lng: marker.position.lng()
				};

				const bounds = {
					east: ( marker.position.lng() + 0.3 ),
					north: ( marker.position.lat() + 0.1 ),
					south: ( marker.position.lat() - 0.1 ),
					west: ( marker.position.lng() - 0.1 )
				};

				// Centre
				window.myMap.panTo( center )
				// Go to centre zoom level 8
				window.myMap.setZoom( 8 );
				// Ajdust because map covers entire page but only half is visible
				window.myMap.panBy( window.innerWidth / 4, 0 );
				// Bounce Animation
				if( marker.getAnimation() > 0 ) {
					marker.setAnimation( undefined );
				}
				marker.setAnimation( window.myGoogleMaps.Animation.BOUNCE ); 
				window.setTimeout( () => { 
					marker.setAnimation( undefined ); 
				}, 2100 );
			}
			else {
				alert( 'Can\'t location buoy ID: ' + buoyId );
			}
		} );
	}
}

// Drifting Markers - Fetch 
function wadDrifting( ) {
	$.ajax({
    type: 'POST',
    url: wad.ajax,
    data: { action: 'waf_rest_list_buoys_drifting' },
    success: wadDrawDriftingMarkers, // Process list received
    dataType: 'json'
  });
}

// Drifting Markers - Render 
function wadDrawDriftingMarkers( response ) {
	if( window.myGoogleMaps ) {
		for( let i = 0; i < response.length; i++ ) {
			const processed = wadRawDataToChartData( response[i].data );

			let path = [];
			let times = [];
			const buoyId = ( processed.length > 0 ) ? parseInt( processed[0].buoy_id ) : 0;
			
			for( let j = 0; j < processed.length; j++ ) {
				if( !isNaN( parseFloat( processed[j]["Latitude (deg)"] ) ) && !isNaN( parseFloat( processed[j]["Longitude (deg) "] ) ) ) {
					path.push( { lat: parseFloat( processed[j]["Latitude (deg)"] ), lng: parseFloat( processed[j]["Longitude (deg) "] ) } );
					times.push( parseInt( processed[j]['Time (UNIX/UTC)'] ) );
				}
			}

			const driftingPath = new window.myGoogleMaps.Polyline( { 
				path: path,
				geodesic: true,
				strokeColor: "#FF0000",
				strokeOpacity: 1.0,
				strokeWeight: 2,
			} );
			driftingPath.setMap( window.myMap );
			
			const MarkerWithLabel = require( 'markerwithlabel' )( window.myGoogleMaps );
			
			let halfDays = [];
			// path = path.reverse();

			const isVisible = ( window.myMap.getZoom() >= 8 );

			if( typeof( window.driftingPoints ) == "undefined" ) {
				window.driftingPoints = [];
			}

			for( let n = 0; n < path.length; n += 24 ) {
				const last = path.pop();
				const lastTime = times.pop();
				const labelDate = new Date( times[n] * 1000).toDateString();
				const labelTime = new Date( times[n] * 1000).toTimeString().replace(/\s\(.*/, '');

				var point = new MarkerWithLabel({
					position: path[n],
					map: window.myMap,
					title: ( n === 0) ? '' : labelDate + '<br>' + labelTime,
					labelContent: ( n === 0) ? '' : labelDate + '<br>' + labelTime,
					visible: isVisible,
					labelStyle: { opacity: 1 },
					icon: 'https://maps.gstatic.com/mapfiles/transparent.png' // wad.plugin + 'dist/images/invisble-marker.png'
				});
			

				if( n === 0 ) {
					// Move marker to align with start
					if( typeof( window.myMapMarkers ) != undefined ) {
						for( const[key, value] of window.myMapMarkers.entries() ) {
							if( key == buoyId ) { 
								value.setPosition( path[n] )
							}
						}
					}
				}

				window.driftingPoints.push( point );
			}
		}
	}
}

// Drifting Markers - Zoom Appearance
function wadToggleDriftingLabels() {
	if( typeof( window.myMap ) != "undefined" ) {
		const isVisible = ( window.myMap.getZoom() >= 8 );
		if( typeof( window.driftingPoints ) != "undefined" ) {
			window.driftingPoints.forEach( element => {
				element.setVisible( isVisible );
			} );
		}
	}
}

// Map Styles
const mapStyles = [
	{
		"featureType": "all",
		"elementType": "labels.text",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},
	{
		"featureType": "all",
		"elementType": "labels.icon",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},
	{
		"featureType": "landscape",
		"elementType": "geometry.fill",
		"stylers": [
			{
				"color": "#f1efe8"
			}
		]
	},
	{
		"featureType": "landscape.man_made",
		"elementType": "geometry.fill",
		"stylers": [
			{
				"visibility": "on"
			},
			{
				"gamma": "1.19"
			}
		]
	},
	{
		"featureType": "landscape.man_made",
		"elementType": "geometry.stroke",
		"stylers": [
			{
				"visibility": "on"
			},
			{
				"gamma": "0.00"
			},
			{
				"weight": "2.07"
			}
		]
	},
	{
		"featureType": "road.highway",
		"elementType": "geometry.fill",
		"stylers": [
			{
				"color": "#b2ac83"
			}
		]
	},
	{
		"featureType": "road.highway",
		"elementType": "geometry.stroke",
		"stylers": [
			{
				"color": "#b2ac83"
			}
		]
	},
	{
		"featureType": "water",
		"elementType": "geometry.fill",
		"stylers": [
			{
				"color": "#588da8"
			}
		]
	}
	];
