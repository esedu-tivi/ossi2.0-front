import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import '../css/StudentList.css';

// Korvataan oikealla datalla myöhemmin.
const rows = [
    { id: 1, nimi: 'Mikko Virtanen', ryhmä: 'Ryhmä A', tag: 'Tag1', ammattinimike: 'Insinööri' },
    { id: 2, nimi: 'Anna Korhonen', ryhmä: 'Ryhmä B', tag: 'Tag2', ammattinimike: 'Opettaja' },
    { id: 3, nimi: 'Jari Laine', ryhmä: 'Ryhmä C', tag: 'Tag3', ammattinimike: 'Suunnittelija' },
    { id: 4, nimi: 'Leena Mäkinen', ryhmä: 'Ryhmä A', tag: 'Tag4', ammattinimike: 'Ohjelmistokehittäjä' },
    { id: 5, nimi: 'Pekka Niemi', ryhmä: 'Ryhmä B', tag: 'Tag5', ammattinimike: 'Insinööri' },
    { id: 6, nimi: 'Marja Heikkinen', ryhmä: 'Ryhmä C', tag: 'Tag6', ammattinimike: 'Opettaja' },
    { id: 7, nimi: 'Timo Mäkelä', ryhmä: 'Ryhmä A', tag: 'Tag7', ammattinimike: 'Suunnittelija' },
    { id: 8, nimi: 'Sanna Salonen', ryhmä: 'Ryhmä B', tag: 'Tag8', ammattinimike: 'Ohjelmistokehittäjä' },
    { id: 9, nimi: 'Jukka Kallio', ryhmä: 'Ryhmä C', tag: 'Tag9', ammattinimike: 'Insinööri' },
    { id: 10, nimi: 'Kaisa Karjalainen', ryhmä: 'Ryhmä A', tag: 'Tag10', ammattinimike: 'Opettaja' },
    { id: 11, nimi: 'Antti Rantanen', ryhmä: 'Ryhmä B', tag: 'Tag11', ammattinimike: 'Suunnittelija' },
    { id: 12, nimi: 'Tiina Koskinen', ryhmä: 'Ryhmä C', tag: 'Tag12', ammattinimike: 'Ohjelmistokehittäjä' },
    { id: 13, nimi: 'Jari Savolainen', ryhmä: 'Ryhmä A', tag: 'Tag13', ammattinimike: 'Insinööri' },
    { id: 14, nimi: 'Laura Seppälä', ryhmä: 'Ryhmä B', tag: 'Tag14', ammattinimike: 'Opettaja' },
    { id: 15, nimi: 'Heikki Lehtonen', ryhmä: 'Ryhmä C', tag: 'Tag15', ammattinimike: 'Suunnittelija' },
    { id: 16, nimi: 'Aino Hämäläinen', ryhmä: 'Ryhmä A', tag: 'Tag16', ammattinimike: 'Ohjelmistokehittäjä' },
    { id: 17, nimi: 'Juha Ahonen', ryhmä: 'Ryhmä B', tag: 'Tag17', ammattinimike: 'Insinööri' },
    { id: 18, nimi: 'Mari Eskelinen', ryhmä: 'Ryhmä C', tag: 'Tag18', ammattinimike: 'Opettaja' },
    { id: 19, nimi: 'Sami Kinnunen', ryhmä: 'Ryhmä A', tag: 'Tag19', ammattinimike: 'Suunnittelija' },
    { id: 20, nimi: 'Riikka Hietala', ryhmä: 'Ryhmä B', tag: 'Tag20', ammattinimike: 'Ohjelmistokehittäjä' },
    { id: 21, nimi: 'Markku Ojala', ryhmä: 'Ryhmä C', tag: 'Tag21', ammattinimike: 'Insinööri' },
    { id: 22, nimi: 'Johanna Mäntylä', ryhmä: 'Ryhmä A', tag: 'Tag22', ammattinimike: 'Opettaja' },
    { id: 23, nimi: 'Ville Vuorinen', ryhmä: 'Ryhmä B', tag: 'Tag23', ammattinimike: 'Suunnittelija' },
    { id: 24, nimi: 'Heli Väisänen', ryhmä: 'Ryhmä C', tag: 'Tag24', ammattinimike: 'Ohjelmistokehittäjä' },
    { id: 25, nimi: 'Kari Tuominen', ryhmä: 'Ryhmä A', tag: 'Tag25', ammattinimike: 'Insinööri' },
    { id: 26, nimi: 'Kari Salminen', ryhmä: 'Ryhmä B', tag: 'Tag26', ammattinimike: 'Oppilas' }
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

