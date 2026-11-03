import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';
import { useEffect, useState } from 'react';

export default function FormulaireJalon({ ouvert, dateParDefaut, evenement, onFermer, onEnregistrer }) {
    const [titre, setTitre] = useState('');
    const [date, setDate] = useState(dateParDefaut);
    const [heure, setHeure] = useState('');
    const [lieu, setLieu] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (ouvert) {
            setTitre(evenement?.titre ?? evenement?.libelle ?? evenement?.couple ?? '');
            setDate(evenement?.date ?? dateParDefaut);
            setHeure(evenement?.heure ?? '');
            setLieu(evenement?.lieu ?? evenement?.location ?? '');
            setNotes(evenement?.notes ?? '');
        }
    }, [dateParDefaut, evenement, ouvert]);

    useEffect(() => {
        if (!ouvert) {
            return undefined;
        }
        const fermerAvecEchap = (event) => {
            if (event.key === 'Escape') {
                onFermer();
            }
        };
        window.addEventListener('keydown', fermerAvecEchap);
        return () => window.removeEventListener('keydown', fermerAvecEchap);
    }, [onFermer, ouvert]);

    if (!ouvert) {
        return null;
    }

    const enregistrer = (event) => {
        event.preventDefault();
        const intitulé = titre.trim();
        onEnregistrer({
            titre: intitulé,
            libelle: intitulé,
            ...(evenement?.type === 'jour-j' || evenement?.type === 'carte' ? { couple: intitulé } : {}),
            date,
            heure,
            lieu: lieu.trim(),
            notes: notes.trim(),
        });
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/35 p-4" onClick={onFermer}>
            <section role="dialog" aria-modal="true" aria-labelledby="titre-jalon" className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <div className="mb-5 flex items-start justify-between border-b border-hairline pb-4">
                    <div>
                        <span className="text-caps uppercase tracking-wider text-sage">Planning opérationnel</span>
                        <h2 id="titre-jalon" className="mt-1 font-display text-title-md text-ink">{evenement ? 'Modifier l’événement' : 'Poser un jalon'}</h2>
                    </div>
                    <button type="button" aria-label="Fermer" onClick={onFermer} className={`${anneauFocus} rounded-full p-1 text-sage hover:bg-ivory hover:text-ink`}><Icone nom="close" /></button>
                </div>
                <form onSubmit={enregistrer} className="space-y-4">
                    <label className="block text-label text-ink">Intitulé
                        <input required maxLength="120" autoFocus value={titre} onChange={(event) => setTitre(event.target.value)} placeholder="Ex. Validation du moodboard" className="mt-1 w-full rounded-lg border-hairline text-body focus:border-sage focus:ring-sage" />
                    </label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="block text-label text-ink">Date
                            <input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body focus:border-sage focus:ring-sage" />
                        </label>
                        <label className="block text-label text-ink">Heure (facultative)
                            <input type="time" value={heure} onChange={(event) => setHeure(event.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body focus:border-sage focus:ring-sage" />
                        </label>
                    </div>
                    <label className="block text-label text-ink">Lieu (facultatif)
                        <input maxLength="160" value={lieu} onChange={(event) => setLieu(event.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body focus:border-sage focus:ring-sage" />
                    </label>
                    <label className="block text-label text-ink">Note (facultative)
                        <textarea rows="3" maxLength="1000" value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 w-full rounded-lg border-hairline text-body focus:border-sage focus:ring-sage" />
                    </label>
                    <p className="text-[11px] text-sage">Enregistré dans ce navigateur uniquement.</p>
                    <div className="flex justify-end gap-3 border-t border-hairline pt-4">
                        <button type="button" onClick={onFermer} className={`${anneauFocus} rounded-lg border border-hairline px-4 py-2 text-label text-ink hover:bg-ivory`}>Annuler</button>
                        <button type="submit" className={`${anneauFocus} rounded-lg bg-ink px-4 py-2 text-label text-white hover:opacity-80`}>{evenement ? 'Enregistrer les modifications' : 'Enregistrer le jalon'}</button>
                    </div>
                </form>
            </section>
        </div>
    );
}
