import React, { useState } from 'react';
import { TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import PaletteIcon from '@mui/icons-material/Palette';
import Tooltip from '@mui/material/Tooltip';
import { COLOR_OPTIONS } from '../../constants/options';
import { Project } from '../../types';
import InfoIcon from '@mui/icons-material/Info';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useMutation } from '@apollo/client';
import { CREATE_PROJECT_TAGS } from '../../graphql/CreateProjectTags';

interface TeacherProjectMenuProps {
  isFollowed: boolean;
  onFollowToggle: () => void;
  onEdit: () => void;
  onTagStudent: () => void;
  project: Project & {
    description?: string;
    materials?: string;
    duration?: number | string;
    competenceRequirements?: { id: string; description: string }[];
    isActive?: boolean;
  };
  allTags: { id: string; name: string }[];
  onAddTag: (tag: { id: string; name: string }) => void;
  onColorChange: (tagId: string, color: string) => void;
}

const TeacherProjectMenu: React.FC<TeacherProjectMenuProps> = ({ isFollowed, onFollowToggle, onEdit, onTagStudent, project, allTags, onAddTag, onColorChange }) => {
  const [createProjectTags] = useMutation(CREATE_PROJECT_TAGS);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tagMenuAnchor, setTagMenuAnchor] = useState<null | HTMLElement>(null);
  const [expandedTagId, setExpandedTagId] = useState<string | null>(null);
  const [tagSearch, setTagSearch] = useState('');
  // Tags already added to the project are shown first
  const sortedTags = allTags.slice().sort((a, b) => {
    const aColor = project.tags?.find(t => t.id === a.id)?.color;
    const bColor = project.tags?.find(t => t.id === b.id)?.color;
    if (aColor && !bColor) return -1;
    if (!aColor && bColor) return 1;
    return 0;
  });
  const filteredTags = sortedTags.filter(tag => tag.name.toLowerCase().startsWith(tagSearch.toLowerCase()));
  const [tagMenuLimit, setTagMenuLimit] = useState(5);
  const visibleTags = filteredTags.slice(0, tagMenuLimit);

  const projectTagIds = (project.tags || []).map((t: { id: string }) => t.id);

  const open = Boolean(anchorEl);
  const tagMenuOpen = Boolean(tagMenuAnchor);

  // Open tag menu and set anchor
  const handleTagMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setTagMenuAnchor(event.currentTarget);
  };

  // Add tag to project (if not already added)
  const handleTagSelect = (tagId: string) => {
    const tag = allTags.find(t => t.id === tagId);
    if (tag && !projectTagIds.includes(tagId)) {
      onAddTag(tag);
    }
    setTagMenuAnchor(null);
    setAnchorEl(null);
  };

  // Change tag color
  const handleColorSelect = (tagId: string, colorId: string) => {
    onColorChange(tagId, colorId);
    setExpandedTagId(null);
    setTagMenuAnchor(null);
    setAnchorEl(null);
  };

  return (
    <>
      {/* Main menu */}
      <IconButton
        onClick={e => setAnchorEl(e.currentTarget)}
        aria-label="Avaa valikko"
        sx={{
          transition: 'background 0.2s',
          '&:hover': { background: '#e3e3e3' }
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => {
          setAnchorEl(null);
          setTagMenuAnchor(null);
          setExpandedTagId(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 180, borderRadius: 2, boxShadow: 3, p: 0.5 } } }}
      >
        <MenuItem onClick={() => { onEdit(); setAnchorEl(null); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Muokkaa" />
        </MenuItem>
        <MenuItem onClick={() => { onFollowToggle(); setAnchorEl(null); }}>
          <ListItemIcon>{isFollowed ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}</ListItemIcon>
          <ListItemText primary={isFollowed ? 'Poista seurannasta' : 'Seuraa'} />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { onTagStudent(); setAnchorEl(null); }}>
          <ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Tägää opiskelija" />
        </MenuItem>
        <MenuItem onClick={handleTagMenuOpen}>
          <ListItemIcon><LabelOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Tunnisteet" />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { if (project.id) navigate(`/teacherprojects/${project.id}`); setAnchorEl(null); }}>
          <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Tiedot" />
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); }}>
          <ListItemIcon><AssessmentIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Käyttöaste" />
        </MenuItem>
      </Menu>

      {/* Tag menu */}
      <Menu
        anchorEl={tagMenuAnchor}
        open={tagMenuOpen}
        onClose={() => {
          setTagMenuAnchor(null);
          setExpandedTagId(null);
          setAnchorEl(null);
          setTagSearch('');
          setTagMenuLimit(5);
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 220, borderRadius: 2, boxShadow: 3, p: 0.5, mt: -2, ml: -0.5 } } }}
      >
        <TextField
          size="small"
          placeholder="Etsi tunniste..."
          value={tagSearch}
          onChange={e => setTagSearch(e.target.value)}
          sx={{ m: 1, width: '95%' }}
          inputProps={{ autoComplete: 'off' }}
          autoFocus
          onKeyDown={e => e.stopPropagation()}
        />
        {(() => {
          return <>
            {visibleTags.map((tag: { id: string; name: string }) => {
              const alreadyAdded = projectTagIds.includes(tag.id);
              const isExpanded = expandedTagId === tag.id;
              return (
                <div key={tag.id}>
                  <MenuItem
                    onClick={() => {
                      if (!alreadyAdded) {
                        handleTagSelect(tag.id);
                      }
                    }}
                    sx={alreadyAdded ? { fontWeight: 'bold', color: '#555', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } : {}}
                  >
                    <span>{tag.name}</span>
                    {alreadyAdded && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Tooltip title="Vaihda tunnisteen väri">
                          <IconButton
                            size="small"
                            onClick={e => {
                              e.stopPropagation();
                              setExpandedTagId(isExpanded ? null : tag.id);
                            }}
                            sx={{ ml: 0.5 }}
                          >
                            <PaletteIcon fontSize="small" style={{ color: (project.tags?.find(t => t.id === tag.id)?.color) || undefined }} />
                          </IconButton>
                        </Tooltip>
                      </span>
                    )}
                  </MenuItem>
                  {/* Inline color selection */}
                  {isExpanded && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 2,
                      padding: '8px 8px 8px 8px',
                      backgroundColor: '#f7f6f6',
                      borderRadius: 4,
                      margin: '0 8px 4px 8px'
                    }}>
                      {COLOR_OPTIONS.map(color => (
                        <Tooltip key={color.id} title={color.name}>
                          <IconButton
                            size="small"
                            onClick={() => handleColorSelect(tag.id, color.id)}
                            sx={{
                              width: 30,
                              height: 30,
                              '&:hover': { transform: 'scale(1.1)' },
                              transition: 'transform 0.2s'
                            }}
                          >
                            <div style={{
                              width: 15,
                              height: 15,
                              backgroundColor: color.color,
                              borderRadius: '50%',
                              border: '2px solid #fff',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }} />
                          </IconButton>
                        </Tooltip>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Create new tag */}
            {tagSearch.trim() && !allTags.some(tag => tag.name.toLowerCase() === tagSearch.trim().toLowerCase()) && (
              <MenuItem
                onClick={async () => {
                  try {
                    const response = await createProjectTags({ variables: { names: [tagSearch.trim()] } });
                    const newTag = response.data.createProjectTags.projectTags[0];
                    if (newTag) {
                      onAddTag(newTag);
                    }
                    setTagMenuAnchor(null);
                    setTagSearch('');
                  } catch (e) {
                    // Optionally: show error to user
                    console.error('Tunnisteen luonti epäonnistui', e);
                  }
                }}
                sx={{ fontStyle: 'italic', color: 'primary.main' }}
              >
                <ListItemText primary={`Lisää uusi tunniste: "${tagSearch.trim()}"`} />
              </MenuItem>
            )}
            {filteredTags.length > tagMenuLimit && (
              <MenuItem
                onClick={() => setTagMenuLimit(tagMenuLimit + 5)}
                sx={{ fontStyle: 'italic', color: '#888', justifyContent: 'center' }}
              >
                Näytä lisää ({Math.min(5, filteredTags.length - tagMenuLimit)})
              </MenuItem>
            )}
          </>;
        })()}
      </Menu>
    </>
  );
};

export default TeacherProjectMenu;
