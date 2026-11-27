<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServicePackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'package_code',
        'name',
        'price',
        'delivery_time',
        'revisions',
        'screens',
        'features',
        'not_included',
        'is_recommended',
    ];

    protected $casts = [
        'price' => 'float',
        'features' => 'array',
        'not_included' => 'array',
        'is_recommended' => 'boolean',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_id', 'id');
    }
}
