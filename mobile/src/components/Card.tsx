import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: number;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, style, padding, noPadding = false }) => {
  return (
    <View
      style={[
        styles.card,
        noPadding ? styles.noPadding : padding ? { padding } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  noPadding: {
    padding: 0,
  },
});

export default Card;
