import { Button, Tab, Tabs, Typography } from "@mui/material"
import { useState } from "react";
import Internships from "./Internships";
import EducationPath from "./EducationPath";
import EditStudies from "./EditStudies";
import BackIcon from "@mui/icons-material/ArrowBack"
import '../../css/StudentList.css';
import StudentProjectsPath from "./StudentProjectsPath";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_STUDENT } from "../../graphql/GetStudent";

const StudentInfo = () => {
  const [tabIndex, setTabIndex] = useState(0)
  const navigate = useNavigate()
  const { studentId } = useParams()

  const { data, loading, error } = useQuery(GET_STUDENT, { variables: { studentId } })

  if (loading) {
    return <Typography>Loading...</Typography>
  }
  if (error) {
    return <Typography>Error: {error.message}</Typography>
  }

  const student = data.student?.student

  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex)
  };

  return (
    <>
      <Button variant="contained" sx={{ marginBottom: '10px' }} startIcon={<BackIcon />} onClick={() => navigate(-1)}>Palaa</Button>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        aria-label="edit studies tabs"
        sx={{
          alignSelf: 'flex-start',
          '& .MuiTab-root': {
            backgroundColor: '#eaddff',
            borderRadius: '10px 10px 0 0',
          },
          '& .Mui-selected': {
            backgroundColor: '#65558f',
            color: '#ffffff !important',
            borderRadius: '10px 10px 0 0',
          },
        }}
      >
        <Tab label='Opinnot' />
        <Tab label='HOKS' />
        <Tab label='Projektit' />
        <Tab label='Harjoittelujaksot' />
      </Tabs>
      {(tabIndex === 0) && <EditStudies student={student} />}
      {(tabIndex === 1) && <EducationPath student={student} />}
      {(tabIndex === 2) && <StudentProjectsPath student={student} />}
      {(tabIndex === 3) && <Internships student={student} />}
    </>
  )
}

export default StudentInfo

