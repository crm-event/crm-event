export default function TextField({ label, id, error, className = '', ...props }) {
    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <input
                id={id}
                {...props}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
