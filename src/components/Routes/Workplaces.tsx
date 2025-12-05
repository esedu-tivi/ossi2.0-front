import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@apollo/client"
import { useNavigate } from "react-router-dom"
import { GET_WORKPLACES } from "../../graphql/GetWorkplaces"
import { Alert, Button, TableBody, TableCell, TableRow, Typography } from "@mui/material"

import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import InfoIcon from "@mui/icons-material/Info"
import DeleteIcon from "@mui/icons-material/Delete"

import { Workplace } from "../common/teacherHelpers"
import WorkplaceForm from "./WorkplaceForm"
import { CREATE_WORKPLACE } from "../../graphql/CreateWorkplace"
import { EDIT_WORKPLACE } from "../../graphql/EditWorkpalce"
import { DELETE_WORKPLACE } from "../../graphql/DeleteWorkplace"
import { useConfirm } from "material-ui-confirm"
import Table, { TableHeaderPart } from "../common/Table"
import { GET_JOB_SUPERVISORS } from "../../graphql/GetJobSupervisors"
import { UPDATE_JOB_SUPERVISOR_ASSIGNS } from "../../graphql/UpdateJobSupervisorAssigns"

export interface WorkplaceFormData {
  id: string | number | null
  name: string;
  jobSupervisorIds: string[]
}

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

  const [message, setMessage] = useState<{ type: 'error' | 'info'; message: string | null }>({ type: 'info', message: null })

  const [showNewForm, setNewForm] = useState(false)
  const [showEditForm, setEditForm] = useState(false)

  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<number | null>(null)
  const [sortedWorkplaces, setSortedWorkplaces] = useState<Workplace[]>([])

  //const filteredWorkplaces = filterWorkplaces(workplaces, searchQuery)

  //const sortedWorkplaces = sortWorkplaces(filteredWorkplaces, sortConfig)

  const initFormData = {
    id: null,
    name: "",
    jobSupervisorIds: []
  }

  const [formData, setFormData] = useState<WorkplaceFormData>(initFormData);

  const confirm = useConfirm()

  useEffect(() => {
    if (message.message === null) return

    const timeoutId = setTimeout(() => {
      setMessage({ ...message, message: null })
    }, 5000)

    return () => clearTimeout(timeoutId)
  }, [message])

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
        return setMessage({ type: "info", message: "Työpaikka poistettu" })
      }
      setMessage({ type: "error", message: "Poistossa tapahtui virhe" })
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

      setMessage({ type: "info", message: "Työpaikka lisätty" })
      setNewForm(false)
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

    setEditForm(false)
    setMessage({ type: "info", message: "Työpaikkaa muokattu" })
  }

  if (showNewForm) {
    return (<WorkplaceForm
      formData={formData}
      setFormData={setFormData}
      handleSubmit={handleNewFormSubmit}
      setShowForm={() => setNewForm(false)}
      formTitle='Uusi työpaikka'
      submitText='Luo työpaikka'
      loading={loading}
    />)
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

  if (showEditForm) {
    return <WorkplaceForm
      formData={formData}
      setFormData={setFormData}
      handleSubmit={handleEditFormSubmit}
      setShowForm={() => setEditForm(false)}
      formTitle='Työpaikan muokkaus'
      submitText='Muokkaa työpaikkaa'
      loading={loading}
      jobSupervisors={jobSupervisors}
    />
  }

  const headerParts: TableHeaderPart[] = [
    {
      name: "id",
      title: "ID#",
      type: "sort"
    },
    {
      name: "name",
      title: "Työpaikan nimi",
      type: "sort"
    },
    {
      name: "search",
      type: "search"
    }
  ]

  return (
    <>
      <div className="button-container">
        <Button
          variant="contained"
          color="primary"
          className="add-project-button"
          startIcon={<AddIcon />}
          onClick={() => setNewForm(true)}
        >
          Lisää työpaikka
        </Button>
      </div>
      {message.message && <Alert security={message.type}>{message.message}</Alert>}

      <Table<Workplace> headerParts={headerParts} data={workplaces} setSortedData={setSortedWorkplaces} filterField="name">
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
                    onClick={() => {
                      setSelectedWorkplaceId(workplace.id)
                      setEditForm(true)
                    }}
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
    </>
  )
}

export default Workplaces
