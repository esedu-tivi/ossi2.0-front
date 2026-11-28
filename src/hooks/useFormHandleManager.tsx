import { useState } from 'react';

interface Item {
  id: string;
  name: string;
}

interface FormState {
  [key: string]: string | number | boolean | Item[];
  duration: number | string;
  isActive: boolean;
  tags: Item[];
  competenceRequirements: Item[];
  includedInParts: Item[];
  description: string;
  materials: string;
}

type SelectorField = 'tags' | 'competenceRequirements' | 'includedInParts';

export const useFormHandleManager = (initialState: FormState) => {
  const [formData, setFormData] = useState<FormState>(initialState);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [currentField, setCurrentField] = useState<SelectorField>('tags');
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: Item[] }>({
    tags: [],
    competenceRequirements: [],
    includedInParts: [],
  });

  // Changing the themes keeps the selected osaamiset: the osaamiset selector
  // lists the ones that are no longer in the themes' units so they can be removed.
  const handleChangeTeema = (newTeema: Item[]) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      includedInParts: newTeema,
    }));

    setSelectedItems((prevSelectedItems) => ({
      ...prevSelectedItems,
      includedInParts: newTeema,
    }));
  };

  // Handles data changes on standard input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === 'duration' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  // Handles data changes on rich text editor fields
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
    handleChangeTeema,
  };
};
