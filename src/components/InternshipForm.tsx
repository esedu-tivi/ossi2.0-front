import { InternshipWithoutId } from "./Routes/Internships"
import { Dispatch, SetStateAction, useEffect } from "react"
import { Save } from "lucide-react"
import { useLazyQuery, useQuery } from "@apollo/client"
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
  const { loading, data, error } = useQuery(GET_INTERNSHIP_DATA)
  const [loadSupervisors, jobSupervisorsData] = useLazyQuery(GET_JOB_SUPERVISORS_BY_WORKPLACE)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData: InternshipWithoutId) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  // Preload teacherId and studentId for formData
  useEffect(() => {
    if (!loading && !error && data) {
      setFormData((prevFormData: InternshipWithoutId) => ({
        ...prevFormData,
        teacherId: data.me?.user.id as unknown as string,
        studentId: student.id as unknown as string,
      }))
    }
  }, [data, setFormData, student, loading, error])

  useEffect(() => {
    if (workplaceId) {
      loadSupervisors({ variables: { workplaceId } })
    }
  }, [workplaceId, loadSupervisors])

  if (loading) {
    return <div><p>Loading...</p></div>
  }

  if (error) {
    return <div><p>Error: {error.message}</p></div>
  }

  const teacher = data.me?.user || null
  const workplaces = data.workplaces?.workplaces || []
  const qualificationUnits = data.units?.units || []

  const jobSupervisors = jobSupervisorsData.data?.jobSupervisorsByWorkplace.jobSupervisors || []

  const workplaceOptions: { id: string; name: string }[] = workplaces.map((workplace: Workplace) => ({
    id: workplace.id,
    name: workplace.name
  }))

  const jobSupervisorOptions: { id: string; name: string }[] = jobSupervisors
    ?.filter((jobSupervisor: JobSupervisor) => jobSupervisor.id)
    .map((jobSupervisor: JobSupervisor) => ({
      id: jobSupervisor.id as string,
      name: `${jobSupervisor.firstName} ${jobSupervisor.lastName}`
    }))

  return (
    <form
      onSubmit={formSubmitHandler}
      className="text-center"
    >
      <div className="flex flex-col md:flex-row gap-4 mt-4">

        <div className="flex-1 space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="teacher">Opettaja</Label>
            <Input
              id="teacher"
              value={`${teacher.firstName} ${teacher.lastName}`}
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="workplaceId">
              Työpaikka
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              value={formData.workplaceId}
              onValueChange={(value) => {
                setFormData((prevFormData: InternshipWithoutId) => ({
                  ...prevFormData,
                  workplaceId: value,
                  jobSupervisorId: "",
                }));
                setWorkplaceId(value);
              }}
              required
            >
              <SelectTrigger id="workplaceId" className="w-full text-left">
                <SelectValue placeholder="Valitse työpaikka...">
                  {workplaceOptions.find((o) => String(o.id) === String(formData.workplaceId))?.name ?? ''}
                </SelectValue>
              </SelectTrigger>
              <SelectContent style={{ pointerEvents: 'auto' }}>
                {workplaceOptions.map((workplace) => (
                  <SelectItem key={workplace.id} value={String(workplace.id)}>
                    {workplace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.workplaceId &&
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="jobSupervisorId">
                Työpaikkaohjaaja
                <span className="text-destructive ml-1">*</span>
              </Label>

              <Select
                value={formData.jobSupervisorId}
                onValueChange={(value) => {
                  setFormData((prevFormData: InternshipWithoutId) => ({
                    ...prevFormData,
                    jobSupervisorId: value,
                  }));
                }}
                required
              >
                <SelectTrigger id="jobSupervisorId" className="w-full text-left">
                  <SelectValue placeholder={jobSupervisorsData.loading ? "Ladataan..." : "Valitse työpaikkaohjaaja..."}>
                    {jobSupervisorOptions.find((option) => String(option.id) === String(formData.jobSupervisorId))?.name ?? ''}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent style={{ pointerEvents: 'auto' }}>
                  {jobSupervisorOptions.map((supervisor) => (
                    <SelectItem key={supervisor.id} value={String(supervisor.id)}>
                      {supervisor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {jobSupervisorsData.error && (
                <p className="text-sm text-destructive">Virhe: {jobSupervisorsData.error.message}</p>
              )}
            </div>
          }

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

          <Button type="submit" className="mt-4 px-10">
            <Save className="mr-1 h-4 w-4" />
            Tallenna
          </Button>
        </div>
      </div>
    </form>
  )
}

export default InternshipForm
