import { Box, Button, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react"
import InternshipForm from "../InternshipForm";
import { StudentData } from "../common/studentHelpers";
import { useMutation, useQuery } from "@apollo/client";
import { useConfirm } from "material-ui-confirm";
import { CREATE_INTERNSHIP } from "../../graphql/CreateInternship";
import { GET_STUDENT_INTERNSHIPS } from "../../graphql/GetStudentInternships";
import { DELETE_INTERNSHIP } from "../../graphql/DeleteInternship";

import Table, { TableHeaderCell } from "../common/Table";

import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import InfoIcon from "@mui/icons-material/Info"
import DeleteIcon from "@mui/icons-material/Delete"
import Dialog from "../common/Dialog";
import { convertDateForForm } from "../../utils/convertDateForForm";

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
    jobSupervisor: {
      id: string
      fistName: string
      lastName: string
    }
  },
  teacher: {
    id: string
    firstName: string
    lastName: string
  },
  qualificationUnit: {
    id: string,
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

const headerCells: readonly TableHeaderCell[] = [
  {
    label: "#ID",
    type: "sort",
    sortPath: "id"
  },
  {
    label: "Työpaikka",
    type: "sort",
    sortPath: "workplace.name"
  },
  {
    label: "Info",
    type: "sort",
    sortPath: "info"
  },
  {
    label: "Aloitusaika",
    type: "sort",
    sortPath: "startDate"
  },
  {
    label: "Lopetusaika",
    type: "sort",
    sortPath: "endDate"
  },
  {
    type: "search"
  }
]

const Internships = ({ student }: { student: StudentData }) => {
  const [showAddInternship, setShowAddInternship] = useState(false)
  const [showEditInternship, setShowEditInternship] = useState(false)
  const [formData, setFormData] = useState<InternshipWithoutId>(initFormData);
  const [createInternship] = useMutation(CREATE_INTERNSHIP, { refetchQueries: [GET_STUDENT_INTERNSHIPS] })
  const [deleteInternship] = useMutation(DELETE_INTERNSHIP)
  const { data, loading } = useQuery(GET_STUDENT_INTERNSHIPS, { variables: { studentId: student.id } })
  const [sortedInternships, setSortedInternships] = useState<ParsedInternships[]>([])
  const [internships, setInternships] = useState<ParsedInternships[]>([])
  const confirm = useConfirm()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<string | null>(null)

  useEffect(() => {
    if (data && !loading) {
      const parsedInternships = data.internships?.internships.map((internship: Internship) => ({
        ...internship,
        startDate: new Date(internship.startDate).toLocaleDateString("fi-FI"),
        endDate: new Date(internship.endDate).toLocaleDateString("fi-FI")
      })) as ParsedInternships[]
      setInternships(parsedInternships)
    }

  }, [setInternships, data, loading])

  useEffect(() => {
    if (!dialogOpen) {
      setShowAddInternship(false)
      setShowEditInternship(false)
      if (!showAddInternship) {
        setFormData(initFormData)
      }
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

  const handleEditFormSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    console.log(formData)
  }

  const handleDialogClose = () => setDialogOpen(false)

  const handleShowAddForm = () => {
    setShowAddInternship(true)
    setDialogOpen(true)
  }

  const handleShowEditForm = async (id: number | string) => {
    const internship = data.internships?.internships.find((internship: InternshipData) => internship.id === id)

    if (internship) {
      const startDate = new Date(internship.startDate)
      const endDate = new Date(internship.endDate)

      setSelectedWorkplaceId(internship.workplace.id)
      const parsedInternship = {
        info: internship.info || "",
        startDate: convertDateForForm(startDate),
        endDate: convertDateForForm(endDate),
        qualificationUnitId: internship.qualificationUnit?.id || '',
        workplaceId: internship.workplace.id || '',
        teacherId: internship.teacher.id,
        studentId: student.id.toString(),
        jobSupervisorId: internship.workplace.jobSupervisor.id || '',
      }
      setFormData(parsedInternship)
      setShowEditInternship(true)
      setDialogOpen(true)
    }
  }

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
        headerCells={headerCells}
        data={internships}
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
                    onClick={() => handleShowEditForm(internship.id)}
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
        title={showAddInternship ? 'Lisää harjoittelu' : showEditInternship ? 'Muokkaa harjoittelujaksoa' : ''}
        open={dialogOpen}
        onClose={handleDialogClose}
      >
        {showAddInternship ? (
          <InternshipForm
            formData={formData}
            setFormData={setFormData}
            student={student}
            formSubmitHandler={handleNewFormSubmit}
            setWorkplaceId={setSelectedWorkplaceId}
            workplaceId={selectedWorkplaceId}
          />
        ) : null}
        {showEditInternship ? (
          <InternshipForm
            formData={formData}
            setFormData={setFormData}
            student={student}
            formSubmitHandler={handleEditFormSubmit}
            setWorkplaceId={setSelectedWorkplaceId}
            workplaceId={selectedWorkplaceId}
          />
        ) : null}
      </Dialog>
    </>
  )
}

export default Internships
