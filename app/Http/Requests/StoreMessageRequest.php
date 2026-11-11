<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates a private message, sent by a couple or by Jessica.
 */
class StoreMessageRequest extends FormRequest
{
    /**
     * Maximum length of a message, in characters.
     */
    public const MAX_BODY_LENGTH = 5000;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => ['nullable', 'string', 'required_without:voice_note', 'max:'.self::MAX_BODY_LENGTH],
            'voice_note' => [
                'nullable',
                'file',
                'required_without:body',
                // "weba" is the extension guessed for audio/webm (Chrome recordings).
                'mimes:aac,m4a,mp3,mp4,ogg,wav,weba,webm',
                'max:10240',
            ],
        ];
    }

    /**
     * Get the error messages, in the language of the sender.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'body.required' => __('forms.message.body_required'),
            'body.max' => __('forms.message.body_max', ['max' => self::MAX_BODY_LENGTH]),
            'body.required_without' => __('forms.message.text_or_voice'),
            'voice_note.required_without' => __('forms.message.text_or_voice'),
            'voice_note.file' => __('forms.message.voice_invalid'),
            'voice_note.mimes' => __('forms.message.voice_type'),
            'voice_note.max' => __('forms.message.voice_max'),
        ];
    }

    /**
     * Remove surrounding spaces so that a message made of blanks is empty.
     * An empty body becomes null: a voice message is stored without text, and
     * the controllers rely on `body === null` to recognise it.
     */
    protected function prepareForValidation(): void
    {
        $body = trim((string) $this->input('body'));

        $this->merge([
            'body' => $body === '' ? null : $body,
        ]);
    }
}
