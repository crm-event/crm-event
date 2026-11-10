import { Link } from '@inertiajs/react';
import { anneauFocus } from '@/charte';

function MicroTitre({ children }) {
    return (
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-sage">
            {children}
        </p>
    );
}

function Statut({ children, sombre = false }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-[9px] font-medium ${
                sombre ? 'bg-ink text-white' : 'bg-blush text-sage'
            }`}
        >
            {children}
        </span>
    );
}

function nomDuCouple(wedding) {
    if (wedding.couple_name) return wedding.couple_name;
    if (wedding.title) return wedding.title;
    const noms = [wedding.partner_one_name, wedding.partner_two_name].filter(Boolean);
    return noms.length ? noms.join(' & ') : wedding.name || `Dossier mariage #${wedding.id}`;
}

function formaterDate(value) {
    if (!value) return 'Date à définir';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function initiales(nom) {
    return nom.split(/[& ]+/).filter(Boolean).slice(0, 2).map((partie) => partie[0]).join('').toUpperCase();
}

function statutLisible(statut) {
    const statuts = {
        preparation: 'En préparation', 'en préparation': 'En préparation',
        confirmed: 'Confirmé', confirme: 'Confirmé', confirmé: 'Confirmé',
        completed: 'Terminé', termine: 'Terminé', terminé: 'Terminé',
        cancelled: 'Annulé', annule: 'Annulé', annulé: 'Annulé',
    };
    return statuts[String(statut || '').toLowerCase()] || statut || 'Dossier actif';
}

export default function DossierCouple({ wedding }) {
    const couple = wedding.couple;

    const coupleName = couple
        ? `${couple.partner1_first_name} & ${couple.partner2_first_name}`
        : `Dossier mariage #${wedding.id}`;

    return (
        <Link href={route('admin.wedding.show', wedding.id)}
              
              className={`${anneauFocus} group relative block rounded-xl border border-hairline bg-ivory transition duration-200 hover:-translate-y-1 hover:border-subtle hover:bg-cream`}
              aria-label={`Ouvrir le dossier de ${coupleName}`}>
            <span className="absolute -top-3 left-5 h-4 w-24 rounded-t-lg border border-b-0 border-hairline bg-blush transition-colors group-hover:bg-cream" />
            <div className="flex items-start justify-between gap-3 border-b border-hairline bg-blush/70 px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-subtle bg-white font-display text-[10px] text-ink">{initiales(coupleName)}</span>
                    <MicroTitre>Dossier mariage</MicroTitre>
                </div>
                <Statut statut={statutLisible(wedding.status)} />
            </div>
            <div className="p-4">
                <h2 className="min-h-12 font-display text-title-sm leading-snug text-ink">{coupleName}</h2>
                <div className="mt-3 space-y-2 text-body-sm text-sage">
                    <p className="flex items-center gap-2"><span aria-hidden="true">◷</span>{formaterDate(wedding.date)}</p>
                    <p className="flex items-center gap-2"><span aria-hidden="true">⌖</span><span className="truncate">{wedding.venue}</span></p>
                    {wedding.guest_count != null && <p className="flex items-center gap-2"><span aria-hidden="true">♧</span>{wedding.guest_count} invités</p>}
                </div>
            </div>
            <div className="flex items-center justify-between border-t border-hairline px-4 py-3">
                <span className="text-[9px] uppercase tracking-[0.14em] text-sage">Consulter le dossier</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-ivory transition-transform group-hover:translate-x-1">→</span>
            </div>
        </Link>
    );
}
