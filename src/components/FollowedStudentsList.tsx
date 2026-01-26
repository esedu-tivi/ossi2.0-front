// Shows the followed students stored in localStorage and allows removing them from the list

import React, { useEffect, useState } from 'react';
import { getFollowedStudents, removeFollowedStudent, FollowedStudent } from '../utils/followedStudents';
import { List, ListItem, ListItemText, IconButton, Typography, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';


const FollowedStudentsList: React.FC = () => {
  const [students, setStudents] = useState<FollowedStudent[]>([]);

  useEffect(() => {
    setStudents(getFollowedStudents());
  }, []);

  // Removes a student from the followed list and updates the state
  const handleRemove = (id: string) => {
    removeFollowedStudent(id);
    setStudents(getFollowedStudents());
  };

  // If no followed students, show a message
  if (students.length === 0) {
    return <Typography>Ei seurattavia oppilaita.</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 400, my: 2 }}>
      <Typography variant="h6" gutterBottom>Seurattavat oppilaat</Typography>
      <List>
        {students.map((student) => (
          <ListItem key={student.id} secondaryAction={
            <IconButton edge="end" aria-label="poista" onClick={() => handleRemove(student.id)}>
              <DeleteIcon />
            </IconButton>
          }>
            <ListItemText primary={`${student.firstName} ${student.lastName}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FollowedStudentsList;
