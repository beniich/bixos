# BizOS GMAO — Application Native Android (Kotlin & Jetpack Compose)

Cette documentation décrit la configuration et l'architecture de l'application mobile native Android synchronisée en temps réel avec Firebase Firestore et le dashboard Web BizOS.

---

## 🚀 Architecture de l'Application Android

- **Langage** : Kotlin 1.9
- **UI Framework** : Jetpack Compose + Material3
- **Base de données & Temps Réel** : Firebase Firestore SDK Native Android (`com.google.firebase:firebase-firestore-ktx`)
- **Authentification** : Firebase Auth Native Google Sign-In (`com.google.firebase:firebase-auth-ktx`)
- **Asynchronisme** : Kotlin Coroutines & `StateFlow` pour la réactivité sans latence.

---

## 🛠️ Configuration & Installation (Étape par Étape)

### 1. Intégration de `google-services.json`
Téléchargez votre fichier `google-services.json` depuis la console Firebase (Projet: `tribal-domain-j9v0l` / database `ai-studio-sovereigndevicen-18bec7a3-9311-456d-986d-a6c8f02a8c94`) et déposez-le dans le répertoire :
```
/android/app/google-services.json
```

### 2. Compilation dans Android Studio
1. Ouvrez Android Studio et choisissez **Open an existing project**.
2. Sélectionnez le dossier `/android`.
3. Attendez la synchronisation Gradle (`Gradle Sync`).
4. Lancez l'application sur un émulateur Android (API 24+) ou sur un appareil physique Android connecté via USB (Débogage USB activé).

---

## ⚡ Synchronisation Bidirectionnelle Web ↔ Mobile

Tout changement effectué sur le dashboard Web (déclaration de panne, changement de statut de site, saisie d'intervention par un collaborateur) est instantanément répercuté sur l'application Android via les `SnapshotListeners` Firestore.
