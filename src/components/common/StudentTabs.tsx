import { Button, Tab, Tabs } from "@mui/material"
import { useState } from "react";
import Internships from "../Routes/Internships";
import EducationPath from "../Routes/EducationPath";
import EditStudies from "../Routes/EditStudies";
import BackIcon from "@mui/icons-material/ArrowBack"
import '../../css/StudentList.css';
import StudentProjectsPath from "../Routes/StudentProjectsPath";
import { StudentData } from "./studentHelpers";

interface StudentTabsProps {
  student: StudentData
  setShowStudentInfo: React.Dispatch<React.SetStateAction<boolean>>
}

const StudentTabs = ({ student, setShowStudentInfo }: StudentTabsProps) => {
  const [tabIndex, setTabIndex] = useState(0)

  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex)
  };

  return (
    <>
      <Button variant="contained" sx={{ marginBottom: '10px' }} startIcon={<BackIcon />} onClick={() => setShowStudentInfo(false)}>Palaa</Button>
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
        <Tab label='Harjoittelupaikat' />
      </Tabs>
      {(tabIndex === 0) && <EditStudies student={student} />}
      {(tabIndex === 1) && <EducationPath student={student} />}
      {(tabIndex === 2) && <StudentProjectsPath />}
      {(tabIndex === 3) && <Internships student={student} />}
    </>
  )
}

export default StudentTabs

