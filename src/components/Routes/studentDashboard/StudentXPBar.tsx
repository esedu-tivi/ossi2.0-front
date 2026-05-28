import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentXPBar() {
  const [xp, setXp] = useState(10);
  const [goal, setGoal] = useState(100);

  const progress = (xp / goal) * 100;

  function addXP(amount: number) {
    let newXp = xp + amount;
    let newGoal = goal;

    while (newXp >= newGoal) {
      newXp -= newGoal;
      newGoal += 100;
    }

    setXp(newXp);
    setGoal(newGoal);
  }

  function reset() {
    setXp(10);
    setGoal(100);
  }

  return (
    <div className="w-full p-6">
      <div className="grid grid-cols-3 gap-4 items-start">

        {/* Left col: header + bar */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">XP-edistyminen</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {/*Tää muutetaan sit dynaamiseks*/}
                Olet parhaiden 33% joukossa!
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="px-5 py-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Maali: {goal} XP</span>
              </div>

              <div className="relative h-4 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(progress)}% täynnä</span>
                <span>puuttuu {goal - xp}XP </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => addXP(10)}>
              +10 XP
            </Button>
            <Button variant="outline" size="sm" onClick={() => addXP(50)}>
              +50 XP
            </Button>
            <Button variant="outline" size="sm" onClick={() => setGoal(g => g + 50)}>
               Maali +50
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={reset}>
              Nollaa
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            
              {/* Streakki päivät*/}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  {/* Tää muutetaan sit dynaamiseks */}
                  5 päivän streakki!
                </Badge>
              </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}