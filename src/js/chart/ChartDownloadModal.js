import React from "react";
import { useFormik } from 'formik';
const classNames = require('classnames');


export const ChartDownloadModal = ( { close, download, downloadEnabled, downloadRequiresDetails, title, license, buoyId } ) => {
  const downloadButton = ( downloadEnabled && !downloadRequiresDetails ) ? <button type="button" className={ classNames( 'btn', 'btn-primary', 'btn-download' ) } onClick={ download } >Download</button> : '';
  const downloadForm = ( downloadRequiresDetails ) ? <ChartDownloadUserForm download={ download } buoyId={ buoyId }></ChartDownloadUserForm> : '';
  return (
    <div className={ classNames( 'modal', 'fade', 'show' ) } id="chartModal" tabindex="-1" aria-labelledby="chartModalLabel" >
      <div className={ classNames( 'modal-dialog' ) }>
        <div className={ classNames( 'modal-content' ) }>
          <div className={ classNames( 'modal-header' ) }>
            <h5 className={ classNames( 'modal-title' ) } id="chartModalLabel">{ title }</h5>
            <button type="button" className={ classNames( ['btn-close', 'fa', 'fa-close'] ) } aria-label="Close" onClick={ close } ></button>
          </div>
          <div className={ classNames( 'modal-body' ) }>
            <p>{ license }</p>
            { downloadForm }
          </div>
          <div className={ classNames( 'modal-footer' ) }>
            <button type="button" className={ classNames( 'btn' , 'btn-secondary', 'btn-cancel' ) } onClick={ close } >Close</button>
            { downloadButton }
          </div>
        </div>
      </div>
    </div>
  ) 
};

export const ChartDownloadUserForm = ( { download, buoyId } ) => {
  const formik = useFormik({
    initialValues: {
      fullName: '', 
      company: '', 
      state: '',
      country: '',
      howWillYou: '', 
      howWillYouOther: '',
      howDidYou: '',
      howDidYouOther: ''
    },
    validate: ( values ) => {
      const errors = {};

      // No empty fields allowed
      for( const value in values ) {
        if( !values[value] && value.indexOf('Other') == -1 ) {
          errors[value] = "Required";
        }
      }

      return errors;
    },
    onSubmit: ( values, { setSubmitting } ) => {
      // Don't submit form
      setSubmitting( false );
      
      // Send form data
      const form_data = JSON.stringify( values, null, 2 );
      const init = {
        method: 'POST'
      }
      fetch( wad.ajax + "?action=waf_collect_user_data&buoy_id=" + buoyId + "&nonce=" + wad.user_data_nonce + "&form_data=" + form_data, init ) 
        .then( response => {
          if( !response.ok ) throw Error( response.statusText );
          console.log( 'Form submitted successfully' );
        } );
      
      // Trigger download
      download();

    },
  });

  return (
    <form id="chart-download-user-form" onSubmit={formik.handleSubmit}>
      <div class="form-group">
        <label htmlFor="fullName">Full Name *</label><br />
        <input 
          type="text"
          class="form-control"
          name="fullName"
          onChange={ formik.handleChange }
          value={ formik.values.fullName } />
        { formik.touched.fullName && formik.errors.fullName ? <div>{ formik.errors.fullName }</div> : null }
      </div>
      <div class="form-group">
        <label for="company">Company *</label><br />
        <input 
          type="text"
          class="form-control"
          name="company"
          onChange={ formik.handleChange }
          value={ formik.values.company } />
        { formik.touched.company && formik.errors.company ? <div>{ formik.errors.company }</div> : null }
      </div>
      <div class="form-group">
        <label for="state">State/Provence *</label><br />
        <input 
          type="text"
          class="form-control"
          name="state"
          onChange={ formik.handleChange }
          value={ formik.values.state } />
        { formik.touched.state && formik.errors.state ? <div>{ formik.errors.state }</div> : null }
      </div>
      <div class="form-group">
        <label for="country">Country *</label><br />
        <input 
          type="text"
          class="form-control"
          name="country"
          onChange={ formik.handleChange }
          value={ formik.values.country } />
        { formik.touched.country && formik.errors.country ? <div>{ formik.errors.country }</div> : null }
      </div>
      <div class="form-group">
        <label for="howWillYou">How will you use the data: *</label>
        <select 
          class="form-control" 
          name="howWillYou" 
          onChange={ formik.handleChange }
          >
          <option>&nbsp;</option>
          <option value="education">Education </option>
          <option value="research">Research </option>
          <option value="recreation">Recreation </option>
          <option value="navigation">Navigation </option>
          <option value="other">Other (specify)</option>
        </select>
        { formik.touched.howWillYou && formik.errors.howWillYou ? <div>{ formik.errors.howWillYou }</div> : null }
        { formik.values.howWillYou == "other" ? ( 
          <input 
            type="text"
            class="form-control"
            name="howWillYouOther"
            onChange={ formik.handleChange }
            placeholder="Please specify"
            value={ formik.values.howWillYouOther } />
        ) : null }
      </div>
      <div class="form-group">
        <label for="howDidYou">How did you hear about us: *</label>
        <select 
          class="form-control" 
          name="howDidYou"
          onChange={ formik.handleChange }
          >
          <option>&nbsp;</option>
          <option value="social-media">Social media</option>
          <option value="web">Web search</option>
          <option value="news">News</option>
          <option value="email">Email</option>
          <option value="word">Word of mouth</option>
          <option value="other">Other (specify)</option>
        </select>
        { formik.touched.howDidYou && formik.errors.howDidYou ? <div>{ formik.errors.howDidYou }</div> : null }
        { formik.values.howDidYou == "other" ? (
          <input 
            type="text"
            class="form-control"
            name="howDidYouOther"
            onChange={ formik.handleChange }
            placeholder="Please specify"
            value={ formik.values.howDidYouOther } />
        ) : null }
      </div>
      <button type="submit" class="btn btn-primary">Download</button>
    </form>
  )
};