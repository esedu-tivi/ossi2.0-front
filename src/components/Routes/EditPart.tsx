import React, { useState, useEffect } from 'react';
import { TextField, Box, IconButton, Typography, FormControl, InputLabel, Chip, Switch } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveAsSharpIcon from '@mui/icons-material/SaveAsSharp';
import UndoSharpIcon from '@mui/icons-material/UndoSharp';
import DriveFolderUploadSharpIcon from '@mui/icons-material/DriveFolderUploadSharp';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { EditPartFormData, Item } from '../../FormData';
import { GET_QUALIFICATION_UNIT_PART_BY_ID } from '../../graphql/GetQualificationUnitPartById';
import { GET_PROJECTS } from '../../graphql/GetProjects';
import formStyles from '../../styles/formStyles';
import buttonStyles from '../../styles/buttonStyles';
import Selector from '../Selector';

const EditPart: React.FC = () => {
    const navigate = useNavigate();
    const { partId } = useParams();
    const [formData, setFormData] = useState<EditPartFormData>({
        name: '',
        description: '',
        materials: '',
        osaamiset: [],
        projects: [],
        qualificationUnit: [],
        notifyStudents: false,
        notifyStudentsText: '',
    });

    const [selectorOpen, setSelectorOpen] = useState(false);
    const [currentField, setCurrentField] = useState<keyof Pick<EditPartFormData, 'osaamiset' | 'projects' | 'qualificationUnit'>>('osaamiset');
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: Item[] }>({
        osaamiset: [],
        projects: [],
        qualificationUnit: [],
    });

    const { loading, error, data } = useQuery(GET_QUALIFICATION_UNIT_PART_BY_ID, {
        variables: { partId },
    });

    const { loading: projectsLoading, error: projectsError, data: projectsData } = useQuery(GET_PROJECTS);

    useEffect(() => {
        if (!loading && data?.part) {
            setFormData({
                name: data.part.name || '',
                description: data.part.description || '',
                materials: data.part.materials || '',
                osaamiset: data.part.osaamiset || [],
                projects: data.part.projects || [],
                qualificationUnit: data.part.qualificationUnit || [],
                notifyStudents: data.part.notifyStudents ?? false,
                notifyStudentsText: data.part.notifyStudentsText || '',
            });

            setSelectedItems({
                osaamiset: data.part.osaamiset || [],
                projects: data.part.projects || [],
                qualificationUnit: data.part.qualificationUnit || [],
            });
        }
    }, [data, loading]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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

    const handleAddItem = (field: keyof Pick<EditPartFormData, 'osaamiset' | 'projects' | 'qualificationUnit'>) => {
        setCurrentField(field);
        setSelectorOpen(true);
    };

    const handleRemoveItem = (field: keyof Pick<EditPartFormData, 'osaamiset' | 'projects' | 'qualificationUnit'>, index: number) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [field]: prevFormData[field].filter((_, i) => i !== index),
        }));
        setSelectedItems((prevSelectedItems) => ({
            ...prevSelectedItems,
            [field]: prevSelectedItems[field].filter((_, i) => i !== index),
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

        try {
            console.log('Nothing to see here yet');
            navigate('/qualificationunitparts');
        } catch (err) {
            console.error('Submission Error:', err);
        }
    };

    const getTitleAndButtonText = () => {
        switch (currentField) {
            case 'osaamiset':
                return { title: 'Valitse Osaamiset', buttonText: 'Lisää Osaamiset' };
            case 'projects':
                return { title: 'Valitse Projektit', buttonText: 'Lisää Projektit' };
            case 'qualificationUnit':
                return { title: 'Valitse Tutkinnon osa', buttonText: 'Lisää Tutkinnon osa' };
            default:
                return { title: '', buttonText: '' };
        }
    };

    const getItems = () => {
        if (projectsLoading) {
            return ['Ladataan...'];
        }
        if (projectsError) {
            return ['Virhe ladattaessa tietoja'];
        }
        if (currentField === 'projects') {
            return projectsData ? projectsData.projects : [];
        }
        if (currentField === 'osaamiset') {
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
        }
        if (currentField === 'qualificationUnit') {
            return [
                { id: '1', name: 'Tutkinnon osa 1' },
                { id: '2', name: 'Tutkinnon osa 2' },
                { id: '3', name: 'Tutkinnon osa 3' },
                { id: '4', name: 'Tutkinnon osa 4' },
                { id: '5', name: 'Tutkinnon osa 5' },
                { id: '6', name: 'Tutkinnon osa 6' },
                { id: '7', name: 'Tutkinnon osa 7' },
                { id: '8', name: 'Tutkinnon osa 8' },
                { id: '9', name: 'Tutkinnon osa 9' },
                { id: '10', name: 'Tutkinnon osa 10' },
            ];
        }
        return [];
    };

    const { title, buttonText } = getTitleAndButtonText();
    const items = getItems();

    if (loading) return <Typography>Loading part details...</Typography>;
    if (error) return <Typography color="error">Error loading part: {error.message}</Typography>;

    return (
        <Box textAlign={'right'} sx={formStyles.formEditOuterBox}>
            <IconButton onClick={() => navigate('/qualificationunitparts')} sx={buttonStyles.cancelButton}>
                <UndoSharpIcon sx={{ mr: 1 }} />
                Hylkää muutokset
            </IconButton>

            <IconButton sx={buttonStyles.archiveButton}>
                <DriveFolderUploadSharpIcon sx={{ mr: 1 }} />
                Arkistoi
            </IconButton>

            <Box component="form" onSubmit={handleSubmit} textAlign={'center'} sx={formStyles.formOuterBox}>
                <Box sx={formStyles.formBannerBox}>
                    <Typography variant="h4" align="center" color="white">
                        Muokkaa teemaa #{partId} {formData.name}
                    </Typography>
                </Box>
                <Box sx={formStyles.formColumnBox}>
                    <Box sx={{ flex: 1 }}>
                        <TextField label="Teeman nimi" variant="outlined" name="name" value={formData.name} onChange={handleChange} fullWidth sx={{ my: 2 }} />

                        <TextField
                            label="Teeman kuvaus"
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
                        <FormControl fullWidth>
                            <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Tutkinnon osa</InputLabel>
                            <Box sx={formStyles.formModalInputBox}>
                                {formData.qualificationUnit.map((unit, index) => (
                                    <Chip
                                        key={unit.id}
                                        label={unit.name}
                                        onDelete={() => handleRemoveItem('qualificationUnit', index)}
                                        sx={{ backgroundColor: '#E0E0E0' }}
                                    />
                                ))}
                                <IconButton onClick={() => handleAddItem('qualificationUnit')} color="primary" sx={buttonStyles.openModalButton}>
                                    <AddIcon />
                                </IconButton>
                            </Box>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Projektit</InputLabel>
                            <Box sx={formStyles.formModalInputBox}>
                                {formData.projects.map((project, index) => (
                                    <Chip
                                        key={project.id}
                                        label={project.name}
                                        onDelete={() => handleRemoveItem('projects', index)}
                                        sx={{ backgroundColor: '#E0E0E0' }}
                                    />
                                ))}
                                <IconButton onClick={() => handleAddItem('projects')} color="primary" sx={buttonStyles.openModalButton}>
                                    <AddIcon />
                                </IconButton>
                            </Box>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel sx={{ display: 'flex', position: 'relative', paddingBottom: 3 }}>Osaamiset</InputLabel>
                            <Box sx={formStyles.formModalInputBox}>
                                {formData.osaamiset.map((osaaminen, index) => (
                                    <Chip
                                        key={osaaminen.id}
                                        label={osaaminen.name}
                                        onDelete={() => handleRemoveItem('osaamiset', index)}
                                        sx={{ backgroundColor: '#E0E0E0' }}
                                    />
                                ))}
                                <IconButton onClick={() => handleAddItem('osaamiset')} color="primary" sx={buttonStyles.openModalButton}>
                                    <AddIcon />
                                </IconButton>
                            </Box>
                        </FormControl>
                        <FormControl sx={formStyles.formNotificationBox}>
                            <Typography sx={{ mb: 1, textAlign: 'left' }}>Muutosilmoitus</Typography>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography>{formData.notifyStudents ? 'Ilmoitetaan opiskelijoille' : 'Ei ilmoiteta'}</Typography>
                                <Switch checked={formData.notifyStudents} onChange={handleNotifyStudents} name="notifyStudents" color="primary" />
                            </Box>
                        </FormControl>
                    </Box>
                </Box>

                <IconButton sx={buttonStyles.saveButton} type="submit">
                    <SaveAsSharpIcon sx={{ mr: 1 }} />
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
                updateProjectTags={() => {}} // Replace with actual function if needed
            />
        </Box>
    );
};

export default EditPart;
