import React, { useState } from "react";
import "../../css/TeacherProjectsView.css";
import {Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,
        Button,Dialog,DialogTitle,DialogContent,TextField,IconButton,Switch,
        FormControlLabel,Select,MenuItem,} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

interface Project {
  id: number;
  name: string;
  theme: string;
}

const projects: Project[] = [
  { id: 1, name: "Javascript", theme: "OHJ0, OHJ2" },
  { id: 2, name: "Tietokannat", theme: "TVP0, TVP1" },
  { id: 3, name: "HTML:n alkeet", theme: "OHJ3" },
  { id: 4, name: "React-sovellukset", theme: "OKT0, OKT1" },
  { id: 5, name: "Tietoturva", theme: "OHJ5" },
  { id: 6, name: "Pilvipalvelut", theme: "OKT1" },
  { id: 7, name: "Python", theme: "OHJ0, OHJ2" },
  { id: 8, name: "Tietokannat 2", theme: "TVP0, TVP1" },
  { id: 9, name: "HTML:n alkeet 2", theme: "OHJ3" },
  { id: 10, name: "React-sovellukset 2", theme: "OKT0, OKT1" },
];

export default function ProjectTable() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(event.target.value);

  const handleSortByName = () => {
    setSortOrder((prevOrder) => {
      if (prevOrder === "asc") return "desc";
      if (prevOrder === "desc") return null;
      return "asc";
    });
  };

  const sortedProjects = [...projects]
    .filter(
      (project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.theme.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === null) return 0; // No sorting
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (sortOrder === "asc") return nameA > nameB ? 1 : -1;
      return nameA < nameB ? 1 : -1;
    });

  return (
    <div className="project-table-container">
      <div className="button-container">
        <Button
          variant="contained"
          color="primary"
          className="add-project-button"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Lisää Projekti
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className="table-header">
              <TableCell className="table-header-cell table-header-id">
                ID#
              </TableCell>
              <TableCell
                className="table-header-cell table-header-name"
                onClick={handleSortByName}
              >
                <div className="sortable-header">
                  Projektin nimi
                  {sortOrder === "asc" ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : sortOrder === "desc" ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="table-header-cell table-header-theme">
                Teemat
              </TableCell>
              <TableCell className="table-header-cell">
                <div className="search-container">
                  <SearchIcon />
                  <TextField
                    placeholder="Hae…"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProjects.map((project) => (
              <TableRow key={project.id} className="table-row">
                <TableCell>{project.id}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.theme}</TableCell>
                <TableCell>
                  <div className="button-group">
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<EditIcon />}
                      size="small"
                    >
                      Muokkaa
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<InfoIcon />}
                      size="small"
                    >
                      Tiedot
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<AssessmentIcon />}
                      size="small"
                    >
                      Käyttöaste
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Luo Projekti
          <IconButton
            aria-label="close"
            onClick={handleClose}
            className="dialog-close-button"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers className="dialog-content">
          <TextField label="Tutkinto" fullWidth margin="normal" />
          <TextField label="Teemat" fullWidth margin="normal" />
          <TextField label="Projektin nimi" fullWidth margin="normal" />
          <TextField label="Osaamiset" fullWidth margin="normal" />
          <TextField label="Tunnisteet" fullWidth margin="normal" />
          <TextField
            label="Materiaalit"
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            label="Projektin kuvaus"
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          <FormControlLabel
            control={<Switch color="primary" />}
            label="Projektin tila"
            className="form-control-label"
          />
          <Select fullWidth variant="outlined" margin="dense" displayEmpty>
            <MenuItem value="" disabled>
              Valitse projektiin käytettävä aika
            </MenuItem>
            <MenuItem value={10}> noin 2 tuntia</MenuItem>
            <MenuItem value={20}> 2-8 tuntia</MenuItem>
            <MenuItem value={30}> 8-24 tuntia</MenuItem>
            <MenuItem value={30}> yli 24 tuntia</MenuItem>
          </Select>
          <Button
            variant="contained"
            color="primary"
            className="create-project-button"
            fullWidth
          >
            Luo Projekti
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
