# Architecture : Frontend ↔ Backend ↔ Base de données

BizOS utilise une architecture hybride moderne, combinant des requêtes HTTP (REST) pour la logique métier lourde et des WebSockets (Firestore) pour le temps réel.

## 1. Flux des Données (Data Flow)

### A. Flux Temps Réel (Frontend ↔ Firebase)
Pour tout ce qui nécessite un affichage instantané et collaboratif (tableaux de bord, chat, statuts d'équipements, réclamations).
- **Le Frontend (React)** s'abonne directement à Firestore via les SDK Firebase (`onSnapshot`).
- **Avantage :** Pas besoin d'interroger le serveur Node.js en boucle. L'UI se met à jour en temps réel dès qu'un autre technicien modifie une donnée.
- **Sécurité :** Firestore Security Rules (`firestore.rules`) garantissent que seul l'utilisateur autorisé peut lire/écrire.

### B. Flux Métier (Frontend ↔ Express Backend)
Pour les opérations lourdes, sécurisées ou les intégrations tierces (AI, Validation de licences, Exports PDF, Mails, IoT).
- **Le Frontend (React)** appelle l'API Node.js (`server.ts`) via le fichier centralisé `src/lib/apiClient.ts`.
- **Le Backend (Express)** traite la requête, peut interagir avec la base de données via `firebase-admin`, ou interroger l'API Google Gemini, puis renvoie la réponse au Frontend.

## 2. Structure des Routes

| Domaine | Route Backend (Express) | Rôle |
|---------|------------------------|------|
| **Licenses** | `POST /api/v1/licenses/validate` | Valide une clé de licence (WP Plugin, Desktop) |
| **Licenses** | `POST /api/v1/licenses/issue` | Génère une nouvelle clé de licence |
| **CAFM/GMAO** | `GET /api/v1/cafm/assets/sync` | Synchronise les actifs avec un système externe (IoT / ERP) |
| **CAFM/GMAO** | `GET /api/v1/cafm/workorders/sync`| Récupère les bons de travail |
| **IA** | `POST /api/v1/ai/diagnostics` | Envoie des données télémétriques à Gemini pour un diagnostic de panne |
| **Export** | `GET /api/v1/reports/pdf` | Génère un rapport d'audit au format PDF (Côté Serveur) |

## 3. Implémentation : `apiClient.ts`

Pour garder le code propre, le Frontend n'utilise jamais de `fetch` directement dans les composants, il passe par `src/lib/apiClient.ts` qui contient toutes les méthodes typées.

```typescript
// Exemple dans un composant React
import { apiClient } from '@/lib/apiClient';

// Appelle la route Backend : POST /api/v1/licenses/validate
const res = await apiClient.licenses.validate(key, domain);
```

