import $ from 'jquery';
import { wadFetchBuoys } from './buoy-data';

$( function() {
  if( document.getElementsByClassName('page-template---templateswave-display-list-php').length ) {
    // Fetch list of buoys
    wadFetchBuoys();
  }
});