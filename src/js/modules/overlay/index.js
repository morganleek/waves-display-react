import $ from 'jquery';
import { wadDrawMap } from '../map';

$( function() {
  if( document.getElementsByClassName('page-template---templateswave-overlay-test-php').length ) {
		// Fetch all buoys
		$.ajax({
			type: 'POST',
			url: wad.ajax,
			data: { action: 'waf_rest_list_buoys' },
			success: wadOverlayProcessBuoys, // Process list received
			dataType: 'json'
		});
	}

} );

export function wadOverlayProcessBuoys( response ) {
  // Draw map
  if( document.getElementById( 'map' ) ) {
    wadDrawMap( response );

		// if( false ) {
		// 	const latLng = { lat: -35.0704, lng: 117.7756 };
		// 	window.myMap.panTo( latLng );
		// 	window.myMap.setZoom( 14 );

		// 	// const bounds = {
		// 	// 	14: [
		// 	// 		[273, 92],
		// 	// 		[879, 406]
		// 	// 	]
		// 	// }

		// 	// const moonMapType = new window.myGoogleMaps.ImageMapType({
		// 	// 	getTileUrl: function (coord, zoom) {
		// 	// 		console.log( coord );
		// 	// 		return "";
		// 	// 	},
		// 	// 	tileSize: new window.myGoogleMaps.Size(256, 256),
		// 	// 	maxZoom: 20,
		// 	// 	minZoom: 0,
		// 	// 	radius: 1738000,
		// 	// 	name: "Moon",
		// 	// });
		// }
  }
}


// const latLng = { lat: -35.0704, lng: 117.7756 };