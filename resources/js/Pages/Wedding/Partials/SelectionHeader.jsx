
function MicroTitre({ children }) {
    return (
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-sage">
            {children}
        </p>
    );
}
export default function SelectionHeader({ nombre }) {
    return (
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
                <MicroTitre>La Dernière Touche · Gestion du studio</MicroTitre>
                <h1 className="mt-2 font-display text-display leading-tight text-ink">Vos mariages</h1>
                <p className="mt-2 max-w-xl text-body-sm leading-relaxed text-sage">
                    Retrouvez les dossiers de vos couples et accédez à leur espace de gestion.
                </p>
            </div>
            <div className="flex items-center gap-3 self-start rounded-xl border border-hairline bg-white px-4 py-3 sm:self-auto">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blush font-display text-title-sm text-ink">{nombre}</span>
                <span>
                    <span className="block text-caps uppercase tracking-brand text-sage">Dossiers</span>
                    <span className="mt-0.5 block text-body-sm text-ink">{nombre > 1 ? 'mariages enregistrés' : 'mariage enregistré'}</span>
                </span>
            </div>
        </header>
    );
}
