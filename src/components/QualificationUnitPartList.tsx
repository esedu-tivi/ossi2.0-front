import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {
  TableBody,
  TableCell,
  TableRow,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import AddIcon from "@mui/icons-material/Add";
import "../css/QualificationUnitPartsList.css";
import { GET_QUALIFICATION_UNIT_PARTS } from "../graphql/GetQualificationUnitParts";
import buttonStyles from '../styles/buttonStyles';
import { QualificationUnitPart } from "../types";
import Table, { TableHeaderCell } from "./common/Table";

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

const QualificationUnitPartList: React.FC = () => {
  const { loading, error, data } = useQuery(GET_QUALIFICATION_UNIT_PARTS);
  const navigate = useNavigate();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const parts: QualificationUnitPart[] = data?.parts.parts || [];

  return (
    <div className="qualification-unit-parts-container">
      <div className="button-container">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ ...buttonStyles.cancelButton, mr: 2 }}
          onClick={() => navigate("/qualificationunitparts/new")}
        >
          Lisää Teema
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={buttonStyles.cancelButton}
          onClick={() => navigate("/teacherdashboard/reorderparts")}
        >
          Järjestele Teemoja
        </Button>
      </div>
      <Table<QualificationUnitPart> headerCells={tableHeaderCells} data={parts}>
        {rows =>
          <TableBody>
            {rows.map((part) => (
              <TableRow key={part.id} className="table-row">
                <TableCell>{part.id}</TableCell>
                <TableCell>{part.name}</TableCell>
                <TableCell>{part.parentQualificationUnit.name}</TableCell>
                <TableCell>
                  <div className="button-group">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/qualificationunitparts/edit/${part.id}`)}
                    >
                      Muokkaa
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<InfoIcon />}
                      onClick={() => navigate(`/qualificationunitparts/${part.id}`)}
                    >
                      Tiedot
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>}
      </Table>
    </div>
  );
};

export default QualificationUnitPartList;
