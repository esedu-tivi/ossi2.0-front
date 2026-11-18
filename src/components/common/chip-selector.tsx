import React from 'react';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ChipSelectorProps {
  label: string;
  items: { id: string; name: string; description?: string }[];
  onAdd: () => void;
  currentField: string;
}

const ChipSelector: React.FC<ChipSelectorProps> = ({
  label,
  items,
  onAdd,
  currentField,
}) => {
  return (
    <div className="w-full">
      <Label className="mb-3 block">{label}</Label>
      <div className="flex flex-wrap items-center gap-2 rounded-md border p-3">
        {items.map((item) => (
          <Badge key={item.id} variant="secondary">
            {currentField === 'competenceRequirements'
              ? item.description
              : item.name}
          </Badge>
        ))}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={onAdd}
          className="rounded-full"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChipSelector;
