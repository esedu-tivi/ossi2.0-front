import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import ArchiveIcon from "@mui/icons-material/Archive";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { GET_STUDENTS } from "../graphql/GetStudents";
import "../css/StudentList.css";

type StudentData = {
  id: number;
  firstName: string;
  lastName: string;
  groupId: string;
  studyingQualificationTitle: {
    name: string;
  };
};

const StudentList: React.FC = () => {
  const { loading, error, data } = useQuery(GET_STUDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StudentData | null;
    order: "asc" | "desc" | null;
  }>({
    key: null,
    order: null,
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(event.target.value);

  const handleSort = (key: keyof StudentData) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        const nextOrder =
          prev.order === "asc" ? "desc" : prev.order === "desc" ? null : "asc";
        return { key: nextOrder ? key : null, order: nextOrder };
      }
      return { key, order: "asc" };
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const students: StudentData[] = data.students || [];
  const filteredStudents = students.filter(
    (student) =>
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      student.groupId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studyingQualificationTitle.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortConfig.order || !sortConfig.key) return 0;
    const key = sortConfig.key;
    const valueA = a[key] ? String(a[key]).toLowerCase() : "";
    const valueB = b[key] ? String(b[key]).toLowerCase() : "";

    if (sortConfig.order === "asc") return valueA > valueB ? 1 : -1;
    return valueA < valueB ? 1 : -1;
  });

  return (
    <div className="student-list-container">
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className="table-header">
              <TableCell
                className="table-header-cell table-header-id"
                onClick={() => handleSort("id")}
              >
                ID#
                {sortConfig.key === "id" &&
                  (sortConfig.order === "asc" ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : sortConfig.order === "desc" ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : null)}
              </TableCell>
              <TableCell
                className="table-header-cell table-header-name"
                onClick={() => handleSort("firstName")}
              >
                Nimi
                {sortConfig.key === "firstName" &&
                  (sortConfig.order === "asc" ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : sortConfig.order === "desc" ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : null)}
              </TableCell>
              <TableCell
                className="table-header-cell table-header-group"
                onClick={() => handleSort("groupId")}
              >
                Ryhmä
                {sortConfig.key === "groupId" &&
                  (sortConfig.order === "asc" ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : sortConfig.order === "desc" ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : null)}
              </TableCell>
              <TableCell
                className="table-header-cell table-header-qualification"
                onClick={() => handleSort("studyingQualificationTitle")}
              >
                Ammattinimike
                {sortConfig.key === "studyingQualificationTitle" &&
                  (sortConfig.order === "asc" ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : sortConfig.order === "desc" ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : null)}
              </TableCell>
              <TableCell className="search-cell">
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
            {sortedStudents.map((student) => (
              <TableRow key={student.id} className="table-row">
                <TableCell>{student.id}</TableCell>
                <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                <TableCell>{student.groupId}</TableCell>
                <TableCell>{student.studyingQualificationTitle.name}</TableCell>
                <TableCell>
                  <div className="hover-buttons">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<InfoIcon />}
                      onClick={() => console.log("View Details")}
                    >
                      Tiedot
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => console.log("Edit Student")}
                    >
                      Muokkaa
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ArchiveIcon />}
                      onClick={() => console.log("Archive")}
                    >
                      Arkistoi
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default StudentList;
