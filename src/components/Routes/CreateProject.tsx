import React, { useEffect, useState } from 'react';
import formStyles from '../../styles/formStyles';
import buttonStyles from '../../styles/buttonStyles';
import TurndownService from 'turndown';
import RichTextEditor from '../common/RichTextEditor';
import ChipSelector from '../common/ChipSelector';
import SaveSharpIcon from '@mui/icons-material/SaveSharp';
import Selector from '../Selector';
import ArrowBackIosSharpIcon from '@mui/icons-material/ArrowBackIosSharp';

import { TextField, Box, Switch, IconButton, Typography, FormControl } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_PROJECT } from '../../graphql/CreateProject';
import { GET_QUALIFICATION_UNIT_PARTS } from '../../graphql/GetQualificationUnitParts';
import { GET_PROJECTS } from '../../graphql/GetProjects';
import { GET_PROJECT_TAGS } from '../../graphql/GetProjectTags';
import { useFormHandleManager } from '../../hooks/useFormHandleManager';
import { ASSIGN_TEACHING_PROJECT } from '../../graphql/AssignTeachingProject';
import { USER_SETUP } from '../../graphql/UserSetup';
import { userInfo } from 'os';
import { GET_ASSIGNED_TEACHING_PROJECT_IDS } from '../../graphql/GetAssignedTeachingProjectIds';

const NewProjectForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const copiedProject = location.state || {};
    const turndownService = new TurndownService();
    const initialState = {
        name: '',
        description: '',
        materials: '',
        competenceRequirements: [],
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
        handleAddItem,
        currentField,
        selectedItems,
        setSelectedItems,
        setSelectorOpen,
        handleChange,
        handleToggleActivity,
        handleEditorChange,
        competenceOptions,
    } = useFormHandleManager(initialState);

    useEffect(() => {
        if (copiedProject && Object.keys(copiedProject).length > 0) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                name: copiedProject.name || '',
                description: copiedProject.description || '',
                materials: copiedProject.materials || '',
                competenceRequirements: copiedProject.competenceRequirements || [],
                duration: Number(copiedProject.duration) || 0,
                includedInParts: copiedProject.includedInParts || [],
                tags: copiedProject.tags || [],
                isActive: copiedProject.isActive || false,
            }));

            setSelectedItems({
                tags: copiedProject.tags || [],
                competenceRequirements: copiedProject.competenceRequirements || [],
                includedInParts: copiedProject.includedInParts || [],
            });
        }
    }, [copiedProject]);

    // Mutation for creating new project
    const [createProject, { loading, error, data }] = useMutation(CREATE_PROJECT, {
        refetchQueries: [{ query: GET_PROJECTS }],
    });

    // Queries for QualificationUnitParts and Tags
    const { loading: partsLoading, error: partsError, data: partsData } = useQuery(GET_QUALIFICATION_UNIT_PARTS);
    const { loading: projectTagsLoading, error: projectTagsError, data: projectTagsData, refetch } = useQuery(GET_PROJECT_TAGS);
    const [assignTeachingProject] = useMutation(ASSIGN_TEACHING_PROJECT, { refetchQueries: [GET_ASSIGNED_TEACHING_PROJECT_IDS] })
    const { loading: userLoading, data: userData } = useQuery(USER_SETUP)

    const [projectFollowing, setProjectFollowing] = useState(true)

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

        const projectInput = {
            name: formData.name,
            description: markdownDescription,
            materials: markdownMaterials,
            duration: formData.duration,
            includedInParts: formData.includedInParts.map((part) => part.id),
            competenceRequirements: formData.competenceRequirements.map((competence) => competence.id),
            tags: formData.tags.map((tag) => tag.id),
            isActive: formData.isActive,
        }

        console.log("Submitting CreateProject input:", JSON.stringify(projectInput, null, 2));

        try {
            const response = await createProject({
                variables: { project: projectInput },
            })
            console.log('GraphQL Response:', response.data);
            if (projectFollowing) {
                assignTeachingProject({ variables: { teacherId: userData.me.user.id, projectId: response.data.createProject.project.id } })
            }
            navigate('/teacherprojects');
        } catch (err) {
            console.error('Submission Error:', err);
        }
    };

    const getTitleAndButtonText = () => {
        switch (currentField) {
            case 'tags':
                return { title: 'Valitse Tunnisteet', buttonText: 'Lisää Tunnisteet' };
            case 'competenceRequirements':
                return { title: 'Valitse Osaamiset', buttonText: 'Lisää Osaamiset' };
            case 'includedInParts':
                return { title: 'Valitse Teemat', buttonText: 'Lisää Teemat' };
            default:
                return { title: '', buttonText: '' };
        }
    };

    const getItems = () => {
        if (partsLoading || projectTagsLoading) {
            return [];
        }
        if (partsError || projectTagsError) {
            return [];
        }

        // Returns selectable modal data based on selected field
        switch (currentField) {
            case 'tags':
                return projectTagsData ? projectTagsData.projectTags?.projectTags : [];
            case 'competenceRequirements':
                return competenceOptions;
            case 'includedInParts':
                return partsData ? partsData.parts?.parts ?? [] : [];
            default:
                return [];
        }
    };

    const updateProjectTags = () => {
        refetch();
    };

    const { title, buttonText } = getTitleAndButtonText();
    const items = getItems();

    if (userLoading) return <Box><Typography>Loading user...</Typography></Box>

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            textAlign={'center'}
            sx={formStyles.formOuterBox}
        >
            <Box sx={{ ...formStyles.formBannerBox, textAlign: "center", marginBottom: 3, position: 'relative', }}>
                <IconButton
                    onClick={() => navigate("/teacherprojects")}
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
                        label="Teema"
                        items={formData.includedInParts}
                        onAdd={() => handleAddItem('includedInParts')}
                        currentField="includedInParts"
                    />

                    <ChipSelector
                        label="Osaamiset"
                        items={formData.competenceRequirements}
                        onAdd={() => handleAddItem('competenceRequirements')}
                        currentField="competenceRequirements"
                    />

                    <ChipSelector
                        label="Tunnisteet"
                        items={formData.tags}
                        onAdd={() => handleAddItem('tags')}
                        currentField="tags"
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
            <Box sx={formStyles.formActivityBox}>
                <Typography sx={{ mb: 1, textAlign: 'left' }}>Projektin seuranta</Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography>{projectFollowing ? 'Seurannassa' : 'Ei seurannassa'}</Typography>
                    <Switch checked={projectFollowing} onChange={() => projectFollowing ? setProjectFollowing(false) : setProjectFollowing(true)} color="primary" />
                </Box>
            </Box>
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
