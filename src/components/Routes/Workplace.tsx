import { useQuery } from "@apollo/client"
import { useParams } from "react-router-dom"
import { GET_WORKPLACE } from "../../graphql/GetWorkplace"
import BackButton from "@/components/common/back-button"
import DataTable, { type TableHeaderCell } from "@/components/common/data-table"
import { Internship, JobSupervisorWithPhoneNumber, type Workplace } from "../../types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/app-accordion"
import { useState } from "react"
import { convertDateToString } from "../../utils/convertDateToString"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"


interface ParsedJobSupervisor extends Omit<JobSupervisorWithPhoneNumber, "firstName" | "lastName"> {
  fullName: string
}

interface ParsedInternship extends Pick<Internship, "id" | "info"> {
  startDate: string
  endDate: string
  student: string
  teacher: string
  jobSupervisor: string
}

const jobSupervisorHeaderCells: readonly TableHeaderCell[] = [
  {
    id: 0,
    label: "#ID",
    type: "sort",
    sortPath: "id"
  },
  {
    id: 1,
    label: "Nimi",
    type: "sort",
    sortPath: "fullName"
  },
  {
    id: 2,
    label: "Sähköposti",
    type: "sort",
    sortPath: "email"
  },
  {
    id: 3,
    label: "Puhelinnumero",
    type: "sort",
    sortPath: "phoneNumber"
  },
  {
    id: 4,
    type: "search",
    searchPath: "fullName"
  }
]

const InternshipHeaderCells: readonly TableHeaderCell[] = [
  {
    id: 0,
    label: "#ID",
    type: "sort",
    sortPath: "id"
  },
  {
    id: 1,
    label: "Aloitusaika",
    type: "sort",
    sortPath: "startDate"
  },
  {
    id: 2,
    label: "Päättymisaika",
    type: "sort",
    sortPath: "endDate"
  },
  {
    id: 3,
    label: "Info",
    type: "sort",
    sortPath: "info"
  },
  {
    id: 4,
    label: "Opiskelija",
    type: "sort",
    sortPath: "student"
  },
  {
    id: 5,
    label: "Työpaikkaohjaaja",
    type: "sort",
    sortPath: "jobSupervisor"
  },
  {
    id: 6,
    label: "Opettaja",
    type: "sort",
    sortPath: "teacher"
  },
  {
    id: 7,
    type: "search",
    searchPath: "student"
  }
]

const WorkplacePage = () => {
  const { id } = useParams()
  const { data, loading, error } = useQuery(GET_WORKPLACE, { variables: { workplaceId: id } })
  const [expandedAccordion, setExpandedAccordion] = useState<string>("internships")

  if (loading) {
    return <p className="p-4">Loading</p>
  }
  if (error) {
    return <p className="p-4">Error: {error.message}</p>
  }

  console.log(data)
  const workplace: Workplace = data.workplace?.workplace


  const parsedJobSupervisors: ParsedJobSupervisor[] = workplace.jobSupervisors.map(jobSupervisor => ({
    id: jobSupervisor.id,
    fullName: `${jobSupervisor.firstName} ${jobSupervisor.lastName}`,
    email: jobSupervisor.email,
    phoneNumber: jobSupervisor.phoneNumber ?? ""
  }))

  const parsedInternships = workplace.internships.map(internship => ({
    id: internship.id,
    startDate: convertDateToString(internship.startDate),
    endDate: convertDateToString(internship.endDate),
    info: internship.info,
    student: `${internship.student.firstName} ${internship.student.lastName}`,
    teacher: `${internship.teacher.firstName} ${internship.teacher.lastName}`,
    jobSupervisor: `${internship.jobSupervisor.firstName} ${internship.jobSupervisor.lastName}`,
  }))

  return (
    <div className="space-y-4">
      <BackButton />
      <div className="rounded-lg bg-primary py-3 text-center">
        <h2 className="text-xl font-bold text-primary-foreground">{workplace.name}</h2>
      </div>

      <Accordion type="single" collapsible value={expandedAccordion} onValueChange={setExpandedAccordion}>
        <AccordionItem value="jobSupervisors">
          <AccordionTrigger className="px-4 text-base font-semibold">
            Työpaikkaohjaajat
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <DataTable<ParsedJobSupervisor> data={parsedJobSupervisors} headerCells={jobSupervisorHeaderCells}>
              {rows =>
                <TableBody>
                  {rows.map(jobSupervisor => (
                    <TableRow key={jobSupervisor.id}>
                      <TableCell>{jobSupervisor.id}</TableCell>
                      <TableCell>{jobSupervisor.fullName}</TableCell>
                      <TableCell>{jobSupervisor.email}</TableCell>
                      <TableCell>{jobSupervisor.phoneNumber}</TableCell>
                    </TableRow>
                  ))
                  }
                </TableBody>
              }
            </DataTable>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="internships">
          <AccordionTrigger className="px-4 text-base font-semibold">
            Harjoittelujaksot
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <DataTable<ParsedInternship> data={parsedInternships} headerCells={InternshipHeaderCells}>
              {rows =>
                <TableBody>
                  {rows.map(internship => (
                    <TableRow key={internship.id}>
                      <TableCell>{internship.id}</TableCell>
                      <TableCell>{internship.startDate}</TableCell>
                      <TableCell>{internship.endDate}</TableCell>
                      <TableCell>{internship.info}</TableCell>
                      <TableCell>{internship.student}</TableCell>
                      <TableCell>{internship.jobSupervisor}</TableCell>
                      <TableCell>{internship.teacher}</TableCell>
                    </TableRow>
                  ))
                  }
                </TableBody>
              }
            </DataTable>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default WorkplacePage
