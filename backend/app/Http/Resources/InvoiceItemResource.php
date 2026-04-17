<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceItemResource extends JsonResource
{
    /**
     * Transform the InvoiceItem model into an array for API responses.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_id' => $this->invoice_id,
            'item_id' => $this->item_id,
            'item_name' => $this->item_name,
            'quantity' => (int) $this->quantity,
            'price' => (float) $this->price,
            'tax_percent' => (float) $this->tax_percent,
            'line_subtotal' => (float) $this->line_subtotal,
            'line_tax' => (float) $this->line_tax,
            'line_total' => (float) $this->line_total,
        ];
    }
}
