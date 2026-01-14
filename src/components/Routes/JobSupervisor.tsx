import { Box, Table as MuiTable, TableBody, TableCell, TableRow as MuiTableRow, Typography } from "@mui/material"
import { useParams } from "react-router-dom"
import BackButton from "../common/BackButton"
import { useQuery } from "@apollo/client"
import { GET_JOB_SUPERVISOR } from "../../graphql/GetJobSupervisor"
import Table, { TableHeaderCell } from "../common/Table"
import { Internship as InternshipData, Student } from "../../types"
import { convertDateToString } from "../../utils/convertDateToString"

interface TableRowProps {
  label: string
  value: string
}

type Person = { fullName: string, email: string, phoneNumber?: string } & Pick<Student, "id" | "firstName" | "lastName">

interface Internship extends InternshipData {
  student: Person
  teacher: Person
}

interface ParsedInternship extends Pick<Internship, "id" | "info" | "student" | "teacher"> {
  startDate: string
  endDate: string
}

const headerCells: readonly TableHeaderCell[] = [
  {
    type: "group",
    label: "Harjoittelujakso",
    colSpan: 4
  },
  {
    type: "group",
    label: "Opiskelija",
    colSpan: 2
  },
  {
    type: "group",
    label: "Opettaja",
    colSpan: 2
  },
  {
    label: "#ID",
    type: "sort",
    sortPath: "id"
  },
  {
    label: "Info",
    type: "sort",
    sortPath: "info"
  },
  {
    label: "Aloitusaika",
    type: "sort",
    sortPath: "startDate"
  },
  {
    label: "Lopetusaika",
    type: "sort",
    sortPath: "endDate"
  },
  {
    label: "Nimi",
    type: "sort",
    sortPath: "student.fullName"
  },
  {
    label: "Sähköposti",
    type: "sort",
    sortPath: "student.email"
  },
  {
    label: "Nimi",
    type: "sort",
    sortPath: "teacher.fullName"
  },
  {
    label: "Sähköposti",
    type: "sort",
    sortPath: "teacher.email"
  },
  {
    type: "search",
    searchPath: "student.fullName"
  }
]

const TableRow = ({ label, value }: TableRowProps) => (
  <MuiTableRow>
    <TableCell align="right">{label}</TableCell>
    <TableCell>{value}</TableCell>
  </MuiTableRow>
)

const JobSupervisor = () => {
  const { id } = useParams()
  const { data, loading, error } = useQuery(GET_JOB_SUPERVISOR, { variables: { jobSupervisorId: id } })

  if (loading) {
    return <Box><Typography>Loading...</Typography></Box>
  }
  if (error) {
    return <Box><Typography>Error: {error.message}</Typography></Box>
  }
  console.log(data)
  const jobSupervisor = data.jobSupervisor?.jobSupervisor
  const parsedInternships: ParsedInternship[] = jobSupervisor.internships.map((internship: Internship) => ({
    ...internship,
    startDate: convertDateToString(internship.startDate),
    endDate: convertDateToString(internship.endDate),
    student: {
      ...internship.student,
      fullName: `${internship.student.firstName} ${internship.student.lastName}`,
    },
    teacher: {
      ...internship.teacher,
      fullName: `${internship.teacher.firstName} ${internship.teacher.lastName}`
    }
  }))

  return (
    <Box>
      <BackButton />
      <Box sx={{ maxWidth: 20 }}>
        <Typography variant="h5">Työpaikkaohjaaja</Typography>
        <MuiTable>
          <TableBody>
            <TableRow label="Nimi" value={`${jobSupervisor.firstName} ${jobSupervisor.lastName}`} />
            <TableRow label="Sähköposti" value={jobSupervisor.email} />
            <TableRow label="Puhelinnumero" value={jobSupervisor.phoneNumber} />
            <TableRow label="Työpaikka" value={jobSupervisor.workplace?.name}></TableRow>
          </TableBody>
        </MuiTable>
      </Box>
      <Box>
        <Typography sx={{ my: 2 }} variant="h5">Harjoittelujaksot</Typography>
        <Table<ParsedInternship>
          headerCells={headerCells}
          data={parsedInternships}
        >
          {rows => (
            <TableBody>
              {rows.map(internship => (
                <MuiTableRow key={internship.id} className="table-row">
                  <TableCell>{internship.id}</TableCell>
                  <TableCell>{internship.info}</TableCell>
                  <TableCell>{internship.startDate}</TableCell>
                  <TableCell>{internship.endDate}</TableCell>
                  <TableCell sx={{ textWrap: "noWrap" }}>{internship.student.fullName}</TableCell>
                  <TableCell>{internship.student.email}</TableCell>
                  <TableCell sx={{ textWrap: "noWrap" }}>{internship.teacher.fullName}</TableCell>
                  <TableCell>{internship.teacher.email}</TableCell>
                </MuiTableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </Box>
    </Box>
  )
}

export default JobSupervisor