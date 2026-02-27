import { Save, Check, ChevronsUpDown, X } from "lucide-react"
import React, { useState } from "react"
import { JobSupervisor } from "../types"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface JobSupervisorWithId extends JobSupervisor {
  id: string
}

export interface WorkplaceFormData {
  id: string | number | null
  name: string;
  jobSupervisorIds: string[]
}

interface WorkplaceFormProps {
  formData: WorkplaceFormData
  setFormData: React.Dispatch<React.SetStateAction<WorkplaceFormData>>
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  submitButtonTitle: string
  jobSupervisors?: JobSupervisorWithId[]
}

interface SupervisorFieldProps {
  formData: WorkplaceFormData
  onToggle: (id: string) => void
  jobSupervisors: JobSupervisorWithId[]
}

const SupervisorField = ({ formData, onToggle, jobSupervisors }: SupervisorFieldProps) => {
  const [open, setOpen] = useState(false)
  const selectedSupervisors = jobSupervisors.filter(js => formData.jobSupervisorIds.includes(js.id))

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <Label>Työpaikkaohjaajat</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal h-auto min-h-9"
          >
            {selectedSupervisors.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedSupervisors.map((supervisor) => (
                  <Badge
                    key={supervisor.id}
                    variant="secondary"
                    className="text-xs"
                  >
                    {`${supervisor.firstName} ${supervisor.lastName}`}
                    <button
                      type="button"
                      className="ml-1 rounded-full outline-none hover:bg-muted-foreground/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggle(supervisor.id)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">Valitse...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Hae..." />
            <CommandList>
              <CommandEmpty>Ei yhtään työpaikkaohjaajaa</CommandEmpty>
              <CommandGroup>
                {jobSupervisors.map((supervisor) => (
                  <CommandItem
                    key={supervisor.id}
                    value={`${supervisor.firstName} ${supervisor.lastName}`}
                    onSelect={() => {
                      onToggle(supervisor.id)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        formData.jobSupervisorIds.includes(supervisor.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {`${supervisor.firstName} ${supervisor.lastName}`}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

const WorkplaceForm = ({
  formData,
  setFormData,
  handleSubmit,
  jobSupervisors,
  submitButtonTitle
}: WorkplaceFormProps) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const handleToggleSupervisor = (supervisorId: string) => {
    setFormData((prevFormData) => {
      const currentIds = prevFormData.jobSupervisorIds;
      const newIds = currentIds.includes(supervisorId)
        ? currentIds.filter(id => id !== supervisorId)
        : [...currentIds, supervisorId];
      return {
        ...prevFormData,
        jobSupervisorIds: newIds
      };
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="text-center"
    >
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <div className="flex-1 space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">
              Työpaikan nimi
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {jobSupervisors && (
            <SupervisorField
              jobSupervisors={jobSupervisors}
              formData={formData}
              onToggle={handleToggleSupervisor}
            />
          )}

          <Button type="submit" className="mt-4 px-10">
            <Save className="mr-1 h-4 w-4" />
            {submitButtonTitle}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default WorkplaceForm
