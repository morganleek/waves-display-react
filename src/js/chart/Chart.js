import React, { Component, Fragment } from "react";
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-luxon';
// import { DateTime } from 'luxon'; 

import { wadRawDataToChartData, wadGenerateChartData, wadGetAspectRatio } from '../api/chart';
import { getBuoys, getBuoy } from '../api/buoys';

const classNames = require('classnames');

export class Charts extends Component {
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
    let chartsLoopRender;
    if( buoys.length > 0 ) {
			chartsLoopRender = buoys.map( ( row, index ) => {    
        // <div className={ classNames( ['card', 'card-primary', 'mb-3'] ) } key={ index }>
				return (
          <Chart buoyId={ row.id } 
                buoyLabel={ row.web_display_name } 
                buoyLastUpdated={ row.last_update } 
                buoyLat={ row.lat } 
                buoyLng={ row.lng }
                updateCenter={ this.props.updateCenter }
                updateZoom={ this.props.updateZoom }
                key={ index }
          />
        )
        //  </div>
			} );
    }

    return (
      <div className="charts">
        <div>{ chartsLoopRender }</div>
      </div>
    );
  }
}

function timeCallback( tickValue, index, ticks ) {
  return tickValue.split(" ");
}

const constOptions = {
  scales: {
    y: {
      position: "right"
      
    },
    "y-axis-1": {
      position: "right"
      
    },
    x: {
      grid: {
        borderColor: 'red'
      }
    }
  },
  plugins: {
    title: {
        display: true,
        text: 'Custom Chart Title'
    }
  }
};



export class Chart extends Component {
  constructor( props ) {
    super( props );
    
    this.state = {
      data: [],
      isExpanded: false
		}
  }

  handleExpandClick() {
    this.setState( { isExpanded: !this.state.isExpanded } );
    console.log( 'handleExpandClick' );

    // if( buoyWrapper && canvasWrapper ) {
    //   // Toggle width
    //   buoyWrapper.classList.toggle('expanded');
    //   // Remove legends
    //   const canvasLegend = buoyWrapper.querySelector( '.canvas-legend' );
    //   if( canvasLegend ) {
    //     canvasLegend.innerHTML = '';
    //   }
      
    //   // All new charts
    //   let charts;
    //   let multiplier = 1; // Adjust height for wider layouts
    //   if( !e.target.classList.contains( 'expanded' ) ) {
    //     multiplier = 0.65;
    //     e.target.classList.add( 'expanded' );
    //     e.target.innerHTML = '<i class="fa fa-compress" aria-hidden="true"></i> Collapse';
      
    //     // Charts
    //     charts = [
    //       { hsig: true }, 
    //       { tp: true }, 
    //       { sst: true }, 
    //       { bottomTemp: true },
    //       { windspeed: true }
    //     ];
    //   }
    //   else {
    //     e.target.classList.remove( 'expanded' );
    //     e.target.innerHTML = '<i class="fa fa-expand" aria-hidden="true"></i> Expand';

    //     // Charts
    //     charts = [{ hsig: true,
    //       tp: true,
    //       sst: false, 
    //       bottomTemp: false 
    //     }];
    //   }
      
    //   // Clear existing
    //   canvasWrapper.innerHTML = '';
    //   for( let i = 0; i < charts.length; i++ ) {
    //     // Create chart data
    //     const chartData = wadGenerateChartData( window.myChartData['buoy-' + buoyId], charts[i], multiplier );
    //     if( chartData.config.data.datasets.length > 0 ) {
    //       // OG Chart
    //       if( charts.length == 1 ) {
    //         // Create heading
    //         const singleHeading = document.createElement( 'h4' );
    //         singleHeading.className = "text-center";
    //         singleHeading.innerHTML = chartData.config.data.datasets[0].label;
    //         canvasWrapper.appendChild( singleHeading );

    //         // Legends
    //         wadDrawChartLegend( buoyId, chartData.config );
    //       }
    //       // Create canvas
    //       const singleCanvas = document.createElement( 'canvas' );
    //       // singleCanvas.className = charts[i];
    //       canvasWrapper.appendChild( singleCanvas );
    //       // Context
    //       const canvasContext = singleCanvas.getContext( '2d' );
    //       // Draw
    //       wadDrawChart( chartData.config, canvasContext );

    //     }
    //   }
    // }	
  }

	handleCentreClick() {
    const center = {
      lat: parseFloat( this.props.buoyLat ),
      lng: parseFloat( this.props.buoyLng )
    };
    this.props.updateCenter( center );
    this.props.updateZoom( 10 );
  }

	handleExportClick() {
    const { buoyId } = this.props;
    const { timeRange } = this.state.data;
    if( timeRange.length == 2 ) {
      const start = parseInt( timeRange[0] ) / 1000;
      const end = parseInt( timeRange[1] ) / 1000;
      const path = "?action=waf_rest_list_buoy_datapoints_csv&id=" + buoyId + "&start=" + start + "&end=" + end;
      window.location = wad.ajax + path;
    }
    else {
      console.log( 'No time range specified' );
    }
	}

	handleDatePickerClick() {
		console.log('date picker');
	}
  
  componentDidMount() {
    getBuoy( this.props.buoyId ).then( json => {
      if( json.success == 1 ) {

        this.setState( {
          data: wadGenerateChartData( wadRawDataToChartData( json.data ) )
        } );
      }      
    } );
  }
  
  render() {
    let chartGraph = <p>Loading &hellip;</p>;
    let chartTable; // , dateRangeLabel;
		let buttonGroup;
    const { data, isExpanded } = this.state;
    const expandedLabel = ( isExpanded ) ? 'Collapse' : 'Expand';
    const buoyLabel = this.props.buoyLabel;
		
    if( Object.keys( data ).length > 0 ) {
      if( isExpanded ) {
        // Split apart
        let chartGraphTemp = [];
        // Clone options
        let optionsClone = Object.assign( {}, data.config.options );
        optionsClone.plugins = {} // Not legend title
        optionsClone.aspectRatio = wadGetAspectRatio( 0.5 ); // Half aspect ratio
        
        data.config.data.datasets.forEach( ( dataset, j ) => {
          const datasetClone = Object.assign( {}, dataset );
          // console.log( datasetClone );
          datasetClone.hidden = false;
          chartGraphTemp.unshift( <Line data={ { labels: data.config.data.labels, datasets: [ datasetClone ] } }  options={ optionsClone } key={ j } /> );
        } );
        chartGraph = chartGraphTemp;
      }
      else {
        // All in one
        chartGraph = <Line data={ data.config.data } options={ data.config.options } />;
      }
      chartTable = <ChartTable dataPoints={ data.dataPoints } lastUpdated={ this.props.lastUpdated } />;
			buttonGroup = <div className={ classNames( ['btn-group', 'pull-right'] ) }>
        <button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => this.handleExpandClick() }><i className={ classNames( ['fa'], ['fa-expand'] ) }></i> { expandedLabel }</button>
				<button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => this.handleCentreClick() }><i className={ classNames( ['fa'], ['fa-crosshairs'] ) }></i> Centre</button>
				<button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => this.handleExportClick() }><i className={ classNames( ['fa'], ['fa-floppy-o'] ) }></i> Export Data</button>
				<button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => this.handleDatePickerClick() }>
					<i className={ classNames( ['fa'], ['fa-calendar'] ) }></i> { data.timeLabel } <i className={ classNames( ['fa'], ['fa-caret-down'] ) }></i>
				</button>
			</div>;
    }

    return (
      <div className={ classNames( ['card', 'card-primary', 'mb-3'], { expanded: isExpanded } ) }>
        <div className={ classNames( ['card-header', 'clearfix'] ) }>
          <h6 className='pull-left'>{ buoyLabel }</h6>
					{ buttonGroup }
        </div>
        <div className='card-body'> 
          <div className={ classNames( ['canvas-wrapper', 'loading'] ) }>
						{ chartGraph }
            { chartTable }
          </div>
        </div>
      </div>
    );
  }
}


export class ChartTable extends Component {
  constructor( props ) {
    super( props );
    
    this.state = {
      active: false
    }
  }

  render( ) {
    // Iterate through chart table items
    let lineTableRender = [];
    for( const [key, value] of Object.entries( this.props.dataPoints ) ) {
      // Last value
      const last = ( value.data.length > 0 ) ? value.data[ value.data.length - 1 ].y : 0;
      // Last Updates
      // this.props.lastUpdated;
      // const lastUpdate = moment( this.props.lastUpdated * 1000 );
      // const queryTime = moment( window.buoysData.get( parseInt( buoyId ) ).now * 1000 );
      if( last > 0 ) {
        lineTableRender.push( <li key={ key }>
          { value.description }
          <span>{ last }</span>
        </li> );
      }
    }

    return (
      <div className={ classNames( "chart-info", { "expanded": this.state.active } ) }
        onClick={ () => this.setState( { active: !this.state.active } ) } >
        <h5 className='latest-observations'>Latest Observations</h5>
        <ul>{ lineTableRender }</ul>
      </div>
    );
  }
}