<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'matramkdb' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', '' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         ')UCf-ty%8*,RAra2-|V>;zd^>,qdE=Y/._Yd?eW}R2U@XF-T5DGm1C08+`gFccID' );
define( 'SECURE_AUTH_KEY',  'A^f|ovbBr-q#,y.cd[,,Uf:(i&z+zI+S{n)jS{{f.~Xh&t7#&{iTI;Vn2U9xmRPW' );
define( 'LOGGED_IN_KEY',    'C]CBZb>5$Lpt]{Cz9sTHZ/EX4g^t./$s>I/5Qf+@1qJ-?Y{LrddZwDi,b)GSh9N(' );
define( 'NONCE_KEY',        'X4d_C97++IY|`wce@+%+tJaJcVxZ(k#Kf>E4#;~dQpW-h+,EP2>Lc,V.@:L+JwA`' );
define( 'AUTH_SALT',        'Q]9OM*SGmSI)C=MnVC.DWG_IiiN!]Oj>8mezgyOmrf*QPG}!L^5wAvn&GWtBGeXY' );
define( 'SECURE_AUTH_SALT', 'EJ<?lRS#-)#7?hj3{akf_`FMX:r22[{gsqj?-k&H9S2L90}w{kJ?)(v5_-k&eL[o' );
define( 'LOGGED_IN_SALT',   ';w.[()y|{Fjk#I*wFVWK-?8uOIO?mCX@>daLk1T/z8U++{?Yi#-FlFV]!Xm9{hUT' );
define( 'NONCE_SALT',       'fCBO|wEEE#V:Vm|)>;VUzW/N)i ujO{}D/lryMk!VPjEbOQfEjCLBNlhMW*OUE+m' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define( 'WP_DEBUG', false );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

/** Sets up WordPress vars and included files. */
require_once( ABSPATH . 'wp-settings.php' );
