<?php

namespace App\Support;

/**
 * Texts that Jessica writes again and again in French, such as the titles
 * of the standard appointments ("Point design M-6") or the usual message
 * of a design document. They are shown to couples in their language when
 * lang/en.json knows them; any other text is shown as Jessica wrote it.
 */
class StandardText
{
    /**
     * The text in the current language, or the text itself when unknown.
     */
    public static function translate(?string $text): ?string
    {
        if ($text === null || $text === '') {
            return $text;
        }

        $translated = __($text);

        return is_string($translated) ? $translated : $text;
    }
}
