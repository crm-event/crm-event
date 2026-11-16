import Icone from '@/Components/Icone';
import { anneauFocus } from '@/charte';
import { normaliserRecherche, pagesDisponibles } from '@/navigation';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useId, useRef, useState } from 'react';

export default function RechercheGlobale() {
    const { url } = usePage();
    const identifiant = useId();
    const conteneur = useRef(null);
    const [recherche, setRecherche] = useState('');
    const [ouvert, setOuvert] = useState(false);
    const [actif, setActif] = useState(-1);
    const [reponse, setReponse] = useState({ terme: '', statut: 'repos', results: [] });
    const terme = recherche.trim();
    const mots = normaliserRecherche(terme).split(/\s+/).filter(Boolean);
    const pages = pagesDisponibles()
        .filter((page) => mots.every((mot) => normaliserRecherche(page.libelle + ' ' + (page.mots ?? '')).includes(mot)))
        .map((page) => ({
            id: 'page-' + page.cle,
            label: page.libelle,
            description: 'Ouvrir la page',
            type: 'Page',
            icon: page.icone,
            url: route(page.route),
        }));
    const donnees = terme.length >= 2 && reponse.terme === terme ? reponse.results : [];
    const resultats = [...pages, ...donnees];
    const chargement = terme.length >= 2 && (reponse.terme !== terme || reponse.statut === 'chargement');
    const erreur = reponse.terme === terme && reponse.statut === 'erreur';

    useEffect(() => {
        setOuvert(false);
        setRecherche('');
        setActif(-1);
    }, [url]);

    useEffect(() => {
        const fermerDehors = (event) => {
            if (!conteneur.current?.contains(event.target)) {
                setOuvert(false);
                setActif(-1);
            }
        };
        document.addEventListener('pointerdown', fermerDehors);
        return () => document.removeEventListener('pointerdown', fermerDehors);
    }, []);

    useEffect(() => {
        if (!ouvert || terme.length < 2) {
            return;
        }

        const requete = new AbortController();
        setReponse({ terme, statut: 'chargement', results: [] });
        const attente = window.setTimeout(async () => {
            try {
                const response = await fetch(route('recherche', { q: terme }), {
                    signal: requete.signal,
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                    cache: 'no-store',
                });
                if (!response.ok) {
                    throw new Error('Recherche indisponible');
                }
                const data = await response.json();
                if (!requete.signal.aborted) {
                    setReponse({ terme, statut: 'pret', results: data.results });
                }
            } catch {
                if (!requete.signal.aborted) {
                    setReponse({ terme, statut: 'erreur', results: [] });
                }
            }
        }, 300);

        return () => {
            window.clearTimeout(attente);
            requete.abort();
        };
    }, [ouvert, terme]);

    useEffect(() => {
        if (ouvert && actif >= 0) {
            document.getElementById(identifiant + '-' + actif)?.scrollIntoView({ block: 'nearest' });
        }
    }, [actif, identifiant, ouvert]);

    const fermer = () => {
        setOuvert(false);
        setRecherche('');
        setActif(-1);
    };

    const naviguerAuClavier = (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            setOuvert(false);
            setActif(-1);
            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOuvert(true);
            if (resultats.length) {
                setActif((index) => event.key === 'ArrowDown'
                    ? (index + 1) % resultats.length
                    : (index <= 0 ? resultats.length - 1 : index - 1));
            }
        }

        if (event.key === 'Enter' && ouvert && resultats.length) {
            event.preventDefault();
            const selection = resultats[actif >= 0 ? actif : 0];
            fermer();
            router.visit(selection.url);
        }
    };

    return (
        <div
            ref={conteneur}
            className="relative min-w-0 flex-1 sm:w-72 sm:flex-none"
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setOuvert(false);
                    setActif(-1);
                }
            }}
        >
            <Icone nom="search" className="pointer-events-none absolute left-3 top-2 text-[18px] text-sage" />
            <input
                type="search"
                role="combobox"
                aria-label="Rechercher dans les pages et les dossiers"
                aria-autocomplete="list"
                aria-expanded={ouvert}
                aria-controls={identifiant}
                aria-activedescendant={ouvert && resultats[actif] ? identifiant + '-' + actif : undefined}
                autoComplete="off"
                maxLength={100}
                placeholder="Rechercher…"
                value={recherche}
                onFocus={() => setOuvert(true)}
                onChange={(event) => {
                    setRecherche(event.target.value);
                    setActif(-1);
                    setOuvert(true);
                }}
                onKeyDown={naviguerAuClavier}
                className="w-full rounded-lg border border-hairline bg-white py-1.5 pl-9 pr-4 text-body-sm text-ink placeholder:text-sage focus:border-ink focus:outline-none focus:ring-0"
            />

            {ouvert && (
                <div className="fixed inset-x-4 top-20 z-50 mt-2 overflow-hidden rounded-xl border border-hairline bg-white shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:w-[min(28rem,calc(100vw-2rem))]">
                    <p className="border-b border-hairline px-4 py-3 text-body-sm text-sage">
                        {terme.length < 2 ? 'Choisissez une page ou saisissez au moins 2 caractères pour chercher un dossier.' : 'Pages et résultats'}
                    </p>
                    <ul id={identifiant} role="listbox" aria-label="Résultats de recherche" aria-busy={chargement} className="max-h-[min(26rem,60vh)] overflow-y-auto overscroll-contain p-2">
                        {resultats.map((resultat, index) => (
                            <li key={resultat.id} role="presentation">
                                <Link
                                    id={identifiant + '-' + index}
                                    href={resultat.url}
                                    role="option"
                                    aria-selected={actif === index}
                                    onMouseEnter={() => setActif(index)}
                                    onClick={fermer}
                                    className={anneauFocus + ' flex items-start gap-3 rounded-lg px-3 py-2.5 ' + (actif === index ? 'bg-ivory' : 'hover:bg-ivory')}
                                >
                                    <Icone nom={resultat.icon} className="mt-0.5 shrink-0 text-[19px] text-sage" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block break-words text-body font-medium text-ink">{resultat.label}</span>
                                        <span className="block break-words text-body-sm text-sage">{resultat.description}</span>
                                    </span>
                                    <span className="shrink-0 text-[10px] uppercase text-sage">{resultat.type}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div role="status" aria-live="polite" className="px-4 pb-3 text-body-sm text-sage">
                        {chargement ? 'Recherche en cours…' : erreur ? 'La recherche est indisponible. Les pages restent accessibles.' : resultats.length === 0 ? 'Aucun résultat pour cette recherche.' : resultats.length + ' résultat(s).'}
                    </div>
                </div>
            )}
        </div>
    );
}
