(function( $ ) {
	'use strict';

	/**
	 * All of the code for your public-facing JavaScript source
	 * should reside in this file.
	 *
	 * Note: It has been assumed you will write jQuery code here, so the
	 * $ function reference has been prepared for usage within the scope
	 * of this function.
	 *
	 * This enables you to define handlers, for when the DOM is ready:
	 *
	 * $(function() {
	 *
	 * });
	 *
	 * When the window is loaded:
	 *
	 * $( window ).load(function() {
	 *
	 * });
	 *
	 * ...and/or other possibilities.
	 *
	 * Ideally, it is not considered best practise to attach more than a
	 * single DOM-ready or window-load handler for a particular page.
	 * Although scripts in the WordPress core, Plugins and Themes may be
	 * practising this, we should strive to set a better example in our own work.
	 */

	 $(function(){
	 	var breadcrumb = $('#catch-breadcrumb-container');

		if (0 < breadcrumb.length) {
			if ('before' == catch_breadcrumb_object.breadcrumb_dynamic) {
				$(catch_breadcrumb_object.content_selector).before(
					breadcrumb.html()
				);
			} else if ('after' == catch_breadcrumb_object.breadcrumb_dynamic) {
				$(catch_breadcrumb_object.content_selector).after(
					breadcrumb.html()
				);
			}
			breadcrumb.remove();
		}

	 	//Show home icon
	 	if (1 == catch_breadcrumb_object.breadcrumb_home_icon) {
			var home_icon = '<span class="fa fa-home"></span> ';
			$('.woocommerce-breadcrumb .breadcrumb:first-child a').html(
				home_icon + 'Home'
			);
		}
	 });
	})( jQuery );
