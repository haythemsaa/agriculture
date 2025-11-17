<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WeatherData;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    /**
     * Get weather forecast for a location
     */
    public function forecast(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'governorate' => 'required|string',
            'days' => 'nullable|integer|min:1|max:14',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $days = $request->get('days', 7);
        $endDate = now()->addDays($days);

        $forecast = WeatherData::forLocation($request->governorate)
            ->where('forecast_time', '>=', now())
            ->where('forecast_time', '<=', $endDate)
            ->orderBy('forecast_time')
            ->get();

        return response()->json([
            'governorate' => $request->governorate,
            'forecast' => $forecast,
        ]);
    }

    /**
     * Get current weather
     */
    public function current(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'governorate' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $current = WeatherData::forLocation($request->governorate)
            ->current()
            ->first();

        return response()->json([
            'governorate' => $request->governorate,
            'weather' => $current,
        ]);
    }

    /**
     * Get weather alerts
     */
    public function alerts(Request $request)
    {
        $query = WeatherData::alerts()
            ->where('forecast_time', '>=', now())
            ->where('forecast_time', '<=', now()->addDays(3));

        if ($request->has('governorate')) {
            $query->forLocation($request->governorate);
        }

        $alerts = $query->orderBy('forecast_time')->get();

        return response()->json(['alerts' => $alerts]);
    }
}
