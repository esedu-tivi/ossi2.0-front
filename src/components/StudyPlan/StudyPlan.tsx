// Study plan (HOKS) of one student, built from real data: the qualification and
// peruste the student studies on, their tutkinnon osat with ammattitaitovaatimukset,
// and the teachers' teemat and projects with the student's own project statuses.
// Used by the student (StudentStudies) and by the teacher (StudentInfo > HOKS).

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ProjectStatus = 'WORKING' | 'RETURNED' | 'ACCEPTED' | 'REJECTED';

export interface StudyPlanStudent {
  id: string;
  firstName: string;
  lastName: string;
  groupId?: string | null;
  qualificationCompletion?: 'FULL_COMPLETION' | 'PARTIAL_COMPLETION' | null;
  studyingQualification?: {
    id: number;
    name?: string | null;
    diaarinumero?: string | null;
    validFrom?: string | null;
    validUntil?: string | null;
    transitionEndsAt?: string | null;
  } | null;
  studyingQualificationTitle?: {
    id?: number | null;
    name?: string | null;
    mandatoryUnits?: { id: number; name: string }[] | null;
  } | null;
  assignedQualificationUnits?: {
    id: number;
    name: string;
    scope?: number | null;
    competenceRequirementGroups: {
      id: number;
      title: string;
      requirements: { id: number; description: string }[];
    }[];
    parts: {
      id: number;
      name: string;
      projects: { id: number; name: string }[];
    }[];
  }[] | null;
  assignedProjects?: { projectId?: string | null; projectStatus?: ProjectStatus | null }[] | null;
}

const statusLabel: Record<ProjectStatus, string> = {
  WORKING: 'Työn alla',
  RETURNED: 'Palautettu',
  ACCEPTED: 'Hyväksytty',
  REJECTED: 'Hylätty',
};

const statusClass: Record<ProjectStatus, string> = {
  WORKING: 'bg-amber-100 text-amber-900',
  RETURNED: 'bg-sky-100 text-sky-900',
  ACCEPTED: 'bg-green-100 text-green-900',
  REJECTED: 'bg-red-100 text-red-900',
};

// ePerusteet dates are midnight Finnish time; show them as Finnish dates.
const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('fi-FI', { timeZone: 'Europe/Helsinki' }) : null;

function PerusteInfo({ qualification }: { qualification: NonNullable<StudyPlanStudent['studyingQualification']> }) {
  const validFrom = formatDate(qualification.validFrom);
  const validUntil = formatDate(qualification.validUntil);
  const transitionEnds = formatDate(qualification.transitionEndsAt);
  const expired = qualification.validUntil ? new Date(qualification.validUntil) < new Date() : false;

  return (
    <div className="space-y-1 text-sm text-primary-foreground/90">
      <p>
        Peruste {qualification.diaarinumero ?? qualification.id}
        {validFrom && <>, voimassa {validFrom} alkaen</>}
        {validUntil && <> – {validUntil}</>}
      </p>
      {expired && transitionEnds && (
        <p className="font-semibold">Siirtymäajalla: tutkinto on suoritettava tämän perusteen mukaan viimeistään {transitionEnds}.</p>
      )}
    </div>
  );
}

const StudyPlan = ({ student }: { student: StudyPlanStudent }) => {
  const qualification = student.studyingQualification;
  const title = student.studyingQualificationTitle?.name ? student.studyingQualificationTitle : null;
  const units = student.assignedQualificationUnits ?? [];

  const statusByProject = new Map(
    (student.assignedProjects ?? [])
      .filter(project => project.projectId && project.projectStatus)
      .map(project => [String(project.projectId), project.projectStatus as ProjectStatus]),
  );

  const assignedUnitIds = new Set(units.map(unit => unit.id));
  const titleUnitsNotAssigned = (title?.mandatoryUnits ?? []).filter(unit => !assignedUnitIds.has(unit.id));
  const totalScope = units.reduce((sum, unit) => sum + (unit.scope ?? 0), 0);
  const acceptedProjects = [...statusByProject.values()].filter(status => status === 'ACCEPTED').length;

  return (
    <Card>
      <CardHeader className="bg-primary rounded-t-xl text-center">
        <CardTitle className="space-y-1 text-primary-foreground">
          <p className="text-lg font-bold">Opintosuunnitelma</p>
          <p className="text-2xl">
            {student.firstName} {student.lastName}
            {student.groupId && <span className="font-normal"> ({student.groupId})</span>}
          </p>
          {qualification ? (
            <>
              <p className="text-lg">{qualification.name}</p>
              <PerusteInfo qualification={qualification} />
            </>
          ) : (
            <p className="text-base font-normal">Tutkintoa ei ole vielä valittu.</p>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded border-2 bg-muted px-3 py-2 font-semibold">
            {student.qualificationCompletion === 'PARTIAL_COMPLETION'
              ? 'Osatutkinnon suorittaja'
              : student.qualificationCompletion === 'FULL_COMPLETION'
                ? 'Täyden tutkinnon suorittaja'
                : 'Suoritustapa valitsematta'}
          </span>
          <span className="rounded border-2 bg-muted px-3 py-2 font-semibold">
            Tutkintonimike: {title?.name ?? 'ei valittu'}
          </span>
          <span className="rounded border-2 bg-muted px-3 py-2 font-semibold">
            Tutkinnon osia: {units.length} ({totalScope} osp)
          </span>
          <span className="rounded border-2 bg-muted px-3 py-2 font-semibold">
            Projekteja hyväksytty: {acceptedProjects}/{statusByProject.size}
          </span>
        </div>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Tutkinnon osat</h2>
          {units.length === 0 ? (
            <p className="text-sm text-muted-foreground">Opiskelijalle ei ole vielä liitetty tutkinnon osia.</p>
          ) : (
            <Accordion type="multiple" className="rounded-lg border px-4">
              {units.map(unit => {
                const projects = unit.parts.flatMap(part => part.projects);
                const accepted = projects.filter(p => statusByProject.get(String(p.id)) === 'ACCEPTED').length;

                return (
                  <AccordionItem key={unit.id} value={String(unit.id)}>
                    <AccordionTrigger>
                      <span className="flex flex-1 flex-wrap items-center justify-between gap-2 pr-2">
                        <span className="font-semibold">{unit.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {unit.scope != null && <>{unit.scope} osp · </>}
                          projektit {accepted}/{projects.length}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div>
                        <h3 className="mb-2 font-semibold">Teemat ja projektit</h3>
                        {unit.parts.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Tutkinnon osalle ei ole vielä teemoja.</p>
                        ) : (
                          <ul className="space-y-2">
                            {unit.parts.map(part => (
                              <li key={part.id} className="rounded border p-3">
                                <p className="font-medium">{part.name}</p>
                                {part.projects.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">Ei projekteja.</p>
                                ) : (
                                  <ul className="mt-2 space-y-1">
                                    {part.projects.map(project => {
                                      const status = statusByProject.get(String(project.id));
                                      return (
                                        <li key={project.id} className="flex items-center justify-between gap-2 text-sm">
                                          <span>{project.name}</span>
                                          {status ? (
                                            <Badge className={statusClass[status]}>{statusLabel[status]}</Badge>
                                          ) : (
                                            <Badge variant="outline">Ei aloitettu</Badge>
                                          )}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div>
                        <h3 className="mb-2 font-semibold">Ammattitaitovaatimukset</h3>
                        {unit.competenceRequirementGroups.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Ei ammattitaitovaatimuksia.</p>
                        ) : (
                          unit.competenceRequirementGroups.map(group => (
                            <div key={group.id} className="mb-3">
                              <p className="text-sm font-medium">{group.title}</p>
                              <ul className="ml-5 list-disc text-sm">
                                {group.requirements.map(requirement => (
                                  <li key={requirement.id}>{requirement.description}</li>
                                ))}
                              </ul>
                            </div>
                          ))
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </section>

        {titleUnitsNotAssigned.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold">Tutkintonimikkeen pakolliset osat</h2>
            <ul className="space-y-1">
              {titleUnitsNotAssigned.map(unit => (
                <li key={unit.id} className="rounded border bg-muted/40 px-3 py-2 text-sm">{unit.name}</li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-xs text-muted-foreground">
          Valinnaiset tutkinnon osat ja tutkinnon osien suoritusmerkinnät eivät ole vielä järjestelmässä.
        </p>
      </CardContent>
    </Card>
  );
};

export default StudyPlan;
