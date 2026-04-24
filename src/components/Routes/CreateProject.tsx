import React, { useEffect, useMemo, useState } from 'react';
import TurndownService from 'turndown';
import PlateEditor from '@/components/common/plate-editor';
import ChipSelector from '@/components/common/chip-selector';
import ItemSelectorDialog from '@/components/common/item-selector-dialog';
import { Save, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_PROJECT } from '../../graphql/CreateProject';
import { GET_QUALIFICATION_UNIT_PARTS } from '../../graphql/GetQualificationUnitParts';
import { GET_PROJECTS } from '../../graphql/GetProjects';
import { GET_PROJECT_TAGS } from '../../graphql/GetProjectTags';
import { useFormHandleManager } from '../../hooks/useFormHandleManager';
import { ASSIGN_TEACHING_PROJECT } from '../../graphql/AssignTeachingProject';
import { USER_SETUP } from '../../graphql/UserSetup';
import { GET_ASSIGNED_TEACHING_PROJECT_IDS } from '../../graphql/GetAssignedTeachingProjectIds';

const NewProjectForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const copiedProject = useMemo(() => location.state || {}, [location.state]);
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
    }, [copiedProject, setFormData, setSelectedItems]);

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

    if (userLoading) return <p className="p-4">Loading user...</p>

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-5xl space-y-6"
        >
            {/* Banner */}
            <div className="relative rounded-lg bg-primary px-6 py-4 text-center">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/teacherprojects")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h2 className="text-2xl font-bold text-primary-foreground">
                    Luo Projekti
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
                </div>
            </div>

            {/* Activity toggle */}
            <div className="rounded-md border p-4">
                <p className="mb-2 text-sm font-medium">Projektin tila</p>
                <div className="flex items-center justify-between">
                    <span className="text-sm">{formData.isActive ? 'Aktiivinen' : 'Ei aktiivinen'}</span>
                    <Switch checked={formData.isActive} onCheckedChange={(checked) => handleToggleActivity({ target: { checked } } as React.ChangeEvent<HTMLInputElement>)} />
                </div>
            </div>

            {/* Following toggle */}
            <div className="rounded-md border p-4">
                <p className="mb-2 text-sm font-medium">Projektin seuranta</p>
                <div className="flex items-center justify-between">
                    <span className="text-sm">{projectFollowing ? 'Seurannassa' : 'Ei seurannassa'}</span>
                    <Switch checked={projectFollowing} onCheckedChange={(checked) => setProjectFollowing(checked)} />
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-center">
                <Button type="submit" size="lg">
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Submitting...' : 'Luo Projekti'}
                </Button>
            </div>

            {error && <p className="text-center text-sm text-destructive">Virhe: {error.message}</p>}
            {data && <p className="text-center text-sm text-green-600">Projekti lisätty</p>}

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
        </form>
    );
};

export default NewProjectForm;
