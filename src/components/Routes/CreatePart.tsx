import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import formStyles from '../../styles/formStyles';
import buttonStyles from '../../styles/buttonStyles';
import Selector from '../Selector';
import RichTextEditor from '../common/RichTextEditor';
import ArrowBackIosSharpIcon from '@mui/icons-material/ArrowBackIosSharp';
import TurndownService from 'turndown';

import { TextField, Box, IconButton, Typography, FormControl, InputLabel, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { CreatePartFormData, Item } from '../../FormData';
import { GET_PROJECTS } from '../../graphql/GetProjects';
import { GET_QUALIFICATION_UNIT_PARTS } from '../../graphql/GetQualificationUnitParts';
import { CREATE_PART } from '../../graphql/CreatePart';
import { GET_QUALIFICATION_UNITS } from '../../graphql/GetQualificationUnits';

const CreatePart: React.FC = () => {
    const navigate = useNavigate();
    const turndownService = new TurndownService();

    // State to manage form data
    const [formData, setFormData] = useState<CreatePartFormData>({
        name: '',
        description: '',
        materials: '',
        projects: [],
        parentQualificationUnit: [],
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
    const [currentField, setCurrentField] = useState<keyof Pick<CreatePartFormData, 'projects' | 'parentQualificationUnit'>>();

    // State to manage selected items for each field
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: Item[] }>({
        projects: [],
        parentQualificationUnit: [],
    });

    // Fetch projects data using Apollo Client's useQuery hook
    const { loading: projectsLoading, error: projectsError, data: projectsData } = useQuery(GET_PROJECTS);

    const { loading: qualificationLoading, error: qualificationError, data: qualificationData } = useQuery(GET_QUALIFICATION_UNITS);

    useEffect(() => {
        console.log('Qualification Units:', qualificationData);
    }, [qualificationData]);

    // Handle input changes in the form fields
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAdd = (items: Item[]) => {
        if (!currentField) return;
    
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
    const handleAddItem = (field: keyof Pick<CreatePartFormData, 'projects' | 'parentQualificationUnit'>) => {
        setCurrentField(field);
        setSelectorOpen(true);
    };

    // Handle removing an item from the form data
    const handleRemoveItem = (field: keyof Pick<CreatePartFormData, 'projects' | 'parentQualificationUnit'>, index: number) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [field]: prevFormData[field].filter((_, i) => i !== index),
        }));
        setSelectedItems((prevSelectedItems) => ({
            ...prevSelectedItems,
            [field]: prevSelectedItems[field].filter((_, i) => i !== index),
        }));
    };

    const [createPart] = useMutation(CREATE_PART, {
        refetchQueries: [
            { query: GET_QUALIFICATION_UNIT_PARTS },
            { query: GET_PROJECTS }   
        ],
    });

    // Handle form submission
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

        console.log("Submitting CreatePart with:", JSON.stringify({
            name: formData.name,
            description: markdownDescription,
            materials: markdownMaterials,
            projects: formData.projects.map((project) => project.id),
            parentQualificationUnit: formData.parentQualificationUnit[0]?.id || "",
        }, null, 2));

        try {
            const response = await createPart({
                variables: {
                    part: {
                        name: formData.name,
                        description: markdownDescription,
                        materials: markdownMaterials,
                        projects: formData.projects.map(project => project.id),
                        parentQualificationUnit: formData.parentQualificationUnit[0]?.id || "",
                    },
                },
            });
            console.log('GraphQL Response:', response.data);
            if (response.data?.createPart) {
                navigate('/qualificationunitparts');
            }
        } catch (err) {
            console.error('Submission Error:', err);
        }
    };

    // Get the title and button text for the Selector component based on the current field
    const getTitleAndButtonText = () => {
        switch (currentField) {
            case 'projects':
                return { title: 'Valitse Projektit', buttonText: 'Lisää Projektit' };
            case 'parentQualificationUnit':
                return { title: 'Valitse Tutkinnon osa', buttonText: 'Lisää Tutkinnon osa' };
            default:
                return { title: '', buttonText: '' };
        }
    };

    // Get the items to be displayed in the Selector component based on the current field
    const getItems = () => {
        if (projectsLoading || qualificationLoading) {
            return [];
        }
        if (projectsError || qualificationError) {
            console.error('Error loading data:', projectsError || qualificationError);
            return [];
        }
        return currentField === 'projects'
            ? projectsData?.projects ?? []
            : currentField === 'parentQualificationUnit'
            ? qualificationData?.units ?? []
            : [];
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
                            {formData.parentQualificationUnit.map((unit, index) => (
                                <Chip
                                    key={unit.id}
                                    label={unit.name}
                                    onDelete={() => handleRemoveItem('parentQualificationUnit', index)}
                                    sx={{ backgroundColor: '#E0E0E0' }}
                                />
                            ))}
                            <IconButton onClick={() => handleAddItem('parentQualificationUnit')} color="primary" sx={buttonStyles.openModalButton}>
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
                selectedItems={currentField ? selectedItems[currentField] : []}
                onAdd={handleAdd}
                onClose={() => setSelectorOpen(false)}
                currentField={currentField ?? ''}
                updateProjectTags={() => {}}
            />
        </Box>
    );
};

export default CreatePart;