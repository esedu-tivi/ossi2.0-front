import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus } from 'lucide-react';
import { useMutation, useLazyQuery } from '@apollo/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CREATE_PROJECT_TAG } from '@/graphql/CreateProjectTag';
import { GET_COMPETENCE_REQUIREMENTS } from '@/graphql/GetCompetenceRequirements';
import type { CompetenceRequirement } from '@/types';

interface Item {
  id: string;
  name: string;
  description?: string;
}

interface CompetenceRequirementGroup {
  id: string;
  requirements: CompetenceRequirement[];
}

interface ItemSelectorDialogProps {
  items: Item[];
  title: string;
  open: boolean;
  buttonText: string;
  selectedItems: Item[];
  onAdd: (selectedItems: Item[]) => void;
  onClose: () => void;
  currentField: string;
  updateProjectTags: (newTag: Item) => void;
}

const ItemSelectorDialog: React.FC<ItemSelectorDialogProps> = ({
  items,
  title,
  buttonText,
  open,
  selectedItems: initialSelectedItems,
  onAdd,
  onClose,
  currentField,
  updateProjectTags,
}) => {
  const [selectedItems, setSelectedItems] = useState<Item[]>(
    Array.isArray(initialSelectedItems) ? initialSelectedItems : []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [createProjectTag] = useMutation(CREATE_PROJECT_TAG);
  const [fetchCompetenceRequirements] = useLazyQuery(
    GET_COMPETENCE_REQUIREMENTS
  );
  const [competenceOptions, setCompetenceOptions] = useState<Item[]>([]);
  const [fetchedTeemaIds, setFetchedTeemaIds] = useState<Set<string>>(
    new Set()
  );

  const fetchCompetenceData = useCallback(
    async (teemaIds: string[]) => {
      try {
        const fetchedCompetences = await Promise.all(
          teemaIds.map(async (teemaId) => {
            const { data } = await fetchCompetenceRequirements({
              variables: { partId: teemaId },
            });

            const realPart = data?.part?.part;

            if (
              realPart &&
              realPart.parentQualificationUnit?.competenceRequirementGroups
            ) {
              return realPart.parentQualificationUnit.competenceRequirementGroups.flatMap(
                (group: CompetenceRequirementGroup) =>
                  group.requirements.map(
                    (requirement: CompetenceRequirement) => ({
                      id: requirement.id,
                      description: requirement.description,
                    })
                  )
              );
            } else {
              return [];
            }
          })
        );

        const combinedCompetences = fetchedCompetences.flat();
        setCompetenceOptions((prevCompetences) => {
          const updatedCompetences = [
            ...prevCompetences,
            ...combinedCompetences,
          ];
          const uniqueCompetences = Array.from(
            new Set(updatedCompetences.map((item) => item.id))
          ).map((id) => updatedCompetences.find((item) => item.id === id));
          return uniqueCompetences as Item[];
        });

        setFetchedTeemaIds((prev) => new Set([...prev, ...teemaIds]));
      } catch (error) {
        console.error('Error fetching competence requirements:', error);
      }
    },
    [fetchCompetenceRequirements]
  );

  // Reset selected items and search term when the dialog opens
  useEffect(() => {
    if (open) {
      const validSelectedItems = Array.isArray(initialSelectedItems)
        ? initialSelectedItems
        : [];

      if (currentField === 'competenceRequirements') {
        setSelectedItems(
          validSelectedItems.filter((item) => 'description' in item)
        );
      } else {
        setSelectedItems(
          validSelectedItems.filter((item) => 'name' in item)
        );
      }

      setCompetenceOptions([]);
    }
  }, [initialSelectedItems, currentField, open]);

  useEffect(() => {
    if (open && selectedItems.length > 0) {
      const selectedTeemaIds = selectedItems.map((item) => item.id);
      fetchCompetenceData(selectedTeemaIds);
    }
  }, [selectedItems, open, fetchCompetenceData]);

  useEffect(() => {
    if (open && currentField === 'competenceRequirements') {
      const selectedTeemaIds = selectedItems.map((item) => item.id);
      const newTeemaIds = selectedTeemaIds.filter(
        (id) => !fetchedTeemaIds.has(id)
      );

      if (newTeemaIds.length > 0) {
        fetchCompetenceData(newTeemaIds);
      }
    }
  }, [
    selectedItems,
    currentField,
    fetchedTeemaIds,
    open,
    fetchCompetenceData,
  ]);

  const handleToggle = (value: Item) => () => {
    if (currentField === 'parentQualificationUnit') {
      setSelectedItems([value]);
    } else {
      const currentIndex = selectedItems.findIndex(
        (item) => item.id === value.id
      );
      const newChecked = [...selectedItems];

      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }

      setSelectedItems(newChecked);
    }
  };

  const handleAdd = () => {
    onAdd([...selectedItems]);
    onClose();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleAddNewItem = async () => {
    if (searchTerm && !items.some((item) => item.name === searchTerm)) {
      try {
        const { data } = await createProjectTag({
          variables: { name: searchTerm },
        });
        const newTag = {
          id: data.createProjectTag.tag.id,
          name: data.createProjectTag.tag.name,
        };
        setSearchTerm('');
        updateProjectTags(newTag);
      } catch (error) {
        console.error('Error creating new tag:', error);
      }
    }
  };

  const filteredItems =
    currentField === 'competenceRequirements'
      ? competenceOptions.length > 0
        ? competenceOptions
        : []
      : (Array.isArray(items) ? items : []).filter((item) =>
          item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >  {/* THIS WORKS WITHOUT OVERFLOW-HIDDEN HERE, OLD COMMENT: Use overflow-hidden to prevent content from overflowing the dialog when the list is long, previous version was commented out. I also changed ScrollArea */}
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-lg">

        <DialogHeader className="rounded-t-lg bg-primary px-6 py-4 text-primary-foreground">
          <DialogTitle className="text-primary-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="sticky top-0 z-10 border-b bg-muted/50 p-3">
          <div className="relative flex items-center gap-2">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                currentField === 'tags'
                  ? 'Hae tai lisaa uusi tunniste'
                  : 'Hae'
              }
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9"
            />
            {currentField === 'tags' && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddNewItem}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Selected items display */}
          {selectedItems.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground">Valitut:</span>
              {selectedItems.map((item) => (
                <span key={item.id} className="text-xs">
                  {currentField === 'competenceRequirements'
                    ? item.description
                    : item.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Items list */}
        {/* Added overflow-auto to the ScrollArea as it wasn't creating a scroll bar when items were overflowing. If we want to replace the scrollbar with the Radix scrollbar, we change it to overflow-hidden and remove max- from max-h-[50vh] the downside of this is that the scroll area will always be "tall" even with few items */}
          <ScrollArea className="max-h-[50vh] overflow-auto">
          <div className="divide-y">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left hover:bg-muted/50"
                onClick={handleToggle(item)}
              >
                <span className="text-sm">
                  {currentField === 'competenceRequirements'
                    ? item.description
                    : item.name}
                </span>
                <Checkbox
                  checked={selectedItems.some(
                    (selectedItem) => selectedItem.id === item.id
                  )}
                  onCheckedChange={() => handleToggle(item)()}
                  className="ml-2"
                />
              </button>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="justify-center border-t p-4">
          <Button onClick={handleAdd}>{buttonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemSelectorDialog;
