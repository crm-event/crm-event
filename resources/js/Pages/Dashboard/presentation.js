const devise = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
});

export const euros = (centimes) => devise.format(centimes / 100);

export const dateCourte = (date) => new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});
