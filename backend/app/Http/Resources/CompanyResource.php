<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CompanyResource extends JsonResource
{
    /**
     * Transform the Company settings model into an API response array.
     * The logo field is a relative storage path; logo_url is an absolute
     * URL the frontend can drop directly into an <img> tag.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_name' => $this->company_name,
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'logo' => $this->logo,
            'logo_url' => $this->logo ? Storage::disk('public')->url($this->logo) : null,
            'k2_recipient_code' => $this->k2_recipient_code,
            'gstin' => $this->gstin,
            'pan' => $this->pan,
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
