
import { Head, Link, useForm } from '@inertiajs/react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import { anneauFocus } from '@/charte';
import { secondaryButton } from '@/brand';

export default function Edit({
    wedding,
    venues = [],
    services = [],
    selectedServiceIds = [],
    selectedServices = [],
}) {
    // get the amount who already exist
    const montantsInitiaux = selectedServices.reduce((acc, prestation) => {
        acc[Number(prestation.service_id)] = prestation.amount ?? '';
        return acc;
    }, {});

    const { data, setData, put, processing, errors } = useForm({
        email: wedding.couple?.email ?? '',
        wedding_date: wedding.wedding_date
            ? String(wedding.wedding_date).slice(0, 10)
            : '',
        venue_id: wedding.venue_id ? String(wedding.venue_id) : '',
        guest_count: wedding.guest_count ?? 0,
        service_ids: selectedServiceIds.map(Number),
        service_amounts: montantsInitiaux,
    });

    // add or take back a service
    const changeService = (serviceId, checked) => {
        const id = Number(serviceId);

        setData(
            'service_ids',
            checked
                ? [...data.service_ids, id]
                : data.service_ids.filter((selectedId) => selectedId !== id)
        );

        // keep the same amount if the service is not chosen
        // so that it isn't lost
    };

    // Modify the amount
    const changeAmount = (serviceId, montant) => {
        const id = Number(serviceId);

        setData('service_amounts', {
            ...data.service_amounts,
            [id]: montant,
        });
    };

    const submit = (event) => {
        event.preventDefault();

        put(route('admin.wedding.update', wedding.id));
    };

    return (
        <BackOfficeLayout>
            <Head title="Modifier le dossier" />

            <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
                <div>
                    <Link
                        href={route('admin.wedding.show', wedding.id)}
                        className={`${anneauFocus} mb-4 inline-flex items-center gap-2 text-sm text-[#72746a] hover:underline`}
                    >
                        ← Retour au dossier
                    </Link>

                    <p className="text-xs uppercase tracking-[0.2em] text-[#72746a]">
                        Gestion du mariage
                    </p>

                    <h1 className="mt-2 font-display text-3xl text-black">
                        Modifier le dossier
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Modifiez les informations du mariage et les prestations souscrites.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Informations du couple */}
                    <section className="space-y-4 rounded-2xl border border-[#e8e3dc] bg-white p-5">
                        <div>
                            <h2 className="font-display text-xl text-black">
                                Informations du couple
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Adresse e-mail de contact.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Adresse e-mail
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                maxLength={255}
                                required
                                autoComplete="email"
                                className="w-full rounded-lg border border-[#d8d2ca] px-3 py-2 focus:border-[#72746a] focus:ring-[#72746a]"
                            />

                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Informations du mariage */}
                    <section className="space-y-4 rounded-2xl border border-[#e8e3dc] bg-white p-5">
                        <div>
                            <h2 className="font-display text-xl text-black">
                                Informations du mariage
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Date, lieu et nombre d'invités.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="wedding_date"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Date du mariage
                                </label>

                                <input
                                    id="wedding_date"
                                    type="date"
                                    value={data.wedding_date}
                                    onChange={(e) => setData('wedding_date', e.target.value)}
                                    className="w-full rounded-lg border border-[#d8d2ca] px-3 py-2 focus:border-[#72746a] focus:ring-[#72746a]"
                                />

                                {errors.wedding_date && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.wedding_date}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="venue_id"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Lieu du mariage
                                </label>

                                <select
                                    id="venue_id"
                                    value={data.venue_id}
                                    onChange={(e) => setData('venue_id', e.target.value)}
                                    className="w-full rounded-lg border border-[#d8d2ca] px-3 py-2 focus:border-[#72746a] focus:ring-[#72746a]"
                                >
                                    <option value="">Lieu à définir</option>

                                    {venues.map((venue) => (
                                        <option key={venue.id} value={venue.id}>
                                            {venue.name}
                                        </option>
                                    ))}
                                </select>

                                {errors.venue_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.venue_id}
                                    </p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="guest_count"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Nombre d'invités
                                </label>

                                <input
                                    id="guest_count"
                                    type="number"
                                    min="0"
                                    max="10000"
                                    value={data.guest_count}
                                    onChange={(e) => setData('guest_count', e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-[#d8d2ca] px-3 py-2 focus:border-[#72746a] focus:ring-[#72746a]"
                                />

                                {errors.guest_count && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.guest_count}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Prestations souscrites */}
                    <section className="space-y-4 rounded-2xl border border-[#e8e3dc] bg-white p-5">
                        <div>
                            <h2 className="font-display text-xl text-black">
                                Prestations souscrites
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Sélectionnez les prestations et définissez leur montant.
                            </p>
                        </div>

                        {services.length > 0 ? (
                            <div className="space-y-3">
                                {services.map((service) => {
                                    const id = Number(service.id);
                                    const checked = data.service_ids.includes(id);

                                    return (
                                        <div
                                            key={service.id}
                                            className={`rounded-xl border p-4 transition ${
                                                checked
                                                    ? 'border-[#72746a] bg-[#f8f6f2]'
                                                    : 'border-[#e8e3dc] bg-white'
                                            }`}
                                        >
                                            <label className="flex cursor-pointer items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={(e) =>
                                                        changeService(service.id, e.target.checked)
                                                    }
                                                    className="rounded border-gray-300 text-[#72746a] focus:ring-[#72746a]"
                                                />

                                                <span className="text-sm font-medium text-gray-800">
                                                    {service.name}
                                                </span>
                                            </label>

                                            {checked && (
                                                <div className="mt-4 border-t border-[#e8e3dc] pt-3">
                                                    <label
                                                        htmlFor={`amount-${id}`}
                                                        className="mb-1 block text-sm font-medium text-gray-700"
                                                    >
                                                        Montant de la prestation (€)
                                                    </label>

                                                    <div className="relative max-w-xs">
                                                        <input
                                                            id={`amount-${id}`}
                                                            type="number"
                                                            min="0"
                                                            max="99999999.99"
                                                            step="0.01"
                                                            value={data.service_amounts[id] ?? ''}
                                                            onChange={(e) =>
                                                                changeAmount(id, e.target.value)
                                                            }
                                                            required
                                                            placeholder="Ex. 1200.00"
                                                            className="w-full rounded-lg border border-[#d8d2ca] bg-white px-3 py-2 pr-10 focus:border-[#72746a] focus:ring-[#72746a]"
                                                        />

                                                        <span className="absolute right-3 top-2 text-gray-500">
                                                            €
                                                        </span>
                                                    </div>

                                                    {errors[`service_amounts.${id}`] && (
                                                        <p className="mt-1 text-sm text-red-600">
                                                            {errors[`service_amounts.${id}`]}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                Aucune prestation n'est disponible.
                            </p>
                        )}

                        {errors.service_ids && (
                            <p className="text-sm text-red-600">
                                {errors.service_ids}
                            </p>
                        )}

                        {Object.keys(errors)
                            .filter((key) => key.startsWith('service_ids.'))
                            .map((key) => (
                                <p key={key} className="text-sm text-red-600">
                                    {errors[key]}
                                </p>
                            ))}
                    </section>

                    {/* Actions */}
                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <Link
                            href={route('admin.wedding.show', wedding.id)}
                            className={`${secondaryButton} inline-flex items-center justify-center rounded-lg px-5 py-2.5`}
                        >
                            Annuler
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className={`${anneauFocus} rounded-lg bg-[#72746a] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                            {processing
                                ? 'Enregistrement...'
                                : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>
            </main>
        </BackOfficeLayout>
    );
}
