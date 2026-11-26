import { View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

const FORMAT_ICON: Record<string, { icon: IconName; hue: number }> = {
  PDF: { icon: 'file-text', hue: 355 },
  DOCX: { icon: 'file-text', hue: 215 },
  XLSX: { icon: 'file-spreadsheet', hue: 145 },
  CSV: { icon: 'file-spreadsheet', hue: 145 },
  PPTX: { icon: 'presentation', hue: 20 },
  JPG: { icon: 'file-image', hue: 280 },
  MP4: { icon: 'monitor-play', hue: 265 },
  Link: { icon: 'link-2', hue: 222 },
};

export function FileIcon({ format, size = 40 }: { format: string; size?: number }) {
  const { isDark } = useTheme();
  const f = FORMAT_ICON[format] ?? FORMAT_ICON.PDF;
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.26, backgroundColor: isDark ? `hsl(${f.hue},30%,22%)` : `hsl(${f.hue},70%,95%)`, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={f.icon} size={size * 0.48} color={isDark ? `hsl(${f.hue},70%,72%)` : `hsl(${f.hue},55%,45%)`} />
      <Text style={{ position: 'absolute', bottom: size * 0.06, fontSize: size * 0.17, lineHeight: size * 0.2, color: isDark ? `hsl(${f.hue},70%,72%)` : `hsl(${f.hue},55%,40%)` }} weight="bold" maxFontSizeMultiplier={1}>
        {format === 'Link' ? '' : format}
      </Text>
    </View>
  );
}

/**
 * A rendered mock page so document screens feel real without a PDF renderer.
 * `kind` changes the page layout (spreadsheet grid, slides, letter).
 */
export function DocumentPage({ title, format, lines = 9, subtitle, compact }: { title: string; format: string; lines?: number; subtitle?: string; compact?: boolean }) {
  const { colors, isDark } = useTheme();
  const paper = isDark ? '#1F232A' : '#FFFFFF';
  const ink = isDark ? '#3A404A' : '#E6E8EC';
  const inkStrong = isDark ? '#4A515D' : '#CDD1D8';
  const isSheet = format === 'XLSX' || format === 'CSV';
  const isSlides = format === 'PPTX';
  return (
    <View
      style={{
        aspectRatio: isSlides ? 16 / 10 : compact ? 1.1 : 0.74,
        backgroundColor: paper,
        borderRadius: 10,
        padding: compact ? 12 : 18,
        gap: 8,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOpacity: isDark ? 0 : 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      }}
      accessibilityLabel={`Preview of ${title}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <View style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: colors.accent }} />
        <Text variant="caption" tone="tertiary">
          EMERITUS EDUCATION
        </Text>
      </View>
      <Text variant={compact ? 'headline' : 'title3'} numberOfLines={2}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="footnote" tone="secondary" numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
      {isSheet ? (
        <View style={{ marginTop: 6, borderWidth: 1, borderColor: ink, borderRadius: 4 }}>
          {Array.from({ length: Math.min(lines, 8) }).map((_, r) => (
            <View key={r} style={{ flexDirection: 'row', borderTopWidth: r ? 1 : 0, borderColor: ink, backgroundColor: r === 0 ? ink : 'transparent' }}>
              {[0.35, 0.25, 0.2, 0.2].map((w, c) => (
                <View key={c} style={{ flex: w, height: 14, borderLeftWidth: c ? 1 : 0, borderColor: ink, justifyContent: 'center', paddingHorizontal: 4 }}>
                  <View style={{ height: 4, width: `${50 + ((r * 7 + c * 13) % 45)}%`, borderRadius: 2, backgroundColor: r === 0 ? inkStrong : ink }} />
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : isSlides ? (
        <View style={{ flex: 1, flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <View style={{ flex: 1, gap: 6 }}>
            {[80, 64, 72, 50].map((w, i) => (
              <View key={i} style={{ height: 6, width: `${w}%`, borderRadius: 3, backgroundColor: ink }} />
            ))}
          </View>
          <View style={{ flex: 1, borderRadius: 6, backgroundColor: colors.accentSoft, alignItems: 'flex-end', justifyContent: 'flex-end', flexDirection: 'row', padding: 8, gap: 4 }}>
            {[40, 65, 50, 85].map((h, i) => (
              <View key={i} style={{ width: 10, height: `${h}%`, borderRadius: 2, backgroundColor: colors.accent, opacity: 0.4 + i * 0.15 }} />
            ))}
          </View>
        </View>
      ) : (
        <View style={{ gap: 7, marginTop: 4 }}>
          {Array.from({ length: lines }).map((_, i) => (
            <View key={i} style={{ height: 5, width: `${i % 4 === 3 ? 55 : 92 - ((i * 11) % 18)}%`, borderRadius: 3, backgroundColor: i === 0 ? inkStrong : ink, marginTop: i % 4 === 0 && i ? 6 : 0 }} />
          ))}
        </View>
      )}
    </View>
  );
}
