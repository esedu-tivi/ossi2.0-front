import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import SaveAsSharpIcon from '@mui/icons-material/SaveAsSharp';
import UndoSharpIcon from '@mui/icons-material/UndoSharp';
import DriveFolderUploadSharpIcon from '@mui/icons-material/DriveFolderUploadSharp';
import formStyles from '../../styles/formStyles';
import buttonStyles from '../../styles/buttonStyles';
import Selector from '../Selector';
import RichTextEditor from '../common/RichTextEditor';
import TurndownService from 'turndown';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

import { TextField, Box, IconButton, Typography, FormControl, InputLabel, Chip, Switch } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { EditPartFormData, Item } from '../../FormData';
import { GET_QUALIFICATION_UNIT_PART_BY_ID } from '../../graphql/GetQualificationUnitPartById';
import { GET_PROJECTS } from '../../graphql/GetProjects';
import { GET_QUALIFICATION_UNITS } from '../../graphql/GetQualificationUnits';
import { GET_QUALIFICATION_UNIT_PARTS } from '../../graphql/GetQualificationUnitParts';
import { UPDATE_PART } from '../../graphql/UpdatePart';

const EditPart: React.FC = () => {
    const navigate = useNavigate();
    const { partId } = useParams();
    const turndownService = new TurndownService();
    const numericPartId = String(partId);

    const [formData, setFormData] = useState<EditPartFormData>({
        name: '',
        description: '',
        materials: '',
        projects: [],
        parentQualificationUnit: [],
        notifyStudents: false,
        notifyStudentsText: '',
    });

    const handleEditorChange = (content: string, field: 'description' | 'materials') => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [field]: content,
        }));
    };

    const handleCloseSelector = () => {
        setSelectorOpen(false);
        setCurrentField(null as any);
    };

    const [selectorOpen, setSelectorOpen] = useState(false);
    const [currentField, setCurrentField] = useState<'projects' | 'parentQualificationUnit'>('parentQualificationUnit');
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: Item[] }>({
        projects: [],
        parentQualificationUnit: [],
    });

    const { loading, error, data } = useQuery(GET_QUALIFICATION_UNIT_PART_BY_ID, {
        variables: { partId: numericPartId },
        fetchPolicy: "no-cache",
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

    const { loading: projectsLoading, error: projectsError, data: projectsData } = useQuery(GET_PROJECTS);
    const { loading: qualificationLoading, error: qualificationError, data: qualificationData } = useQuery(GET_QUALIFICATION_UNITS);

    // Fills the fields with saved Part data when page opens
    useEffect(() => {
        if (!loading && data) {

            const sanitizedDescription = sanitizeHtml(md.render(data.part.description || ''));
            const sanitizedMaterials = sanitizeHtml(md.render(data.part.materials || ''));

            if (data.part) {
                setFormData({
                    name: data.part.name || '',
                    description: sanitizedDescription || '',
                    materials: sanitizedMaterials || '',
                    projects: data.part.projects ?? [],
                    parentQualificationUnit: data.part.parentQualificationUnit
                    ? Array.isArray(data.part.parentQualificationUnit)
                        ? data.part.parentQualificationUnit
                        : [data.part.parentQualificationUnit]
                    : [],
                    notifyStudents: data.part.notifyStudents ?? false,
                    notifyStudentsText: data.part.notifyStudentsText || '',
                });
    
                setSelectedItems({
                    projects: data.part.projects ?? [],
                    parentQualificationUnit: data.part.parentQualificationUnit ?? [],
                });
            } else {
                console.error("No part found in response:", data);
            }
        }
    }, [data, loading]); 

    // Mutation for updating the Part
    const [updatePart] = useMutation(UPDATE_PART, {
        onCompleted() {
            navigate('/qualificationunitparts');
        },
        refetchQueries: [
            { query: GET_QUALIFICATION_UNIT_PARTS },
            { query: GET_PROJECTS }
        ],
    });

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

    const handleAddItem = (field: 'projects' | 'parentQualificationUnit') => {
        if (!field) {
            console.error("Invalid field in handleAddItem:", field);
            return;
        }
        setCurrentField(field);
        setSelectorOpen(true);
    };

    const handleRemoveItem = (field: 'projects' | 'parentQualificationUnit', index: number) => {
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
        if (!partId) {
            console.error('Part ID is missing, cannot submit the form.');
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

        const updatedPartData = {
            name: formData.name,
            description: markdownDescription,
            materials: markdownMaterials,
            projects: formData.projects.map(project => project.id),
            parentQualificationUnit: formData.parentQualificationUnit[0]?.id
        };
    
        console.log("Updated Part Data before submission:", updatedPartData);
    
        try {
            const response = await updatePart({
                variables: {
                    updatePartId: partId,
                    part: updatedPartData,
                },
            });
            console.log('Updated part:', response.data);
        } catch (err) {
            console.error('Error updating part:', err);
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
        if (projectsLoading || qualificationLoading) return [];
        if (projectsError || qualificationError) return [];
    
        if (!projectsData || !qualificationData) return [];
    
        return currentField === 'projects'
            ? projectsData?.projects ?? []
            : currentField === 'parentQualificationUnit'
            ? qualificationData?.units ?? []
            : [];
    };

    const { title, buttonText } = getTitleAndButtonText();
    const items = getItems();

    if (!partId) return <Typography>Loading...</Typography>;
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
                selectedItems={selectedItems[currentField] ?? []}
                onAdd={handleAdd}
                onClose={handleCloseSelector}
                currentField={currentField ?? ''}
                updateProjectTags={() => {}}
            />
        </Box>
    );
};

export default EditPart;