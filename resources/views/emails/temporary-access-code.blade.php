<!doctype html>
<html lang="fr">
<body style="margin:0;background:#f8f6f2;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;color:#111111;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;padding:32px;">
        <p style="margin:0 0 24px;font-size:12px;letter-spacing:2px;text-transform:uppercase;">La Dernière Touche</p>

        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Bonjour {{ $names }},</p>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">Jessica a ouvert votre espace client. Voici de quoi vous connecter :</p>

        <p style="margin:0 0 8px;font-size:14px;">Identifiant : <strong>{{ $login }}</strong></p>
        <p style="margin:0 0 24px;font-size:14px;">Code provisoire : <strong style="font-family:'Courier New',monospace;font-size:16px;">{{ $temporaryCode }}</strong></p>

        <p style="margin:0 0 24px;">
            <a href="{{ $loginUrl }}" style="display:inline-block;background:#111111;color:#ffffff;padding:12px 24px;font-size:13px;text-decoration:none;">Accéder à mon espace</a>
        </p>

        <p style="margin:0 0 8px;font-size:14px;line-height:1.6;">À votre première connexion, vous choisirez votre propre mot de passe : ce code ne servira plus ensuite.</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#666666;">Vous n’êtes pas à l’origine de cette demande ? Ignorez simplement ce message.</p>
    </div>
</body>
</html>
