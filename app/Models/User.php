<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Default attribute values, matching the column defaults of the database.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'role' => UserRole::Couple->value,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'must_change_password' => 'boolean',
            'role' => UserRole::class,
        ];
    }

    /**
     * Determine whether the user has one of the given roles.
     */
    public function hasRole(UserRole ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    /**
     * Give the account a new temporary password, to be replaced at the next
     * login, and return it: this is the only time it can be read.
     */
    public function assignTemporaryPassword(): string
    {
        $temporaryPassword = Str::password(12, symbols: false);

        // must_change_password is not mass assignable: a request must never set it.
        $this->forceFill([
            'password' => $temporaryPassword,
            'must_change_password' => true,
        ])->save();

        return $temporaryPassword;
    }

    /**
     * URL of the space the user lands on after logging in.
     */
    public function homeUrl(): string
    {
        return route($this->role->homeRouteName());
    }

    /**
     * The couple record linked to this account (null for the admin, or while
     * the portal access has not been linked to a record).
     */
    public function couple(): HasOne
    {
        return $this->hasOne(Couple::class);
    }

    /**
     * The messages this user posted in the community space.
     *
     * @return HasMany<CommunityPost, $this>
     */
    public function communityPosts(): HasMany
    {
        return $this->hasMany(CommunityPost::class);
    }
}
