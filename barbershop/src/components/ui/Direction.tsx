import type { PropsWithChildren } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';

import { useI18n } from '@/i18n';

/**
 * Applies the reading direction to a subtree. Used at the app root and inside every
 * Modal (modals render in a separate native root, so direction must be re-applied).
 *
 * Native: Yoga `direction` flips rows, start/end and logical margins.
 * Web: `dir` + `lang` make react-native-web resolve logical styles for RTL.
 */
export function DirectionView({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const { isRTL, lang } = useI18n();
  const webProps = Platform.OS === 'web' ? ({ dir: isRTL ? 'rtl' : 'ltr', lang } as object) : null;
  return (
    <View {...webProps} style={[{ flex: 1, direction: isRTL ? 'rtl' : 'ltr' }, style]}>
      {children}
    </View>
  );
}
