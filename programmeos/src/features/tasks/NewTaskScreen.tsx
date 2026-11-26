import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Button, Chip, DateField, FormSection, Screen, SegmentedField, SelectField, Text, TextField, useToast } from '@/components';
import type { Priority, Task } from '@/data/models';
import { getProgramme, programmePhase } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { addDays, DEMO_TODAY, formatDate } from '@/utils/dates';

import { TASK_CATEGORY_ICON } from '../shared/helpers';
import { CATEGORIES, guessCategory } from './taskFilters';

const QUICK_DUE = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'Next week', days: 7 },
];

/** Short task form with smart defaults — most tasks need only a title. */
export default function NewTaskScreen() {
  const params = useLocalSearchParams<{ programme?: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { userId } = useSession();

  const active = db.programmes.filter((p) => !p.cancelled && !p.archived);
  const defaultProgramme = (params.programme && getProgramme(db, params.programme)?.id) || active.find((p) => p.managerId === userId && programmePhase(p) === 'upcoming')?.id || active.find((p) => programmePhase(p) === 'upcoming')?.id || active[0]?.id;

  const [title, setTitle] = useState('');
  const [programmeId, setProgrammeId] = useState(defaultProgramme);
  const [ownerId, setOwnerId] = useState(userId);
  const [dueDate, setDueDate] = useState(addDays(DEMO_TODAY, 3));
  const [priority, setPriority] = useState<Priority>('Medium');
  const [category, setCategory] = useState<Task['category'] | undefined>();
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [dependsOn, setDependsOn] = useState<string>('none');
  const [description, setDescription] = useState('');
  const [showMore, setShowMore] = useState(false);

  const guessed = guessCategory(title);
  const effectiveCategory = categoryTouched ? category : (guessed ?? category ?? 'Operations');
  const deps = db.tasks.filter((t) => t.programmeId === programmeId && t.status !== 'Done');
  const valid = title.trim().length > 2 && !!programmeId;

  const create = () => {
    if (!valid || !programmeId) return;
    const id = actions.createTask({
      title: title.trim(),
      programmeId,
      ownerId,
      dueDate,
      priority,
      category: effectiveCategory ?? 'Operations',
      description: description.trim(),
      dependsOn: dependsOn !== 'none' ? [dependsOn] : [],
    });
    actions.log(programmeId, 'status_changed', `created the task “${title.trim()}”`, userId);
    if (ownerId !== userId) actions.notify({ category: 'Tasks', title: 'You were assigned a task', body: title.trim(), programmeId, route: `/task/${id}`, audience: 'staff' });
    toast.show({ message: 'Task created', detail: `${title.trim()} · due ${formatDate(dueDate, { year: false })}` });
    router.replace(`/task/${id}`);
  };

  return (
    <Screen title="New task" back="close" large footer={<Button title="Create task" icon="plus" onPress={create} disabled={!valid} style={{ flex: 1 }} />}>
      <TextField label="What needs to happen?" value={title} onChangeText={setTitle} placeholder="e.g. Confirm coach for the site visit" autoFocus required />
      {guessed && !categoryTouched ? (
        <Text variant="footnote" tone="tertiary" style={{ marginTop: 6 }}>
          Looks like a {guessed.toLowerCase()} task — category set automatically.
        </Text>
      ) : null}

      <FormSection title="Assignment">
        <SelectField
          label="Programme"
          value={programmeId}
          icon="layers"
          onChange={(v) => {
            setProgrammeId(v);
            setDependsOn('none');
          }}
          options={active.map((p) => ({ value: p.id, label: p.name, detail: `${p.code} · ${formatDate(p.startDate, { year: false })}` }))}
        />
        <SelectField
          label="Owner"
          value={ownerId}
          onChange={setOwnerId}
          options={db.staff.map((st) => ({ value: st.id, label: st.id === userId ? `${st.name} (me)` : st.name, detail: st.title, leading: <Avatar name={st.name} hue={st.avatarHue} size={28} /> }))}
        />
      </FormSection>

      <FormSection title="When">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {QUICK_DUE.map((q) => (
            <Chip key={q.label} label={q.label} selected={dueDate === addDays(DEMO_TODAY, q.days)} onPress={() => setDueDate(addDays(DEMO_TODAY, q.days))} />
          ))}
        </View>
        <DateField label="Due date" value={dueDate} onChange={setDueDate} minDate={DEMO_TODAY} />
        <SegmentedField<Priority>
          label="Priority"
          value={priority}
          onChange={setPriority}
          options={[
            { value: 'Urgent', label: 'Urgent' },
            { value: 'High', label: 'High' },
            { value: 'Medium', label: 'Medium' },
            { value: 'Low', label: 'Low' },
          ]}
        />
      </FormSection>

      <FormSection title="Category">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={c}
              icon={TASK_CATEGORY_ICON[c]}
              selected={effectiveCategory === c}
              onPress={() => {
                setCategory(c);
                setCategoryTouched(true);
              }}
            />
          ))}
        </View>
      </FormSection>

      {showMore ? (
        <FormSection title="More detail">
          <SelectField
            label="Depends on"
            value={dependsOn}
            onChange={setDependsOn}
            helper="The task stays locked until this one is done."
            options={[{ value: 'none', label: 'No dependency' }, ...deps.map((t) => ({ value: t.id, label: t.title, detail: `${t.status} · due ${formatDate(t.dueDate, { year: false })}` }))]}
          />
          <TextField label="Description" value={description} onChangeText={setDescription} placeholder="Context, links or acceptance criteria" multiline />
        </FormSection>
      ) : (
        <Button title="Add dependency or description" variant="plain" icon="plus" onPress={() => setShowMore(true)} style={{ alignSelf: 'flex-start', marginTop: 18 }} />
      )}
    </Screen>
  );
}
