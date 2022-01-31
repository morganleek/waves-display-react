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
						$options_tables = array(
							array(
								'title' => 'Google Maps',
								'fields' => array(
									array( 
										'label' => 'Google Maps API Key',
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
								)
							),
							array(
								'title' => 'Observation Table',
								'fields' => array(
									array( 
										'label' => 'Visible Fields',
										'name' => 'obs_table_fields',
										'placeholder' => '*'
									)
								)
							),
							array(
								'title' => 'Historic Data',
								'fields' => array(
									array(
										'label' => 'Show Selection Key',
										'name' => 'buoy_display_key',
										'type' => 'checkbox'
									),
									array(
										'label' => 'Live Buoys Initial State',
										'name' => 'buoy_display_init_current',
										'type' => 'checkbox'
									),
									array( 
										'label' => 'Historic Buoys Initial State',
										'name' => 'buoy_display_init_historic',
										'type' => 'checkbox'
									)
								)
							),
							array(
								'title' => 'Export',
								'fields' => array(
									array(
										'label' => 'Require user info for download',
										'name' => 'buoy_display_require_user_info',
										'type' => 'checkbox'
									)
								)
							)
						);

						foreach( $options_tables as $table ) {
							if( !empty( $table['title'] ) ) {
								print "<h2 class='title'>" . $table['title'] . "</h2>";
							}
							if( !empty( $table['fields'] ) ) {
							?>
								<table class="form-table">
									<tbody>
										<?php
											foreach( $table['fields'] as $field ) {
												$name = 'wad_options[' . $field['name'] . ']';
												$type = isset( $field['type'] ) ? $field['type'] : 'text';
												$value = $type == 'text' ? esc_attr( isset( $options[$field['name']] ) ? $options[$field['name']] : '' ) : '1';
												$checked = $type == 'checkbox' ? checked( '1', $options[$field['name']], false ) : '';
												print '<tr>';
													print '<th scope="row"><label for="' . $name . '">' . $field['label'] . '</label></th>';
													print '<td>';
														print '<input 
															name="' . $name . '" 
															type="' . $type. '" 
															id="' . $name . '" 
															value="' . $value . '" 
															' . $checked . '
															placeholder="' . $field['placeholder'] . '" 
															class="regular-text">';
														print isset( $field['description'] ) ? '<p>' . $field['description'] . '</p>' : '';
													print '</td>';
													
												print '</tr>';
											}
										?>
									</tbody>
								</table>
							<?php
							}
						}
					?>
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