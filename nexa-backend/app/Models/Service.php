<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'category',
        'tagline',
        'description',
        'starting_price',
        'estimated_delivery',
        'icon',
        'packages_count',
        'deliverables',
        'process',
    ];

    protected $casts = [
        'starting_price' => 'float',
        'packages_count' => 'integer',
        'deliverables' => 'array',
        'process' => 'array',
    ];

    public function packages(): HasMany
    {
        return $this->hasMany(ServicePackage::class, 'service_id', 'id');
    }
}
