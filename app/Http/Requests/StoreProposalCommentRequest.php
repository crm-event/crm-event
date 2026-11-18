<?php

namespace App\Http\Requests;

use App\Models\ProposalComment;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates a comment under a design proposal, written by the couple or by
 * Jessica.
 */
class StoreProposalCommentRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:'.ProposalComment::MAX_BODY_LENGTH],
        ];
    }

    /**
     * Get the validation messages, in the language of the author.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'body.required' => __('forms.proposal_comment.body_required'),
            'body.max' => __('forms.proposal_comment.body_max', ['max' => ProposalComment::MAX_BODY_LENGTH]),
        ];
    }

    /**
     * Remove surrounding spaces so that a comment made of blanks is empty.
     */
    protected function prepareForValidation(): void
    {
        $this->merge(['body' => trim((string) $this->input('body'))]);
    }
}
