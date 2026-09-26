/**
 * Données de la maquette « Calendrier » (avril 2025), en attendant les vraies
 * données. Chaque événement a un `type` qui décide de son rendu dans la grille :
 * `rdv` (rendez-vous, repérage), `jalon`, `urgent`, `repetition`, `note`,
 * `carte` (jalon détaillé) ou `jour-j` (mariage). Ceux qui portent un
 * `detail` ouvrent la fiche régie correspondante.
 */
export const ANNEE = 2025;
export const MOIS = 4;
export const AUJOURD_HUI = 15;

export const JOURS = {
    1: {
        etiquette: 'Avr',
        evenements: [{ type: 'rdv', libelle: 'Visite technique — Villa Ephrussi' }],
    },
    5: {
        evenements: [{ type: 'jalon', libelle: 'M-3 Moodboard Design' }],
    },
    8: {
        evenements: [{ type: 'rdv', libelle: 'Call Floral Stylist (Mathilde)' }],
    },
    10: {
        evenements: [{ type: 'jalon', libelle: 'M-6 Choix scénographie' }],
    },
    15: {
        evenements: [
            {
                type: 'urgent',
                categorie: 'Validation Urgente',
                libelle: 'BAP Mobilier — Fonscolombe',
            },
        ],
    },
    17: {
        evenements: [{ type: 'jalon', libelle: 'Livraison Papeterie dorée' }],
    },
    18: {
        etiquette: 'J-1',
        evenements: [
            {
                type: 'repetition',
                libelle: 'Répétition & Dîner d’accueil',
                pied: '18:00 — Éléonore & Arthur',
            },
        ],
    },
    19: {
        evenements: [
            {
                type: 'jour-j',
                detail: 'fonscolombe',
                heure: '14:30',
                couple: 'Éléonore & Arthur',
                lieu: 'Château de Fonscolombe',
                invites: 180,
                prestataires: 12,
            },
        ],
    },
    20: {
        evenements: [
            {
                type: 'note',
                libelle: 'Brunch informel lendemain',
                pied: '12:00 — Fonscolombe',
            },
        ],
    },
    21: {
        evenements: [{ type: 'rdv', libelle: 'Débrief & Clôture régie' }],
    },
    25: {
        etiquette: 'J-1',
        evenements: [
            {
                type: 'carte',
                detail: 'repetition-gordes',
                fond: 'ivoire',
                categorie: 'Répétition Cérémonie',
                titre: 'Sophie & Julien',
                gauche: 'Bastide de Gordes',
                droite: '17:00',
            },
        ],
    },
    26: {
        evenements: [
            {
                type: 'jour-j',
                detail: 'gordes',
                heure: '16:00',
                couple: 'Victoire & David',
                lieu: 'Bastide de Gordes (Luberon)',
                invites: 130,
                prestataires: 9,
            },
        ],
    },
    28: {
        etiquette: 'Échéance',
        alerte: true,
        evenements: [
            {
                type: 'carte',
                detail: 'solde-clemence',
                fond: 'blanc',
                categorie: 'M-1 Solde Honoraires',
                titre: 'Clémence & Alexandre',
                gauche: 'Échéance 4 200 €',
                fleche: true,
            },
        ],
    },
    30: {
        etiquette: 'Jalon M-3',
        evenements: [
            {
                type: 'carte',
                detail: 'degustation-camille',
                fond: 'ivoire',
                categorie: 'Dégustation Traiteur',
                titre: 'Camille & Thomas',
                gauche: 'Maison Helen (Avignon) • 12:30',
            },
        ],
    },
};

export const FICHES = {
    fonscolombe: {
        badge: 'Fiche Régie — Jour J',
        titre: 'Éléonore & Arthur',
        sousTitre: 'Mariage Haute Couture • Samedi 19 Avril 2025',
        lieu: 'Château de Fonscolombe',
        adresse: 'Route de Saint-Canat, 13610 Le Puy-Sainte-Réparade',
        chiffres: [
            { libelle: 'Invités attendus', valeur: '180 personnes', note: 'Régimes spéciaux : 14' },
            { libelle: 'Prestataires sur site', valeur: '12 équipes', note: 'Repas staff commandés' },
        ],
        deroule: [
            { heure: '10:00', titre: 'Arrivée Régie & Fleuriste', description: 'Montage de l’arche florale dans la cour d’honneur.' },
            { heure: '14:00', titre: 'Navettes & Accueil invités', description: 'Citronnade artisanale et ombrelles en lin distribuées.' },
            { heure: '15:30', titre: 'Cérémonie Laïque', description: 'Parc Sud, quatuor à cordes et officiante de cérémonie.' },
            { heure: '17:30', titre: 'Cocktail & Photos de couple', description: 'Terrasse des cyprès au coucher du soleil.' },
            { heure: '20:00', titre: 'Dîner & Discours', description: 'Orangerie, mise en lumière d’ambiance et service 4 temps.' },
        ],
    },
    gordes: {
        badge: 'Fiche Régie — Jour J',
        titre: 'Victoire & David',
        sousTitre: 'Célébration Luberon • Samedi 26 Avril 2025',
        lieu: 'Bastide de Gordes',
        adresse: 'Le Village, 84220 Gordes',
        chiffres: [
            { libelle: 'Invités attendus', valeur: '130 personnes', note: 'Régimes spéciaux : 9' },
            { libelle: 'Prestataires sur site', valeur: '9 équipes', note: 'Repas staff commandés' },
        ],
        deroule: [
            { heure: '11:00', titre: 'Installation Son & Mobilier', description: 'Esplanade vue sur la vallée du Luberon.' },
            { heure: '16:00', titre: 'Cérémonie d’engagement', description: 'Échange des vœux face aux falaises dorées.' },
            { heure: '18:00', titre: 'Cocktail champêtre & Bar à champagne', description: 'Jardins suspendus en terrasses.' },
            { heure: '20:30', titre: 'Banquet sous le ciel étoilé', description: 'Grandes tablées en bois brut et guirlandes guinguette chic.' },
        ],
    },
    'repetition-gordes': {
        badge: 'Jalon Opérationnel — J-1',
        titre: 'Répétition Cérémonie — Sophie & Julien',
        sousTitre: 'Vérification timing cortège • Vendredi 25 Avril 2025',
        lieu: 'Bastide de Gordes',
        adresse: 'Le Village, 84220 Gordes',
        chiffres: [
            { libelle: 'Participants', valeur: '18 proches (Cortège)', note: 'Témoins et parents' },
            { libelle: 'Intervenants', valeur: 'Officiant & Jessica', note: 'Régie son sur place' },
        ],
        deroule: [
            { heure: '16:45', titre: 'Arrivée des mariés & témoins', description: 'Prise de repères au belvédère.' },
            { heure: '17:00', titre: 'Répétition des entrées musicales', description: 'Calibrage des micros sans fil.' },
            { heure: '18:30', titre: 'Clôture & Remise des livrets', description: 'Départ pour le dîner intime.' },
        ],
    },
    'solde-clemence': {
        badge: 'Échéance Contractuelle — M-1',
        titre: 'Solde honoraires — Clémence & Alexandre',
        sousTitre: 'Appel de fonds • Lundi 28 Avril 2025',
        lieu: 'Domaine de Canaille',
        adresse: 'Route de Gordes, 84220 Roussillon',
        chiffres: [
            { libelle: 'Jour J du mariage', valeur: '3 mai 2025', note: 'Domaine de Canaille' },
            { libelle: 'Solde à encaisser', valeur: '4 200 €', note: 'Facture de solde M-1' },
        ],
        deroule: [
            { heure: '09:00', titre: 'Envoi de la facture de solde', description: 'Facture PDF et rappel des modalités de virement.' },
            { heure: '14:00', titre: 'Relance téléphonique', description: 'Point avec les mariés sur le calage traiteur.' },
            { heure: '18:00', titre: 'Rapprochement bancaire', description: 'Vérification de l’encaissement du virement.' },
        ],
    },
    'degustation-camille': {
        badge: 'Jalon Opérationnel — M-3',
        titre: 'Dégustation Traiteur — Camille & Thomas',
        sousTitre: 'Test du menu 4 plats • Mercredi 30 Avril 2025',
        lieu: 'Maison Helen',
        adresse: 'Avignon',
        chiffres: [
            { libelle: 'Participants', valeur: '2 mariés + 2 témoins', note: 'Dégustation à 4 personnes' },
            { libelle: 'Traiteur', valeur: 'Maison Helen', note: 'Avignon' },
        ],
        deroule: [
            { heure: '12:30', titre: 'Accueil par le chef', description: 'Présentation de la carte de saison.' },
            { heure: '13:00', titre: 'Dégustation des 4 plats', description: 'Accords mets et vins de Provence.' },
            { heure: '14:30', titre: 'Arbitrage du menu', description: 'Validation du menu et des régimes spéciaux.' },
        ],
    },
};
