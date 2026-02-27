import { useParams } from "react-router-dom"
import BackButton from "@/components/common/back-button"
import { useQuery } from "@apollo/client"
import { GET_JOB_SUPERVISOR } from "../../graphql/GetJobSupervisor"
import DataTable, { type TableHeaderCell } from "@/components/common/data-table"
import { Internship as InternshipData, Student } from "../../types"
import { convertDateToString } from "../../utils/convertDateToString"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"

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
    id: 0,
    type: "group",
    label: "Harjoittelujakso",
    colSpan: 4
  },
  {
    id: 1,
    type: "group",
    label: "Opiskelija",
    colSpan: 2
  },
  {
    id: 2,
    type: "group",
    label: "Opettaja",
    colSpan: 2
  },
  {
    id: 3,
    label: "#ID",
    type: "sort",
    sortPath: "id"
  },
  {
    id: 4,
    label: "Info",
    type: "sort",
    sortPath: "info"
  },
  {
    id: 5,
    label: "Aloitusaika",
    type: "sort",
    sortPath: "startDate"
  },
  {
    id: 6,
    label: "Lopetusaika",
    type: "sort",
    sortPath: "endDate"
  },
  {
    id: 7,
    label: "Nimi",
    type: "sort",
    sortPath: "student.fullName"
  },
  {
    id: 8,
    label: "Sähköposti",
    type: "sort",
    sortPath: "student.email"
  },
  {
    id: 9,
    label: "Nimi",
    type: "sort",
    sortPath: "teacher.fullName"
  },
  {
    id: 10,
    label: "Sähköposti",
    type: "sort",
    sortPath: "teacher.email"
  },
  {
    id: 11,
    type: "search",
    searchPath: "student.fullName"
  }
]

interface InfoRowProps {
  label: string
  value: string
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="flex border-b py-2 last:border-b-0">
    <span className="w-40 text-right text-sm font-medium text-muted-foreground pr-4">{label}</span>
    <span className="text-sm">{value}</span>
  </div>
)

const JobSupervisor = () => {
  const { id } = useParams()
  const { data, loading, error } = useQuery(GET_JOB_SUPERVISOR, { variables: { jobSupervisorId: id } })

  if (loading) {
    return <p className="p-4">Loading...</p>
  }
  if (error) {
    return <p className="p-4">Error: {error.message}</p>
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
    <div className="space-y-6">
      <BackButton />
      <div>
        <h2 className="mb-3 text-xl font-semibold">Työpaikkaohjaaja</h2>
        <div className="max-w-md rounded-md border p-4">
          <InfoRow label="Nimi" value={`${jobSupervisor.firstName} ${jobSupervisor.lastName}`} />
          <InfoRow label="Sähköposti" value={jobSupervisor.email} />
          <InfoRow label="Puhelinnumero" value={jobSupervisor.phoneNumber} />
          <InfoRow label="Työpaikka" value={jobSupervisor.workplace?.name} />
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-xl font-semibold">Harjoittelujaksot</h2>
        <DataTable<ParsedInternship>
          headerCells={headerCells}
          data={parsedInternships}
        >
          {rows => (
            <TableBody>
              {rows.map(internship => (
                <TableRow key={internship.id}>
                  <TableCell>{internship.id}</TableCell>
                  <TableCell>{internship.info}</TableCell>
                  <TableCell>{internship.startDate}</TableCell>
                  <TableCell>{internship.endDate}</TableCell>
                  <TableCell className="whitespace-nowrap">{internship.student.fullName}</TableCell>
                  <TableCell>{internship.student.email}</TableCell>
                  <TableCell className="whitespace-nowrap">{internship.teacher.fullName}</TableCell>
                  <TableCell>{internship.teacher.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </DataTable>
      </div>
    </div>
  )
}

export default JobSupervisor
