import { Box, Button, IconButton, MenuItem, TextField, Typography } from "@mui/material"
import { InternshipWithoutId } from "./Routes/Internships"
import formStyles from "../styles/formStyles"
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"

import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import buttonStyles from "../styles/buttonStyles";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { GET_INTERNSHIP_DATA } from "../graphql/GetInternshipData";
import { GET_JOB_SUPERVISORS_BY_WORKPLACE } from "../graphql/GetJobSupervisorsByWorkplace";
import { JobSupervisor, Student, Workplace } from "../types";
import Autocomplete, { Option } from "./common/Autocomplete";
import { CREATE_WORKPLACE } from "../graphql/CreateWorkplace";
import WorkplaceForm, { WorkplaceFormData } from "./WorkplaceForm";
import Dialog from "./common/Dialog";
import { CREATE_JOB_SUPERVISOR } from "../graphql/CreateJobSupervisor";
import JobSupervisorForm from "./JobSupervisorForm";
import { UPDATE_JOB_SUPERVISOR_ASSIGNS } from "../graphql/UpdateJobSupervisorAssigns";
import { GET_JOB_SUPERVISORS } from "../graphql/GetJobSupervisors";
import { EDIT_JOB_SUPERVISOR } from "../graphql/EditJobSupervisor";

interface InternshipFormProps {
  formSubmitHandler: (event: React.FormEvent<HTMLFormElement>) => void
  student: Student
  formData: InternshipWithoutId
  setFormData: Dispatch<SetStateAction<InternshipWithoutId>>
  workplaceId: string | null,
  setWorkplaceId: Dispatch<SetStateAction<string | null>>
}

const InternshipForm = ({
  formSubmitHandler,
  formData,
  setFormData,
  student,
  workplaceId,
  setWorkplaceId,
}: InternshipFormProps) => {
  const { loading, data, error, refetch } = useQuery(GET_INTERNSHIP_DATA)
  const [loadSupervisors, jobSupervisorsData] = useLazyQuery(GET_JOB_SUPERVISORS_BY_WORKPLACE)
  const { data: allJobSupervisorsData } = useQuery(GET_JOB_SUPERVISORS)
  const [createWorkplace] = useMutation(CREATE_WORKPLACE, { refetchQueries: [{ query: GET_INTERNSHIP_DATA }] })
  const [createJobSupervisor] = useMutation(CREATE_JOB_SUPERVISOR, {
    refetchQueries: [GET_JOB_SUPERVISORS],
  })
  const [editJobSupervisor] = useMutation(EDIT_JOB_SUPERVISOR, { refetchQueries: [GET_JOB_SUPERVISORS] })
  const [updateSupervisorAssigns] = useMutation(UPDATE_JOB_SUPERVISOR_ASSIGNS)

  const [showNewWorkplaceForm, setShowNewWorkplaceForm] = useState(false)
  const [showNewJobSupervisorForm, setShowNewJobSupervisorForm] = useState(false)
  const [showEditJobSupervisorForm, setShowEditJobSupervisorForm] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [jobSupervisorOptionsState, setJobSupervisorOptionsState] = useState<Option[]>([])
  const [jobSupervisorEditId, setJobSupervisorEditId] = useState<string | null>(null)

  const initWorkplaceFormData: WorkplaceFormData = useMemo(() => ({
    id: null,
    name: "",
    jobSupervisorIds: []
  }), [])

  const initJobSupervisorFormData: JobSupervisor = useMemo(() => ({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  }), [])

  const [workplaceFormData, setWorkplaceFormData] = useState<WorkplaceFormData>(initWorkplaceFormData)
  const [jobSupervisorFormData, setJobSupervisorFormData] = useState<JobSupervisor>(initJobSupervisorFormData)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData: InternshipWithoutId) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  useEffect(() => {
    if (!loading && !error && data) {
      setFormData((prevFormData: InternshipWithoutId) => ({
        ...prevFormData,
        studentId: student.id as unknown as string,
      }))
    }
  }, [data, setFormData, student, loading, error])

  useEffect(() => {
    const effectiveWorkplaceId = formData.workplaceId || workplaceId
    if (effectiveWorkplaceId) {
      void loadSupervisors({ variables: { workplaceId: effectiveWorkplaceId } }).catch(() => null)
    }
  }, [formData.workplaceId, workplaceId, loadSupervisors])

  useEffect(() => {
    if (showNewWorkplaceForm || showNewJobSupervisorForm || showEditJobSupervisorForm) {
      setDialogOpen(true)
    } else {
      setDialogOpen(false)
    }
  }, [showNewWorkplaceForm, showNewJobSupervisorForm, showEditJobSupervisorForm])

  const handleEditJobSupervisor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const effectiveWorkplaceId = formData.workplaceId || workplaceId
    if (!effectiveWorkplaceId) return
    if (!jobSupervisorEditId) return

    await editJobSupervisor({
      variables: {
        jobSupervisorId: jobSupervisorEditId,
        jobSupervisor: jobSupervisorFormData,
      },
    }).catch(() => null)

    await loadSupervisors({ variables: { workplaceId: effectiveWorkplaceId } }).catch(() => null)
    setShowEditJobSupervisorForm(false)
    setJobSupervisorEditId(null)
  }

  const teacher = data?.me?.user || null
  const workplaces = data?.workplaces?.workplaces || []
  const qualificationUnits = data?.units?.units || []

  const jobSupervisors = jobSupervisorsData.data?.jobSupervisorsByWorkplace.jobSupervisors || []

  const workplaceOptions: Option[] = workplaces.map((workplace: Workplace) => ({
    id: workplace.id,
    name: workplace.name
  }))

  const jobSupervisorOptions: Option[] = jobSupervisors?.map((jobSupervisor: JobSupervisor) => ({
    id: jobSupervisor.id,
    name: `${jobSupervisor.firstName} ${jobSupervisor.lastName}`
  }))

  const allJobSupervisorOptions: Option[] = (allJobSupervisorsData?.jobSupervisors?.jobSupervisors || []).map((js: JobSupervisor & { id: string }) => ({
    id: js.id,
    name: `${js.firstName} ${js.lastName}`
  }))

  const handleCreateWorkplace = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const response = await createWorkplace({ variables: { name: workplaceFormData.name } })
      const created = response.data?.createWorkplace?.workplace
      if (created?.id) {
        await refetch().catch(() => null)
        setFormData((prev) => ({ ...prev, workplaceId: String(created.id), jobSupervisorId: "" }))
        setWorkplaceId(String(created.id))
        setShowNewWorkplaceForm(false)
      }
    } catch {
      return
    }
  }

  const handleCreateJobSupervisor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const effectiveWorkplaceId = formData.workplaceId || workplaceId
    if (!effectiveWorkplaceId) return

    const response = await createJobSupervisor({ variables: { jobSupervisor: jobSupervisorFormData } })
    const created = response.data?.createJobSupervisor?.createdJobSupervisor
    if (!created?.id) return

    const createdOption: Option = {
      id: created.id,
      name: `${created.firstName} ${created.lastName}`.trim()
    }

    await updateSupervisorAssigns({
      variables: {
        workplaceId: effectiveWorkplaceId,
        assignIds: [created.id],
        unassignIds: []
      }
    }).catch(() => null)

    await loadSupervisors({ variables: { workplaceId: effectiveWorkplaceId } }).catch(() => null)
    setJobSupervisorOptionsState((prev) => {
      const next = prev.filter(o => String(o.id) !== String(createdOption.id))
      next.unshift(createdOption)
      return next
    })
    setFormData((prev) => ({ ...prev, jobSupervisorId: String(created.id) }))
    setShowNewJobSupervisorForm(false)
  }

  useEffect(() => {
    if (jobSupervisorOptions.length > 0) {
      setJobSupervisorOptionsState(jobSupervisorOptions)
      return
    }
    if (!jobSupervisorsData.loading && jobSupervisorsData.data) {
      setJobSupervisorOptionsState([])
    }
  }, [jobSupervisorsData.data, jobSupervisorsData.loading, jobSupervisorOptions])

  return (
    <>
      {loading ? (
        <Box><Typography>Loading...</Typography></Box>
      ) : error ? (
        <Box><Typography>Error: {error.message}</Typography></Box>
      ) : null}
      <Box
        component="form"
        onSubmit={formSubmitHandler}
        textAlign={'center'}
      >
        {!loading && !error ? (
          <Box
            sx={formStyles.formColumnBox}
          >
            <Box sx={{ flex: 1 }}>
          <TextField
            label="Opettaja"
            variant="outlined"
            value={teacher ? `${teacher.firstName} ${teacher.lastName}` : ""}
            fullWidth
            disabled
            sx={{ my: 2 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Opiskelija"
            variant="outlined"
            value={`${student.firstName} ${student.lastName}`}
            fullWidth
            disabled
            sx={{ my: 2 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            value={formData.qualificationUnitId}
            onChange={handleChange}
            name="qualificationUnitId"
            label='Tutkinnonosa'
            select
            fullWidth
            sx={{ my: 2 }}
            slotProps={{
              htmlInput: {
                sx: {
                  textAlign: "left",
                },
              },
            }}
          >
            {qualificationUnits.map((unit: { id: string; name: string }) => (
              <MenuItem
                key={unit.id}
                value={unit.id}
              >
                {unit.name}
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            sx={{ mb: 2 }}
            id="workplace"
            label="Työpaikka"
            options={workplaceOptions}
            value={workplaceOptions.find(option => option.id === formData.workplaceId) || null}
            onCreate={(input) => {
              const existing = workplaceOptions.find(o => o.name.toLowerCase() === input.toLowerCase())
              if (existing) {
                setFormData((prev) => ({ ...prev, workplaceId: String(existing.id), jobSupervisorId: "" }))
                setWorkplaceId(String(existing.id))
                return
              }
              setWorkplaceFormData({ ...initWorkplaceFormData, name: input })
              setShowNewWorkplaceForm(true)
            }}
            onChange={(_event, newValue: Option | null) => {
              setFormData((prevFormData: InternshipWithoutId) => ({
                ...prevFormData,
                workplaceId: newValue ? String(newValue.id) : "",
                jobSupervisorId: ""
              }));
              setWorkplaceId(newValue ? String(newValue.id) : null);
            }}
            defaultValue={workplaceOptions.find(option => option.id === formData.workplaceId) || undefined}
            noOptionsText="Ei löytynyt yhtään työpaikkaa"
            creatable
            createText={(input) => `Lisää työpaikka "${input}"`}
            required
          />
          {formData.workplaceId &&
            <Autocomplete
              sx={{ mb: 2 }}
              id="jobSupervisor"
              label="Työpaikkaohjaaja"
              options={jobSupervisorOptionsState}
              value={jobSupervisorOptionsState.find(option => String(option.id) === String(formData.jobSupervisorId)) || null}
              onCreate={(input) => {
                const existing = allJobSupervisorOptions.find(o => o.name.toLowerCase() === input.toLowerCase())
                if (existing) {
                  const effectiveWorkplaceId = formData.workplaceId || workplaceId
                  if (!effectiveWorkplaceId) return
                  updateSupervisorAssigns({
                    variables: { workplaceId: effectiveWorkplaceId, assignIds: [String(existing.id)], unassignIds: [] }
                  })
                    .then(() => loadSupervisors({ variables: { workplaceId: effectiveWorkplaceId } }))
                    .catch(() => null)
                  setJobSupervisorOptionsState((prev) => {
                    const next = prev.filter(o => String(o.id) !== String(existing.id))
                    next.unshift(existing)
                    return next
                  })
                  setFormData((prev) => ({ ...prev, jobSupervisorId: String(existing.id) }))
                  return
                }

                const [firstName, ...rest] = input.split(" ").filter(Boolean)
                setJobSupervisorFormData({
                  ...initJobSupervisorFormData,
                  firstName: firstName || "",
                  lastName: rest.join(" "),
                })
                setShowNewJobSupervisorForm(true)
              }}
              onChange={(_event, newValue: Option | null) => {
                setFormData((prevFormData: InternshipWithoutId) => ({
                  ...prevFormData,
                  jobSupervisorId: newValue ? String(newValue.id) : "",
                }));
              }}
              defaultValue={jobSupervisorOptionsState.find(option => String(option.id) === String(formData.jobSupervisorId)) || undefined}
              noOptionsText="Ei löytynyt yhtään työpaikkaohjaajaa"
              creatable
              createText={(input) => `Lisää työohjaaja "${input}"`}
              required
            />
          }
          {formData.workplaceId && !formData.jobSupervisorId ? (
            <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                sx={buttonStyles.showButton}
                onClick={() => {
                  setJobSupervisorFormData(initJobSupervisorFormData)
                  setShowNewJobSupervisorForm(true)
                }}
              >
                Lisää työohjaaja
              </Button>
            </Box>
          ) : null}

          {formData.workplaceId && formData.jobSupervisorId ? (
            <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
              <Button
                variant="contained"
                sx={buttonStyles.showButton}
                onClick={() => {
                  const selected = jobSupervisors.find(
                    (js: JobSupervisor) => String(js.id) === String(formData.jobSupervisorId)
                  )
                  if (!selected?.id) return

                  setJobSupervisorEditId(String(selected.id))
                  setJobSupervisorFormData({
                    ...selected,
                    phoneNumber: selected.phoneNumber || "",
                    email: selected.email || "",
                  })
                  setShowNewJobSupervisorForm(false)
                  setShowEditJobSupervisorForm(true)
                }}
              >
                Muokkaa työohjaajaa
              </Button>
            </Box>
          ) : null}

          <TextField
            type="date"
            label="Milloin alkaa"
            variant="outlined"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            fullWidth
            required
            sx={{ my: 2 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="date"
            label="Milloin loppuu"
            variant="outlined"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            fullWidth
            required
            sx={{ my: 2 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Lisätietoja"
            variant="outlined"
            name="info"
            value={formData.info}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            sx={{ my: 2 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <IconButton
            type="submit"
            sx={{ ...buttonStyles.saveButton, px: 10 }}
          >
            <SaveSharpIcon
              sx={{
                mr: 1,
              }}
            />
            Tallenna
          </IconButton>
            </Box>
          </Box>
        ) : null}
      </Box>
      <Dialog
        title={
          showNewWorkplaceForm
            ? "Lisää uusi työpaikka"
            : showNewJobSupervisorForm
              ? "Lisää uusi työohjaaja"
              : showEditJobSupervisorForm
                ? "Muokkaa työohjaajaa"
              : ""
        }
        open={dialogOpen}
        onClose={(next) => setDialogOpen(next)}
      >
        {showNewWorkplaceForm ? (
          <WorkplaceForm
            formData={workplaceFormData}
            setFormData={setWorkplaceFormData}
            handleSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              return handleCreateWorkplace(e)
            }}
            submitButtonTitle="Luo työpaikka"
          />
        ) : null}
        {showNewJobSupervisorForm ? (
          <JobSupervisorForm
            formData={jobSupervisorFormData}
            setFormData={setJobSupervisorFormData}
            handleSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              return handleCreateJobSupervisor(e)
            }}
            submitButtonTitle="Lisää työohjaaja"
          />
        ) : null}

        {showEditJobSupervisorForm ? (
          <JobSupervisorForm
            formData={jobSupervisorFormData}
            setFormData={setJobSupervisorFormData}
            handleSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              return handleEditJobSupervisor(e)
            }}
            submitButtonTitle="Tallenna työohjaaja"
          />
        ) : null}
      </Dialog>
    </>
  )
}

export default InternshipForm
