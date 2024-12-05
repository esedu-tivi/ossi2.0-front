import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Box, Switch, IconButton, Typography, Chip, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DriveFolderUploadSharpIcon from '@mui/icons-material/DriveFolderUploadSharp';
import UndoSharpIcon from '@mui/icons-material/UndoSharp';
import SaveAsSharpIcon from '@mui/icons-material/SaveAsSharp';
import { EditProjectFormData } from '../../FormData';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECT_BY_ID } from '../../graphql/GetProjectById';
import { GET_PROJECTS } from '../../graphql/GetProjects';
import { UPDATE_PROJECT } from '../../graphql/UpdateProject';
import { GET_PARTS } from '../../graphql/GetParts';
import { GET_PROJECT_TAGS } from '../../graphql/GetProjectTags';
import Selector from '../Selector';
import { Item } from '../../FormData';

const EditProject: React.FC = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();

    const [formData, setFormData] = useState<EditProjectFormData>({
        name: '',
        description: '',
        materials: '',
        osaamiset: [],
        duration: 0,
        tags: [],
        includedInParts: [],
        isActive: false,
        notifyStudents: false,
        notifyStudentsText: '',
    });

    const [selectedItems, setSelectedItems] = useState<{ [key: string]: Item[] }>({
        tags: [],
        osaamiset: [],
        includedInParts: [],
    });

    const { loading, error, data } = useQuery(GET_PROJECT_BY_ID, {
        variables: { id: projectId },
    });

    useEffect(() => {
        if (!loading && data?.project) {
            setFormData({
                name: data.project.name || '',
                description: data.project.description || '',
                materials: data.project.materials || '',
                osaamiset: data.project.osaamiset || [],
                duration: Number(data.project.duration) || 0,
                includedInParts: data.project.includedInQualificationUnitParts || [],
                tags: data.project.tags || [],
                isActive: data.project.isActive ?? false,
                notifyStudents: data.project.notifyStudents ?? false,
                notifyStudentsText: data.project.notifyStudentsText || '',
            });

            setSelectedItems({
                tags: data.project.tags || [],
                osaamiset: data.project.osaamiset || [],
                includedInParts: data.project.includedInQualificationUnitParts || [],
            });
            console.log('Project data:', data.project);
        }
    }, [data, loading]);

    const project = data?.project;

    const [updateProject] = useMutation(UPDATE_PROJECT, {
        onCompleted() {
            navigate('/teacherprojects');
        },
        refetchQueries: [{ query: GET_PROJECTS }],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'duration' ? (value === '' ? 0 : Number(value)) : value,
        });
    };

    const handleToggleActivity = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, isActive: e.target.checked });
        console.log('isActive:', e.target.checked);
    };

    const handleNotifyStudents = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = event.target;
        setFormData((prev) => ({
            ...prev,
            notifyStudents: checked,
            notifyStudentsText: checked ? prev.notifyStudentsText : '',
        }));
    };

    const [selectorOpen, setSelectorOpen] = useState(false);
    const [currentField, setCurrentField] = useState<keyof Pick<EditProjectFormData, 'tags' | 'osaamiset' | 'includedInParts'>>('tags');

    const { loading: partsLoading, error: partsError, data: partsData } = useQuery(GET_PARTS);
    const { loading: projectTagsLoading, error: projectTagsError, data: projectTagsData, refetch } = useQuery(GET_PROJECT_TAGS);

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

    const handleAddItem = (field: keyof Pick<EditProjectFormData, 'tags' | 'osaamiset' | 'includedInParts'>) => {
        setCurrentField(field);
        setSelectorOpen(true);
    };

    const handleRemoveItem = (field: keyof Pick<EditProjectFormData, 'tags' | 'osaamiset' | 'includedInParts'>, index: number) => {
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
        if (!projectId) {
            console.error('Project ID is missing, cannot submit the form.');
            return;
        }
        try {
            const response = await updateProject({
                variables: {
                    updateProjectId: projectId,
                    project: {
                        name: formData.name,
                        description: formData.description,
                        materials: formData.materials,
                        duration: formData.duration,
                        includedInParts: formData.includedInParts.map((item) => item.id),
                        tags: formData.tags.map((item) => item.id),
                        isActive: Boolean(formData.isActive),
                        notifyStudents: Boolean(formData.notifyStudents),
                    },
                },
            });
            console.log('Updated project:', response.data);
        } catch (err) {
            console.error('Error updating project:', err);
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

    if (loading) return <Typography>Loading project details...</Typography>;
    if (error) return <Typography color="error">Error loading project: {error.message}</Typography>;

    return (
        <Box
            textAlign={'right'}
            sx={{
                maxWidth: 1600,
                margin: 'auto',
                padding: 3,
                position: 'relative',
            }}
        >
            <IconButton
                onClick={() => navigate('/teacherprojects')}
                sx={{
                    backgroundColor: '#65558F',
                    color: '#fff',
                    borderRadius: 5,
                    width: 1 / 6,
                    padding: 1,
                    mb: 2,
                    fontSize: '1rem',
                    fontWeight: 400,
                    '&:hover': {
                        backgroundColor: '#4e4574',
                    },
                    boxShadow: 3,
                }}
            >
                <UndoSharpIcon
                    sx={{
                        mr: 1,
                    }}
                />
                Hylkää muutokset
            </IconButton>

            <IconButton
                sx={{
                    backgroundColor: '#65558F',
                    color: '#fff',
                    borderRadius: 5,
                    width: 1 / 10,
                    padding: 1,
                    ml: 3,
                    mb: 2,
                    fontSize: '1rem',
                    fontWeight: 400,
                    '&:hover': {
                        backgroundColor: '#4e4574',
                    },
                    boxShadow: 3,
                }}
            >
                <DriveFolderUploadSharpIcon
                    sx={{
                        mr: 1,
                    }}
                />
                Arkistoi
            </IconButton>

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
                        Muokkaa projektia #{project.id} {project.name}
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
                        <TextField
                            label="Projektin nimi"
                            variant="outlined"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                            sx={{ my: 2 }}
                        />

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
                            <InputLabel
                                sx={{
                                    display: 'flex',
                                    position: 'relative',
                                    paddingBottom: 3,
                                }}
                            >
                                Teemat
                            </InputLabel>
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
                            <InputLabel
                                sx={{
                                    display: 'flex',
                                    position: 'relative',
                                    paddingBottom: 3,
                                }}
                            >
                                Osaamiset
                            </InputLabel>
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
                                    <Chip
                                        key={exp.id}
                                        label={exp.name}
                                        onDelete={() => handleRemoveItem('osaamiset', index)}
                                        sx={{ backgroundColor: '#E0E0E0' }}
                                    />
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
                            <InputLabel
                                sx={{
                                    display: 'flex',
                                    position: 'relative',
                                    paddingBottom: 3,
                                }}
                            >
                                Tunnisteet
                            </InputLabel>
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
                                    <Chip key={tag.id} label={tag.name} onDelete={() => handleRemoveItem('tags', index)} sx={{ backgroundColor: '#E0E0E0' }} />
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
                            {/* TODO miksi projektin tila valitsin on avatessa true vaikka fromData.isActive on false */}
                            <Typography sx={{ mb: 1, textAlign: 'left' }}>Projektin tila</Typography>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography>{formData.isActive ? 'Aktiivinen' : 'Ei aktiivinen'}</Typography>
                                <Switch checked={!!formData.isActive} onChange={handleToggleActivity} name="isActive" color="primary" />
                            </Box>
                        </FormControl>

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
                            <Typography sx={{ mb: 1, textAlign: 'left' }}>Muutosilmoitus</Typography>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography>{formData.notifyStudents ? 'Ilmoitetaan opiskelijoille' : 'Ei ilmoiteta'}</Typography>
                                <Switch checked={formData.notifyStudents} onChange={handleNotifyStudents} name="notifyStudents" color="primary" />
                            </Box>
                        </FormControl>
                    </Box>
                </Box>

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
                    <SaveAsSharpIcon
                        sx={{
                            mr: 1,
                        }}
                    />
                    Tallenna muutokset
                </IconButton>
            </Box>

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

export default EditProject;
