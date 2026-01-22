/**
 * Paywall Component
 * 
 * Subscription paywall with trial information.
 * 
 * Usage:
 *   <Paywall
 *     visible={showPaywall}
 *     onClose={() => setShowPaywall(false)}
 *     onSubscribe={handleSubscribe}
 *     trialDaysRemaining={3}
 *   />
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './';

export interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (productId: string) => void | Promise<void>;
  trialDaysRemaining?: number;
  products?: {
    id: string;
    title: string;
    description: string;
    price: string;
    popular?: boolean;
  }[];
  title?: string;
  subtitle?: string;
  features?: string[];
}

export function Paywall({
  visible,
  onClose,
  onSubscribe,
  trialDaysRemaining,
  products = [],
  title = 'Unlock Premium',
  subtitle = 'Get access to all premium features',
  features = [
    'Unlimited access',
    'All premium features',
    'Ad-free experience',
    'Priority support',
  ],
}: PaywallProps) {
  const theme = useTheme();

  type ProductType = {
    id: string;
    title: string;
    description: string;
    price: string;
    popular?: boolean;
  };

  const defaultProducts: ProductType[] = products.length > 0
    ? products
    : [
        {
          id: 'monthly',
          title: 'Monthly',
          description: 'Billed monthly',
          price: '$9.99/month',
          popular: false,
        },
        {
          id: 'yearly',
          title: 'Yearly',
          description: 'Save 20%',
          price: '$79.99/year',
          popular: true,
        },
      ];

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.card,
              borderTopLeftRadius: theme.borderRadius.xl,
              borderTopRightRadius: theme.borderRadius.xl,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: theme.spacing[6] }}
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <View style={styles.titleSection}>
              <Text variant="h1" align="center" style={{ marginBottom: theme.spacing[2] }}>
                {title}
              </Text>
              <Text variant="body" color="secondary" align="center" style={{ marginBottom: theme.spacing[1] }}>
                {subtitle}
              </Text>
              {trialDaysRemaining !== undefined && trialDaysRemaining > 0 && (
                <View
                  style={[
                    styles.trialBadge,
                    {
                      backgroundColor: theme.colors.primary + '20',
                      paddingHorizontal: theme.spacing[3],
                      paddingVertical: theme.spacing[1],
                      borderRadius: theme.borderRadius.full,
                    },
                  ]}
                >
                  <Text variant="caption" style={{ color: theme.colors.primary }}>
                    {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} left in trial
                  </Text>
                </View>
              )}
            </View>

            {/* Features */}
            <View style={styles.featuresSection}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={[styles.checkmark, { color: theme.colors.success }]}>✓</Text>
                  <Text variant="body" style={{ flex: 1, marginLeft: theme.spacing[2] }}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            {/* Products */}
            <View style={styles.productsSection}>
              {defaultProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={[
                    styles.productCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: product.popular
                        ? theme.colors.primary
                        : theme.colors.border,
                      borderWidth: product.popular ? 2 : 1,
                      borderRadius: theme.borderRadius.lg,
                      padding: theme.spacing[4],
                      marginBottom: theme.spacing[3],
                    },
                  ]}
                  onPress={() => onSubscribe(product.id)}
                >
                  {product.popular && (
                    <View
                      style={[
                        styles.popularBadge,
                        {
                          backgroundColor: theme.colors.primary,
                          paddingHorizontal: theme.spacing[2],
                          paddingVertical: 4,
                          borderRadius: theme.borderRadius.sm,
                          alignSelf: 'flex-start',
                          marginBottom: theme.spacing[2],
                        },
                      ]}
                    >
                      <Text variant="caption" style={{ color: '#fff', fontWeight: '600' }}>
                        POPULAR
                      </Text>
                    </View>
                  )}
                  <Text variant="h3" style={{ marginBottom: theme.spacing[1] }}>
                    {product.title}
                  </Text>
                  <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[2] }}>
                    {product.description}
                  </Text>
                  <Text variant="h4" style={{ color: theme.colors.primary }}>
                    {product.price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text variant="caption" color="tertiary" align="center">
                Cancel anytime. Subscription auto-renews unless cancelled.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  trialBadge: {
    marginTop: 8,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  productsSection: {
    marginBottom: 24,
  },
  productCard: {
    // Styles applied inline
  },
  popularBadge: {
    // Styles applied inline
  },
  footer: {
    paddingTop: 16,
  },
});
