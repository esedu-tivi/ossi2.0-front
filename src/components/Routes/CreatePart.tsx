import React, { useState, useEffect } from 'react';
import { Plus, Save, ArrowLeft } from 'lucide-react';
import ItemSelectorDialog from '@/components/common/item-selector-dialog';
import PlateEditor from '@/components/common/plate-editor';
import TurndownService from 'turndown';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { CreatePartFormData, Item } from '../../FormData';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
        projectsInOrder: [],
        parentQualificationUnit: [],
    });

    // Handles data changes on editor input fields
    const handleEditorChange = (content: string, field: 'description' | 'materials') => {
        setFormData((prevFormData) => ({
        ...prevFormData,
        [field]: content,
        }));
    };

    // State to manage the visibility of the Selector component
    const [selectorOpen, setSelectorOpen] = useState(false);

    // State to manage the current field being edited
    const [currentField, setCurrentField] = useState<keyof Pick<CreatePartFormData, 'projectsInOrder' | 'parentQualificationUnit'>>();

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

    // Handle opening the Selector component for a specific field
    const handleAddItem = (field: keyof Pick<CreatePartFormData, 'projectsInOrder' | 'parentQualificationUnit'>) => {
        setCurrentField(field);
        setSelectorOpen(true);
    };

    // Handle removing an item from the form data
    const handleRemoveItem = (field: keyof Pick<CreatePartFormData, 'projectsInOrder' | 'parentQualificationUnit'>, index: number) => {
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
            { query: GET_PROJECTS },
            { query: GET_QUALIFICATION_UNITS }
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

        const partInput = {
            name: formData.name,
            description: markdownDescription,
            materials: markdownMaterials,
            parentQualificationUnit: Number(formData.parentQualificationUnit[0]?.id), // ensure number
            projectsInOrder: formData.projectsInOrder.map((project) => Number(project.id)), // ensure numbers
        };

        console.log("Submitting CreatePart input:", JSON.stringify(partInput, null, 2));

        try {
            const response = await createPart({
                variables: { part: partInput },
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
        if (projectsLoading || qualificationLoading) {
            return [];
        }
        if (projectsError || qualificationError) {
            console.error('Error loading data:', projectsError || qualificationError);
            return [];
        }
        return currentField === 'projectsInOrder'
            ? projectsData?.projects?.projects ?? []
            : currentField === 'parentQualificationUnit'
            ? qualificationData?.units?.units ?? []
            : [];
    };

    const { title, buttonText } = getTitleAndButtonText();
    const items = getItems();

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-6">
            {/* Banner */}
            <div className="relative rounded-lg bg-primary px-6 py-4 text-center">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/qualificationunitparts")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h2 className="text-2xl font-bold text-primary-foreground">
                    Luo Teema
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
                </div>

                {/* Right column */}
                <div className="space-y-4">
                    {/* Parent qualification unit */}
                    <div>
                        <Label className="mb-2 block">Tutkinnon osa</Label>
                        <div className="flex flex-wrap items-center gap-2 rounded-md border p-3">
                            {formData.parentQualificationUnit.map((unit, index) => (
                                <Badge
                                    key={unit.id}
                                    variant="secondary"
                                    className="cursor-pointer"
                                    onClick={() => handleRemoveItem('parentQualificationUnit', index)}
                                >
                                    {unit.name} x
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
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-center">
                <Button type="submit" size="lg">
                    <Save className="mr-2 h-4 w-4" />
                    Luo Teema
                </Button>
            </div>

            <ItemSelectorDialog
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
        </form>
    );
};

export default CreatePart;
