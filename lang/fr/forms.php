<?php

/**
 * Error messages written for a given form, shown to couples and visitors in
 * the language they chose (see SetLocale).
 */
return [

    'access_request' => [
        'first_name_required' => 'Indiquez votre prénom.',
        'email_required' => 'Indiquez votre adresse e-mail.',
        'email_invalid' => 'Cette adresse e-mail n’est pas valide.',
        'wedding_date_invalid' => 'Cette date n’est pas valide.',
        'wedding_date_past' => 'La date du mariage doit être à venir.',
        'too_many_requests' => 'Trop de demandes. Réessayez dans quelques minutes.',
    ],

    'message' => [
        'body_required' => 'Votre message est vide.',
        'body_max' => 'Votre message ne peut pas dépasser :max caractères.',
        'text_or_voice' => 'Ajoutez un message écrit ou un message vocal.',
        'voice_invalid' => 'Le message vocal est invalide.',
        'voice_type' => 'Le message vocal doit être un fichier audio accepté.',
        'voice_max' => 'Le message vocal ne peut pas dépasser 10 Mo.',
        'thread_not_open' => 'Votre dossier n’est pas encore ouvert : Jessica vous préviendra dès que la messagerie sera disponible.',
        'voice_not_editable' => 'Un message vocal ne peut pas être modifié.',
    ],

    'proposal_comment' => [
        'body_required' => 'Votre message est vide.',
        'body_max' => 'Votre message ne peut pas dépasser :max caractères.',
    ],

    'community_post' => [
        'body_required' => 'Votre message est vide.',
        'body_max' => 'Votre message ne peut pas dépasser :max caractères.',
        'parent_missing' => 'Le message auquel vous répondez n’existe plus.',
    ],

    'media_item' => [
        'file_required' => 'Choisissez une image.',
        'file_type' => 'L’image doit être au format JPG, PNG ou WebP.',
        'file_max' => 'L’image ne peut pas dépasser 25 Mo.',
        'file_upload_failed' => 'L’image n’a pas pu être envoyée : elle est peut-être trop lourde.',
        'gallery_full' => 'Vous avez atteint :max photos : retirez-en une avant d’en ajouter.',
    ],

    'design_brief' => [
        'title_max' => 'L’intention doit tenir en 255 caractères.',
        'description_max' => 'La description ne peut pas dépasser 5 000 caractères.',
        'palette_max' => 'Indiquez 12 couleurs au plus.',
        'palette_item_max' => 'Chaque couleur doit tenir en 50 caractères.',
        'avoid_max' => 'Ce texte ne peut pas dépasser 2 000 caractères.',
    ],

    'review' => [
        'rating_required' => 'Choisissez une note de 1 à 5 étoiles.',
        'recommend_required' => 'Dites-nous si vous nous recommanderiez.',
        'body_max' => 'Votre avis ne peut pas dépasser :max caractères.',
    ],

    'password' => [
        'required' => 'Choisissez un mot de passe.',
        'new_required' => 'Choisissez un nouveau mot de passe.',
        'min' => 'Votre mot de passe doit contenir au moins 8 caractères.',
        'confirmed' => 'Les deux mots de passe ne correspondent pas.',
        'same_as_temporary' => 'Choisissez un mot de passe différent de votre code provisoire.',
        'current_required' => 'Saisissez votre mot de passe actuel.',
        'current_incorrect' => 'Ce mot de passe est incorrect.',
    ],

    'profile' => [
        'name_required' => 'Indiquez un nom.',
        'email_required' => 'Indiquez votre adresse e-mail.',
        'email_invalid' => 'Cette adresse e-mail n’est pas valide.',
        'email_taken' => 'Cette adresse e-mail est déjà utilisée par un autre compte.',
    ],

];
