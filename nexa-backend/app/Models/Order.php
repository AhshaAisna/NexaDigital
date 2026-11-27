<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'invoice_number',
        'service_id',
        'service_name',
        'package_id',
        'package_name',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_company',
        'order_date',
        'deadline',
        'price',
        'tax',
        'discount',
        'total',
        'payment_method',
        'payment_status',
        'midtrans_order_id',
        'snap_token',
        'payment_url',
        'payment_type',
        'transaction_status',
        'paid_at',
        'midtrans_response',
        'project_status',
        'progress',
        'assigned_team',
        'requirements',
        'timeline',
        'messages',
        'files',
    ];

    protected $casts = [
        'price' => 'float',
        'tax' => 'float',
        'discount' => 'float',
        'total' => 'float',
        'progress' => 'integer',
        'requirements' => 'array',
        'timeline' => 'array',
        'messages' => 'array',
        'files' => 'array',
        'midtrans_response' => 'array',
        'paid_at' => 'datetime',
        'order_date' => 'date:Y-m-d',
        'deadline' => 'date:Y-m-d',
    ];

    protected $appends = [
        'customer',
        'invoiceNumber',
        'serviceId',
        'serviceName',
        'packageId',
        'packageName',
        'paymentMethod',
        'paymentStatus',
        'midtransOrderId',
        'snapToken',
        'paymentUrl',
        'paymentType',
        'transactionStatus',
        'projectStatus',
        'assignedTeam',
        'orderDate',
    ];

    /**
     * Group customer info into an object for easy frontend consumption.
     */
    public function getCustomerAttribute(): array
    {
        return [
            'name' => $this->attributes['customer_name'] ?? '',
            'email' => $this->attributes['customer_email'] ?? '',
            'phone' => $this->attributes['customer_phone'] ?? '',
            'company' => $this->attributes['customer_company'] ?? '-',
        ];
    }

    public function getInvoiceNumberAttribute(): ?string
    {
        return $this->attributes['invoice_number'] ?? null;
    }

    public function getServiceIdAttribute(): ?string
    {
        return $this->attributes['service_id'] ?? null;
    }

    public function getServiceNameAttribute(): ?string
    {
        return $this->attributes['service_name'] ?? null;
    }

    public function getPackageIdAttribute(): ?string
    {
        return $this->attributes['package_id'] ?? null;
    }

    public function getPackageNameAttribute(): ?string
    {
        return $this->attributes['package_name'] ?? null;
    }

    public function getPaymentMethodAttribute(): ?string
    {
        return $this->attributes['payment_method'] ?? null;
    }

    public function getPaymentStatusAttribute(): ?string
    {
        return $this->attributes['payment_status'] ?? null;
    }

    public function getMidtransOrderIdAttribute(): ?string
    {
        return $this->attributes['midtrans_order_id'] ?? null;
    }

    public function getSnapTokenAttribute(): ?string
    {
        return $this->attributes['snap_token'] ?? null;
    }

    public function getPaymentUrlAttribute(): ?string
    {
        return $this->attributes['payment_url'] ?? null;
    }

    public function getPaymentTypeAttribute(): ?string
    {
        return $this->attributes['payment_type'] ?? null;
    }

    public function getTransactionStatusAttribute(): ?string
    {
        return $this->attributes['transaction_status'] ?? null;
    }

    public function toArray(): array
    {
        $array = parent::toArray();
        $array['paidAt'] = $this->paid_at?->toISOString();
        return $array;
    }

    public function getProjectStatusAttribute(): ?string
    {
        return $this->attributes['project_status'] ?? null;
    }

    public function getAssignedTeamAttribute(): ?string
    {
        return $this->attributes['assigned_team'] ?? null;
    }

    public function getOrderDateAttribute(): ?string
    {
        if (!isset($this->attributes['order_date'])) return null;
        return is_string($this->attributes['order_date'])
            ? substr($this->attributes['order_date'], 0, 10)
            : $this->attributes['order_date'];
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class, 'order_id', 'id');
    }
}
