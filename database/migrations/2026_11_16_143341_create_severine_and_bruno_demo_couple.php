<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Console\Output\ConsoleOutput;

/**
 * Create Séverine & Bruno, the invented couple used for the presentation,
 * with a couple space and a wedding at the stage the demo starts from: the
 * contract signed and paid in part, the brief written, a first design book
 * waiting for their answer, an amendment to approve and a message from Jessica
 * not read yet.
 *
 * No password is written here: the account gets a temporary code, shown once
 * in the output of `php artisan migrate`, to replace at the first login. The
 * documents are small PDF files generated here and stored on this machine, so
 * the migration must run on the server.
 *
 * It does nothing in the test suite, whose databases must start empty, nor
 * when the account already exists. It runs after the migration that opens the
 * account of Jessica, who sends the documents and the messages.
 */
return new class extends Migration
{
    /**
     * Login of the couple: an address of the reserved example.com domain,
     * which no mail ever reaches.
     */
    public const EMAIL = 'severine.bruno@example.com';

    private const JESSICA_EMAIL = 'ladernieretouche.event@gmail.com';

    private const FILES_DIRECTORY = 'documents/demo-severine-bruno';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (app()->runningUnitTests()) {
            return;
        }

        $temporaryCode = $this->createDemoCouple();

        if ($temporaryCode !== null) {
            (new ConsoleOutput)->writeln(sprintf(
                '  <info>Compte de Séverine & Bruno (%s), code temporaire : %s</info>',
                self::EMAIL,
                $temporaryCode,
            ));
        }
    }

    /**
     * Create the couple and its wedding, and return the temporary code of the
     * account, or null when an account already uses the address.
     */
    public function createDemoCouple(): ?string
    {
        if (User::query()->where('email', self::EMAIL)->exists()) {
            return null;
        }

        return DB::transaction(function (): string {
            $user = new User(['name' => 'Séverine & Bruno', 'email' => self::EMAIL]);
            $user->forceFill(['email_verified_at' => now()]);
            $temporaryCode = $user->assignTemporaryPassword();

            $jessicaId = DB::table('users')->where('email', self::JESSICA_EMAIL)->value('id');

            $coupleId = DB::table('couples')->insertGetId([
                'user_id' => $user->id,
                'partner1_first_name' => 'Séverine',
                'partner1_last_name' => 'Morel',
                'partner2_first_name' => 'Bruno',
                'partner2_last_name' => 'Lambert',
                'email' => self::EMAIL,
                'postal_code' => '13100',
                'city' => 'Aix-en-Provence',
                'preferred_language' => 'fr',
                'created_at' => '2026-09-12 09:30:00',
                'updated_at' => now(),
            ]);

            $weddingId = DB::table('weddings')->insertGetId([
                'couple_id' => $coupleId,
                'venue_id' => $this->venueId(),
                'status' => 'booked',
                'wedding_date' => '2027-07-10',
                'first_contact_at' => '2026-09-12',
                'lead_source' => 'Instagram',
                'guest_count' => 95,
                'estimated_budget' => 9000,
                'notes' => "Concept « Bohème provençale » : lin naturel, oliviers et lumière dorée de fin de journée.\nCérémonie laïque sous les oliviers, dîner en tables longues.",
                'created_at' => '2026-09-12 09:30:00',
                'updated_at' => now(),
            ]);

            $this->createQuotesAndPayments($weddingId);
            $this->createAppointments($weddingId);
            $this->createBrief($weddingId);
            $this->createDocumentsAndDesignBook($weddingId, $jessicaId);
            $this->createMessages($weddingId, $jessicaId, $user->id);

            return $temporaryCode;
        });
    }

    /**
     * The venue of the wedding, taken from Jessica's directory when it is
     * there.
     */
    private function venueId(): int
    {
        return DB::table('venues')->where('name', 'Domaine de Sulauze')->value('id')
            ?? DB::table('venues')->insertGetId([
                'name' => 'Domaine de Sulauze',
                'postal_code' => '13140',
                'city' => 'Miramas',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
    }

    /**
     * One signed quote per service, each with its deposit of 30 % paid and
     * its balance due one month before the wedding (terms of sale).
     */
    private function createQuotesAndPayments(int $weddingId): void
    {
        $quotes = [
            ['service' => 'Wedding design', 'amount' => 4200, 'quote' => 'D-2026-118', 'invoice' => 'F-2026-071'],
            ['service' => 'Coordination', 'amount' => 2600, 'quote' => 'D-2026-119', 'invoice' => 'F-2026-072'],
        ];

        foreach ($quotes as $quote) {
            $weddingServiceId = DB::table('wedding_services')->insertGetId([
                'wedding_id' => $weddingId,
                'service_id' => $this->serviceId($quote['service']),
                'amount' => $quote['amount'],
                'vat_rate' => 0,
                'quote_number' => $quote['quote'],
                'quote_sent_at' => '2026-09-28',
                'quote_valid_until' => '2026-10-28',
                'quote_accepted_at' => '2026-10-05',
                'contract_signed_at' => '2026-10-08',
                'created_at' => '2026-09-28 10:00:00',
                'updated_at' => now(),
            ]);

            DB::table('payments')->insert([
                [
                    'wedding_service_id' => $weddingServiceId,
                    'type' => 'deposit',
                    'amount' => $quote['amount'] * 0.3,
                    'due_date' => '2026-10-08',
                    'invoice_number' => $quote['invoice'],
                    'invoiced_at' => '2026-10-08',
                    'paid_at' => '2026-10-12',
                    'created_at' => '2026-10-08 10:00:00',
                    'updated_at' => now(),
                ],
                [
                    'wedding_service_id' => $weddingServiceId,
                    'type' => 'balance',
                    'amount' => $quote['amount'] * 0.7,
                    'due_date' => '2027-06-10',
                    'invoice_number' => null,
                    'invoiced_at' => null,
                    'paid_at' => null,
                    'created_at' => '2026-10-08 10:00:00',
                    'updated_at' => now(),
                ],
            ]);
        }
    }

    /**
     * The service of Jessica's catalogue with this name, added when missing.
     */
    private function serviceId(string $name): int
    {
        return DB::table('services')->where('name', $name)->value('id')
            ?? DB::table('services')->insertGetId([
                'name' => $name,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
    }

    /**
     * Two meetings already held, then the milestones up to the wedding.
     */
    private function createAppointments(int $weddingId): void
    {
        $appointments = [
            ['discovery', 'Rendez-vous découverte', '2026-09-20 10:00:00', 'video', null],
            ['technical_visit', 'Visite technique du lieu', '2026-10-24 14:00:00', 'in_person', 'Domaine de Sulauze'],
            ['other', 'Choix de la papeterie', '2026-12-05 11:00:00', 'video', null],
            ['milestone', 'Point design M-6', '2027-01-09 10:00:00', 'video', null],
            ['milestone', 'Point design M-3', '2027-04-10 10:00:00', 'video', null],
            ['milestone', 'Point final M-1', '2027-06-12 14:00:00', 'in_person', 'Domaine de Sulauze'],
        ];

        DB::table('appointments')->insert(array_map(fn (array $appointment): array => [
            'wedding_id' => $weddingId,
            'type' => $appointment[0],
            'title' => $appointment[1],
            'starts_at' => $appointment[2],
            'mode' => $appointment[3],
            'location' => $appointment[4],
            'created_at' => '2026-10-08 10:00:00',
            'updated_at' => now(),
        ], $appointments));
    }

    /**
     * The brief the couple wrote in the Design tab.
     */
    private function createBrief(int $weddingId): void
    {
        DB::table('design_briefs')->insert([
            'wedding_id' => $weddingId,
            'title' => 'Une bohème provençale sous les oliviers',
            'description' => "Une fête simple et chaleureuse, comme un grand repas de famille à la campagne.\nDes matières naturelles, du lin, du bois et beaucoup de bougies à la tombée de la nuit.",
            'palette' => json_encode(['Lin', 'Vert olive', 'Terracotta', 'Ivoire']),
            'avoid' => 'Le rose poudré, les ballons et les décors trop chargés.',
            'created_at' => '2026-10-09 20:15:00',
            'updated_at' => '2026-10-09 20:15:00',
        ]);
    }

    /**
     * The terms of sale and the contract (approved), an amendment to approve,
     * and the first design book, sent as a proposal waiting for the couple's
     * answer.
     */
    private function createDocumentsAndDesignBook(int $weddingId, ?int $jessicaId): void
    {
        $documents = [
            'terms' => [
                'title' => 'Conditions générales de vente 2026',
                'message' => 'Les conditions qui encadrent notre collaboration.',
                'file' => 'conditions-generales-2026.pdf',
                'requires_approval' => true,
                'viewed_at' => '2026-10-08 18:20:00',
                'approved_at' => '2026-10-08 18:25:00',
                'created_at' => '2026-10-08 10:05:00',
                'lines' => [
                    'Acompte de 30 % à la signature du devis, non remboursable.',
                    'Solde à régler au plus tard un mois avant le mariage.',
                    'Paiement par virement bancaire uniquement.',
                    'Wedding design : points d\'étape à M-6, M-3 et M-1, trois révisions du carnet au maximum.',
                    'Tout changement de date vaut annulation.',
                    'Droit de rétractation de 14 jours.',
                ],
            ],
            'contract' => [
                'title' => 'Contrat de prestation',
                'message' => 'Votre contrat, à lire et à approuver.',
                'file' => 'contrat-de-prestation.pdf',
                'requires_approval' => true,
                'viewed_at' => '2026-10-08 18:22:00',
                'approved_at' => '2026-10-08 18:27:00',
                'created_at' => '2026-10-08 10:00:00',
                'lines' => [
                    'Entre La Dernière Touche (Jessica Salles) et Séverine Morel et Bruno Lambert.',
                    'Mariage le samedi 10 juillet 2027 au Domaine de Sulauze (Miramas), 95 invités.',
                    'Wedding design, devis D-2026-118 : 4 200 €.',
                    'Coordination du jour J, devis D-2026-119 : 2 600 €.',
                    'Acompte de 30 % à la signature, solde dû le 10 juin 2027.',
                ],
            ],
            'amendment' => [
                'category' => 'contract',
                'title' => 'Avenant n° 1 — Papeterie',
                'message' => 'L\'ajout de la papeterie à votre devis, à lire et à approuver.',
                'file' => 'avenant-1-papeterie.pdf',
                'requires_approval' => true,
                'viewed_at' => null,
                'approved_at' => null,
                'created_at' => '2026-11-10 09:00:00',
                'lines' => [
                    'Avenant au devis D-2026-118 (wedding design), signé le 8 octobre 2026.',
                    'Ajout : faire-part, menus et marque-places sur papier recyclé, calligraphie vert olive.',
                    'Montant de l\'avenant : 350 €, réglé avec le solde.',
                    'Les autres conditions du devis restent inchangées.',
                ],
            ],
            'design' => [
                'title' => 'Carnet de design — version 1',
                'message' => 'Une première lecture de votre univers.',
                'file' => 'carnet-de-design-v1.pdf',
                'requires_approval' => false,
                'viewed_at' => null,
                'approved_at' => null,
                'created_at' => '2026-11-14 16:00:00',
                'lines' => [
                    'Concept : une bohème provençale sous les oliviers.',
                    'Palette : lin, vert olive, terracotta et ivoire.',
                    'Cérémonie : arche de branches d\'olivier, bancs en bois et tapis anciens.',
                    'Dîner : tables longues en lin naturel, vaisselle en grès, photophores.',
                    'Papeterie : papier recyclé, calligraphie vert olive.',
                ],
            ],
        ];

        foreach ($documents as $key => $document) {
            $category = $document['category'] ?? $key;
            $path = self::FILES_DIRECTORY.'/'.$document['file'];
            $content = $this->pdf($document['title'], $document['lines']);
            Storage::put($path, $content);

            $documentId = DB::table('documents')->insertGetId([
                'wedding_id' => $weddingId,
                'uploaded_by' => $jessicaId,
                'category' => $category,
                'title' => $document['title'],
                'message' => $document['message'],
                'file_path' => $path,
                'mime_type' => 'application/pdf',
                'size_bytes' => strlen($content),
                'requires_approval' => $document['requires_approval'],
                'viewed_at' => $document['viewed_at'],
                'approved_at' => $document['approved_at'],
                'created_at' => $document['created_at'],
                'updated_at' => $document['created_at'],
            ]);

            if ($category === 'design') {
                DB::table('proposals')->insert([
                    'wedding_id' => $weddingId,
                    'document_id' => $documentId,
                    'type' => 'design_book',
                    'title' => 'Bohème provençale',
                    'version' => 1,
                    'description' => "Une première lecture de votre univers : lin naturel, oliviers et lumière dorée de fin de journée.\nDites-moi ce qui vous plaît et ce que vous aimeriez faire évoluer.",
                    'approved_at' => null,
                    'created_at' => $document['created_at'],
                    'updated_at' => $document['created_at'],
                ]);
            }
        }
    }

    /**
     * A short conversation with Jessica, whose last message is not read yet.
     */
    private function createMessages(int $weddingId, ?int $jessicaId, int $coupleUserId): void
    {
        $messages = [
            [$jessicaId, 'Bonjour Séverine et Bruno, bienvenue dans votre espace ! Vous y trouverez votre contrat, les conditions générales et bientôt votre carnet de design.', '2026-10-08 10:10:00', '2026-10-08 18:30:00'],
            [$coupleUserId, 'Merci Jessica ! Nous avons rempli notre brief dans l\'onglet Design, nous avons hâte de voir vos idées.', '2026-10-09 20:20:00', '2026-10-10 08:45:00'],
            [$jessicaId, 'Votre premier carnet de design est prêt, vous le trouverez dans l\'onglet Design. Dites-moi ce que vous en pensez !', '2026-11-14 16:05:00', null],
        ];

        DB::table('messages')->insert(array_map(fn (array $message): array => [
            'wedding_id' => $weddingId,
            'sender_id' => $message[0],
            'body' => $message[1],
            'read_at' => $message[3],
            'created_at' => $message[2],
            'updated_at' => $message[2],
        ], $messages));
    }

    /**
     * A one-page PDF with a title and a few lines, marked as a demo document.
     *
     * @param  list<string>  $lines
     */
    private function pdf(string $title, array $lines): string
    {
        $text = fn (string $value): string => str_replace(
            ['\\', '(', ')'],
            ['\\\\', '\\(', '\\)'],
            mb_convert_encoding($value, 'Windows-1252', 'UTF-8'),
        );

        $stream = "BT\n/F2 10 Tf\n60 790 Td\n(".$text('La Dernière Touche · Wedding design & coordination').") Tj\n";
        $stream .= "/F1 22 Tf\n0 -50 Td\n(".$text($title).") Tj\n/F2 11 Tf\n16 TL\n0 -14 Td\n";

        foreach ($lines as $line) {
            foreach (explode("\n", wordwrap($line, 95)) as $wrappedLine) {
                $stream .= 'T* ('.$text($wrappedLine).") Tj\n";
            }
        }

        $stream .= 'T* T* ('.$text('Document fictif, créé pour la démonstration du CRM.').") Tj\nET";

        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
            '<< /Length '.strlen($stream)." >>\nstream\n".$stream."\nendstream",
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [];

        foreach ($objects as $index => $object) {
            $offsets[] = strlen($pdf);
            $pdf .= ($index + 1)." 0 obj\n".$object."\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $pdf .= 'xref'."\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";

        foreach ($offsets as $offset) {
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }

        return $pdf.'trailer'."\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n".$xrefOffset."\n%%EOF\n";
    }

    /**
     * Reverse the migrations: the couple is kept, the demo may have changed
     * its data since.
     */
    public function down(): void
    {
        //
    }
};
