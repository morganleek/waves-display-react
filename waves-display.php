<?php 
	/*
	Plugin Name:  Waves Display
	Plugin URI:   https://github.com/morganleek/waves-display/
	Description:  WP Plugin for displaying buoy data
	Version:      1.0.4
	Author:       https://morganleek.me/
	Author URI:   https://morganleek.me/
	License:      GPL2
	License URI:  https://www.gnu.org/licenses/gpl-2.0.html
	Text Domain:  wporg
	Domain Path:  /languages
	*/

	// Security
	defined( 'ABSPATH' ) or die( 'No script kiddies please!' );
	
	// Plugin Data
	require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
	$plugin_data = get_plugin_data( __FILE__ );
	
	// Paths
	define( 'WAD__PLUGIN_DIR', trailingslashit( plugin_dir_path( __FILE__ ) ) );
	define( 'WAD__PLUGIN_URL', plugin_dir_url( __FILE__ ) );
	define( 'WAD__VERSION', $plugin_data['Version'] );

	// Admin
	require_once( WAD__PLUGIN_DIR . 'includes/admin.php' );

	// Display 
	require_once( WAD__PLUGIN_DIR . 'includes/display.php' );

	// Templates 
	require_once( WAD__PLUGIN_DIR . 'includes/templates.php' );