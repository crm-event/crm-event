# Contexte du projet CRM Event

Ce document rassemble ce que l'équipe sait du métier de la cliente, de sa
demande et des décisions prises. Il sert de référence pour concevoir le modèle
de données et l'application.

Rédigé le 23 septembre 2026 à partir des sources listées en fin de document.

> Document anonymisé : les noms des couples, les identifiants de l'entreprise,
> les noms des partenaires et les chiffres d'affaires exacts ont été retirés.
> Les données brutes restent dans les fichiers transmis par la cliente,
> conservés hors du dépôt.

---

## 1. La cliente

Jessica Salles est entrepreneuse individuelle sous la marque La Dernière Touche
(ladernieretouche.com), à Marseille. Elle est au régime de la micro-entreprise :
comptabilité de caisse et déclarations URSSAF trimestrielles.

- Activité depuis 2024, spécialisée dans la décoration de mariage
- Zone : Provence et Côte d'Azur
- Volume : 10 à 15 événements par an
- Clientèle en partie internationale, d'où la question de la langue
- Positionnement haut de gamme, avec la devise « Faire de votre mariage, votre
  endroit préféré au monde »
- Elle travaille seule, avec une stagiaire et des renforts ponctuels (d'autres
  prestataires) pour les jours J chargés

### Les prestations vendues

| Prestation | Contenu |
| --- | --- |
| Wedding design (décoration) | Moodboard, devis, carnet design, suivi, puis installation le jour J et désinstallation le lendemain |
| Coordination | Optimisation du planning avec les mariés, contact des prestataires, vérification des animations |
| Officiante de cérémonie | 10 questionnaires « carnet d'histoire », 3 rendez-vous étape, rédaction et animation de la cérémonie |

Les prestations se combinent. Ses fichiers contiennent « Décoration +
Coordination », « Décoration + Officiante » et « Officiante + Coordination ».
En 2024, le catalogue comportait aussi « Décoration + fleurs » et « Location »,
l'offre a donc évolué.

---

## 2. Le besoin

### Ses outils actuels

| Outil | Usage |
| --- | --- |
| Google Drive | compta, suivi des demandes, taux horaire, contrats et infos clients, agenda |
| Gmail | réception des demandes, suivi client, envoi des documents |
| Canva | carnet design, devis et factures |
| Excel | les trois classeurs décrits en section 4 |
| Instagram et site web | communication, réception de demandes |
| WhatsApp | échanges avec les couples et les intervenants |
| Plateforme de facturation, notes, PDF | le reste |

Elle résume la situation ainsi : trop d'information, trop d'emplacements, trop
de tâches manuelles.

### Sa demande

Ses formules, reprises de sa présentation :

> « Nous ne recherchons pas un site vitrine. »
> « D'un PDF statique à un projet vivant. »
> « 1 business, 1 client, 1 mariage : un système connecté. »

Elle attend un CRM, avec gestion de projet, portail client, wedding book et
tableau de bord.

Elle fixe deux objectifs :
1. des outils qui l'aident dans sa gestion quotidienne ;
2. des outils qui améliorent l'expérience de ses clients.

### Le pilotage qu'elle souhaite

- Leads : combien, et à quel moment
- Ventes : nombre de propositions et nombre de réservations
- Revenu : CA généré, CA encaissé, CA à venir
- Projets : nombre de mariages, stade d'avancement, échéances
- Rentabilité : ce que rapporte chaque projet
- Suivi financier : factures, acomptes, soldes et dépenses

### Le portail qu'elle imagine

Un espace par client, qui regroupe son mariage (les informations clés), sa
vision (les étapes de la conception), son projet (tâches, décisions, échéances,
rendez-vous), ses documents (contrats, devis, plans) et ses échanges avec
Jessica.

### L'organisation d'un mariage

- Couple : contacts, informations importantes
- Lieu : adresse, accès, contacts, conditions
- Équipe : wedding planner, traiteur, photographe, DJ, loueur
- Déroulé : cérémonie, dîner, discours, soirée
- Design : plan de table, décor, papeterie, instructions de mise en place

---

## 3. Le cycle de vie d'un mariage

### Étapes validées par la cliente (réunion 2)

1. Demande
2. Premier rendez-vous
3. Moodboard et devis
4. Proposition
5. Accès à l'application
6. Signature du contrat
7. Suivi du projet aux points M-6, M-3 et M-1
8. Facturation du solde (M-1)
9. Jour J
10. Clôture et calcul de la rentabilité

Elle découpe aussi son activité en trois temps : avant (demandes, appels, devis,
contrats), pendant (design, planning, achats, suivi client) et après (factures,
paiements, avis, souvenirs).

### Une demande type

Sa présentation montre un exemple réel : un couple étranger, recommandé par une
autre wedding planner, écrit avec une date, un lieu, environ 50 invités et des
inspirations en pièce jointe, et demande un rendez-vous. Les demandes arrivent
par mail, Instagram, SMS ou via le site.

### Statuts utilisés dans ses fichiers

- Demande : VALIDÉ, EN ATTENTE ou ANNULÉ
- Devis : `Ok`, `attente retour`, `Envoyé le ...`, `Répondre à la demande`,
  `Devis à finaliser`. La colonne mélange en fait l'état et des notes.
- Contrat : `Ok`, `Non` ou `-`
- Factures 1 et 2 : `Ok`, `Non` ou `-`

### Motifs d'annulation relevés

`plus de retour`, `ont pris quelqu'un d'autre`, `date bookée en déco`,
`n'ont pas donné suite`, `font eux-mêmes`, `choix autre presta`,
`choix autre presta par rapport au prix`, `pas de retour malgré deadline`,
`attente info complémentaire`, `relancé, pas de retour`.

En 2026, on compte 21 demandes annulées pour 12 validées. Le suivi des demandes
perdues fait donc pleinement partie de son activité.

---

## 4. Ses trois classeurs Excel

### 4.1 Suivi des demandes de mariage

C'est son CRM actuel, avec une feuille par année : `Suivi demandes 2026`,
`Suivi demandes 2027`, `Archives 2025` et `Archives 2024`.

Les colonnes sont les mêmes sur toutes les feuilles :

| Colonne | Contenu |
| --- | --- |
| (statut) | VALIDÉ, EN ATTENTE ou ANNULÉ |
| CLIENT | prénoms du couple |
| DATE | date du mariage |
| LIEU | nom du domaine |
| Prise de contact | date du premier contact |
| PROVENANCE | origine de la demande |
| PRESTATION | décoration, coordination, officiante, ou une combinaison |
| DEVIS | état du devis |
| CONTRAT | état du contrat |
| TOTAL | montant de la prestation |
| ACOMPTE | 30 % du total |
| FACTURE 1 | facture d'acompte émise ou non |
| URSSAF | trimestre de déclaration de l'acompte, par exemple `T4 (2024)` |
| SOLDE | reste à payer |
| FACTURE 2 | facture de solde émise ou non |
| URSSAF | trimestre de déclaration du solde |
| BÉNÉFICES | |

En haut de chaque feuille, des totaux recalculés chaque année :
- `RÉPARTITION MARIAGE 2026` : mai 2, juin 3, août 1, septembre 2
- `PÉRIODE DEMANDE 2026` : mars 1, mai 1, août 2, septembre 1, octobre 4,
  novembre 4, décembre 6, janvier 7, février 4
- `TYPE` : coordination 0, décoration 8, officiante 0, décoration et
  coordination 2, décoration et officiante 1
- des colonnes `ATTENTION`, `PHOTOBOOTH` et `LIVRE AUDIO` pour les options
- des notes de renfort, par exemple `30/05/2026 renfort <prestataire>`

En bas de chaque feuille, une ventilation fiscale qui traverse les exercices :
des lignes `Acompte 2024>2026`, `Acompte 2025>2026` et `Acompte 2026>2026`
(acomptes encaissés une année pour un mariage d'une année suivante), une ligne
`SOLDE 2026`, et les seuils `/37500 TVA l'année pro` et `/41250 TVA immédiate`.

Un couple qui achète plusieurs prestations occupe plusieurs lignes, et chaque
ligne a son propre devis, son contrat, son acompte, son solde et son trimestre
URSSAF. Par exemple, un couple a une ligne décoration d'environ 4 400 € et une
ligne coordination d'environ 1 700 €. Un autre a une ligne coordination
d'environ 2 000 € et une ligne décoration d'environ 4 000 €. Un troisième
combine décoration et officiante. Le devis et les paiements dépendent donc de
la prestation, et non du mariage.

Les provenances se rangent en plusieurs familles :
- canaux directs : `Site`, `Insta`, `Sms`, `Email`
- annuaire en ligne : `Mariage.net`
- wedding planners partenaires, une dizaine d'agences notées `WP - <agence>`
- photographes qui la recommandent, cinq au total, notés par leur nom
- recommandations de particuliers, notées `Recommandation <prénom>`

Une bonne part de son chiffre vient des recommandations d'autres
professionnels, ce qui en fait un axe d'analyse utile.

Les lieux représentent une cinquantaine de domaines, dont plusieurs reviennent
d'une année sur l'autre (Mas de la rose, Grand Lauron, Château Tour Vaucros,
Domaine Amourella, Mas des Costes...). Un annuaire réutilisable est donc
justifié.

### 4.2 Suivi du chiffre d'affaires

Une feuille par exercice : `URSSAF 24`, `URSSAF 25`, `URSSAF 26` et `URSSAF 27`.

Chaque feuille est découpée en quatre trimestres. Sous chaque trimestre, elle
liste les encaissements avec un commentaire comme `Acompte N+E`, `Solde S+M`
ou `Acompte cérémonie C+L`. En bas figurent `TOTAL`, `CA`, `RESTANT`, `IMPÔT`
et `CFE`.

Son chiffre d'affaires annuel se compte en dizaines de milliers d'euros. Il a
fortement augmenté depuis 2024 et se rapproche des seuils de TVA. Pour chaque
exercice, elle suit le CA déclaré, les cotisations, l'impôt et la CFE, et pour
chaque trimestre le CA encaissé et les cotisations correspondantes.

Le taux de cotisation change selon les années : colonnes `0.106` et `0.2` en
2024, `0.212` en 2025 et 2026. Les libellés (`TOTAL 21%`, `TOTAL 20%`) ne
correspondent d'ailleurs pas toujours au taux appliqué. Les taux et les seuils
doivent donc être des paramètres datés, et non des valeurs fixes dans le code.

Certains commentaires montrent comment elle raisonne : « option 2 facture
passage TVA ou ne pas déclarer ? », ou encore « facture idéale pour passage à
la TVA immédiate, déclarer les 2 soldes en même temps ». Elle choisit le moment
de l'encaissement en fonction du seuil de TVA. La date d'encaissement compte
donc autant que la date du mariage.

### 4.3 Suivi du temps et des dépenses

Quatre feuilles : `Task tracking + compta 26`, `Fournitures 26`, `Frais perso`
et `Archive 2025`.

Le suivi du temps comporte les colonnes `MARIAGE`, `date`, `tâche`, `temps`
(en minutes) et `catégorie`.

Catégories de tâches relevées : `Moodboard/devis`, `Màj carnet`, `Création`,
`Expérience client`, `Communication`, `Réseau`, `Rdv`, `Trajet VT`,
`Trajet jour J`, `Trajet j+1`, `Installation lieu`, `Désinstallation lieu`,
`Présence coordination`, `Préparation fleurs`, `Nettoyage fleurs`,
`Achat fleurs`, `Achat décoration`, `Achat matériel`, `Préparation matériel`,
`Chargement`, `Rangement`, `Scénographie`, `Design`, `Incident`.

La colonne `MARIAGE` ne contient pas que des mariages. On y trouve aussi
`Général`, `IUT`, `Micro shooting`, `Projet prieuré` et `Emmy`, c'est-à-dire du
temps passé hors mariage client. L'équipe a décidé de ne suivre que l'activité
liée aux mariages (voir section 6).

Le suivi des achats comporte les colonnes `MARIAGE`, `date`, `achat`,
`quantité`, `prix`, `boutique`, `catégorie`, `commentaire`, `Remboursement` et
`Prix facturé client`.

Catégories d'achat : `tissu`, `papier`, `support`, `Décoration`, `Papeterie`,
`Frais déplacement`, `Accessoire`, `Logement`, `Location`, `Cadeau`.

Boutiques : Temu, Amazon, Shein, Action, Ikea, Castorama, Leroy Merlin, Weldom,
Carrefour, Leclerc, Lidl, Intermarché, Monoprix, Grand Frais, Esso, Total,
Escota (péages), Olympic Location (camion), Verdnatura et MIN (fleurs), Tissu
Ursule, Maxiburo, Francetoner, Booking, Colissimo, Mondial Relay, AliExpress,
Rosemood, Passiondecor...

Une synthèse par mariage occupe une colonne par couple (`A+A`, `S+M`, `N+E`,
`C+L`, `L+B`, `S+F`, `N+N`, `Ay+Ak`, `J+A`, `O+A`, `V+D`...), avec ces lignes :

| Ligne | Signification |
| --- | --- |
| `Facture client` | montant facturé |
| `Coût global` | total des achats |
| `Charge 20%` | cotisations |
| `Bénéfice` | ce qui reste |
| `Heure passée` | total en heures |
| `%` | marge |
| `e/h` | taux horaire effectif |
| `Remboursement prévisionnel` | achats à se faire rembourser |

Les taux horaires constatés vont de 67 à 180 € de l'heure (67, 79, 83, 106, 107,
124 et 180), pour 29 à 50 heures de travail par mariage. C'est l'indicateur
auquel elle tient le plus, parce qu'il montre ce que rapporte réellement un
mariage une fois le temps passé pris en compte.

La feuille Fournitures regroupe les dépenses de fonctionnement, sans lien avec
un mariage, avec les colonnes `Catégorie`, `Produit`, `Boutique`, `Quantité`,
`Prix`, `Date achat`, `Date renvoi`, `Remboursement` et `Commentaire`. Ses
catégories : `Outil`, `Outil digital` (abonnements Canva et Squarespace),
`Finance` (impôts), `Épargne pro` (PER), `Assurance` (RC Pro), `Réseau` (cafés,
rendez-vous), `Expérience client` (cadeaux, colis), `Branding`, `Quotidien`
(essence) et `Renfort`.

Elle note aussi les retours d'articles et les remboursements : `Date renvoi`,
`Remboursement`, `Récupéré de commande précédente`, `remboursement non livré`.

---

## 5. Les règles des CGV

Source : les CGV 2025 transmises par la cliente. Elles changent d'une saison à
l'autre et Jessica les modifie elle-même.

### Paiement
- Acompte de 30 % à la signature du devis, non remboursable quelle que soit la
  raison de l'annulation
- Solde à régler au plus tard un mois avant le mariage
- Pénalité de retard de 10 % du solde par jour
- Si la demande arrive moins d'un mois avant l'événement, tout est payé à la
  signature
- Caution de 10 % du total du devis, en général par chèque non encaissé
- Paiement par virement bancaire uniquement (le RIB figure dans les CGV)

### Devis et avenants
- Le devis précise les honoraires, le matériel, les frais d'installation et de
  désinstallation, ainsi que les frais de déplacement et d'hébergement
- Il a une durée de validité, au-delà de laquelle Jessica peut le revoir
- Une fois signé, il ne peut plus être modifié : toute demande supplémentaire
  passe par un avenant
- Un élément inscrit au devis signé ne peut plus être retiré. Son montant reste
  dû, et Jessica peut le réaffecter à d'autres éléments

### Déplacement et hébergement
- Les frais couvrent les kilomètres et le temps de trajet pour la visite
  technique, le jour J et le lendemain
- Le point de départ est son domicile, à Marseille
- L'hébergement est inclus dans le devis si le lieu est à plus de 45 minutes
- Le stationnement et la location d'un utilitaire sont facturés le cas échéant

### Wedding design
- Parcours : ébauche de moodboard, puis devis, puis carnet design
- Trois points d'étape, à M-6, M-3 et M-1
- Trois révisions au maximum pour le carnet design
- Le client commente dans le carnet, et « aucun autre moyen de communication ne
  sera pris en compte pour effectuer des modifications »
- Les illustrations sont indicatives et non contractuelles, sans engagement sur
  une variété ou une couleur de fleur précise
- Désinstallation le lendemain, avec des frais supplémentaires si le lieu impose
  de désinstaller la nuit
- Le matériel prêté est sous la responsabilité du client de l'installation à la
  désinstallation. Casse, perte ou vol sont à rembourser

### Officiante
- 10 questionnaires « carnet d'histoire » à remplir par le couple
- 3 rendez-vous étape
- Un groupe WhatsApp avec les proches qui interviennent

### Annulation
- Tout changement de date vaut annulation. Jessica peut proposer un nouveau
  devis si elle est disponible à la nouvelle date
- Annulation par le client : les sommes versées sont conservées
- Annulation par Jessica : le solde est remboursé s'il a été versé
- Force majeure (article 1218 du Code civil) : le solde est remboursé

### Divers
- Droit de rétractation de 14 jours ouvrés
- Droit à l'image accordé par défaut, sauf refus écrit du couple. Le client
  s'engage à partager la galerie du photographe
- RGPD : droit d'accès, de modification et de suppression
- Litiges : recours à un médiateur (Société Médiation Professionnelle)

---

## 6. Décisions prises

### Par la cliente et par l'équipe

| Sujet | Décision | Source |
| --- | --- | --- |
| Justificatif de dépense | Une photo du ticket peut être jointe à chaque dépense | réunion 1 |
| Compte client | Un compte par couple, identifié par un e-mail | réunion 1 |
| Création des accès | Jessica crée les comptes et envoie les accès par mail, le couple peut ensuite changer son mot de passe | réunion 1 |
| Facturation | Pas de facturation dans l'application, mais un lien vers un outil externe, à choisir d'ici 2027 | réunions 2 et 3 |
| Support | Application web responsive, le mobile servant surtout à consulter | réunions 2 et 3 |
| Historique | Reprise complète des données 2024-2027 | équipe |
| Espace communautaire | Inclus dans le projet | équipe |
| Notifications | Aucune notification automatique. Seuls des mails envoyés à l'initiative de Jessica (accès au compte, devis, contrat). Pas de SMS, éventuellement WhatsApp | réunions 1 à 3, équipe |
| Statut de compte | Un compte peut être suspendu | réunion 3 |
| Devis et factures | Elle veut voir le numéro de devis, le numéro de facture, si c'est payé et à quelle date | réunion 3 |
| Liste de tâches | Trois états (à faire, en cours, fait), plus la suppression | réunions 2 et 3 |
| Catégories | Elle doit pouvoir en ajouter | réunion 3 |
| Messages vocaux | Conservés | réunion 3 |
| Prestataires | Une photo par catégorie de prestataire, pas une par prestataire | réunion 3 |
| CGV | Remplies et approuvées par les clients, elles changent chaque saison et Jessica les modifie | réunions 3 et 4 |
| Design du portail | Proche de son site, avec un équilibre entre noir et vert | réunion 3 |
| Rendez-vous | Jamais créés automatiquement | réunion 2 |
| Taux et seuils fiscaux | Modifiables, car elle ne sait pas encore si elle passera à la TVA | équipe |
| Temps et dépenses | Seule l'activité liée aux mariages est suivie | équipe |
| Provenance des demandes | Une simple étiquette, sans table dédiée | équipe |
| Lieux et prestataires | Des annuaires réutilisables | équipe |
| Identifiant de connexion | L'e-mail, sans identifiant séparé | équipe |
| Prestations | Un mariage peut avoir plusieurs prestations, chacune avec son devis | équipe, d'après ses fichiers |
| Comptes | Une seule table `users` avec un rôle, sans système de connexion séparé par espace | équipe |
| Demandes et mariages | Une demande et un mariage sont un même enregistrement, dont le statut évolue | équipe |

Le détail des choix sur la base de données est dans [`bdd/README.md`](bdd/README.md).

### Points encore ouverts

- Le devis d'exemple promis par la cliente n'est pas encore arrivé. Il permettra
  de définir les lignes d'un devis.
- La forme de la signature n'est pas tranchée (manuscrite numérique ou à la
  main). L'autre groupe a mis en place une approbation où le couple recopie « Lu
  et approuvé », ce qui n'est pas une signature électronique certifiée.
- Le contenu exact du tableau de bord reste à préciser avec la cliente.
- Elle n'a pas d'horaires fixes et raisonne pour l'instant en temps passé par
  mariage, pas en taux d'occupation.
- Une relance automatique pour la signature du contrat, trois semaines après
  l'envoi, a été suggérée mais pas décidée.
- La cliente doit examiner les maquettes Figma en détail en octobre.

---

## 7. Organisation de l'équipe

### Composition

Groupe 1 (gestion) : CLOT-GODARD Kenji, DARGENTOLLE François, HADDAD
Mohamed-Amine, MEKIDICHE Idris, RATIANANAHARY Karmen.
Groupe 2 (portail client) : GHEUX Théo et son équipe.

Les deux groupes ont d'abord cru travailler sur deux projets distincts. Il
s'agit en fait d'une seule application, dont les deux parties sont trop liées
pour être développées séparément. Les deux groupes travaillent donc comme une
seule équipe, et la répartition des tâches se fera ensuite. Le schéma de base de
données couvre toute l'application.

### Definition of Done

- le code est en anglais
- le code est documenté
- le code est testé, avec au moins une classe de test par contrôleur ou modèle
- le code passe les outils de qualité (PHPStan, PHP_CodeSniffer, PHPUnit,
  PHPDoc, PHP Linter)

### Sprints

| Sprint | Dates | Titre |
| --- | --- | --- |
| S0 | 7-11 sept | Cadrage et socle |
| S1 | 14-25 sept | De la demande au devis |
| S2 | 26 oct - 6 nov | Contrat, organisation et coûts |
| S3 | 2-6 nov | Facturation, pilotage et clôture |

### Besoins non fonctionnels

Un parcours simple et léger pour les couples. Le respect du RGPD, avec un guide
d'utilisation, des conditions générales, une notice sur les cookies, la
suppression de compte et le changement de mot de passe. Des accès contrôlés
selon le profil. Aucun retour en arrière sur un devis signé, qui passe par un
avenant. Un design sobre et homogène, conforme à la charte.

### Besoins fonctionnels

Commun : authentification et signature du contrat.

Portail client : formulaires, changement de mot de passe, signalement des
documents modifiés, approbation des documents.

Gestion : vue résumée des informations clés, dossier client (formulaire, devis,
contrat), facturation, comptabilité, création et envoi de devis, tableau de bord
(calendrier global et statistiques), rappels (points M-6, M-3 et M-1, paiements,
réservations, modifications), avis clients, suivi du temps sous forme de kanban,
règlement final.

En option : une messagerie commune.

### Technique

Une seule application Laravel 13 avec Inertia.js 2 et React 19, en PHP 8.3,
avec Vite 8 et Tailwind 4. La base MariaDB est hébergée chez Alwaysdata. Il n'y
a pas d'API séparée ni de front indépendant.

---

## 8. Les écrans déjà produits

### Maquettes Figma du groupe gestion

Le fichier `CRM-Event` contient 15 écrans : tableau de bord, demandes (en
kanban), fiche demande, fiche mariage, prestations et devis (avec les
avenants), facturation (échéancier et TVA), dépenses (justificatifs et frais),
temps passé (feuille d'heures), calendrier (organisation et jour J) et
rentabilité, plus 5 versions mobiles.

Le tableau de bord affiche les mariages en cours, le CA encaissé sur l'année
avec le seuil de TVA à surveiller, les demandes en attente, la prochaine
échéance, un calendrier mensuel des mariages et des échéances, un graphique du
CA encaissé par mois, les rappels prioritaires (rendez-vous de découverte,
échéance d'acompte, avenant en attente de signature) et l'activité récente.

### Démo du groupe portail

Le groupe portail a une application qui fonctionne déjà, montrée en vidéo.

Côté Jessica : la liste des espaces clients (accès actif, en attente de
première connexion, ou suspendu), les documents partagés, les propositions, les
médias et moodboards, une conversation par couple, la liste des messages et les
retours d'expérience.

Côté couple : un accueil avec un compte à rebours jusqu'au mariage, les
documents, les propositions, les inspirations, les rendez-vous, les messages,
une page contact et le compte.

Les champs et états à reprendre de leur travail :

- Documents : catégorie (rendez-vous, carnet de design, contrat, CGV), date de
  consultation, état d'approbation (non demandée, en attente, ou approuvé avec
  la date), possibilité de retirer un document. Formats PDF, image ou Word,
  10 Mo au maximum.
- Propositions, séparées des documents : type (carnet de design ou moodboard),
  compteur de révisions sur 3, état commentée ou validée, avec un document et un
  visuel joints en option.
- Médias : collections (images ou moodboards), description servant de texte
  alternatif, image ou vidéo, 25 Mo au maximum.
- Messages : un fil par couple, séparé des autres, en texte ou en vocal.
- Retours d'expérience : invitation 30 jours après le mariage, délai réglable,
  suivi des couples sollicités.
- Rendez-vous : un type par étape (par exemple « Point design M-6 »), la date,
  l'heure et le mode (visioconférence).
- Approbation : le couple recopie « Lu et approuvé », ce qui n'est pas une
  signature électronique certifiée.

Leur charte graphique est proche de la nôtre, avec des formes plus arrondies et
plus d'espace. La nôtre sert de référence : on reprend leurs champs et leurs
états, pas leur mise en page. Leurs écrans côté Jessica recoupent la partie
gestion, et ce sont nos versions qui priment.

---

## 9. Identité visuelle

Charte fournie par la cliente :

| Couleur | Code |
| --- | --- |
| Beige rosé | `#F1E9E3` |
| Vert-gris | `#72746A` |
| Blanc cassé | `#F8F6F2` |
| Blanc | `#FFFFFF` |
| Noir | `#000000` |

Typographie : Baskerville Display PT. Logo : un « D » en monogramme avec la
mention « LA DERNIÈRE TOUCHE ».

Le carnet design suit toujours la même structure : un sommaire paginé, puis les
parties Réception (vue d'ensemble, types de tables), Layout (signalétique,
espaces d'accueil), Cérémonie et Fleurs. La partie Fleurs est rattachée au point
M-1. Le plan de table précise les types de tables : une table des mariés, quatre
tables invités d'un premier modèle, cinq d'un second, et les jonctions. Le
moodboard indique les noms du couple, la date, le lieu et les prestations
vendues.

---

## 10. Valeurs à rendre paramétrables

Aucune de ces valeurs ne doit être écrite dans le code. Elles changent selon la
saison, l'exercice ou la réglementation, et l'historique 2024-2027 doit pouvoir
être recalculé avec les valeurs de l'époque.

- Taux de cotisation URSSAF (10,6 % en 2024, 21,2 % en 2025 et 2026)
- Seuils de TVA (37 500 € et 41 250 €)
- Taux de l'acompte (30 %)
- Montant de la caution (10 %)
- Pénalité de retard (10 % par jour)
- Délai de paiement du solde (M-1)
- Délai de rétractation (14 jours)
- Nombre de révisions du carnet design (3)
- Points de suivi (M-6, M-3, M-1)
- Délai avant de solliciter un avis (30 jours après le mariage)
- Temps de trajet au-delà duquel l'hébergement est inclus (45 minutes)
- Catégories de dépenses, de temps et de documents, que Jessica peut compléter

---

## 11. Historique du dépôt

Le 23 septembre 2026, le dépôt est reparti d'un projet Laravel vierge, avec
l'accord de l'équipe. L'ancien code avait été écrit par plusieurs personnes,
chacune de son côté, sur des hypothèses différentes et parfois contradictoires.
Un daily du 14 septembre en garde la trace : « en attente de l'UML de base de
données du groupe 2, si aucune réponse, commence sans eux ». Un inventaire de ce
code a été fait avant sa suppression, et il reste consultable dans l'historique
Git.

Défauts de l'ancien schéma à ne pas reproduire :
- un e-mail ni unique ni obligatoire, alors que la connexion reposait dessus
- deux tables sans lien entre elles pour le même événement (`couple_space` et
  `wedding`)
- deux tables concurrentes pour les avis clients
- des clés primaires de types différents d'une table à l'autre
- des tables créées en majuscules puis renommées
- 24 tables métier sur 28 sans modèle, contrôleur ni test

---

## 12. Sources

Les fichiers de la cliente sont confidentiels et ne sont pas dans le dépôt.

| Source | Contenu | Lecture |
| --- | --- | --- |
| Présentation de la cliente (17 diapositives) | besoins, vision, parcours client | complète |
| CGV 2025 | règles contractuelles | texte intégral |
| Suivi des demandes (Excel) | demandes 2024-2027 | complète, 4 feuilles |
| Suivi du chiffre d'affaires (Excel) | fiscalité 2024-2027 | complète, 4 exercices |
| Suivi du temps et des dépenses (Excel) | temps, achats, fournitures | complète, 4 feuilles |
| Exemples de carnet design et de moodboard | structure des livrables | version texte |
| Charte graphique | couleurs, typographie | complète |
| Questions, comptes rendus et backlog | réunions 1 à 4, DoD, sprints | complète |
| Maquettes du groupe gestion | Figma `CRM-Event` | 15 écrans |
| Démo du groupe portail | captures d'une vidéo | captures perdues, contenu repris ici |
