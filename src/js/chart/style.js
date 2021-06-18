export default {
	"axesStyles" : { 
		"timeAxes" : {
			"distribution": "linear",
			"ticks": {
				"min": 0,
				"maxTicksLimit": 7,
				// "fontSize": "11",
				"padding": 0
			},
			"type": "time",
			"time": {
				"stepSize": 8,
				"unit": "hour",
				"displayFormats": {
					"hour": "D/MM H:mm", //  
					"minute": "ha"
				},
			},
			"scaleLabel": {
				"display": false
			}
		},
		"waveHeightAxes": {
			"type": "linear",
			"display": true,
			"position": "left",
			"id": "y-axis-1",
			"ticks": {
				"beginAtZero": true,
				"min": 0,
				"max": 20,
				"maxTicksLimit": 6
			},
			"scaleLabel": {
				"display": false,
				"labelString": "Wave height (m)"
			}
		},
		"peakPeriodAxes": {
			"type": "linear", 
			"display": true,
			"position": "right",
			"id": "y-axis-2",
			"gridLines": {
				"drawOnChartArea": false
			},
			"ticks": {
				"beginAtZero": true,
				"min": 0,
				"max": 20,
				"maxTicksLimit": 6
			},
			"scaleLabel": {
				"display": false,
				"labelString": "Peak period (s)"
			}
		},
		"windSpeedAxes": {
			"type": "linear",
			"display": true,
			"position": "left",
			"id": "y-axis-1",
			"ticks": {
				"beginAtZero": true,
				"min": 0,
				"maxTicksLimit": 6
			},
			"scaleLabel": {
				"display": true,
				"labelString": "Wind speed (m/s & deg)"
			}
		},
		"tempAxes": {
			"type": "linear", 
			"display": true,
			"position": "right",
			"id": "y-axis-3",
			"gridLines": {
				"drawOnChartArea": false
			},
			"ticks": {
				"beginAtZero": true,
				"min": 15,
				"max": 25,
				"maxTicksLimit": 6
			},
			"scaleLabel": {
				"display": false,
				"labelString": "Temp (Deg C)"
			}
		}
	}
}