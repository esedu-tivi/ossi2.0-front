import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Info, Plus } from "lucide-react";
import { GET_QUALIFICATION_UNIT_PARTS } from "@/graphql/GetQualificationUnitParts";
import { QualificationUnitPart } from "@/types";
import DataTable, { type TableHeaderCell } from "@/components/common/data-table";

const tableHeaderCells: readonly TableHeaderCell[] = [
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const parts: QualificationUnitPart[] = data?.parts.parts || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
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
              <TableRow key={part.id}>
                <TableCell>{part.id}</TableCell>
                <TableCell>{part.name}</TableCell>
                <TableCell>{part.parentQualificationUnit.name}</TableCell>
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
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>}
      </DataTable>
    </div>
  );
};

export default QualificationUnitPartList;
