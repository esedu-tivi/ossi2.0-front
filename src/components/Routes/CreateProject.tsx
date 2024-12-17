import React, { useEffect } from 'react';
import { TextField, Box, Switch, IconButton, Typography, FormControl } from '@mui/material';
import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_PROJECT } from '../../graphql/CreateProject';
import Selector from '../Selector';
import { GET_PARTS } from '../../graphql/GetParts';
import { GET_PROJECTS } from '../../graphql/GetProjects';
import { GET_PROJECT_TAGS } from '../../graphql/GetProjectTags';
import formStyles from '../../styles/formStyles';
import buttonStyles from '../../styles/buttonStyles';
import TurndownService from 'turndown';
import RichTextEditor from '../common/RichTextEditor';
import ChipSelector from '../common/ChipSelector';
import { formHandleManager } from '../common/formHandleManager';

const NewProjectForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const turndownService = new TurndownService();
    const initialState = {
        name: '',
        description: '',
        materials: '',
        osaamiset: [],
        duration: 0,
        tags: [],
        includedInParts: [],
        isActive: false,
    };

    // Usable handles imported from formHandleManager.tsx
    const {
        formData,
        setFormData,
        selectorOpen,
        handleAdd,
        currentField,
        selectedItems,
        setSelectorOpen,
        handleChange,
        handleToggleActivity,
        handleEditorChange,
        handleAddItem,
        handleRemoveItem,
    } = formHandleManager(initialState);

    // Stores data between routes/modal
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

    // Mutation for creating new project
    const [createProject, { loading, error, data }] = useMutation(CREATE_PROJECT, {
        refetchQueries: [{ query: GET_PROJECTS }],
    });

    // Queries for QualificationUnitParts and Tags
    const { loading: partsLoading, error: partsError, data: partsData } = useQuery(GET_PARTS);
    const { loading: projectTagsLoading, error: projectTagsError, data: projectTagsData, refetch } = useQuery(GET_PROJECT_TAGS);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Allows turndown to handle iframes and video as Markdown
        turndownService.addRule('iframes', {
            filter: ['iframe', 'video'],
            replacement: (content, node) => {
                const element = node as HTMLElement;
                const attrs = Array.from(element.attributes)
                    .map(attr => `${attr.name}="${attr.value}"`)
                    .join(' ');
                return `<${element.nodeName.toLowerCase()} ${attrs}>${content}</${element.nodeName.toLowerCase()}>`;
            }
        });

        // Modifies HTML to Markdown language using turndown before creating the new project
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

        // Returns selectable modal data based on selected field
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
                    <TextField 
                        label="Projektin nimi" 
                        variant="outlined" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        fullWidth 
                        sx={{ my: 2 }} 
                    />

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

                    <ChipSelector
                        label="Teemat"
                        items={formData.includedInParts}
                        onAdd={() => handleAddItem('includedInParts')}
                        onDelete={(index) => handleRemoveItem('includedInParts', index)}
                    />

                    <ChipSelector
                        label="Osaamiset"
                        items={formData.osaamiset}
                        onAdd={() => handleAddItem('osaamiset')}
                        onDelete={(index) => handleRemoveItem('osaamiset', index)}
                    />

                    <ChipSelector
                        label="Tunnisteet"
                        items={formData.tags}
                        onAdd={() => handleAddItem('tags')}
                        onDelete={(index) => handleRemoveItem('tags', index)}
                    />
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
