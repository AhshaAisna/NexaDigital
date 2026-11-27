<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->invoice_number }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;color:#18181b;">
    @php
        $status = strtoupper((string) $invoice->status);
        $isPaid = $status === 'PAID';
        $badgeBg = $isPaid ? '#dcfce7' : ($isReminder ? '#ffedd5' : '#fef3c7');
        $badgeColor = $isPaid ? '#166534' : ($isReminder ? '#9a3412' : '#92400e');
        $formatRp = fn ($amount) => 'Rp ' . number_format((float) $amount, 0, ',', '.');
    @endphp

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;border:1px solid #e4e4e7;overflow:hidden;">
                    <tr>
                        <td style="background-color:#09090b;padding:28px 32px;color:#ffffff;">
                            <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#ff5a00;font-weight:700;">
                                PT NEXA DIGITAL SOLUSINDO
                            </div>
                            <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;font-weight:700;color:#ffffff;">
                                @if($isReminder)
                                    Pengingat Pembayaran Invoice
                                @elseif($isPaid)
                                    Pembayaran Diterima &amp; Invoice Lunas
                                @else
                                    Faktur Tagihan Resmi (e-Invoice)
                                @endif
                            </h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:28px 32px;">
                            <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#3f3f46;">
                                Yth. <strong>{{ $invoice->customer_name }}</strong>
                                @if(!empty($invoice->customer_company) && $invoice->customer_company !== '-')
                                    ({{ $invoice->customer_company }})
                                @endif,
                            </p>

                            <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#52525b;">
                                @if($isReminder)
                                    Ini adalah pengingat otomatis untuk tagihan proyek Anda yang masih menunggu pembayaran sebelum atau pada tanggal jatuh tempo <strong>{{ optional($invoice->due_date)->format('d M Y') ?? $invoice->due_date }}</strong>.
                                @elseif($isPaid)
                                    Terima kasih! Pembayaran Anda untuk pesanan <strong>{{ $invoice->order_id }}</strong> telah berhasil diverifikasi. Berikut adalah salinan resmi e-Invoice Anda.
                                @else
                                    Berikut adalah rincian faktur resmi untuk pemesanan layanan digital Anda di Nexa Digital.
                                @endif
                            </p>

                            <div style="margin-bottom:20px;">
                                <span style="display:inline-block;padding:6px 12px;border-radius:999px;background-color:{{ $badgeBg }};color:{{ $badgeColor }};font-size:11px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">
                                    STATUS: {{ $status }}
                                </span>
                            </div>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fafafa;border:1px solid #e4e4e7;border-radius:12px;padding:16px 20px;margin-bottom:22px;font-size:13px;">
                                <tr>
                                    <td style="padding:6px 0;color:#71717a;">Nomor Invoice</td>
                                    <td align="right" style="padding:6px 0;font-weight:700;color:#09090b;">{{ $invoice->invoice_number }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0;color:#71717a;">ID Pesanan</td>
                                    <td align="right" style="padding:6px 0;font-weight:600;color:#09090b;">{{ $invoice->order_id }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0;color:#71717a;">Layanan &amp; Paket</td>
                                    <td align="right" style="padding:6px 0;font-weight:600;color:#09090b;">{{ $invoice->service_name }} ({{ $invoice->package_name }})</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0;color:#71717a;">Tanggal Terbit</td>
                                    <td align="right" style="padding:6px 0;color:#18181b;">{{ optional($invoice->issue_date)->format('d M Y') ?? $invoice->issue_date }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0;color:#71717a;">Jatuh Tempo</td>
                                    <td align="right" style="padding:6px 0;color:#18181b;">{{ optional($invoice->due_date)->format('d M Y') ?? $invoice->due_date }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0;color:#71717a;">Subtotal</td>
                                    <td align="right" style="padding:6px 0;color:#18181b;">{{ $formatRp($invoice->subtotal) }}</td>
                                </tr>
                                @if((float) $invoice->discount_amount > 0)
                                    <tr>
                                        <td style="padding:6px 0;color:#15803d;">Diskon</td>
                                        <td align="right" style="padding:6px 0;color:#15803d;">- {{ $formatRp($invoice->discount_amount) }}</td>
                                    </tr>
                                @endif
                                <tr>
                                    <td style="padding:6px 0;color:#71717a;">PPN (11%)</td>
                                    <td align="right" style="padding:6px 0;color:#18181b;">{{ $formatRp($invoice->tax_amount) }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 0 4px;border-top:1px solid #e4e4e7;font-size:15px;font-weight:700;color:#09090b;">
                                        Total Tagihan
                                    </td>
                                    <td align="right" style="padding:12px 0 4px;border-top:1px solid #e4e4e7;font-size:17px;font-weight:700;color:#ff5a00;">
                                        {{ $formatRp($invoice->total_amount) }}
                                    </td>
                                </tr>
                            </table>

                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
                                <tr>
                                    @if(!$isPaid && !empty($paymentUrl))
                                        <td style="padding-right:10px;">
                                            <a href="{{ $paymentUrl }}" target="_blank" style="display:inline-block;padding:12px 22px;background-color:#ff5a00;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;border-radius:10px;">
                                                Bayar Sekarang via Midtrans
                                            </a>
                                        </td>
                                    @endif
                                    <td>
                                        <a href="{{ $invoiceUrl }}" target="_blank" style="display:inline-block;padding:12px 20px;background-color:#09090b;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;border-radius:10px;">
                                            Lihat Detail Invoice
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;font-size:12px;line-height:1.6;color:#71717a;">
                                {{ $invoice->notes ?: 'Dokumen ini diterbitkan secara elektronik oleh sistem Nexa Digital dan diakui sah tanpa tanda tangan basah.' }}
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color:#fafafa;border-top:1px solid #e4e4e7;padding:18px 32px;font-size:11px;color:#71717a;line-height:1.6;">
                            <strong>PT Nexa Digital Solusindo</strong><br>
                            Email: {{ config('mail.from.address') }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
