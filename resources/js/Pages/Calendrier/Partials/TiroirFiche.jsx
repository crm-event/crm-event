import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';
import { useEffect, useRef, useState } from 'react';

/**
 * Tiroir latéral qui déploie la fiche régie d'un Jour J ou d'un jalon.
 *
 * `fiche` reste renseignée pendant l'animation de fermeture ; c'est `ouvert`
 * qui décide de l'affichage. Le tiroir se ferme avec Échap ou un clic sur le
 * fond.
 */
export default function TiroirFiche({ fiche, ouvert, onFermer, onModifier, onSupprimer, enCours, erreur }) {
    const boutonFermer = useRef(null);
    const [confirmationSuppression, setConfirmationSuppression] = useState(false);

    useEffect(() => {
        if (!ouvert) {
            setConfirmationSuppression(false);
        }
    }, [ouvert]);

    useEffect(() => {
        if (!ouvert) {
            return undefined;
        }

        boutonFermer.current?.focus();

        const surTouche = (evenement) => {
            if (evenement.key === 'Escape') {
                onFermer();
            }
        };

        window.addEventListener('keydown', surTouche);

        return () => window.removeEventListener('keydown', surTouche);
    }, [ouvert, onFermer]);

    if (!fiche) {
        return null;
    }

    return (
        <div
            inert={!ouvert}
            onClick={onFermer}
            className={`fixed inset-0 z-[60] flex justify-end bg-ink/30 backdrop-blur-[2px] transition-opacity duration-300 ${
                ouvert ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={`Fiche régie : ${fiche.titre}`}
                onClick={(evenement) => evenement.stopPropagation()}
                className={`flex h-full w-full max-w-lg flex-col justify-between overflow-y-auto bg-white p-8 shadow-2xl transition-transform duration-300 ${
                    ouvert ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div>
                    <div className="flex items-start justify-between border-b border-hairline pb-4">
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-ink" />
                                <span className="text-caps uppercase tracking-widest text-sage">
                                    {fiche.badge}
                                </span>
                            </div>
                            <h3 className="font-display text-[22px] leading-7 text-ink sm:text-title-lg">
                                {fiche.titre}
                            </h3>
                            <span className="text-body-sm text-sage">
                                {fiche.sousTitre}
                            </span>
                        </div>
                        <button
                            ref={boutonFermer}
                            type="button"
                            aria-label="Fermer la fiche"
                            onClick={onFermer}
                            className={`${anneauFocus} flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline text-sage transition-colors hover:border-ink hover:text-ink`}
                        >
                            <Icone nom="close" className="text-[18px]" />
                        </button>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="rounded-lg border border-hairline bg-ivory/70 p-4">
                            <div className="flex items-start gap-3">
                                <Icone
                                    nom="location_on"
                                    className="mt-0.5 text-[20px] text-ink"
                                />
                                <div>
                                    <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-sage">
                                        Lieu de réception
                                    </span>
                                    <span className="block text-body font-medium text-ink">
                                        {fiche.lieu}
                                    </span>
                                    <span className="block text-body-sm text-sage">
                                        {fiche.adresse}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {fiche.chiffres.map(({ libelle, valeur, note }) => (
                                <div
                                    key={libelle}
                                    className="rounded-lg border border-hairline bg-ivory/40 p-4"
                                >
                                    <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-sage">
                                        {libelle}
                                    </span>
                                    <span className="mt-0.5 block font-display text-title-sm text-ink">
                                        {valeur}
                                    </span>
                                    <span className="text-[11px] text-sage">
                                        {note}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-3">
                            <h4 className="mb-4 text-caps uppercase tracking-wider text-ink">
                                Déroulé minuté &amp; Jalons
                            </h4>
                            <ol className="relative space-y-4 border-l border-subtle pl-6">
                                {fiche.deroule.map(
                                    ({ heure, titre, description }, index) => (
                                        <li key={heure} className="relative">
                                            <span
                                                className={`absolute -left-[30px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                                                    index % 2 === 0
                                                        ? 'bg-ink'
                                                        : 'bg-sage'
                                                }`}
                                            />
                                            <span className="font-display text-label text-ink">
                                                {heure} — {titre}
                                            </span>
                                            <p className="text-body-sm text-sage">
                                                {description}
                                            </p>
                                        </li>
                                    ),
                                )}
                            </ol>
                        </div>
                    </div>
                </div>

                <div className="mt-6 border-t border-hairline pt-6">
                    {erreur && <p role="alert" className="mb-3 text-body-sm text-warning">{erreur}</p>}
                    <div className="flex items-center gap-3">
                        {onModifier && <button
                            type="button"
                            onClick={onModifier}
                            className={`${anneauFocus} flex-1 rounded-md bg-ink py-2.5 text-center text-label text-white transition-opacity hover:opacity-80`}
                        >
                            Modifier dans le calendrier
                        </button>}
                        <button
                            type="button"
                            title="Imprimer le conducteur"
                            aria-label="Imprimer le conducteur"
                            onClick={() => window.print()}
                            className={`${anneauFocus} rounded-md border border-hairline px-3.5 py-2.5 text-ink transition-colors hover:bg-ivory`}
                        >
                            <Icone nom="print" className="text-[18px]" />
                        </button>
                    </div>
                    {onSupprimer && (confirmationSuppression ? (
                        <div className="mt-4 rounded-md border border-warning/40 bg-ivory p-3">
                            <p className="text-body-sm text-ink">Supprimer cet élément du calendrier ?</p>
                            <div className="mt-3 flex justify-end gap-2">
                                <button type="button" onClick={() => setConfirmationSuppression(false)} className={`${anneauFocus} rounded-md border border-hairline px-3 py-2 text-body-sm text-ink hover:bg-white`}>Annuler</button>
                                <button type="button" disabled={enCours} onClick={onSupprimer} className={`${anneauFocus} rounded-md bg-ink px-3 py-2 text-body-sm text-white hover:opacity-80`}>Confirmer la suppression</button>
                            </div>
                        </div>
                    ) : (
                        <button type="button" onClick={() => setConfirmationSuppression(true)} className={`${anneauFocus} mt-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-body-sm text-warning hover:bg-ivory`}>
                            <Icone nom="delete" className="text-[18px]" />
                            Supprimer cet élément
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
