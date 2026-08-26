<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function update(User $actor, User $target): bool
    {
        return $actor->isAdmin();
    }

    /**
     * The very first admin account (lowest id with role=admin) can never be
     * blocked/deleted/demoted, even by another admin, so the platform can
     * never be locked out entirely.
     */
    public function modifyRoleOrStatus(User $actor, User $target): bool
    {
        if (! $actor->isAdmin()) {
            return false;
        }

        $mainAdminId = User::where('role', User::ROLE_ADMIN)->min('id');

        return $target->id !== $mainAdminId;
    }

    public function delete(User $actor, User $target): bool
    {
        if (! $actor->isAdmin()) {
            return false;
        }

        $mainAdminId = User::where('role', User::ROLE_ADMIN)->min('id');

        return $target->id !== $mainAdminId && $target->id !== $actor->id;
    }
}
