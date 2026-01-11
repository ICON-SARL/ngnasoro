# Guide de Publication - N'GNA SÔRÔ!

Ce guide détaille les étapes pour publier l'application sur Google Play Store et Apple App Store.

## Prérequis

### Outils Nécessaires
- **Node.js** v18+ et npm
- **Git** pour cloner le projet
- **Android Studio** (pour Android)
- **Xcode** v15+ (pour iOS, Mac uniquement)
- **Compte Google Play Developer** ($25 une fois)
- **Compte Apple Developer** ($99/an)

### Préparation du Projet

1. **Exporter vers GitHub**
   - Cliquez sur "Export to GitHub" dans Lovable
   - Clonez le repository localement

2. **Installation des Dépendances**
   ```bash
   git clone [votre-repo-url]
   cd [nom-du-projet]
   npm install
   ```

3. **Ajouter les Plateformes Natives**
   ```bash
   npx cap add android
   npx cap add ios
   ```

4. **Build de Production**
   ```bash
   npm run build
   npx cap sync
   ```

---

## Publication Android (Google Play Store)

### Étape 1: Générer le Keystore

```bash
# Créer un keystore de production (à faire une seule fois)
keytool -genkey -v -keystore ngnasoro-release.keystore -alias ngnasoro -keyalg RSA -keysize 2048 -validity 10000

# Stocker le keystore dans un endroit sûr!
```

### Étape 2: Configurer la Signature

Créer le fichier `android/keystore.properties`:
```properties
storePassword=VOTRE_MOT_DE_PASSE_KEYSTORE
keyPassword=VOTRE_MOT_DE_PASSE_CLE
keyAlias=ngnasoro
storeFile=../ngnasoro-release.keystore
```

Modifier `android/app/build.gradle`:
```gradle
android {
    // ... autres configs
    
    signingConfigs {
        release {
            def keystorePropertiesFile = rootProject.file("keystore.properties")
            def keystoreProperties = new Properties()
            keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
            
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Étape 3: Build AAB (Android App Bundle)

```bash
# Ouvrir Android Studio
npx cap open android

# Dans Android Studio:
# Build > Generate Signed Bundle/APK > Android App Bundle
# Sélectionner le keystore créé
# Build la variante "release"
```

Le fichier AAB sera généré dans:
`android/app/build/outputs/bundle/release/app-release.aab`

### Étape 4: Google Play Console

1. Aller sur [play.google.com/console](https://play.google.com/console)
2. Créer une nouvelle application
3. Remplir les informations:
   - **Nom**: N'GNA SÔRÔ! - Microfinance Digitale
   - **Description courte**: Services financiers inclusifs pour tous
   - **Description longue**: (voir ci-dessous)
   - **Catégorie**: Finance
   - **Pays**: Mali, Côte d'Ivoire, Sénégal, Burkina Faso

4. Ajouter les captures d'écran:
   - Au moins 2 captures pour téléphone
   - Icône haute résolution (512x512)
   - Bannière (1024x500)

5. Configurer la distribution:
   - Test interne → Alpha → Beta → Production
   - Commencer par les tests internes

### Description Play Store

```
N'GNA SÔRÔ! - Services Financiers Inclusifs

🌟 ACCÉDEZ À VOS FINANCES EN TOUTE SIMPLICITÉ

N'GNA SÔRÔ! est votre partenaire financier digital au Mali. Notre application vous permet de gérer votre épargne, demander des prêts et effectuer des transactions en toute sécurité.

✅ FONCTIONNALITÉS PRINCIPALES:
• Consultation de solde en temps réel
• Demande de prêt simplifiée
• Épargne individuelle et collaborative
• Transferts sécurisés
• Historique complet des transactions

💰 PRÊTS ACCESSIBLES:
• Taux compétitifs
• Approbation rapide
• Remboursement flexible

🔒 SÉCURITÉ GARANTIE:
• Données chiffrées
• Authentification sécurisée
• Protection de vos informations

📱 SIMPLE À UTILISER:
• Interface intuitive
• Support en français et bambara
• Assistance 24/7

Rejoignez les milliers d'utilisateurs qui font confiance à N'GNA SÔRÔ! pour leurs besoins financiers quotidiens.

Téléchargez maintenant et commencez à épargner!
```

---

## Publication iOS (App Store)

### Étape 1: Configuration Xcode

```bash
# Ouvrir Xcode
npx cap open ios
```

Dans Xcode:
1. Sélectionner le projet "App" dans le navigateur
2. Onglet "Signing & Capabilities"
3. Activer "Automatically manage signing"
4. Sélectionner votre Team Apple Developer

### Étape 2: Configurer les Capabilities

Ajouter dans Xcode (si nécessaire):
- Push Notifications
- Associated Domains (pour les liens universels)

### Étape 3: Icônes et Launch Screen

Les icônes sont dans:
`ios/App/App/Assets.xcassets/AppIcon.appiconset/`

Tailles requises:
- 20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt (2x et 3x)
- 1024pt pour App Store

### Étape 4: Archive et Upload

Dans Xcode:
1. Product > Archive
2. Window > Organizer
3. Distribute App > App Store Connect
4. Upload

### Étape 5: App Store Connect

1. Aller sur [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Créer une nouvelle app
3. Remplir les métadonnées
4. Ajouter les captures d'écran:
   - iPhone 6.7" (1290×2796)
   - iPhone 6.5" (1242×2688)
   - iPhone 5.5" (1242×2208)
   - iPad Pro 12.9" (2048×2732)

5. Soumettre pour review

---

## Checklist Pré-Publication

### Android
- [ ] Keystore créé et sauvegardé
- [ ] Version code/name incrémentés
- [ ] ProGuard configuré
- [ ] Tests sur plusieurs appareils
- [ ] AAB signé généré
- [ ] Captures d'écran prêtes
- [ ] Description traduite
- [ ] Politique de confidentialité URL

### iOS
- [ ] Certificats Apple configurés
- [ ] Provisioning profiles à jour
- [ ] App Icons toutes tailles
- [ ] Launch Screen configuré
- [ ] Archive créée et uploadée
- [ ] Captures d'écran iPhone/iPad
- [ ] Catégorie d'âge définie

---

## Mise à Jour de l'Application

Pour publier une mise à jour:

```bash
# 1. Faire les modifications dans Lovable
# 2. Exporter et git pull
git pull origin main

# 3. Incrémenter la version dans capacitor.config.ts

# 4. Build et sync
npm run build
npx cap sync

# 5. Générer nouvel AAB/Archive
# 6. Uploader sur Play Console / App Store Connect
```

---

## URLs Importantes

- **Politique de confidentialité**: https://ngnasoro.com/legal/privacy
- **Conditions d'utilisation**: https://ngnasoro.com/legal/cgu
- **Site web**: https://ngnasoro.com
- **Support**: support@ngnasoro.com

---

## Notes de Version

### v1.0.0 (Première Release)
- Consultation de solde
- Demande de prêt
- Épargne individuelle et collaborative
- Transactions sécurisées
- Interface multilingue

---

## Contacts

- **Développeur**: Lovable / MEREF
- **Support Technique**: tech@ngnasoro.com
- **Support Utilisateur**: support@ngnasoro.com
