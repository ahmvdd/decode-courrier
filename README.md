# Décode ton courrier

Décode ton courrier aide les étudiants étrangers et les nouveaux arrivants en France à comprendre les courriers officiels. L’application explique le courrier dans la langue choisie (français simple, anglais, arabe, espagnol, portugais, chinois, turc ou russe), précise les options et les échéances, propose une réponse administrative en français et en fournit une traduction de compréhension.

## Lancer le projet

1. Installez Node.js 20 ou plus récent.
2. Installez les dépendances : `npm install`
3. Copiez `.env.example` vers `.env.local`, puis renseignez `OPENAI_API_KEY`.
4. Démarrez l’application : `npm run dev`
5. Ouvrez [http://localhost:3000](http://localhost:3000).

`OPENAI_MODEL` est facultatif et vaut `gpt-4o` par défaut. La clé API reste côté serveur. Les images sont traitées en mémoire pour l’appel d’analyse et ne sont pas enregistrées par l’application.

## Stack

- Next.js App Router et TypeScript
- Tailwind CSS 4
- API OpenAI avec sortie JSON structurée et synthèse vocale
- Rappels de date limite au format iCalendar (.ics) et lien Google Agenda
- Compatible avec un déploiement Vercel : ajoutez `OPENAI_API_KEY` (et éventuellement `OPENAI_MODEL`) aux variables d’environnement du projet.

## Confidentialité et masquage

Avant l’analyse d’une photo, l’utilisateur peut masquer des informations avec des rectangles noirs. L’image composée dans le navigateur, masques inclus, est la seule image envoyée à l’API. Une case de consentement est obligatoire avant toute analyse, y compris pour du texte collé.

## Captures

Ajoutez ici des captures de l’accueil mobile et de la page de résultat après avoir lancé l’application.
