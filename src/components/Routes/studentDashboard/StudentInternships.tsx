import { Box, Button, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import InfoIcon from "@mui/icons-material/Info";
import Table, { TableHeaderCell } from "../../common/Table";
import Dialog from "../../common/Dialog";
import { convertDateToString } from "../../../utils/convertDateToString";
import { GET_MY_INTERNSHIPS } from "../../../graphql/GetMyInternships";
import "../../../css/StudentList.css";

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

const getFullName = (person?: { firstName: string; lastName: string } | null): string =>
  person ? `${person.firstName} ${person.lastName}` : "";

const headerCells: readonly TableHeaderCell[] = [
  { id: 0, label: "Työpaikka", type: "sort", sortPath: "workplace.name" },
  { id: 1, label: "Ohjaaja", type: "sort", sortPath: "workplace.jobSupervisor.lastName" },
  { id: 2, label: "Tutkinnonosa", type: "sort", sortPath: "qualificationUnit.name" },
  { id: 3, label: "Info", type: "sort", sortPath: "info" },
  { id: 4, label: "Aloitusaika", type: "sort", sortPath: "startDate" },
  { id: 5, label: "Lopetusaika", type: "sort", sortPath: "endDate" },
  { id: 6, type: "none", label: "" },
  {
    id: 7,
    type: "search",
    searchPath: "workplace.name",
  },
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
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Ladataan…</Typography>
      </Box>
    );
  }

  if (error || data?.myInternships?.success === false) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">
          Harjoittelujaksoja ei voitu ladata. Yritä myöhemmin uudelleen.
        </Typography>
      </Box>
    );
  }

  const supervisor = selected?.workplace?.jobSupervisor;
  const handleInfoOpen = (internship: ParsedRow) => {
    setSelected(internship);
    setInfoOpen(true);
  };
  const handleInfoClose = () => {
    setInfoOpen(false);
    setSelected(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Harjoittelujaksot
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Näet tässä omat harjoittelujaksosi. Lisäys ja muokkaus tapahtuu opettajan kautta.
      </Typography>
      <Table<ParsedRow> headerCells={headerCells} data={rows}>
        {(tableRows) => (
          <TableBody>
            {tableRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="text.secondary">Ei harjoittelujaksoja.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              tableRows.map((internship) => (
                <TableRow key={internship.id} className="table-row">
                  <TableCell>{internship.workplace?.name ?? ""}</TableCell>
                  <TableCell>
                    {getFullName(internship.workplace?.jobSupervisor)}
                  </TableCell>
                  <TableCell>{internship.qualificationUnit?.name ?? ""}</TableCell>
                  <TableCell>{internship.info ?? ""}</TableCell>
                  <TableCell>{internship.startDate}</TableCell>
                  <TableCell>{internship.endDate}</TableCell>
                  <TableCell>
                    <Box className="button-group">
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<InfoIcon />}
                        size="small"
                        onClick={() => handleInfoOpen(internship)}
                      >
                        Tiedot
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        )}
      </Table>
      <Dialog title="Tiedot" open={infoOpen} onClose={handleInfoClose}>
        {selected ? (
          <Box sx={{ textAlign: "left" }}>
            <Typography sx={{ mb: 1 }}>Työpaikka: {selected.workplace?.name ?? ""}</Typography>
            <Typography sx={{ mb: 1 }}>Ohjaaja: {getFullName(supervisor)}</Typography>
            <Typography sx={{ mb: 1 }}>Sähköposti: {supervisor?.email ?? ""}</Typography>
            <Typography sx={{ mb: 1 }}>Puhelin: {supervisor?.phoneNumber ?? ""}</Typography>
            <Typography sx={{ mb: 1 }}>Opettaja: {getFullName(selected.teacher)}</Typography>
            <Typography sx={{ mb: 1 }}>Tutkinnonosa: {selected.qualificationUnit?.name ?? ""}</Typography>
            <Typography sx={{ mb: 1 }}>Info: {selected.info ?? ""}</Typography>
            <Typography sx={{ mb: 1 }}>Aloitusaika: {selected.startDate}</Typography>
            <Typography sx={{ mb: 1 }}>Lopetusaika: {selected.endDate}</Typography>
          </Box>
        ) : null}
      </Dialog>
    </Box>
  );
};

export default StudentInternships;
