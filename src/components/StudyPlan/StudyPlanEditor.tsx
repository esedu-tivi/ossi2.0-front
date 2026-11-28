// Teacher's controls for a student's study plan (HOKS):
// - full qualification: choose the tutkintonimike (path); its mandatory units from
//   ePerusteet replace the previous title's units
// - partial qualification: add and remove individual units of the student's peruste

import { useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { Route, Plus, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ASSIGN_QUALIFICATION_UNIT_TO_STUDENT,
  SET_STUDENT_QUALIFICATION_TITLE,
  UNASSIGN_QUALIFICATION_UNIT_FROM_STUDENT,
} from '@/graphql/GetStudyPlan';
import type { StudyPlanStudent } from './StudyPlan';

interface UnitOption { id: number; name: string; scope?: number | null; isMandatory?: boolean | null }
interface TitleOption { id: number; name: string; mandatoryUnits: { id: number; name: string }[] }

export interface EditableStudent extends StudyPlanStudent {
  studyingQualification?: (NonNullable<StudyPlanStudent['studyingQualification']> & {
    titles?: TitleOption[];
    units?: UnitOption[];
  }) | null;
}

interface UpdateResult { success: boolean; message?: string | null }

const refetch = { refetchQueries: ['StudentStudyPlan'], awaitRefetchQueries: true };

const StudyPlanEditor = ({ student }: { student: EditableStudent }) => {
  const qualification = student.studyingQualification;
  const [error, setError] = useState<string | null>(null);

  const [setTitle, { loading: settingTitle }] = useMutation(SET_STUDENT_QUALIFICATION_TITLE, refetch);
  const [assignUnit, { loading: assigning }] = useMutation(ASSIGN_QUALIFICATION_UNIT_TO_STUDENT, refetch);
  const [unassignUnit, { loading: unassigning }] = useMutation(UNASSIGN_QUALIFICATION_UNIT_FROM_STUDENT, refetch);

  const run = async (action: () => Promise<{ data?: unknown }>) => {
    setError(null);
    try {
      const { data } = await action();
      const result = data ? Object.values(data as Record<string, UpdateResult>)[0] : undefined;
      if (!result?.success) setError(result?.message ?? 'Tallennus epäonnistui.');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (!qualification) {
    return (
      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          Opiskelija ei ole vielä kirjautunut ja valinnut suoritustapaa, joten opintopolkua ei voi vielä muokata.
        </CardContent>
      </Card>
    );
  }

  const busy = settingTitle || assigning || unassigning;
  const props = { student, busy, run, setTitle, assignUnit, unassignUnit };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Route className="size-5" />
          Muokkaa opintopolkua
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {student.qualificationCompletion === 'FULL_COMPLETION' ? (
          <TitleChooser {...props} />
        ) : (
          <UnitChooser {...props} />
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
};

type Mutate = (options: { variables: Record<string, string> }) => Promise<{ data?: unknown }>;

interface ChooserProps {
  student: EditableStudent;
  busy: boolean;
  run: (action: () => Promise<{ data?: unknown }>) => Promise<void>;
  setTitle: Mutate;
  assignUnit: Mutate;
  unassignUnit: Mutate;
}

function TitleChooser({ student, busy, run, setTitle }: ChooserProps) {
  const titles = student.studyingQualification?.titles ?? [];
  const units = student.studyingQualification?.units;
  const currentTitleId = student.studyingQualificationTitle?.id ?? null;
  const [selected, setSelected] = useState<string>(currentTitleId != null ? String(currentTitleId) : '');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const assigned = useMemo(() => new Set((student.assignedQualificationUnits ?? []).map(u => u.id)), [student.assignedQualificationUnits]);
  const selectedTitle = titles.find(t => String(t.id) === selected);
  const currentTitle = titles.find(t => t.id === currentTitleId);

  // Mirrors the backend: add the new title's mandatory units; remove the previous
  // title's mandatory units unless the qualification or the new title needs them.
  const change = useMemo(() => {
    if (!selectedTitle) return { add: [], remove: [] };
    const qualificationMandatory = new Set((units ?? []).filter(u => u.isMandatory).map(u => u.id));
    const newUnits = new Set(selectedTitle.mandatoryUnits.map(u => u.id));
    return {
      add: selectedTitle.mandatoryUnits.filter(u => !assigned.has(u.id)),
      remove: (currentTitle?.mandatoryUnits ?? []).filter(u => assigned.has(u.id) && !newUnits.has(u.id) && !qualificationMandatory.has(u.id)),
    };
  }, [selectedTitle, currentTitle, units, assigned]);

  const save = () => {
    setConfirmOpen(false);
    void run(() => setTitle({ variables: { studentId: student.id, qualificationTitleId: selected } }));
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Tutkintonimike</p>
      <p className="text-sm text-muted-foreground">
        Tutkintonimike määrää opiskelijan polun. Nimikkeen pakolliset tutkinnon osat tulevat ePerusteista ja lisätään
        opiskelijalle; vaihdettaessa edellisen nimikkeen pakolliset osat poistetaan.
      </p>
      <div className="flex flex-wrap gap-2">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-72">
            <SelectValue placeholder="Valitse tutkintonimike" />
          </SelectTrigger>
          <SelectContent>
            {titles.map(title => (
              <SelectItem key={title.id} value={String(title.id)}>{title.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          disabled={busy || !selected || selected === String(currentTitleId)}
          onClick={() => setConfirmOpen(true)}
        >
          {currentTitleId != null ? 'Vaihda tutkintonimike' : 'Aseta tutkintonimike'}
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {currentTitle ? `Vaihdetaanko ${currentTitle.name} → ${selectedTitle?.name}?` : `Asetetaanko tutkintonimikkeeksi ${selectedTitle?.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>Opiskelijan HOKS muuttuu seuraavasti.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 text-sm">
            <UnitList label="Lisätään" units={change.add} />
            <UnitList label="Poistetaan" units={change.remove} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Peruuta</AlertDialogCancel>
            <AlertDialogAction onClick={save}>Tallenna</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UnitList({ label, units }: { label: string; units: { id: number; name: string }[] }) {
  return (
    <div>
      <p className="font-medium">{label}:</p>
      {units.length === 0 ? (
        <p className="text-muted-foreground">ei tutkinnon osia</p>
      ) : (
        <ul className="ml-5 list-disc">
          {units.map(unit => <li key={unit.id}>{unit.name}</li>)}
        </ul>
      )}
    </div>
  );
}

function UnitChooser({ student, busy, run, assignUnit, unassignUnit }: ChooserProps) {
  const options = student.studyingQualification?.units ?? [];
  const assignedUnits = student.assignedQualificationUnits ?? [];
  const assigned = new Set(assignedUnits.map(u => u.id));
  const available = options.filter(u => !assigned.has(u.id));
  const [selected, setSelected] = useState('');
  const [toRemove, setToRemove] = useState<{ id: number; name: string } | null>(null);

  const add = () => {
    const unitId = selected;
    setSelected('');
    void run(() => assignUnit({ variables: { studentId: student.id, qualificationUnitId: unitId } }));
  };

  const remove = () => {
    const unit = toRemove;
    setToRemove(null);
    if (unit) void run(() => unassignUnit({ variables: { studentId: student.id, qualificationUnitId: String(unit.id) } }));
  };

  const groups = [
    { label: 'Tutkinnon pakolliset osat', units: available.filter(u => u.isMandatory) },
    { label: 'Muut tutkinnon osat', units: available.filter(u => !u.isMandatory) },
  ].filter(group => group.units.length > 0);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Osatutkinnon suorittaja: valitse opiskelijalle suoritettavat tutkinnon osat opiskelijan perusteesta.
      </p>

      {assignedUnits.length === 0 ? (
        <p className="text-sm">Opiskelijalle ei ole vielä valittu tutkinnon osia.</p>
      ) : (
        <ul className="space-y-1">
          {assignedUnits.map(unit => (
            <li key={unit.id} className="flex items-center justify-between gap-2 rounded border px-3 py-2 text-sm">
              <span>{unit.name}{unit.scope != null && <span className="text-muted-foreground"> · {unit.scope} osp</span>}</span>
              <Button variant="ghost" size="sm" disabled={busy} onClick={() => setToRemove(unit)} aria-label={`Poista ${unit.name}`}>
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-96 max-w-full">
            <SelectValue placeholder={available.length ? 'Valitse lisättävä tutkinnon osa' : 'Kaikki tutkinnon osat on valittu'} />
          </SelectTrigger>
          <SelectContent>
            {groups.map(group => (
              <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.units.map(unit => (
                  <SelectItem key={unit.id} value={String(unit.id)}>
                    {unit.name}{unit.scope != null ? ` (${unit.scope} osp)` : ''}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <Button disabled={busy || !selected} onClick={add}>
          <Plus className="size-4" />
          Lisää
        </Button>
      </div>

      <ConfirmDialog
        open={toRemove !== null}
        title={`Poistetaanko ${toRemove?.name ?? ''}?`}
        description="Tutkinnon osa poistuu opiskelijan HOKSista. Opiskelijan projektit säilyvät."
        confirmText="Poista"
        onConfirm={remove}
        onCancel={() => setToRemove(null)}
      />
    </div>
  );
}

export default StudyPlanEditor;
