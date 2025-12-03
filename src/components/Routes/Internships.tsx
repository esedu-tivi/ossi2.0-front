import { Box, Button, TableBody, TableCell, TableRow } from "@mui/material";
import { useEffect, useState } from "react"
import InternshipForm from "../InternshipForm";
import { StudentData } from "../common/studentHelpers";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_INTERNSHIP } from "../../graphql/CreateInternship";
import { GET_STUDENT_INTERNSHIPS } from "../../graphql/GetStudentInternships";
import Table, { TableHeaderPart } from "../common/Table";

import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import InfoIcon from "@mui/icons-material/Info"
import DeleteIcon from "@mui/icons-material/Delete"
import { useConfirm } from "material-ui-confirm";

export interface Internship {
  id: string | number | null
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
  const [showAddInternship, setShowInternship] = useState(false)
  const [formData, setFormData] = useState<InternshipWithoutId>(initFormData);
  const [createInternship] = useMutation(CREATE_INTERNSHIP, { refetchQueries: [GET_STUDENT_INTERNSHIPS] })
  const { data, loading } = useQuery(GET_STUDENT_INTERNSHIPS, { variables: { studentId: student.id } })
  const [sortedInternships, setSortedInternships] = useState<ParsedInternships[]>([])
  const [internship, setInternship] = useState<ParsedInternships[]>([])
  const confirm = useConfirm()

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
    if (!showAddInternship) {
      setFormData(initFormData)
    }
  }, [showAddInternship, formData])

  if (loading) {
    return <div>Loading...</div>
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
      setShowInternship(false)
    }
  }

  if (showAddInternship) {
    return <InternshipForm
      formTitle="Lisää harjoittelujakso"
      formData={formData}
      setFormData={setFormData}
      student={student}
      setShowForm={setShowInternship}
      formSubmitHandler={handleNewFormSubmit}
    />
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
          onClick={() => { setShowInternship(true) }}
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
              <TableCell>{internship.workplace.name}</TableCell>
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
                    onClick={() => console.log("Delete")}
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

export default Internships
