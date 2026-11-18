import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Internships from "./Internships";
import EducationPath from "./EducationPath";
import EditStudies from "./EditStudies";
import StudentProjectsPath from "./StudentProjectsPath";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_STUDENT } from "../../graphql/GetStudent";
import { Student } from "../../types";
import BackButton from "@/components/common/back-button";

const StudentInfo = () => {
  const { studentId } = useParams()

  const { data, loading, error } = useQuery(GET_STUDENT, { variables: { studentId } })

  if (loading) {
    return <p className="p-4">Loading...</p>
  }
  if (error) {
    return <p className="p-4">Error: {error.message}</p>
  }

  const student: Student = data.student?.student

  return (
    <div>
      <BackButton />
      <Tabs defaultValue="opinnot">
        <TabsList>
          <TabsTrigger value="opinnot">Opinnot</TabsTrigger>
          <TabsTrigger value="hoks">HOKS</TabsTrigger>
          <TabsTrigger value="projektit">Projektit</TabsTrigger>
          <TabsTrigger value="harjoittelujaksot">Harjoittelujaksot</TabsTrigger>
        </TabsList>
        <TabsContent value="opinnot">
          <EditStudies student={student} />
        </TabsContent>
        <TabsContent value="hoks">
          <EducationPath student={student} />
        </TabsContent>
        <TabsContent value="projektit">
          <StudentProjectsPath student={student} />
        </TabsContent>
        <TabsContent value="harjoittelujaksot">
          <Internships student={student} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StudentInfo
