import { useEffect, useState } from "react"
import InternshipForm from "../InternshipForm";
import { useMutation, useQuery } from "@apollo/client";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { CREATE_INTERNSHIP } from "../../graphql/CreateInternship";
import { GET_STUDENT_INTERNSHIPS } from "../../graphql/GetStudentInternships";
import { DELETE_INTERNSHIP } from "../../graphql/DeleteInternship";
import DataTable, { type TableHeaderCell } from "@/components/common/data-table";
import { convertDateForForm } from "../../utils/convertDateForForm";
import { Internship, Student } from "../../types";
import { EDIT_INTERNSHIP } from "../../graphql/EditInternship";
import { useAlerts } from "../../context/AlertContext";
import { Plus, Pencil, Info, Trash2 } from "lucide-react";
import AppDialog from "@/components/common/app-dialog";
import { convertDateToString } from "../../utils/convertDateToString";
import { Button } from "@/components/ui/button";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";

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
    id: 0,
    label: "#ID",
    type: "sort",
    sortPath: "id",
  },
  {
    id: 1,
    label: "Työpaikka",
    type: "sort",
    sortPath: "workplace.name"
  },
  {
    id: 2,
    label: "Info",
    type: "sort",
    sortPath: "info"
  },
  {
    id: 3,
    label: "Aloitusaika",
    type: "sort",
    sortPath: "startDate"
  },
  {
    id: 4,
    label: "Lopetusaika",
    type: "sort",
    sortPath: "endDate"
  },
  {
    id: 5,
    type: "search",
    searchPath: "workplace.name"
  }
]

const Internships = ({ student }: { student: Student }) => {
  const [showAddInternship, setShowAddInternship] = useState(false)
  const [showEditInternship, setShowEditInternship] = useState(false)
  const [formData, setFormData] = useState<InternshipWithoutId | Internship>(initFormData);
  const [selectedInternshipId, setSelectedInternshipId] = useState<string | number | null>(null)
  const [createInternship, { data: createData, error: createError, loading: createLoading }] = useMutation(CREATE_INTERNSHIP, { refetchQueries: [GET_STUDENT_INTERNSHIPS] })
  const [deleteInternship, { data: deleteData, error: deleteError, loading: deleteLoading }] = useMutation(DELETE_INTERNSHIP)
  const [editInternship, { data: editData, error: editError, loading: editLoading }] = useMutation(EDIT_INTERNSHIP, { refetchQueries: [GET_STUDENT_INTERNSHIPS] })
  const { data, loading } = useQuery(GET_STUDENT_INTERNSHIPS, { variables: { studentId: student.id } })
  const [internships, setInternships] = useState<ParsedInternships[]>([])
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<string | null>(null)
  const { addAlert } = useAlerts()

  useEffect(() => {
    if (data && !loading) {
      const parsedInternships = data.internships?.internships.map((internship: Internship) => ({
        ...internship,
        startDate: convertDateToString(internship.startDate),
        endDate: convertDateToString(internship.endDate)
      })) as ParsedInternships[]
      setInternships(parsedInternships)
    }

  }, [data, loading])

  useEffect(() => {
    if (!dialogOpen) {
      setShowAddInternship(false)
      setShowEditInternship(false)
      if (!showAddInternship) {
        setFormData(initFormData)
      }
    }
  }, [showAddInternship, formData, dialogOpen])

  useEffect(() => {
    if (!editLoading) {
      if (editData) {
        addAlert(`Opiskelijan '${student.firstName} ${student.lastName}' harjoittelujakson muokkaus onnistui`, 'success')
      }
      if (editError) {
        addAlert(`Muokkauksessa tapahtui virhe: ${editError.message}`, 'error', true)
      }
    }

  }, [editData, editError, editLoading, addAlert, student])

  useEffect(() => {
    if (!deleteLoading) {
      if (deleteData) {
        addAlert(`Opiskelijan '${student.firstName} ${student.lastName}' harjoittelujakson poisto onnistui`, 'success')
      }
      if (deleteError) {
        addAlert(`Poistamisessa tapahtui virhe: ${deleteError.message}`, 'error', true)
      }
    }
  }, [deleteData, deleteError, deleteLoading, addAlert, student])

  useEffect(() => {
    if (!createLoading) {
      if (createData) {
        addAlert(`Harjoittelujakson lisäys onnistui opiskelijalle '${student.firstName} ${student.lastName}'`, 'success')
      }
      if (createError) {
        addAlert(`Lisäyksessä tapahtui virhe: ${createError.message}`, 'error', true)
      }
    }
  }, [createData, createError, createLoading, addAlert, student])



  if (loading) {
    return <p className="p-4">Loading...</p>
  }

  const handleNewFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const confirmed = await confirm({
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
    const confirmed = await confirm({
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

  const handleEditFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const confirmed = await confirm({
      title: "Muokkaus",
      description: "Oletko aivan varma, että haluat muokata harjoittelu jaksoa?"
    })
    if (confirmed) {
      await editInternship({ variables: { internshipId: selectedInternshipId, internship: formData } })
      setDialogOpen(false)
    }
  }

  const handleShowAddForm = () => {
    setShowAddInternship(true)
    setDialogOpen(true)
  }

  const handleShowEditForm = async (id: number | string) => {
    setSelectedInternshipId(id)
    const internship = data.internships?.internships.find((internship: InternshipData) => internship.id === id)

    if (internship) {
      setSelectedWorkplaceId(internship.workplace.id)
      const parsedInternship: InternshipWithoutId = {
        info: internship.info || "",
        startDate: convertDateForForm(internship.startDate),
        endDate: convertDateForForm(internship.endDate),
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
      <div className="mt-2 mb-4">
        <Button onClick={handleShowAddForm}>
          <Plus className="mr-2 h-4 w-4" />
          Lisää harjoittelujakso
        </Button>
      </div>
      <DataTable<ParsedInternships>
        headerCells={headerCells}
        data={internships}
      >
        {rows => (
          <TableBody>
            {rows.map(internship => (
              <TableRow key={internship.id}>
                <TableCell>{internship.id}</TableCell>
                <TableCell>{internship.workplace?.name}</TableCell>
                <TableCell>{internship.info}</TableCell>
                <TableCell>{internship.startDate}</TableCell>
                <TableCell>{internship.endDate}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowEditForm(internship.id)}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Muokkaa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => console.log("Info")}
                    >
                      <Info className="mr-1 h-3 w-3" />
                      Tiedot
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(internship.id)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Poista
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </DataTable>
      <AppDialog
        title={showAddInternship ? 'Lisää harjoittelu' : showEditInternship ? 'Muokkaa harjoittelujaksoa' : ''}
        open={dialogOpen}
        onClose={setDialogOpen}
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
      </AppDialog>
      <ConfirmDialog />
    </>
  )
}

export default Internships
