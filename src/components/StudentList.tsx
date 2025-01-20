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
import { filterStudents, sortStudents, StudentData, SortConfig } from "./common/studentHelpers";


  const StudentList: React.FC = () => {
  
  //GraphQL query to fetch student data
  const { loading, error, data } = useQuery(GET_STUDENTS);

  // State for the user-entered search query, used to filter displayed students
  const [searchQuery, setSearchQuery] = useState("");

  // State for the current sorting configuration
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    order: null,
  });

  // Update the search query state as the user types in the search field
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Update the sorting configuration when a column header is clicked
  const handleSort = (key: keyof StudentData) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Cycle through asc -> desc -> null
        const nextOrder =
          prev.order === "asc" ? "desc" : prev.order === "desc" ? null : "asc";
        return { key: nextOrder ? key : null, order: nextOrder };
      }
      return { key, order: "asc" };
    });
  };

  // Display loading message while fetching data
  // Display error message if fetching data fails
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Extract student data from the GraphQL data fetch
  const students: StudentData[] = data.students || [];

  // Filter students based on the current search query and sort config
  const filteredStudents = filterStudents(students, searchQuery);
  const sortedStudents = sortStudents(filteredStudents, sortConfig);

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
