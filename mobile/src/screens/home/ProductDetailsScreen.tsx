import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { productsAPI, cartAPI } from '../../services/api';
import { useReviews } from '../../hooks/useReviews';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { HomeStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'ProductDetails'>;
  route: RouteProp<HomeStackParamList, 'ProductDetails'>;
};

interface ProductDetails {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  images?: string[];
  category: string;
  vendor_name: string;
  vendor_id: number;
  stock: number;
  unit: string;
  discount?: number;
  original_price?: number;
}

const ProductDetailsScreen = ({ navigation, route }: Props) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const { stats, reviews, fetchReviews } = useReviews(productId);

  useEffect(() => {
    fetchProductDetails();
    fetchReviews();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const response = await productsAPI.getById(productId);
      setProduct(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les détails du produit');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await cartAPI.add(product.id, quantity);
      Alert.alert(
        'Succès',
        `${quantity} ${product.unit} de ${product.name} ajouté(s) au panier`,
        [
          { text: 'Continuer', style: 'cancel' },
          { text: 'Voir le panier', onPress: () => navigation.navigate('Cart' as any) },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.message || 'Impossible d\'ajouter au panier'
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!product) {
    return null;
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const displayPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          {images[selectedImage] ? (
            <Image source={{ uri: images[selectedImage] }} style={styles.mainImage} />
          ) : (
            <View style={[styles.mainImage, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>🌾</Text>
            </View>
          )}
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
          {images.length > 1 && (
            <View style={styles.thumbnailContainer}>
              {images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(index)}
                  style={[
                    styles.thumbnail,
                    selectedImage === index && styles.thumbnailActive,
                  ]}
                >
                  {img ? (
                    <Image source={{ uri: img }} style={styles.thumbnailImage} />
                  ) : (
                    <View style={styles.thumbnailPlaceholder}>
                      <Text style={styles.thumbnailPlaceholderText}>🌾</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.productName}>{product.name}</Text>

          {/* Vendor */}
          <TouchableOpacity style={styles.vendorContainer}>
            <Text style={styles.vendorLabel}>Vendu par: </Text>
            <Text style={styles.vendorName}>{product.vendor_name}</Text>
          </TouchableOpacity>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{displayPrice.toFixed(2)} TND</Text>
            <Text style={styles.unit}>/ {product.unit}</Text>
            {product.discount && (
              <Text style={styles.originalPrice}>
                {product.price.toFixed(2)} TND
              </Text>
            )}
          </View>

          {/* Stock */}
          <View style={styles.stockContainer}>
            {product.stock > 0 ? (
              <>
                <Text style={styles.stockAvailable}>✓ En stock</Text>
                <Text style={styles.stockQuantity}>
                  {product.stock} {product.unit} disponible(s)
                </Text>
              </>
            ) : (
              <Text style={styles.stockUnavailable}>✗ Rupture de stock</Text>
            )}
          </View>

          {/* Rating */}
          {stats && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingValue}>{stats.average_rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({stats.total_reviews} avis)</Text>
              <TouchableOpacity
                onPress={() => {}}
                style={styles.reviewsLink}
              >
                <Text style={styles.reviewsLinkText}>Voir les avis →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Reviews Preview */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Derniers avis</Text>
              {reviews.slice(0, 3).map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{review.user_name}</Text>
                    <Text style={styles.reviewRating}>
                      {'⭐'.repeat(review.rating)}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment} numberOfLines={2}>
                    {review.comment}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {product.stock > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decrementQuantity}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={incrementQuantity}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.addToCartButton, addingToCart && styles.buttonDisabled]}
            onPress={handleAddToCart}
            disabled={addingToCart}
          >
            <Text style={styles.addToCartText}>
              {addingToCart ? 'Ajout...' : 'Ajouter au panier'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGallery: {
    backgroundColor: '#f9fafb',
  },
  mainImage: {
    width: '100%',
    height: 320,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 80,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#10b981',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholderText: {
    fontSize: 24,
  },
  content: {
    padding: 20,
  },
  category: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  vendorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  vendorLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  vendorName: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10b981',
  },
  unit: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  originalPrice: {
    fontSize: 18,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stockAvailable: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginRight: 8,
  },
  stockQuantity: {
    fontSize: 13,
    color: '#6b7280',
  },
  stockUnavailable: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  ratingStar: {
    fontSize: 18,
    marginRight: 4,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  reviewsLink: {
    marginLeft: 'auto',
  },
  reviewsLinkText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
  },
  reviewCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewRating: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginRight: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#111827',
    fontWeight: '600',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 16,
    minWidth: 32,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default ProductDetailsScreen;
