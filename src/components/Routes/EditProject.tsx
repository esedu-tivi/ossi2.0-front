import React, { useEffect } from 'react';
import { Archive, Undo2, Save } from 'lucide-react';
import ItemSelectorDialog from '@/components/common/item-selector-dialog';
import TurndownService from 'turndown';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import PlateEditor from '@/components/common/plate-editor';
import ChipSelector from '@/components/common/chip-selector';

import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECT_BY_ID } from '../../graphql/GetProjectById';
import { GET_PROJECTS } from '../../graphql/GetProjects';
import { UPDATE_PROJECT } from '../../graphql/UpdateProject';
import { GET_QUALIFICATION_UNIT_PARTS } from '../../graphql/GetQualificationUnitParts';
import { GET_PROJECT_TAGS } from '../../graphql/GetProjectTags';
import { useFormHandleManager } from '../../hooks/useFormHandleManager';

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
        handleNotifyStudents,
        competenceOptions,
    } = useFormHandleManager(initialState);

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

    const project = data?.project?.project;

    // Fills the input fields with data based on which project is currently being edited
    useEffect(() => {
        if (!loading && project) {
            const sanitizedDescription = sanitizeHtml(md.render(project.description || ''));
            const sanitizedMaterials = sanitizeHtml(md.render(project.materials || ''));

            setFormData((prevFormData) => {
                return {
                    ...prevFormData,
                    name: project.name || '',
                    description: sanitizedDescription,
                    materials: sanitizedMaterials,
                    competenceRequirements: project.competenceRequirements || [],
                    duration: Number(project.duration) || 0,
                    includedInParts: project.includedInQualificationUnitParts || [],
                    tags: project.tags || [],
                    isActive: project.isActive,
                    notifyStudents: project.notifyStudents ?? false,
                    notifyStudentsText: project.notifyStudentsText || '',
                };
            });

            setSelectedItems({
                tags: project.tags || [],
                competenceRequirements: project.competenceRequirements || [],
                includedInParts: project.includedInQualificationUnitParts || [],
            });
        }
    }, [data, loading]);

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
        if (partsLoading || projectTagsLoading) {
            return [];
        }
        if (partsError || projectTagsError) {
            return [];
        }

        switch (currentField) {
            case 'tags':
                return projectTagsData ? projectTagsData.projectTags?.projectTags : [];
            case 'competenceRequirements':
                return competenceOptions;
            case 'includedInParts':
                return partsData ? partsData.parts?.parts : [];
            default:
                return [];
        }
    };

    const updateProjectTags = () => {
        refetch();
    };

    const { title, buttonText } = getTitleAndButtonText();
    const items = getItems();

    if (loading) return <p className="p-4">Loading project details...</p>;
    if (error) return <p className="p-4 text-destructive">Error loading project: {error.message}</p>;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Top action buttons */}
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/teacherprojects')}
                >
                    <Undo2 className="mr-2 h-4 w-4" />
                    Hylkää muutokset
                </Button>
                <Button type="button" variant="secondary">
                    <Archive className="mr-2 h-4 w-4" />
                    Arkistoi
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Banner */}
                <div className="rounded-lg bg-primary px-6 py-4 text-center">
                    <h2 className="text-2xl font-bold text-primary-foreground">
                        Muokkaa projektia #{project.id} {project.name}
                    </h2>
                </div>

                {/* Form columns */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Left column */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Projektin nimi</Label>
                            <Input
                                id="name"
                                name="name"
                                value={String(formData.name ?? '')}
                                onChange={handleChange}
                                className="mt-1"
                            />
                        </div>

                        <PlateEditor
                            label="Projektin kuvaus"
                            value={formData.description}
                            onChange={(content) => handleEditorChange(content, 'description')}
                        />

                        <PlateEditor
                            label="Materiaalit"
                            value={formData.materials}
                            onChange={(content) => handleEditorChange(content, 'materials')}
                        />

                        {formData.notifyStudents && (
                            <div>
                                <Label htmlFor="notifyStudentsText">Muutosilmoitus</Label>
                                <Textarea
                                    id="notifyStudentsText"
                                    name="notifyStudentsText"
                                    value={String(formData.notifyStudentsText ?? '')}
                                    onChange={handleChange}
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>
                        )}
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="duration">Ajankäyttö</Label>
                            <Input
                                id="duration"
                                name="duration"
                                type="number"
                                value={formData.duration}
                                onChange={handleChange}
                                className="mt-1"
                            />
                        </div>

                        <ChipSelector
                            label="Teemat"
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

                        {/* Activity toggle */}
                        <div className="rounded-md border p-4">
                            <p className="mb-2 text-sm font-medium">Projektin tila</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">{formData.isActive ? 'Aktiivinen' : 'Ei aktiivinen'}</span>
                                <Switch checked={formData.isActive} onCheckedChange={(checked) => handleToggleActivity({ target: { checked } } as React.ChangeEvent<HTMLInputElement>)} />
                            </div>
                        </div>

                        {/* Notification toggle */}
                        <div className="rounded-md border p-4">
                            <p className="mb-2 text-sm font-medium">Muutosilmoitus</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">{formData.notifyStudents ? 'Ilmoitetaan opiskelijoille' : 'Ei ilmoiteta'}</span>
                                <Switch checked={Boolean(formData.notifyStudents)} onCheckedChange={(checked) => handleNotifyStudents({ target: { checked } } as React.ChangeEvent<HTMLInputElement>)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-center">
                    <Button type="submit" size="lg">
                        <Save className="mr-2 h-4 w-4" />
                        Tallenna muutokset
                    </Button>
                </div>
            </form>

            <ItemSelectorDialog
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
        </div>
    );
};

export default EditProject;
