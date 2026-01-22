/**
 * In-App Purchases / Subscriptions
 * 
 * Handle in-app purchases and subscriptions.
 * 
 * Recommended: Use RevenueCat (react-native-purchases)
 *   npm install react-native-purchases
 * 
 * Alternative: expo-iap (for development builds)
 *   npx expo install expo-iap
 * 
 * Note: expo-in-app-purchases is deprecated
 * 
 * Usage:
 *   import { useInAppPurchase } from '@/lib/purchases';
 *   const { products, purchaseProduct, restorePurchases } = useInAppPurchase();
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { logger } from '@/lib/logging/logger';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  currencyCode?: string;
  type: 'subscription' | 'consumable' | 'nonConsumable';
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  receipt?: string;
  error?: string;
}

export interface UseInAppPurchaseReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: (productIds: string[]) => Promise<void>;
  purchaseProduct: (productId: string) => Promise<PurchaseResult>;
  restorePurchases: () => Promise<PurchaseResult[]>;
  isPurchased: (productId: string) => boolean;
  getPurchasedProducts: () => string[];
}

class InAppPurchaseService {
  private purchasedProducts: Set<string> = new Set();
  private iapModule: any = null;

  /**
   * Initialize IAP module
   * Supports RevenueCat (recommended) or expo-iap
   */
  async initialize(): Promise<boolean> {
    try {
      // Try RevenueCat first (recommended)
      try {
        // @ts-ignore - Optional dependency
        const Purchases = await import('react-native-purchases');
        this.iapModule = Purchases;
        logger.info('In-app purchases initialized with RevenueCat');
        return true;
      } catch {
        // Fallback to expo-iap
        // @ts-ignore - Optional dependency
        const IAP = await import('expo-iap');
        this.iapModule = IAP;
        logger.info('In-app purchases initialized with expo-iap');
        return true;
      }
    } catch (error) {
      logger.warn('In-app purchases not available. Install: npm install react-native-purchases');
      return false;
    }
  }

  /**
   * Fetch products from store
   */
  async fetchProducts(productIds: string[]): Promise<Product[]> {
    try {
      if (!this.iapModule) {
        await this.initialize();
      }

      if (!this.iapModule) {
        logger.warn('IAP module not available. Install: npm install react-native-purchases');
        return [];
      }

      // Check if it's RevenueCat
      if (this.iapModule.getOfferings || this.iapModule.getProducts) {
        // RevenueCat API
        const offerings = await this.iapModule.getOfferings();
        const products: Product[] = [];
        
        if (offerings.current) {
          for (const packageItem of offerings.current.availablePackages) {
            const pkg = packageItem.product;
            products.push({
              id: pkg.identifier,
              title: pkg.title,
              description: pkg.description,
              price: pkg.priceString,
              currencyCode: pkg.currencyCode,
              type: 'subscription',
            });
          }
        }
        return products;
      } else {
        // expo-iap API
        const { results } = await this.iapModule.getProductsAsync(productIds);
        return results.map((product: any) => ({
          id: product.productId,
          title: product.title,
          description: product.description,
          price: product.price,
          currencyCode: product.currencyCode,
          type: product.type || 'subscription',
        }));
      }
    } catch (error) {
      logger.error('Failed to fetch products', { error });
      return [];
    }
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    try {
      if (!this.iapModule) {
        await this.initialize();
      }

      if (!this.iapModule) {
        return {
          success: false,
          error: 'IAP module not available. Install: npm install react-native-purchases',
        };
      }

      // Check if it's RevenueCat
      if (this.iapModule.purchasePackage) {
        // RevenueCat API
        const { customerInfo } = await this.iapModule.purchasePackage(productId);
        this.purchasedProducts.add(productId);
        
        logger.info('Product purchased via RevenueCat', { productId });
        return {
          success: true,
          productId,
          receipt: customerInfo.originalPurchaseDate,
        };
      } else {
        // expo-iap API
        const { responseCode, results } = await this.iapModule.purchaseItemAsync(productId);

        if (responseCode === this.iapModule.IAPResponseCode?.OK || responseCode === 0) {
          const purchase = results[0];
          this.purchasedProducts.add(productId);
          
          logger.info('Product purchased', {
            productId,
            transactionId: purchase.transactionId,
          });

          // Acknowledge purchase
          if (purchase.acknowledged === false) {
            await this.iapModule.finishTransactionAsync(purchase, false);
          }

          return {
            success: true,
            productId,
            transactionId: purchase.transactionId,
            receipt: purchase.receipt,
          };
        } else {
          const errorMessage = this.getErrorMessage(responseCode);
          return {
            success: false,
            error: errorMessage,
          };
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Purchase failed';
      logger.error('Purchase failed', { error: message });
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<PurchaseResult[]> {
    try {
      if (!this.iapModule) {
        await this.initialize();
      }

      if (!this.iapModule) {
        return [];
      }

      // Check if it's RevenueCat
      if (this.iapModule.restorePurchases) {
        // RevenueCat API
        const customerInfo = await this.iapModule.restorePurchases();
        const restored: PurchaseResult[] = [];
        
        // RevenueCat provides active entitlements
        for (const [productId] of Object.entries(customerInfo.entitlements.active || {})) {
          this.purchasedProducts.add(productId);
          restored.push({
            success: true,
            productId,
          });
        }

        logger.info('Purchases restored via RevenueCat', { count: restored.length });
        return restored;
      } else {
        // expo-iap API
        const { results } = await this.iapModule.getPurchaseHistoryAsync();

        const restored: PurchaseResult[] = results.map((purchase: any) => {
          this.purchasedProducts.add(purchase.productId);
          return {
            success: true,
            productId: purchase.productId,
            transactionId: purchase.transactionId,
            receipt: purchase.receipt,
          };
        });

        logger.info('Purchases restored', { count: restored.length });
        return restored;
      }
    } catch (error) {
      logger.error('Failed to restore purchases', { error });
      return [];
    }
  }

  /**
   * Check if product is purchased
   */
  isPurchased(productId: string): boolean {
    return this.purchasedProducts.has(productId);
  }

  /**
   * Get all purchased product IDs
   */
  getPurchasedProducts(): string[] {
    return Array.from(this.purchasedProducts);
  }

  /**
   * Get error message from response code
   */
  private getErrorMessage(responseCode: number | string): string {
    if (!this.iapModule) return 'Unknown error';

    const codes = this.iapModule.IAPResponseCode || {};
    const codeStr = String(responseCode);
    
    if (codeStr === 'USER_CANCELLED' || codeStr === String(codes.USER_CANCELED)) {
      return 'Purchase was cancelled';
    }
    if (codeStr === String(codes.ITEM_UNAVAILABLE)) {
      return 'Product is not available';
    }
    if (codeStr === String(codes.ERROR)) {
      return 'An error occurred';
    }
    return 'Purchase failed';
  }

  /**
   * Disconnect from store
   */
  async disconnect(): Promise<void> {
    try {
      if (this.iapModule) {
        // RevenueCat doesn't need disconnect, expo-iap does
        if (this.iapModule.disconnectAsync) {
          await this.iapModule.disconnectAsync();
          logger.info('Disconnected from IAP store');
        }
      }
    } catch (error) {
      logger.error('Failed to disconnect from IAP store', { error });
    }
  }
}

export const purchaseService = new InAppPurchaseService();

/**
 * React hook for in-app purchases
 */
export function useInAppPurchase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (productIds: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedProducts = await purchaseService.fetchProducts(productIds);
      setProducts(fetchedProducts);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(message);
      logger.error('Failed to fetch products', { error: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purchaseProduct = useCallback(async (productId: string): Promise<PurchaseResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await purchaseService.purchaseProduct(productId);
      if (!result.success) {
        setError(result.error || 'Purchase failed');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Purchase failed';
      setError(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<PurchaseResult[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await purchaseService.restorePurchases();
      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restore purchases';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isPurchased = useCallback((productId: string): boolean => {
    return purchaseService.isPurchased(productId);
  }, []);

  const getPurchasedProducts = useCallback((): string[] => {
    return purchaseService.getPurchasedProducts();
  }, []);

  useEffect(() => {
    // Initialize on mount
    purchaseService.initialize();

    return () => {
      // Cleanup on unmount
      purchaseService.disconnect();
    };
  }, []);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    purchaseProduct,
    restorePurchases,
    isPurchased,
    getPurchasedProducts,
  };
}
