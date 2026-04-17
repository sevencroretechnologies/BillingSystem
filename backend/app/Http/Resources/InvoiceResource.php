<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    /**
     * Transform the Invoice model into an array for API responses.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'customer_id' => $this->customer_id,
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'invoice_date' => $this->invoice_date?->toDateString(),
            'subtotal' => (float) $this->subtotal,
            'sgst_percent' => (float) $this->sgst_percent,
            'cgst_percent' => (float) $this->cgst_percent,
            'sgst_amount' => (float) $this->sgst_amount,
            'cgst_amount' => (float) $this->cgst_amount,
            'tax_total' => (float) $this->tax_total,
            'total_tax' => (float) $this->total_tax,
            'grand_total' => (float) $this->grand_total,
            'notes' => $this->notes,
            'items' => InvoiceItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
