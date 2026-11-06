import Dropdown from '@/Components/Dropdown';
import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Coque du back-office de Jessica : barre latérale de navigation à gauche,
 * bandeau de recherche en haut, contenu au centre.
 *
 * Le tableau de bord, les demandes et les paramètres (profil) existent ;
 * les autres entrées sont affichées comme dans la maquette mais sans lien.
 */
const NAVIGATION = [
    { cle: 'dashboard', libelle: 'Dashboard', icone: 'space_dashboard', route: 'dashboard' },
    { cle: 'demandes', libelle: 'Demandes', icone: 'mark_email_unread', route: 'demandes' },
    { cle: 'mariages', libelle: 'Mariages', icone: 'favorite', route: 'wedding' },
    { cle: 'messages', libelle: 'Messages', icone: 'chat', route: 'admin.messages.index' },
    { cle: 'documents', libelle: 'Documents', icone: 'description', route: 'admin.documents.index' },
    { cle: 'calendrier', libelle: 'Calendrier', icone: 'calendar_today', route: 'calendrier' },
    { cle: 'facturation', libelle: 'Facturation', icone: 'receipt_long' },
    { cle: 'depenses', libelle: 'Dépenses', icone: 'payments' },
    { cle: 'temps-passe', libelle: 'Temps passé', icone: 'hourglass_empty' },
    { cle: 'rentabilite', libelle: 'Rentabilité', icone: 'trending_up', route: 'rentabilite.index' },
    { cle: 'parametres', libelle: 'Paramètres', icone: 'settings', route: 'profile.edit' },
];

const classesLien =
    'flex items-center gap-3 rounded-lg px-3 py-2 text-body transition-colors';

function EntreeNavigation({ entree, active }) {
    const contenu = (
        <>
            <Icone nom={entree.icone} className="text-[19px]" />
            <span>{entree.libelle}</span>
        </>
    );

    if (!entree.route) {
        return (
            <span
                className={`${classesLien} cursor-not-allowed text-sage/60`}
                aria-disabled="true"
                title="Bientôt disponible"
            >
                {contenu}
            </span>
        );
    }

    return (
        <Link
            href={route(entree.route)}
            aria-current={active ? 'page' : undefined}
            className={`${anneauFocus} ${classesLien} ${
                active
                    ? 'bg-ink text-white shadow-sm'
                    : 'text-sage hover:bg-blush hover:text-ink'
            }`}
        >
            {contenu}
        </Link>
    );
}

function BarreLaterale({ actif, utilisateur }) {
    return (
        <div className="flex min-h-full flex-col justify-between bg-ivory">
            <div className="flex flex-1 flex-col">
                <div className="flex h-20 items-center gap-3 border-b border-hairline px-6">
                    <Link href="/" className={anneauFocus}>
                        <img
                            src="/logo-ldt.png"
                            alt="La Dernière Touche"
                            className="h-12 w-auto"
                            width={285}
                            height={560}
                        />
                    </Link>
                    <div className="flex flex-col">
                        <span className="font-display text-title-sm tracking-tight text-ink">
                            La Dernière Touche
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-sage">
                            Maison de Mariage
                        </span>
                    </div>
                </div>

                <div className="px-4 py-3">
                    <span className="px-2 text-caps uppercase text-sage">
                        Navigation
                    </span>
                </div>

                <nav
                    aria-label="Navigation principale"
                    className="flex-1 space-y-0.5 px-2"
                >
                    {NAVIGATION.map((entree) => (
                        <EntreeNavigation
                            key={entree.cle}
                            entree={entree}
                            active={entree.cle === actif}
                        />
                    ))}
                </nav>
            </div>

            <div className="border-t border-hairline bg-ivory p-4">
                <span className="mb-2 inline-flex items-center rounded-full border border-subtle bg-white px-2 py-0.5 text-[10px] uppercase tracking-wider text-sage">
                    Marseille &amp; Riviera
                </span>
                <div className="flex items-center gap-3 pt-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink">
                        <Icone nom="person" className="text-[18px] text-white" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-body font-medium leading-tight text-ink">
                            {utilisateur.name}
                        </span>
                        <span className="truncate text-[11px] leading-tight text-sage">
                            Directrice Artistique
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MenuUtilisateur({ utilisateur }) {
    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button
                    type="button"
                    aria-label={`Menu de ${utilisateur.name}`}
                    className={`${anneauFocus} flex h-8 w-8 items-center justify-center rounded-full bg-ink`}
                >
                    <Icone nom="person" className="text-[18px] text-white" />
                </button>
            </Dropdown.Trigger>

            <Dropdown.Content>
                <Dropdown.Link href={route('profile.edit')}>Profil</Dropdown.Link>
                <Dropdown.Link href={route('logout')} method="post" as="button">
                    Se déconnecter
                </Dropdown.Link>
            </Dropdown.Content>
        </Dropdown>
    );
}

export default function BackOfficeLayout({
    actif = 'dashboard',
    filAriane = 'Atelier de Production',
    policeStitch = false,
    children,
}) {
    const utilisateur = usePage().props.auth.user;
    const [menuOuvert, setMenuOuvert] = useState(false);
    const dateDuJour = new Date().toLocaleDateString('fr-FR', {
        timeZone: 'Europe/Paris',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div
            className="min-h-screen bg-blush font-sans text-ink antialiased"
            style={policeStitch ? { fontFamily: 'Inter, sans-serif', '--font-display': 'Playfair Display, serif' } : undefined}
        >
            <aside className="fixed left-0 top-0 z-50 hidden h-screen w-sidebar overflow-y-auto border-r border-hairline lg:block">
                <BarreLaterale actif={actif} utilisateur={utilisateur} />
            </aside>

            {menuOuvert && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-ink/40"
                        onClick={() => setMenuOuvert(false)}
                    />
                    <aside className="relative h-full w-sidebar max-w-[85vw] overflow-y-auto border-r border-hairline">
                        <BarreLaterale actif={actif} utilisateur={utilisateur} />
                    </aside>
                </div>
            )}

            <div className="flex min-h-screen flex-col lg:pl-sidebar">
                <header className="fixed left-0 right-0 top-0 z-40 flex h-20 items-center justify-between gap-4 border-b border-hairline bg-ivory/95 px-4 backdrop-blur-md sm:px-8 lg:left-sidebar">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            aria-label="Ouvrir la navigation"
                            onClick={() => setMenuOuvert(true)}
                            className={`${anneauFocus} rounded-lg p-2 text-sage hover:bg-blush hover:text-ink lg:hidden`}
                        >
                            <Icone nom="menu" className="text-[22px]" />
                        </button>
                        <div className="flex items-center gap-2 text-body-sm text-sage">
                            <span>Maison</span>
                            <span className="text-[10px] text-subtle">/</span>
                            <span className="truncate font-medium text-ink">
                                {filAriane}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden items-center sm:flex">
                            <Icone
                                nom="search"
                                className="absolute left-3 text-[18px] text-sage"
                            />
                            <input
                                type="search"
                                aria-label="Rechercher"
                                placeholder="Rechercher un dossier, prestataire..."
                                className="w-72 rounded-lg border border-hairline bg-white py-1.5 pl-9 pr-4 text-body-sm text-ink placeholder:text-sage focus:border-ink focus:outline-none focus:ring-0"
                            />
                        </div>

                        <div className="hidden items-center gap-1.5 text-caps uppercase text-sage xl:flex">
                            <Icone nom="today" className="text-[16px]" />
                            <span>{dateDuJour}</span>
                        </div>

                        <div className="hidden h-5 w-px bg-hairline xl:block" />

                        <button
                            type="button"
                            aria-label="Notifications"
                            className={`${anneauFocus} relative rounded-lg p-2 text-sage transition-colors hover:bg-blush hover:text-ink`}
                        >
                            <Icone nom="notifications" className="text-[20px]" />
                            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-warning" />
                        </button>

                        <MenuUtilisateur utilisateur={utilisateur} />
                    </div>
                </header>

                <main className="w-full flex-1 bg-blush px-4 pb-8 pt-28 sm:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
