import React, { Component, Fragment, forwardRef, useState } from "react";
const classNames = require('classnames');

export const ChartDownloadModal = ( { close, download, title, license } ) => (
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