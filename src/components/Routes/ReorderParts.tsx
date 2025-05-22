import React, { useState, useEffect } from "react";
import formStyles from '../../styles/formStyles';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import buttonStyles from '../../styles/buttonStyles';
import ArrowBackIosSharpIcon from '@mui/icons-material/ArrowBackIosSharp';

import { useQuery, useMutation } from "@apollo/client";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Paper, Button, Box, Typography, IconButton } from "@mui/material";
import { GET_QUALIFICATION_UNITS } from "../../graphql/GetQualificationUnits";
import { UPDATE_PART_ORDER } from "../../graphql/UpdatePartOrder";
import { useNavigate } from 'react-router-dom';

interface Part {
  id: number;
  name: string;
}

interface QualificationUnit {
  id: number;
  name: string;
  parts: Part[];
}

const ReorderParts: React.FC = () => {
  // Fetch qualification units with their parts
  const { loading, error, data, refetch } = useQuery(GET_QUALIFICATION_UNITS);
  const [updatePartOrder] = useMutation(UPDATE_PART_ORDER);
  const [qualificationUnits, setQualificationUnits] = useState<QualificationUnit[]>([]);
  const [hasChanges, setHasChanges] = useState<{ [key: number]: boolean }>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (data?.units?.units) {
      setQualificationUnits(data.units?.units);
    }
  }, [data]);

  // Handle drag-and-drop sorting within a unit
  const handleDragEnd = (result: DropResult, unitId: number) => {
    if (!result.destination) return; 
  
    setQualificationUnits((prevUnits) =>
      prevUnits.map((unit) => {
        if (unit.id !== unitId) return unit;
  
        const updatedParts = [...unit.parts];
        const [movedItem] = updatedParts.splice(result.source.index, 1);
        updatedParts.splice(result.destination!.index, 0, movedItem);
  
        return { ...unit, parts: updatedParts };
      })
    );
  
    setHasChanges((prev) => ({ ...prev, [unitId]: true }));
  };

  const handleSaveOrder = async (unitId: number) => {
    try {
      const unit = qualificationUnits.find((u) => u.id === unitId);
      if (!unit) {
        console.error("Unit not found:", unitId);
        return;
      }
  
      const orderedIds = unit.parts.map((part) => part.id);
  
      console.log("Sending to API:", { updatePartOrderId: unitId, partOrder: orderedIds });
  
      await updatePartOrder({
        variables: {
          unitId: String(unitId),
          partOrder: orderedIds.map(id => String(id))
        },
      });
  
      await refetch();
      setHasChanges((prev) => ({ ...prev, [unitId]: false }));
  
      console.log(`Order for unit ${unitId} saved successfully!`);
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };  

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error loading qualification units.</Typography>;

  return (
    <Box component="form" textAlign={'center'} sx={formStyles.formOuterBox}>
      <Box sx={{ ...formStyles.formBannerBox, textAlign: "center", marginBottom: 3, position: 'relative', }}>
        <IconButton
            onClick={() => navigate("/qualificationunitparts")}
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
        <Typography variant="h4" align="center" color="white">
          Teemojen järjestys
        </Typography>
      </Box>
  
      {qualificationUnits.map((unit) => (
        <Accordion key={unit.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{unit.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DragDropContext onDragEnd={(result) => handleDragEnd(result, unit.id)}>
              <Droppable droppableId={String(unit.id)}>
                {(provided) => (
                  <List ref={provided.innerRef} {...provided.droppableProps} component={Paper} sx={{ p: 2 }}>
                    {unit.parts.map((part, index) => (
                      <Draggable key={String(part.id)} draggableId={String(part.id)} index={index}>
                        {(provided) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{ border: "1px solid #ccc", mb: 1, cursor: "grab" }}
                          >
                            <ListItemText primary={part.name} />
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                console.log("Saving order for:", unit.id); // Debugging
                handleSaveOrder(unit.id);
              }}
              sx={{ ...buttonStyles.archiveButton, mr: 2, mt: 2 }}
              disabled={!hasChanges[unit.id]} // Ensure the button enables only when needed
            >
              Tallenna
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}  

export default ReorderParts;
