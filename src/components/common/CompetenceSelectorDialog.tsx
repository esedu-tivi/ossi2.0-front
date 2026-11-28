// Selects the osaamiset (ammattitaitovaatimukset from ePerusteet) that a project
// develops. The options come from the qualification units of the project's themes,
// grouped by unit and osaamisryhmä.

import { useEffect, useMemo, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GET_COMPETENCE_REQUIREMENTS } from '@/graphql/GetCompetenceRequirements';

export interface SelectedCompetence {
  id: string;
  name: string;
  description: string;
}

interface Requirement {
  id: string | number;
  description: string;
}

interface Group {
  id: string | number;
  title: string;
  requirements: Requirement[];
}

interface Unit {
  id: string | number;
  name: string;
  competenceRequirementGroups: Group[];
}

interface CompetenceSelectorDialogProps {
  open: boolean;
  /** Ids of the project's themes; their units' osaamiset are offered. */
  partIds: string[];
  selected: { id: string | number; description?: string; name?: string }[];
  onSave: (selected: SelectedCompetence[]) => void;
  onClose: () => void;
}

const toSelected = (requirement: { id: string | number; description?: string; name?: string }): SelectedCompetence => {
  const description = requirement.description ?? requirement.name ?? '';
  return { id: String(requirement.id), name: description, description };
};

const CompetenceSelectorDialog = ({ open, partIds, selected, onSave, onClose }: CompetenceSelectorDialogProps) => {
  const client = useApolloClient();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selection, setSelection] = useState<Map<string, SelectedCompetence>>(new Map());

  const partKey = partIds.join(',');

  useEffect(() => {
    if (!open) return;
    setSelection(new Map(selected.map(item => [String(item.id), toSelected(item)])));
    setSearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens
  }, [open]);

  useEffect(() => {
    if (!open || partIds.length === 0) {
      setUnits([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all(partIds.map(partId => client.query({ query: GET_COMPETENCE_REQUIREMENTS, variables: { partId } })))
      .then(results => {
        if (cancelled) return;
        const byId = new Map<string, Unit>();
        for (const { data } of results) {
          const unit: Unit | undefined = data?.part?.part?.parentQualificationUnit;
          if (unit) byId.set(String(unit.id), unit);
        }
        setUnits([...byId.values()]);
      })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : String(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- partKey identifies partIds
  }, [open, partKey, client]);

  const term = search.trim().toLowerCase();
  const matches = (text: string) => !term || text.toLowerCase().includes(term);

  const offeredIds = useMemo(
    () => new Set(units.flatMap(unit => unit.competenceRequirementGroups.flatMap(group => group.requirements.map(r => String(r.id))))),
    [units],
  );
  // Selected osaamiset that are not in the themes' units (e.g. a theme was removed).
  const others = [...selection.values()].filter(item => !offeredIds.has(item.id) && matches(item.description));

  const toggle = (requirement: Requirement, checked: boolean) => {
    setSelection(prev => {
      const next = new Map(prev);
      if (checked) next.set(String(requirement.id), toSelected(requirement));
      else next.delete(String(requirement.id));
      return next;
    });
  };

  const toggleGroup = (requirements: Requirement[], checked: boolean) => {
    setSelection(prev => {
      const next = new Map(prev);
      for (const requirement of requirements) {
        if (checked) next.set(String(requirement.id), toSelected(requirement));
        else next.delete(String(requirement.id));
      }
      return next;
    });
  };

  const requirementRow = (requirement: Requirement) => {
    const id = `competence-${requirement.id}`;
    return (
      <li key={requirement.id} className="flex items-start gap-3 py-1.5">
        <Checkbox
          id={id}
          className="mt-0.5"
          checked={selection.has(String(requirement.id))}
          onCheckedChange={checked => toggle(requirement, checked === true)}
        />
        <label htmlFor={id} className="cursor-pointer text-sm leading-snug">{requirement.description}</label>
      </li>
    );
  };

  const visibleUnits = units
    .map(unit => ({
      ...unit,
      groups: unit.competenceRequirementGroups
        .map(group => ({
          ...group,
          visible: matches(group.title) ? group.requirements : group.requirements.filter(r => matches(r.description)),
        }))
        .filter(group => group.visible.length > 0),
    }))
    .filter(unit => unit.groups.length > 0);

  return (
    <Dialog open={open} onOpenChange={next => { if (!next) onClose(); }}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="rounded-t-lg bg-primary px-6 py-4 text-primary-foreground">
          <DialogTitle className="text-primary-foreground">Valitse osaamiset</DialogTitle>
          <DialogDescription className="text-primary-foreground/80">
            Ammattitaitovaatimukset, joita projektin tekeminen kehittää. Osaamiset tulevat teemojen tutkinnon osista (ePerusteet).
          </DialogDescription>
        </DialogHeader>

        <div className="border-b bg-muted/50 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Hae osaamista"
              aria-label="Hae osaamista"
              value={search}
              onChange={event => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
          {partIds.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Valitse projektille ensin teema. Osaamiset valitaan teeman tutkinnon osan ammattitaitovaatimuksista.
            </p>
          )}
          {loading && <p className="text-sm text-muted-foreground">Ladataan osaamisia...</p>}
          {error && <p className="text-sm text-destructive">Osaamisten haku epäonnistui: {error}</p>}
          {!loading && !error && partIds.length > 0 && visibleUnits.length === 0 && others.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {term ? 'Haulla ei löytynyt osaamisia.' : 'Teemojen tutkinnon osille ei löytynyt osaamisia.'}
            </p>
          )}

          {!loading && visibleUnits.map(unit => (
            <section key={unit.id} className="space-y-3">
              <h3 className="text-base font-semibold">{unit.name}</h3>
              {unit.groups.map(group => {
                const selectedCount = group.visible.filter(r => selection.has(String(r.id))).length;
                const allSelected = selectedCount === group.visible.length;
                const groupId = `competence-group-${group.id}`;
                return (
                  <div key={group.id} className="rounded-md border bg-background p-3">
                    <div className="mb-1 flex items-start gap-3">
                      <Checkbox
                        id={groupId}
                        className="mt-0.5"
                        checked={allSelected ? true : selectedCount > 0 ? 'indeterminate' : false}
                        onCheckedChange={() => toggleGroup(group.visible, !allSelected)}
                        aria-label={`Valitse kaikki: ${group.title}`}
                      />
                      <label htmlFor={groupId} className="cursor-pointer text-sm font-medium leading-snug">{group.title}</label>
                    </div>
                    <ul className="pl-7">{group.visible.map(requirementRow)}</ul>
                  </div>
                );
              })}
            </section>
          ))}

          {!loading && others.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-base font-semibold">Muut valitut osaamiset</h3>
              <p className="text-sm text-muted-foreground">Nämä eivät kuulu projektin nykyisten teemojen tutkinnon osiin.</p>
              <ul className="rounded-md border bg-background p-3">{others.map(requirementRow)}</ul>
            </section>
          )}
        </div>

        <DialogFooter className="items-center gap-2 border-t p-4 sm:justify-between">
          <span className="text-sm text-muted-foreground">Valittu {selection.size}</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Peruuta</Button>
            <Button onClick={() => onSave([...selection.values()])}>Tallenna valinta</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompetenceSelectorDialog;
