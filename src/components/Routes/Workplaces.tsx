import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@apollo/client"
import { useNavigate } from "react-router-dom"
import { GET_WORKPLACES } from "../../graphql/GetWorkplaces"
import { Alert, Button, TableBody, TableCell, TableRow } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
// import SearchIcon from "@mui/icons-material/Search"
// import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
// import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
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

export interface WorkplaceFormData {
  id: string | number | null
  name: string;
}

const Workplaces = () => {
  const navigate = useNavigate()
  const { loading, error, data } = useQuery(GET_WORKPLACES)
  const [createWorkplace] = useMutation(CREATE_WORKPLACE, {
    refetchQueries: [{ query: GET_WORKPLACES }]
  })

  const [editWorkplace] = useMutation(EDIT_WORKPLACE, {
    refetchQueries: [{ query: GET_WORKPLACES }]
  })

  const [deleteWorkplace] = useMutation(DELETE_WORKPLACE, {
    refetchQueries: [{ query: GET_WORKPLACES }]
  })

  const [message, setMessage] = useState<{ type: 'error' | 'info'; message: string | null }>({ type: 'info', message: null })

  const [showNewForm, setNewForm] = useState(false)
  const [showEditForm, setEditForm] = useState(false)

  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<number | null>(null)
  const [sortedWorkplaces, setSortedWorkplaces] = useState<Workplace[]>([])

  const workplaces: Workplace[] = data?.workplaces?.workplaces || []

  //const filteredWorkplaces = filterWorkplaces(workplaces, searchQuery)

  //const sortedWorkplaces = sortWorkplaces(filteredWorkplaces, sortConfig)

  const initFormData = {
    id: null,
    name: ''
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
    await editWorkplace({ variables: { editWorkplaceId: formData.id, name: formData.name } })

    setEditForm(false)
    setMessage({ type: "info", message: "Työpaikkaa muokattu" })
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

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
    const workplace = sortedWorkplaces.find(workplace => workplace.id === selectedWorkplaceId)

    setFormData(workplace || initFormData)
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
