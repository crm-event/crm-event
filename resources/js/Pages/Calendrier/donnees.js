/**
 * Données de calendrier reprises du suivi des demandes 2026.
 * Les jalons M-6, M-3 et M-1 sont calculés à partir des dates confirmées.
 * Les demandes en attente restent visuellement distinctes des mariages signés.
 */
export const ANNEE = 2026;
export const MOIS = 6;
export const AUJOURD_HUI = 15;

const MARIAGES = [
    { id: 'solene-florian', couple: 'Solène & Florian', date: '2026-06-27', lieu: 'Domaine de Sulauze', prestation: 'Décoration + Officiante', total: 5420.5, solde: 3794.35 },
    { id: 'oriane-andreas', couple: 'Oriane & Andreas', date: '2026-09-12', lieu: 'Prieuré de Badasset', prestation: 'Décoration + Coordination', total: 2040, solde: 1428 },
    { id: 'noemi-nicolai', couple: 'Noemi & Nicolai', date: '2026-08-01', lieu: 'Notre Dame des Prés', prestation: 'Décoration', total: 4592.5, solde: 3214.74 },
    { id: 'laura-baptiste', couple: 'Laura & Baptiste', date: '2026-06-20', lieu: 'Mas des Costes', prestation: 'Décoration', total: 3216.5, solde: 2251.55 },
    { id: 'ninon-evan', couple: 'Ninon & Evan', date: '2026-05-23', lieu: 'Mas de la Rose', prestation: 'Décoration', total: 3097.5, solde: 2168.25, noteSolde: 'Calculé : 3 097,50 € − 929,25 € d’acompte. La cellule Solde du tableau indique 3 349,40 €, montant incohérent à vérifier.' },
    { id: 'cindy-louis', couple: 'Cindy & Louis', date: '2026-06-13', lieu: 'Mas de la Rose', prestation: 'Décoration', total: 3327.5, solde: 2329.25 },
    { id: 'alicia-anthony', couple: 'Alicia & Anthony', date: '2026-04-04', lieu: 'Domaine de Sarson', prestation: 'Décoration', total: 3332.6, solde: 1540.6 },
    { id: 'aylin-axel', couple: 'Aylin & Axel', date: '2026-08-25', lieu: 'Domaine de Brès', prestation: 'Décoration', total: 2845, solde: 1991.5 },
    { id: 'juliette-andreas', couple: 'Juliette & Andreas', date: '2026-08-29', lieu: 'Mas de la Fouque', prestation: 'Décoration', total: 5365.08, solde: 3756.06 },
    { id: 'yamina-robin', couple: 'Yamina & Robin', date: '2027-05-27', lieu: 'Mas de Mauléon', prestation: 'Décoration', total: 5081.8, solde: 3557.26 },
];

const DEMANDES_EN_ATTENTE = [
    { id: 'jekaterina-lauri', couple: 'Jekaterina & Lauri', date: '2026-09-23', lieu: 'Château Tour Vaucros', prestation: 'Décoration' },
    { id: 'clara-robin', couple: 'Clara & Robin', date: '2027-09-08', lieu: 'Grand Lauron', prestation: 'Coordination' },
    { id: 'demande-a-confirmer', couple: 'Couple à confirmer', date: '2027-04-24', lieu: 'Domaine de Valbonne', prestation: 'Décoration' },
];

function dateAvecDecalage(dateIso, mois) {
    const date = new Date(`${dateIso}T12:00:00`);
    date.setMonth(date.getMonth() + mois);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const evenementsMariages = MARIAGES.flatMap((mariage) => {
    const jalons = [
        { mois: -6, titre: 'M-6 · Point de préparation' },
        { mois: -3, titre: 'M-3 · Rendez-vous de préparation' },
        { mois: -1, titre: 'M-1 · Validation finale' },
    ].map(({ mois, titre }) => ({
        id: `${mariage.id}-m${Math.abs(mois)}`,
        detail: `${mariage.id}-m${Math.abs(mois)}`,
        type: 'jalon',
        date: dateAvecDecalage(mariage.date, mois),
        couple: mariage.couple,
        titre,
        lieu: mariage.lieu,
        notes: `Jalon ${titre.slice(0, 2)} lié au mariage du ${new Date(`${mariage.date}T12:00:00`).toLocaleDateString('fr-FR')}. À planifier avec le couple.`,
    }));

    const solde = {
        id: `${mariage.id}-solde`,
        detail: `${mariage.id}-solde`,
        type: 'urgent',
        date: dateAvecDecalage(mariage.date, -1),
        couple: mariage.couple,
        categorie: 'Échéance contractuelle · M-1',
        libelle: `Solde à régler · ${mariage.solde.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`,
        lieu: mariage.lieu,
        notes: 'Échéance calculée un mois avant le mariage, conformément aux CGV. Vérifier la facture et le règlement.',
    };

    return [
        ...jalons,
        solde,
        {
            id: mariage.id,
            detail: mariage.id,
            type: 'jour-j',
            date: mariage.date,
            couple: mariage.couple,
            lieu: mariage.lieu,
            prestation: mariage.prestation,
            total: mariage.total,
            solde: mariage.solde,
        },
    ];
});

const evenementsEnAttente = DEMANDES_EN_ATTENTE.map((demande) => ({
    ...demande,
    detail: demande.id,
    type: 'carte',
    statut: 'en-attente',
    categorie: 'Demande en attente · non confirmée',
    titre: demande.couple,
    gauche: demande.lieu,
    fond: 'blanc',
}));

export const EVENEMENTS = [...evenementsMariages, ...evenementsEnAttente];

export const FICHES = Object.fromEntries([
    ...MARIAGES.map((mariage) => [mariage.id, {
        badge: 'Mariage confirmé · Jour J',
        titre: mariage.couple,
        sousTitre: new Date(`${mariage.date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        lieu: mariage.lieu,
        adresse: mariage.prestation,
        chiffres: [
            { libelle: 'Prestation', valeur: mariage.prestation, note: 'Suivi des demandes' },
            { libelle: 'Montant du devis', valeur: mariage.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), note: 'Montant indiqué au suivi' },
        ],
        deroule: [{ heure: 'Horaire à définir', titre: 'Préparation du Jour J', description: 'Les horaires et le déroulé détaillé ne sont pas renseignés dans les documents fournis.' }],
    }]),
    ...MARIAGES.flatMap((mariage) => [
        ...[-6, -3, -1].map((mois) => {
            const numero = Math.abs(mois);
            const date = dateAvecDecalage(mariage.date, mois);
            const titre = `M-${numero} · ${numero === 6 ? 'Point de préparation' : numero === 3 ? 'Rendez-vous de préparation' : 'Validation finale'}`;
            return [`${mariage.id}-m${numero}`, {
                badge: `Jalon contractuel · M-${numero}`,
                titre: mariage.couple,
                sousTitre: `${titre} · ${new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR')}`,
                lieu: mariage.lieu,
                adresse: 'Rendez-vous à planifier avec le couple.',
                chiffres: [
                    { libelle: 'Échéance', valeur: `M-${numero}`, note: 'Calculée depuis la date du mariage' },
                    { libelle: 'Mariage prévu', valeur: new Date(`${mariage.date}T12:00:00`).toLocaleDateString('fr-FR'), note: mariage.lieu },
                ],
                deroule: [{ heure: 'Horaire à définir', titre, description: 'Le créneau exact n’est pas indiqué dans les documents fournis.' }],
            }];
        }),
        [`${mariage.id}-solde`, {
            badge: 'Échéance contractuelle · M-1',
            titre: `Solde · ${mariage.couple}`,
            sousTitre: `À régler avant le ${new Date(`${dateAvecDecalage(mariage.date, -1)}T12:00:00`).toLocaleDateString('fr-FR')}`,
            lieu: mariage.lieu,
            adresse: 'Échéance calculée depuis la date du mariage.',
            chiffres: [
                { libelle: 'Solde estimé', valeur: mariage.solde.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), note: mariage.noteSolde ? 'Calculé depuis le devis et l’acompte' : 'Montant du tableau de suivi' },
                { libelle: 'Mariage prévu', valeur: new Date(`${mariage.date}T12:00:00`).toLocaleDateString('fr-FR'), note: mariage.lieu },
            ],
            deroule: [{ heure: 'À vérifier', titre: 'Échéance de règlement du solde', description: [mariage.noteSolde, 'Les CGV prévoient le règlement du solde au plus tard un mois avant le mariage.'].filter(Boolean).join(' ') }],
        }],
    ]),
    ...DEMANDES_EN_ATTENTE.map((demande) => [demande.id, {
        badge: 'Demande en attente · date non confirmée',
        titre: demande.couple,
        sousTitre: `Date demandée · ${new Date(`${demande.date}T12:00:00`).toLocaleDateString('fr-FR')}`,
        lieu: demande.lieu,
        adresse: demande.prestation,
        chiffres: [{ libelle: 'Statut', valeur: 'En attente', note: 'Ne pas traiter comme réservation confirmée' }],
        deroule: [{ heure: 'À confirmer', titre: 'Date souhaitée', description: 'Cette demande reste en attente dans le tableau de suivi.' }],
    }]),
]);
