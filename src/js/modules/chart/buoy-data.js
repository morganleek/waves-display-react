import $ from 'jquery';

import { wadDrawMap } from '../map';
import { wadDrawLatestTable, wadGenerateChartData, wadDrawHeading, wadDrawChart, wadDrawChartLegend, wadInitCharts } from './chart';

export function wadFetchBuoys() {
  // Fetch all buoys
  $.ajax({
    type: 'POST',
    url: wad.ajax,
    data: { action: 'waf_rest_list_buoys' },
    success: wadProcessBuoys, // Process list received
    dataType: 'json'
  });
}

export function wadProcessBuoys( response ) {
  // Draw charts
  if( document.getElementById( 'buoys' ) != null ) {
    wadInitCharts( response );
  }

  // Draw map
  if( document.getElementById( 'map' ) ) {
    wadDrawMap( response );
  }
}

// Create Divs for each Buoy
export function wadProcessBuoyData( response ) {
  if( response ) {
    if( typeof( window.myCharts ) == "undefined" ) {
      window.myCharts = [];
    }
    if( typeof( window.myChartData ) == "undefined" ) {
      window.myChartData = [];
    }
    // Comment
    const buoyDiv = document.getElementById( 'buoy-' + response.buoy_id );
    if( buoyDiv != null ) {
      if( response.success == "1" ) {
        // Convert to useful chart data
        const processed = wadRawDataToChartData( response.data );
        // Store in Window
        window.myChartData['buoy-' + response.buoy_id] = processed;
        // Generate Chart.js data
        const chartData = wadGenerateChartData( processed );
        // Draw chart lengend
        wadDrawChartLegend( response.buoy_id, chartData.config );
        // Draw chart tables
        wadDrawLatestTable( response.buoy_id, chartData.dataPoints );
        // Draw with chartData
        const canvasContext = document.querySelector( '#buoy-' + response.buoy_id + ' canvas' );
        if( canvasContext ) {
          let chart = wadDrawChart( chartData.config, canvasContext );
          
          // Check my Charts if needed
          if( typeof( window.myCharts ) == "undefined" ) {
            window.myCharts = [];
          }
          // Destroy existing chart
          if( window.myCharts.hasOwnProperty( 'buoy' + response.buoy_id ) ) {
            window.myCharts['buoy' + response.buoy_id].destroy();
          }
          // Save chart
          window.myCharts['buoy' + response.buoy_id] = chart;
        }
        // Update heading with time
        wadDrawHeading( response.buoy_id, chartData.timeLabel, chartData.timeRange );
        // Chart Appearance
        const canvasWrapper = buoyDiv.getElementsByClassName( 'canvas-wrapper' )[0]; // .innerHTML = "No results found";
        canvasWrapper.classList.remove( 'loading' );
        canvasWrapper.classList.remove( 'no-results' );
      }
      else {
        // No data returned
        // const buoyDiv = document.getElementById( 'buoy-' + response.buoy_id );
        const canvasWrapper = buoyDiv.getElementsByClassName( 'canvas-wrapper' )[0]; // .innerHTML = "No results found";
        const chartInfo = buoyDiv.getElementsByClassName( 'chart-info' )[0];
        canvasWrapper.classList.remove( 'loading' );
        canvasWrapper.classList.add( 'no-results' );
        // Destroy Chart if it exists
        if ( window.myCharts.hasOwnProperty( 'buoy' + response.buoy_id ) ) {
          window.myCharts['buoy' + response.buoy_id].destroy();
          // Remove chart data
          chartInfo.classList.add( 'no-results' );
          chartInfo.innerHTML = "";
        }
        else {
          // Remove inner elements only for initial loads
          buoyDiv.getElementsByClassName( 'chart-js-menu' )[0].remove();
          chartInfo.remove();
        }
      }
    }
  }
}

export function wadRawDataToChartData( data ) {
  let processed = [];
  if( data.length > 0 ) {
    for( let i = 0; i < data.length; i++ ) {
      if( data[i].data_points ) {
        try {
          processed.push( JSON.parse( data[i].data_points ) );
        } catch( e ) {
          console.error(e instanceof SyntaxError);
          // console.log( data[i].data_points );
        }
      }
    }
  }

  return processed;
}
