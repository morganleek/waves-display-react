

import { data } from "jquery";
import React, { Component, Fragment } from "react";

// import { wadRawDataToChartData, wadGenerateChartData, wadGetAspectRatio } from '../api/chart';
import { getMemplots, getMemplot } from '../api/memplots';

const classNames = require('classnames');

export class Memplot extends Component {
  constructor( props ) {
    super( props );
    
    this.state = {
      data: [],
			loading: true
    }
  }

  componentDidMount() {
		this.loadMemplots();
  }

	componentDidUpdate( prevProps ) {
		const { startDate, endDate } = this.props;
		if( startDate && endDate && prevProps.endDate == null ) {
			// Previous date is always null before a change
			this.loadMemplots();
		}
	}

	loadMemplots() {
		if( this.props.buoyId ) {
			const { startDate, endDate } = this.props;
			
			getMemplots( this.props.buoyId, startDate.getTime() / 1000, endDate.getTime() / 1000 ).then( json => {
			  this.setState( {
					loading: false,
			    data: json.data
			  } );
			} );
		}
	}


  render() {
		const { data, loading } = this.state;
		if( this.props.buoyId ) {
			let content = <p>Loading &hellip;</p>;
			if( !loading ) {
				if( data.length > 0 ) {
					let memplotsList = [];
					const memplotData = data.slice( -5 ).reverse(); // Final 5 items
					
					memplotData.forEach( ( item, i ) => {
						memplotsList.push( <MemplotImage buoyId={ this.props.buoyId } memplotId={ item.id } key={ i } /> );
					} );

					content = memplotsList;
				}
				else {
					content = <p><em>No spectral data available for this time period</em></p>
				}
			}

			return (
				<div className="chart-memplot">
					{ content }	
				</div>
			);
		}

    return (
      <div className="chart-memplot"><pre>No id set</pre></div>
    );
  }
}

// 
export class MemplotImage extends Component {
  constructor( props ) {
    super( props );
    
    this.state = {
      path: ''
    }
  }

  componentDidMount() {
		this.loadMemplot();
  }

	componentDidUpdate( prevProps ) {
		const { memplotId } = this.props;
		if( prevProps.memplotId != memplotId ) {
			this.loadMemplot();
		}
	}

	loadMemplot() {
		if( this.props.buoyId && this.props.memplotId ) {
			getMemplot( this.props.buoyId, this.props.memplotId ).then( json => {	
			  this.setState( {
			    path: json.path
			  } );
			} );	
		}
	}

  render() {
		const { path } = this.state;

		if( path.length == 0 ) {
		 return <div className="memplot-placeholder"></div>
		}
		return <img src={ path } width="1230" height="1082" />
  }
}