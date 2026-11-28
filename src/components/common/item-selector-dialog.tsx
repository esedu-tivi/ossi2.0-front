import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { useMutation } from '@apollo/client';
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

interface Item {
  id: string;
  name: string;
  description?: string;
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
  // Reset selected items and search term when the dialog opens
  useEffect(() => {
    if (open) {
      const validSelectedItems = Array.isArray(initialSelectedItems)
        ? initialSelectedItems
        : [];

      setSelectedItems(validSelectedItems.filter((item) => 'name' in item));
    }
  }, [initialSelectedItems, open]);

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

  // Osaamiset have their own selector (CompetenceSelectorDialog).
  const filteredItems = (Array.isArray(items) ? items : []).filter((item) =>
    item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
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
                  {item.name}
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
                  {item.name}
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
