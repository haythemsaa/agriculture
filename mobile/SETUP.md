# AgriTech Tunisia Mobile App - Setup Guide

Guide complet pour installer, configurer et déployer l'application mobile AgriTech Tunisia.

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Développement](#développement)
5. [Build & Déploiement](#build--déploiement)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Prérequis

### Outils requis

- **Node.js**: v18.0.0 ou supérieur
- **npm** ou **yarn**: Dernière version stable
- **React Native CLI**: `npm install -g react-native-cli`
- **Git**: Pour le contrôle de version

### Pour iOS (macOS uniquement)

- **Xcode**: v14.0 ou supérieur
- **CocoaPods**: `sudo gem install cocoapods`
- **iOS Simulator**: Inclus avec Xcode
- **Compte Apple Developer**: Pour le déploiement

### Pour Android

- **Android Studio**: Dernière version stable
- **JDK**: v11 ou supérieur
- **Android SDK**: API Level 23 (Android 6.0) ou supérieur
- **Android Emulator**: Configuré via Android Studio

---

## 📦 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/haythemsaa/agriculture.git
cd agriculture/mobile
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
```

### 3. Configuration iOS (macOS uniquement)

```bash
cd ios
pod install
cd ..
```

---

## ⚙️ Configuration

### 1. Variables d'environnement

Copier le fichier `.env.example` vers `.env`:

```bash
cp .env.example .env
```

Éditer `.env` avec vos propres valeurs:

```env
# API Configuration
API_BASE_URL=https://api.agritech.tn/api  # URL de votre API
API_TIMEOUT=15000

# Environment
ENV=production

# App Configuration
APP_NAME=AgriTech Tunisia
APP_VERSION=1.0.0

# Google Maps API (pour le suivi GPS)
GOOGLE_MAPS_API_KEY=votre_clé_google_maps

# Push Notifications (Firebase)
FIREBASE_SERVER_KEY=votre_clé_firebase

# Analytics
GOOGLE_ANALYTICS_ID=votre_id_ga

# Sentry (Error Tracking)
SENTRY_DSN=votre_sentry_dsn
```

### 2. Configuration Firebase (Push Notifications)

#### iOS

1. Créer un projet sur [Firebase Console](https://console.firebase.google.com/)
2. Télécharger `GoogleService-Info.plist`
3. Placer le fichier dans `ios/AgriTechTunisia/`

#### Android

1. Télécharger `google-services.json`
2. Placer le fichier dans `android/app/`

### 3. Configuration Google Maps (Order Tracking)

1. Obtenir une clé API sur [Google Cloud Console](https://console.cloud.google.com/)
2. Activer les APIs nécessaires:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geolocation API
3. Ajouter la clé dans `.env`

#### iOS

Éditer `ios/AgriTechTunisia/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Nous avons besoin de votre localisation pour le suivi de livraison</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>Nous avons besoin de votre localisation pour le suivi de livraison</string>
```

#### Android

Éditer `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="VOTRE_CLÉ_GOOGLE_MAPS"/>
</application>
```

---

## 🚀 Développement

### Démarrer le Metro Bundler

```bash
npm start
# ou
yarn start
```

### Lancer sur iOS

```bash
npm run ios
# ou
yarn ios

# Pour un device spécifique
npx react-native run-ios --device "iPhone de [Nom]"
```

### Lancer sur Android

```bash
npm run android
# ou
yarn android

# Pour un device spécifique
adb devices  # Lister les devices
npx react-native run-android --deviceId=[DEVICE_ID]
```

### Hot Reload

- **iOS**: `Cmd + D` dans le simulateur → Enable Fast Refresh
- **Android**: `Cmd + M` (Mac) ou `Ctrl + M` (Windows/Linux) → Enable Fast Refresh

### Debug

#### React Native Debugger

```bash
# Installer React Native Debugger
brew install --cask react-native-debugger

# Lancer
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

#### Chrome DevTools

1. Ouvrir Dev Menu (Cmd+D sur iOS, Cmd+M sur Android)
2. Sélectionner "Debug"
3. Ouvrir `chrome://inspect`

---

## 📱 Build & Déploiement

### Build iOS (Release)

#### 1. Configuration Xcode

1. Ouvrir `ios/AgriTechTunisia.xcworkspace` dans Xcode
2. Sélectionner le projet → Signing & Capabilities
3. Configurer Team et Bundle Identifier
4. Sélectionner "Generic iOS Device"

#### 2. Build Archive

```bash
cd ios
xcodebuild -workspace AgriTechTunisia.xcworkspace \
  -scheme AgriTechTunisia \
  -configuration Release \
  -archivePath ./build/AgriTechTunisia.xcarchive \
  archive
```

#### 3. Export IPA

1. Ouvrir Xcode → Window → Organizer
2. Sélectionner l'archive
3. Click "Distribute App"
4. Sélectionner "App Store Connect"
5. Suivre les étapes

#### 4. Upload vers App Store Connect

```bash
xcrun altool --upload-app \
  -f ./build/AgriTechTunisia.ipa \
  -u votre@email.com \
  -p "mot-de-passe-app-specific"
```

### Build Android (Release)

#### 1. Générer une clé de signature

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 \
  -keystore agritech-release-key.keystore \
  -alias agritech-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000
```

#### 2. Configuration Gradle

Éditer `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=agritech-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=agritech-key-alias
MYAPP_RELEASE_STORE_PASSWORD=votre_password
MYAPP_RELEASE_KEY_PASSWORD=votre_password
```

Éditer `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

#### 3. Build APK/AAB

```bash
cd android

# Pour APK
./gradlew assembleRelease

# Pour AAB (recommandé pour Play Store)
./gradlew bundleRelease
```

Fichiers générés:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

#### 4. Upload vers Google Play Console

1. Aller sur [Google Play Console](https://play.google.com/console)
2. Créer une nouvelle application
3. Remplir les informations requises
4. Upload l'AAB dans "Production" → "Créer une nouvelle version"
5. Soumettre pour révision

### Over-The-Air Updates (CodePush)

```bash
# Installer CodePush CLI
npm install -g code-push-cli

# Login
code-push login

# Enregistrer l'app
code-push app add AgriTechTunisia-iOS ios react-native
code-push app add AgriTechTunisia-Android android react-native

# Déployer une mise à jour
code-push release-react AgriTechTunisia-iOS ios
code-push release-react AgriTechTunisia-Android android
```

---

## 🧪 Tests

### Tests unitaires

```bash
npm test
# ou
yarn test
```

### Tests E2E (Detox)

```bash
# iOS
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug

# Android
detox build --configuration android.emu.debug
detox test --configuration android.emu.debug
```

---

## 🔍 Troubleshooting

### Problèmes courants

#### "No bundle URL present"

```bash
rm -rf node_modules
npm install
cd ios && pod install && cd ..
npm start -- --reset-cache
```

#### "Unable to resolve module"

```bash
watchman watch-del-all
rm -rf $TMPDIR/react-*
npm start -- --reset-cache
```

#### Build iOS échoue

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

#### Build Android échoue

```bash
cd android
./gradlew clean
cd ..
```

#### Metro Bundler ne démarre pas

```bash
npx react-native start --reset-cache
```

---

## 📊 Performance Optimization

### 1. Réduire la taille du bundle

```bash
# Analyser le bundle
npx react-native-bundle-visualizer

# Activer Hermes (déjà activé par défaut)
# Vérifier android/app/build.gradle
enableHermes: true
```

### 2. Optimiser les images

- Utiliser WebP pour Android
- Optimiser les PNG/JPG
- Lazy loading pour les images

### 3. Code Splitting

```javascript
// Lazy load des screens
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
```

---

## 🔐 Sécurité

### 1. Obfuscation du code (Android)

Éditer `android/app/proguard-rules.pro`:

```
-keep class com.agritech.tunisia.** { *; }
-dontwarn com.agritech.tunisia.**
```

### 2. SSL Pinning

Configurer dans `api.ts`:

```typescript
const sslPinning = {
  certs: ['agritech-cert'],
};
```

### 3. Secure Storage

Utiliser `react-native-keychain` pour les données sensibles:

```bash
npm install react-native-keychain
```

---

## 📚 Resources

### Documentation

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript](https://www.typescriptlang.org/)

### Support

- **Email**: support@agritech.tn
- **Slack**: [AgriTech Tunisia Workspace]
- **GitHub Issues**: [Issues](https://github.com/haythemsaa/agriculture/issues)

---

## 📝 Checklist avant déploiement

### Pré-production

- [ ] Toutes les variables d'environnement sont configurées
- [ ] Firebase configuré (iOS + Android)
- [ ] Google Maps configuré
- [ ] Tests unitaires passent
- [ ] Tests E2E passent
- [ ] Performance testée (60 FPS)
- [ ] Pas de console.log en production
- [ ] Analytics configurés
- [ ] Sentry configuré pour error tracking

### App Store (iOS)

- [ ] Screenshots préparés (tous les devices)
- [ ] Description de l'app rédigée
- [ ] Mots-clés optimisés
- [ ] Privacy Policy URL fournie
- [ ] Support URL fournie
- [ ] Bundle ID correct
- [ ] Version et build number incrémentés

### Google Play (Android)

- [ ] Screenshots préparés (téléphone + tablette)
- [ ] Icône 512x512 préparée
- [ ] Feature Graphic préparée
- [ ] Description courte et longue rédigées
- [ ] Catégorie sélectionnée
- [ ] Content rating complété
- [ ] Privacy Policy URL fournie

---

## 🎉 Lancement

### Soft Launch

1. Déployer en **beta** (TestFlight iOS, Internal Testing Android)
2. Inviter 100-500 beta testeurs
3. Collecter feedback pendant 2 semaines
4. Corriger les bugs critiques

### Production Launch

1. Soumettre pour révision (iOS: 1-3 jours, Android: quelques heures)
2. Une fois approuvé, déployer graduellement:
   - Jour 1: 10% des utilisateurs
   - Jour 3: 50% des utilisateurs
   - Jour 7: 100% des utilisateurs
3. Monitorer les crashs et bugs
4. Préparer hotfix si nécessaire

---

**Version**: 1.0.0
**Dernière mise à jour**: November 2025
**Maintenu par**: AgriTech Tunisia Team
