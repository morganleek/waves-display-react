<?php
	// Admin Options
	function wad_options_page_html() {
		if (!current_user_can('manage_options')) {
			return;
		}
		?>
			<div class="wrap">
				<h1><?= esc_html(get_admin_page_title()); ?></h1>
				<form method="post" action="options.php"> 
					<?php 
						settings_fields( 'wad-buoy-options' ); 
						do_settings_sections( 'wad-buoy-options' );

						$options = get_option('wad_options');
						$options_fields = array(
							array( 
								'label' => 'API Key',
								'name' => 'maps_key'
							),
							array( 
								'label' => 'Map Centre Lat',
								'name' => 'maps_lat'
							),
							array( 
								'label' => 'Map Centre Lng',
								'name' => 'maps_lng',
							)
						);
					?>
					<table class="form-table">
						<tbody>
							<h2>Google Maps</h2>
							<?php
								foreach( $options_fields as $field ) {
									print '<tr>';
										print '<th scope="row"><label for="wad_options[' . $field['name'] . ']">' . $field['label'] . '</label></th>';
										print '<td>';
											print '<input name="wad_options[' . $field['name'] . ']" type="text" id="wad_options[' . $field['name'] . ']" value="' . esc_attr( isset( $options[$field['name']] ) ? $options[$field['name']] : '' ) . '" class="regular-text">';
											print isset( $field['description'] ) ? '<p>' . $field['description'] . '</p>' : '';
										print '</td>';
									print '</tr>';
								}
							?>
						</tbody>
					</table>
					<?php submit_button(); ?>
				</form>
			</div>
		<?php
	}

	function wad_options_page() {
    add_menu_page(
      'Wave Display Dashboard',
      'Wave Display',
      'manage_options',
      'wad',
      'wad_options_page_html',
      'dashicons-admin-site-alt',
      20
    );
	}

	function wad_register_settings() {
		// Register Settings Options
		register_setting( 
			'wad-buoy-options', 
			'wad_options',
			'wad_sanitize_options'
		);		
	}

	function wad_sanitize_options( $option ) {
		// Sanitize Settings Options
		// todo
		return $option;
	}

	// Hooks
	add_action('admin_menu', 'wad_options_page');
	add_action('admin_init', 'wad_register_settings');