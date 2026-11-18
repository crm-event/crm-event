import assert from 'node:assert/strict';
import test from 'node:test';
import { filtrerEncaissements } from '../../resources/js/Pages/filtreEncaissements.js';

const payments = [
    { id: 1, wedding_id: 1, paid_at: '2025-05-01' },
    { id: 2, wedding_id: 1, due_date: '2026-04-01' },
    { id: 3, wedding_id: 2, due_date: '2026-04-01' },
];

test('affiche uniquement les paiements du dossier sur toutes les années', () => {
    assert.deepEqual(filtrerEncaissements(payments, 'toutes', '1').map((payment) => payment.id), [1, 2]);
    assert.deepEqual(filtrerEncaissements(payments, 'toutes', '3'), []);
});

test('combine le dossier et l’année, ou affiche tous les dossiers', () => {
    assert.deepEqual(filtrerEncaissements(payments, '2026', '1').map((payment) => payment.id), [2]);
    assert.deepEqual(filtrerEncaissements(payments, '2026', null).map((payment) => payment.id), [2, 3]);
});
