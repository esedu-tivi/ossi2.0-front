import { useQuery } from "@apollo/client"
import { AccordionDetails, Box, Button, TableBody, TableCell, TableRow, Typography } from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import { GET_WORKPLACE } from "../../graphql/GetWorkplace"
import BackIcon from "@mui/icons-material/ArrowBack"
import formStyles from "../../styles/formStyles"
import Table, { TableHeaderCell } from "../common/Table"
import { Internship, JobSupervisorWithPhoneNumber, type Workplace } from "../../types"
import { Accordion, AccordionSummary } from "../common/Accordion"
import { useState } from "react"
import { convertDateToString } from "../../utils/convertDateToString"


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


  const parsedJobSupervisors: ParsedJobSupervisor[] = workplace.jobSupervisors.map(jobSupervisor => ({
    id: jobSupervisor.id,
    fullName: `${jobSupervisor.firstName} ${jobSupervisor.lastName}`,
    email: jobSupervisor.email,
    phoneNumber: jobSupervisor.phoneNumber ?? ""
  }))

  // const parsedJobSupervisors: ParsedJobSupervisor[] = jobSupervisors.filter((jobSupervisor, index, array) =>
  //   array.findIndex(jobSupervisor2 => (jobSupervisor2.id === jobSupervisor.id)) === index
  // )

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
          </Table>
        </AccordionDetails>
      </Accordion>
    </>
  )
}

export default Workplace
