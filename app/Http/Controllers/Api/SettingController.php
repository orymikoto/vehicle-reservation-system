<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key');

        return response()->json([
            'status' => 'success',
            'data' => $settings,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->isSuperAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. Only Super Admin can modify system settings.',
            ], 403);
        }

        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string'],
            'settings.*.value' => ['required', 'string'],
        ]);

        foreach ($validated['settings'] as $item) {
            Setting::setValue($item['key'], $item['value']);

            activity()
                ->causedBy($user)
                ->log("Setting updated: {$item['key']} set to {$item['value']}");
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Settings updated successfully.',
            'data' => Setting::all()->pluck('value', 'key'),
        ]);
    }
}
