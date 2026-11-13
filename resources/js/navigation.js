export const NAVIGATION = [
    { cle: 'dashboard', libelle: 'Dashboard', icone: 'space_dashboard', route: 'dashboard', mots: 'tableau de bord accueil' },
    { cle: 'demandes', libelle: 'Demandes', icone: 'mark_email_unread', route: 'demandes' },
    { cle: 'mariages', libelle: 'Mariages', icone: 'favorite', route: 'wedding', mots: 'dossiers' },
    { cle: 'espaces-clients', libelle: 'Espaces clients', icone: 'group', route: 'admin.couples.index', mots: 'couples' },
    { cle: 'messages', libelle: 'Messages', icone: 'chat', route: 'admin.messages.index', mots: 'conversations discussions messagerie' },
    { cle: 'avis', libelle: 'Avis', icone: 'reviews', route: 'admin.reviews.index' },
    { cle: 'documents', libelle: 'Documents', icone: 'description', route: 'admin.documents.index' },
    { cle: 'calendrier', libelle: 'Calendrier', icone: 'calendar_today', route: 'calendrier', mots: 'planning rendez-vous jalons' },
    { cle: 'facturation', libelle: 'Facturation', icone: 'receipt_long' },
    { cle: 'depenses', libelle: 'Dépenses', icone: 'payments' },
    { cle: 'temps-passe', libelle: 'Temps passé', icone: 'hourglass_empty' },
    { cle: 'rentabilite', libelle: 'Rentabilité', icone: 'trending_up', route: 'rentabilite.index' },
    { cle: 'parametres', libelle: 'Paramètres', icone: 'settings', route: 'profile.edit', mots: 'profil compte' },
];

export function pagesDisponibles() {
    return NAVIGATION.filter((entree) => entree.route && route().has(entree.route));
}

export function normaliserRecherche(texte) {
    return texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr-FR').trim();
}
