// Appearance for each datapoint type
export function generateDataPoints( includes ) {
	// Arrows
	let arrowImageOrange = new Image( 20, 20 );
	arrowImageOrange.src = wad.plugin + "dist/images/arrow-grad-orange@2x.png";
	let arrowImageBlue = new Image( 28, 28 );
	arrowImageBlue.src = wad.plugin + "dist/images/arrow-blue-g@2x.png";
	let arrowImagePink = new Image( 28, 28 );
	arrowImagePink.src = wad.plugin + "dist/images/arrow-pink-g@2x.png";
	
	// Datapoint setup
	let dataPoints = {
		hsig: { 
			data: [], 
			showInChart: true, 
			label: window.innerWidth >= 768 ? 'Significant Wave Height (m)' : 'Sig Wave (m)',
			description: "Significant Wave Height (m)",
			backgroundColor: 'rgba(165, 223, 223, 1)',
			borderColor: 'rgba(75, 192, 192, 1)',
			borderWidth: 2,
			lineTension: 0,
			pointRadius: 0,
			fill: true,
			yAxisID: 'y-axis-1',
			hidden: ( includes.hasOwnProperty( 'hsig' ) ) ? !includes.hsig : true
		}, 
		tp: { 
			data: [], 
			showInChart: true, 
			label: window.innerWidth >= 768 ? 'Peak Wave Period & Direction (s & deg)' : 'Peak Wave/Dir (s & deg)',
			description: "Peak Wave Period (s)",
			backgroundColor: 'rgba(237, 135, 80, 1)',
			borderColor: 'rgba(235, 127, 74, 0.5)',
			borderWidth: 0,
			lineTension: 0,
			pointRadius: 35,
			pointStyle: arrowImageOrange,
			rotation: [],
			fill: false,
			yAxisID: 'y-axis-2',
			showLine: false,
			hidden: ( includes.hasOwnProperty( 'tp' ) ) ? !includes.tp : true
		}, 
		tm: { 
			data: [], 
			showInChart: false, 
			description: "Mean Wave Period & Direction (s & deg)",
			label: window.innerWidth >= 768 ? 'Mean Wave Period & Direction (s & deg)' : 'Mean Wave/Dir (s & deg)', // Peak Period (s)
			backgroundColor: 'rgba(77, 168, 248, 0.7)',
			borderColor: 'rgba(77, 168, 248, 0.5)',
			borderWidth: 0,
			lineTension: 0,
			pointRadius: 35,
			pointStyle: arrowImageBlue,
			rotation: [],
			fill: false,
			yAxisID: 'y-axis-2',
			hidden: ( includes.hasOwnProperty( 'tm' ) ) ? !includes.tm : true
		}, 
		dpspr: { 
			data: [], 
			showInChart: true, 
			description: "Peak Wave Directional Spreading (deg)",
		}, 
		dmspr: { 
			data: [], 
			showInChart: false, 
			description: "Mean Wave Directional Spreading (deg)",
		},
		sst: { 
			data: [], 
			showInChart: true, 
			description: "Sea Surface Temperature (degC)",
			label: window.innerWidth >= 768 ? 'Sea Surface Temperature (°C)' : 'Sea Surf (°C)', 
			backgroundColor: 'rgba(194, 59, 34, 1)',
			borderColor: 'rgba(194, 59, 34, 1)',
			borderWidth: 0,
			lineTension: 0,
			pointRadius: 2,
			fill: false,
			yAxisID: 'y-axis-3',
			hidden: ( includes.hasOwnProperty( 'sst' ) ) ? !includes.sst : true
		},
		bottomTemp: { 
			data: [], 
			showInChart: true, 
			description: "Sea Bottom Temperature (degC)",
			label: window.innerWidth ? 'Bottom Temperature (°C)' : 'Bot Temp (°C)',
			backgroundColor: 'rgb(255, 159, 64, 0.5)',
			borderColor: 'rgb(255, 159, 64, 1)',
			borderWidth: 0,
			lineTension: 0,
			pointRadius: 2,
			fill: false,
			yAxisID: 'y-axis-3',
			hidden: ( includes.hasOwnProperty( 'bottomTemp' ) ) ? !includes.bottomTemp : true
		},
		windspeed: { 
			data: [], 
			showInChart: false, 
			description: "Wind Speed (m/s)",
			label: window.innerWidth >= 768 ? 'Wind Speed (m/s & deg)' : 'Wind Spd (m/s & deg)',
			backgroundColor: 'rgba(77, 168, 248, 0.7)',
			borderColor: 'rgba(77, 168, 248, 0.5)',
			borderWidth: 0,
			lineTension: 0,
			pointRadius: 35,
			pointStyle: arrowImageBlue,
			rotation: [], // winddirec
			fill: false,
			yAxisID: 'y-axis-1',
			hidden: ( includes.hasOwnProperty( 'windspeed' ) ) ? !includes.windspeed : true
		},
		currentMag: { 
			data: [], 
			showInChart: false, 
			description: "Current Mag (m/s)",
			label: "Current Mag (m/s)",
			backgroundColor: 'rgba(165, 223, 223, 1)',
			borderColor: 'rgba(75, 192, 192, 1)',
			borderWidth: 0,
			lineTension: 0,
			pointRadius: 2,
			fill: true,
			yAxisID: 'y-axis-1',
		},
		currentDir: { 
			data: [], 
			showInChart: false, 
			description: "Current Direction (deg)",
			label: window.innerWidth >= 768 ? "Current Direction (m/s)" : "Current Dir (m/s)",
			backgroundColor: 'rgba(165, 223, 223, 1)',
			borderColor: 'rgba(75, 192, 192, 1)',
			borderWidth: 0,
			lineTension: 0,
			pointRadius: 2,
			fill: true,
			yAxisID: 'y-axis-1',
		},
		// qfWaves: { data: [], showInChart: false, description: "" }, 
		// qfSst: [], 
		// qfBottTemp: [], 
	};

	return dataPoints;
}

export const panelWrapper = "<div class='card card-primary mb-3'>" +
  "<div class='card-header'>" +
		"<h6 class='pull-left text-white'>{{ buoyLabel }} <span style='opacity: 0.35;'>#{{ buoyId }}</span><time></time></h6>" + 
		"<div class='btn-group chart-js-menu pull-right' role='group' aria-label='Chart Tools'>" + 
			"<button class='expand-trigger btn btn-outline-secondary' data-buoy-id='{{ buoyId }}'><i class='fa fa-expand' aria-hidden='true'></i>&nbsp;&nbsp;Expand</button>" +
			"<button class='maps-trigger btn btn-outline-secondary' data-buoy-id='{{ buoyId }}' data-buoy-lat='{{ buoyLat }}' data-buoy-lng='{{ buoyLng }}'><i class='fa fa-crosshairs' aria-hidden='true'></i>&nbsp;&nbsp;Centre</button>" +
			"<button class='download-trigger btn btn-outline-secondary' data-buoy-id='{{ buoyId }}'><i class='fa fa-floppy-o' aria-hidden='true'></i>&nbsp;&nbsp;Export Data</button>" +
			"<button class='calendars-trigger btn btn-outline-secondary' data-buoy-id='{{ buoyId }}' data-buoy-start='{{ buoyStartTime }}' data-buoy-end='{{ buoyEndTime }}'><i class='fa fa-calendar' aria-hidden='true'></i>&nbsp;&nbsp;<span class='dateRangeButtonLabel'>Date Range</span> <i class='fa fa-caret-down' aria-hidden='true'></i></button>" +
		"</div>" +
	"</div>" + 
	"<div class='card-body'>" + 
		"<div class='canvas-legend'></div>" +
    "<div class='canvas-wrapper loading'>" +
      "<canvas></canvas>" +
    "</div>" +
    "<h5 class='latest-observations'>Latest Observations <time></time></h5>" +
		"<div class='buoy-description'>" + 
			"<div class='decription'></div>" +
			"<div class='image'></div>" +
			"<div class='memplot'></div>" +
		"</div>" + 
		"<div class='chart-info'>" + 
		"</div>" +
  "</div>" +
"</div>";