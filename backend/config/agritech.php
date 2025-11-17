<?php

return [

    /*
    |--------------------------------------------------------------------------
    | AgriTech Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration options specific to AgriTech Tunisia platform
    |
    */

    'app_name' => env('APP_NAME', 'AgriTech Tunisia'),

    /*
    |--------------------------------------------------------------------------
    | Commission Settings
    |--------------------------------------------------------------------------
    */

    'commission' => [
        'default' => env('PLATFORM_COMMISSION_DEFAULT', 10), // %
        'small_order' => env('PLATFORM_COMMISSION_SMALL', 12), // %
        'large_order' => env('PLATFORM_COMMISSION_LARGE', 8), // %
        'premium' => env('PLATFORM_COMMISSION_PREMIUM', 7), // %
        'small_order_threshold' => 50, // TND
        'large_order_threshold' => 200, // TND
    ],

    /*
    |--------------------------------------------------------------------------
    | Delivery Settings
    |--------------------------------------------------------------------------
    */

    'delivery' => [
        'base_fee' => env('DELIVERY_FEE_BASE', 5), // TND
        'per_km' => env('DELIVERY_FEE_PER_KM', 0.5), // TND
        'free_delivery_threshold' => 50, // TND
        'relay_point_fee' => 3, // TND
        'national_shipping_fee' => 15, // TND
    ],

    /*
    |--------------------------------------------------------------------------
    | Order Settings
    |--------------------------------------------------------------------------
    */

    'order' => [
        'minimum_amount' => env('MINIMUM_ORDER_AMOUNT', 10), // TND
        'cancellation_time_limit' => 24, // hours
        'auto_complete_after' => 7, // days after delivery
    ],

    /*
    |--------------------------------------------------------------------------
    | Product Settings
    |--------------------------------------------------------------------------
    */

    'product' => [
        'max_images' => 10,
        'image_max_size' => env('MAX_UPLOAD_SIZE', 10240), // KB
        'allowed_units' => ['kg', 'g', 'l', 'ml', 'piece', 'bunch', 'box', 'bag'],
        'items_per_page' => env('ITEMS_PER_PAGE', 20),
    ],

    /*
    |--------------------------------------------------------------------------
    | Rating Settings
    |--------------------------------------------------------------------------
    */

    'rating' => [
        'min' => 1,
        'max' => 5,
        'review_after_delivery' => true,
        'review_time_limit' => 30, // days after delivery
    ],

    /*
    |--------------------------------------------------------------------------
    | Loyalty Program
    |--------------------------------------------------------------------------
    */

    'loyalty' => [
        'enabled' => true,
        'points_per_tnd' => 2,
        'points_to_tnd' => 0.01, // 100 points = 1 TND
    ],

    /*
    |--------------------------------------------------------------------------
    | Weather API
    |--------------------------------------------------------------------------
    */

    'weather' => [
        'api_key' => env('OPENWEATHER_API_KEY'),
        'update_interval' => 3600, // seconds
        'forecast_days' => 7,
    ],

    /*
    |--------------------------------------------------------------------------
    | ML/AI Service
    |--------------------------------------------------------------------------
    */

    'ml' => [
        'api_url' => env('ML_API_URL', 'http://localhost:8001'),
        'api_key' => env('ML_API_KEY'),
        'timeout' => 30, // seconds
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Gateways
    |--------------------------------------------------------------------------
    */

    'payment' => [
        'gateways' => ['card', 'flouci', 'd17', 'bank_transfer', 'cod'],

        'paymee' => [
            'api_key' => env('PAYMEE_API_KEY'),
            'secret' => env('PAYMEE_SECRET'),
            'fee_rate' => 0.025, // 2.5%
        ],

        'flouci' => [
            'api_key' => env('FLOUCI_API_KEY'),
            'secret' => env('FLOUCI_SECRET'),
            'fee_rate' => 0.015, // 1.5%
        ],

        'd17' => [
            'api_key' => env('D17_API_KEY'),
            'secret' => env('D17_SECRET'),
            'fee_rate' => 0.018, // 1.8%
        ],

        'cod_fee' => 2, // TND
    ],

    /*
    |--------------------------------------------------------------------------
    | Tunisian Governorates
    |--------------------------------------------------------------------------
    */

    'governorates' => [
        'Tunis', 'Ariana', 'Ben Arous', 'Manouba',
        'Nabeul', 'Zaghouan', 'Bizerte', 'Béja',
        'Jendouba', 'Kef', 'Siliana', 'Sousse',
        'Monastir', 'Mahdia', 'Sfax', 'Kairouan',
        'Kasserine', 'Sidi Bouzid', 'Gabès', 'Médenine',
        'Tataouine', 'Gafsa', 'Tozeur', 'Kebili',
    ],

];
