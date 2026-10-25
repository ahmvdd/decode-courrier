# Confidentialité et RGPD

Un courrier administratif contient des données personnelles, parfois sensibles. L'application est conçue pour en envoyer le moins possible.

## Ce qui est en place

| Mesure | Détail |
| --- | --- |
| **Masquage avant envoi** | L'utilisateur dessine des rectangles noirs sur son nom, son adresse et ses références. Les masques sont appliqués dans le navigateur : seule l'image masquée est transmise. |
| **Consentement explicite** | Une case à cocher est obligatoire avant toute analyse, photo ou texte. |
| **Aucun stockage serveur** | Pas de base de données. Le résultat reste dans le `sessionStorage` du navigateur. |
| **Partage sans identité** | Le message « Envoyer à un proche » ne contient ni nom ni adresse. |
| **Clé protégée** | La clé API n'est utilisée que côté serveur et n'est jamais versionnée (`.env*` dans `.gitignore`). |

## Ce qui part chez OpenAI

Le contenu du courrier (image masquée ou texte) est envoyé à l'API OpenAI pour analyse. Par défaut, OpenAI n'utilise pas les données envoyées via l'API pour entraîner ses modèles.

## Prochaines étapes pour une mise en production

- Hébergement des données en Europe et option de conservation zéro côté fournisseur.
- Détection automatique (OCR local) des noms, adresses et numéros de dossier pour les masquer sans action de l'utilisateur.
- Possibilité d'utiliser un modèle européen.
- Mentions d'information complètes et registre de traitement.
