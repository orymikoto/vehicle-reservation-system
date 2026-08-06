<?php

namespace App\Http\Controllers\Api;

use App\DTO\ApproveReservationDTO;
use App\DTO\RejectReservationDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\ApproveReservationRequest;
use App\Models\ReservationApproval;
use App\Services\ApprovalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    public function __construct(
        protected ApprovalService $approvalService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ReservationApproval::class);

        $pendingApprovals = $this->approvalService->getPendingApprovalsForUser(
            $request->user()->id,
            $request->integer('per_page', 15)
        );

        return response()->json([
            'status' => 'success',
            'data' => $pendingApprovals,
        ]);
    }

    public function approve(ApproveReservationRequest $request, string $id): JsonResponse
    {
        $dto = ApproveReservationDTO::fromArray($request->validated(), $id, $request->user()->id);
        $result = $this->approvalService->approve($dto, $request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Reservation step approved successfully.',
            'data' => $result,
        ]);
    }

    public function reject(ApproveReservationRequest $request, string $id): JsonResponse
    {
        $request->validate(['notes' => ['required', 'string', 'max:500']]);

        $dto = RejectReservationDTO::fromArray($request->validated(), $id, $request->user()->id);
        $result = $this->approvalService->reject($dto, $request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Reservation rejected.',
            'data' => $result,
        ]);
    }
}
