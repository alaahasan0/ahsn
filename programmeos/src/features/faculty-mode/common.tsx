/**
 * Building blocks shared by the two external experiences (Faculty Mode and Learner Mode).
 * Everything here is presented from the persona's own point of view and time zone.
 */
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Button, Card, Icon, StatusPill, Text, Touchable, useToast, type IconName } from '@/components';
import type { Session, TimeZoneId } from '@/data/models';
import { getProgramme, getVenue } from '@/data/selectors';
import { useDB } from '@/data/store';
import { makeStyles, useStyles, useTheme } from '@/theme';
import {
  absoluteMinutes,
  convertZone,
  DEMO_NOW,
  diffDays,
  formatDate,
  MONTHS_SHORT,
  parseDate,
  splitDateTime,
  TIMEZONES,
  tzAbbr,
  WEEKDAYS_SHORT,
  weekday,
} from '@/utils/dates';

// ─── Time ─────────────────────────────────────────────────────────────────────

const NOW = splitDateTime(DEMO_NOW);
/** The demo clock is expressed in Dubai time; convert for each persona. */
export const NOW_ABS = absoluteMinutes(NOW.date, NOW.time, 'Asia/Dubai');

export function localNow(tz: TimeZoneId) {
  return convertZone(NOW.date, NOW.time, 'Asia/Dubai', tz);
}

export function sessionStartAbs(s: Session) {
  return absoluteMinutes(s.date, s.start, s.timeZone);
}

export function sessionEndAbs(s: Session) {
  return absoluteMinutes(s.endDate, s.end, s.timeZone);
}

/** Start/end of a session expressed in the viewer's zone. */
export function inZone(s: Session, tz: TimeZoneId) {
  const start = convertZone(s.date, s.start, s.timeZone, tz);
  const end = convertZone(s.date, s.end, s.timeZone, tz);
  return { date: start.date, start: start.time, end: end.time, endDate: s.date === s.endDate ? end.date : convertZone(s.endDate, s.end, s.timeZone, tz).date };
}

export function isUpcoming(s: Session) {
  return s.status !== 'Cancelled' && s.status !== 'Completed' && sessionEndAbs(s) > NOW_ABS;
}

export function isLive(s: Session) {
  // Multi-day sessions are "live" only within the daily window.
  const today = localNow(s.timeZone).date;
  if (today < s.date || today > s.endDate) return false;
  const st = absoluteMinutes(today, s.start, s.timeZone);
  const en = absoluteMinutes(today, s.end, s.timeZone);
  return NOW_ABS >= st && NOW_ABS <= en;
}

/** "Starts in 2h 20m", "Tomorrow at 06:00", "In 14 days". */
export function startsIn(s: Session, tz: TimeZoneId) {
  if (isLive(s)) return 'Happening now';
  const mins = sessionStartAbs(s) - NOW_ABS;
  const z = inZone(s, tz);
  const today = localNow(tz).date;
  const days = diffDays(z.date, today);
  if (mins <= 0) return 'Started';
  if (mins < 60) return `Starts in ${mins} min`;
  if (days === 0) return `Today · starts in ${Math.floor(mins / 60)}h ${mins % 60}m`;
  if (days === 1) return `Tomorrow at ${z.start}`;
  return `In ${days} days`;
}

export function zoneNote(s: Session, tz: TimeZoneId) {
  if (s.timeZone === tz) return tzAbbr(tz);
  return `${tzAbbr(tz)} · ${s.start} ${tzAbbr(s.timeZone)} local`;
}

export function sortByStart(a: Session, b: Session) {
  return sessionStartAbs(a) - sessionStartAbs(b);
}

export function personaZoneLabel(tz: TimeZoneId) {
  const z = TIMEZONES[tz];
  return `${z.city} · ${z.abbr}`;
}

// ─── Date block ───────────────────────────────────────────────────────────────

export function DateBlock({ date, accent, size = 'md' }: { date: string; accent?: boolean; size?: 'sm' | 'md' }) {
  const { colors } = useTheme();
  const d = parseDate(date);
  const w = size === 'sm' ? 44 : 50;
  return (
    <View style={{ width: w, height: w + 6, borderRadius: 12, backgroundColor: accent ? colors.accentSoft : colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="caption" tone={accent ? 'accent' : 'tertiary'} style={{ fontSize: 10, textTransform: 'uppercase' }}>
        {WEEKDAYS_SHORT[weekday(date)]}
      </Text>
      <Text variant={size === 'sm' ? 'headline' : 'title3'} tabular tone={accent ? 'accent' : 'primary'}>
        {d.day}
      </Text>
      <Text variant="caption" tone="tertiary" style={{ fontSize: 10 }}>
        {MONTHS_SHORT[d.m - 1]}
      </Text>
    </View>
  );
}

// ─── Delivery presentation ────────────────────────────────────────────────────

export const MODE_ICON: Record<Session['deliveryMode'], IconName> = { 'In-person': 'map-pin', Virtual: 'video', Hybrid: 'monitor-play' };

export function modeLine(s: Session) {
  if (s.deliveryMode === 'Virtual') return 'Live online · Zoom';
  if (s.deliveryMode === 'Hybrid') return `${s.roomName ?? s.location ?? 'On site'} + Zoom`;
  return s.roomName ? `${s.roomName}${s.location ? ` · ${s.location.split(',')[0]}` : ''}` : (s.location ?? 'Location to be confirmed');
}

/**
 * Where to be: virtual link, physical location, or both for hybrid sessions.
 * Join, copy and directions are simulated.
 */
export function JoinPanel({ session, compact }: { session: Session; compact?: boolean }) {
  const s = useStyles(styles);
  const db = useDB();
  const toast = useToast();
  const venue = getVenue(db, session.venueId);
  const showVirtual = session.deliveryMode !== 'In-person' && !!session.meetingLink;
  const showPlace = session.deliveryMode !== 'Virtual';
  const live = isLive(session);
  return (
    <View style={{ gap: 10 }}>
      {showVirtual ? (
        <Card padding="md" variant="outline" style={{ gap: 10 }}>
          <View style={s.row}>
            <View style={s.iconWrap}>
              <Icon name="video" size={18} tone="accent" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="headline">{session.deliveryMode === 'Hybrid' ? 'Join online' : 'Live online session'}</Text>
              <Text variant="footnote" tone="secondary" numberOfLines={1}>
                Zoom · Meeting ID {session.meetingId}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              title={live ? 'Join now' : 'Join'}
              icon="video"
              size={compact ? 'sm' : 'md'}
              style={{ flex: 1 }}
              onPress={() => toast.show({ message: live ? 'Opening Zoom…' : 'The room opens 10 minutes before start', detail: 'Simulated — no meeting is launched in this prototype.', icon: 'video', tone: 'accent' })}
            />
            <Button title="Copy link" icon="copy" variant="secondary" size={compact ? 'sm' : 'md'} style={{ flex: 1 }} onPress={() => toast.show({ message: 'Meeting link copied', detail: session.meetingLink, icon: 'copy', tone: 'neutral' })} />
          </View>
        </Card>
      ) : null}
      {showPlace ? (
        <Card padding="md" variant="outline" style={{ gap: 10 }}>
          <View style={s.row}>
            <View style={s.iconWrap}>
              <Icon name="map-pin" size={18} tone="accent" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="headline">{session.roomName ?? venue?.name ?? 'On site'}</Text>
              <Text variant="footnote" tone="secondary" numberOfLines={2}>
                {venue ? `${venue.name} · ${venue.address}` : (session.location ?? 'Location to be confirmed')}
              </Text>
            </View>
          </View>
          <Button title="Directions" icon="navigation" variant="tinted" size={compact ? 'sm' : 'md'} onPress={() => toast.show({ message: 'Opening maps…', detail: 'Simulated — directions open in your maps app.', icon: 'map', tone: 'neutral' })} />
        </Card>
      ) : null}
    </View>
  );
}

// ─── Session list row (persona time zone) ─────────────────────────────────────

export function PersonaSessionRow({ session, tz, route, showProgramme = true, dim }: { session: Session; tz: TimeZoneId; route: string; showProgramme?: boolean; dim?: boolean }) {
  const s = useStyles(styles);
  const db = useDB();
  const { colors } = useTheme();
  const prog = getProgramme(db, session.programmeId);
  const z = inZone(session, tz);
  const live = isLive(session);
  return (
    <Touchable onPress={() => router.push(route as Href)} feedback="highlight" pressedStyle={{ backgroundColor: colors.surfacePressed }} style={[s.sessionRow, dim && { opacity: 0.6 }]} accessibilityLabel={`${session.title}, ${formatDate(z.date, { weekday: true })} ${z.start}`} hitSlop={0}>
      <View style={{ width: 54 }}>
        <Text variant="headline" tabular>
          {z.start}
        </Text>
        <Text variant="caption" tone="tertiary" tabular>
          {session.date !== session.endDate ? 'Multi-day' : z.end}
        </Text>
      </View>
      <View style={[s.bar, { backgroundColor: `hsl(${prog?.accentHue ?? 220}, 62%, 58%)` }]} />
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <Text variant="bodyStrong" numberOfLines={2}>
          {session.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Icon name={MODE_ICON[session.deliveryMode]} size={12} tone="tertiary" />
          <Text variant="footnote" tone="secondary" numberOfLines={1} style={{ flexShrink: 1 }}>
            {showProgramme && prog ? `${prog.shortName} · ` : ''}
            {modeLine(session)}
          </Text>
        </View>
        {session.timeZone !== tz ? (
          <Text variant="footnote" tone="tertiary" numberOfLines={1}>
            {session.start} {tzAbbr(session.timeZone)} at the venue
          </Text>
        ) : null}
      </View>
      {live ? <StatusPill label="Live" tone="danger" /> : session.status === 'Tentative' ? <StatusPill label="Tentative" /> : session.status === 'Completed' ? <StatusPill label="Completed" /> : null}
    </Touchable>
  );
}

// ─── Small pieces ─────────────────────────────────────────────────────────────

export function InfoTile({ icon, label, value, tone = 'accent' }: { icon: IconName; label: string; value: string; tone?: 'accent' | 'success' | 'warning' | 'violet' }) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  const bg = { accent: colors.accentSoft, success: colors.successSoft, warning: colors.warningSoft, violet: colors.violetSoft }[tone];
  const fg = { accent: colors.accent, success: colors.success, warning: colors.warning, violet: colors.violet }[tone];
  return (
    <View style={s.tile}>
      <View style={[s.tileIcon, { backgroundColor: bg }]}>
        <Icon name={icon} size={16} color={fg} />
      </View>
      <Text variant="caption" tone="secondary" numberOfLines={1}>
        {label}
      </Text>
      <Text variant="headline" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export function TileRow({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{children}</View>;
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" size={size} color={i <= Math.round(value) ? colors.warning : colors.borderStrong} fill={i <= Math.round(value) ? colors.warning : undefined} />
      ))}
    </View>
  );
}

/** Large tappable link tile used on profile/programme hubs. */
export function HubLink({ icon, label, detail, route, tone = 'accent' }: { icon: IconName; label: string; detail?: string; route: string; tone?: 'accent' | 'success' | 'warning' | 'violet' | 'info' | 'danger' | 'neutral' }) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  const map = { accent: [colors.accentSoft, colors.accent], success: [colors.successSoft, colors.success], warning: [colors.warningSoft, colors.warning], violet: [colors.violetSoft, colors.violet], info: [colors.infoSoft, colors.info], danger: [colors.dangerSoft, colors.danger], neutral: [colors.neutralSoft, colors.neutralText] }[tone];
  return (
    <Touchable onPress={() => router.push(route as Href)} feedback="scale" style={s.hub} accessibilityLabel={label}>
      <View style={[s.tileIcon, { backgroundColor: map[0], width: 34, height: 34, borderRadius: 11 }]}>
        <Icon name={icon} size={18} color={map[1]} />
      </View>
      <Text variant="headline" numberOfLines={1}>
        {label}
      </Text>
      {detail ? (
        <Text variant="footnote" tone="secondary" numberOfLines={2}>
          {detail}
        </Text>
      ) : null}
    </Touchable>
  );
}

const styles = makeStyles((t) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 11, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  sessionRow: { flexDirection: 'row', gap: 12, paddingHorizontal: t.spacing.lg, paddingVertical: 12, alignItems: 'center' },
  bar: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  tile: { flexGrow: 1, flexBasis: '45%', backgroundColor: t.colors.surface, borderRadius: t.radii.lg, padding: 14, gap: 4, borderWidth: t.isDark ? t.hairline : 0, borderColor: t.colors.border },
  tileIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  hub: { flexGrow: 1, flexBasis: '45%', backgroundColor: t.colors.surface, borderRadius: t.radii.lg, padding: 14, gap: 4, minHeight: 104, borderWidth: t.isDark ? t.hairline : 0, borderColor: t.colors.border },
}));
