import { InternshipWithoutId } from "./Routes/Internships"
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { Save, UserPlus } from "lucide-react"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client"
import { GET_INTERNSHIP_DATA } from "../graphql/GetInternshipData"
import { GET_JOB_SUPERVISORS_BY_WORKPLACE } from "../graphql/GetJobSupervisorsByWorkplace"
import { JobSupervisor, Student, Workplace } from "../types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Combobox, { Option } from "@/components/common/combobox"
import { CREATE_WORKPLACE } from "../graphql/CreateWorkplace"
import WorkplaceForm, { WorkplaceFormData } from "./WorkplaceForm"
import AppDialog from "@/components/common/app-dialog"
import { CREATE_JOB_SUPERVISOR } from "../graphql/CreateJobSupervisor"
import JobSupervisorForm from "./JobSupervisorForm"
import { UPDATE_JOB_SUPERVISOR_ASSIGNS } from "../graphql/UpdateJobSupervisorAssigns"
import { GET_JOB_SUPERVISORS } from "../graphql/GetJobSupervisors"
import { EDIT_JOB_SUPERVISOR } from "../graphql/EditJobSupervisor"

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
  const [createJobSupervisor] = useMutation(CREATE_JOB_SUPERVISOR, { refetchQueries: [GET_JOB_SUPERVISORS] })
  const [editJobSupervisor] = useMutation(EDIT_JOB_SUPERVISOR, { refetchQueries: [GET_JOB_SUPERVISORS] })
  const [updateSupervisorAssigns] = useMutation(UPDATE_JOB_SUPERVISOR_ASSIGNS)

  const [showNewWorkplaceForm, setShowNewWorkplaceForm] = useState(false)
  const [showNewJobSupervisorForm, setShowNewJobSupervisorForm] = useState(false)
  const [showEditJobSupervisorForm, setShowEditJobSupervisorForm] = useState(false)
  const [jobSupervisorOptionsState, setJobSupervisorOptionsState] = useState<Option[]>([])
  const [jobSupervisorEditId, setJobSupervisorEditId] = useState<string | null>(null)

  const initWorkplaceFormData: WorkplaceFormData = useMemo(() => ({
    id: null,
    name: "",
    jobSupervisorIds: [],
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

  const teacher = data?.me?.user || null
  const workplaces = data?.workplaces?.workplaces || []
  const qualificationUnits = data?.units?.units || []
  const jobSupervisors = jobSupervisorsData.data?.jobSupervisorsByWorkplace.jobSupervisors || []

  const workplaceOptions: Option[] = workplaces.map((workplace: Workplace) => ({
    id: workplace.id,
    name: workplace.name
  }))

  const jobSupervisorOptions: Option[] = jobSupervisors
    ?.filter((jobSupervisor: JobSupervisor) => jobSupervisor.id)
    .map((jobSupervisor: JobSupervisor) => ({
      id: jobSupervisor.id as string,
      name: `${jobSupervisor.firstName} ${jobSupervisor.lastName}`
    }))

  const allJobSupervisorOptions: Option[] = (allJobSupervisorsData?.jobSupervisors?.jobSupervisors || []).map((js: JobSupervisor & { id: string }) => ({
    id: js.id,
    name: `${js.firstName} ${js.lastName}`
  }))

  useEffect(() => {
    if (showNewWorkplaceForm || showNewJobSupervisorForm || showEditJobSupervisorForm) {
      return
    }

    if (jobSupervisorOptions.length > 0) {
      setJobSupervisorOptionsState(jobSupervisorOptions)
      return
    }

    if (!jobSupervisorsData.loading && jobSupervisorsData.data) {
      setJobSupervisorOptionsState([])
    }
  }, [
    showNewWorkplaceForm,
    showNewJobSupervisorForm,
    showEditJobSupervisorForm,
    jobSupervisorOptions,
    jobSupervisorsData.loading,
    jobSupervisorsData.data,
  ])

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
      const next = prev.filter((option) => String(option.id) !== String(createdOption.id))
      next.unshift(createdOption)
      return next
    })
    setFormData((prev) => ({ ...prev, jobSupervisorId: String(created.id) }))
    setShowNewJobSupervisorForm(false)
  }

  const handleEditJobSupervisor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const effectiveWorkplaceId = formData.workplaceId || workplaceId
    if (!effectiveWorkplaceId || !jobSupervisorEditId) return

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

  if (loading) {
    return <div><p>Loading...</p></div>
  }

  if (error) {
    return <div><p>Error: {error.message}</p></div>
  }

  return (
    <>
      <form
        onSubmit={formSubmitHandler}
        className="text-center"
      >
        <div className="mt-4 flex flex-col gap-4 md:flex-row">
          <div className="flex-1 space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="teacher">Opettaja</Label>
              <Input
                id="teacher"
                value={teacher ? `${teacher.firstName} ${teacher.lastName}` : ""}
                disabled
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="student">Opiskelija</Label>
              <Input
                id="student"
                value={`${student.firstName} ${student.lastName}`}
                disabled
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="qualificationUnitId">Tutkinnonosa</Label>
              <Select
                value={formData.qualificationUnitId}
                onValueChange={(value) => {
                  setFormData((prevFormData: InternshipWithoutId) => ({
                    ...prevFormData,
                    qualificationUnitId: value
                  }));
                }}
              >
                <SelectTrigger id="qualificationUnitId" className="w-full text-left">
                  <SelectValue placeholder="Valitse tutkinnonosa...">
                    {qualificationUnits.find((u: { id: string; name: string }) => String(u.id) === String(formData.qualificationUnitId))?.name ?? ''}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent style={{ pointerEvents: 'auto' }}>
                  {qualificationUnits.map((unit: { id: string; name: string }) => (
                    <SelectItem key={unit.id} value={String(unit.id)}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Combobox
              id="workplaceId"
              label="Työpaikka"
              value={workplaceOptions.find((option) => String(option.id) === String(formData.workplaceId)) || null}
              options={workplaceOptions}
              onCreate={(input) => {
                const existing = workplaceOptions.find((option) => option.name.toLowerCase() === input.toLowerCase())
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
              noOptionsText="Ei löytynyt yhtään työpaikkaa"
              creatable
              createText={(input) => `Lisää työpaikka "${input}"`}
              required
            />

            {formData.workplaceId && (
              <Combobox
                id="jobSupervisorId"
                label="Työpaikkaohjaaja"
                value={jobSupervisorOptionsState.find((option) => String(option.id) === String(formData.jobSupervisorId)) || null}
                options={jobSupervisorOptionsState}
                onCreate={(input) => {
                  const existing = allJobSupervisorOptions.find((option) => option.name.toLowerCase() === input.toLowerCase())
                  if (existing) {
                    const effectiveWorkplaceId = formData.workplaceId || workplaceId
                    if (!effectiveWorkplaceId) return

                    updateSupervisorAssigns({
                      variables: { workplaceId: effectiveWorkplaceId, assignIds: [String(existing.id)], unassignIds: [] }
                    })
                      .then(() => loadSupervisors({ variables: { workplaceId: effectiveWorkplaceId } }))
                      .catch(() => null)

                    setJobSupervisorOptionsState((prev) => {
                      const next = prev.filter((option) => String(option.id) !== String(existing.id))
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
                noOptionsText={jobSupervisorsData.loading ? "Ladataan..." : "Ei löytynyt yhtään työpaikkaohjaajaa"}
                creatable
                createText={(input) => `Lisää työohjaaja "${input}"`}
                required
              />
            )}

            {formData.workplaceId && !formData.jobSupervisorId ? (
              <div className="flex justify-start">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setJobSupervisorFormData(initJobSupervisorFormData)
                    setShowNewJobSupervisorForm(true)
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Lisää työohjaaja
                </Button>
              </div>
            ) : null}

            {formData.workplaceId && formData.jobSupervisorId ? (
              <div className="flex justify-start">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const selected = jobSupervisors.find(
                      (jobSupervisor: JobSupervisor) => String(jobSupervisor.id) === String(formData.jobSupervisorId)
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
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startDate">
                Milloin alkaa
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate as string}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endDate">
                Milloin loppuu
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate as string}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="info">Lisätietoja</Label>
              <Textarea
                id="info"
                name="info"
                value={formData.info}
                onChange={handleChange}
                rows={4}
              />
            </div>

            {jobSupervisorsData.error && (
              <p className="text-sm text-destructive">Virhe: {jobSupervisorsData.error.message}</p>
            )}

            <Button type="submit" className="mt-4 px-10">
              <Save className="mr-1 h-4 w-4" />
              Tallenna
            </Button>
          </div>
        </div>
      </form>

      <AppDialog
        title={
          showNewWorkplaceForm
            ? "Lisää uusi työpaikka"
            : showNewJobSupervisorForm
              ? "Lisää uusi työohjaaja"
              : showEditJobSupervisorForm
                ? "Muokkaa työohjaajaa"
                : ""
        }
        open={showNewWorkplaceForm || showNewJobSupervisorForm || showEditJobSupervisorForm}
        onClose={(next) => {
          setShowNewWorkplaceForm(next)
          setShowNewJobSupervisorForm(next)
          setShowEditJobSupervisorForm(next)
        }}
      >
        {showNewWorkplaceForm ? (
          <WorkplaceForm
            formData={workplaceFormData}
            setFormData={setWorkplaceFormData}
            handleSubmit={handleCreateWorkplace}
            submitButtonTitle="Luo työpaikka"
          />
        ) : null}
        {showNewJobSupervisorForm ? (
          <JobSupervisorForm
            formData={jobSupervisorFormData}
            setFormData={setJobSupervisorFormData}
            handleSubmit={handleCreateJobSupervisor}
            submitButtonTitle="Lisää työohjaaja"
          />
        ) : null}
        {showEditJobSupervisorForm ? (
          <JobSupervisorForm
            formData={jobSupervisorFormData}
            setFormData={setJobSupervisorFormData}
            handleSubmit={handleEditJobSupervisor}
            submitButtonTitle="Tallenna työohjaaja"
          />
        ) : null}
      </AppDialog>
    </>
  )
}

export default InternshipForm
