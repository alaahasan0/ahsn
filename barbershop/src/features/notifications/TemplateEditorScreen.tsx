import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Badge, Button, Chip, EmptyState, Header, Input, ListRow, Screen, Section, Switch, Text, useToast } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useActions, useAppState } from '@/store/AppStore';

import { MessagePreview } from './MessagePreview';
import { renderTemplate, smsSegments, TEMPLATE_VARIABLES } from './renderTemplate';

export default function TemplateEditorScreen() {
  const { t, tp } = useI18n();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { templates, salon, customers, services, barbers } = useAppState();
  const actions = useActions();
  const tpl = templates.find((x) => x.id === id);
  const [body, setBody] = useState(tpl?.body ?? '');
  const [active, setActive] = useState(tpl?.active ?? true);
  const [selection, setSelection] = useState({ start: (tpl?.body ?? '').length, end: (tpl?.body ?? '').length });

  if (!tpl) {
    return (
      <Screen header={<Header title={t('notifications.templates.editorTitle')} backFallback="/notifications/templates" />}>
        <EmptyState icon="file-text" title={t('notifications.templates.notFound')} />
      </Screen>
    );
  }

  const rendered = renderTemplate({ body, language: tpl.language }, { salon, customer: customers[0], service: services[0], barber: barbers[1] });
  const insert = (v: string) => {
    const token = `{{${v}}}`;
    const next = body.slice(0, selection.start) + token + body.slice(selection.end);
    setBody(next);
    const pos = selection.start + token.length;
    setSelection({ start: pos, end: pos });
  };

  return (
    <Screen
      header={<Header title={t(`notifications.templates.events.${tpl.event}`)} subtitle={t('notifications.templates.editorTitle')} backFallback="/notifications/templates" />}
      footer={
        <Button
          label={t('common.actions.saveChanges')}
          size="lg"
          disabled={!body.trim()}
          onPress={() => {
            actions.upsertTemplate({ ...tpl, body, active });
            toast(t('notifications.templates.saved'));
            router.back();
          }}
        />
      }
    >
      <View style={{ gap: 24, paddingTop: 8 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Badge label={tpl.channel === 'whatsapp' ? t('notifications.settings.whatsapp') : t('notifications.settings.sms')} icon={tpl.channel === 'whatsapp' ? 'ion:logo-whatsapp' : 'message-square'} size="md" />
          <Badge label={tpl.language === 'ar' ? t('notifications.templates.arabic') : t('notifications.templates.english')} tone="info" size="md" />
        </View>
        <Text variant="footnote" tone="secondary">
          {t(`notifications.templates.eventHints.${tpl.event}`)}
        </Text>

        <View style={{ gap: 10 }}>
          <Input
            label={t('notifications.templates.body')}
            value={body}
            onChangeText={setBody}
            multiline
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
            hint={tpl.channel === 'sms' ? `${t('notifications.templates.characters', { count: rendered.length })} · ${tp('notifications.templates.segments', smsSegments(rendered))}` : t('notifications.templates.characters', { count: rendered.length })}
          />
          <Text variant="subhead" tone="secondary">
            {t('notifications.templates.variables')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TEMPLATE_VARIABLES.map((v) => (
              <Chip key={v} size="sm" icon="plus" label={t(`notifications.templates.variableLabels.${v}`)} onPress={() => insert(v)} />
            ))}
          </View>
        </View>

        <Section title={t('notifications.templates.preview')} subtitle={t('notifications.templates.previewHint')}>
          <MessagePreview text={rendered} channel={tpl.channel} language={tpl.language} senderName={salon.name[tpl.language]} />
        </Section>

        <Section card>
          <ListRow icon="power" title={active ? t('notifications.templates.active') : t('notifications.templates.inactive')} trailing={<Switch value={active} onValueChange={setActive} />} />
          <ListRow icon="send" title={t('notifications.templates.sendTest')} onPress={() => toast({ message: t('notifications.templates.sendTest'), description: t('common.toast.simulated'), icon: 'send' })} />
        </Section>
      </View>
    </Screen>
  );
}
