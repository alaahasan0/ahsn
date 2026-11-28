import { View } from 'react-native';

import { CATEGORY_ICON } from '@/components/domain/meta';
import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { useActions } from '@/store/AppStore';
import { useTheme } from '@/theme';
import type { Customer, CustomerCategory } from '@/types/models';

const CATEGORIES: CustomerCategory[] = ['trusted', 'regular', 'new'];

/** Manual reclassification. Internal only — the copy says so explicitly. */
export function CategorySheet({ customer, visible, onClose, suggested }: { customer: Customer; visible: boolean; onClose: () => void; suggested?: CustomerCategory }) {
  const { colors, radius } = useTheme();
  const { t, l } = useI18n();
  const actions = useActions();
  const toast = useToast();
  const tone = (c: CustomerCategory) => (c === 'trusted' ? [colors.success, colors.successSoft] : c === 'regular' ? [colors.info, colors.infoSoft] : [colors.accentOnSoft, colors.accentSoft]);
  return (
    <Sheet visible={visible} onClose={onClose} title={t('customers.categorySheet.title')} subtitle={l(customer.name)}>
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceMuted }}>
          <Icon name="lock" size={16} color={colors.textSecondary} />
          <Text variant="footnote" tone="secondary" style={{ flex: 1 }}>
            {t('customers.categorySheet.body')}
          </Text>
        </View>
        {CATEGORIES.map((c) => {
          const sel = customer.category === c;
          const [fg, bg] = tone(c);
          return (
            <Pressable
              key={c}
              haptic="selection"
              onPress={() => {
                actions.setCustomerCategory(customer.id, c);
                toast(t('customers.categorySheet.saved'));
                onClose();
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg, borderWidth: 1.5, borderColor: sel ? colors.accent : colors.border, backgroundColor: colors.surface }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={CATEGORY_ICON[c]} size={18} color={fg} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="headline">{t(`domain.categoryLong.${c}`)}</Text>
                <Text variant="footnote" tone="secondary">
                  {t(`domain.categoryHint.${c}`)}
                </Text>
                {suggested === c && !sel ? (
                  <Text variant="caption" tone="accent">
                    {t('customers.trust.suggested', { category: t(`domain.category.${c}`) })}
                  </Text>
                ) : null}
              </View>
              {sel ? <Icon name="check-circle" size={20} color={colors.accent} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
