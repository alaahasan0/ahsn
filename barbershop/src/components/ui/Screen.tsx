import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type RefreshControlProps, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export interface ScreenProps {
  children?: ReactNode;
  /** Header element (usually <Header/>). Rendered above the scroll area and handles the top inset. */
  header?: ReactNode;
  /** Sticky bottom area (primary actions). Handles the bottom inset. */
  footer?: ReactNode;
  scroll?: boolean;
  /** Horizontal content padding (default 20). */
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Background: 'background' (default) or 'surface'. */
  surface?: 'background' | 'surface';
  refreshControl?: React.ReactElement<RefreshControlProps>;
  /** When the screen sits inside a tab navigator the tab bar handles the bottom inset. */
  inTabs?: boolean;
  scrollProps?: ScrollViewProps;
  testID?: string;
}

export function Screen({ children, header, footer, scroll = true, padded = true, contentStyle, surface = 'background', refreshControl, inTabs, scrollProps, testID }: ScreenProps) {
  const { colors, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const bg = surface === 'surface' ? colors.surface : colors.background;
  const bottomPad = footer ? 24 : inTabs ? 32 : Math.max(insets.bottom, 16) + 24;
  const inner: StyleProp<ViewStyle> = [{ paddingHorizontal: padded ? layout.screenPadding : 0, paddingBottom: bottomPad, width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' }, contentStyle];

  return (
    <View style={[styles.root, { backgroundColor: bg }]} testID={testID}>
      {header ?? <View style={{ height: insets.top, backgroundColor: bg }} />}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={inner} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} refreshControl={refreshControl} {...scrollProps}>
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, inner, { paddingBottom: footer ? 0 : inner && inTabs ? 0 : Math.max(insets.bottom, 0) }]}>{children}</View>
        )}
        {footer ? (
          <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator, backgroundColor: colors.backgroundElevated, paddingTop: 12, paddingBottom: inTabs ? 12 : Math.max(insets.bottom, 12), paddingHorizontal: layout.screenPadding }}>
            <View style={{ width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', gap: 10 }}>{footer}</View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
