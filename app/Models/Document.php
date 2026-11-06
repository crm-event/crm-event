<?php

namespace App\Models;

use Database\Factories\DocumentFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * File shared in the couple space of a wedding (contract, terms, quote...).
 *
 * The state of a document is stored by its date: `viewed_at` when the couple
 * opens it, `approved_at` when they approve it with « Lu et approuvé » (see
 * docs/bdd/README.md, decision D9).
 */
class Document extends Model
{
    /** @use HasFactory<DocumentFactory> */
    use HasFactory;

    protected $fillable = [
        'wedding_id',
        'uploaded_by',
        'category',
        'title',
        'message',
        'file_path',
        'mime_type',
        'size_bytes',
        'requires_approval',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'requires_approval' => 'boolean',
            'viewed_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    /**
     * The wedding this document belongs to.
     *
     * @return BelongsTo<Wedding, $this>
     */
    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }

    /**
     * The account that uploaded the document, null once that account is
     * deleted.
     *
     * @return BelongsTo<User, $this>
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Scope the query to the documents the couple has not opened yet.
     *
     * @param  Builder<Document>  $query
     * @return Builder<Document>
     */
    public function scopeUnseen(Builder $query): Builder
    {
        return $query->whereNull($query->qualifyColumn('viewed_at'));
    }

    /**
     * Scope the query to the documents that must be approved and are not yet.
     *
     * @param  Builder<Document>  $query
     * @return Builder<Document>
     */
    public function scopePendingApproval(Builder $query): Builder
    {
        return $query
            ->where($query->qualifyColumn('requires_approval'), true)
            ->whereNull($query->qualifyColumn('approved_at'));
    }
}
