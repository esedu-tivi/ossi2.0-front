import React, { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Divider,
  IconButton,
  Button,
  Modal,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import buttonStyles from "../../styles/buttonStyles";
import formStyles from "../../styles/formStyles";
import modalStyles from "../../styles/modalStyles";
import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import CheckBoxSharpIcon from '@mui/icons-material/CheckBoxSharp';
import AddCircleOutlineSharpIcon from '@mui/icons-material/AddCircleOutlineSharp';
import { mandatoryModules, choiceModules, optionalModulesList } from "../../data/EducationPathData";
import ArrowBackIosSharpIcon from '@mui/icons-material/ArrowBackIosSharp';

interface ModulePart {
  id: number;
  title: string;
  points: number;
  completed: boolean;
  osaamiset: string[];
}

interface Module {
  id: number;
  title: string;
  points: number;
  parts: ModulePart[];
  completed: boolean;
}

const EducationPath: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const student = location.state?.student;
  const [modules, setModules] = useState<Module[]>(mandatoryModules);
  const [optionalModules, setOptionalModules] = useState<Module[]>(choiceModules);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOptionalModules, setSelectedOptionalModules] = useState<number[]>([]);

  const handleAddModalOpen = () => setIsAddModalOpen(true);
  const handleAddModalClose = () => {
    setSelectedOptionalModules([]);
    setIsAddModalOpen(false);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedOptionalModules((prev) =>
      prev.includes(id) ? prev.filter((moduleId) => moduleId !== id) : [...prev, id]
    );
  };
  
  const [previousEducation, setPreviousEducation] = useState<number>(5);

  const totalPoints = [...modules, ...optionalModules].reduce((sum, module) => sum + module.points, previousEducation);
  const completedPoints = [...modules, ...optionalModules].reduce(
    (sum, module) => sum + (module.completed ? module.points : 0),
    previousEducation
  );

  const addSelectedModules = () => {
    const selectedModulesToAdd = optionalModulesList.filter((module) =>
      selectedOptionalModules.includes(module.id)
    );

    setOptionalModules((prev) => [...prev, ...selectedModulesToAdd]);
    handleAddModalClose();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    if (newIndex === 0) {
      navigate('/teacherdashboard/educationpath');
    } else if (newIndex === 1) {
      navigate('/teacherdashboard/teacherstudies');
    }
  };

  const tabIndex = location.pathname === '/teacherdashboard/educationpath' ? 0 : 1;
  
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "stretch", mx: "10%" }}>
      <Box>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label="edit studies tabs"
          sx={{
            alignSelf: "flex-start",
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
          <Tab label="HOKS" />
          <Tab label="OPINNOT" />
        </Tabs>
        <Box sx={formStyles.formOuterBox}>
          <Box sx={{ ...formStyles.formBannerBox, textAlign: "center", marginBottom: 3, position: 'relative', borderTopLeftRadius: "0px" }}>
            <IconButton
              onClick={() => navigate("/teacherdashboard")}
              sx={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
              }}
            >
              <ArrowBackIosSharpIcon sx={{ fontSize: 36 }} />
            </IconButton>
            <Typography variant="h5" color="white" fontWeight="bold">
              Opintosuunnitelma
            </Typography>
            {student ? (
              <Typography variant="h4" color="white">
                {student.firstName} {student.lastName} (Ohjelmistokehittäjä)
              </Typography>
            ) : (
              <Typography variant="h4" color="white">Opiskelija (Ohjelmistokehittäjä)</Typography>
            )}
          </Box>

          <Typography variant="h6" gutterBottom>
            Pakolliset tutkinnon osat
          </Typography>
          {modules.map((module) => (
            <Accordion
              key={module.id}
              sx={{
                marginBottom: 2,
                backgroundColor: module.completed ? "#afe3b2" : "#f3f3f3",
                border: "1px solid #ccc",
                borderRadius: 2,
                position: 'relative',
                '&:hover .hover-button': { visibility: 'visible' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {module.completed && (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
                        <CheckBoxSharpIcon sx={{ color: 'black', fontSize: '2rem' }} />
                      </Box>
                    )}
                    <Typography fontWeight="bold">{module.title}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography>{module.points} osp</Typography>
                  </Box>
                </Box>
              </AccordionSummary>

              {module.parts.length > 0 && (
                <AccordionDetails>
                  {module.parts.map((part) => (
                    <Box
                      key={part.id}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: 1,
                        backgroundColor: part.completed ? "#93cf96" : "#fff",
                        borderRadius: 1,
                        marginBottom: 1,
                        border: 1,
                      }}
                    >
                      <Accordion sx={{ boxShadow: "none", backgroundColor: "transparent" }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {part.title} ({part.points} osp)
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pl: 2 }}>
                          {part.osaamiset && part.osaamiset.length > 0 ? (
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                Osaamiset:
                              </Typography>
                              <ul>
                                {part.osaamiset.map((osaaminen, index) => (
                                  <li key={index}>
                                    <Typography variant="body2">{osaaminen}</Typography>
                                  </li>
                                ))}
                              </ul>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              Ei määriteltyjä osaamisia
                            </Typography>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  ))}
                </AccordionDetails>
              )}
            </Accordion>
          ))}

          <Typography variant="h6" gutterBottom mt={5}>
            Valinnaiset opinnot
          </Typography>
          {optionalModules.map((module) => (
            <Accordion
              key={module.id}
              sx={{
                marginBottom: 2,
                backgroundColor: module.completed ? "#afe3b2" : "#f3f3f3",
                border: "1px solid #ccc",
                borderRadius: 2,
                position: 'relative',
                '&:hover .hover-button': { visibility: 'visible' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {module.completed && (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
                        <CheckBoxSharpIcon sx={{ color: 'black', fontSize: '2rem' }} />
                      </Box>
                    )}
                    <Typography fontWeight="bold">{module.title}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography>{module.points} osp</Typography>
                  </Box>
                </Box>
              </AccordionSummary>

              {module.parts.length > 0 && (
                <AccordionDetails>
                  {module.parts.map((part) => (
                    <Box
                      key={part.id}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: 1,
                        backgroundColor: part.completed ? "#93cf96" : "#fff",
                        borderRadius: 1,
                        marginBottom: 1,
                        border: 1,
                      }}
                    >
                      <Accordion sx={{ boxShadow: "none", backgroundColor: "transparent" }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {part.title} ({part.points} osp)
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pl: 2 }}>
                          {part.osaamiset && part.osaamiset.length > 0 ? (
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                Osaamiset:
                              </Typography>
                              <ul>
                                {part.osaamiset.map((osaaminen, index) => (
                                  <li key={index}>
                                    <Typography variant="body2">{osaaminen}</Typography>
                                  </li>
                                ))}
                              </ul>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              Ei määriteltyjä osaamisia
                            </Typography>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  ))}
                </AccordionDetails>
              )}
            </Accordion>
          ))}

          <IconButton
            sx={buttonStyles.saveButton}
            onClick={handleAddModalOpen}
          >
            <AddCircleOutlineSharpIcon
              sx={{
                mr: 1,
              }}
            />
            Lisää valinnaisia opintoja
          </IconButton>

          <Modal open={isAddModalOpen} onClose={handleAddModalClose}>
            <Box sx={{...modalStyles.outerBox, maxWidth: '600px'}}>
              <Box sx={modalStyles.header}>
                <Typography sx={modalStyles.title}>
                  Lisää valinnaisia opintoja
                </Typography>
              </Box>
              <Box
                sx={{
                  ...modalStyles.content,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  marginLeft: '80px'
                }}
              >
                {optionalModulesList.map((module) => (
                  <FormControlLabel
                    key={module.id}
                    control={
                      <Checkbox
                        checked={selectedOptionalModules.includes(module.id)}
                        onChange={() => handleCheckboxChange(module.id)}
                      />
                    }
                    label={module.title}
                  />
                ))}
              </Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                paddingTop: 2, 
                borderTop: 2, 
                backgroundColor: "#ebe9e6" ,
              }}>
                <Button
                  sx={{...buttonStyles.cancelButton, minWidth: '250px'}}
                  onClick={addSelectedModules}
                >
                  Lisää valitut
                </Button>
                <Button
                  sx={{
                    ...buttonStyles.cancelButton,
                    width: '120px',
                    marginLeft: '16px',
                  }}
                  onClick={handleAddModalClose}
                >
                  Sulje
                </Button>
              </Box>
            </Box>
          </Modal>

          <Typography variant="h6" gutterBottom mt={5}>
            Aikaisemmat opinnot
          </Typography>
          <Box sx={{ ...formStyles.formNotificationBox, backgroundColor: "#afe3b2" }}>
            <Typography>Hyväksytty aikaisempi koulutus</Typography>
            <Typography>{previousEducation} osp</Typography>
          </Box>

          <Divider sx={{ marginY: 3 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <IconButton
              type="submit"
              sx={buttonStyles.saveButton}
            >
              <SaveSharpIcon
                sx={{
                  mr: 1,
                }}
              />
              Tallenna Opintosuunnitelma
            </IconButton>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box>
                <Typography 
                sx={{
                    border: 2,
                    borderRadius:1,
                    margin: 1,
                    padding: 1,
                    fontWeight: "bold",
                    backgroundColor: "#ebe9e6",
                  }}
                >
                  Osp suoritettu: {completedPoints}
                </Typography>
              </Box>
              <Box>
                <Typography 
                  sx={{
                    border: 2,
                    borderRadius:1,
                    margin: 1,
                    padding: 1,
                    fontWeight: "bold",
                    backgroundColor: "#ebe9e6",
                  }}
                >
                  Osp valittu: {totalPoints}
                </Typography>
              </Box>
              <Box>
                <Typography 
                  sx={{
                    border: 2,
                    borderRadius:1,
                    margin: 1,
                    padding: 1,
                    fontWeight: "bold",
                    backgroundColor: "#ebe9e6",
                  }}
                >
                  Tutkintoon vaadittu osp: 145
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EducationPath;
