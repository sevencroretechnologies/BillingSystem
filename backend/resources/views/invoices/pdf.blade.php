<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice - {{ $invoice->invoice_number }}</title>
    <style>
        @page {
            margin: 10mm;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            background: #fff;
            margin: 0;
            padding: 0;
            width: 100%;
        }
        .invoice-container {
            width: 100%;
            margin: 0 auto;
            border: 1px solid #000;
            padding: 12px;
            box-sizing: border-box;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td, th {
            padding: 3px;
            vertical-align: top;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .bold { font-weight: bold; }
        .small { font-size: 10px; }
        .divider {
            border-top: 1px solid #000;
            margin: 5px 0;
        }
        .items-header {
            font-weight: bold;
            font-size: 10px;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
        }
        .items-header th {
            padding: 5px;
        }
        .item-row td {
            font-size: 10px;
            padding: 4px 5px;
            border-bottom: 1px solid #eee;
        }
        .totals-box {
            width: 250px;
            float: right;
            border: 1px solid #000;
            margin-top: 10px;
        }
        .totals-box td {
            font-size: 10px;
            padding: 4px 8px;
            border-bottom: 1px solid #000;
        }
        .totals-box .last-row td {
            border-bottom: none;
        }
        .logo-img {
            max-width: 50px;
            max-height: 50px;
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
    <!-- Header Section -->
    <table class="small" style="margin-bottom: 2px;">
        <tr>
            <td width="35%">
                K-2 Recipient Code: {{ $company->k2_recipient_code ?? '2900789345' }}<br>
                GSTIN: {{ $company->gstin ?? '29AAGAS0338G1ZH' }}<br>
                PAN: {{ $company->pan ?? 'AAGAS0338G' }}
            </td>
            <td width="30%" class="text-center">
                <div class="bold" style="border: 1px solid #000; display: inline-block; padding: 1px 8px; font-size: 9px;">
                    CASH / CREDIT BILL
                </div>
            </td>
            <td width="35%" class="text-right">
                Phone: {{ $company->phone ?? '+91 XXXXX' }}<br>
                WhatsApp: {{ $company->whatsapp_no ?? 'XXXXX' }}
            </td>
        </tr>
    </table>

    <table class="no-border" style="width: 100%; margin-bottom: 5px;">
        <tr>
            <td width="15%" class="text-right">
                @if(isset($company->logo))
                    <img src="{{ public_path('storage/' . $company->logo) }}" class="logo-img">
                @endif
            </td>
            <td width="70%" class="text-center" style="vertical-align: middle;">
                <div class="bold" style="font-size: 14px; line-height: 1.1;">{{ $company->company_name ?? 'GlobalTrade Exports Pvt. Ltd.' }}</div>
                <div style="font-size: 9px; line-height: 1.1;">{{ $company->address ?? '' }}</div>
            </td>
            <td width="15%"></td>
        </tr>
    </table>

    <div class="divider"></div>

    <!-- Invoice Details -->
    <table class="no-border small">
        <tr>
            <td class="bold">
                No: <span style="color:red;">{{ $invoice->invoice_number }}</span>
            </td>
            <td class="text-right bold">
                Date: {{ $invoice->invoice_date->format('d-m-Y') }}
            </td>
        </tr>
    </table>

    <!-- Customer Section -->
    <div style="margin-top:5px; font-weight: bold; font-size: 11px;">
        To, {{ $invoice->customer->name ?? '' }}
    </div>

    <div style="border-bottom: 1px dashed #000; margin: 3px 0;"></div>

    <div class="text-right bold" style="font-size: 9px; padding: 1px 0;">
        Month: {{ $invoice->invoice_date->format('F-Y') }}
    </div>

    <!-- Items Table -->
    <table class="items-header" style="border: 1px solid #000;">
        <tr>
            <th width="8%" class="text-center" style="border-right: 1px solid #000;">Sl.No.</th>
            <th width="42%" class="text-left" style="border-right: 1px solid #000;">Particulars</th>
            <th width="15%" class="text-center" style="border-right: 1px solid #000;">Quantity</th>
            <th width="15%" class="text-right" style="border-right: 1px solid #000;">Rate</th>
            <th width="20%" class="text-right">Amount</th>
        </tr>
    </table>

    <table class="item-row" style="border: 1px solid #000; border-top: none;">
        @foreach($invoice->items as $i => $item)
        <tr>
            <td width="8%" class="text-center" style="border-right: 1px solid #000;">{{ sprintf('%02d', $i+1) }}.</td>
            <td width="42%" style="border-right: 1px solid #000;">{{ $item->item_name }}</td>
            <td width="15%" class="text-center" style="border-right: 1px solid #000;">{{ $item->quantity }}</td>
            <td width="15%" class="text-right" style="border-right: 1px solid #000;">{{ number_format($item->price, 2) }}/-</td>
            <td width="20%" class="text-right">{{ number_format($item->line_total, 2) }}</td>
        </tr>
        @endforeach
    </table>

    <div class="clearfix">
        <!-- Totals Box -->
        <table class="totals-box">
            <tr>
                <td width="55%" class="bold">Total</td>
                <td width="45%" class="text-right">{{ number_format($subtotal, 2) }}</td>
            </tr>
            <tr>
                <td class="bold">CGST ({{ number_format($invoice->cgst_percent, 1) }}%)</td>
                <td class="text-right">{{ number_format($cgst, 2) }}</td>
            </tr>
            <tr>
                <td class="bold">SGST ({{ number_format($invoice->sgst_percent, 1) }}%)</td>
                <td class="text-right">{{ number_format($sgst, 2) }}</td>
            </tr>
            <tr class="last-row" style="background: #f9f9f9;">
                <td class="bold" style="font-size: 11px;">Grand Total</td>
                <td class="text-right bold" style="font-size: 11px;">{{ number_format($grand_total, 2) }}</td>
            </tr>
        </table>
    </div>

    <div style="clear: both;"></div>

    <!-- Footer -->
    <div style="margin-top:10px; font-size: 10px;">
        <strong>Rupees in words:</strong> {{ $amount_in_words }}
    </div>

    <div style="text-align:right; margin-top:30px;">
        @if(isset($company->signature))
            <img src="{{ public_path('storage/' . $company->signature) }}" class="logo-img" style="max-height: 35px;"><br>
        @endif
        <strong style="font-size: 10px;">Authorized Signatory</strong><br>
        <span style="font-size: 9px;">{{ $company->company_name ?? '' }}</span>
    </div>

</div>

</body>
</html>

</div>

</body>
</html>