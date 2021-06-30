

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
    }
  }

  componentDidMount() {
		if( this.props.buoyId ) {
			getMemplots( this.props.buoyId ).then( json => {
			  this.setState( {
			    data: json.data
			  } );
			} );
		}
  }

  render() {
		const { data } = this.state;
		if( this.props.buoyId ) {
			let content = <p>Loading memplot &hellip;</p>;
			if( data.length > 0 ) {
				const lastNItems = data.length - Math.abs( data.length - 5 ); // Last 5 or less items
				console.log( lastNItems );
				let memplotsList = [];
				// const last = data[data.length - 1];
				// content = <MemplotImage buoyId={ this.props.buoyId } memplotId={ last.id } />
				for( let i = data.length - lastNItems; i < data.length; i++ ) {
					memplotsList.push( <MemplotImage buoyId={ this.props.buoyId } memplotId={ data[i].id } key={ i } /> );
				}
				content = memplotsList;
			}

			return (
				<div className="memplot">
					{ content }	
				</div>
			);
		}

    return (
      <div className="memplot"><pre>No id set</pre></div>
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