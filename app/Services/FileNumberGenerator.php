<?php

namespace App\Services;

use App\Models\CompanySettings;
use App\Models\Matter;
use App\Models\PracticeArea;

class FileNumberGenerator
{
    /**
     * Generate a unique file number for a new matter.
     *
     * The format is driven by Company Settings, e.g.
     * "{firm_code}/{practice_code}/{year}/{sequence}" → "KAA/CV/2026/001".
     *
     * Supported tokens: {firm_code} {practice_code} {year} {sequence}
     */
    public function generate(PracticeArea $practiceArea): string
    {
        $settings = CompanySettings::current();

        $year = (string) now()->year;
        $firmCode = strtoupper($settings->firm_code ?: 'KAA');
        $practiceCode = $practiceArea->code;
        $seqLength = max(1, (int) ($settings->file_number_sequence_length ?: 3));
        $format = $settings->file_number_format ?: '{firm_code}/{practice_code}/{year}/{sequence}';

        // LIKE pattern: static parts as-is, sequence token becomes a wildcard
        $likePattern = str_replace(
            ['{firm_code}', '{practice_code}', '{year}', '{sequence}'],
            [$firmCode, $practiceCode, $year, '%'],
            $format
        );

        // Regex to extract the sequence digits from each matching file number
        $regex = '/^' . str_replace(
            ['\{firm_code\}', '\{practice_code\}', '\{year\}', '\{sequence\}'],
            [preg_quote($firmCode, '/'), preg_quote($practiceCode, '/'), $year, '(\d+)'],
            preg_quote($format, '/')
        ) . '$/';

        // Pull every file number matching this firm/practice/year,
        // then find the highest sequence in PHP (DB-agnostic).
        $numbers = Matter::where('file_number', 'like', $likePattern)
            ->pluck('file_number');

        $max = 0;
        foreach ($numbers as $number) {
            if (preg_match($regex, $number, $matches)) {
                $max = max($max, (int) $matches[1]);
            }
        }

        $sequence = str_pad((string) ($max + 1), $seqLength, '0', STR_PAD_LEFT);

        return str_replace(
            ['{firm_code}', '{practice_code}', '{year}', '{sequence}'],
            [$firmCode, $practiceCode, $year, $sequence],
            $format
        );
    }
}
