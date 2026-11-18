import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import DataTable, { type TableHeaderCell } from "@/components/common/data-table";
import AppDialog from "@/components/common/app-dialog";
import { convertDateToString } from "../../../utils/convertDateToString";
import { GET_MY_INTERNSHIPS } from "../../../graphql/GetMyInternships";

interface InternshipRow {
  id: string | number;
  info: string | null;
  startDate: Date | string;
  endDate: Date | string;
  workplace: {
    id: string;
    name: string;
    jobSupervisor: {
      id: string;
      firstName: string;
      lastName: string;
      email: string | null;
      phoneNumber: string | null;
    } | null;
  } | null;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  qualificationUnit: {
    id: string;
    name: string;
  } | null;
}

interface ParsedRow extends InternshipRow {
  startDate: string;
  endDate: string;
}

const getFullName = (person?: { firstName: string; lastName: string } | null) =>
  person ? `${person.firstName} ${person.lastName}` : "";

const headerCells: readonly TableHeaderCell[] = [
  { id: 0, label: "Työpaikka", type: "sort", sortPath: "workplace.name" },
  { id: 1, label: "Ohjaaja", type: "sort", sortPath: "workplace.jobSupervisor.lastName" },
  { id: 2, label: "Tutkinnonosa", type: "sort", sortPath: "qualificationUnit.name" },
  { id: 3, label: "Info", type: "sort", sortPath: "info" },
  { id: 4, label: "Aloitusaika", type: "sort", sortPath: "startDate" },
  { id: 5, label: "Lopetusaika", type: "sort", sortPath: "endDate" },
  { id: 6, type: "none", label: "" },
  { id: 7, type: "search", searchPath: "workplace.name" },
];

const StudentInternships: React.FC = () => {
  const { data, loading, error } = useQuery(GET_MY_INTERNSHIPS, { fetchPolicy: "network-only" });
  const [infoOpen, setInfoOpen] = useState(false);
  const [selected, setSelected] = useState<ParsedRow | null>(null);

  const rows = useMemo(
    () =>
      (data?.myInternships?.internships ?? []).map((internship: InternshipRow) => ({
        ...internship,
        startDate: convertDateToString(internship.startDate),
        endDate: convertDateToString(internship.endDate),
      })) as ParsedRow[],
    [data]
  );

  if (loading) {
    return <p className="p-4 text-muted-foreground">Ladataan...</p>;
  }

  if (error || data?.myInternships?.success === false) {
    return (
      <p className="p-4 text-destructive">
        Harjoittelujaksoja ei voitu ladata. Yritä myöhemmin uudelleen.
      </p>
    );
  }

  const supervisor = selected?.workplace?.jobSupervisor;

  return (
    <div className="space-y-4 p-2">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Harjoittelujaksot</h1>
        <p className="text-sm text-muted-foreground">
          Näet tässä omat harjoittelujaksosi. Lisäys ja muokkaus tapahtuu opettajan kautta.
        </p>
      </div>

      <DataTable<ParsedRow> headerCells={headerCells} data={rows}>
        {(tableRows) => (
          <TableBody>
            {tableRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  Ei harjoittelujaksoja.
                </TableCell>
              </TableRow>
            ) : (
              tableRows.map((internship) => (
                <TableRow key={internship.id}>
                  <TableCell>{internship.workplace?.name ?? ""}</TableCell>
                  <TableCell>{getFullName(internship.workplace?.jobSupervisor)}</TableCell>
                  <TableCell>{internship.qualificationUnit?.name ?? ""}</TableCell>
                  <TableCell>{internship.info ?? ""}</TableCell>
                  <TableCell>{internship.startDate}</TableCell>
                  <TableCell>{internship.endDate}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelected(internship);
                        setInfoOpen(true);
                      }}
                    >
                      <Info className="mr-1 h-3 w-3" />
                      Tiedot
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        )}
      </DataTable>

      <AppDialog title="Tiedot" open={infoOpen} onClose={setInfoOpen}>
        {selected ? (
          <div className="space-y-2 text-left text-sm">
            <p>Työpaikka: {selected.workplace?.name ?? ""}</p>
            <p>Ohjaaja: {getFullName(supervisor)}</p>
            <p>Sähköposti: {supervisor?.email ?? ""}</p>
            <p>Puhelin: {supervisor?.phoneNumber ?? ""}</p>
            <p>Opettaja: {getFullName(selected.teacher)}</p>
            <p>Tutkinnonosa: {selected.qualificationUnit?.name ?? ""}</p>
            <p>Info: {selected.info ?? ""}</p>
            <p>Aloitusaika: {selected.startDate}</p>
            <p>Lopetusaika: {selected.endDate}</p>
          </div>
        ) : null}
      </AppDialog>
    </div>
  );
};

export default StudentInternships;
