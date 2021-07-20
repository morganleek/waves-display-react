import React, { Component, Fragment, forwardRef, useState } from "react";
import { Line } from 'react-chartjs-2';
import DatePicker from "react-datepicker";
import { DateTime } from 'luxon'; 
import 'chartjs-adapter-luxon';
// import { DateTime } from 'luxon'; 

import { wadRawDataToChartData, wadGenerateChartData, wadGetAspectRatio } from '../api/chart';
import { getBuoys, getBuoy, getBuoyByDate, getBuoyImage } from '../api/buoys';
// import { getMemplot } from '../api/memplots';
import { Memplot } from '../memplot/Memplot';

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

  componentDidUpdate( prevProps ) {
    const { buoyFocus } = this.props;
    if( buoyFocus != prevProps.buoyFocus ) {
      if( document.querySelector('[data-buoy-id="' + buoyFocus + '"]') ) {
        document.querySelector('[data-buoy-id="' + buoyFocus + '"]').scrollIntoView( { block: "start" } );
      }
    }
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
                buoyDescription={ row.description }
                buoyDownloadText={ row.download_text }
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

export class Chart extends Component {
  constructor( props ) {
    super( props );
    
    this.state = {
      data: [],
      isExpanded: false,
      dateRange: [null, null],
      needsUpdating: false,
      downloadPath: ''
		}

    this.handleModalClose = this.handleModalClose.bind( this );
    this.handleDownloadClick = this.handleDownloadClick.bind( this );
  }

  handleExpandClick() {
    this.setState( { isExpanded: !this.state.isExpanded } );
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
      this.setState( { downloadPath: wad.ajax + path } );
    }
    else {
      console.log( 'No time range specified' );
    }
	}

	handleDateChanged() {
    const { dateRange } = this.state;
    
		getBuoyByDate( this.props.buoyId, dateRange[0].getTime() / 1000, dateRange[1].getTime() / 1000 ).then( json => {
      if( json.success == 1 ) {
        const data = wadGenerateChartData( wadRawDataToChartData( json.data ) );
        this.setState( {
          data: data,
          dateRange: [ new Date( parseInt( data.timeRange[0] ) ), new Date( parseInt( data.timeRange[1] ) ) ]
        } );
      }      
    } );
	}

  handleDownloadClick() {
    const { downloadPath } = this.state;
    window.location = downloadPath;
    this.setState( { downloadPath: '' } );
  }

  handleModalClose() {
    this.setState( { downloadPath: '' } );
  }
  
  // testEvent() {
  //   console.log( 'test event' );
  // }
  
  componentDidMount() {
    getBuoy( this.props.buoyId ).then( json => {
      if( json.success == 1 ) {
        const data = wadGenerateChartData( wadRawDataToChartData( json.data ) );
        this.setState( {
          data: data,
          dateRange: [ new Date( parseInt( data.timeRange[0] ) ), new Date( parseInt( data.timeRange[1] ) ) ],
        } );
        // const [startDate, setStartDate] = useState( 0 );
      }      
    } );
  }
  
  render() {
    let chartGraph = <p>Loading &hellip;</p>;
    let chartModal, chartTable, buttonGroup, chartBuoyDetails;
    const { data, isExpanded, dateRange, needsUpdating, downloadPath } = this.state;
    const [ startDate, endDate ] = dateRange;
    const expandedLabel = ( isExpanded ) ? 'Collapse' : 'Expand';
    const buoyLabel = this.props.buoyLabel;
    
    if( startDate && endDate && needsUpdating ) {
      this.setState( { needsUpdating: false } );
      this.handleDateChanged();
    }
		
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

        // Expanded buoy details 
        chartBuoyDetails = <div className={ classNames( ['buoy-details'] ) }>
          <ChartPhoto buoyId={ this.props.buoyId } />
          <div className="chart-description"><p>{ this.props.buoyDescription }</p></div>
          <Memplot buoyId={ this.props.buoyId } startDate={ startDate } endDate={ endDate } />
        </div>;
      }
      else {
        // All in one
        chartGraph = <Line data={ data.config.data } options={ data.config.options } />;
      }


      chartTable = <ChartTable dataPoints={ data.dataPoints } lastUpdated={ this.props.lastUpdated } />;
			buttonGroup = <div className={ classNames( ['btn-group', 'pull-right'] ) } >
        <button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => this.handleExpandClick() }><i className={ classNames( ['fa'], ['fa-expand'] ) }></i> { expandedLabel }</button>
				<button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => this.handleCentreClick() }><i className={ classNames( ['fa'], ['fa-crosshairs'] ) }></i> Centre</button>
				<button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => this.handleExportClick() }><i className={ classNames( ['fa'], ['fa-floppy-o'] ) }></i> Export Data</button>
				<DatePicker
          selectsRange={ true }
          startDate={ startDate }
          endDate={ endDate }
          onChange={ ( update ) => {
            this.setState( { dateRange: update } );
            if( update[0] && update[1] ) {
              this.setState( { needsUpdating: true } );
            }
          } }
          customInput={ <ChartDatePicker /> }
          dateFormat="dd/MM/yyyy"
        />
			</div>;


      if( downloadPath.length > 0 ) {
        const ref = React.createRef();
        chartModal = <ChartDownloadModal 
          title="Terms and Conditions"
          license={ this.props.buoyDownloadText }
          close={ this.handleModalClose }
          download={ this.handleDownloadClick }
          ref={ ref }
        />;
        
      }
    }

    return (
      <div className={ classNames( ['card', 'card-primary', 'mb-3'], { expanded: isExpanded } ) } data-buoy-id={ this.props.buoyId } >
        { chartModal }
        <div className={ classNames( ['card-header', 'clearfix'] ) }>
          <h6 className='pull-left'>{ buoyLabel }</h6>
					{ buttonGroup }
        </div>
        <div className='card-body'> 
          <div className={ classNames( ['canvas-wrapper', { 'is-updating': needsUpdating } ] ) }>
						{ chartGraph }
            { chartBuoyDetails }
            { chartTable }
          </div>
        </div>
      </div>
    );
  }
}

// const ChartDownloadTrigger = forwardRef( ( props, ref ) => (
//   <button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => this.handleExportClick() }>
//     <i className={ classNames( ['fa'], ['fa-floppy-o'] ) }></i> Export Data
//   </button>
// ) );

const ChartDatePicker = forwardRef( ( { value, onClick }, ref ) => (
  <button className={ classNames( ['btn', 'btn-outline-secondary', 'btn-datepicker' ] ) } onClick={ onClick } ref={ ref }>
    <i className={ classNames( ['fa'], ['fa-calendar'] ) }></i> { value } <i className={ classNames( ['fa'], ['fa-caret-down'] ) }></i>
  </button>
) );

// const ChartDownloadModal = ( props ) => <h1>Hello world!</h1>;
// function ChartDownloadModal ( props ) {
//   return <h1>{ props.license }</h1>;
// } 

const ChartDownloadModal = ( { close, download, title, license } ) => (
  <div className={ classNames( 'modal', 'fade', 'show' ) } id="chartModal" tabindex="-1" aria-labelledby="chartModalLabel" >
    <div className={ classNames( 'modal-dialog' ) }>
      <div className={ classNames( 'modal-content' ) }>
        <div className={ classNames( 'modal-header' ) }>
          <h5 className={ classNames( 'modal-title' ) } id="chartModalLabel">{ title }</h5>
          <button type="button" className={ classNames( 'btn-close' ) } aria-label="Close" onClick={ close } ></button>
        </div>
        <div className={ classNames( 'modal-body' ) }>
          <p>{ license }</p>
        </div>
        <div className={ classNames( 'modal-footer' ) }>
          <button type="button" className={ classNames( 'btn' , 'btn-secondary', 'btn-cancel' ) } onClick={ close } >Close</button>
          <button type="button" className={ classNames( 'btn', 'btn-primary', 'btn-download' ) } onClick={ download } >Download</button>
        </div>
      </div>
    </div>
  </div>
);

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
    let dateTime = '';
    for( const [key, value] of Object.entries( this.props.dataPoints ) ) {
      // Last value
      const last = ( value.data.length > 0 ) ? value.data[ value.data.length - 1 ].y : 0;
      // Last Updates
      if( last > 0 ) {
        const time = DateTime.fromMillis( parseInt( value.data[ value.data.length - 1 ].x ) );
		    dateTime = ' - ' + time.toFormat( 'dd LLL y h:mma' );
        lineTableRender.push( <li key={ key }>
          { value.description }
          <span>{ last }</span>
        </li> );
      }
    }

    return (
      <div className={ classNames( "chart-info", { "expanded": this.state.active } ) }
        onClick={ () => this.setState( { active: !this.state.active } ) } >
        <h5 className='latest-observations'>Latest Observations { dateTime }</h5>
        <ul>{ lineTableRender }</ul>
      </div>
    );
  }
}

// 
export class ChartPhoto extends Component {
  constructor( props ) {
    super( props );
    
    this.state = {
      path: ''
    }
  }

  componentDidMount() {
		if( this.props.buoyId ) {
			getBuoyImage( this.props.buoyId ).then( json => {	
			  this.setState( {
			    path: json.path
			  } );
			} );	
		}
  }

  render() {
		const { path } = this.state;

    let content = '';
		if( path.length == 0 ) {
		 content = <div className="chart-photo-placeholder"></div>
		}
    else {
      content = <img src={ path } />
    }
    return (
      <div className="chart-image">
        { content }
      </div>
    )
  }
}