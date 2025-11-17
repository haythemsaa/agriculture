<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Agriculteur;
use App\Models\Acheteur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:agriculteur,acheteur',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|unique:users,phone',
            'password' => ['required', 'confirmed', Password::defaults()],
            'language' => 'nullable|in:ar,fr,en',

            // Agriculteur specific
            'farm_name' => 'required_if:role,agriculteur',
            'governorate' => 'required_if:role,agriculteur',
            'delegation' => 'required_if:role,agriculteur',

            // Acheteur specific
            'buyer_type' => 'required_if:role,acheteur|in:particulier,restaurant,hotel,epicerie,autre',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Create user
            $user = User::create([
                'role' => $request->role,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'language' => $request->language ?? 'fr',
                'status' => 'pending',
            ]);

            // Create role-specific profile
            if ($request->role === 'agriculteur') {
                Agriculteur::create([
                    'user_id' => $user->id,
                    'farm_name' => $request->farm_name,
                    'governorate' => $request->governorate,
                    'delegation' => $request->delegation,
                    'bio' => $request->bio,
                    'farm_size' => $request->farm_size,
                    'latitude' => $request->latitude,
                    'longitude' => $request->longitude,
                ]);
            } else {
                Acheteur::create([
                    'user_id' => $user->id,
                    'buyer_type' => $request->buyer_type,
                    'company_name' => $request->company_name,
                ]);
            }

            // Generate token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Registration successful',
                'user' => $user->load($request->role),
                'token' => $token,
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Registration failed'], 500);
        }
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        if ($user->status !== 'active') {
            return response()->json(['error' => 'Account not active'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user->load([$user->role]),
            'token' => $token,
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        $user = $request->user()->load([$request->user()->role]);

        return response()->json(['user' => $user]);
    }

    /**
     * Update profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|unique:users,phone,' . $user->id,
            'avatar' => 'sometimes|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update($request->only(['first_name', 'last_name', 'phone']));

        if ($request->hasFile('avatar')) {
            // Handle avatar upload
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->update(['avatar' => $path]);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load([$user->role]),
        ]);
    }
}
