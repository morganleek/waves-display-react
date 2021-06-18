	<?php /* Template name: Wave Display List */ ?>

	<?php get_header(); ?>

	<main role="main">
		<!-- section -->
		<section>

		<?php if (have_posts()): while (have_posts()) : the_post(); ?>

			<!-- article -->
			<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

				<div id="cc-license" class="modal fade" tabindex="-1" role="dialog">
					<div class="modal-dialog" role="document">
						<div class="modal-content">
							<div class="modal-header">
								<h4 class="modal-title">Terms and Conditions</h4>
								<button type="button" class="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div class="modal-body">
								<p>You are free the use these data for non-commercial use under a Creative Commons non-commercial license provided you acknowledge the University of Western Australia</p>
							</div>
							<div class="modal-footer">
								<button type="button" class="btn btn-primary">Accept</button>
								<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
							</div>
						</div>
					</div>
				</div>

				<div id="map"></div>

				<div id="buoys"></div>

			</article>
			<!-- /article -->

		<?php endwhile; ?>

		<?php else: ?>

			<!-- article -->
			<article>

				<h2><?php _e( 'Sorry, nothing to display.', 'html5blank' ); ?></h2>

			</article>
			<!-- /article -->

		<?php endif; ?>

		</section>
		<!-- /section -->
	</main>

<?php get_footer(); ?>
