import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme';
import { isTablet } from '../utils/responsive';

export default function SearchBar({ onSearch, onClear, value, placeholder }) {
  const [searchText, setSearchText] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Sync with external value changes (like clearing)
  useEffect(() => {
    if (value !== undefined && value !== searchText) {
      setSearchText(value);
    }
  }, [value]);

  // Debounce the search callback
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(searchText);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchText]); // Only run when searchText changes

  const handleClear = () => {
    setSearchText('');
    if (onClear) onClear();
    if (onSearch) onSearch('');
    inputRef.current?.focus();
  };

  return (
    <Pressable 
      style={[styles.container, isFocused && styles.containerFocused]}
      onPress={() => inputRef.current?.focus()}
    >
      <Ionicons name="search" size={20} color={isFocused ? COLORS.primary : COLORS.textLight} style={styles.icon} />
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={placeholder || "Search..."}
        placeholderTextColor={COLORS.textLight}
        value={searchText}
        onChangeText={setSearchText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        underlineColorAndroid="transparent"
      />
      {searchText.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton} hitSlop={{top: 15, right: 15, bottom: 15, left: 15}}>
          <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      )}
    </Pressable>
  );
}

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
    minHeight: 46,
    color: COLORS.text,
    fontSize: isTablet() ? 16 : 14,
    paddingHorizontal: SPACING.sm,
  },
  clearButton: {
    marginLeft: SPACING.sm,
  }
});
