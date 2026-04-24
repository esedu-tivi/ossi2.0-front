import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

export interface Option {
  id: string | number;
  name: string;
}

interface ComboboxProps {
  id: string;
  label: string;
  required?: boolean;
  value: Option | null;
  options: Option[];
  onChange: (event: React.SyntheticEvent, newValue: Option | null) => void;
  noOptionsText?: string;
  onCreate?: (inputValue: string) => void;
  creatable?: boolean;
  createText?: (input: string) => string;
  placeholder?: string;
}

const Combobox = ({
  id,
  label,
  required,
  value,
  options,
  onChange,
  noOptionsText = 'Ei vaihtoehtoja.',
  onCreate,
  creatable = false,
  createText,
  placeholder = 'Valitse...',
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(normalizedQuery)
  );
  const canCreate =
    creatable &&
    normalizedQuery.length > 0 &&
    !options.some((option) => option.name.toLowerCase() === normalizedQuery);

  const closeAndReset = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {value ? value.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" style={{ pointerEvents: 'auto' }}>
          <Command>
            <CommandInput
              placeholder="Hae..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>{noOptionsText}</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => {
                      const newValue =
                        value?.id === option.id ? null : option;
                      // Create a synthetic event for backwards compatibility
                      const syntheticEvent = {
                        type: 'change',
                        target: { value: newValue },
                      } as unknown as React.SyntheticEvent;
                      onChange(syntheticEvent, newValue);
                      closeAndReset();
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value?.id === option.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.name}
                  </CommandItem>
                ))}
                {canCreate && (
                  <CommandItem
                    key={`create-${normalizedQuery}`}
                    value={query}
                    onSelect={() => {
                      if (!onCreate) return;
                      onCreate(query.trim());
                      const syntheticEvent = {
                        type: 'change',
                        target: { value: null },
                      } as unknown as React.SyntheticEvent;
                      onChange(syntheticEvent, null);
                      closeAndReset();
                    }}
                  >
                    {createText ? createText(query.trim()) : `Lisää "${query.trim()}"`}
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Combobox;
