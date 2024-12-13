import React, { useState, useEffect } from 'react';
import { TextField, Box, Switch, IconButton, Typography, Chip, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreateProjectFormData } from '../../FormData';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_PROJECT } from '../../graphql/CreateProject';
import Selector from '../Selector';
import { GET_PARTS } from '../../graphql/GetParts';
import { GET_PROJECTS } from '../../graphql/GetProjects';
import { GET_PROJECT_TAGS } from '../../graphql/GetProjectTags';
import { Item } from '../../FormData';
import formStyles from '../../styles/formStyles';
import buttonStyles from '../../styles/buttonStyles';
import { Editor } from '@tinymce/tinymce-react';
import TurndownService from 'turndown';

const NewProjectForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const turndownService = new TurndownService();
    const [formData, setFormData] = useState<CreateProjectFormData>({
        name: '',
        description: '',
        materials: '',
        osaamiset: [],
        duration: 0,
        tags: [],
        includedInParts: [],
        isActive: false,
    });

    useEffect(() => {
        if (location.state) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                description: location.state.description || '',
                materials: location.state.materials || '',
                includedInParts: location.state.includedInParts || [],
            }));
        }
    }, [location.state]);

    const [selectorOpen, setSelectorOpen] = useState(false);
    const [currentField, setCurrentField] = useState<keyof Pick<CreateProjectFormData, 'tags' | 'osaamiset' | 'includedInParts'>>('tags');
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: Item[] }>({
        tags: [],
        osaamiset: [],
        includedInParts: [],
    });
    const [createProject, { loading, error, data }] = useMutation(CREATE_PROJECT, {
        refetchQueries: [{ query: GET_PROJECTS }],
    });
    const { loading: partsLoading, error: partsError, data: partsData } = useQuery(GET_PARTS);
    const { loading: projectTagsLoading, error: projectTagsError, data: projectTagsData, refetch } = useQuery(GET_PROJECT_TAGS);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'duration' ? (value === '' ? '' : Number(value)) : value,
        });
    };

    const handleToggleActivity = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, isActive: e.target.checked });
    };

    const handleAdd = (items: Item[]) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [currentField]: items,
        }));
        setSelectedItems((prevSelectedItems) => ({
            ...prevSelectedItems,
            [currentField]: items,
        }));
        setSelectorOpen(false);
    };

    const handleAddItem = (field: keyof Pick<CreateProjectFormData, 'tags' | 'osaamiset' | 'includedInParts'>) => {
        if (field !== 'includedInParts' && formData.includedInParts.length === 0) {
            alert('Valitse ensin Teema.');
            return;
        }

        setCurrentField(field);
        setSelectorOpen(true);
    };

    const handleRemoveItem = (field: keyof Pick<CreateProjectFormData, 'tags' | 'osaamiset' | 'includedInParts'>, index: number) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [field]: prevFormData[field].filter((_, i) => i !== index),
        }));
        setSelectedItems((prevSelectedItems) => ({
            ...prevSelectedItems,
            [field]: prevSelectedItems[field].filter((_, i) => i !== index),
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
            console.log('IncludedInParts Before Submission:', formData.includedInParts);
            const response = await createProject({
                variables: {
                    project: {
                        name: formData.name,
                        description: markdownDescription,
                        materials: markdownMaterials,
                        duration: formData.duration,
                        includedInParts: formData.includedInParts.map(part => part.id),
                        tags: formData.tags.map(tag => tag.id),
                        isActive: formData.isActive,
                    },
                },
            });
            console.log('GraphQL Response:', response.data);
            navigate('/teacherprojects');
        } catch (err) {
            console.error('Submission Error:', err);
        }
    };

    const getTitleAndButtonText = () => {
        switch (currentField) {
            case 'tags':
                return { title: 'Valitse Tunnisteet', buttonText: 'Lisää Tunnisteet' };
            case 'osaamiset':
                return { title: 'Valitse Osaamiset', buttonText: 'Lisää Osaamiset' };
            case 'includedInParts':
                return { title: 'Valitse Teemat', buttonText: 'Lisää Teemat' };
            default:
                return { title: '', buttonText: '' };
        }
    };

    const getItems = () => {
        if (partsLoading) {
            return ['Ladataan...'];
        }
        if (partsError) {
            return ['Virhe ladattaessa teemoja'];
        }
        if (projectTagsLoading) {
            return ['Ladataan...'];
        }
        if (projectTagsError) {
            return ['Virhe ladattaessa tunnisteita'];
        }

        switch (currentField) {
            case 'tags':
                return projectTagsData ? projectTagsData.projectTags : [];
            case 'osaamiset':
                return [
                    { id: '1', name: 'Osaaminen 1' },
                    { id: '2', name: 'Osaaminen 2' },
                    { id: '3', name: 'Osaaminen 3' },
                    { id: '4', name: 'Osaaminen 4' },
                    { id: '5', name: 'Osaaminen 5' },
                    { id: '6', name: 'sopii tehtävistä tiimin muiden jäsenten kanssa' },
                    { id: '7', name: 'etsii ratkaisuvaihtoehtoja ja ratkoo ongelmia yhdessä tiimin kanssa' },
                    { id: '8', name: 'arvioi ratkaisujen toimivuuden yhdessä tiimin kanssa' },
                    { id: '9', name: 'arvioi omaa toimintaa tiimin jäsenenä' },
                ];
            case 'includedInParts':
                return partsData ? partsData.parts : [];
            default:
                return [];
        }
    };

    const updateProjectTags = () => {
        refetch();
    };

    const { title, buttonText } = getTitleAndButtonText();
    const items = getItems();

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
                    Luo Projekti
                </Typography>
            </Box>
            <Box
                sx={formStyles.formColumnBox}
            >
                <Box sx={{ flex: 1 }}>
                    <TextField label="Projektin nimi" variant="outlined" name="name" value={formData.name} onChange={handleChange} fullWidth sx={{ my: 2 }} />
                    <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 1, paddingLeft: 1 }}>Projektin kuvaus</InputLabel>
                    <Editor
                        tinymceScriptSrc='/tinymce/tinymce.min.js'
                        value={formData.description}
                        onEditorChange={(content) => handleEditorChange(content, 'description')}
                        licenseKey='gpl'
                        init={{
                            height: 400,
                            menubar: false,
                            paste_data_images: true,
                            plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                'preview', 'anchor', 'searchreplace', 'visualblocks',
                                'code', 'fullscreen', 'insertdatetime', 'media', 'table',
                                'help', 'wordcount', 'paste'
                            ],                            
                            toolbar: 'undo redo | formatselect | bold italic | bullist numlist outdent indent | link image',
                            images_file_types: 'jpeg, jpg, png, gif',
                            file_picker_types: 'image',
                            automatic_uploads: true,
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

                <Box sx={{ flex: 1 }}>
                    <TextField
                        label="Ajankäyttö"
                        variant="outlined"
                        name="duration"
                        type="number"
                        value={formData.duration}
                        onChange={handleChange}
                        fullWidth
                        sx={{ my: 2 }}
                    />

                    <FormControl fullWidth>
                        <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Teemat</InputLabel>
                        <Box
                            sx={formStyles.formModalInputBox}
                        >
                            {formData.includedInParts.map((part, index) => (
                                <Chip
                                    key={part.id}
                                    label={part.name}
                                    onDelete={() => handleRemoveItem('includedInParts', index)}
                                    sx={{ backgroundColor: '#E0E0E0' }}
                                />
                            ))}
                            <IconButton
                                onClick={() => handleAddItem('includedInParts')}
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
                            {formData.osaamiset.map((exp, index) => (
                                <Chip key={exp.id} label={exp.name} onDelete={() => handleRemoveItem('osaamiset', index)} sx={{ backgroundColor: '#E0E0E0' }} />
                            ))}
                            <IconButton
                                onClick={() => handleAddItem('osaamiset')}
                                color="primary"
                                sx={buttonStyles.openModalButton}
                            >
                                <AddIcon />
                            </IconButton>
                        </Box>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Tunnisteet</InputLabel>
                        <Box
                            sx={formStyles.formModalInputBox}
                        >
                            {formData.tags.map((tag, index) => (
                                <Chip key={tag.id} label={tag.name} onDelete={() => handleRemoveItem('tags', index)} sx={{ backgroundColor: '#E0E0E0' }} />
                            ))}
                            <IconButton
                                onClick={() => handleAddItem('tags')}
                                color="primary"
                                sx={buttonStyles.openModalButton}
                            >
                                <AddIcon />
                            </IconButton>
                        </Box>
                    </FormControl>
                </Box>
            </Box>
            <FormControl
                sx={formStyles.formActivityBox}
            >
                <Typography sx={{ mb: 1, textAlign: 'left' }}>Projektin tila</Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography>{formData.isActive ? 'Aktiivinen' : 'Ei aktiivinen'}</Typography>
                    <Switch checked={formData.isActive} onChange={handleToggleActivity} name="isActive" color="primary" />
                </Box>
            </FormControl>
            <IconButton
                type="submit"
                sx={buttonStyles.saveButton}
            >
                <SaveSharpIcon
                    sx={{
                        mr: 1,
                    }}
                />
                {loading ? 'Submitting...' : 'Luo Projekti'}
            </IconButton>
            {error && <Typography color="error">Virhe: {error.message}</Typography>}
            {data && <Typography color="success">Projekti lisätty</Typography>}
            <Selector
                items={items}
                title={title}
                buttonText={buttonText}
                open={selectorOpen}
                selectedItems={selectedItems[currentField]}
                onAdd={handleAdd}
                onClose={() => setSelectorOpen(false)}
                currentField={currentField}
                updateProjectTags={updateProjectTags}
            />
        </Box>
    );
};

export default NewProjectForm;
