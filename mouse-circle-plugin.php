<?php
/**
 * Plugin Name: Mouse Circle Plugin
 * Description: Zeichnet einen Kreis um den Mauszeiger auf den Hintergrund des Body-Elements.
 * Version: 1.0
 * Author: Dein Name
 */

// Fügt das JavaScript dem Footer der Seite hinzu
function mouse_circle_plugin_enqueue_scripts() {
    wp_enqueue_script('mouse-circle-plugin-script', plugin_dir_url(__FILE__) . 'mouse-circle-plugin.js', array(), '1.0', true);
}
add_action('wp_enqueue_scripts', 'mouse_circle_plugin_enqueue_scripts');
