import { useEffect, useState } from "react"
import { useQuery } from "@apollo/client"
import { GET_STUDENTS } from "@/graphql/GetStudents"
import { Student } from "@/types"
import DataTable, { type TableHeaderCell } from "@/components/common/data-table"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AppDialog from "@/components/common/app-dialog"
import { Users, Pencil, AlertCircle } from "lucide-react"

//  korvaa kaikki backend datalla sit ku se on valmis
interface StudentXPData {
  studentId: number
  fullName: string
  groupId: string
  qualificationTitle: string
  totalXP: number
  currentLevel: number
  loginStreak: number
  lastLoginDate: string | null
  hoursThisMonth: number
  daysSinceLastLogin: number
}

interface ActivityEntry {
  id: number
  studentName: string
  action: string
  timestamp: Date
}

// mock tapahtumat
const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: 1, studentName: "Matti Virtanen", action: "kirjautui sisään", timestamp: new Date(Date.now() - 5 * 60000) },
  { id: 2, studentName: "Liisa Mäkinen", action: "sai +150 XP", timestamp: new Date(Date.now() - 12 * 60000) },
  { id: 3, studentName: "Pekka Korhonen", action: "kirjautui sisään", timestamp: new Date(Date.now() - 20 * 60000) },
  { id: 4, studentName: "Anna Leinonen", action: "sai +50 XP", timestamp: new Date(Date.now() - 35 * 60000) },
  { id: 5, studentName: "Matti Virtanen", action: "sai +200 XP", timestamp: new Date(Date.now() - 48 * 60000) },
  { id: 6, studentName: "Juho Nieminen", action: "kirjautui sisään", timestamp: new Date(Date.now() - 60 * 60000) },
  { id: 8, studentName: "Liisa Mäkinen", action: "kirjautui sisään", timestamp: new Date(Date.now() - 90 * 60000) },
]

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 60) return `${mins} min sitten`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} t sitten`
  return `${Math.floor(hours / 24)} pv sitten`
}

const XPManagement = () => {
  const { loading, error, data } = useQuery(GET_STUDENTS)
  const [students, setStudents] = useState<StudentXPData[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState<StudentXPData | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "inactive" | "activity">("overview")

  useEffect(() => {
    if (data && !loading) {
      const rawStudents: Student[] = data.students?.students || []
      setStudents(rawStudents.map((student) => ({
        studentId: student.id,
        fullName: `${student.firstName} ${student.lastName}`,
        groupId: student.groupId || "-",
        qualificationTitle: student.studyingQualificationTitle?.name || "-",
        // tähän sitten queryllä oikeat datat
        totalXP: 0,
        currentLevel: 0,
        loginStreak: 0,
        lastLoginDate: null,
        hoursThisMonth: 0,
        daysSinceLastLogin: 0,
      })))
    }
  }, [data, loading])

  const allHeaders: readonly TableHeaderCell[] = [
    { id: 0, type: "sort", label: "ID", sortPath: "studentId" },
    { id: 1, type: "sort", label: "Nimi", sortPath: "fullName" },
    { id: 2, type: "sort", label: "Ryhmä", sortPath: "groupId" },
    { id: 3, type: "sort", label: "Ammattinimike", sortPath: "qualificationTitle" },
    { id: 4, type: "sort", label: "XP", sortPath: "totalXP" },
    { id: 5, type: "sort", label: "Streakki", sortPath: "loginStreak" },
    { id: 6, type: "sort", label: "Tunteja (kk)", sortPath: "hoursThisMonth" },
    { id: 7, type: "sort", label: "Viimeisin Kirjautuminen", sortPath: "daysSinceLastLogin" },
    { id: 8, type: "search", searchPath: "fullName" },
  ]

  // last login badge jutska
  function loginBadge(days: number) {
    if (days === 0) return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Tänään</Badge>
    if (days <= 3) return <span>{days} pv sitten</span>
    if (days <= 7) return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{days} pv sitten</Badge>
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{days} pv sitten</Badge>
  }

  if (loading) return <p className="p-4">Ladataan...</p>
  if (error) return <p className="p-4">Virhe: {error.message}</p>

  return (
    <div className="space-y-6">
      {/* kortit */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Opiskelijat yhteensä</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktiivisia tällä kuukaudella</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Tähän sit oikeaa dataa / {students.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* tabsit */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "overview" ? "default" : "outline"}
          onClick={() => setActiveTab("overview")}
        >
          Kaikki opiskelijat
        </Button>

        <Button
          variant={activeTab === "inactive" ? "default" : "outline"}
          onClick={() => setActiveTab("inactive")}
        >
          Merkatut opiskelijat
        </Button>

        <Button
          variant={activeTab === "activity" ? "default" : "outline"}
          onClick={() => setActiveTab("activity")}
        >
          Viimeisin aktiviteetti
        </Button>
      </div>

      {/* kaikki */}
      {activeTab === "overview" && (
        <DataTable<StudentXPData> headerCells={allHeaders} data={students}>
          {(rows) => (
            <TableBody>
              {rows.map((s) => {
                return (
                  <TableRow key={s.studentId}>
                    <TableCell>{s.studentId}</TableCell>
                    <TableCell className="font-medium">{s.fullName}</TableCell>
                    <TableCell>{s.groupId}</TableCell>
                    <TableCell>{s.qualificationTitle}</TableCell>
                    <TableCell className="font-semibold">{s.totalXP}</TableCell>
                    <TableCell>{s.loginStreak > 0 ? s.loginStreak : <span className="text-muted-foreground">0</span>}</TableCell>
                    <TableCell>{s.hoursThisMonth}h</TableCell>
                    <TableCell>{loginBadge(s.daysSinceLastLogin)}</TableCell>

                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelected(s)
                            setEditOpen(true)
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        {/* merkitse käyttäjä */}
                        <Button variant="outline" size="sm">
                          <AlertCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          )}
        </DataTable>
      )}

      {activeTab === "inactive" && (
        <div className="py-12 text-center text-muted-foreground text-sm">
          ---testi---
        </div>
      )}

      {/* aktiviteetti */}
      {activeTab === "activity" && (
        <div className="h-96 overflow-y-auto border rounded-md">
          {MOCK_ACTIVITY.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-4 py-3 border-b last:border-0">
              <div>
                <span className="font-medium">{entry.studentName}</span>
                <span className="text-muted-foreground"> {entry.action}</span>
              </div>

              <span className="text-xs text-muted-foreground shrink-0 ml-4">
                {timeAgo(entry.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* xp muokkaus */}
      <AppDialog title={`Muokkaa ${selected?.fullName ?? ""}`} open={editOpen} onClose={setEditOpen}>
        <div className="py-8 text-center text-muted-foreground text-sm">---testi----</div>
      </AppDialog>
    </div>
  )
}

export default XPManagement