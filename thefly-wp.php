<?php
/*
/**
 * The fly
 *
 * @package           thefly
 * @author            Hèctor Vidal Teixidó
 * @copyright         2023 Hèctor Vidal Teixidó
 * @license           GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name:       The Fly
 * Description:       Just a Fly on your web window. You can try to smash it, but some parent will come to the burial. Right click to kill a whole family. Just for fun. It also makes user pay atention to the screen.
 * Version:           1.2
 * Requires at least: 4.7
 * Requires PHP:      7.2
 * Author:            Hèctor Vidal Teixidó
 * Author URI:        https://www.linkedin.com/in/hectormultimediaspecialist/
 * Text Domain:       plugin-thefly
 * License:           GPL v2 or later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
*/

// Do NOT allow direct access

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/* Initialice the plugin by registering the JS library
* and initialize/read the array of options
*/

//Set the default number of authomatic flies
$theFly_options = array('automatic_flies_number' => 1);

// Using 'add_option' will ignore the default option if already set.
add_option('theFly_options', $theFly_options );

function theFly_activate() {
    /* registrar la llibreria de javascript */
    wp_register_script('theFly_script_handle',
        plugin_dir_url(__FILE__).'js/thefly.js',
        array('jquery'),
        null,
        array(
            'strategy'  => 'defer',
        )
    );
    wp_register_script('theFly_ajax_script','',array('jquery'),null,array('strategy' => 'defer'));
  }
register_activation_hook( __FILE__, 'theFly_activate' );

function theFly_initFly() {
    // Carrega el JS pre-registrat    
    $plugdir = plugin_dir_url(__FILE__);
    wp_enqueue_script('theFly_script_handle',esc_url($plugdir.'js/thefly.js'),array('jquery'),null, array('strategy' => 'defer'));
    wp_register_script('theFly_ajax_script','',array('jquery'),null,array('strategy' => 'defer'));
}
add_action( 'theFly_initFly', 'theFly_initFly');

// Shortcode that generates a Fly

function theFly_newFly_shortcode() {
    do_action('theFly_initFly');
    wp_add_inline_script( 'theFly_script_handle',
        'setTimeout(() => {
            theFly_plugin.initFly("'.plugin_dir_url(__FILE__).'");
        },
        1000);');

    return '';
}
add_shortcode('theFly_newFly', 'theFly_newFly_shortcode');

// Another shortcode to create a button for a new fly

function theFly_newFlyButton_shortcode(){
    do_action('theFly_initFly');
    $plugdir = plugin_dir_url(__FILE__);
    wp_add_inline_script( 'theFly_script_handle', 'function theFly_newFlyButton() {theFly_plugin.initFly("'.esc_url($plugdir).'");}');
    $ret_safe = '<button onclick="theFly_newFlyButton();"><img src="'.esc_url($plugdir.'img/fly.gif').'" width="16px"></button>';

    return $ret_safe;
}
add_shortcode('theFly_newFlyButton', 'theFly_newFlyButton_shortcode');

// Adds the plugin's page to the menu
function theFly_menu() {
    add_menu_page('The Fly', 'The Fly', 'manage_options', 'theFly-menu', 'theFly_page', '', 200);
}
add_action('admin_menu', 'theFly_menu');

// Plugin's page 
function theFly_page() {
    $plugdir = plugin_dir_url(__FILE__);
    $theFly_options = get_option('theFly_options',array('automatic_flies_number' => -1));
    do_action('theFly_initFly');

	wp_localize_script(
		'theFly_ajax_script',
		'theFly_ajax_obj',
		array(
			'ajax_url' => admin_url( 'admin-ajax.php' ),
			'nonce'    => wp_create_nonce( 'theFly_update_mumber' ),
		)
	);
    /* The AJAX code to update and save the plugin settings */
    wp_add_inline_script( 'theFly_ajax_script',
        "
        function theFly_setOptions(numberOfFlies){
            jQuery(document).ready(function($){
                console.log(numberOfFlies);
                $.get(theFly_ajax_obj.ajax_url, {      
			          _ajax_nonce: theFly_ajax_obj.nonce,
			          action: 'theFly_update_numFlies', 
			          numFlies: numberOfFlies           
			          },
                      function(data) {
                         jQuery('#theFly_ajax_result').css('visibility','visible');
                         setTimeout(() => {jQuery('#theFly_ajax_result').css('visibility','hidden');},250);
			          }
                );
            });
        }"
    );

    echo '<div class="wrap">';
    echo '<div style="background-color:#488aac;width: 100%;"><img src= "'.esc_url($plugdir.'img/banner-772x250.jpg').'" width="772px"> </div>';
    echo '<h1>The Fly</h1>';
    echo '<p>This plugin will display a Fly (or many) moving around the window on your website. They are created automatically every time a page is loaded. You can set the number of flies you want to be generated automatically or you may use [shortcodes] to add as many flies as you want on your document. Or combine both. </p>';
    echo '<p> Using [shortcodes] you can also display a button to create flies on demand. Finally, with another [shortcode] a RIP button will serve to remove some of them. If you right-click on any fly, it will destroy itself and all its parents.</p>';
    echo '<p>Oh!, by the way, the flies will block any click to the elements under them. Nothing to worry about, just to make them more annoying.</p>';
    echo '<br><h2>Set the number of automatic flies</h2>';
    echo '<p><label for="theFly_quantity">How many automatic flies do you want? (0 = none): </label>';
    echo '<input type="number" id="theFly_quantity" name="theFly_quantity" min="0" max="50" onchange="theFly_setOptions(this.value)" value="'.esc_attr($theFly_options['automatic_flies_number']).'">';

    echo '<span id="theFly_ajax_result" style="visibility:hidden;color:#488aac"> saved</span></p>';

    echo '<br><h2>How to use shortcode to activate the plugin</h2>';
    echo '<ul>';
    echo '<li><strong><big>[theFly_newFly]</big></strong><br>Adding this shortcode on a document, creates a new fly on load. Or as many flies as shortcodes inserted, each belonging to different flies family.<br><br></li>';
    echo '<li><strong><big>[theFly_newFlyButton]</big></strong><br>This shortcode, inserts a button to create a new fly.<small><button><img src="'.esc_url($plugdir.'img/fly.gif').'" width="16px"></button></small>.<br><br></li>';
    echo '<li><strong><big>[theFly_killFlies]</big></strong><br>A shortcode to create a [RIP] button that will erase some flies. Right-click on any fly to remove itself and its parents.</li>';
    echo '</ul>';
    echo '<br><h2>A note about copyrights.</h2>';
    echo '<p>The image of the fly was borrowed from the web at <a href = "https://es.picmix.com/stamp/fly-fliege-voler-insect-halloween-gothic-tube-summer-ete-gif-anime-animated-animation-1595690" target="_blank" rel="license">es.picmix.com</a>, published by user <strong>Nightmare71</strong>. All credits for the original image to her.</p>';
    echo '<br><h2>I am guilty</h2>';
    echo '<p>Any question about the plugin or if you want to personalize it, please contact the author (me) by mail to <a href="mailto:willowwolful@gmail.com" rel="author" target="_blank">Hèctor Vidal</a>. Any comment is welcome. Money too! ;)</p>';
    echo '</div>';
}

// killFlies Shortcode to insert a button to remove flies.
function theFly_killFlies_shortcode() {
    wp_add_inline_script( 'theFly_script_handle', 
        "function theFly_kill(){
            var moscas = document.getElementsByClassName('theFly-fly-container');
            for (mosca of moscas){mosca.remove()}};"
    );
    return '<small>Right click on any fly to erase a whole family. Or press <button onclick="theFly_kill()">RIP</button> to kill some.</small>';
}
add_shortcode('theFly_killFlies', 'theFly_killFlies_shortcode');

// Function to add flies as shortcodes automatically from 'wp_head' action

function theFly_head_content() {
    $theFly_options = get_option('theFly_options',array('automatic_flies_number' => -1));
    for ($i = 1; $i <= $theFly_options['automatic_flies_number']; $i++){
        echo do_shortcode('[theFly_newFly]');
    }
}

add_action( 'admin_enqueue_scripts', 'my_enqueue' );

/**
 * Enqueue my scripts and assets.
 *
 * @param $hook
 */

function my_enqueue( $hook ) {

	wp_enqueue_script(
		'theFly_ajax_script',
        '',
		array( 'jquery' ),
		'1.0.0',
		true
	);

	wp_localize_script(
		'theFly_ajax_script',
		'theFly_ajax_obj',
		array(
			'ajax_url' => admin_url( 'admin-ajax.php' ),
			'nonce'    => wp_create_nonce( 'theFly_update_mumber' ),
		)
	);
}

add_action( 'wp_ajax_theFly_update_numFlies', 'theFly_ajax_handler' );

/**
 * Handles my AJAX request.
 */
function theFly_ajax_handler() {
    check_ajax_referer( 'theFly_update_mumber' );
    $theFly_options['automatic_flies_number'] = wp_unslash( $_REQUEST['numFlies'] );
    update_option('theFly_options',$theFly_options);
	wp_die(); // All ajax handlers die when finished
}

// Aaaand Action!! This line starts the automatic flies on public pages.
add_action('wp_head', 'theFly_head_content');


?>
