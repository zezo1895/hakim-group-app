import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme';
import { isTablet } from '../utils/responsive';

const SearchBar = memo(({ onSearch, onClear, value, onChangeText }) => {
  const [searchText, setSearchText] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setSearchText(value || '');
  }, [value]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch && typeof onSearch === 'function') {
        onSearch(searchText);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchText, onSearch]);

  const handleClear = useCallback(() => {
    setSearchText('');
    if (onClear) onClear();
    if (onChangeText) onChangeText('');
  }, [onClear, onChangeText]);

  const handleChangeText = useCallback((text) => {
    setSearchText(text);
    if (onChangeText) onChangeText(text);
  }, [onChangeText]);

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      <Ionicons name="search" size={20} color={isFocused ? COLORS.primary : COLORS.textLight} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="ابحث عن منتج..."
        placeholderTextColor={COLORS.textLight}
        value={searchText}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        writingDirection="rtl"
        textAlign="right"
        returnKeyType="search"
      />
      {searchText.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton} hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
          <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    height: isTablet() ? 50 : 46,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  containerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.text,
    fontSize: isTablet() ? 16 : 14,
    textAlign: 'right',
  },
  clearButton: {
    marginLeft: SPACING.sm,
  }
});

export default SearchBar;
