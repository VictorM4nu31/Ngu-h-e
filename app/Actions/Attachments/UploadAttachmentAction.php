<?php

namespace App\Actions\Attachments;

use App\Models\Attachment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UploadAttachmentAction
{
    public function execute(Model $model, UploadedFile $file, ?string $label = null): Attachment
    {
        $path = $file->store('attachments/' . strtolower(class_basename($model)), 'public');

        return $model->attachments()->create([
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'label' => $label,
        ]);
    }
}
