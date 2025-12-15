import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@apollo/client"
import { useNavigate } from "react-router-dom"
import { GET_WORKPLACES } from "../../graphql/GetWorkplaces"
import { Box, Button, TableBody, TableCell, TableRow, Typography } from "@mui/material"

import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import InfoIcon from "@mui/icons-material/Info"
import DeleteIcon from "@mui/icons-material/Delete"

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
import { Workplace } from "../../types"

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

  const { addAlert } = useAlerts()

  const [showNewForm, setShowNewForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<number | null>(null)
  const [sortedWorkplaces, setSortedWorkplaces] = useState<Workplace[]>([])

  const initFormData = {
    id: null,
    name: "",
    jobSupervisorIds: []
  }

  const [formData, setFormData] = useState<WorkplaceFormData>(initFormData);

  const confirm = useConfirm()

  useEffect(() => {
    if (!dialogOpen) {
      setShowNewForm(false)
      setShowEditForm(false)
    }
  }, [dialogOpen])

  useEffect(() => {
    if (showNewForm || showEditForm) {
      setDialogOpen(true)
    } else {
      setDialogOpen(false)
    }
  }, [showNewForm, showEditForm])

  const loading = workplaceLoading || jobSupervisorsLoading
  const error = workplaceError || jobSupervisorsError

  if (loading) return <Typography>Loading...</Typography>
  if (error) return <Typography>Error: {error.message}</Typography>

  const workplaces: Workplace[] = workplaceData.workplaces?.workplaces || []

  const jobSupervisors = jobSupervisorsData.jobSupervisors?.jobSupervisors || []

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

  const handleNewFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const { confirmed } = await confirm({
      title: 'Lisäys',
      description: `Oletko aivan varma, että haluat lisätä '${formData.name}' työpaikan?`
    })

    if (confirmed) {
      const response = await createWorkplace({ variables: { name: formData.name } })
      console.log('GraphQL Response:', response.data);
      setFormData(initFormData)

      addAlert("Työpaikka lisätty", "success")
      setDialogOpen(false)
    }
  }

  const handleEditFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const workplace = workplaces.find((workplace: Workplace) => workplace.id === formData.id)

    if (workplace) {
      const jobSupervisorIds = workplace.jobSupervisors.map(jobSupervisor => jobSupervisor.id)

      const assignIds: string[] = formData.jobSupervisorIds.filter(id => !jobSupervisorIds.includes(id))
      const unassignIds: string[] = jobSupervisorIds.filter(id => !formData.jobSupervisorIds.includes(id))

      if (!assignIds.length && !unassignIds.length) {
        assignIds.push(...formData.jobSupervisorIds)
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

    await editWorkplace({ variables: { editWorkplaceId: formData.id, name: formData.name } })

    setDialogOpen(false)
    addAlert("Työpaikkaa muokattu", "success")
  }

  const handleDialogClose = () => setDialogOpen(false)

  const handleShowAddForm = () => {
    setFormData(initFormData)
    setShowNewForm(true)
  }

  const handleShowEditForm = async (id: number) => {
    setSelectedWorkplaceId(id)
    setShowEditForm(true)
  }

  if (selectedWorkplaceId) {
    const foundWorkplace = sortedWorkplaces.find(workplace => workplace.id === selectedWorkplaceId)
    const workplace = foundWorkplace ? {
      ...foundWorkplace,
      jobSupervisorIds: foundWorkplace.jobSupervisors.map(jobSupervisor => jobSupervisor.id)
    } : initFormData

    setFormData(workplace)
    setSelectedWorkplaceId(null)
  }

  return (
    <>
      <Box className="button-container">
        <Button
          variant="contained"
          color="primary"
          className="add-project-button"
          startIcon={<AddIcon />}
          onClick={handleShowAddForm}
        >
          Lisää työpaikka
        </Button>
      </Box>

      <Table<Workplace> headerCells={headerCells} data={workplaces} setSortedData={setSortedWorkplaces}>
        <TableBody>
          {sortedWorkplaces.map((workplace) => (
            <TableRow key={workplace.id} className="table-row">
              <TableCell>{workplace.id}</TableCell>
              <TableCell>{workplace.name}</TableCell>
              <TableCell>
                <div className="button-group">
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog
        title={showNewForm ? 'Lisää uusi työpaikka' : showEditForm ? 'Muokkaa työpaikkaa' : ''}
        open={dialogOpen}
        onClose={handleDialogClose}
      >
        {showNewForm ? (
          <WorkplaceForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleNewFormSubmit}
            submitButtonTitle='Luo työpaikka'
          />
        ) : null}
        {showEditForm ? (
          <WorkplaceForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleEditFormSubmit}
            submitButtonTitle='Muokkaa työpaikkaa'
            jobSupervisors={jobSupervisors}
          />
        ) : null}
      </Dialog>
    </>
  )
}

export default Workplaces
