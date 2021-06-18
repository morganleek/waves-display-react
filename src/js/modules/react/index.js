// Charts - React.js
import React, { useState, Component, Fragment } from "react";
import { render } from "react-dom";
import { Charts } from './chart';
import { Map } from './map';

const classNames = require('classnames');

function App() {
  return <>
    <Map /><Charts />
  </>;
}

document.addEventListener("DOMContentLoaded", function(event) { 
  if( document.getElementsByClassName('page-template-wave-display-react').length ) {
    render( <App />, document.getElementById( "root" ) );
  }
} );