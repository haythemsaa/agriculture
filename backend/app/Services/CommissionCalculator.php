<?php

namespace App\Services;

class CommissionCalculator
{
    /**
     * Calculate platform commission based on order amount
     */
    public static function calculate(float $amount, bool $isPremium = false): float
    {
        if ($isPremium) {
            return $amount * 0.07; // 7% for premium agriculteurs
        }

        if ($amount < 50) {
            return $amount * 0.12; // 12% for small orders
        }

        if ($amount > 200) {
            return $amount * 0.08; // 8% for large orders
        }

        return $amount * 0.10; // 10% standard
    }

    /**
     * Get commission rate
     */
    public static function getRate(float $amount, bool $isPremium = false): float
    {
        if ($isPremium) {
            return 0.07;
        }

        if ($amount < 50) {
            return 0.12;
        }

        if ($amount > 200) {
            return 0.08;
        }

        return 0.10;
    }
}
