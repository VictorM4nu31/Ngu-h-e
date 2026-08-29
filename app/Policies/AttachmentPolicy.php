<?php

namespace App\Policies;

use App\Models\Attachment;
use App\Models\User;

class AttachmentPolicy
{
    /**
     * Staff (admin, doctor, receptionist) manage patient attachments.
     */
    public function create(User $user): bool
    {
        return $this->isStaff($user);
    }

    public function view(User $user, Attachment $attachment): bool
    {
        return $this->isStaff($user);
    }

    public function delete(User $user, Attachment $attachment): bool
    {
        return $this->isStaff($user);
    }

    private function isStaff(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'doctor', 'receptionist']);
    }
}
