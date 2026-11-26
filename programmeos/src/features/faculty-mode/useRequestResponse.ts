import { useDialog, useToast } from '@/components';
import type { FacultyAssignment } from '@/data/models';
import { getFaculty, getProgramme } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { formatRange } from '@/utils/dates';

/** Accept / decline a teaching request, notifying the programme team (simulated). */
export function useRequestResponse() {
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  return async (a: FacultyAssignment, accept: boolean) => {
    const p = getProgramme(db, a.programmeId);
    const me = getFaculty(db, a.facultyId);
    if (!p || !me) return;
    const who = `${me.honorific} ${me.name}`;
    if (accept) {
      actions.setAssignmentStatus(a.id, 'Confirmed');
      actions.log(a.programmeId, 'faculty_assigned', `accepted the teaching request for ${p.shortName}`, me.id);
      actions.notify({ category: 'Faculty', title: 'Teaching request accepted', body: `${who} accepted ${p.name}.`, audience: 'staff', programmeId: p.id, route: `/programme/${p.id}/faculty`, actorName: who });
      toast.show({ message: 'Request accepted', detail: `Your agreement for ${p.shortName} will follow from Faculty Operations.`, icon: 'circle-check' });
      return;
    }
    const { confirmed, text } = await dialog.confirm({ title: 'Decline this request?', message: `${p.name} · ${formatRange(p.startDate, p.endDate)}`, confirmLabel: 'Decline', destructive: true, icon: 'circle-x', input: { placeholder: 'Optional note to the programme team' } });
    if (!confirmed) return;
    actions.setAssignmentStatus(a.id, 'Declined');
    actions.notify({ category: 'Faculty', title: 'Teaching request declined', body: `${who} declined ${p.name}${text ? `: “${text}”` : '.'}`, audience: 'staff', programmeId: p.id, route: `/programme/${p.id}/faculty`, actorName: who });
    toast.show({ message: 'Request declined', detail: 'The programme team has been notified.', tone: 'neutral', icon: 'circle-x' });
  };
}
