import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { CREATE_PROJECT_TAGS } from '../../graphql/CreateProjectTags';
import { GET_PROJECT_TAGS } from '../../graphql/GetProjectTags';
import { COLOR_OPTIONS } from '../../constants/options';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider, TextField } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';

import ListAltIcon from '@mui/icons-material/ListAlt';
import PaletteIcon from '@mui/icons-material/Palette';
import Tooltip from '@mui/material/Tooltip';

export interface TeacherStudentMenuProps {
  isFollowed: boolean;
  isNotified: boolean;
  onFollowToggle: () => void;
  onNotifyToggle: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onProfile: () => void;
  studentId?: string | number;
  onTagSelect?: (tagId: string, colorId?: string, tagName?: string) => void;
  tags: { id: string, name: string }[];
  studentTags?: { [studentId: string]: Array<{ tagId: string, colorId: string, tagName?: string }> };
}

const TeacherStudentMenu: React.FC<TeacherStudentMenuProps> = ({
  isFollowed,
  isNotified,
  onFollowToggle,
  onNotifyToggle,
  onEdit,
  onArchive,
  onProfile,
  studentId,
  onTagSelect,
  tags,
  studentTags
}) => {
  const { data: tagData, refetch: refetchTags } = useQuery(GET_PROJECT_TAGS);
  const [createProjectTags] = useMutation(CREATE_PROJECT_TAGS);
  const [tagMenuAnchor, setTagMenuAnchor] = useState<null | HTMLElement>(null);
  const [expandedTagId, setExpandedTagId] = useState<string | null>(null);
  const [tagSearch, setTagSearch] = useState('');
  const [tagMenuLimit, setTagMenuLimit] = useState(5);
  const handleTagMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setTagMenuAnchor(event.currentTarget);
  };
  
  const handleTagMenuClose = () => {
    setTagMenuAnchor(null);
    setExpandedTagId(null);
  };

  // Add tag to student (if not already added)
  const handleTagSelect = (tagId: string, tagName?: string) => {
    const defaultColor = COLOR_OPTIONS[6].id;
    if (onTagSelect) {
      onTagSelect(tagId, defaultColor, tagName);
    }
    setTagMenuAnchor(null);
    setAnchorEl(null);
  };

  // Change tag color for student
  const handleColorSelect = (tagId: string, colorId: string) => {
    if (onTagSelect) {
      onTagSelect(tagId, colorId);
    }
    setExpandedTagId(null);
    setTagMenuAnchor(null);
    setAnchorEl(null);
  };

  // Copy student profile link to clipboard
  const handleCopyLink = () => {
    if (studentId) {
      const url = `${window.location.origin}/teacherdashboard/students/${studentId}`;
      navigator.clipboard.writeText(url);
    }
    setAnchorEl(null);
  };
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      {/* Main menu */}
      <IconButton
        onClick={e => setAnchorEl(e.currentTarget)}
        sx={{ transition: 'background 0.2s', '&:hover': { background: '#e3e3e3' } }}
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
        slotProps={{ paper: { sx: { minWidth: 200, borderRadius: 2, boxShadow: 3, p: 0.5 } } }}
      >
        <MenuItem onClick={() => { onProfile(); setAnchorEl(null); }}>
          <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Tiedot" />
        </MenuItem>
        <MenuItem onClick={() => { onEdit(); setAnchorEl(null); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Muokkaa" />
        </MenuItem>
        <MenuItem onClick={() => { onArchive(); setAnchorEl(null); }}>
          <ListItemIcon><ArchiveIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Arkistoi" />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleTagMenuOpen}>
          <ListItemIcon><LabelOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Tunnisteet" />
        </MenuItem>
        {/* Tag menu */}
        <Menu
          anchorEl={tagMenuAnchor}
          open={Boolean(tagMenuAnchor)}
          onClose={() => {
            handleTagMenuClose();
            setTagMenuLimit(5);
            setAnchorEl(null);
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { minWidth: 220, borderRadius: 2, boxShadow: 3, p: 0.5, mt: -2, ml: -0.5  } } }}
          disableAutoFocusItem
          autoFocus={false}
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
            type TagType = { id: string; name: string; color?: string };
            const allTags: TagType[] = (typeof tagData?.projectTags?.projectTags !== 'undefined') ? tagData.projectTags.projectTags : tags;
            // Tags that are already added, are shown first
            const sortedTags = allTags.slice().sort((a, b) => {
              const aColor = studentTags && studentId && studentTags[studentId]?.find(t => t.tagId === a.id)?.colorId;
              const bColor = studentTags && studentId && studentTags[studentId]?.find(t => t.tagId === b.id)?.colorId;
              if (aColor && !bColor) return -1;
              if (!aColor && bColor) return 1;
              return 0;
            });
            const filteredTags = sortedTags.filter((tag: TagType) => tag.name.toLowerCase().startsWith(tagSearch.toLowerCase()));
            const visibleTags = filteredTags.slice(0, tagMenuLimit);
            const showAddNew = tagSearch.trim() && !allTags.some((tag: TagType) => tag.name.toLowerCase() === tagSearch.trim().toLowerCase());
            return <>
              {visibleTags.map((tag) => {
                const alreadyAdded = studentTags && studentId && studentTags[studentId]?.some(t => t.tagId === tag.id);
                const isExpanded = expandedTagId === tag.id;
                return (
                  <div key={tag.id}>
                    <MenuItem
                      onClick={() => {
                        if (!alreadyAdded) {
                          handleTagSelect(tag.id, tag.name);
                        }
                      }}
                      sx={alreadyAdded ? { fontWeight: 'bold', color: '#555', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } : { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
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
                              <PaletteIcon fontSize="small" style={{
                                color: (() => {
                                  if (studentTags && studentId) {
                                    const tagObj = studentTags[studentId]?.find(t => t.tagId === tag.id);
                                    if (tagObj) {
                                      const colorObj = COLOR_OPTIONS.find(c => c.id === tagObj.colorId);
                                      return colorObj ? colorObj.color : undefined;
                                    }
                                  }
                                  return undefined;
                                })()
                              }} />
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
                                width: 20, 
                                height: 20, 
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
              {showAddNew && (
                <MenuItem
                  onClick={async () => {
                    const defaultColor = COLOR_OPTIONS[0].id;
                    let newTagId = null;
                    try {
                      const response = await createProjectTags({ variables: { names: [tagSearch.trim()] } });
                      const created = response.data?.createProjectTags?.projectTags?.[0];
                      if (created) {
                        newTagId = created.id;
                        await refetchTags();
                      }
                    } catch {
                      setTagMenuAnchor(null);
                      setTagSearch('');
                      return;
                    }
                    if (onTagSelect) {
                      onTagSelect(newTagId || 'new', defaultColor, tagSearch.trim());
                    }
                    setTagMenuAnchor(null);
                    setTagSearch('');
                  }}
                  sx={{ fontStyle: 'italic', color: 'primary.main' }}
                >
                  <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
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
        <MenuItem onClick={handleCopyLink} disabled={!studentId}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Kopioi profiililinkki" />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { onFollowToggle(); setAnchorEl(null); }}>
          <ListItemIcon>{isFollowed ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}</ListItemIcon>
          <ListItemText primary={isFollowed ? 'Poista seurannasta' : 'Seuraa'} />
        </MenuItem>
        <MenuItem onClick={() => { onNotifyToggle(); setAnchorEl(null); }}>
          <ListItemIcon>{isNotified ? <NotificationsOffIcon fontSize="small" /> : <NotificationsActiveIcon fontSize="small" />}</ListItemIcon>
          <ListItemText primary={isNotified ? 'Poista ilmoitukset käytöstä' : 'Ota ilmoitukset käyttöön'} />
        </MenuItem>
        <MenuItem disabled>
          <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Lisää haluttu toiminto" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default TeacherStudentMenu;

