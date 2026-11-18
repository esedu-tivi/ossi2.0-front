import { Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { JobSupervisor } from "../types"

interface JobSupervisorFormProps {
  formData: JobSupervisor
  setFormData: React.Dispatch<React.SetStateAction<JobSupervisor>>
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  submitButtonTitle: string
}

const JobSupervisorForm = ({
  formData,
  setFormData,
  handleSubmit,
  submitButtonTitle
}: JobSupervisorFormProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="text-center"
    >
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <div className="flex-1 space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="firstName">
              Etunimi
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lastName">
              Sukunimi
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">
              Sähköposti
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phoneNumber">Puhelinnumero</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber || ""}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="mt-4">
            <Save className="mr-1 h-4 w-4" />
            {submitButtonTitle}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default JobSupervisorForm
