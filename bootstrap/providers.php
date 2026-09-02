<?php

use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;

return [
    AppServiceProvider::class,
    FortifyServiceProvider::class,
    App\Providers\AppServiceProvider::class,
    App\Providers\AuthorizationServiceProvider::class,
];
