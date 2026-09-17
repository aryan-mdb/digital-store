<?php

use App\Http\Controllers\MediaController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/media/products/{product}/thumbnail', [MediaController::class, 'productThumbnail']);
Route::get('/media/categories/{category}/image', [MediaController::class, 'categoryImage']);
