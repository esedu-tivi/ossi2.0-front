import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Info, Pencil, Archive } from 'lucide-react';
import { GET_STUDENTS } from '@/graphql/GetStudents';
import { useNavigate } from 'react-router-dom';
import DataTable, { type TableHeaderCell } from '@/components/common/data-table';
import { Student } from '@/types';

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
        label: "Ryhm\u00e4",
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

const StudentList = () => {
    //GraphQL query to fetch student data
    const { loading, error, data } = useQuery(GET_STUDENTS);
    const navigate = useNavigate()

    const [students, setStudents] = useState<ParsedStudent[]>([])

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
        <DataTable<ParsedStudent> headerCells={headerCells} data={students}>
            {(rows) =>
                <TableBody>
                    {rows.map((student: ParsedStudent) => (
                        <TableRow key={student.id}>
                            <TableCell>{student.id}</TableCell>
                            <TableCell>{student.fullName}</TableCell>
                            <TableCell>{student.groupId}</TableCell>
                            <TableCell>{student.studyingQualificationTitle ? student.studyingQualificationTitle.name : ''}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/teacherdashboard/students/${student.id}`)}>
                                        <Info />
                                        Tiedot
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/teacherdashboard/students/${student.id}`)}>
                                        <Pencil />
                                        Muokkaa
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => console.log('Archive')}>
                                        <Archive />
                                        Arkistoi
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>}
        </DataTable>
    );
};

export default StudentList;
