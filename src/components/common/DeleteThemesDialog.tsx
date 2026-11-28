// Confirmation and deletion of one or more themes (qualification unit parts).
// The themes' links to projects are removed; the projects themselves are kept.

import { useState } from 'react';
import { useMutation } from '@apollo/client';
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
import { DELETE_PARTS } from '@/graphql/DeleteParts';
import { GET_QUALIFICATION_UNIT_PARTS } from '@/graphql/GetQualificationUnitParts';

export interface ThemeToDelete {
  id: string | number;
  name: string;
  projects?: { id: string | number; name: string }[] | null;
}

interface DeleteThemesDialogProps {
  themes: ThemeToDelete[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (count: number) => void;
}

const DeleteThemesDialog = ({ themes, open, onOpenChange, onDeleted }: DeleteThemesDialogProps) => {
  const [error, setError] = useState<string | null>(null);
  const [deleteParts, { loading }] = useMutation(DELETE_PARTS, {
    refetchQueries: [{ query: GET_QUALIFICATION_UNIT_PARTS }],
    awaitRefetchQueries: true,
  });

  const projectCount = new Set(themes.flatMap(theme => (theme.projects ?? []).map(project => String(project.id)))).size;
  const single = themes.length === 1;

  const confirm = async (event: React.MouseEvent) => {
    // Keep the dialog open until the result is known, so errors can be shown.
    event.preventDefault();
    setError(null);
    try {
      const { data } = await deleteParts({ variables: { ids: themes.map(theme => String(theme.id)) } });
      const result = data?.deleteParts;
      if (!result?.success) {
        setError(result?.message ?? 'Poisto epäonnistui.');
        return;
      }
      onOpenChange(false);
      onDeleted?.(result.deletedCount ?? themes.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={next => { if (!loading) { setError(null); onOpenChange(next); } }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{single ? `Poistetaanko teema ${themes[0]?.name}?` : `Poistetaanko ${themes.length} teemaa?`}</AlertDialogTitle>
          <AlertDialogDescription>
            Poistoa ei voi perua. Teemat poistuvat myös opiskelijoiden opintosuunnitelmista.
            {projectCount > 0 && ` Teemoihin liitetyt projektit (${projectCount}) säilyvät, vain niiden liitos teemaan poistuu.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!single && (
          <ul className="max-h-60 list-disc space-y-1 overflow-auto pl-5 text-sm">
            {themes.map(theme => <li key={theme.id}>{theme.name}</li>)}
          </ul>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Peruuta</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            disabled={loading}
            variant="destructive"
          >
            {loading ? 'Poistetaan...' : single ? 'Poista teema' : `Poista ${themes.length} teemaa`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteThemesDialog;
