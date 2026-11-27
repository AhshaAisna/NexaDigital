<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioProject extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'category',
        'client',
        'year',
        'description',
        'metrics',
        'technologies',
        'deliverables',
        'image_url',
    ];

    protected $casts = [
        'metrics' => 'array',
        'technologies' => 'array',
        'deliverables' => 'array',
    ];
}
