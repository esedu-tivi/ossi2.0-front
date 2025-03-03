import React, { useEffect } from 'react';
import DriveFolderUploadSharpIcon from '@mui/icons-material/DriveFolderUploadSharp';
import UndoSharpIcon from '@mui/icons-material/UndoSharp';
import SaveAsSharpIcon from '@mui/icons-material/SaveAsSharp';
import Selector from '../Selector';
import formStyles from '../../styles/formStyles';
import buttonStyles from '../../styles/buttonStyles';
import TurndownService from 'turndown';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import RichTextEditor from '../common/RichTextEditor';
import ChipSelector from '../common/ChipSelector';

import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Box, Switch, IconButton, Typography, FormControl} from '@mui/material';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECT_BY_ID } from '../../graphql/GetProjectById';
import { GET_PROJECTS } from '../../graphql/GetProjects';
import { UPDATE_PROJECT } from '../../graphql/UpdateProject';
import { GET_QUALIFICATION_UNIT_PARTS } from '../../graphql/GetQualificationUnitParts';
import { GET_PROJECT_TAGS } from '../../graphql/GetProjectTags';
import { formHandleManager } from '../common/formHandleManager';

const EditProject: React.FC = () => {
    const navigate = useNavigate();
    const turndownService = new TurndownService();
    const { projectId } = useParams();

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
        currentField,
        selectedItems,
        setSelectedItems,
        setSelectorOpen,
        handleChange,
        handleToggleActivity,
        handleEditorChange,
        handleAddItem,
        handleRemoveItem,
        handleNotifyStudents,
        competenceOptions,
    } = formHandleManager(initialState);

    const { loading, error, data } = useQuery(GET_PROJECT_BY_ID, {
        variables: { id: projectId },
    });

    // Reverts Markdown back to HTML for TinyMCE editor fields
    const md = new MarkdownIt({
        html: true,
    });

    // Enforces allowed HTML tags and attributes using DOMPurify
    const sanitizeHtml = (html: string) =>
        DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'iframe', 'p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'li', 'ol', 
            'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'span', 'div'
        ],
        ALLOWED_ATTR: [
            'src', 'title', 'width', 'height', 'frameborder', 'allowfullscreen', 
            'href', 'alt', 'target', 'rel', 'style', 'class'
        ],
    });

    // Fills the input fields with data based on which project is currently being edited
    useEffect(() => {
        if (!loading && data?.project) {
            const sanitizedDescription = sanitizeHtml(md.render(data.project.description || ''));
            const sanitizedMaterials = sanitizeHtml(md.render(data.project.materials || ''));
            
            setFormData((prevFormData) => {
                return {
                    ...prevFormData,
                    name: data.project.name || '',
                    description: sanitizedDescription,
                    materials: sanitizedMaterials,
                    competenceRequirements: data.project.competenceRequirements || [],
                    duration: Number(data.project.duration) || 0,
                    includedInParts: data.project.includedInQualificationUnitParts || [],
                    tags: data.project.tags || [],
                    isActive: data.project.isActive,
                    notifyStudents: data.project.notifyStudents ?? false,
                    notifyStudentsText: data.project.notifyStudentsText || '',
                };
            });
    
            setSelectedItems({
                tags: data.project.tags || [],
                competenceRequirements: data.project.competenceRequirements || [],
                includedInParts: data.project.includedInQualificationUnitParts || [],
            });
        }
    }, [data, loading]);

    const project = data?.project;

    // Mutation for updating the project
    const [updateProject] = useMutation(UPDATE_PROJECT, {
        onCompleted() {
            navigate('/teacherprojects');
        },
        refetchQueries: [{ query: GET_PROJECTS }],
    });

    const { loading: partsLoading, error: partsError, data: partsData } = useQuery(GET_QUALIFICATION_UNIT_PARTS);
    const { loading: projectTagsLoading, error: projectTagsError, data: projectTagsData, refetch } = useQuery(GET_PROJECT_TAGS);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) {
            console.error('Project ID is missing, cannot submit the form.');
            return;
        }

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

        // Modifies HTML to Markdown language using turndown before submitting the changes
        const markdownDescription = turndownService.turndown(sanitizeHtml(formData.description));
        const markdownMaterials = turndownService.turndown(sanitizeHtml(formData.materials));

        const updatedProjectData = {
            name: formData.name,
            description: markdownDescription,
            materials: markdownMaterials,
            duration: formData.duration,
            includedInParts: formData.includedInParts.map(part => part.id),
            competenceRequirements: formData.competenceRequirements.map(competence => competence.id),
            tags: formData.tags.map(tag => tag.id),
            isActive: formData.isActive,
            notifyStudents: Boolean(formData.notifyStudents),
        };
    
        console.log("Updated Project Data before submission:", updatedProjectData);
    
        try {
            const response = await updateProject({
                variables: {
                    updateProjectId: projectId,
                    project: updatedProjectData,
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
            case 'competenceRequirements':
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
            case 'competenceRequirements':
                return competenceOptions;
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
            sx={formStyles.formEditOuterBox}
        >
            <IconButton
                onClick={() => navigate('/teacherprojects')}
                sx={buttonStyles.cancelButton}
            >
                <UndoSharpIcon
                    sx={{
                        mr: 1,
                    }}
                />
                Hylkää muutokset
            </IconButton>

            <IconButton
                sx={buttonStyles.archiveButton}
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
                sx={formStyles.formOuterBox}
            >
                <Box
                    sx={formStyles.formBannerBox}
                >
                    <Typography variant="h4" align="center" color="white">
                        Muokkaa projektia #{project.id} {project.name}
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

                        <ChipSelector
                            label="Teemat"
                            items={formData.includedInParts}
                            onAdd={() => handleAddItem('includedInParts')}
                            onDelete={(index) => handleRemoveItem('includedInParts', index)}
                            currentField="includedInParts"
                        />

                        <ChipSelector
                            label="Osaamiset"
                            items={formData.competenceRequirements}
                            onAdd={() => handleAddItem('competenceRequirements')}
                            onDelete={(index) => handleRemoveItem('competenceRequirements', index)}
                            currentField="competenceRequirements"
                        />

                        <ChipSelector
                            label="Tunnisteet"
                            items={formData.tags}
                            onAdd={() => handleAddItem('tags')}
                            onDelete={(index) => handleRemoveItem('tags', index)}
                            currentField="tags"
                        />

                        <FormControl
                            sx={formStyles.formActivityBox}
                        >
                            <Typography sx={{ mb: 1, textAlign: 'left' }}>Projektin tila</Typography>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography>{formData.isActive ? 'Aktiivinen' : 'Ei aktiivinen'}</Typography>
                                <Switch checked={formData.isActive} onChange={handleToggleActivity} name="isActive" color="primary" />
                            </Box>
                        </FormControl>

                        <FormControl
                            sx={formStyles.formNotificationBox}
                        >
                            <Typography sx={{ mb: 1, textAlign: 'left' }}>Muutosilmoitus</Typography>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography>{formData.notifyStudents ? 'Ilmoitetaan opiskelijoille' : 'Ei ilmoiteta'}</Typography>
                                <Switch checked={Boolean(formData.notifyStudents)} onChange={handleNotifyStudents} name="notifyStudents" color="primary" />
                            </Box>
                        </FormControl>
                    </Box>
                </Box>

                <IconButton
                    type="submit"
                    sx={buttonStyles.saveButton}
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
