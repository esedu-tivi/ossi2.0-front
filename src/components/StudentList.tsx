import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { TableBody, TableCell, TableRow } from '@mui/material';
import TeacherStudentMenu from './common/TeacherStudentMenu';
import { COLOR_OPTIONS } from '../constants/options';
import { addFollowedStudent, getFollowedStudents, removeFollowedStudent, FollowedStudent } from '../utils/followedStudents';
import { addNotifiedStudent, removeNotifiedStudent, getNotifiedStudents } from '../utils/notifiedStudents';
import { GET_STUDENTS } from '../graphql/GetStudents';
import { GET_PROJECT_TAGS } from '../graphql/GetProjectTags';
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
        type: "none",
        label: "Tunnisteet"
    },
    {
        id: 3,
        type: "sort",
        label: "Ryhmä",
        sortPath: "groupId"
    },
    {
        id: 4,
        type: "sort",
        label: "Ammattinimike",
        sortPath: "studyingQualificationTitle.name"
    },
    {
        id: 5,
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
    const [studentTags, setStudentTags] = useState<{ [studentId: string]: Array<{ tagId: string, colorId: string, tagName?: string }> }>({});
    const { addAlert } = useAlerts();
    const { data: tagData } = useQuery(GET_PROJECT_TAGS);
    const assignedTags = tagData?.projectTags?.projectTags || [];

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
                    {/* If no results match the search query, display a message */}
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={headerCells.length} align="center">
                                Ei tuloksia
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((student: ParsedStudent) => (
                            <TableRow key={student.id} className="table-row">
                                <TableCell>{student.id}</TableCell>
                                <TableCell>{student.fullName}</TableCell>
                                {/* Tags column */}
                                <TableCell>
                                    {studentTags[student.id] && studentTags[student.id].length > 0 && (
                                        studentTags[student.id].map((tag, idx) => (
                                            <span
                                                key={tag.tagId + '-' + idx}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    marginRight: 8,
                                                    padding: '2px 8px',
                                                    borderRadius: 8,
                                                    background: COLOR_OPTIONS.find(c => c.id === tag.colorId)?.color || '#accecc',
                                                    fontSize: 12,
                                                    marginBottom: 4,
                                                    color: '#222',
                                                    border: '1px solid #2c2b2b',
                                                    position: 'relative'
                                                }}
                                            >
                                                {tag.tagName ? tag.tagName : assignedTags.find((t: { id: string, name: string }) => t.id === tag.tagId)?.name}
                                                <span
                                                    style={{ marginLeft: 6, cursor: 'pointer', color: '#b71c1c', fontWeight: 'bold' }}
                                                    title="Poista tunniste"
                                                    onClick={() => {
                                                        setStudentTags(prev => {
                                                            const prevTags = prev[student.id] || [];
                                                            const updatedTags = prevTags.filter((_, i) => i !== idx);
                                                            return {
                                                                ...prev,
                                                                [student.id]: updatedTags
                                                            };
                                                        });
                                                    }}
                                                >
                                                    ×
                                                </span>
                                            </span>
                                        ))
                                    )}
                                </TableCell>
                                <TableCell>{student.groupId}</TableCell>
                                <TableCell>{student.studyingQualificationTitle ? student.studyingQualificationTitle.name : ''}</TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} className="button-group">
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
                                            // Tag management
                                            onEdit={() => console.log('Edit Student')}
                                            onArchive={() => console.log('Archive')}
                                            onProfile={() => navigate(`/teacherdashboard/students/${student.id}`)}
                                            studentId={student.id}
                                            studentTags={studentTags}
                                            onTagSelect={(tagId: string, colorId?: string, tagName?: string) => {
                                                if (tagId && colorId) {
                                                    setStudentTags(prev => {
                                                        const prevTags = prev[student.id] || [];
                                                        // If the tag is already added, update the color and name (in case it was a new tag without name)
                                                        const tagIndex = prevTags.findIndex(t => t.tagId === tagId);
                                                        if (tagIndex !== -1) {
                                                            const updatedTags = [...prevTags];
                                                            updatedTags[tagIndex] = {
                                                                ...updatedTags[tagIndex],
                                                                colorId,
                                                                tagName: tagName || updatedTags[tagIndex].tagName
                                                            };
                                                            return {
                                                                ...prev,
                                                                [student.id]: updatedTags
                                                            };
                                                        }
                                                        // Otherwise, add a new tag
                                                        return {
                                                            ...prev,
                                                            [student.id]: [...prevTags, { tagId, colorId, tagName }]
                                                        };
                                                    });
                                                }
                                            }}
                                            tags={assignedTags}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>}
        </Table>
    );
};

export default StudentList;