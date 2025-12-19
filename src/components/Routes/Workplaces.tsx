import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@apollo/client"
import { useNavigate } from "react-router-dom"
import { GET_WORKPLACES } from "../../graphql/GetWorkplaces"
import { Accordion as MuiAccordion, AccordionDetails, AccordionSummary as MuiAccordionSummary, Button, Stack, TableBody, TableCell, TableRow, Typography, styled, AccordionProps, AccordionSummaryProps, accordionSummaryClasses, Box } from "@mui/material"

import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import InfoIcon from "@mui/icons-material/Info"
import DeleteIcon from "@mui/icons-material/Delete"
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';

import WorkplaceForm, { WorkplaceFormData } from "../WorkplaceForm"
import { CREATE_WORKPLACE } from "../../graphql/CreateWorkplace"
import { EDIT_WORKPLACE } from "../../graphql/EditWorkpalce"
import { DELETE_WORKPLACE } from "../../graphql/DeleteWorkplace"
import { useConfirm } from "material-ui-confirm"
import Table, { TableHeaderCell } from "../common/Table"
import { GET_JOB_SUPERVISORS } from "../../graphql/GetJobSupervisors"
import { UPDATE_JOB_SUPERVISOR_ASSIGNS } from "../../graphql/UpdateJobSupervisorAssigns"
import Dialog from "../common/Dialog"
import { useAlerts } from "../../context/AlertContext"
import { JobSupervisor, Workplace } from "../../types"
import JobSupervisorForm, { JobSupervisorFormData } from "../JobSupervisorForm"
import buttonStyles from "../../styles/buttonStyles"
import { CREATE_JOB_SUPERVISOR } from "../../graphql/CreateJobSupervisor"

interface JobSupervisorWithFullNameAndWorkplace extends JobSupervisor {
  fullName: string,
  workplace?: Workplace
}

const headerCells: readonly TableHeaderCell[] = [
  {
    sortPath: "id",
    label: "ID#",
    type: "sort"
  },
  {
    sortPath: "name",
    label: "Työpaikan nimi",
    type: "sort"
  },
  {
    type: "search",
    searchPath: "name"
  }
]

const jobSupervisorsHeaderCells: readonly TableHeaderCell[] = [
  {
    sortPath: "id",
    label: "ID#",
    type: "sort"
  },
  {
    sortPath: "fullName",
    label: "Nimi",
    type: "sort"
  },
  {
    sortPath: "workplace.name",
    label: "Työpaikan nimi",
    type: "sort"
  },
  {
    type: "search",
    searchPath: "fullName"
  }
]

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(() => ({
  border: `1px solid grey`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));


const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(() => ({
  backgroundColor: 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
  {
    transform: 'rotate(90deg)',
  },
}));

const Workplaces = () => {
  const navigate = useNavigate()
  const { loading: workplaceLoading, error: workplaceError, data: workplaceData } = useQuery(GET_WORKPLACES)
  const { loading: jobSupervisorsLoading, error: jobSupervisorsError, data: jobSupervisorsData } = useQuery(GET_JOB_SUPERVISORS)

  const [createWorkplace] = useMutation(CREATE_WORKPLACE, {
    refetchQueries: [{ query: GET_WORKPLACES }]
  })

  const [editWorkplace] = useMutation(EDIT_WORKPLACE, {
    refetchQueries: [{ query: GET_WORKPLACES }]
  })

  const [deleteWorkplace] = useMutation(DELETE_WORKPLACE, {
    refetchQueries: [{ query: GET_WORKPLACES }]
  })

  const [updateSupervisorAssigns] = useMutation(UPDATE_JOB_SUPERVISOR_ASSIGNS, { refetchQueries: [GET_JOB_SUPERVISORS] })

  const [createJobSupervisor] = useMutation(CREATE_JOB_SUPERVISOR, { refetchQueries: [{ query: GET_JOB_SUPERVISORS }] })

  const { addAlert } = useAlerts()

  const [showNewWorkplaceForm, setShowNewForm] = useState(false)
  const [showEditWorkplaceForm, setShowEditForm] = useState(false)
  const [showNewJobSupervisorForm, setShowNewJobSupervisorForm] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<number | null>(null)
  const [sortedWorkplaces, setSortedWorkplaces] = useState<Workplace[]>([])

  const [sortedJobSupervisors, setSortedJobSupervisors] = useState<JobSupervisorWithFullNameAndWorkplace[]>([])

  const [expandedAccordion, setExpandedAccordion] = useState<"workplaces" | "jobSupervisors" | false>(false)

  const initWorkplaceFormData = {
    id: null,
    name: "",
    jobSupervisorIds: []
  }

  const initJobSupervisorFormData = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  }

  const [workplaceFormData, setWorkplaceFormData] = useState<WorkplaceFormData>(initWorkplaceFormData);
  const [jobSupervisorFormData, setJobSupervisorFormData] = useState<JobSupervisorFormData>(initJobSupervisorFormData)

  const confirm = useConfirm()

  useEffect(() => {
    if (!dialogOpen) {
      setShowNewForm(false)
      setShowEditForm(false)
      setShowNewJobSupervisorForm(false)
    }
  }, [dialogOpen])

  useEffect(() => {
    if (showNewWorkplaceForm || showEditWorkplaceForm || showNewJobSupervisorForm) {
      setDialogOpen(true)
    } else {
      setDialogOpen(false)
    }
  }, [showNewWorkplaceForm, showEditWorkplaceForm, showNewJobSupervisorForm])

  const loading = workplaceLoading || jobSupervisorsLoading
  const error = workplaceError || jobSupervisorsError

  if (loading) return <Typography>Loading...</Typography>
  if (error) return <Typography>Error: {error.message}</Typography>

  const workplaces: Workplace[] = workplaceData.workplaces?.workplaces || []

  const jobSupervisors = jobSupervisorsData.jobSupervisors?.jobSupervisors.map(((jobSupervisor: JobSupervisorWithFullNameAndWorkplace) => ({
    ...jobSupervisor,
    fullName: `${jobSupervisor.firstName} ${jobSupervisor.lastName}`

  })))


  const handleDelete = async (id: number, name: string) => {
    console.log(id);
    const { confirmed } = await confirm({
      title: "Poisto",
      description: `Oletko aivan varma, että haluat poistaa '${name}' työpaikan?`
    })

    if (confirmed) {
      const response = await deleteWorkplace({ variables: { deleteWorkplaceId: id } })
      console.log(response)
      if (response.data.deleteWorkplace.success) {
        return addAlert("Työpaikka poistettu", "success")
      }
      addAlert("Poistossa tapahtui virhe", "error")
    }
  }

  const handleNewWorkplaceFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const { confirmed } = await confirm({
      title: 'Lisäys',
      description: `Oletko aivan varma, että haluat lisätä '${workplaceFormData.name}' työpaikan?`
    })

    if (confirmed) {
      const response = await createWorkplace({ variables: { name: workplaceFormData.name } })
      console.log('GraphQL Response:', response.data);
      setWorkplaceFormData(initWorkplaceFormData)

      addAlert("Työpaikka lisätty", "success")
      setDialogOpen(false)
    }
  }

  const handleEditWorkplaceFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const workplace = workplaces.find((workplace: Workplace) => workplace.id === workplaceFormData.id)

    if (workplace) {
      const jobSupervisorIds = workplace.jobSupervisors.map(jobSupervisor => jobSupervisor.id)

      const assignIds: string[] = workplaceFormData.jobSupervisorIds.filter(id => !jobSupervisorIds.includes(id))
      const unassignIds: string[] = jobSupervisorIds.filter(id => !workplaceFormData.jobSupervisorIds.includes(id))

      if (!assignIds.length && !unassignIds.length) {
        assignIds.push(...workplaceFormData.jobSupervisorIds)
      }

      console.log("assignIds", assignIds)
      console.log("unassignIds", unassignIds)
      await updateSupervisorAssigns({
        variables: {
          workplaceId: workplace.id,
          assignIds,
          unassignIds
        }
      })
    }

    await editWorkplace({ variables: { editWorkplaceId: workplaceFormData.id, name: workplaceFormData.name } })

    setDialogOpen(false)
    addAlert("Työpaikkaa muokattu", "success")
  }

  const handleNewJobSupervisorFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    console.log(jobSupervisorFormData)

    const { confirmed } = await confirm({
      title: "Poisto",
      description: `Oletko aivan varma, että haluat luoda työpaikkaohjaajan nimellä '${jobSupervisorFormData.firstName} ${jobSupervisorFormData.lastName}' ja sähköpostiosoitteella '${jobSupervisorFormData.email}'?`
    })
    if (confirmed) {
      await createJobSupervisor({ variables: { jobSupervisor: jobSupervisorFormData } })
      setJobSupervisorFormData(initJobSupervisorFormData)
      setDialogOpen(false)
      addAlert("Uusi työpaikka ohjaaja luotu onnistuneesti", "success")
    }
  }

  const handleDialogClose = () => setDialogOpen(false)

  const handleShowNewWorkplaceForm = () => {
    setWorkplaceFormData(initWorkplaceFormData)
    setShowNewForm(true)
  }

  const handleShowEditForm = (id: number) => {
    setSelectedWorkplaceId(id)
    setShowEditForm(true)
  }

  const handleShowNewJobSupervisorForm = () => {
    setJobSupervisorFormData(initJobSupervisorFormData)
    setShowNewJobSupervisorForm(true)
  }

  const handleAccordionChange = (panel: "workplaces" | "jobSupervisors") => (_event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpandedAccordion(newExpanded ? panel : false)
  }

  if (selectedWorkplaceId) {
    const foundWorkplace = sortedWorkplaces.find(workplace => workplace.id === selectedWorkplaceId)
    const workplace = foundWorkplace ? {
      ...foundWorkplace,
      jobSupervisorIds: foundWorkplace.jobSupervisors.map(jobSupervisor => jobSupervisor.id)
    } : initWorkplaceFormData

    setWorkplaceFormData(workplace)
    setSelectedWorkplaceId(null)
  }

  return (
    <>
      <Stack className="button-container" sx={{ mx: 2 }} direction="row" spacing={2} useFlexGap={true}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleShowNewWorkplaceForm}
          sx={buttonStyles.showButton}
        >
          Lisää työpaikka
        </Button>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleShowNewJobSupervisorForm}
          sx={buttonStyles.showButton}
        >
          Lisää uusi työpaikka ohjaaja
        </Button>
      </Stack>

      <Accordion expanded={expandedAccordion === 'workplaces'} onChange={handleAccordionChange('workplaces')}>
        <AccordionSummary
          aria-controls="workplaces-accordion-content"
          id="workplaces-accordion-header"
        >
          <Typography sx={{ fontWeight: 600 }} component="span">Työpaikat</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Table<Workplace> headerCells={headerCells} data={workplaces} setSortedData={setSortedWorkplaces}>
            <TableBody>
              {sortedWorkplaces.map((workplace) => (
                <TableRow key={workplace.id} className="table-row">
                  <TableCell>{workplace.id}</TableCell>
                  <TableCell>{workplace.name}</TableCell>
                  <TableCell>
                    <Box className="button-group">
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        size="small"
                        onClick={() => handleShowEditForm(workplace.id)}
                      >
                        Muokkaa
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<InfoIcon />}
                        size="small"
                        onClick={() => navigate(`/workplaces/${workplace.id}`)}
                      >
                        Tiedot
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<DeleteIcon />}
                        size="small"
                        onClick={() => handleDelete(workplace.id, workplace.name)}
                      >
                        Poista
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expandedAccordion === 'jobSupervisors'} onChange={handleAccordionChange('jobSupervisors')}>
        <AccordionSummary
          aria-controls="jobSupervisors-accordion-content"
          id="jobSupervisors-accordion-header"
        >
          <Typography sx={{ fontWeight: 600 }} component="span">Työpaikkaohjaajat</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Table<JobSupervisorWithFullNameAndWorkplace> headerCells={jobSupervisorsHeaderCells} data={jobSupervisors} setSortedData={setSortedJobSupervisors}>
            <TableBody>
              {sortedJobSupervisors.map((jobSupervisor) => (
                <TableRow key={jobSupervisor.id} className="table-row">
                  <TableCell>{jobSupervisor.id}</TableCell>
                  <TableCell>{jobSupervisor.fullName}</TableCell>
                  <TableCell>{jobSupervisor.workplace?.name || ""}</TableCell>
                  <TableCell>
                    <Box className="button-group">
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<EditIcon />}
                        size="small"
                        onClick={() => console.log('muokkaa')}
                      >
                        Muokkaa
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<InfoIcon />}
                        size="small"
                        onClick={() => console.log('tiedot')}
                      >
                        Tiedot
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<DeleteIcon />}
                        size="small"
                        onClick={() => console.log('delete')}
                      >
                        Poista
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
      <Dialog
        title={
          showNewWorkplaceForm
            ? 'Lisää uusi työpaikka'
            : showEditWorkplaceForm
              ? 'Muokkaa työpaikkaa'
              : showNewJobSupervisorForm
                ? "Lisää uusi työpaikkaohjaaja" :
                ''
        }
        open={dialogOpen}
        onClose={handleDialogClose}
      >
        {showNewWorkplaceForm ? (
          <WorkplaceForm
            formData={workplaceFormData}
            setFormData={setWorkplaceFormData}
            handleSubmit={handleNewWorkplaceFormSubmit}
            submitButtonTitle='Luo työpaikka'
          />
        ) : null}
        {showEditWorkplaceForm ? (
          <WorkplaceForm
            formData={workplaceFormData}
            setFormData={setWorkplaceFormData}
            handleSubmit={handleEditWorkplaceFormSubmit}
            submitButtonTitle='Muokkaa työpaikkaa'
            jobSupervisors={jobSupervisors}
          />
        ) : null}
        {showNewJobSupervisorForm ? (
          <JobSupervisorForm
            formData={jobSupervisorFormData}
            setFormData={setJobSupervisorFormData}
            handleSubmit={handleNewJobSupervisorFormSubmit}
            submitButtonTitle="Lisää työpaikka ohjaaja"
          />
        ) : null}
      </Dialog>
    </>
  )
}

export default Workplaces
