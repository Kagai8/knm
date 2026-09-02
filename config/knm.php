<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Firm Identity
    |--------------------------------------------------------------------------
    |
    | The firm's name and prefix. The prefix is used in file numbers.
    |
    */
    'firm' => [
        'name' => 'K&A Advocates',
        'prefix' => 'KAA',
    ],

    /*
    |--------------------------------------------------------------------------
    | Matter Number Format
    |--------------------------------------------------------------------------
    |
    | The template used to generate matter file numbers.
    |
    | Available placeholders:
    |   {firm_prefix}        → firm.prefix above (e.g. "KAA")
    |   {practice_area_code} → the practice area's code (e.g. "CV")
    |   {year}               → the current year (e.g. "2026")
    |   {sequence}           → zero-padded sequence number (e.g. "014")
    |
    | Examples:
    |   {firm_prefix}/{practice_area_code}/{year}/{sequence}  → KAA/CV/2026/014
    |   {firm_prefix}-{year}-{practice_area_code}-{sequence}  → KAA-2026-CV-014
    |
    | Change the format here anytime — no code changes needed.
    |
    */
    'matter_number' => [
        'format' => '{firm_prefix}/{practice_area_code}/{year}/{sequence}',
        'sequence_padding' => 3,
    ],

    /*
    |--------------------------------------------------------------------------
    | Conflict Check
    |--------------------------------------------------------------------------
    |
    | The fields searched when running a conflict check against clients,
    | contacts, and past matters.
    |
    */
    'conflict_check' => [
        'fields' => [
            'name',
            'email',
            'phone',
            'id_number',
            'company_name',
            'company_registration',
        ],
    ],

];
