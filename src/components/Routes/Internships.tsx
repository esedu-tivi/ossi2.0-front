import { Box, Button, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react"
import InternshipForm from "../InternshipForm";
import { StudentData } from "../common/studentHelpers";
import { useMutation, useQuery } from "@apollo/client";
import { useConfirm } from "material-ui-confirm";
import { CREATE_INTERNSHIP } from "../../graphql/CreateInternship";
import { GET_STUDENT_INTERNSHIPS } from "../../graphql/GetStudentInternships";
import { DELETE_INTERNSHIP } from "../../graphql/DeleteInternship";

import Table, { TableHeaderPart } from "../common/Table";

import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import InfoIcon from "@mui/icons-material/Info"
import DeleteIcon from "@mui/icons-material/Delete"
import Dialog from "../common/Dialog";

export interface Internship {
  id: string | number
  startDate: Date | string
  endDate: Date | string
  info: string
  qualificationUnitId: string
  workplaceId: string
  teacherId: string
  studentId: string
  jobSupervisorId: string
}

interface InternshipData extends Internship {
  workplace: {
    id: string
    name: string
  }
}

interface ParsedInternships extends InternshipData {
  startDate: string
  endDate: string
}

export type InternshipWithoutId = Omit<Internship, "id">

const initFormData: InternshipWithoutId = {
  startDate: "",
  endDate: "",
  info: "",
  qualificationUnitId: "",
  workplaceId: "",
  teacherId: "",
  studentId: "",
  jobSupervisorId: ""
}

const Internships = ({ student }: { student: StudentData }) => {
  const [showAddInternship, setShowAddInternship] = useState(false)
  const [formData, setFormData] = useState<InternshipWithoutId>(initFormData);
  const [createInternship] = useMutation(CREATE_INTERNSHIP, { refetchQueries: [GET_STUDENT_INTERNSHIPS] })
  const [deleteInternship] = useMutation(DELETE_INTERNSHIP)
  const { data, loading } = useQuery(GET_STUDENT_INTERNSHIPS, { variables: { studentId: student.id } })
  const [sortedInternships, setSortedInternships] = useState<ParsedInternships[]>([])
  const [internship, setInternship] = useState<ParsedInternships[]>([])
  const confirm = useConfirm()
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (data && !loading) {
      const parsedInternships = data.internships?.internships.map((internship: Internship) => ({
        ...internship,
        startDate: new Date(internship.startDate).toLocaleDateString("fi-FI"),
        endDate: new Date(internship.endDate).toLocaleDateString("fi-FI")
      })) as ParsedInternships[]
      setInternship(parsedInternships)
    }

  }, [setInternship, data, loading])

  useEffect(() => {
    if (!showAddInternship || !dialogOpen) {
      setFormData(initFormData)
    }
  }, [showAddInternship, formData, dialogOpen])

  if (loading) {
    return <Box><Typography>Loading...</Typography></Box>
  }

  const handleNewFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    console.log(event.target)
    console.log(formData)
    const { confirmed } = await confirm({
      title: "Lisäys",
      description: "Oletko aivan varma, että haluat lisätä harjoittelu jakson?"
    })
    if (confirmed) {
      await createInternship({ variables: { internship: formData } })
      setDialogOpen(false)
    }
  }

  const handleDelete = async (id: string | number) => {
    console.log(id)
    const { confirmed } = await confirm({
      title: "Poisto",
      description: "Oletko aivan varma, että haluat poistaa harjoittelu jakson?"
    })

    if (confirmed) {
      await deleteInternship({
        variables: { internshipId: id },
        refetchQueries: [GET_STUDENT_INTERNSHIPS]
      })
    }
  }

  const handleDialogClose = () => setDialogOpen(false)

  const handleShowAddForm = () => {
    setShowAddInternship(true)
    setDialogOpen(true)
  }

  const headerParts: TableHeaderPart[] = [
    {
      name: "id",
      title: "#ID",
      type: "sort"
    },
    {
      name: "workplaceName",
      title: "Työpaikka",
      type: "sort",
    },
    {
      name: "info",
      title: "Info",
      type: "sort"
    },
    {
      name: "startDate",
      title: "Aloitusaika",
      type: "sort",
    },
    {
      name: "endDate",
      title: "Lopetusaika",
      type: "sort",
    },
    {
      name: "search",
      type: "search"
    }
  ]

  return (
    <>
      <Box className="button-container" sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          className="add-internship-button"
          startIcon={<AddIcon />}
          onClick={handleShowAddForm}
        >
          Lisää harjoittelujakso
        </Button>
      </Box>
      <Table<ParsedInternships>
        headerParts={headerParts}
        data={internship}
        setSortedData={setSortedInternships}
        filterField={"workplace.name"}
      >
        <TableBody>
          {sortedInternships.map(internship => (
            <TableRow key={internship.id} className="table-row">
              <TableCell>{internship.id}</TableCell>
              <TableCell>{internship.workplace?.name}</TableCell>
              <TableCell>{internship.info}</TableCell>
              <TableCell>{internship.startDate}</TableCell>
              <TableCell>{internship.endDate}</TableCell>
              <TableCell>
                <div className="button-group">
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<EditIcon />}
                    size="small"
                    onClick={() => console.log("Edit")}
                  >
                    Muokkaa
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<InfoIcon />}
                    size="small"
                    onClick={() => console.log("Info")}
                  >
                    Tiedot
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<DeleteIcon />}
                    size="small"
                    onClick={() => handleDelete(internship.id)}
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
        title={showAddInternship ? 'Lisää harjoittelu' : ''}
        open={dialogOpen}
        onClose={handleDialogClose}
      >
        {showAddInternship ? (
          <InternshipForm
            formData={formData}
            setFormData={setFormData}
            student={student}
            formSubmitHandler={handleNewFormSubmit}
          />
        ) : null}
      </Dialog>
    </>
  )
}

export default Internships
