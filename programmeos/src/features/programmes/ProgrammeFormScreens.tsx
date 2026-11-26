import { router, useLocalSearchParams, useNavigation, usePreventRemove, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  Avatar,
  Button,
  Card,
  ChoiceGrid,
  DateField,
  FormSection,
  Icon,
  KeyValue,
  Monogram,
  Screen,
  SegmentedField,
  SelectField,
  StepIndicator,
  Text,
  TextField,
  useDialog,
  useToast,
} from '@/components';
import type { DeliveryMode, Programme, ProgrammeType, TimeZoneId } from '@/data/models';
import { getClient, getProgramme, getStaff } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { addDays, DEMO_TODAY, diffDays, formatRange, TIMEZONES } from '@/utils/dates';
import { groupDigits, money, newId } from '@/utils/format';

const TYPES: { value: ProgrammeType; label: string; detail: string; template: string }[] = [
  { value: '3-Day Executive Programme', label: '3-Day Executive', detail: 'Compact, in-person', template: 'wt-3day' },
  { value: '5-Day Residential Programme', label: '5-Day Residential', detail: 'Hotel, travel, social', template: 'wt-5day' },
  { value: '6-Month Hybrid Programme', label: '6-Month Hybrid', detail: 'Residencies + virtual', template: 'wt-6month' },
  { value: 'Fully Virtual Programme', label: 'Fully Virtual', detail: 'Live online', template: 'wt-virtual' },
  { value: 'Multi-Week Programme', label: 'Multi-Week', detail: 'Weekly sessions', template: 'wt-custom' },
  { value: 'Custom Programme', label: 'Custom', detail: 'Bespoke design', template: 'wt-custom' },
];

const STEPS = ['Basics', 'Dates & delivery', 'Team', 'Commercial'];

function parseMoney(s: string) {
  return Number(s.replace(/[^0-9]/g, '')) || 0;
}

export function NewProgrammeScreen() {
  const db = useDB();
  const actions = useActions();
  const { userId } = useSession();
  const params = useLocalSearchParams<{ from?: string }>();
  const source = getProgramme(db, params.from);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(source ? `${source.name} 2028` : '');
  const [clientId, setClientId] = useState(source?.clientId ?? '');
  const [type, setType] = useState<ProgrammeType>(source?.type ?? '5-Day Residential Programme');
  const [start, setStart] = useState(addDays(DEMO_TODAY, 84));
  const [end, setEnd] = useState(addDays(DEMO_TODAY, 88));
  const [mode, setMode] = useState<DeliveryMode>(source?.deliveryMode ?? 'In-person');
  const [location, setLocation] = useState(source?.location ?? '');
  const [tz, setTz] = useState<TimeZoneId>(source?.timeZone ?? 'Asia/Dubai');
  const [capacity, setCapacity] = useState(String(source?.capacity ?? 24));
  const [managerId, setManagerId] = useState(db.staff.find((s) => s.id === userId)?.role === 'programme_manager' ? userId : 's-layla');
  const [ownerId, setOwnerId] = useState('s-james');
  const [coordinatorId, setCoordinatorId] = useState('s-omar');
  const [contract, setContract] = useState(source ? groupDigits(source.contractValue) : '');
  const [budget, setBudget] = useState(source ? groupDigits(source.budget) : '');
  const [created, setCreated] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const template = db.workflowTemplates.find((t) => t.id === TYPES.find((x) => x.value === type)?.template);
  const errors = {
    name: !name.trim() ? 'Give the programme a name' : undefined,
    client: !clientId ? 'Choose a client' : undefined,
    dates: end < start ? 'End date must be after the start date' : undefined,
    location: mode !== 'Virtual' && !location.trim() ? 'Add a location or venue' : undefined,
  };
  const stepValid = [!errors.name && !errors.client, !errors.dates && !errors.location, true, true][step];

  const create = () => {
    const id = newId('p');
    const year = start.slice(0, 4);
    const prog: Programme = {
      id,
      code: `PRG-${year}-0${30 + db.programmes.length}`,
      name: name.trim(),
      shortName: name.trim().split(/\s+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('').slice(0, 5) || 'NEW',
      clientId,
      managerId,
      ownerId,
      coordinatorId,
      type,
      deliveryMode: mode,
      startDate: start,
      endDate: end,
      location: mode === 'Virtual' ? 'Virtual · Zoom & Emeritus Learning Hub' : location.trim(),
      timeZone: tz,
      contractValue: parseMoney(contract),
      budget: parseMoney(budget),
      revenue: 0,
      committed: 0,
      actual: 0,
      status: { commercial: 'Contract Signed', operational: 'Planning', academic: 'Design', logistics: mode === 'Virtual' ? 'Not Required' : 'Not Started', financial: 'Budget Draft', delivery: 'Not Started' },
      stage: 'checklist',
      capacity: Number(capacity) || 0,
      description: `New ${type.toLowerCase()} for ${getClient(db, clientId)?.name}.`,
      objectives: [],
      tags: [mode],
      templateId: template?.id,
      accentHue: Math.floor(Math.random() * 360),
    };
    actions.createProgramme(prog);
    let count = 0;
    template?.phases.forEach((ph) =>
      ph.tasks.forEach((t) => {
        const owner = db.staff.find((s) => s.role === t.role)?.id ?? managerId;
        actions.createTask({ title: t.title, programmeId: id, ownerId: t.role === 'programme_manager' ? managerId : owner, dueDate: addDays(start, t.offsetDays), priority: t.offsetDays > -14 && t.offsetDays < 0 ? 'High' : 'Medium', category: t.category, description: `Generated from the ${template.name} template (${ph.name}).` });
        count++;
      }),
    );
    actions.log(id, 'status_changed', `generated ${count} checklist tasks from the template`, 'system');
    setCreated(id);
  };

  if (created) return <CreatedState programmeId={created} />;

  return (
    <Screen
      title="New programme"
      back="close"
      onBack={() => router.back()}
      large={false}
      footer={
        <>
          {step > 0 ? <Button title="Back" variant="secondary" onPress={() => setStep(step - 1)} style={{ flex: 1 }} /> : null}
          <Button
            title={step === STEPS.length - 1 ? 'Create programme' : 'Continue'}
            icon={step === STEPS.length - 1 ? 'sparkles' : undefined}
            onPress={() => {
              setTouched(true);
              if (!stepValid) return;
              setTouched(false);
              if (step === STEPS.length - 1) create();
              else setStep(step + 1);
            }}
            style={{ flex: 2 }}
          />
        </>
      }>
      <StepIndicator steps={STEPS} current={step} />
      {step === 0 ? (
        <Animated.View entering={FadeInDown.duration(220)}>
          <FormSection title="Programme">
            <TextField label="Programme name" value={name} onChangeText={setName} placeholder="e.g. Executive Leadership Programme" required error={touched ? errors.name : undefined} autoFocus />
            <SelectField label="Client" value={clientId} onChange={setClientId} required error={touched ? errors.client : undefined} options={db.clients.map((c) => ({ value: c.id, label: c.name, detail: `${c.type} · ${c.sector}`, leading: <Monogram name={c.shortName} hue={c.logoHue} size={30} /> }))} placeholder="Choose client" icon="building-2" />
          </FormSection>
          <FormSection title="Programme type" footer={template ? `Applies the “${template.name}” workflow template: ${template.phases.reduce((s, p) => s + p.tasks.length, 0)} tasks across ${template.phases.length} phases.` : undefined}>
            <ChoiceGrid value={type} onChange={(v) => { setType(v); if (v === 'Fully Virtual Programme') setMode('Virtual'); }} options={TYPES.map((t) => ({ value: t.value, label: t.label, detail: t.detail }))} />
          </FormSection>
        </Animated.View>
      ) : null}
      {step === 1 ? (
        <Animated.View entering={FadeInDown.duration(220)}>
          <FormSection title="Dates" footer={errors.dates ?? `${formatRange(start, end)} · ${diffDays(end, start) + 1} days`}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <DateField label="Start" value={start} onChange={(d) => { setStart(d); if (end < d) setEnd(d); }} minDate={DEMO_TODAY} style={{ flex: 1 }} />
              <DateField label="End" value={end} onChange={setEnd} minDate={start} style={{ flex: 1 }} />
            </View>
          </FormSection>
          <FormSection title="Delivery">
            <SegmentedField label="Delivery mode" value={mode} onChange={setMode} options={[{ value: 'In-person', label: 'In-person' }, { value: 'Hybrid', label: 'Hybrid' }, { value: 'Virtual', label: 'Virtual' }]} />
            {mode !== 'Virtual' ? <TextField label="Location / venue" value={location} onChangeText={setLocation} placeholder="City and venue" icon="map-pin" required error={touched ? errors.location : undefined} /> : null}
            <SelectField label="Time zone" value={tz} onChange={(v) => setTz(v as TimeZoneId)} icon="globe" options={Object.values(TIMEZONES).map((z) => ({ value: z.id, label: `${z.city} · ${z.abbr}`, detail: z.label }))} />
            <TextField label="Capacity" value={capacity} onChangeText={(s) => setCapacity(s.replace(/[^0-9]/g, ''))} keyboardType="number-pad" suffix="participants" />
          </FormSection>
        </Animated.View>
      ) : null}
      {step === 2 ? (
        <Animated.View entering={FadeInDown.duration(220)}>
          <FormSection title="Programme team" footer="The programme manager is notified and the operational checklist is assigned by role.">
            {[
              { label: 'Programme manager', value: managerId, set: setManagerId, roles: ['programme_manager'] },
              { label: 'Programme owner', value: ownerId, set: setOwnerId, roles: ['senior_management', 'programme_manager'] },
              { label: 'Coordinator', value: coordinatorId, set: setCoordinatorId, roles: ['programme_coordinator', 'programme_manager'] },
            ].map((f) => (
              <SelectField key={f.label} label={f.label} value={f.value} onChange={f.set} options={db.staff.filter((s) => f.roles.includes(s.role)).map((s) => ({ value: s.id, label: s.name, detail: s.title, leading: <Avatar name={s.name} hue={s.avatarHue} size={28} /> }))} />
            ))}
          </FormSection>
        </Animated.View>
      ) : null}
      {step === 3 ? (
        <Animated.View entering={FadeInDown.duration(220)}>
          <FormSection title="Commercial" footer="Figures are illustrative. Budget approval is requested automatically.">
            <TextField label="Contract value" value={contract} onChangeText={(s) => setContract(groupDigits(parseMoney(s)))} prefix="$" keyboardType="number-pad" placeholder="0" />
            <TextField label="Approved budget" value={budget} onChangeText={(s) => setBudget(groupDigits(parseMoney(s)))} prefix="$" keyboardType="number-pad" placeholder="0" helper={parseMoney(contract) ? `Target margin ${(((parseMoney(contract) - parseMoney(budget)) / parseMoney(contract)) * 100).toFixed(1)}%` : undefined} />
          </FormSection>
          <FormSection title="Review">
            <Card style={{ paddingVertical: 4 }}>
              <KeyValue label="Programme" value={name || '—'} />
              <KeyValue label="Client" value={getClient(db, clientId)?.name ?? '—'} />
              <KeyValue label="Type" value={type} />
              <KeyValue label="Dates" value={formatRange(start, end)} />
              <KeyValue label="Delivery" value={`${mode}${mode !== 'Virtual' ? ` · ${location}` : ''}`} />
              <KeyValue label="Manager" value={getStaff(db, managerId)?.name ?? ''} />
              <KeyValue label="Contract" value={money(parseMoney(contract))} last />
            </Card>
          </FormSection>
        </Animated.View>
      ) : null}
    </Screen>
  );
}

function CreatedState({ programmeId }: { programmeId: string }) {
  const db = useDB();
  const p = getProgramme(db, programmeId);
  const taskCount = db.tasks.filter((t) => t.programmeId === programmeId).length;
  const [shown, setShown] = useState(0);
  const steps = ['Programme approved', 'Workspace created', `${getStaff(db, p?.managerId)?.name} assigned as programme manager`, `Operational checklist generated · ${taskCount} tasks`, 'Faculty, logistics, academic and learner requirements opened', 'Readiness monitoring started'];
  useEffect(() => {
    if (shown >= steps.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), 380);
    return () => clearTimeout(t);
  }, [shown, steps.length]);
  return (
    <Screen title="Programme created" back="close" large={false} onBack={() => router.back()}>
      <View style={{ alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 20 }}>
        <View style={{ width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="circle-check-big" size={56} tone="success" />
        </View>
        <Text variant="title2" align="center">
          {p?.name}
        </Text>
        <Text variant="callout" tone="secondary" align="center">
          ProgrammeOS set up the workspace for you.
        </Text>
      </View>
      <Card padding="lg" style={{ gap: 14 }}>
        {steps.map((s, i) => (
          <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: i < shown ? 1 : 0.35 }}>
            <Icon name={i < shown ? 'circle-check' : 'circle-dashed'} size={20} tone={i < shown ? 'success' : 'tertiary'} />
            <Text variant="callout" style={{ flex: 1 }}>
              {s}
            </Text>
          </View>
        ))}
      </Card>
      <Button title="Open workspace" size="lg" fullWidth style={{ marginTop: 20 }} onPress={() => { router.back(); setTimeout(() => router.push(`/programme/${programmeId}` as Href), 250); }} disabled={shown < steps.length} />
      <Button title="View generated tasks" variant="plain" fullWidth style={{ marginTop: 6 }} onPress={() => { router.back(); setTimeout(() => router.push(`/programme/${programmeId}/tasks` as Href), 250); }} />
    </Screen>
  );
}

export function EditProgrammeScreen() {
  const db = useDB();
  const actions = useActions();
  const dialog = useDialog();
  const toast = useToast();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = getProgramme(db, id);
  const [form, setForm] = useState(() => ({
    name: p?.name ?? '',
    location: p?.location ?? '',
    start: p?.startDate ?? DEMO_TODAY,
    end: p?.endDate ?? DEMO_TODAY,
    mode: (p?.deliveryMode ?? 'In-person') as DeliveryMode,
    managerId: p?.managerId ?? '',
    capacity: String(p?.capacity ?? ''),
    description: p?.description ?? '',
  }));
  const [saved, setSaved] = useState(false);
  const dirty = !!p && !saved && (form.name !== p.name || form.location !== p.location || form.start !== p.startDate || form.end !== p.endDate || form.mode !== p.deliveryMode || form.managerId !== p.managerId || form.capacity !== String(p.capacity) || form.description !== p.description);

  usePreventRemove(dirty, ({ data }) => {
    dialog.confirm({ title: 'Discard changes?', message: 'You have unsaved changes to this programme.', confirmLabel: 'Discard', destructive: true, icon: 'triangle-alert', cancelLabel: 'Keep editing' }).then(({ confirmed }) => {
      if (confirmed) navigation.dispatch(data.action);
    });
  });

  if (!p) return null;
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const save = () => {
    actions.updateProgramme(p.id, { name: form.name.trim(), location: form.location, startDate: form.start, endDate: form.end, deliveryMode: form.mode, managerId: form.managerId, capacity: Number(form.capacity) || p.capacity, description: form.description });
    actions.log(p.id, 'status_changed', 'updated programme details');
    setSaved(true);
    toast.show({ message: 'Programme updated' });
    setTimeout(() => router.back(), 10);
  };
  return (
    <Screen title="Edit programme" back="close" large={false} footer={<Button title={dirty ? 'Save changes' : 'No changes'} onPress={save} disabled={!dirty || !form.name.trim()} fullWidth style={{ flex: 1 }} />}>
      {dirty ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#D9A441' }} />
          <Text variant="footnote" tone="warning">
            Unsaved changes
          </Text>
        </View>
      ) : null}
      <FormSection title="Details">
        <TextField label="Programme name" value={form.name} onChangeText={(v) => set('name', v)} required error={!form.name.trim() ? 'Name is required' : undefined} />
        <TextField label="Description" value={form.description} onChangeText={(v) => set('description', v)} multiline />
      </FormSection>
      <FormSection title="Dates & delivery">
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <DateField label="Start" value={form.start} onChange={(v) => set('start', v)} style={{ flex: 1 }} />
          <DateField label="End" value={form.end} onChange={(v) => set('end', v)} minDate={form.start} style={{ flex: 1 }} />
        </View>
        <SegmentedField label="Delivery mode" value={form.mode} onChange={(v) => set('mode', v)} options={[{ value: 'In-person', label: 'In-person' }, { value: 'Hybrid', label: 'Hybrid' }, { value: 'Virtual', label: 'Virtual' }]} />
        <TextField label="Location" value={form.location} onChangeText={(v) => set('location', v)} icon="map-pin" />
        <TextField label="Capacity" value={form.capacity} onChangeText={(v) => set('capacity', v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" suffix="participants" />
      </FormSection>
      <FormSection title="Team">
        <SelectField label="Programme manager" value={form.managerId} onChange={(v) => set('managerId', v)} options={db.staff.filter((s) => s.role === 'programme_manager').map((s) => ({ value: s.id, label: s.name, detail: s.title, leading: <Avatar name={s.name} hue={s.avatarHue} size={28} /> }))} />
      </FormSection>
    </Screen>
  );
}
