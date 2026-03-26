<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    
            public function login(Request $request)
{
    // 1️⃣ Validate input
    $request->validate([
        'username' => 'required|string',
        'password' => 'required|string',
    ]);

    // 2️⃣ Find user
    $user = User::where('username', $request->username)->first();

    // 3️⃣ Check credentials
    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    // 4️⃣ Create token
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'access_token' => $token,
        'token_type' => 'Bearer',
        'role' => $user->role,
    ]);
}
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Successfully logged out']);
    }
    public function register(Request $request)
    {
        $validatedData = $request->validate([
            'username' => 'required|string|max:255',
            
            'password' => 'required|string|min:8',
            
        ]);

        $user = User::create([
            'username' => $validatedData['username'],
            
            'password' => bcrypt($validatedData['password']),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'role' => $user->role,
        ], 201);
    }
    
   
    public function deleteUser($id){
         $user = \App\Models\User::where('id', $id )->first();
    if (!$user) {
        return response()->json(['message' => 'user not found'], 404);
    }
    $user->delete();
    return response()->json(['message' => 'user deleted successfully'], 200);
    }
    
}
