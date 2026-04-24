<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice - {{ $invoice->invoice_number }}</title>
    <style>
        @page {
            margin: 8mm;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            background: #fff;
            margin: 0;
            padding: 0;
            color: #000;
        }
        .invoice-container {
            border: 1px solid #000;
            padding: 15px;
            position: relative;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td, th {
            padding: 4px;
            vertical-align: top;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .bold { font-weight: bold; }
        .small { font-size: 11px; }
        .divider {
            border-top: 2px solid #000;
            margin: 8px 0;
        }
        .items-table {
            width: 100%;
            border: 1px solid #000;
        }
        .items-table th {
            border: 1px solid #000;
            padding: 6px 8px;
            font-weight: bold;
            font-size: 12px;
            background: #fff;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
        }
        .items-table td {
            font-size: 11px;
            padding: 5px 8px;
            border-left: 1px solid #000;
            border-right: 1px solid #000;
        }
        .items-table .empty-row td {
            height: 25px;
        }
        .items-table .last-item-row td {
            padding-bottom: 40px;
        }
        .totals-box {
            width: 320px;
            float: right;
            border: 1px solid #000;
            border-top: none;
            margin-top: 0;
        }
        .totals-box td {
            font-size: 12px;
            padding: 6px 10px;
            border: 1px solid #000;
        }
        .totals-box .label-cell {
            border-left: none;
            font-weight: bold;
        }
        .logo-img {
            max-width: 140px;
            max-height: 70px;
        }
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }
    </style>
</head>
<body>

<div class="invoice-container">
    <!-- Top Metadata -->
    <table class="small" style="margin-bottom: 10px; width: 100%;">
        <tr>
            <td width="35%">
                @if($company->k2_recipient_code) K-2 Recipient Code: {{ $company->k2_recipient_code }}<br> @endif
                @if($company->gstin) GSTIN: {{ $company->gstin }}<br> @endif
                @if($company->pan) PAN: {{ $company->pan }} @endif
            </td>
            <td width="30%" class="text-center">
                <span style="font-size: 14px; font-weight: bold;">|| Shri Banashankari Devi Prasanna ||</span><br />
                <div class="bold" style="border: 1px solid #000; display: inline-block; padding: 2px 12px; font-size: 11px; margin-top: 5px;">
                    CASH / CREDIT BILL
                </div>
            </td>
            <td width="35%" class="text-right bold">
                @if($company->phone) Phone: {{ $company->phone }}<br> @endif
                @if($company->whatsapp_no) WhatsApp: {{ $company->whatsapp_no }}<br> @endif
                {{ $company->email }}
            </td>
        </tr>
    </table>

    <!-- Company Branding -->
    <table style="margin: 0 auto; margin-bottom: 10px;">
        <tr>
            @if($company->logo && file_exists(public_path('storage/' . $company->logo)))
            <td style="vertical-align: middle; padding-right: 15px;">
                <img src="{{ public_path('storage/' . $company->logo) }}" class="logo-img">
            </td>
            @endif
            <td class="text-center" style="vertical-align: middle;">
                <div class="bold" style="font-size: 20px; text-transform: uppercase; line-height: 1.1;">{{ $company->company_name ?? 'Your Company' }}</div>
                <div style="font-size: 11px; margin-top: 2px;">{{ $company->address ?? '' }}</div>
            </td>
        </tr>
    </table>

    <div class="divider"></div>

    <!-- Invoice No/Date -->
    <table class="bold" style="font-size: 14px; margin-bottom: 5px; width: 100%;">
        <tr>
            <td>No: <span style="color:#d00;">{{ $invoice->invoice_number }}</span></td>
            <td class="text-right">Date: {{ $invoice->invoice_date->format('d-m-Y') }}</td>
        </tr>
    </table>

    <!-- Month & Customer -->
    <div class="text-right bold" style="font-size: 12px; margin-bottom: 10px;">
        Month: {{ $invoice->invoice_date->format('F-Y') }}
    </div>

    <div style="margin-bottom: 15px;">
        <span style="font-weight: bold; font-size: 14px; margin-right: 5px;">To,</span>
        <span style="font-size: 14px; font-weight: bold; border-bottom: 1px dotted #000; display: inline-block; width: 80%;">
            {{ $invoice->customer->name ?? '' }}
        </span>
    </div>

    <!-- Items Table -->
    <table class="items-table" style="width: 100%;">
        <thead>
            <tr>
                <th width="8%" class="text-center">Sl.No.</th>
                <th width="47%" class="text-center">Particulars</th>
                <th width="15%" class="text-center">Quantity</th>
                <th width="15%" class="text-center">Rate</th>
                <th width="15%" class="text-center">Amount</th>
            </tr>
        </thead>
        <tbody>
            @php $count = count($invoice->items); @endphp
            @foreach($invoice->items as $i => $item)
            <tr class="{{ ($i == $count - 1 && $count >= 5) ? 'last-item-row' : '' }}">
                <td class="text-center">{{ sprintf('%02d', $i+1) }}.</td>
                <td class="text-left text-bold" style="font-weight: bold;">{{ $item->item_name }}</td>
                <td class="text-center">{{ $item->quantity }}</td>
                <td class="text-center">{{ round($item->price) }}/-</td>
                <td class="text-right">{{ number_format($item->line_total, 2) }}</td>
            </tr>
            @endforeach

            @php $emptyCount = max(5 - $count, 0); @endphp
            @for($i = 0; $i < $emptyCount; $i++)
            <tr class="empty-row {{ ($i == $emptyCount - 1) ? 'last-item-row' : '' }}">
                <td class="text-center"><br></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            @endfor
        </tbody>
    </table>

    <div class="clearfix">
        <!-- Totals Box -->
        <table class="totals-box">
            <tr>
                <td width="55%" class="label-cell">Total</td>
                <td width="45%" class="text-right bold">{{ number_format($subtotal, 2) }}</td>
            </tr>
            <tr>
                <td class="label-cell">CGST ({{ number_format($invoice->cgst_percent, 1) }}%)</td>
                <td class="text-right bold">{{ number_format($cgst, 2) }}</td>
            </tr>
            <tr>
                <td class="label-cell">SGST ({{ number_format($invoice->sgst_percent, 1) }}%)</td>
                <td class="text-right bold">{{ number_format($sgst, 2) }}</td>
            </tr>
            <tr>
                <td class="label-cell" style="border-bottom: none;">Grand Total</td>
                <td class="text-right bold" style="border-bottom: none; font-size: 14px;">{{ number_format($grand_total, 2) }}</td>
            </tr>
        </table>
    </div>

    <!-- Footer -->
    <div style="margin-top: 30px; font-size: 12px; width: 60%; float: left;">
        Rupees in words: <br>
        <span style="font-weight: bold; border-bottom: 1px dotted #000; padding-bottom: 2px; font-size: 13px;">
            {{ $amount_in_words }}
        </span>
    </div>

    <div style="float: right; width: 35%; text-align: right; margin-top: 20px;">
        @if($company->signature && file_exists(public_path('storage/' . $company->signature)))
            <img src="{{ public_path('storage/' . $company->signature) }}" style="max-height: 50px; max-width: 150px;"><br>
        @else
            <div style="height: 50px;"></div>
        @endif
        <div style="border-top: 1px solid #000; display: inline-block; padding-top: 5px; text-align: left;">
            <div class="bold" style="font-size: 12px;">Authorized Signatory</div>
        </div>
    </div>
    <div style="clear: both;"></div>

</div>

</body>
</html>