import React, { useState } from 'react';
import { TextField, Box, IconButton, Typography, FormControl, InputLabel, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { CreatePartFormData, Item } from '../../FormData';
import { GET_PROJECTS } from '../../graphql/GetProjects';
import formStyles from '../../styles/formStyles';
import buttonStyles from '../../styles/buttonStyles';
import Selector from '../Selector';
import RichTextEditor from '../common/RichTextEditor';
import ArrowBackIosSharpIcon from '@mui/icons-material/ArrowBackIosSharp';

const CreatePart: React.FC = () => {
    const navigate = useNavigate();

    // State to manage form data
    const [formData, setFormData] = useState<CreatePartFormData>({
        name: '',
        description: '',
        materials: '',
        osaamiset: [],
        projects: [],
        qualificationUnit: [],
    });

    // Handles data changes on TinyMCE editor input fields
    const handleEditorChange = (content: string, field: 'description' | 'materials') => {
        setFormData((prevFormData) => ({
        ...prevFormData,
        [field]: content,
        }));
    };

    // State to manage the visibility of the Selector component
    const [selectorOpen, setSelectorOpen] = useState(false);

    // State to manage the current field being edited
    const [currentField, setCurrentField] = useState<keyof Pick<CreatePartFormData, 'osaamiset' | 'projects' | 'qualificationUnit'>>('osaamiset');

    // State to manage selected items for each field
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: Item[] }>({
        osaamiset: [],
        projects: [],
        qualificationUnit: [],
    });

    // Fetch projects data using Apollo Client's useQuery hook
    const { loading: projectsLoading, error: projectsError, data: projectsData } = useQuery(GET_PROJECTS);

    // Handle input changes in the form fields
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle adding selected items to the form data
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

    // Handle opening the Selector component for a specific field
    const handleAddItem = (field: keyof Pick<CreatePartFormData, 'osaamiset' | 'projects' | 'qualificationUnit'>) => {
        setCurrentField(field);
        setSelectorOpen(true);
    };

    // Handle removing an item from the form data
    const handleRemoveItem = (field: keyof Pick<CreatePartFormData, 'osaamiset' | 'projects' | 'qualificationUnit'>, index: number) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [field]: prevFormData[field].filter((_, i) => i !== index),
        }));
        setSelectedItems((prevSelectedItems) => ({
            ...prevSelectedItems,
            [field]: prevSelectedItems[field].filter((_, i) => i !== index),
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            console.log('Nothing to see here yet');
            navigate('/qualificationunitparts');
        } catch (err) {
            console.error('Submission Error:', err);
        }
    };

    // Get the title and button text for the Selector component based on the current field
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

    // Get the items to be displayed in the Selector component based on the current field
    const getItems = () => {
        if (projectsLoading) {
            return ['Ladataan...'];
        }
        if (projectsError) {
            return ['Virhe ladattaessa projekteja'];
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

    return (
        <Box component="form" onSubmit={handleSubmit} textAlign={'center'} sx={formStyles.formOuterBox}>
            <Box sx={{ ...formStyles.formBannerBox, textAlign: "center", marginBottom: 3, position: 'relative', }}>
                <IconButton
                    onClick={() => navigate("/qualificationunitparts")}
                    sx={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'white',
                    }}
                    >
                    <ArrowBackIosSharpIcon sx={{ fontSize: 36 }} />
                </IconButton>
                <Typography variant="h4" align="center" color="white">
                    Luo Teema
                </Typography>
            </Box>
            <Box sx={formStyles.formColumnBox}>
                <Box sx={{ flex: 1 }}>
                    <TextField label="Teeman nimi" variant="outlined" name="name" value={formData.name} onChange={handleChange} fullWidth sx={{ my: 2 }} />

                    <RichTextEditor
                        label="Projektin kuvaus"
                        value={formData.description}
                        onChange={(content) => handleEditorChange(content, 'description')}
                    />

                    <RichTextEditor
                        label="Materiaalit"
                        value={formData.materials}
                        onChange={(content) => handleEditorChange(content, 'materials')}
                    />
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
                </Box>
            </Box>

            <Box textAlign={'center'} sx={{ mt: 2 }}>
                <IconButton sx={buttonStyles.saveButton} type="submit">
                    <SaveSharpIcon
                        sx={{
                            mr: 1,
                        }}
                    />
                    Luo Teema
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

export default CreatePart;