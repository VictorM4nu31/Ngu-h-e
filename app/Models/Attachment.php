<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Attachment extends Model
{
    protected $fillable = [
        'attachable_id',
        'attachable_type',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'label',
    ];

    protected $appends = ['url'];

    public function attachable(): MorphTo
    {
        return $this->morphTo();
    }

    public function getUrlAttribute(): string
    {
        return \Illuminate\Support\Facades\Storage::url($this->file_path);
    }
}
