<?php

namespace App\Http\Controllers;

use App\Actions\Attachments\UploadAttachmentAction;
use App\Models\Attachment;
use App\Models\Patient;
use Illuminate\Http\Request;

class AttachmentController extends Controller
{
    public function storePatient(Request $request, Patient $patient, UploadAttachmentAction $action)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'label' => 'nullable|string|max:255',
        ]);

        $action->execute($patient, $request->file('file'), $request->input('label'));

        return redirect()->back()->with('success', 'Archivo adjunto guardado.');
    }

    public function destroy(Attachment $attachment)
    {
        \Illuminate\Support\Facades\Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        return redirect()->back()->with('success', 'Archivo eliminado.');
    }
}
