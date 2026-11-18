// TODO uses hardcoded data. Needs to be changed to use backend data when possible

import React, { useState } from 'react';
import { ChevronDown, CheckSquare, PlusCircle, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { mandatoryModules, choiceModules, optionalModulesList } from '../../data/EducationPathData';
import { Student } from '../../types';

interface ModulePart {
  id: number;
  title: string;
  points: number;
  completed: boolean;
  osaamiset: string[];
}

interface Module {
  id: number;
  title: string;
  points: number;
  parts: ModulePart[];
  completed: boolean;
}

const ModuleAccordion: React.FC<{ module: Module }> = ({ module }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`mb-2 rounded-lg border ${module.completed ? 'bg-green-100' : 'bg-muted/50'}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          {module.completed && <CheckSquare className="h-5 w-5" />}
          <span className="font-bold">{module.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm">{module.points} osp</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && module.parts.length > 0 && (
        <div className="px-4 pb-4">
          {module.parts.map((part) => (
            <PartAccordion key={part.id} part={part} />
          ))}
        </div>
      )}
    </div>
  );
};

const PartAccordion: React.FC<{ part: ModulePart }> = ({ part }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`mb-1 rounded border p-1 ${part.completed ? 'bg-green-200' : 'bg-white'}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-2 text-left"
      >
        <span className="text-sm font-bold">
          {part.title} ({part.points} osp)
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-2">
          {part.osaamiset && part.osaamiset.length > 0 ? (
            <div>
              <p className="text-sm font-bold">Osaamiset:</p>
              <ul className="list-inside list-disc">
                {part.osaamiset.map((osaaminen, index) => (
                  <li key={index} className="text-sm">{osaaminen}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Ei määriteltyjä osaamisia</p>
          )}
        </div>
      )}
    </div>
  );
};

const EducationPath: React.FC<{ student: Student }> = ({ student }) => {
  const [modules] = useState<Module[]>(mandatoryModules);
  const [optionalModules, setOptionalModules] = useState<Module[]>(choiceModules);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOptionalModules, setSelectedOptionalModules] = useState<number[]>([]);

  const handleAddModalOpen = () => setIsAddModalOpen(true);
  const handleAddModalClose = () => {
    setSelectedOptionalModules([]);
    setIsAddModalOpen(false);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedOptionalModules((prev) => (prev.includes(id) ? prev.filter((moduleId) => moduleId !== id) : [...prev, id]));
  };

  const [previousEducation] = useState<number>(5);

  const totalPoints = [...modules, ...optionalModules].reduce((sum, module) => sum + module.points, previousEducation);
  const completedPoints = [...modules, ...optionalModules].reduce((sum, module) => sum + (module.completed ? module.points : 0), previousEducation);

  const addSelectedModules = () => {
    const selectedModulesToAdd = optionalModulesList.filter((module) => selectedOptionalModules.includes(module.id));

    setOptionalModules((prev) => [...prev, ...selectedModulesToAdd]);
    handleAddModalClose();
  };

  return (
    <Card>
      <CardHeader className="bg-primary rounded-t-xl text-center">
        <CardTitle className="text-primary-foreground">
          <p className="text-lg font-bold">Opintosuunnitelma</p>
          {student ? (
            <p className="text-2xl">
              {student.firstName} {student.lastName} (Ohjelmistokehittäjä)
            </p>
          ) : (
            <p className="text-2xl">Opiskelija (Ohjelmistokehittäjä)</p>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Pakolliset tutkinnon osat</h2>
          {modules.map((module) => (
            <ModuleAccordion key={module.id} module={module} />
          ))}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Valinnaiset opinnot</h2>
          {optionalModules.map((module) => (
            <ModuleAccordion key={module.id} module={module} />
          ))}

          <Button variant="outline" onClick={handleAddModalOpen} className="mt-2">
            <PlusCircle className="mr-2 h-4 w-4" />
            Lisää valinnaisia opintoja
          </Button>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={(open) => { if (!open) handleAddModalClose(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lisää valinnaisia opintoja</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2 py-4">
              {optionalModulesList.map((module) => (
                <label key={module.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedOptionalModules.includes(module.id)}
                    onChange={() => handleCheckboxChange(module.id)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">{module.title}</span>
                </label>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={addSelectedModules}>Lisää valitut</Button>
              <Button variant="outline" onClick={handleAddModalClose}>Sulje</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Aikaisemmat opinnot</h2>
          <div className="flex max-w-xs flex-col rounded border bg-green-100 p-3">
            <p className="text-sm">Hyväksytty aikaisempi koulutus</p>
            <p className="text-sm">{previousEducation} osp</p>
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Tallenna Opintosuunnitelma
          </Button>
          <div className="flex flex-wrap gap-2">
            <span className="rounded border-2 bg-muted px-3 py-2 text-sm font-bold">
              Osp suoritettu: {completedPoints}
            </span>
            <span className="rounded border-2 bg-muted px-3 py-2 text-sm font-bold">
              Osp valittu: {totalPoints}
            </span>
            <span className="rounded border-2 bg-muted px-3 py-2 text-sm font-bold">
              Tutkintoon vaadittu osp: 145
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EducationPath;
