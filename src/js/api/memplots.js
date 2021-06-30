export function getMemplots( buoyId ) {
	if( typeof( wad ) != "undefined" ) {
    const init = {
      method: 'POST'
    }
    return fetch( wad.ajax + "?action=waf_rest_list_buoys_memplots&id=" + buoyId, init ) 
      .then( response => {
        if( !response.ok ) throw Error( response.statusText );
        return response.json();
      } )
      .then( json => json );
  }
}

export function getMemplot( buoyId, memplotId ) {
	if( typeof( wad ) != "undefined" ) {
    const init = {
      method: 'POST'
    }
    return fetch( wad.ajax + "?action=waf_get_file_path&buoy_id=" + buoyId + "&id=" + memplotId, init ) 
      .then( response => {
        if( !response.ok ) throw Error( response.statusText );
        return response.json();
      } )
      .then( json => json );
  }
}
