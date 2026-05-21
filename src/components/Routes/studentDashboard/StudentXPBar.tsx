import { useState } from "react";

export default function StudentXPBar() {
    
    const [studentXP, setStudentXP] = useState(10);
    const [XPGoal, setXPGoal] = useState(100);
    const [XPTier, setXPTier] = useState(0)
    const XPBarProgress = studentXP / XPGoal * 100
    const XPColors = ["red", "orange", "yellow", "lightblue", "green",]

    // XP-palkin resetointi maalin saavutettua
    if (studentXP >= XPGoal) {
        setStudentXP(studentXP - XPGoal)
        setXPGoal(XPGoal + 100)
        if (XPTier < 4) {
            setXPTier(XPTier + 1)
        }
    }
    return (
        <div className="flex flex-col">    
            <div className="rounded-full h-16 absolute" style={{width: `${XPBarProgress}%`, backgroundColor: XPColors[XPTier]}}/>     
            <div className="flex flex-col w-full h-16 bg-green-400 rounded-full">
                <div className="flex flex-col justify-center items-center">
                    <p className="font-semibold text-2xl z-10">XP</p>
                    <p className="font-semibold text-2xl z-10">{studentXP} / {XPGoal}</p>
                </div>
    
            </div>
            <div className="flex flex-col items-center justify-center">
                <p className="text-2xl font-semibold">Kuulut parhaaseen 33% XP-keräyksessä!</p>
                <div className="flex justify-center items-center">

                    <button className="bg-green-500 w-30 rounded-full mt-2"onClick={() => setStudentXP(studentXP + 10)}>XP + 10</button>
                    <button className="bg-green-500 w-30 rounded-full mt-2"onClick={() => setStudentXP(studentXP + 50)}>XP + 50</button>
                    <button className="bg-green-500 w-30 rounded-full mt-2"onClick={() => setXPGoal(XPGoal + 50)}>XP Maali + 50</button>
                    <button className="bg-green-500 w-30 rounded-full mt-2"onClick={() => {setXPGoal(100), setStudentXP(10), setXPTier(0)}}>RESET</button>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center pt-6">
                {XPColors.map((color) => {
                    return (
                        <p className="text-3xl">{color}</p>
                    )
                })}
            </div>
</div>
    )
}