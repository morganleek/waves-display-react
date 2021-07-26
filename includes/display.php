<?php
	// Enqueue scripts and JS object
	function wad_header_scripts() {
		if ($GLOBALS['pagenow'] != 'wp-login.php' && !is_admin()) {
			// Plugin Options
			$options = get_option('wad_options');

			// wp_register_style( 'bootstrap-5-beta', 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css', array(), '5.0.0' );
			wp_register_style(
				'wad-style', WAD__PLUGIN_URL . 'dist/css/bundle.css', array( ), WAD__VERSION, 'screen'
			);
			wp_enqueue_style( 'wad-style' );

			// Register

			// // React
			wp_deregister_script( 'react' );
			wp_deregister_script( 'react-dom' );
			// // if( strpos( $_SERVER['HTTP_HOST'], 'scooter' ) ) {
			// // 	wp_register_script( 'react', 'https://unpkg.com/react@17/umd/react.development.js', array(), '17.0.2' );
			// // 	wp_register_script( 'react-dom', 'https://unpkg.com/react-dom@17/umd/react-dom.development.js', array(), '17.0.2' );
			// // }
			// // else {
			wp_register_script( 'react', 'https://unpkg.com/react@17/umd/react.production.min.js', array(), '17.0.2' );
			wp_register_script( 'react-dom', 'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js', array(), '17.0.2' );
			// // }

			// Luxon
			// wp_register_script( 'luxon', 'https://cdn.jsdelivr.net/npm/luxon@1.27.0/build/global/luxon.min.js', array(), '1.27.0' );

			// Chart.js
			// wp_register_script( 'chart.js', 'https://cdn.jsdelivr.net/npm/chart.js', array( 'luxon' ), '3.4.0' );
			
			// If needed // https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js
			wp_register_script(
				'wad-scripts', 
				WAD__PLUGIN_URL . 'dist/js/index.js', 
				array( 'jquery', 'react', 'react-dom' ),
				WAD__VERSION
			);
		
			// Enqueue
			wp_enqueue_script('wad-scripts');
			
			// Extras
			wp_localize_script( 
				'wad-scripts', 
				'wad',
				array( 
					'ajax' => admin_url( 'admin-ajax.php' ),
					'plugin' => WAD__PLUGIN_URL,
					'googleApiKey' => $options['maps_key'],
					'googleLat' => $options['maps_lat'],
					'googleLng' => $options['maps_lng']
				)
			);
		}
	}

	add_action('init', 'wad_header_scripts'); 

	function wad_crossorigin_scipts( $html, $handle ) {
		switch( $handle ) {
			case 'react':
			case 'react-dom':
			case 'chart.js':
				$html = str_replace( "></script>", " crossorigin ></script>", $html );
				break;
		}
		return $html;
	}

	add_filter( 'script_loader_tag', 'wad_crossorigin_scipts', 10, 2 );

	function wad_recent_news() {
		$time_limit = strtotime( '-1 month' );
		$the_query = new WP_Query( 
			array(
				'posts_type' => 'post',
				'posts_per_page' => 1,
				'date_query' => array(
					'after' => array(
						'year' => date('Y', $time_limit ),
						'month' => date('m', $time_limit ), 
						'day' => date('d', $time_limit )
					)
				)
			)
		);


		if ( $the_query->have_posts() ) {
				print '<div class="recent-news"><div>';
				while ( $the_query->have_posts() ) {
					$the_query->the_post();
					print '<p><a href="' . get_permalink() . '">' . get_the_title() . '</a> &mdash; ' . get_the_date( 'd M Y' ) . '</p>';
				}
				print '</div>';
			print '<a href="#" class="close-me">x</a>';
			print '</div>';
		} 

		wp_reset_postdata();
	}

	add_action( 'wp_body_open', 'wad_recent_news', 20 );