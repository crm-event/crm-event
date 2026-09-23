# Base de données — modèle et choix de conception

> **Statut : proposition.** À relire et valider par les deux groupes avant
> l'écriture des migrations. Les décisions marquées *proposée* ont été prises
> par un seul membre de l'équipe et doivent être confirmées.

Ce document explique **pourquoi** la base est construite ainsi. Le détail des
colonnes est dans le schéma lui-même.

| Fichier | Rôle |
| --- | --- |
| [`schema.dbml`](schema.dbml) | Schéma complet. À coller dans https://dbdiagram.io/d pour le diagramme |
| `database/migrations/` | Source de vérité une fois les migrations écrites. En cas d'écart, ce sont elles qui font foi, et `schema.dbml` doit être mis à jour |
| [`../CONTEXTE-PROJET.md`](../CONTEXTE-PROJET.md) | Le métier de la cliente, dont découle chaque choix ci-dessous |

---

## Vue d'ensemble

Tout s'organise autour du **mariage** (`weddings`), comme dans le métier de la
cliente : « 1 business, 1 client, 1 mariage ».

```
users ─0..1── couples ──1..n── weddings ──n..1── venues
                                  │
                                  ├── wedding_services ──── payments
                                  │         └────────────── quote_amendments
                                  ├── documents, proposals, media_items, messages   (portail)
                                  ├── appointments, tasks, timeline_items           (organisation)
                                  ├── time_entries, expenses                        (rentabilité)
                                  ├── wedding_vendor ──── vendors                   (équipe)
                                  └── reviews (0..1)
```

| Bloc | Tables | Rôle |
| --- | --- | --- |
| Comptes | `users`, `couples` | Qui se connecte, et les fiches clients |
| Mariage | `weddings`, `timeline_items`, `appointments`, `tasks` | Le projet, son déroulé, ses rendez-vous, ses tâches |
| Ventes | `services`, `wedding_services`, `quote_amendments`, `payments` | Prestations, devis, avenants, encaissements |
| Annuaires | `venues`, `vendors`, `vendor_categories`, `wedding_vendor` | Lieux et prestataires réutilisables |
| Portail | `documents`, `proposals`, `proposal_comments`, `media_items`, `messages`, `reviews`, `community_posts` | Ce que le couple voit et échange |
| Rentabilité | `time_entries`, `time_categories`, `expenses`, `expense_categories` | Temps passé et dépenses par mariage |
| Paramètres | `settings` | Taux et seuils modifiables |

---

## Conventions

- Noms **en anglais** (Definition of Done), tables **au pluriel**, colonnes en `snake_case`.
- Clé primaire `id` en bigint auto-incrémenté partout ; clés étrangères `<table>_id`.
- `created_at` / `updated_at` sur toutes les tables.
- Montants en `decimal(10,2)`, jamais en flottant.
- Dates seules en `date`, instants en `timestamp`.
- Un état qui a une date se stocke **par sa date** : `paid_at` plutôt qu'un booléen `is_paid`. On sait ainsi si c'est fait *et* quand, ce que la cliente demande pour les devis et les factures.

---

## Décisions de conception

Chaque décision indique ce qui a été retenu, pourquoi, et ce qui a été écarté.

### D1. Une seule table de comptes, avec un rôle — *validée*

**Retenu** : `users` avec `role` = `admin` (Jessica) ou `couple`. Un seul
système de connexion (guard `web`). Un middleware vérifie le rôle devant les
routes du back-office.

**Pourquoi** : une seule administratrice face à ses clients ne justifie pas
deux systèmes d'authentification. L'e-mail est unique sur toute l'application,
ce qui correspond à la règle « un compte = un couple = un e-mail ».

**Écarté** : deux guards et deux tables (`manager` / `couple`) comme dans
l'ancien code — plus complexe, sans bénéfice ici.

### D2. La fiche client est distincte du compte de connexion — *validée*

**Retenu** : `couples` contient **tous** les couples suivis ; `couples.user_id`
reste vide tant que Jessica n'a pas ouvert l'accès au portail.

**Pourquoi** : une fiche existe dès la première demande, alors qu'un compte
n'est créé qu'à l'étape « accès à l'application », après la proposition. En
2026, 21 demandes ont été perdues pour 12 validées : ces couples n'auront
jamais de compte, mais leur fiche compte pour les statistiques.

**Écarté** : mettre les informations du couple dans `users` — il faudrait
créer un compte de connexion à chaque demande reçue.

### D3. Une demande et un mariage sont la même ligne — *validée*

**Retenu** : une ligne `weddings` est créée au premier contact ; son `status`
avance jusqu'à la clôture, ou passe à `cancelled` avec un motif.

**Pourquoi** : c'est ainsi que la cliente travaille dans son Excel (une ligne
« EN ATTENTE » qui devient « VALIDÉ » ou « ANNULÉ »). « Combien de demandes,
combien de réservations » devient un simple comptage par statut.

**Écarté** : une table `requests` puis une table `weddings`, avec recopie des
données à la signature — l'ancien schéma (`reservation` + `wedding`).

### D4. Une ligne par prestation vendue — *validée*

**Retenu** : `wedding_services` relie un mariage à une prestation du catalogue
(`services`). Chaque ligne porte son devis, son contrat, ses paiements et ses
avenants.

**Pourquoi** : dans les fichiers de la cliente, un couple qui achète décoration
et coordination a **deux devis, deux contrats, deux acomptes et deux soldes**,
déclarés à l'URSSAF séparément.

**Écarté** : un devis unique par mariage.

### D5. Les statuts d'un mariage — *proposée*

`inquiry` (nouvelle demande) → `quote_sent` (moodboard + devis envoyés) →
`booked` (contrat signé) → `completed` (jour J passé) → `closed` (soldé,
rentabilité calculée). À tout moment : `cancelled`.

Calqué sur le workflow validé par la cliente en réunion 2. À confirmer, en
particulier la distinction entre `completed` et `closed`.

### D6. Les paiements ont leur propre table — *proposée*

**Retenu** : `payments`, une ligne par encaissement (`deposit`, `balance`,
`amendment`), avec numéro de facture, lien vers la facture et date de paiement.

**Pourquoi** : la cliente veut, pour chaque document, le numéro, l'état payé ou
non et la date. Un avenant ajoute un paiement sans modifier le devis. Le
**trimestre URSSAF n'est pas stocké** : il se déduit de `paid_at`, ce qui évite
toute incohérence.

**Écarté** : des colonnes `deposit_amount`, `balance_amount`… dans
`wedding_services` — figé à deux paiements, sans place pour les avenants.

### D7. Le contenu du portail est rattaché au mariage — *proposée*

**Retenu** : `documents`, `proposals`, `media_items`, `messages`, `tasks` et
`appointments` pointent vers `weddings`, pas vers `couples`.

**Pourquoi** : l'espace du couple, c'est son mariage. Le jour où un couple
revient pour un second événement, chaque projet garde ses propres documents.

### D8. Une nouvelle version de proposition = une nouvelle ligne — *proposée*

**Retenu** : chaque version du carnet design ou du moodboard est une ligne de
`proposals` (`version` = 1, 2, 3…), avec ses commentaires dans
`proposal_comments`. Le fichier lui-même est un `documents`.

**Pourquoi** : la cliente dépose un PDF ou des images, sans éditeur en ligne.
Les CGV limitent à 3 révisions : l'application le contrôle en comptant les
versions, à partir du paramètre `max_design_revisions`.

### D9. Les CGV de la saison sont un document — *proposée*

**Retenu** : un `documents` de catégorie `terms`, avec `requires_approval`.
Le couple l'approuve par « Lu et approuvé » (`approved_at`).

**Pourquoi** : les CGV changent chaque saison et Jessica les modifie elle-même.
Déposer le nouveau PDF suffit, sans table dédiée. Ce n'est pas une signature
électronique certifiée, et c'est assumé.

### D10. Les taux et seuils sont des paramètres datés — *principe validé, forme proposée*

**Retenu** : `settings` (`key`, `value`, `valid_from`). Pour connaître un taux
à une date, on prend la valeur la plus récente antérieure à cette date.

**Pourquoi** : le taux URSSAF est passé de 10,6 % en 2024 à 21,2 % ensuite, et
la cliente n'est pas encore sûre de passer à la TVA. L'historique 2024-2027
doit se recalculer avec les valeurs de l'époque. Les montants figés à un
instant donné (taux de TVA d'un devis) sont en revanche copiés dans la ligne
concernée.

### D11. Lieux et prestataires en annuaires — *validée*

`venues` et `vendors` sont réutilisés d'un mariage à l'autre : plusieurs
domaines reviennent chaque année dans ses fichiers. La photo d'un prestataire
est celle de sa **catégorie** (`vendor_categories.photo_path`), comme demandé
en réunion 3. `venues.travel_time_minutes` sert à la règle d'hébergement.

### D12. Temps et dépenses toujours rattachés à un mariage — *validée*

`time_entries.wedding_id` et `expenses.wedding_id` sont obligatoires : seule
l'activité liée aux mariages est suivie. C'est ce qui permet de calculer le
taux horaire effectif de chaque mariage, l'indicateur central de la cliente.

### D13. La provenance est une étiquette — *validée*

`weddings.lead_source` est un texte libre (« Site », « Insta »,
« WP - &lt;agence&gt; »…), sans table de partenaires.

### D14. Catalogues modifiables par la cliente — *validée*

`services`, `time_categories`, `expense_categories` et `vendor_categories`
sont des tables et non des listes figées : Jessica doit pouvoir ajouter ses
propres catégories. Une catégorie qui ne sert plus est désactivée
(`is_active`), jamais supprimée, pour ne pas casser l'historique.

---

## Règles portées par l'application, pas par la base

Ces règles viennent des CGV et des réunions. La base stocke les paramètres ; le
code les applique.

| Règle | Paramètre (`settings.key`) |
| --- | --- |
| Acompte de 30 % à la signature | `deposit_rate` |
| Solde dû un mois avant le mariage | `balance_due_days` |
| Caution de 10 % du devis | `security_deposit_rate` |
| Pénalité de retard de 10 % du solde par jour | `late_penalty_rate` |
| Rétractation de 14 jours | `withdrawal_days` |
| 3 révisions maximum du carnet design | `max_design_revisions` |
| Points d'étape à M-6, M-3, M-1 | `design_milestones` |
| Avis sollicité 30 jours après le mariage | `review_delay_days` |
| Hébergement au-delà de 45 minutes de trajet | `accommodation_threshold_minutes` |
| Taux de cotisations URSSAF | `urssaf_rate` |
| Seuils de TVA | `vat_threshold`, `vat_threshold_immediate` |

---

## Volontairement non modélisé

| Sujet | Raison |
| --- | --- |
| Lignes de détail d'un devis | En attente du devis d'exemple promis par la cliente |
| Factures | Émises par un outil externe : on ne garde que le numéro et le lien |
| Notifications | Aucune notification automatique, décision de la cliente |
| Trimestre URSSAF | Déduit de la date de paiement (D6) |
| Temps et dépenses hors mariage | Hors périmètre (D12) |
| Rôles multiples côté gestion | Une seule administratrice ; à revoir si stagiaires ou renforts doivent se connecter |
