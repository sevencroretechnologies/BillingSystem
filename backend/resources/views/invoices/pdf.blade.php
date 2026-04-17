<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { color: #222; font-size: 12px; margin: 0; }
        .container { padding: 24px; }
        h1, h2, h3 { margin: 0; }
        .header { display: table; width: 100%; margin-bottom: 24px; }
        .header .col { display: table-cell; vertical-align: top; }
        .company-name { font-size: 22px; font-weight: bold; color: #1a73e8; }
        .logo { max-height: 72px; max-width: 180px; margin-bottom: 8px; }
        .muted { color: #666; }
        .right { text-align: right; }
        .mt-8 { margin-top: 8px; }
        .mt-16 { margin-top: 16px; }
        .mt-24 { margin-top: 24px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background: #f5f5f5; text-align: left; }
        .totals { width: 45%; margin-left: auto; margin-top: 16px; }
        .totals td { border: none; padding: 4px 8px; }
        .totals .grand { font-weight: bold; font-size: 14px; border-top: 2px solid #1a73e8; padding-top: 8px; }
        .label { color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; }
        .box { padding: 10px 12px; background: #fafafa; border: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        {{-- Company header rendered from the database `company` row. --}}
        <div class="header">
            <div class="col">
                @if($company->logo)
                    @php
                        $logoPath = storage_path('app/public/'.$company->logo);
                    @endphp
                    @if(file_exists($logoPath))
                        <img class="logo" src="{{ $logoPath }}" alt="Logo">
                    @endif
                @endif
                <div class="company-name">{{ $company->company_name }}</div>
                @if($company->address)<div class="muted mt-8">{{ $company->address }}</div>@endif
                <div class="muted">
                    @if($company->phone){{ $company->phone }}@endif
                    @if($company->phone && $company->email) &middot; @endif
                    @if($company->email){{ $company->email }}@endif
                </div>
            </div>
            <div class="col right">
                <h1>INVOICE</h1>
                <div class="mt-8"><span class="label">Invoice #</span> <strong>{{ $invoice->invoice_number }}</strong></div>
                <div><span class="label">Date</span> {{ $invoice->invoice_date?->format('d M Y') }}</div>
            </div>
        </div>

        <div class="box">
            <div class="label">Bill To</div>
            <div style="font-weight:bold;">{{ $invoice->customer->name ?? '—' }}</div>
            @if($invoice->customer?->phone)<div class="muted">{{ $invoice->customer->phone }}</div>@endif
            @if($invoice->customer?->email)<div class="muted">{{ $invoice->customer->email }}</div>@endif
            @if($invoice->customer?->address)<div class="muted">{{ $invoice->customer->address }}</div>@endif
        </div>

        {{-- Item table. Tax is calculated at invoice level, so each row
             shows the effective (SGST + CGST) percentage for reference. --}}
        @php
            $combinedTax = (float) $invoice->sgst_percent + (float) $invoice->cgst_percent;
        @endphp
        <table class="mt-24">
            <thead>
                <tr>
                    <th style="width:40px;">#</th>
                    <th>Item</th>
                    <th class="right" style="width:60px;">Qty</th>
                    <th class="right" style="width:100px;">Price</th>
                    <th class="right" style="width:70px;">Tax %</th>
                    <th class="right" style="width:110px;">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->items as $index => $item)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $item->item_name }}</td>
                        <td class="right">{{ $item->quantity }}</td>
                        <td class="right">{{ $currencySymbol }}{{ number_format((float) $item->price, 2) }}</td>
                        <td class="right">{{ number_format($combinedTax, 2) }}%</td>
                        <td class="right">{{ $currencySymbol }}{{ number_format((float) $item->line_total, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        {{-- Totals section with SGST + CGST breakdown. --}}
        <table class="totals">
            <tr>
                <td class="label">Subtotal</td>
                <td class="right">{{ $currencySymbol }}{{ number_format((float) $invoice->subtotal, 2) }}</td>
            </tr>
            <tr>
                <td class="label">SGST ({{ number_format((float) $invoice->sgst_percent, 2) }}%)</td>
                <td class="right">{{ $currencySymbol }}{{ number_format((float) $invoice->sgst_amount, 2) }}</td>
            </tr>
            <tr>
                <td class="label">CGST ({{ number_format((float) $invoice->cgst_percent, 2) }}%)</td>
                <td class="right">{{ $currencySymbol }}{{ number_format((float) $invoice->cgst_amount, 2) }}</td>
            </tr>
            <tr>
                <td class="label">Total Tax</td>
                <td class="right">{{ $currencySymbol }}{{ number_format((float) $invoice->total_tax, 2) }}</td>
            </tr>
            <tr class="grand">
                <td>Grand Total</td>
                <td class="right">{{ $currencySymbol }}{{ number_format((float) $invoice->grand_total, 2) }}</td>
            </tr>
        </table>

        @if($invoice->notes)
            <div class="mt-24">
                <div class="label">Notes</div>
                <div>{{ $invoice->notes }}</div>
            </div>
        @endif

        <div class="mt-24 muted right" style="font-size:11px;">Thank you for your business!</div>
    </div>
</body>
</html>
