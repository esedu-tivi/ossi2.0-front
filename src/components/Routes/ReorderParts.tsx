import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

import { useQuery, useMutation } from "@apollo/client";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/app-accordion";
import { Button } from "@/components/ui/button";
import { GET_QUALIFICATION_UNITS } from "../../graphql/GetQualificationUnits";
import { UPDATE_PART_ORDER } from "../../graphql/UpdatePartOrder";
import { useNavigate } from 'react-router-dom';
import { QualificationUnit } from "../../types";

const ReorderParts: React.FC = () => {
  // Fetch qualification units with their parts
  const { loading, error, data, refetch } = useQuery(GET_QUALIFICATION_UNITS);
  const [updatePartOrder] = useMutation(UPDATE_PART_ORDER);
  const [qualificationUnits, setQualificationUnits] = useState<QualificationUnit[]>([]);
  const [hasChanges, setHasChanges] = useState<{ [key: number]: boolean }>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (data?.units?.units) {
      setQualificationUnits(data.units?.units);
    }
  }, [data]);

  // Handle drag-and-drop sorting within a unit
  const handleDragEnd = (result: DropResult, unitId: number) => {
    if (!result.destination) return;

    setQualificationUnits((prevUnits) =>
      prevUnits.map((unit) => {
        if (unit.id !== unitId) return unit;

        const updatedParts = [...unit.parts];
        const [movedItem] = updatedParts.splice(result.source.index, 1);
        updatedParts.splice(result.destination!.index, 0, movedItem);

        return { ...unit, parts: updatedParts };
      })
    );

    setHasChanges((prev) => ({ ...prev, [unitId]: true }));
  };

  const handleSaveOrder = async (unitId: number) => {
    try {
      const unit = qualificationUnits.find((u) => u.id === unitId);
      if (!unit) {
        console.error("Unit not found:", unitId);
        return;
      }

      const orderedIds = unit.parts.map((part) => part.id);

      console.log("Sending to API:", { updatePartOrderId: unitId, partOrder: orderedIds });

      await updatePartOrder({
        variables: {
          unitId: String(unitId),
          partOrder: orderedIds.map(id => String(id))
        },
      });

      await refetch();
      setHasChanges((prev) => ({ ...prev, [unitId]: false }));

      console.log(`Order for unit ${unitId} saved successfully!`);
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4">Error loading qualification units.</p>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
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
          Teemojen järjestys
        </h2>
      </div>

      <Accordion type="multiple">
        {qualificationUnits.map((unit) => (
          <AccordionItem key={unit.id} value={String(unit.id)}>
            <AccordionTrigger className="px-4">
              {unit.name}
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <DragDropContext onDragEnd={(result) => handleDragEnd(result, unit.id)}>
                <Droppable droppableId={String(unit.id)}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="rounded-md border p-2">
                      {unit.parts.map((part, index) => (
                        <Draggable key={String(part.id)} draggableId={String(part.id)} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-1 cursor-grab rounded border bg-white p-3"
                            >
                              {part.name}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <Button
                onClick={() => {
                  console.log("Saving order for:", unit.id);
                  handleSaveOrder(unit.id);
                }}
                className="mt-2"
                disabled={!hasChanges[unit.id]}
              >
                Tallenna
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default ReorderParts;
