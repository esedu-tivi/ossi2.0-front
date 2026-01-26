import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { TableBody, TableCell, TableRow, Button, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import ArchiveIcon from '@mui/icons-material/Archive';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { addFollowedStudent, getFollowedStudents, removeFollowedStudent, FollowedStudent } from '../utils/followedStudents';
import { addNotifiedStudent, removeNotifiedStudent, getNotifiedStudents } from '../utils/notifiedStudents';
import { GET_STUDENTS } from '../graphql/GetStudents';
import '../css/StudentList.css';
import { useNavigate } from 'react-router-dom';
import Table, { TableHeaderCell } from './common/Table';
import { Student } from '../types';

const headerCells: readonly TableHeaderCell[] = [
    {
        id: 0,
        type: "sort",
        label: "ID#",
        sortPath: "id"
    },
    {
        id: 1,
        type: "sort",
        label: "Nimi",
        sortPath: "fullName"
    },
    {
        id: 2,
        type: "sort",
        label: "Ryhmä",
        sortPath: "groupId"
    },
    {
        id: 3,
        type: "sort",
        label: "Ammattinimike",
        sortPath: "studyingQualificationTitle.name"
    },
    {
        id: 4,
        type: "search",
        searchPath: "fullName"
    }
]

interface ParsedStudent extends Student {
    fullName: string
}

const StudentList: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuStudent, setMenuStudent] = useState<ParsedStudent | null>(null);
    const menuOpen = Boolean(anchorEl);
    const [notifiedIds, setNotifiedIds] = useState<string[]>([]);
    const [followedIds, setFollowedIds] = useState<string[]>([]);

    useEffect(() => {
        setNotifiedIds(getNotifiedStudents());
        const followed = getFollowedStudents();
        setFollowedIds(followed.map((s: FollowedStudent) => s.id));
    }, []);
    //GraphQL query to fetch student data
    const { loading, error, data } = useQuery(GET_STUDENTS);
    const navigate = useNavigate()

    //const [sortedStudents, setSortedStudents] = useState<ParsedStudent[]>([])
    const [students, setStudents] = useState<ParsedStudent[]>([])
    // State for the user-entered search query, used to filter displayed students

    useEffect(() => {
        if (data && !loading) {
            // Extract student data from the GraphQL data fetch
            const parsedStudents = data.students.students.map((student: Student) => ({
                ...student,
                fullName: `${student.firstName} ${student.lastName}`
            }
            ))
            setStudents(parsedStudents)
        }
    }, [data, loading])

    // Display loading message while fetching data
    // Display error message if fetching data fails
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <Table<ParsedStudent> headerCells={headerCells} data={students}>
            {(rows) =>
                <TableBody>
                    {rows.map((student: ParsedStudent) => (
                        <TableRow key={student.id} className="table-row">
                            <TableCell>{student.id}</TableCell>
                            <TableCell>{`${student.fullName}`}</TableCell>
                            <TableCell>{student.groupId}</TableCell>
                            <TableCell>{student.studyingQualificationTitle ? student.studyingQualificationTitle.name : ''}</TableCell>
                            <TableCell>
                                <div className="hover-buttons">
                                    <Button variant="outlined" size="small" startIcon={<InfoIcon />} onClick={() => navigate(`/teacherdashboard/students/${student.id}`)}>
                                        Tiedot
                                    </Button>
                                    <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => console.log('Edit Student')}>
                                        Muokkaa
                                    </Button>
                                    <Button variant="outlined" size="small" startIcon={<ArchiveIcon />} onClick={() => console.log('Archive')}>
                                        Arkistoi
                                    </Button>
                                    <IconButton
                                        aria-label="more"
                                        aria-controls={menuOpen ? `student-menu-${student.id}` : undefined}
                                        aria-haspopup="true"
                                        onClick={(event) => {
                                            setAnchorEl(event.currentTarget);
                                            setMenuStudent(student);
                                        }}
                                        size="small"
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    <Menu
                        id={menuStudent ? `student-menu-${menuStudent.id}` : undefined}
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={() => {
                            setAnchorEl(null);
                            setMenuStudent(null);
                        }}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        {menuStudent && followedIds.includes(menuStudent.id.toString()) ? (
                            <MenuItem
                                onClick={() => {
                                    if (menuStudent) {
                                        removeFollowedStudent(menuStudent.id.toString());
                                        const followed = getFollowedStudents();
                                        setFollowedIds(followed.map((s: FollowedStudent) => s.id));
                                    }
                                    setAnchorEl(null);
                                    setMenuStudent(null);
                                }}
                            >
                                <ListItemIcon>
                                    <InfoIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Poista seurannasta" />
                            </MenuItem>
                        ) : (
                            <MenuItem
                                onClick={() => {
                                    if (menuStudent) {
                                        addFollowedStudent({
                                            id: menuStudent.id.toString(),
                                            firstName: menuStudent.firstName,
                                            lastName: menuStudent.lastName
                                        });
                                        const followed = getFollowedStudents();
                                        setFollowedIds(followed.map((s: FollowedStudent) => s.id));
                                    }
                                    setAnchorEl(null);
                                    setMenuStudent(null);
                                }}
                            >
                                <ListItemIcon>
                                    <InfoIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Seuraa" />
                            </MenuItem>
                        )}
                        {menuStudent && notifiedIds.includes(menuStudent.id.toString()) ? (
                            <MenuItem
                                onClick={() => {
                                    if (menuStudent) {
                                        removeNotifiedStudent(menuStudent.id.toString());
                                        setNotifiedIds(getNotifiedStudents());
                                    }
                                    setAnchorEl(null);
                                    setMenuStudent(null);
                                }}
                            >
                                <ListItemIcon>
                                    <ArchiveIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Poista ilmoitukset käytöstä" />
                            </MenuItem>
                        ) : (
                            <MenuItem
                                onClick={() => {
                                    if (menuStudent) {
                                        addNotifiedStudent(menuStudent.id.toString());
                                        setNotifiedIds(getNotifiedStudents());
                                    }
                                    setAnchorEl(null);
                                    setMenuStudent(null);
                                }}
                            >
                                <ListItemIcon>
                                    <ArchiveIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Ota ilmoitukset käyttöön" />
                            </MenuItem>
                        )}
                        {menuStudent && (
                            <MenuItem
                                onClick={() => {
                                    navigate(`/teacherdashboard/students/${menuStudent.id}`);
                                    setAnchorEl(null);
                                    setMenuStudent(null);
                                }}
                            >
                                <ListItemIcon>
                                    <InfoIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Siirry käyttäjän profiiliin" />
                            </MenuItem>
                        )}
                    </Menu>
                </TableBody>}
        </Table>
    );
};

export default StudentList;