import { useState } from 'react';
import { CreateProjectFormData } from '../../FormData';

interface Item {
  id: string;
  name: string;
}

interface FormState {
  [key: string]: any;
  duration: number | string;
  isActive: boolean;
  tags: Item[];
  osaamiset: Item[];
  includedInParts: Item[];
  description: string;
  materials: string;
}

export const formHandleManager = (initialState: FormState) => {
  const [formData, setFormData] = useState<FormState>(initialState);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [currentField, setCurrentField] = useState<keyof Pick<CreateProjectFormData, 'tags' | 'osaamiset' | 'includedInParts'>>('tags');
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: Item[] }>({
      tags: [],
      osaamiset: [],
      includedInParts: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === 'duration' ? (value === '' ? '' : Number(value)) : value,
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

  const handleAddItem = (field: keyof Pick<FormState, 'tags' | 'osaamiset' | 'includedInParts'>) => {
    if (field !== 'includedInParts' && formData.includedInParts.length === 0) {
      alert('Valitse ensin Teema.');
      return;
    }
    setCurrentField(field);
    setSelectorOpen(true);
  };

  const handleRemoveItem = (field: keyof Pick<FormState, 'tags' | 'osaamiset' | 'includedInParts'>, index: number) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: prevFormData[field].filter((_, i) => i !== index),
    }));
    setSelectedItems((prevSelectedItems) => ({
      ...prevSelectedItems,
      [field]: prevSelectedItems[field].filter((_, i) => i !== index),
    }));
  };

  const handleEditorChange = (content: string, field: 'description' | 'materials') => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: content,
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
    handleRemoveItem,
    handleEditorChange,
  };
};
