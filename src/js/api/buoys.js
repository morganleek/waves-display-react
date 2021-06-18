export function getBuoys() {
  if( typeof( wad ) != "undefined" ) {
    const init = {
      method: 'POST'
    }
    return fetch( wad.ajax + "?action=waf_rest_list_buoys", init ) 
      .then( response => {
        if( !response.ok ) throw Error( response.statusText );
        // console.log( response );
        return response.json();
      } )
      .then( json => json );
  }
}

export function getBuoy( buoyId ) {
  if( typeof( wad ) != "undefined" ) {
    const init = {
      method: 'POST'
    }
    return fetch( wad.ajax + "?action=waf_rest_list_buoy_datapoints&id=" + buoyId, init ) 
      .then( response => {
        if( !response.ok ) throw Error( response.statusText );
        return response.json();
      } )
      .then( json => json );
  }
}