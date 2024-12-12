import React, { useState } from 'react';
import {
  TextField,
  Box,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import { useNavigate } from 'react-router-dom';
import { CreatePartFormData } from '../../FormData';
import formStyles from '../../styles/formStyles';
import buttonStyles from '../../styles/buttonStyles';
import { Editor } from '@tinymce/tinymce-react';
import TurndownService from 'turndown';

const CreatePart: React.FC = () => {
  const navigate = useNavigate();
  const turndownService = new TurndownService();
  const [formData, setFormData] = useState<CreatePartFormData>({
    name: '',
    description: '',
    materials: '',
    osaamiset: [],
  });

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

  return (
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
          Luo Teema
        </Typography>
      </Box>
      <Box
        sx={formStyles.formColumnBox}
      >
        <Box sx={{ flex: 1 }}>
          <TextField label="Teeman nimi" variant="outlined" name="name" value={formData.name} onChange={handleChange} fullWidth sx={{ my: 2 }} />

          <Box sx={{ flex: 1 }}>
            <TextField label="Projektin nimi" variant="outlined" name="name" value={formData.name} onChange={handleChange} fullWidth sx={{ my: 2 }} />
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
          </Box>
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
        </Box>
      </Box>

      <Box textAlign={'center'} sx={{ mt: 2 }}>
        <IconButton
          sx={buttonStyles.saveButton}
          type="submit"
        >
          <SaveSharpIcon 
            sx={{
              mr: 1,
            }}
          />
          Luo Teema
        </IconButton>
      </Box>
    </Box>
  );
};

export default CreatePart;
