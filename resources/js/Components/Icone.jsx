/**
 * Icône Material Symbols (police chargée dans app.blade.php).
 *
 * `nom` est le nom de l'icône chez Google (ex. « favorite ») ; la taille se
 * règle avec `text-[..px]` dans `className`.
 */
export default function Icone({ nom, className = '' }) {
    return (
        <span
            aria-hidden="true"
            className={`material-symbols-outlined select-none ${className}`}
        >
            {nom}
        </span>
    );
}
