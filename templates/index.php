<?php
// Redirige toute tentative d'accès direct à un fichier du dossier
header('HTTP/1.0 403 Forbidden');
echo 'Accès interdit.';
exit;