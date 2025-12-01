import { Button } from "@mui/material";
import { useState } from "react"
import InternshipForm from "../InternshipForm";
import { StudentData } from "../common/studentHelpers";
import { useMutation } from "@apollo/client";
import { CREATE_INTERNSHIP } from "../../graphql/CreateInternship";

export interface InternshipFormData {
  id: string | number | null
  startDate: Date | ""
  endDate: Date | ""
  info: string
  qualificationUnitId: string
  workplaceId: string
  teacherId: string
  studentId: string
  jobSupervisorId: string
}

export type InternshipFormDataWithoutId = Omit<InternshipFormData, "id">

const initFormData: InternshipFormDataWithoutId = {
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
  const [formData, setFormData] = useState<Omit<InternshipFormData, "id">>(initFormData);
  const [createInternship] = useMutation(CREATE_INTERNSHIP)

  const handleNewFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    console.log(event.target)
    console.log(formData)
    await createInternship({ variables: { internship: formData } })
    setFormData(initFormData)
    setShowInternship(false)
  }

  //console.log('interships')
  if (showAddInternship) {
    return <InternshipForm formTitle="Lisää harjoittelujakso" formData={formData} setFormData={setFormData} student={student} setShowForm={setShowInternship} formSubmitHandler={handleNewFormSubmit} />
  }

  return (
    <Button onClick={() => { setShowInternship(true) }}>Lisää harjoittelujakso</Button>
  )
}

export default Internships
