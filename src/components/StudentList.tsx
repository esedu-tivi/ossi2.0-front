import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { TableBody, TableCell, TableRow, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import ArchiveIcon from '@mui/icons-material/Archive';
import TeacherStudentMenu from './common/TeacherStudentMenu';
import { addFollowedStudent, getFollowedStudents, removeFollowedStudent, FollowedStudent } from '../utils/followedStudents';
import { addNotifiedStudent, removeNotifiedStudent, getNotifiedStudents } from '../utils/notifiedStudents';
import { GET_STUDENTS } from '../graphql/GetStudents';
import '../css/StudentList.css';
import { useNavigate } from 'react-router-dom';
import Table, { TableHeaderCell } from './common/Table';
import { Student } from '../types';
import { useAlerts } from '../context/AlertContext';

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
    const [notifiedIds, setNotifiedIds] = useState<string[]>([]);
    const [followedIds, setFollowedIds] = useState<string[]>([]);
    const { addAlert } = useAlerts();

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
                                    <TeacherStudentMenu
                                        isFollowed={followedIds.includes(student.id.toString())}
                                        isNotified={notifiedIds.includes(student.id.toString())}
                                        onFollowToggle={() => {
                                            if (followedIds.includes(student.id.toString())) {
                                                removeFollowedStudent(student.id.toString());
                                                const followed = getFollowedStudents();
                                                setFollowedIds(followed.map((s: FollowedStudent) => s.id));
                                                addAlert('Seuranta poistettu käytöstä', 'info');
                                            } else {
                                                addFollowedStudent({
                                                    id: student.id.toString(),
                                                    firstName: student.firstName,
                                                    lastName: student.lastName
                                                });
                                                const followed = getFollowedStudents();
                                                setFollowedIds(followed.map((s: FollowedStudent) => s.id));
                                                addAlert('Seuranta otettu käyttöön', 'success');
                                            }
                                        }}
                                        onNotifyToggle={() => {
                                            if (notifiedIds.includes(student.id.toString())) {
                                                removeNotifiedStudent(student.id.toString());
                                                setNotifiedIds(getNotifiedStudents());
                                                addAlert('Ilmoitukset poistettu käytöstä', 'info');
                                            } else {
                                                addNotifiedStudent(student.id.toString());
                                                setNotifiedIds(getNotifiedStudents());
                                                addAlert('Ilmoitukset otettu käyttöön', 'success');
                                            }
                                        }}
                                        onEdit={() => console.log('Edit Student')}
                                        onArchive={() => console.log('Archive')}
                                        onProfile={() => navigate(`/teacherdashboard/students/${student.id}`)}
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>}
        </Table>
    );
};

export default StudentList;