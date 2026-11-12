<?php

/**
 * Error messages written for a given form, shown to couples and visitors in
 * the language they chose (see SetLocale).
 */
return [

    'access_request' => [
        'first_name_required' => 'Please enter your first name.',
        'email_required' => 'Please enter your email address.',
        'email_invalid' => 'This email address is not valid.',
        'wedding_date_invalid' => 'This date is not valid.',
        'wedding_date_past' => 'The wedding date must be in the future.',
        'too_many_requests' => 'Too many requests. Please try again in a few minutes.',
    ],

    'message' => [
        'body_required' => 'Your message is empty.',
        'body_max' => 'Your message cannot be longer than :max characters.',
        'text_or_voice' => 'Add a written message or a voice message.',
        'voice_invalid' => 'The voice message is not valid.',
        'voice_type' => 'The voice message must be a supported audio file.',
        'voice_max' => 'The voice message cannot be larger than 10 MB.',
        'thread_not_open' => 'Your file is not open yet: Jessica will let you know as soon as messaging is available.',
        'voice_not_editable' => 'A voice message cannot be edited.',
    ],

    'proposal_comment' => [
        'body_required' => 'Your message is empty.',
        'body_max' => 'Your message cannot be longer than :max characters.',
    ],

    'community_post' => [
        'body_required' => 'Your message is empty.',
        'body_max' => 'Your message cannot be longer than :max characters.',
        'parent_missing' => 'The message you are replying to no longer exists.',
    ],

    'media_item' => [
        'file_required' => 'Please choose an image.',
        'file_type' => 'The image must be a JPG, PNG or WebP file.',
        'file_max' => 'The image cannot be larger than 25 MB.',
        'file_upload_failed' => 'The image could not be uploaded: it may be too large.',
        'gallery_full' => 'You have reached :max photos: remove one before adding another.',
    ],

    'design_brief' => [
        'title_max' => 'The intention must fit in 255 characters.',
        'description_max' => 'The description cannot be longer than 5,000 characters.',
        'palette_max' => 'Enter 12 colours at most.',
        'palette_item_max' => 'Each colour must fit in 50 characters.',
        'avoid_max' => 'This text cannot be longer than 2,000 characters.',
    ],

    'password' => [
        'required' => 'Please choose a password.',
        'new_required' => 'Please choose a new password.',
        'min' => 'Your password must contain at least 8 characters.',
        'confirmed' => 'The two passwords do not match.',
        'same_as_temporary' => 'Choose a password different from your temporary code.',
        'current_required' => 'Please enter your current password.',
        'current_incorrect' => 'This password is incorrect.',
    ],

    'profile' => [
        'name_required' => 'Please enter a name.',
        'email_required' => 'Please enter your email address.',
        'email_invalid' => 'This email address is not valid.',
        'email_taken' => 'This email address is already used by another account.',
    ],

];
