import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UndoSharpIcon from '@mui/icons-material/UndoSharp';
import SaveAsSharpIcon from '@mui/icons-material/SaveAsSharp';
import DriveFolderUploadSharpIcon from '@mui/icons-material/DriveFolderUploadSharp';
import { useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { EditPartFormData } from '../../FormData';
import { GET_QUALIFICATION_UNIT_PART_BY_ID } from '../../graphql/GetQualificationUnitPartById';
import formStyles from '../../styles/formStyles';
import buttonStyles from '../../styles/buttonStyles';
import TurndownService from 'turndown';
import MarkdownIt from 'markdown-it';
import { Editor } from '@tinymce/tinymce-react';

const md = new MarkdownIt();

const EditPart: React.FC = () => {
  const navigate = useNavigate();
  const { partId } = useParams();
  const turndownService = new TurndownService();
  const [formData, setFormData] = useState<EditPartFormData>({
    name: '',
    description: '',
    materials: '',
    osaamiset: [],
    notifyStudents: false,
    notifyStudentsText: '',
  });

  const { loading, error, data } = useQuery(GET_QUALIFICATION_UNIT_PART_BY_ID, {
    variables: { partId },
  });

  useEffect(() => {
    console.log('Route partId:', partId);
  }, [partId]);

  useEffect(() => {
    if (!loading && data?.part) {
      console.log('Fetched part:', data.part);
    }
  }, [data, loading]);

  useEffect(() => {
    if (!loading && data?.part && partId) {
      setFormData({
        name: data.part.name || '',
        description: md.render(data.part.description || ''),
        materials: md.render(data.part.materials || ''),
        osaamiset: data.part.osaamiset || [],
        notifyStudents: data.part.notifyStudents ?? false,
        notifyStudentsText: data.part.notifyStudentsText || '',
      });
    }
  }, [data, loading]);

  const part = data?.part;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (content: string, field: 'description' | 'materials') => {
    setFormData((prevFormData) => ({
        ...prevFormData,
        [field]: content,
    }));
};

  const handleNotifyStudents = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      notifyStudents: checked,
      notifyStudentsText: checked ? prev.notifyStudentsText : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const markdownDescription = turndownService.turndown(formData.description);
    const markdownMaterials = turndownService.turndown(formData.materials);

    try {
      console.log(markdownDescription, markdownMaterials);
      navigate('/qualificationunitparts');
    } catch (err) {
      console.error('Submission Error:', err);
    }
  };

  if (loading) return <Typography>Loading part details...</Typography>;
  if (error) return <Typography color="error">Error loading part: {error.message}</Typography>;

  return (
    <Box
      textAlign={'right'}
      sx={formStyles.formEditOuterBox}
    >
      <IconButton
        onClick={() => navigate("/qualificationunitparts")}
        sx={buttonStyles.cancelButton}
      >
        <UndoSharpIcon 
          sx={{
            mr: 1
          }} 
        />
        Hylkää muutokset
      </IconButton>

      <IconButton
        sx={buttonStyles.archiveButton}
      >
        <DriveFolderUploadSharpIcon
          sx={{
            mr: 1
          }} 
        />
        Arkistoi
      </IconButton>
      
      <Box
        component="form"
        onSubmit={handleSubmit}
        textAlign={'center'}
        sx={formStyles.formOuterBox}
      >
        <Box
          sx={formStyles.formBannerBox}
        >
          <Typography variant="h4" align="center" color="white">
            Muokkaa teemaa #{part.id} {part.name}
          </Typography>
        </Box>
        <Box
          sx={formStyles.formColumnBox}
        >
          <Box sx={{ flex: 1 }}>
            <TextField label="Teeman nimi" variant="outlined" name="name" value={formData.name} onChange={handleChange} fullWidth sx={{ my: 2 }} />

            <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 1, paddingLeft: 1 }}>Teeman Kuvaus</InputLabel>
            <Editor
              tinymceScriptSrc='/tinymce/tinymce.min.js'
              value={formData.description}
              onEditorChange={(content) => handleEditorChange(content, 'description')}
              licenseKey='gpl'
              init={{
                height: 400,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 
                  'preview', 'anchor', 'searchreplace', 'visualblocks', 
                  'code', 'fullscreen', 'insertdatetime', 'media', 'table', 
                  'help', 'wordcount'
                ],
                toolbar: 'undo redo | formatselect | bold italic | bullist numlist outdent indent | link image',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
              }}
            />

            <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 1, paddingTop: 2, paddingLeft: 1 }}>Materiaalit</InputLabel>
            <Editor
              tinymceScriptSrc='/tinymce/tinymce.min.js'
              value={formData.materials}
              onEditorChange={(content) => handleEditorChange(content, 'materials')}
              licenseKey='gpl'
              init={{
                height: 400,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 
                  'anchor', 'searchreplace', 'visualblocks', 
                  'insertdatetime', 'media', 'table', 
                  'wordcount'
                ],
                toolbar: 'undo redo | formatselect | bold italic | bullist numlist outdent indent | link image media',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
              }}
            />

            {formData.notifyStudents && (
              <TextField
                label="Muutosilmoitus"
                variant="outlined"
                name="notifyStudentsText"
                value={formData.notifyStudentsText}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                sx={{ my: 2 }}
              />
            )}
          </Box>

          <Box sx={{ flex: 1 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Tutkinnon osa</InputLabel>
                <Box
                  sx={formStyles.formModalInputBox}
                >
                <IconButton
                  color="primary"
                  sx={buttonStyles.openModalButton}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Projektit</InputLabel>
                <Box
                  sx={formStyles.formModalInputBox}
                >
                <IconButton
                  color="primary"
                  sx={buttonStyles.openModalButton}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Osaamiset</InputLabel>
                <Box
                  sx={formStyles.formModalInputBox}
                >
                <IconButton
                  color="primary"
                  sx={buttonStyles.openModalButton}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </FormControl>

            <FormControl
              sx={formStyles.formNotificationBox}
            >
              <Typography sx={{ mb: 1, textAlign: 'left' }}>
                Muutosilmoitus
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography>{formData.notifyStudents 
                  ? 'Ilmoitetaan opiskelijoille' 
                  : 'Ei ilmoiteta'}
                </Typography>
                <Switch
                  checked={formData.notifyStudents}
                  onChange={handleNotifyStudents}
                  name="notifyStudents"
                  color="primary"
                />
              </Box>
            </FormControl>
          </Box>
        </Box>

        <Box textAlign={'center'} sx={{ mt: 2 }}>
          <IconButton
            sx={buttonStyles.saveButton}
            type="submit"
          >
            <SaveAsSharpIcon 
              sx={{
                mr: 1,
              }}
            />
            Tallenna muutokset
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default EditPart;
