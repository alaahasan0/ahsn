import { useState, type ReactNode } from 'react';
import { TextInput, View, type KeyboardTypeOptions, type StyleProp, type ViewStyle } from 'react-native';

import { DatePickerSheet, SelectSheet, TimePickerSheet, type SelectOption } from '@/components/sheets/Pickers';
import { SegmentedControl } from '@/components/ui/Controls';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { Touchable } from '@/components/ui/Touchable';
import { fontFor, makeStyles, useStyles, useTheme } from '@/theme';
import { formatDate } from '@/utils/dates';

function FieldShell({ label, helper, error, children, required, style }: { label?: string; helper?: string; error?: string; children: ReactNode; required?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ gap: 6 }, style]}>
      {label ? (
        <Text variant="label" tone="secondary">
          {label}
          {required ? <Text variant="label" tone="danger">{' *'}</Text> : null}
        </Text>
      ) : null}
      {children}
      {error ? (
        <Text variant="footnote" tone="danger">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="footnote" tone="tertiary">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  error,
  multiline,
  keyboardType,
  prefix,
  suffix,
  required,
  autoFocus,
  icon,
  style,
}: {
  label?: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
  helper?: string;
  error?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  prefix?: string;
  suffix?: string;
  required?: boolean;
  autoFocus?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <FieldShell label={label} helper={helper} error={error} required={required} style={style}>
      <View style={[s.input, multiline && s.multi, focused && { borderColor: colors.accent }, !!error && { borderColor: colors.danger }]}>
        {icon ? <Icon name={icon} size={17} tone="tertiary" /> : null}
        {prefix ? (
          <Text variant="body" tone="secondary">
            {prefix}
          </Text>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          multiline={multiline}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label ?? placeholder}
          style={[fontFor('regular'), s.textInput, multiline && { minHeight: 88, textAlignVertical: 'top', paddingTop: 12 }]}
        />
        {suffix ? (
          <Text variant="body" tone="secondary">
            {suffix}
          </Text>
        ) : null}
      </View>
    </FieldShell>
  );
}

/** Tappable field that opens a picker; used for select/date/time so typing is minimal. */
export function PickerField({ label, value, placeholder, icon, onPress, helper, error, required, style, leading }: { label?: string; value?: string; placeholder?: string; icon?: IconName; onPress: () => void; helper?: string; error?: string; required?: boolean; style?: StyleProp<ViewStyle>; leading?: ReactNode }) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  return (
    <FieldShell label={label} helper={helper} error={error} required={required} style={style}>
      <Touchable onPress={onPress} feedback="opacity" style={[s.input, !!error && { borderColor: colors.danger }]} accessibilityLabel={`${label ?? ''} ${value ?? placeholder ?? ''}`}>
        {leading ?? (icon ? <Icon name={icon} size={17} tone="secondary" /> : null)}
        <Text variant="body" tone={value ? 'primary' : 'tertiary'} numberOfLines={1} style={{ flex: 1 }}>
          {value || placeholder}
        </Text>
        <Icon name="chevrons-up-down" size={16} tone="tertiary" />
      </Touchable>
    </FieldShell>
  );
}

export function SelectField<T extends string>({ label, value, options, onChange, placeholder = 'Select', icon, required, helper, error, style }: { label: string; value?: T; options: SelectOption<T>[]; onChange: (v: T) => void; placeholder?: string; icon?: IconName; required?: boolean; helper?: string; error?: string; style?: StyleProp<ViewStyle> }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <>
      <PickerField label={label} value={current?.label} placeholder={placeholder} icon={icon} onPress={() => setOpen(true)} required={required} helper={helper ?? current?.detail} error={error} style={style} leading={current?.leading} />
      <SelectSheet visible={open} onClose={() => setOpen(false)} title={label} options={options} value={value} onSelect={onChange} />
    </>
  );
}

export function DateField({ label, value, onChange, required, helper, minDate, style }: { label: string; value?: string; onChange: (d: string) => void; required?: boolean; helper?: string; minDate?: string; style?: StyleProp<ViewStyle> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PickerField label={label} value={value ? formatDate(value, { weekday: true }) : undefined} placeholder="Select date" icon="calendar" onPress={() => setOpen(true)} required={required} helper={helper} style={style} />
      <DatePickerSheet visible={open} onClose={() => setOpen(false)} value={value} onChange={onChange} title={label} minDate={minDate} />
    </>
  );
}

export function TimeField({ label, value, onChange, zoneLabel, style }: { label: string; value?: string; onChange: (t: string) => void; zoneLabel?: string; style?: StyleProp<ViewStyle> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PickerField label={label} value={value ? `${value}${zoneLabel ? `  ${zoneLabel}` : ''}` : undefined} placeholder="Select time" icon="clock" onPress={() => setOpen(true)} style={style} />
      <TimePickerSheet visible={open} onClose={() => setOpen(false)} value={value} onChange={onChange} title={label} zoneLabel={zoneLabel} />
    </>
  );
}

export function SegmentedField<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <FieldShell label={label}>
      <SegmentedControl options={options} value={value} onChange={onChange} />
    </FieldShell>
  );
}

/** Tile-style choice grid (e.g. delivery mode, programme template). */
export function ChoiceGrid<T extends string>({ label, options, value, onChange, columns = 2 }: { label?: string; options: { value: T; label: string; detail?: string; icon?: IconName }[]; value?: T; onChange: (v: T) => void; columns?: number }) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  return (
    <FieldShell label={label}>
      <View style={s.grid}>
        {options.map((o) => {
          const sel = o.value === value;
          return (
            <Touchable key={o.value} onPress={() => onChange(o.value)} feedback="scale" accessibilityState={{ selected: sel }} style={[s.choice, { flexBasis: `${100 / columns - 3}%` }, sel && { borderColor: colors.accent, backgroundColor: colors.accentSoft }]}>
              {o.icon ? <Icon name={o.icon} size={20} tone={sel ? 'accent' : 'secondary'} /> : null}
              <Text variant="headline" tone={sel ? 'accent' : 'primary'} numberOfLines={2}>
                {o.label}
              </Text>
              {o.detail ? (
                <Text variant="footnote" tone="secondary" numberOfLines={3}>
                  {o.detail}
                </Text>
              ) : null}
            </Touchable>
          );
        })}
      </View>
    </FieldShell>
  );
}

/** Step indicator for progressive, multi-step forms. */
export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 8 }} accessibilityLabel={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {steps.map((_, i) => (
          <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= current ? colors.accent : colors.chartTrack }} />
        ))}
      </View>
      <Text variant="footnote" tone="secondary">
        Step {current + 1} of {steps.length} · {steps[current]}
      </Text>
    </View>
  );
}

export function FormSection({ title, children, footer }: { title?: string; children: ReactNode; footer?: string }) {
  const s = useStyles(styles);
  return (
    <View style={s.formSection}>
      {title ? (
        <Text variant="overline" tone="tertiary">
          {title}
        </Text>
      ) : null}
      <View style={{ gap: 14 }}>{children}</View>
      {footer ? (
        <Text variant="footnote" tone="tertiary">
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

const styles = makeStyles((t) => ({
  input: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 46, borderRadius: t.radii.md, paddingHorizontal: 12, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border },
  multi: { alignItems: 'flex-start' },
  textInput: { flex: 1, fontSize: 15, color: t.colors.text, paddingVertical: 11, outlineStyle: 'none' } as never,
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  choice: { flexGrow: 1, gap: 4, padding: 14, borderRadius: t.radii.lg, borderWidth: 1.5, borderColor: t.colors.border, backgroundColor: t.colors.surface, minHeight: 84 },
  formSection: { gap: 12, marginTop: t.spacing.xl },
}));
