import $ from 'jquery'; // jQuery
import '../../node_modules/bootstrap/js/src/modal'; // Bootstrap
import { wadInitCharts } from './chart'; // Load Charts
import { wadInitMap } from './map'; // Load Maps

// Init
$( function() { 
  if( document.getElementsByClassName('page-template---templateswave-display-list-php').length ) {
    // Fetch all buoys
    $.ajax({
      type: 'POST',
      url: wad.ajax,
      data: { action: 'waf_rest_list_buoys' },
      success: wadInit, // Process list received
      dataType: 'json'
    });
  }
});

function wadInit( response ) {
  // Draw charts
  if( document.getElementById( 'buoys' ) != null ) {
    wadInitCharts( response );
  }

  // Draw map
  if( document.getElementById( 'map' ) ) {
    wadInitMap( response );
  }
}