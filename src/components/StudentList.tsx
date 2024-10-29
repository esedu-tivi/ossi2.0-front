import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import '../css/StudentList.css';

// Korvataan oikealla datalla myöhemmin.
const rows = [
    { id: 1, nimi: 'Mikko Virtanen', ryhmä: 'TiVi22', tag: 'Tag1', ammattinimike: 'Insinööri' },
    { id: 2, nimi: 'Anna Korhonen', ryhmä: 'Tivi24', tag: 'Tag2', ammattinimike: 'Opettaja' },
    { id: 3, nimi: 'Jari Laine', ryhmä: 'Tivi25', tag: 'Tag3', ammattinimike: 'Suunnittelija' },
    { id: 4, nimi: 'Leena Mäkinen', ryhmä: 'Tivi23', tag: 'Tag4', ammattinimike: 'Ohjelmistokehittäjä' },
    { id: 5, nimi: 'Pekka Niemi', ryhmä: 'Tivi24', tag: 'Tag5', ammattinimike: 'Insinööri' },
    { id: 6, nimi: 'Marja Heikkinen', ryhmä: 'Tivi25', tag: 'Tag6', ammattinimike: 'Opettaja' },
    { id: 7, nimi: 'Timo Mäkelä', ryhmä: 'Tivi23', tag: 'Tag7', ammattinimike: 'Suunnittelija' },
    { id: 8, nimi: 'Sanna Salonen', ryhmä: 'Tivi24', tag: 'Tag8', ammattinimike: 'Ohjelmistokehittäjä' },
    { id: 9, nimi: 'Jukka Kallio', ryhmä: 'Tivi25', tag: 'Tag9', ammattinimike: 'Insinööri' },
    { id: 10, nimi: 'Kaisa Karjalainen', ryhmä: 'Tivi23', tag: 'Tag10', ammattinimike: 'Opettaja' },
    { id: 11, nimi: 'Antti Rantanen', ryhmä: 'Tivi24', tag: 'Tag11', ammattinimike: 'Suunnittelija' },
    { id: 12, nimi: 'Tiina Koskinen', ryhmä: 'Tivi25', tag: 'Tag12', ammattinimike: 'Ohjelmistokehittäjä' },
    { id: 13, nimi: 'Jari Savolainen', ryhmä: 'Tivi23', tag: 'Tag13', ammattinimike: 'Insinööri' },
    { id: 14, nimi: 'Laura Seppälä', ryhmä: 'Tivi24', tag: 'Tag14', ammattinimike: 'Opettaja' },
    { id: 15, nimi: 'Heikki Lehtonen', ryhmä: 'Tivi25', tag: 'Tag15', ammattinimike: 'Suunnittelija' },
    { id: 16, nimi: 'Aino Hämäläinen', ryhmä: 'Tivi23', tag: 'Tag16', ammattinimike: 'Ohjelmistokehittäjä' },
    { id: 17, nimi: 'Juha Ahonen', ryhmä: 'Tivi24', tag: 'Tag17', ammattinimike: 'Insinööri' },
    { id: 18, nimi: 'Mari Eskelinen', ryhmä: 'Tivi25', tag: 'Tag18', ammattinimike: 'Opettaja' },
    { id: 19, nimi: 'Sami Kinnunen', ryhmä: 'Tivi23', tag: 'Tag19', ammattinimike: 'Suunnittelija' },
    { id: 20, nimi: 'Riikka Hietala', ryhmä: 'Tivi24', tag: 'Tag20', ammattinimike: 'Ohjelmistokehittäjä' },
    { id: 21, nimi: 'Markku Ojala', ryhmä: 'Tivi25', tag: 'Tag21', ammattinimike: 'Insinööri' },
    { id: 22, nimi: 'Johanna Mäntylä', ryhmä: 'Tivi23', tag: 'Tag22', ammattinimike: 'Opettaja' },
    { id: 23, nimi: 'Ville Vuorinen', ryhmä: 'Tivi24', tag: 'Tag23', ammattinimike: 'Suunnittelija' },
    { id: 24, nimi: 'Heli Väisänen', ryhmä: 'Tivi25', tag: 'Tag24', ammattinimike: 'Ohjelmistokehittäjä' },
    { id: 25, nimi: 'Kari Tuominen', ryhmä: 'Tivi23', tag: 'Tag25', ammattinimike: 'Insinööri' },
    { id: 26, nimi: 'Kari Salminen', ryhmä: 'Tivi24', tag: 'Tag26', ammattinimike: 'Oppilas' }
];

const columns: GridColDef[] = [
  { field: 'nimi', headerName: 'Nimi', width: 200, filterable: true },
  { field: 'ryhmä', headerName: 'Ryhmä', width: 150, filterable: true },
  { field: 'tag', headerName: 'Tag', width: 150, filterable: true },
  { field: 'ammattinimike', headerName: 'Ammattinimike', width: 200, filterable: true },
];

const StudentList: React.FC = () => {
  return (
    <div className="student-list">
      <DataGrid 
        rows={rows} 
        columns={columns} 
        checkboxSelection
        autoHeight
      />
    </div>
  );
};

export default StudentList;

