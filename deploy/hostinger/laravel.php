<?php

/*
 * Front controller for the Laravel API on Hostinger shared hosting.
 *
 * Copied into public_html. .htaccess sends /api/* and /media/* here, so
 * the React build and the API share one domain (payanfoods.com). The
 * Laravel app itself lives outside public_html, in ~/payan/repo/backend.
 */

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// public_html is ~/domains/payanfoods.com/public_html → three levels up is ~.
$base = dirname(__DIR__, 3).'/payan/repo/backend';

if (file_exists($maintenance = $base.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $base.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $base.'/bootstrap/app.php';

$app->handleRequest(Request::capture());
