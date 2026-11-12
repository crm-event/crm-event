<?php

/**
 * Texts of the couple space built by the server (statuses, labels,
 * notifications). The texts of the interface itself live in
 * resources/js/i18n.
 */
return [

    'wedding_statuses' => [
        'inquiry' => 'Demande en cours',
        'quote_sent' => 'Devis envoyé',
        'booked' => 'Contrat signé',
        'completed' => 'Mariage célébré',
        'closed' => 'Projet clôturé',
        'cancelled' => 'Annulé',
    ],

    'document_statuses' => [
        'approved' => 'Approuvé',
        'pending' => 'À approuver',
        'viewed' => 'Consulté',
        'available' => 'À consulter',
    ],

    'document_categories' => [
        'contract' => 'Contrat',
        'terms' => 'Conditions générales de vente',
        'design' => 'Carnet de design',
        'quote' => 'Devis',
        'appointment' => 'Rendez-vous',
    ],

    'document_approval_not_needed' => 'Ce document ne nécessite pas d’approbation.',

    'file_size' => [
        'bytes' => ':size o',
        'kilobytes' => ':size Ko',
        'thousands_separator' => ' ',
    ],

    'media_alt' => [
        'moodboard' => 'Moodboard du mariage',
        'inspiration' => 'Photo d’inspiration',
    ],

    'wedding_not_recorded' => 'Votre mariage n’est pas encore enregistré.',

    'proposal_not_approvable' => 'Cette version ne peut plus être validée : elle est déjà validée ou une version plus récente existe.',

    'notifications' => [
        'messages_title' => '{1} Nouveau message de Jessica|[2,*] :count nouveaux messages de Jessica',
        'messages_text' => 'Ouvrez vos messages pour les lire.',
        'messages_date' => 'Reçu le',
        'documents_title' => '{1} Un nouveau document|[2,*] :count nouveaux documents',
        'documents_text' => 'Jessica a partagé un document que vous n’avez pas encore ouvert.',
        'documents_date' => 'Partagé le',
        'approvals_title' => '{1} Un document à approuver|[2,*] :count documents à approuver',
        'approvals_text' => 'Lisez-le, puis validez-le avec « Lu et approuvé ».',
        'appointment_title' => 'Rendez-vous à venir',
        'appointment_date' => 'Prévu le',
    ],

];
