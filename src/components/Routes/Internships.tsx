import { useEffect, useState } from "react"
import { ApolloError, useMutation, useQuery } from "@apollo/client";
import InternshipForm from "../InternshipForm";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { CREATE_INTERNSHIP } from "../../graphql/CreateInternship";
import { GET_STUDENT_INTERNSHIPS } from "../../graphql/GetStudentInternships";
import { DELETE_INTERNSHIP } from "../../graphql/DeleteInternship";
import DataTable, { type TableHeaderCell } from "@/components/common/data-table";
import { convertDateForForm } from "../../utils/convertDateForForm";
import { Internship, Student } from "../../types";
import { EDIT_INTERNSHIP } from "../../graphql/EditInternship";
import { useAlerts } from "../../context/use-alerts";
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
      firstName: string
      lastName: string
      email: string | null
      phoneNumber: string | null
    } | null
  },
  teacher: {
    id: string
    firstName: string
    lastName: string
  },
  qualificationUnit: {
    id: string,
    name: string
  } | null
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
    label: "Ohjaaja",
    type: "sort",
    sortPath: "workplace.jobSupervisor.lastName"
  },
  {
    id: 3,
    label: "Tutkinnonosa",
    type: "sort",
    sortPath: "qualificationUnit.name"
  },
  {
    id: 4,
    label: "Info",
    type: "sort",
    sortPath: "info"
  },
  {
    id: 5,
    label: "Aloitusaika",
    type: "sort",
    sortPath: "startDate"
  },
  {
    id: 6,
    label: "Lopetusaika",
    type: "sort",
    sortPath: "endDate"
  },
  {
    id: 7,
    type: "none",
    label: ""
  },
  {
    id: 8,
    type: "search",
    searchPath: "workplace.name"
  }
]

const getInternshipValidationError = (fd: InternshipWithoutId): string | null => {
  if (!fd.qualificationUnitId || !fd.workplaceId || !fd.jobSupervisorId || !fd.startDate || !fd.endDate) {
    return "Täytä pakolliset kentät (tutkinnonosa, työpaikka, työpaikkaohjaaja, aloitus- ja lopetusaika)."
  }

  const workplaceIdNum = Number(fd.workplaceId)
  const jobSupervisorIdNum = Number(fd.jobSupervisorId)
  const qualificationUnitIdNum = fd.qualificationUnitId ? Number(fd.qualificationUnitId) : null
  const studentIdNum = Number(fd.studentId)

  if (!Number.isFinite(workplaceIdNum) || !Number.isFinite(jobSupervisorIdNum) || (fd.qualificationUnitId && !Number.isFinite(qualificationUnitIdNum))) {
    return "Tallennus epäonnistui: työpaikan/ohjaajan/tutkinnonosan ID ei ole numero."
  }

  if (!Number.isFinite(studentIdNum)) {
    return "Tallennus epäonnistui: opiskelijan ID ei ole numero."
  }

  return null
}

const buildInternshipVars = (fd: InternshipWithoutId): InternshipWithoutId => {
  const qualificationUnitIdNum = fd.qualificationUnitId ? Number(fd.qualificationUnitId) : null

  return {
    ...fd,
    workplaceId: String(Number(fd.workplaceId)),
    jobSupervisorId: String(Number(fd.jobSupervisorId)),
    qualificationUnitId: fd.qualificationUnitId ? String(qualificationUnitIdNum) : "",
    studentId: String(Number(fd.studentId)),
    teacherId: "",
  }
}

const getMutationErrorMessage = (error: unknown): string => {
  if (error instanceof ApolloError) {
    return error.graphQLErrors?.[0]?.message || error.message || "Tuntematon virhe"
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Tuntematon virhe"
}

const Internships = ({ student }: { student: Student }) => {
  const [showAddInternship, setShowAddInternship] = useState(false)
  const [showEditInternship, setShowEditInternship] = useState(false)
  const [formData, setFormData] = useState<InternshipWithoutId>(initFormData);
  const [selectedInternshipId, setSelectedInternshipId] = useState<string | number | null>(null)
  const [createInternship, { data: createData, error: createError, loading: createLoading }] = useMutation(
    CREATE_INTERNSHIP,
    {
      refetchQueries: [{ query: GET_STUDENT_INTERNSHIPS, variables: { studentId: student.id } }],
      awaitRefetchQueries: true
    }
  )
  const [deleteInternship, { data: deleteData, error: deleteError, loading: deleteLoading }] = useMutation(DELETE_INTERNSHIP)
  const [editInternship, { data: editData, error: editError, loading: editLoading }] = useMutation(
    EDIT_INTERNSHIP,
    {
      refetchQueries: [{ query: GET_STUDENT_INTERNSHIPS, variables: { studentId: student.id } }],
      awaitRefetchQueries: true
    }
  )
  const { data, loading } = useQuery(GET_STUDENT_INTERNSHIPS, {
    variables: { studentId: student.id },
    fetchPolicy: "network-only",
  })
  const [internships, setInternships] = useState<ParsedInternships[]>([])
  const { confirm, ConfirmDialog } = useConfirmDialog()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<string | null>(null)
  const { addAlert } = useAlerts()
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [selectedInfoInternship, setSelectedInfoInternship] = useState<ParsedInternships | null>(null)

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
      setFormData(initFormData)
      setSelectedWorkplaceId(null)
    }
  }, [dialogOpen])

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

    const validationError = getInternshipValidationError(formData)
    if (validationError) {
      addAlert(validationError, "error", true)
      return
    }

    const confirmed = await confirm({
      title: "Lisäys",
      description: "Oletko aivan varma, että haluat lisätä harjoittelu jakson?"
    })
    if (!confirmed) return

    try {
      await createInternship({ variables: { internship: buildInternshipVars(formData) } })
      setDialogOpen(false)
    } catch (e) {
      addAlert(`Lisäyksessä tapahtui virhe: ${getMutationErrorMessage(e)}`, "error", true)
    }
  }

  const handleDelete = async (id: string | number) => {
    const confirmed = await confirm({
      title: "Poisto",
      description: "Oletko aivan varma, että haluat poistaa harjoittelu jakson?"
    })

    if (confirmed) {
      await deleteInternship({
        variables: { internshipId: id },
        refetchQueries: [{ query: GET_STUDENT_INTERNSHIPS, variables: { studentId: student.id } }],
        awaitRefetchQueries: true
      })
    }
  }

  const handleEditFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const validationError = getInternshipValidationError(formData)
    if (validationError) {
      addAlert(validationError, "error", true)
      return
    }

    const confirmed = await confirm({
      title: "Muokkaus",
      description: "Oletko aivan varma, että haluat muokata harjoittelu jaksoa?"
    })
    if (!confirmed) return

    try {
      await editInternship({ variables: { internshipId: selectedInternshipId, internship: buildInternshipVars(formData) } })
      setDialogOpen(false)
    } catch (e) {
      addAlert(`Muokkauksessa tapahtui virhe: ${getMutationErrorMessage(e)}`, "error", true)
    }
  }

  const handleShowAddForm = () => {
    setShowAddInternship(true)
    setDialogOpen(true)
  }

  const handleShowEditForm = async (id: number | string) => {
    setSelectedInternshipId(id)
    const internship = data.internships?.internships.find((row: InternshipData) => row.id === id)

    if (internship) {
      if (!internship.workplace?.id) {
        addAlert("Muokkaus epäonnistui: työpaikka puuttuu", "error", true)
        return
      }

      setSelectedWorkplaceId(internship.workplace.id)
      setFormData({
        info: internship.info || "",
        startDate: convertDateForForm(internship.startDate),
        endDate: convertDateForForm(internship.endDate),
        qualificationUnitId: internship.qualificationUnit?.id || '',
        workplaceId: internship.workplace?.id || '',
        teacherId: "",
        studentId: student.id.toString(),
        jobSupervisorId: internship.workplace?.jobSupervisor?.id || '',
      })
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
                <TableCell>
                  {internship.workplace?.jobSupervisor
                    ? `${internship.workplace.jobSupervisor.firstName} ${internship.workplace.jobSupervisor.lastName}`
                    : ""}
                </TableCell>
                <TableCell>{internship.qualificationUnit?.name || ""}</TableCell>
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
                      onClick={() => {
                        setSelectedInfoInternship(internship)
                        setInfoDialogOpen(true)
                      }}
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

      <AppDialog title="Tiedot" open={infoDialogOpen} onClose={setInfoDialogOpen}>
        {selectedInfoInternship ? (
          <div className="space-y-2 text-left text-sm">
            <p>ID: {selectedInfoInternship.id}</p>
            <p>Työpaikka: {selectedInfoInternship.workplace?.name ?? ""}</p>
            <p>
              Ohjaaja: {selectedInfoInternship.workplace?.jobSupervisor
                ? `${selectedInfoInternship.workplace.jobSupervisor.firstName} ${selectedInfoInternship.workplace.jobSupervisor.lastName}`
                : ""}
            </p>
            <p>Sähköposti: {selectedInfoInternship.workplace?.jobSupervisor?.email ?? ""}</p>
            <p>Puhelin: {selectedInfoInternship.workplace?.jobSupervisor?.phoneNumber ?? ""}</p>
            <p>Tutkinnonosa: {selectedInfoInternship.qualificationUnit?.name ?? ""}</p>
            <p>Info: {selectedInfoInternship.info ?? ""}</p>
            <p>Aloitusaika: {selectedInfoInternship.startDate}</p>
            <p>Lopetusaika: {selectedInfoInternship.endDate}</p>
          </div>
        ) : null}
      </AppDialog>

      <ConfirmDialog />
    </>
  )
}

export default Internships
