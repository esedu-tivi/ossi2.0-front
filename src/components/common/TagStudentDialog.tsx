import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, MenuItem, ListItemText, DialogActions, Button, Checkbox, ListItemIcon, TextField, Typography } from '@mui/material';

type Student = { id: string; name: string };

interface TagStudentDialogProps {
  open: boolean;
  onClose: () => void;
  students: Student[];
  taggedStudents: Student[];
  onTag: (students: Student[]) => void;
}

const TagStudentDialog: React.FC<TagStudentDialogProps> = ({ open, onClose, students, taggedStudents, onTag }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSelected(taggedStudents.map(s => s.id));
  }, [taggedStudents, open]);

  const handleToggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const handleSave = () => {
    const selectedStudents = students.filter(s => selected.includes(s.id));
    onTag(selectedStudents);
    onClose();
  };

  // filter students by search term
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Tägää opiskelija</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Hae opiskelijaa"
          type="search"
          fullWidth
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />
        {filteredStudents.map((student) => (
          <MenuItem
            key={student.id}
            selected={selected.includes(student.id)}
            onClick={() => handleToggle(student.id)}
          >
            <ListItemIcon>
              <Checkbox edge="start" checked={selected.includes(student.id)} tabIndex={-1} disableRipple />
            </ListItemIcon>
            <ListItemText primary={student.name} />
          </MenuItem>
        ))}
        {filteredStudents.length === 0 && (
          <Typography variant="body2" color="text.secondary">Ei tuloksia</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Peruuta</Button>
        <Button onClick={handleSave} variant="contained">Tallenna</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TagStudentDialog;