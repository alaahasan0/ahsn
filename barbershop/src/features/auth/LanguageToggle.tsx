import { SegmentedControl } from '@/components/ui';
import { useI18n, type Language } from '@/i18n';

/** Compact AR / EN switch for pre-login screens. */
export function LanguageToggle({ width = 132 }: { width?: number }) {
  const { lang, setLanguage } = useI18n();
  return (
    <SegmentedControl<Language>
      size="sm"
      style={{ width }}
      value={lang}
      onChange={setLanguage}
      segments={[
        { value: 'ar', label: 'العربية' },
        { value: 'en', label: 'English' },
      ]}
    />
  );
}
