<?php

/**
 * Texts of the couple space built by the server (statuses, labels,
 * notifications). The texts of the interface itself live in
 * resources/js/i18n.
 */
return [

    'wedding_statuses' => [
        'inquiry' => 'Inquiry in progress',
        'quote_sent' => 'Quote sent',
        'booked' => 'Contract signed',
        'completed' => 'Wedding celebrated',
        'closed' => 'Project closed',
        'cancelled' => 'Cancelled',
    ],

    'document_statuses' => [
        'approved' => 'Approved',
        'pending' => 'Pending approval',
        'viewed' => 'Viewed',
        'available' => 'Available',
    ],

    'document_categories' => [
        'contract' => 'Contract',
        'terms' => 'Terms and conditions',
        'design' => 'Design book',
        'quote' => 'Quote',
        'appointment' => 'Appointments',
    ],

    'document_approval_not_needed' => 'This document does not need to be approved.',

    'file_size' => [
        'bytes' => ':size B',
        'kilobytes' => ':size KB',
        'thousands_separator' => ',',
    ],

    'media_alt' => [
        'moodboard' => 'Wedding moodboard',
        'inspiration' => 'Inspiration photo',
    ],

    'wedding_not_recorded' => 'Your wedding has not been recorded yet.',

    'proposal_not_approvable' => 'This version can no longer be approved: it is already approved or a newer version exists.',

    'review_not_open' => 'Your review has already been sent, or Jessica has not asked for it yet.',

    'notifications' => [
        'messages_title' => '{1} New message from Jessica|[2,*] :count new messages from Jessica',
        'messages_text' => 'Open your messages to read them.',
        'messages_date' => 'Received on',
        'documents_title' => '{1} A new document|[2,*] :count new documents',
        'documents_text' => 'Jessica has shared a document you have not opened yet.',
        'documents_date' => 'Shared on',
        'approvals_title' => '{1} A document to approve|[2,*] :count documents to approve',
        'approvals_text' => 'Read it, then approve it with “Read and approved”.',
        'appointment_title' => 'Upcoming appointment',
        'appointment_date' => 'Scheduled on',
        'design_start_title' => 'Share your inspirations',
        'design_start_text' => 'Add your moodboard, your photos and your brief: Jessica will use them to imagine your design.',
        'design_proposals_title' => '{1} New design proposal|[2,*] :count new design proposals',
        'design_proposals_text' => 'Approve it or send your remarks to Jessica.',
        'design_proposals_date' => 'Sent on',
        'design_replies_title' => 'Jessica replied to your remarks',
        'design_replies_text' => 'Find her answer under the version concerned.',
        'design_replies_date' => 'Received on',
        'review_title' => 'Jessica would love your review',
        'review_text' => 'Tell us in a few words how you experienced your wedding with La Dernière Touche.',
        'review_date' => 'Requested on',
    ],

];
