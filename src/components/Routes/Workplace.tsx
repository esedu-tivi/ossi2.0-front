import { useQuery } from "@apollo/client"
import { AccordionDetails, Box, Button, TableBody, TableCell, TableRow, Typography } from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import { GET_WORKPLACE } from "../../graphql/GetWorkplace"
import BackIcon from "@mui/icons-material/ArrowBack"
import formStyles from "../../styles/formStyles"
import Table, { TableHeaderCell } from "../common/Table"
import { Internship, JobSupervisor, Student, Teacher } from "../../types"
import { Accordion, AccordionSummary } from "../common/Accordion"
import { useState } from "react"

interface JobSupervisorWithPhoneNumber extends JobSupervisor {
  phoneNumber: string
}

interface ParsedJobSupervisor extends Omit<JobSupervisorWithPhoneNumber, "firstName" | "lastName"> {
  fullName: string
}

interface InternshipWithJobSupervisorAndTeacherAndStudent extends Internship {
  jobSupervisor: JobSupervisorWithPhoneNumber
  student: Pick<Student, "id" | "firstName" | "lastName">
  teacher: Teacher
}

interface Workplace {
  id: string
  name: string
  internships: [InternshipWithJobSupervisorAndTeacherAndStudent]
}

interface ParsedInternship extends Pick<Internship, "id" | "startDate" | "endDate" | "info"> {
  student: string,
  teacher: string,
  jobSupervisor: string
}

const jobSupervisorHeaderCells: readonly TableHeaderCell[] = [
  {
    label: "#ID",
    type: "sort",
    sortPath: "id"
  },
  {
    label: "Nimi",
    type: "sort",
    sortPath: "fullName"
  },
  {
    label: "Sähköposti",
    type: "sort",
    sortPath: "email"
  },
  {
    label: "Puhelinnumero",
    type: "sort",
    sortPath: "phoneNumber"
  },
  {
    type: "search",
    searchPath: "fullName"
  }
]

const InternshipHeaderCells: readonly TableHeaderCell[] = [
  {
    label: "#ID",
    type: "sort",
    sortPath: "id"
  },
  {
    label: "Aloitusaika",
    type: "sort",
    sortPath: "startDate"
  },
  {
    label: "Päättymisaika",
    type: "sort",
    sortPath: "endDate"
  },
  {
    label: "Info",
    type: "sort",
    sortPath: "info"
  },
  {
    label: "Opiskelija",
    type: "sort",
    sortPath: "student"
  },
  {
    label: "Työpaikkaohjaaja",
    type: "sort",
    sortPath: "jobSupervisor"
  },
  {
    label: "Opettaja",
    type: "sort",
    sortPath: "teacher"
  },
  {
    type: "search",
    searchPath: "student"
  }
]

const Workplace = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, loading, error } = useQuery(GET_WORKPLACE, { variables: { workplaceId: id } })
  const [expandedAccordion, setExpandedAccordion] = useState<"jobSupervisors" | "internships" | false>("internships")

  if (loading) {
    return <Box><Typography>Loading</Typography></Box>
  }
  if (error) {
    return <Box><Typography>Error: {error.message}</Typography></Box>
  }

  const handleAccordionChange = (panel: "jobSupervisors" | "internships") => (_event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpandedAccordion(newExpanded ? panel : false)
  }

  console.log(data)
  const workplace: Workplace = data.workplace?.workplace


  const jobSupervisors = workplace.internships.map(internship => ({
    id: internship.jobSupervisor.id,
    fullName: `${internship.jobSupervisor.firstName} ${internship.jobSupervisor.lastName}`,
    email: internship.jobSupervisor.email,
    phoneNumber: internship.jobSupervisor.phoneNumber
  }))

  const parsedJobSupervisors: ParsedJobSupervisor[] = jobSupervisors.filter((jobSupervisor, index, array) =>
    array.findIndex(jobSupervisor2 => (jobSupervisor2.id === jobSupervisor.id)) === index
  )

  const parsedInternships = workplace.internships.map(internship => ({
    id: internship.id,
    startDate: internship.startDate,
    endDate: internship.endDate,
    info: internship.info,
    student: `${internship.student.firstName} ${internship.student.lastName}`,
    teacher: `${internship.teacher.firstName} ${internship.teacher.lastName}`,
    jobSupervisor: `${internship.jobSupervisor.firstName} ${internship.jobSupervisor.lastName}`,
  }))

  return (
    <>
      <Button variant="contained" sx={{ marginBottom: '10px' }} startIcon={<BackIcon />} onClick={() => navigate(-1)}>Palaa</Button>
      <Box sx={{ backgroundColor: formStyles.formBannerBox.backgroundColor, textAlign: 'center', py: 2 }}>
        <Typography variant="h5" color="white" fontWeight="bold">{workplace.name}</Typography>
      </Box>
      <Accordion expanded={expandedAccordion === 'jobSupervisors'} onChange={handleAccordionChange('jobSupervisors')}>
        <AccordionSummary
          aria-controls="jobSupervisors-accordion-content"
          id="jobSupervisors-accordion-header"
        >
          <Typography sx={{ fontWeight: 600 }} component="span">Työpaikkaohjaajat</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Table<ParsedJobSupervisor> data={parsedJobSupervisors} headerCells={jobSupervisorHeaderCells}>
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
          </Table>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expandedAccordion === 'internships'} onChange={handleAccordionChange('internships')}>
        <AccordionSummary
          aria-controls="internships-accordion-content"
          id="internships-accordion-header"
        >
          <Typography sx={{ fontWeight: 600 }} component="span">Harjoittelujaksot</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Table<ParsedInternship> data={parsedInternships} headerCells={InternshipHeaderCells}>
            {rows =>
              <TableBody>
                {rows.map(internship => (
                  <TableRow key={internship.id}>
                    <TableCell>{internship.id}</TableCell>
                    <TableCell>{internship.startDate.toString()}</TableCell>
                    <TableCell>{internship.endDate.toString()}</TableCell>
                    <TableCell>{internship.info}</TableCell>
                    <TableCell>{internship.student}</TableCell>
                    <TableCell>{internship.jobSupervisor}</TableCell>
                    <TableCell>{internship.teacher}</TableCell>
                  </TableRow>
                ))
                }
              </TableBody>
            }
          </Table>
        </AccordionDetails>
      </Accordion>
    </>
  )
}

export default Workplace
