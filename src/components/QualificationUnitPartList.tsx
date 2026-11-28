import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Info, Plus, Trash2 } from "lucide-react";
import { GET_QUALIFICATION_UNIT_PARTS } from "@/graphql/GetQualificationUnitParts";
import { QualificationUnitPart } from "@/types";
import DataTable, { type TableHeaderCell } from "@/components/common/data-table";
import DeleteThemesDialog, { type ThemeToDelete } from "@/components/common/DeleteThemesDialog";

const tableHeaderCells: readonly TableHeaderCell[] = [
  {
    id: 4,
    type: "none",
    label: ""
  },
  {
    id: 0,
    type: "sort",
    label: "ID#",
    sortPath: "id"
  },
  {
    id: 1,
    type: "sort",
    label: "Teeman aihe",
    sortPath: "name"
  },
  {
    id: 2,
    type: "sort",
    label: "Tutkinnonosa",
    sortPath: "parentQualificationUnit.name"
  },
  {
    id: 3,
    type: "search",
    searchPath: "name"
  }
]

const QualificationUnitPartList = () => {
  const { loading, error, data } = useQuery(GET_QUALIFICATION_UNIT_PARTS);
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = useState<ThemeToDelete[]>([]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const parts: QualificationUnitPart[] = data?.parts.parts || [];
  // Ignore selections of themes that no longer exist (e.g. after a delete).
  const selectedParts = parts.filter(part => selected.has(String(part.id)));

  const toggle = (id: string, checked: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-end">
        {selectedParts.length > 0 && (
          <>
            <Button variant="ghost" onClick={() => setSelected(new Set())}>
              Tyhjenn&auml; valinta
            </Button>
            <Button variant="destructive" onClick={() => setToDelete(selectedParts)}>
              <Trash2 />
              Poista valitut ({selectedParts.length})
            </Button>
          </>
        )}
        <Button onClick={() => navigate("/qualificationunitparts/new")}>
          <Plus />
          Lis&auml;&auml; Teema
        </Button>
        <Button onClick={() => navigate("/teacherdashboard/reorderparts")}>
          <Plus />
          J&auml;rjestele Teemoja
        </Button>
      </div>
      <DataTable<QualificationUnitPart> headerCells={tableHeaderCells} data={parts}>
        {rows =>
          <TableBody>
            {rows.map((part) => (
              <TableRow key={part.id} data-state={selected.has(String(part.id)) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(String(part.id))}
                    onCheckedChange={checked => toggle(String(part.id), checked === true)}
                    aria-label={`Valitse ${part.name}`}
                  />
                </TableCell>
                <TableCell>{part.id}</TableCell>
                <TableCell>{part.name}</TableCell>
                <TableCell>{part.parentQualificationUnit?.name}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/qualificationunitparts/edit/${part.id}`)}
                    >
                      <Pencil />
                      Muokkaa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/qualificationunitparts/${part.id}`)}
                    >
                      <Info />
                      Tiedot
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setToDelete([part])}
                      aria-label={`Poista ${part.name}`}
                      title="Poista teema"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>}
      </DataTable>

      <DeleteThemesDialog
        themes={toDelete}
        open={toDelete.length > 0}
        onOpenChange={open => { if (!open) setToDelete([]); }}
        onDeleted={() => {
          const deletedIds = new Set(toDelete.map(theme => String(theme.id)));
          setSelected(prev => new Set([...prev].filter(id => !deletedIds.has(id))));
        }}
      />
    </div>
  );
};

export default QualificationUnitPartList;
