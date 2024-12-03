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

const NewProjectForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: string[] }>({
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

    const handleAdd = (items: string[]) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await createProject({
                variables: {
                    project: {
                        name: formData.name,
                        description: formData.description,
                        materials: formData.materials,
                        duration: formData.duration,
                        includedInParts: formData.includedInParts,
                        tags: formData.tags,
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
                return projectTagsData ? projectTagsData.projectTags.map((projectTag: { name: string }) => projectTag.name) : [];
            case 'osaamiset':
                return [
                    'Osaaminen 1',
                    'Osaaminen 2',
                    'Osaaminen 3',
                    'Osaaminen 4',
                    'Osaaminen 5',
                    'sopii tehtävistä tiimin muiden jäsenten kanssa',
                    'etsii ratkaisuvaihtoehtoja ja ratkoo ongelmia yhdessä tiimin kanssa',
                    'arvioi ratkaisujen toimivuuden yhdessä tiimin kanssa',
                    'arvioi omaa toimintaa tiimin jäsenenä',
                ];
            case 'includedInParts':
                return partsData ? partsData.parts.map((part: { name: string }) => part.name) : ['Teema 1', 'Teema 2', 'Teema 3', 'Teema 4', 'Teema 5'];
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
            sx={{
                maxWidth: 1600,
                margin: 'auto',
                padding: 3,
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: 'white',
                position: 'relative',
            }}
        >
            <Box
                sx={{
                    backgroundColor: '#65558F',
                    borderRadius: '8px 8px 0 0',
                    padding: 2,
                    width: 'calc(100% + 17px)',
                    marginLeft: '-24px',
                    marginTop: '-24px',
                }}
            >
                <Typography variant="h4" align="center" color="white">
                    Luo Projekti
                </Typography>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    mt: 2,
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <TextField label="Projektin nimi" variant="outlined" name="name" value={formData.name} onChange={handleChange} fullWidth sx={{ my: 2 }} />

                    <TextField
                        label="Projektin kuvaus"
                        variant="outlined"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={10}
                        sx={{ my: 2 }}
                    />

                    <TextField
                        label="Materiaalit"
                        variant="outlined"
                        name="materials"
                        value={formData.materials}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={10}
                        sx={{ my: 2 }}
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
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                position: 'relative',
                                border: '1px solid #ccc',
                                borderRadius: 1,
                                padding: 1,
                                minHeight: 32,
                            }}
                        >
                            {formData.includedInParts.map((parts, index) => (
                                <Chip
                                    key={index}
                                    label={parts}
                                    onDelete={() => handleRemoveItem('includedInParts', index)}
                                    sx={{ backgroundColor: '#E0E0E0' }}
                                />
                            ))}
                            <IconButton
                                onClick={() => handleAddItem('includedInParts')}
                                color="primary"
                                sx={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                }}
                            >
                                <AddIcon />
                            </IconButton>
                        </Box>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Osaamiset</InputLabel>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                position: 'relative',
                                border: '1px solid #ccc',
                                borderRadius: 1,
                                padding: 1,
                                minHeight: 32,
                            }}
                        >
                            {formData.osaamiset.map((exp, index) => (
                                <Chip key={index} label={exp} onDelete={() => handleRemoveItem('osaamiset', index)} sx={{ backgroundColor: '#E0E0E0' }} />
                            ))}
                            <IconButton
                                onClick={() => handleAddItem('osaamiset')}
                                color="primary"
                                sx={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                }}
                            >
                                <AddIcon />
                            </IconButton>
                        </Box>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Tunnisteet</InputLabel>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                position: 'relative',
                                border: '1px solid #ccc',
                                borderRadius: 1,
                                padding: 1,
                                minHeight: 32,
                            }}
                        >
                            {formData.tags.map((tag, index) => (
                                <Chip 
                                    key={index} 
                                    label={tag} 
                                    onDelete={() => handleRemoveItem('tags', index)} 
                                    sx={{ backgroundColor: '#E0E0E0' }} />
                            ))}
                            <IconButton
                                onClick={() => handleAddItem('tags')}
                                color="primary"
                                sx={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                }}
                            >
                                <AddIcon />
                            </IconButton>
                        </Box>
                    </FormControl>
                </Box>
            </Box>
            <FormControl
                sx={{
                    maxWidth: 300,
                    display: 'flex',
                    flexDirection: 'column',
                    my: 1,
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    padding: 2,
                }}
            >
                <Typography sx={{ mb: 1, textAlign: 'left' }}>Projektin tila</Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography>{formData.isActive ? 'Aktiivinen' : 'Ei aktiivinen'}</Typography>
                    <Switch checked={formData.isActive} onChange={handleToggleActivity} name="isActive" color="primary" />
                </Box>
            </FormControl>
            <IconButton
                type="submit"
                sx={{
                    backgroundColor: '#65558F',
                    color: '#fff',
                    borderRadius: 5,
                    mt: 3,
                    width: 1 / 4,
                    padding: 1,
                    fontSize: '1rem',
                    fontWeight: 400,
                    '&:hover': {
                        backgroundColor: '#4e4574',
                    },
                    boxShadow: 3,
                }}
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