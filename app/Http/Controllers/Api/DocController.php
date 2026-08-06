<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class DocController extends Controller
{
    public function getReadme(): JsonResponse
    {
        $path = base_path('README.md');
        $content = file_exists($path) ? file_get_contents($path) : 'README.md file not found.';

        return response()->json([
            'status' => 'success',
            'data' => [
                'filename' => 'README.md',
                'content' => $content,
            ],
        ]);
    }

    public function getNote(): JsonResponse
    {
        $path = base_path('NOTE.md');
        $content = file_exists($path) ? file_get_contents($path) : 'NOTE.md file not found.';

        return response()->json([
            'status' => 'success',
            'data' => [
                'filename' => 'NOTE.md',
                'content' => $content,
            ],
        ]);
    }
}
