import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface Category {
  id: number;
  name: string;
  icon: string;
  count: number;
  description: string;
}

const CategoriesScreen = ({ navigation }: any) => {
  const categories: Category[] = [
    {
      id: 1,
      name: 'Fruits',
      icon: '🍎',
      count: 145,
      description: 'Fruits frais et de saison',
    },
    {
      id: 2,
      name: 'Légumes',
      icon: '🥕',
      count: 232,
      description: 'Légumes variés et biologiques',
    },
    {
      id: 3,
      name: 'Céréales',
      icon: '🌾',
      count: 89,
      description: 'Blé, orge, maïs et plus',
    },
    {
      id: 4,
      name: 'Produits Bio',
      icon: '🌱',
      count: 167,
      description: 'Certifiés agriculture biologique',
    },
    {
      id: 5,
      name: 'Équipements',
      icon: '🚜',
      count: 78,
      description: 'Matériel et équipements agricoles',
    },
    {
      id: 6,
      name: 'Engrais',
      icon: '💧',
      count: 56,
      description: 'Engrais et produits de traitement',
    },
    {
      id: 7,
      name: 'Graines',
      icon: '🌰',
      count: 123,
      description: 'Semences et plants',
    },
    {
      id: 8,
      name: 'Produits Laitiers',
      icon: '🥛',
      count: 92,
      description: 'Lait, fromage, yaourt',
    },
    {
      id: 9,
      name: 'Viandes',
      icon: '🥩',
      count: 67,
      description: 'Viandes fraîches et transformées',
    },
    {
      id: 10,
      name: 'Miel & Apiculture',
      icon: '🍯',
      count: 45,
      description: 'Miel naturel et produits de la ruche',
    },
    {
      id: 11,
      name: 'Huiles',
      icon: '🫒',
      count: 38,
      description: 'Huiles d\'olive et autres huiles',
    },
    {
      id: 12,
      name: 'Herbes Aromatiques',
      icon: '🌿',
      count: 54,
      description: 'Herbes fraîches et séchées',
    },
  ];

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('Home', {
        screen: 'Search',
        params: { category: item.name }
      })}
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDescription}>{item.description}</Text>
        <Text style={styles.categoryCount}>{item.count} produits</Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catégories</Text>
        <Text style={styles.headerSubtitle}>Explorez nos produits par catégorie</Text>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  list: {
    padding: 12,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    margin: 4,
    minHeight: 140,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#f3f4f6',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 32,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  categoryCount: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  arrow: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 20,
    color: '#9ca3af',
  },
});

export default CategoriesScreen;
