<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'order_id',
        'issue_date',
        'due_date',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_company',
        'service_name',
        'package_name',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'payment_method',
        'status',
        'midtrans_order_id',
        'snap_token',
        'payment_url',
        'paid_at',
        'email_sent_at',
        'last_reminded_at',
        'reminder_count',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'tax_amount' => 'float',
        'discount_amount' => 'float',
        'total_amount' => 'float',
        'issue_date' => 'date:Y-m-d',
        'due_date' => 'date:Y-m-d',
        'paid_at' => 'datetime',
        'email_sent_at' => 'datetime',
        'last_reminded_at' => 'datetime',
        'reminder_count' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }
}
