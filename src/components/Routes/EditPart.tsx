import React, { useState, useEffect } from 'react';
import { Plus, Save, Undo2, Archive } from 'lucide-react';
import ItemSelectorDialog from '@/components/common/item-selector-dialog';
import PlateEditor from '@/components/common/plate-editor';
import TurndownService from 'turndown';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
        projectsInOrder: [],
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
    const [currentField, setCurrentField] = useState<'projectsInOrder' | 'parentQualificationUnit'>('parentQualificationUnit');
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: Item[] }>({
        projectsInOrder: [],
        parentQualificationUnit: [],
    });

    const { loading, error, data } = useQuery(GET_QUALIFICATION_UNIT_PART_BY_ID, {
        variables: { partId: numericPartId },
        fetchPolicy: "no-cache",
    });

    useEffect(() => {
        console.log('GraphQL Response:', data);
    }, [data]);

    // Reverts Markdown back to HTML for editor fields
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
            if (data?.part?.part) {
                const part = data.part.part;

                const sanitizedDescription = sanitizeHtml(md.render(part.description || ''));
                const sanitizedMaterials = sanitizeHtml(md.render(part.materials || ''));
                setFormData({
                    name: part.name || '',
                    description: sanitizedDescription || '',
                    materials: sanitizedMaterials || '',
                    projectsInOrder: part.projects ?? [],
                    parentQualificationUnit: part.parentQualificationUnit
                        ? [part.parentQualificationUnit]
                        : [],
                    notifyStudents: false,
                    notifyStudentsText: '',
                });

                setSelectedItems({
                    projectsInOrder: part.projects ?? [],
                    parentQualificationUnit: part.parentQualificationUnit
                        ? [part.parentQualificationUnit]
                        : [],
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

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const reorderedProjects = Array.from(formData.projectsInOrder);
        const [movedProject] = reorderedProjects.splice(result.source.index, 1);
        reorderedProjects.splice(result.destination.index, 0, movedProject);

        setFormData((prevFormData) => ({
            ...prevFormData,
            projectsInOrder: reorderedProjects,
        }));
    };

    const handleAddItem = (field: 'projectsInOrder' | 'parentQualificationUnit') => {
        if (!field) {
            console.error("Invalid field in handleAddItem:", field);
            return;
        }
        setCurrentField(field);
        setSelectorOpen(true);
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
            projectsInOrder: formData.projectsInOrder.map(project => project.id),
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
            case 'projectsInOrder':
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

        return currentField === 'projectsInOrder'
            ? projectsData?.projects?.projects ?? []
            : currentField === 'parentQualificationUnit'
            ? qualificationData?.units?.units ?? []
            : [];
    };

    const { title, buttonText } = getTitleAndButtonText();
    const items = getItems();

    if (!partId) return <p className="p-4">Loading...</p>;
    if (loading) return <p className="p-4">Loading part details...</p>;
    if (error) return <p className="p-4 text-destructive">Error loading part: {error.message}</p>;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Top action buttons */}
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/qualificationunitparts')}
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
                        Muokkaa teemaa #{partId} {formData.name}
                    </h2>
                </div>

                {/* Form columns */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Left column */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Teeman nimi</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
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
                                    value={formData.notifyStudentsText}
                                    onChange={handleChange}
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>
                        )}
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                        {/* Parent qualification unit */}
                        <div>
                            <Label className="mb-2 block">Tutkinnon osa</Label>
                            <div className="flex flex-wrap items-center gap-2 rounded-md border p-3">
                                {formData.parentQualificationUnit.map((unit) => (
                                    <Badge key={unit.id} variant="secondary">
                                        {unit.name}
                                    </Badge>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon-sm"
                                    onClick={() => handleAddItem('parentQualificationUnit')}
                                    className="rounded-full"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Projects with drag & drop */}
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <Label>Projektit</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon-sm"
                                    onClick={() => handleAddItem("projectsInOrder")}
                                    className="rounded-full"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="parts-list">
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="rounded-md border p-2">
                                    {formData.projectsInOrder.map((project, index) => (
                                        <Draggable key={String(project.id)} draggableId={String(project.id)} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="mb-1 cursor-grab rounded border bg-white p-3"
                                            >
                                                {project.name}
                                            </div>
                                        )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    </div>
                                )}
                                </Droppable>
                            </DragDropContext>
                        </div>

                        {/* Notification toggle */}
                        <div className="rounded-md border p-4">
                            <p className="mb-2 text-sm font-medium">Muutosilmoitus</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">{formData.notifyStudents ? 'Ilmoitetaan opiskelijoille' : 'Ei ilmoiteta'}</span>
                                <Switch checked={formData.notifyStudents} onCheckedChange={(checked) => handleNotifyStudents({ target: { checked } } as React.ChangeEvent<HTMLInputElement>)} />
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
                selectedItems={selectedItems[currentField] ?? []}
                onAdd={handleAdd}
                onClose={handleCloseSelector}
                currentField={currentField ?? ''}
                updateProjectTags={() => {}}
            />
        </div>
    );
};

export default EditPart;
