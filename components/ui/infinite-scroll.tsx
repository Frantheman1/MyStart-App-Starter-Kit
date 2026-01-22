/**
 * Infinite Scroll Component
 * 
 * Reusable infinite scroll list pattern.
 * 
 * Usage:
 *   <InfiniteScroll
 *     data={items}
 *     renderItem={({ item }) => <ItemComponent item={item} />}
 *     onLoadMore={loadMore}
 *     hasMore={hasMore}
 *     isLoading={isLoading}
 *   />
 */

import React, { useCallback, useRef } from 'react';
import {
  FlatList,
  FlatListProps,
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './text';

export interface InfiniteScrollProps<T> extends Omit<FlatListProps<T>, 'onEndReached' | 'onEndReachedThreshold'> {
  data: T[];
  renderItem: (info: { item: T; index: number }) => React.ReactElement;
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  endComponent?: React.ReactNode;
  threshold?: number;
  style?: ViewStyle;
}

export function InfiniteScroll<T>({
  data,
  renderItem,
  onLoadMore,
  hasMore,
  isLoading = false,
  loadingComponent,
  emptyComponent,
  endComponent,
  threshold = 0.5,
  style,
  ...flatListProps
}: InfiniteScrollProps<T>) {
  const theme = useTheme();
  const isLoadingRef = useRef(false);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoading || isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    try {
      await onLoadMore();
    } finally {
      isLoadingRef.current = false;
    }
  }, [hasMore, isLoading, onLoadMore]);

  const defaultLoadingComponent = (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color={theme.colors.primary} />
      <Text variant="caption" color="tertiary" style={{ marginLeft: theme.spacing[2] }}>
        Loading more...
      </Text>
    </View>
  );

  const defaultEmptyComponent = (
    <View style={styles.emptyContainer}>
      <Text variant="body" color="secondary" align="center">
        No items found
      </Text>
    </View>
  );

  const defaultEndComponent = (
    <View style={styles.endContainer}>
      <Text variant="caption" color="tertiary" align="center">
        No more items
      </Text>
    </View>
  );

  if (data.length === 0 && !isLoading) {
    return <View style={style}>{emptyComponent || defaultEmptyComponent}</View>;
  }

  return (
    <FlatList
      {...flatListProps}
      data={data}
      renderItem={({ item, index }) => renderItem({ item, index })}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={threshold}
      ListFooterComponent={() => {
        if (isLoading) {
          return loadingComponent || defaultLoadingComponent;
        }
        if (!hasMore && data.length > 0) {
          return endComponent || defaultEndComponent;
        }
        return null;
      }}
      style={style}
      keyExtractor={(item, index) => {
        // Try to use id if available, otherwise use index
        if (item && typeof item === 'object' && 'id' in item) {
          return String((item as any).id);
        }
        return `item-${index}`;
      }}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  endContainer: {
    padding: 16,
  },
});
