import React, { Component, Fragment } from "react";
import { wadRawDataToChartData } from '../../chart/buoy-data';
import { wadGenerateChartData } from '../../chart/chart';
import { Line } from 'react-chartjs-2';
import { getBuoys, getBuoy } from '../logic';
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
				return (
					<div className={ classNames( ['card', 'card-primary', 'mb-3'] ) } key={ index }>
						<Chart buoyId={ row.id } 
									 buoyLabel={ row.web_display_name } 
									 buoyLastUpdated={ row.last_update } 
									 buoyLat={ row.lat } 
									 buoyLng={ row.lng }
                   updateCenter={ this.props.updateCenter }
                   updateZoom={ this.props.updateZoom } />
					</div>
				)
			} );
    }

    return (
      <div className="charts">
        <div>{ chartsLoopRender }</div>
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

export class Chart extends Component {
  constructor( props ) {
    super( props );
    
    this.state = {
      data: []
    }
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
    const { data } = this.state;
    const buoyLabel = this.props.buoyLabel;
    if( Object.keys( data ).length > 0 ) {
      // dateRangeLabel = <time>{ data.timeLabel }</time>;
      chartGraph = <Line data={ data.config.data } options={ data.config.options } />;
      chartTable = <ChartTable dataPoints={ data.dataPoints } lastUpdated={ this.props.lastUpdated } />;
			buttonGroup = <div className={ classNames( ['btn-group', 'pull-right'] ) }>
				<button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => this.handleCentreClick() }><i className={ classNames( ['fa'], ['fa-crosshairs'] ) }></i> Centre</button>
				<button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => this.handleExportClick() }><i className={ classNames( ['fa'], ['fa-floppy-o'] ) }></i> Export Data</button>
				<button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => this.handleDatePickerClick() }>
					<i className={ classNames( ['fa'], ['fa-calendar'] ) }></i> { data.timeLabel } <i className={ classNames( ['fa'], ['fa-caret-down'] ) }></i>
				</button>
			</div>;
    }

    return (
      <>
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
      </>
    );
  }
}