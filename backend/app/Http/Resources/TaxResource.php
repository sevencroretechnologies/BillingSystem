<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaxResource extends JsonResource
{
    /**
     * Transform the Tax settings model into an API response array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sgst' => (float) $this->sgst,
            'cgst' => (float) $this->cgst,
            'total' => (float) $this->sgst + (float) $this->cgst,
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
