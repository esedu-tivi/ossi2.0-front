import { Box, Button, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react"
import InternshipForm from "../InternshipForm";
import { ApolloError, useMutation, useQuery } from "@apollo/client";
import { useConfirm } from "material-ui-confirm";
import { CREATE_INTERNSHIP } from "../../graphql/CreateInternship";
import { GET_STUDENT_INTERNSHIPS } from "../../graphql/GetStudentInternships";
import { DELETE_INTERNSHIP } from "../../graphql/DeleteInternship";
import Table, { TableHeaderCell } from "../common/Table";
import { convertDateForForm } from "../../utils/convertDateForForm";
import { Internship, Student } from "../../types";
import { EDIT_INTERNSHIP } from "../../graphql/EditInternship";
import { GET_JOB_SUPERVISORS } from "../../graphql/GetJobSupervisors";
import { useAlerts } from "../../context/AlertContext";
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import InfoIcon from "@mui/icons-material/Info"
import DeleteIcon from "@mui/icons-material/Delete"
import Dialog from "../common/Dialog";
import { convertDateToString } from "../../utils/convertDateToString";

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

const Internships = ({ student }: { student: Student }) => {
  const [showAddInternship, setShowAddInternship] = useState(false)
  const [showEditInternship, setShowEditInternship] = useState(false)
  const [formData, setFormData] = useState<InternshipWithoutId | Internship>(initFormData);
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
  const { data: jobSupervisorsData } = useQuery(GET_JOB_SUPERVISORS)
  const [internships, setInternships] = useState<ParsedInternships[]>([])
  const confirm = useConfirm()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<string | null>(null)
  const { addAlert } = useAlerts()
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [selectedInfoInternship, setSelectedInfoInternship] = useState<ParsedInternships | null>(null)

  const allJobSupervisors = jobSupervisorsData?.jobSupervisors?.jobSupervisors || []

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
    return <Box><Typography>Loading...</Typography></Box>
  }

  const handleNewFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const fd = formData as InternshipWithoutId
    if (!fd.qualificationUnitId || !fd.workplaceId || !fd.jobSupervisorId || !fd.startDate || !fd.endDate) {
      addAlert("Täytä pakolliset kentät (tutkinnonosa, työpaikka, työpaikkaohjaaja, aloitus- ja lopetusaika).", "error")
      return
    }
    const workplaceIdNum = Number(fd.workplaceId)
    const jobSupervisorIdNum = Number(fd.jobSupervisorId)
    const qualificationUnitIdNum = fd.qualificationUnitId ? Number(fd.qualificationUnitId) : null
    const studentIdNum = Number(fd.studentId)
    if (!Number.isFinite(workplaceIdNum) || !Number.isFinite(jobSupervisorIdNum) || (fd.qualificationUnitId && !Number.isFinite(qualificationUnitIdNum))) {
      addAlert("Tallennus epäonnistui: työpaikan/ohjaajan/tutkinnonosan ID ei ole numero (tarkista valinnat).", "error", true)
      return
    }
    if (!Number.isFinite(studentIdNum)) {
      addAlert("Tallennus epäonnistui: opiskelijan ID ei ole numero (tarkista opiskelijan tiedot).", "error", true)
      return
    }
    const internshipVars: InternshipWithoutId = {
      ...fd,
      workplaceId: String(workplaceIdNum),
      jobSupervisorId: String(jobSupervisorIdNum),
      qualificationUnitId: fd.qualificationUnitId ? String(qualificationUnitIdNum) : "",
      studentId: String(studentIdNum),
      teacherId: "",
    }
    try {
      console.log("createInternship payload", internshipVars)
      await createInternship({ variables: { internship: internshipVars } })
      setDialogOpen(false)
    } catch (e) {
      const err = e as ApolloError
      console.error("createInternship failed", {
        message: err?.message,
        graphQLErrors: err?.graphQLErrors?.map(ge => ({
          message: ge.message,
          path: ge.path,
          extensions: ge.extensions,
        })),
        networkError: err?.networkError,
      })
      console.error("createInternship graphQLErrors raw", JSON.stringify(err?.graphQLErrors ?? [], null, 2))
      const gqlMsg = err?.graphQLErrors?.[0]?.message
      addAlert(`Lisäyksessä tapahtui virhe: ${gqlMsg || err?.message || "Tuntematon virhe"}`, "error", true)
      return
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
        refetchQueries: [{ query: GET_STUDENT_INTERNSHIPS, variables: { studentId: student.id } }],
        awaitRefetchQueries: true
      })
    }
  }

  const handleEditFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const fd = formData as InternshipWithoutId
    if (!fd.qualificationUnitId || !fd.workplaceId || !fd.jobSupervisorId || !fd.startDate || !fd.endDate) {
      addAlert("Täytä pakolliset kentät (tutkinnonosa, työpaikka, työpaikkaohjaaja, aloitus- ja lopetusaika).", "error")
      return
    }
    const workplaceIdNum = Number(fd.workplaceId)
    const jobSupervisorIdNum = Number(fd.jobSupervisorId)
    const qualificationUnitIdNum = fd.qualificationUnitId ? Number(fd.qualificationUnitId) : null
    const studentIdNum = Number(fd.studentId)
    if (!Number.isFinite(workplaceIdNum) || !Number.isFinite(jobSupervisorIdNum) || (fd.qualificationUnitId && !Number.isFinite(qualificationUnitIdNum))) {
      addAlert("Tallennus epäonnistui: työpaikan/ohjaajan/tutkinnonosan ID ei ole numero (tarkista valinnat).", "error", true)
      return
    }
    if (!Number.isFinite(studentIdNum)) {
      addAlert("Tallennus epäonnistui: opiskelijan ID ei ole numero (tarkista opiskelijan tiedot).", "error", true)
      return
    }
    const internshipVars: InternshipWithoutId = {
      ...fd,
      workplaceId: String(workplaceIdNum),
      jobSupervisorId: String(jobSupervisorIdNum),
      qualificationUnitId: fd.qualificationUnitId ? String(qualificationUnitIdNum) : "",
      studentId: String(studentIdNum),
      teacherId: "",
    }

    const { confirmed } = await confirm({
      title: "Muokkaus",
      description: "Oletko aivan varma, että haluat muokata harjoittelu jaksoa?"
    })
    if (confirmed) {
      try {
        await editInternship({ variables: { internshipId: selectedInternshipId, internship: internshipVars } })
        setDialogOpen(false)
      } catch (e) {
        const err = e as ApolloError
        console.error("editInternship failed", {
          message: err?.message,
          graphQLErrors: err?.graphQLErrors?.map(ge => ({
            message: ge.message,
            path: ge.path,
            extensions: ge.extensions,
          })),
          networkError: err?.networkError,
        })
        const gqlMsg = err?.graphQLErrors?.[0]?.message
        addAlert(`Muokkauksessa tapahtui virhe: ${gqlMsg || err?.message || "Tuntematon virhe"}`, "error", true)
      }
    }
  }

  const handleDialogClose = () => setDialogOpen(false)
  const handleInfoDialogClose = () => setInfoDialogOpen(false)

  const handleShowAddForm = () => {
    setShowAddInternship(true)
    setDialogOpen(true)
  }

  const handleShowEditForm = async (id: number | string) => {
    setSelectedInternshipId(id)
    const internship = data.internships?.internships.find((internship: InternshipData) => internship.id === id)

    if (internship) {
      if (!internship.workplace?.id) {
        addAlert("Muokkaus epäonnistui: työpaikka puuttuu", "error", true)
        return
      }
      setSelectedWorkplaceId(internship.workplace.id)
      const parsedInternship: InternshipWithoutId = {
        info: internship.info || "",
        startDate: convertDateForForm(internship.startDate),
        endDate: convertDateForForm(internship.endDate),
        qualificationUnitId: internship.qualificationUnit?.id || '',
        workplaceId: internship.workplace?.id || '',
        teacherId: "",
        studentId: student.id.toString(),
        jobSupervisorId: internship.workplace?.jobSupervisor?.id || '',
      }
      setFormData(parsedInternship)
      setShowEditInternship(true)
      setDialogOpen(true)
    }
  }

  const handleShowInfo = (internship: ParsedInternships) => {
    setSelectedInfoInternship(internship)
    setInfoDialogOpen(true)
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
      >
        {rows => (
          <TableBody>
            {rows.map(internship => (
              <TableRow key={internship.id} className="table-row">
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
                  <Box className="button-group">
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
                      onClick={() => handleShowInfo(internship)}
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
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
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
      <Dialog
        title="Tiedot"
        open={infoDialogOpen}
        onClose={handleInfoDialogClose}
      >
        {selectedInfoInternship ? (
          (() => {
            const supervisorFromInternship = selectedInfoInternship.workplace?.jobSupervisor || null
            const supervisorFromList = allJobSupervisors.find(
              (js: { id: string }) =>
                supervisorFromInternship && String(js.id) === String(supervisorFromInternship.id)
            ) as { firstName: string; lastName: string; email?: string; phoneNumber?: string } | undefined
            const supervisor = supervisorFromList || supervisorFromInternship
            return (
          <Box sx={{ textAlign: "left" }}>
            <Typography sx={{ mb: 1 }}>ID: {selectedInfoInternship.id}</Typography>
            <Typography sx={{ mb: 1 }}>
              Työpaikka: {selectedInfoInternship.workplace?.name}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              Ohjaaja: {supervisor ? `${supervisor.firstName} ${supervisor.lastName}` : ""}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              Sähköposti: {supervisor?.email || ""}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              Puhelin: {supervisor?.phoneNumber || ""}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              Tutkinnonosa: {selectedInfoInternship.qualificationUnit?.name || ""}
            </Typography>
            <Typography sx={{ mb: 1 }}>Info: {selectedInfoInternship.info || ""}</Typography>
            <Typography sx={{ mb: 1 }}>Aloitusaika: {selectedInfoInternship.startDate}</Typography>
            <Typography sx={{ mb: 1 }}>Lopetusaika: {selectedInfoInternship.endDate}</Typography>
          </Box>
            )
          })()
        ) : null}
      </Dialog>
    </>
  )
}

export default Internships
