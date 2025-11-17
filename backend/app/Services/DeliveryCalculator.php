<?php

namespace App\Services;

class DeliveryCalculator
{
    /**
     * Calculate delivery fee based on type and order amount
     */
    public static function calculate(string $deliveryType, float $orderAmount, ?float $distance = null): float
    {
        return match($deliveryType) {
            'pickup' => 0,
            'relay_point' => 3,
            'home_delivery' => self::calculateHomeDelivery($orderAmount, $distance),
            'shipping' => self::calculateShipping($distance),
            default => 0,
        };
    }

    /**
     * Calculate home delivery fee
     */
    private static function calculateHomeDelivery(float $orderAmount, ?float $distance): float
    {
        $baseFee = $orderAmount > 50 ? 5 : 10;

        if ($distance) {
            // Add 0.5 TND per km after 10km
            $distanceFee = max(0, ($distance - 10) * 0.5);
            return $baseFee + $distanceFee;
        }

        return $baseFee;
    }

    /**
     * Calculate shipping fee for national delivery
     */
    private static function calculateShipping(?float $distance): float
    {
        if (!$distance) {
            return 15; // Default national shipping
        }

        // Base fee + distance-based fee
        return 10 + ($distance * 0.3);
    }

    /**
     * Get estimated delivery time in days
     */
    public static function getEstimatedDays(string $deliveryType, ?float $distance = null): int
    {
        return match($deliveryType) {
            'pickup' => 0,
            'relay_point' => 1,
            'home_delivery' => $distance && $distance > 50 ? 2 : 1,
            'shipping' => $distance && $distance > 200 ? 3 : 2,
            default => 1,
        };
    }
}
