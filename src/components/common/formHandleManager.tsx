import { useState, useEffect } from 'react';
import { EditProjectFormData } from '../../FormData';
import { useLazyQuery } from '@apollo/client';
import { GET_COMPETENCE_REQUIREMENTS } from '../../graphql/GetCompetenceRequirements';

interface Item {
  id: string;
  name: string;
}

interface FormState {
  [key: string]: any;
  duration: number | string;
  isActive: boolean;
  tags: Item[];
  competenceRequirements: Item[];
  includedInParts: Item[];
  description: string;
  materials: string;
}

interface Requirement {
  id: string;
  description: string;
}

interface CompetenceRequirementGroup {
  id: string;
  title: string;
  requirements: Requirement[];
}

interface ParentQualificationUnit {
  id: string;
  name: string;
  competenceRequirementGroups: CompetenceRequirementGroup[];
}

interface Part {
  id: string;
  name: string;
  description: string;
  materials: string;
  parentQualificationUnit: ParentQualificationUnit;
}

interface CompetenceRequirementsData {
  part: {
    part: Part;
    message: string;
    status: string;
    success: boolean;
  };
}

export const formHandleManager = (initialState: FormState) => {
  const [formData, setFormData] = useState<FormState>(initialState);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [currentField, setCurrentField] = useState<
  keyof Pick<
    EditProjectFormData & { includedInParts?: Item[] }, 
    'tags' | 'competenceRequirements' | 'includedInParts'
    >
  >('tags');
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: Item[] }>({
      tags: [],
      competenceRequirements: [],
      includedInParts: [],
  });

  const [competenceOptions, setCompetenceOptions] = useState<Item[]>([]);
  const [fetchCompetenceRequirements] = useLazyQuery<CompetenceRequirementsData>(GET_COMPETENCE_REQUIREMENTS, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      console.log('Competence Requirements Data:', data);
      const realPart = data?.part?.part;
      if (realPart?.parentQualificationUnit?.competenceRequirementGroups) {
        const newCompetences = realPart.parentQualificationUnit.competenceRequirementGroups.flatMap(group =>
          group.requirements.map(req => ({ id: req.id, name: req.description }))
        );
        console.log("New Competence Options:", newCompetences);
        setCompetenceOptions([...newCompetences]);
      }
    },
  });

  useEffect(() => {
    const selectedTeemaIds = formData.includedInParts.map(teema => teema.id);
  
    if (selectedTeemaIds.length > 0) {
      console.log("Fetching competence requirements for multiple Teema IDs:", selectedTeemaIds);
      fetchCompetenceRequirementsForMultipleParts(selectedTeemaIds);
    }
  }, [formData.includedInParts]);

  const handleChangeTeema = (newTeema: Item[]) => {
    setFormData((prevFormData) => {
        const updatedTeema = newTeema;   
        const isTeemaChanged = JSON.stringify(prevFormData.includedInParts) !== JSON.stringify(updatedTeema);
    
        if (isTeemaChanged) {
            console.log("Teema changed, clearing previous Osaamiset & fetching new competence requirements");
            const selectedTeemaIds = updatedTeema.map(teema => teema.id);
            console.log("Selected Teema IDs in handleChangeTeema:", selectedTeemaIds);
    
            setFormData((prev) => ({
                ...prev,
                competenceRequirements: [],
            }));

            setCompetenceOptions([]);
            fetchCompetenceRequirementsForMultipleParts(selectedTeemaIds);
        }
    
        return {
            ...prevFormData,
            includedInParts: updatedTeema,
        };
    });

    setSelectedItems((prevSelectedItems) => ({
        ...prevSelectedItems,
        includedInParts: newTeema,
        competenceRequirements: [],
    }));
  };

  const fetchCompetenceRequirementsForMultipleParts = (teemaIds: string[]) => {
    console.log("Fetching competence requirements for Teema IDs:", teemaIds);
  
    setCompetenceOptions([]); 

    Promise.all(
        teemaIds.map((teemaId) => {
            console.log(`Querying for Teema ID: ${teemaId}`);
            return fetchCompetenceRequirements({ variables: { partId: teemaId } });
        })
    )
    .then((responses) => {
        const allCompetenceRequirements: Item[] = [];

        responses.forEach(({ data }) => {
            const realPart = data?.part?.part;
            if (realPart?.parentQualificationUnit?.competenceRequirementGroups) {
                const newCompetences = realPart.parentQualificationUnit.competenceRequirementGroups.flatMap(
                    (group: CompetenceRequirementGroup) =>
                        group.requirements.map((req: Requirement) => ({
                            id: req.id,
                            name: req.description,
                        }))
                );

                allCompetenceRequirements.push(...newCompetences);
            }
        });

        // Remove duplicates using Map
        const uniqueCompetenceRequirements = Array.from(
            new Map(allCompetenceRequirements.map((item) => [item.id, item])).values()
        );

        //  Update competence options with the new list
        console.log("Final Combined Competence Requirements:", uniqueCompetenceRequirements);
        setCompetenceOptions(uniqueCompetenceRequirements);
    })
    .catch((error) => {
        console.error("Error fetching competence requirements:", error);
    });
  };
  
  // Handles data changes on non-TinyMCE input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === 'duration' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  // Handles data changes on TinyMCE editor input fields
  const handleEditorChange = (content: string, field: 'description' | 'materials') => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: content,
    }));
  };

  const handleToggleActivity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      isActive: e.target.checked,
    }));
  };

  const handleAdd = (items: Item[]) => {
    if (!currentField) return;

    if (currentField === 'includedInParts') {
        handleChangeTeema(items); 
    } else {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [currentField]: items,
        }));

        setSelectedItems((prevSelectedItems) => ({
            ...prevSelectedItems,
            [currentField]: items,
        }));
    }

    setSelectorOpen(false);
  };

  const handleAddItem = (field: keyof Pick<FormState, 'tags' | 'competenceRequirements' | 'includedInParts'>) => {
    if (field === 'includedInParts') {
      setCurrentField(field);
      setSelectorOpen(true);
      return;
    }
  
    if (field === 'competenceRequirements' && formData.includedInParts.length === 0) {
      alert('Valitse ensin Teema.');
      return;
    }
  
    if (field === 'competenceRequirements') {
      console.log("Using competenceOptions for modal:", competenceOptions);
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

  return {
    formData,
    setFormData,
    selectedItems,
    setSelectedItems,
    selectorOpen,
    setSelectorOpen,
    currentField,
    setCurrentField,
    handleChange,
    handleToggleActivity,
    handleAdd,
    handleAddItem,
    handleEditorChange,
    handleNotifyStudents,
    competenceOptions,
    setCompetenceOptions,
    handleChangeTeema,
  };
};
