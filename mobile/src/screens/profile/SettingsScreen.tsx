import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState({
    orders: true,
    promotions: true,
    newsletter: false,
    liveShopping: true,
    chat: true,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showActivity: false,
    allowMessages: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notifSettings = await AsyncStorage.getItem('notification_settings');
      const privacySettings = await AsyncStorage.getItem('privacy_settings');

      if (notifSettings) {
        setNotifications(JSON.parse(notifSettings));
      }
      if (privacySettings) {
        setPrivacy(JSON.parse(privacySettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveNotificationSettings = async (newSettings: typeof notifications) => {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(newSettings));
      setNotifications(newSettings);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
    }
  };

  const savePrivacySettings = async (newSettings: typeof privacy) => {
    try {
      await AsyncStorage.setItem('privacy_settings', JSON.stringify(newSettings));
      setPrivacy(newSettings);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Vider le cache',
      'Cette action supprimera toutes les données temporaires. Continuer?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            // In real app, clear cached images, etc.
            Alert.alert('Succès', 'Cache vidé');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmer',
              'Êtes-vous absolument sûr?',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Oui, supprimer',
                  style: 'destructive',
                  onPress: async () => {
                    // Call API to delete account
                    Alert.alert('Compte supprimé', 'Votre compte a été supprimé');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Commandes</Text>
            <Text style={styles.settingDescription}>
              Mises à jour sur vos commandes et livraisons
            </Text>
          </View>
          <Switch
            value={notifications.orders}
            onValueChange={(value) =>
              saveNotificationSettings({ ...notifications, orders: value })
            }
            trackColor={{ false: '#e5e7eb', true: '#86efac' }}
            thumbColor={notifications.orders ? '#10b981' : '#f3f4f6'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Promotions</Text>
            <Text style={styles.settingDescription}>
              Offres spéciales et codes promo
            </Text>
          </View>
          <Switch
            value={notifications.promotions}
            onValueChange={(value) =>
              saveNotificationSettings({ ...notifications, promotions: value })
            }
            trackColor={{ false: '#e5e7eb', true: '#86efac' }}
            thumbColor={notifications.promotions ? '#10b981' : '#f3f4f6'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Newsletter</Text>
            <Text style={styles.settingDescription}>
              Conseils agricoles et actualités
            </Text>
          </View>
          <Switch
            value={notifications.newsletter}
            onValueChange={(value) =>
              saveNotificationSettings({ ...notifications, newsletter: value })
            }
            trackColor={{ false: '#e5e7eb', true: '#86efac' }}
            thumbColor={notifications.newsletter ? '#10b981' : '#f3f4f6'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Live Shopping</Text>
            <Text style={styles.settingDescription}>
              Nouvelles sessions et enchères
            </Text>
          </View>
          <Switch
            value={notifications.liveShopping}
            onValueChange={(value) =>
              saveNotificationSettings({ ...notifications, liveShopping: value })
            }
            trackColor={{ false: '#e5e7eb', true: '#86efac' }}
            thumbColor={notifications.liveShopping ? '#10b981' : '#f3f4f6'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Messages</Text>
            <Text style={styles.settingDescription}>
              Nouveaux messages du chat
            </Text>
          </View>
          <Switch
            value={notifications.chat}
            onValueChange={(value) =>
              saveNotificationSettings({ ...notifications, chat: value })
            }
            trackColor={{ false: '#e5e7eb', true: '#86efac' }}
            thumbColor={notifications.chat ? '#10b981' : '#f3f4f6'}
          />
        </View>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Confidentialité</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Profil public</Text>
            <Text style={styles.settingDescription}>
              Permettre aux autres de voir votre profil
            </Text>
          </View>
          <Switch
            value={privacy.showProfile}
            onValueChange={(value) =>
              savePrivacySettings({ ...privacy, showProfile: value })
            }
            trackColor={{ false: '#e5e7eb', true: '#86efac' }}
            thumbColor={privacy.showProfile ? '#10b981' : '#f3f4f6'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Activité publique</Text>
            <Text style={styles.settingDescription}>
              Afficher vos avis et commentaires
            </Text>
          </View>
          <Switch
            value={privacy.showActivity}
            onValueChange={(value) =>
              savePrivacySettings({ ...privacy, showActivity: value })
            }
            trackColor={{ false: '#e5e7eb', true: '#86efac' }}
            thumbColor={privacy.showActivity ? '#10b981' : '#f3f4f6'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Messages privés</Text>
            <Text style={styles.settingDescription}>
              Autoriser les vendeurs à vous contacter
            </Text>
          </View>
          <Switch
            value={privacy.allowMessages}
            onValueChange={(value) =>
              savePrivacySettings({ ...privacy, allowMessages: value })
            }
            trackColor={{ false: '#e5e7eb', true: '#86efac' }}
            thumbColor={privacy.allowMessages ? '#10b981' : '#f3f4f6'}
          />
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuLabel}>Langue</Text>
          <View style={styles.menuRight}>
            <Text style={styles.menuValue}>Français</Text>
            <Text style={styles.menuArrow}>→</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuLabel}>Devise</Text>
          <View style={styles.menuRight}>
            <Text style={styles.menuValue}>TND</Text>
            <Text style={styles.menuArrow}>→</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleClearCache}>
          <Text style={styles.menuLabel}>Vider le cache</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Légal</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuLabel}>Conditions d'utilisation</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuLabel}>Politique de confidentialité</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuLabel}>Licences open source</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À propos</Text>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Build</Text>
          <Text style={styles.infoValue}>2025.11.19</Text>
        </View>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuLabel}>Contact et support</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerSection}>
        <Text style={styles.dangerTitle}>Zone de danger</Text>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.dangerButtonText}>Supprimer mon compte</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          AgriTech Tunisia © 2025{'\n'}
          Marketplace agricole #1 en Tunisie
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuLabel: {
    fontSize: 15,
    color: '#111827',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    fontSize: 15,
    color: '#6b7280',
    marginRight: 8,
  },
  menuArrow: {
    fontSize: 16,
    color: '#9ca3af',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  dangerSection: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    padding: 16,
  },
  dangerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#fef2f2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  dangerButtonText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SettingsScreen;
