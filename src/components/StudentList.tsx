import React from 'react';
import { useState } from 'react';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_STUDENTS } from '../graphql/StudentQueries';
import '../css/StudentList.css';

type StudentData = {
  id: number;
  firstName: string;
  lastName: string;
  groupId: string;
  studyingQualification: {
    name: string;
  };
  studyingQualificationTitle: {
    name: string;
  };
};

const columns: GridColDef[] = [
  { field: 'nimi', headerName: 'Nimi', width: 200, filterable: true },
  { field: 'ryhmä', headerName: 'Ryhmä', width: 150, filterable: true },
  { field: 'tag', headerName: 'Tag', width: 150, filterable: true },
  { field: 'ammattinimike', headerName: 'Ammattinimike', width: 200, filterable: true },
];

const StudentList: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<StudentData | null>(null);

  const { loading, error, data } = useQuery(GET_STUDENTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const rows = data.students.map((student: StudentData) => ({
    id: student.id,
    nimi: `${student.firstName} ${student.lastName}`,
    ryhmä: student.groupId,
    tag:'',
    ammattinimike: student.studyingQualificationTitle.name,
  }));

  const handleRowClick = (params: GridRowParams) => {
    setSelectedRow(params.row as StudentData);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <div className="student-list">
      <DataGrid 
        rows={rows} 
        columns={columns} 
        onRowClick={handleRowClick}
        // checkboxSelection / onko tarvetta?
      />

<Dialog open={open} onClose={handleClose}>
        <DialogTitle>Hallinnoi Opiskelijaa</DialogTitle>
        <DialogContent>
          <p>{selectedRow?.firstName}</p>
          <p>{selectedRow?.lastName}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => console.log("Tarkastele Tietoja")}>Opiskelijan Tiedot</Button>
          <Button onClick={() => console.log("Tarkastele Tietoja")}>Lisää Tagi</Button>
          <Button onClick={() => console.log("Arkistoi")}>Arkistoi</Button>
          <Button onClick={() => console.log("Seuraa Opiskelijaa")}>Seuraa</Button>
          <Button onClick={handleClose}>Sulje</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StudentList;

