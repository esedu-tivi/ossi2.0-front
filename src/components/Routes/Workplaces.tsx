import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@apollo/client"
import { useNavigate } from "react-router-dom"
import { GET_WORKPLACES } from "../../graphql/GetWorkplaces"
import { Alert, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import SearchIcon from "@mui/icons-material/Search"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import EditIcon from "@mui/icons-material/Edit"
import InfoIcon from "@mui/icons-material/Info"
import { filterWorkplaces, SortConfig, sortWorkplaces, Workplace } from "../common/teacherHelpers"
import WorkplaceForm from "./WorkplaceForm"
import { CREATE_WORKPLACE } from "../../graphql/CreateWorkplace"
import { EDIT_WORKPLACE } from "../../graphql/EditWorkpalce"
import { DELETE_WORKPLACE } from "../../graphql/DeleteWorkplace"
import { useConfirm } from "material-ui-confirm"

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

  const [searchQuery, setSearchQuery] = useState("");

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    order: null,
  })

  const [message, setMessage] = useState<{ type: 'error' | 'info'; message: string | null }>({ type: 'info', message: null })

  const [showNewForm, setNewForm] = useState(false)
  const [showEditForm, setEditForm] = useState(false)

  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<number | null>(null)

  const workplaces: Workplace[] = data?.workplaces?.workplaces || []

  const filteredWorkplaces = filterWorkplaces(workplaces, searchQuery)

  const sortedWorkplaces = sortWorkplaces(filteredWorkplaces, sortConfig)

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleSort = (column: string) => {
    setSortConfig((prevConfig) => {
      switch (prevConfig.order) {
        case ("asc"):
          return { column, order: "desc" }
        case ("desc"):
          return { column: null, order: null }

        default:
          return { column, order: "asc" }
      }
    })
  }

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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className="table-header">
              <TableCell
                className="table-header-cell table-header-id"
                onClick={() => handleSort("id")}
              >
                <div className="sortable-header">
                  ID#
                  {sortConfig.column === "id" && sortConfig.order === "asc" ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : sortConfig.column === "id" && sortConfig.order === "desc" ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : null}
                </div>
              </TableCell>
              <TableCell
                className="table-header-cell table-header-name"
                onClick={() => handleSort("name")}
              >
                <div className="sortable-header">
                  Työpaikan nimi
                  {sortConfig.column === "name" && sortConfig.order === "asc" ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : sortConfig.column === "name" && sortConfig.order === "desc" ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="table-header-cell">
                <div className="search-container">
                  <SearchIcon />
                  <TextField
                    placeholder="Hae…"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </TableCell>
            </TableRow>
          </TableHead>
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
                      startIcon={<InfoIcon />}
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
      </TableContainer>
    </>
  )
}

export default Workplaces
