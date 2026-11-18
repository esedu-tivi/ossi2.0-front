import { useQuery } from "@apollo/client"
import { useParams } from "react-router-dom"
import { GET_WORKPLACE } from "../../graphql/GetWorkplace"
import BackButton from "@/components/common/back-button"
import type { Workplace } from "../../types"

interface InfoRowProps {
  label: string
  value: string
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="grid grid-cols-1 gap-1 border-b py-3 last:border-b-0 sm:grid-cols-[170px_1fr] sm:items-center">
    <span className="text-sm font-medium text-muted-foreground sm:text-right sm:pr-4">{label}</span>
    <span className="text-base">{value || "-"}</span>
  </div>
)

const WorkplacePage = () => {
  const { id } = useParams()
  const { data, loading, error } = useQuery(GET_WORKPLACE, {
    variables: { workplaceId: id },
    fetchPolicy: "network-only"
  })

  if (loading) {
    return <p className="p-4">Loading</p>
  }
  if (error) {
    return <p className="p-4">Error: {error.message}</p>
  }

  const workplace: Workplace = data.workplace?.workplace

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="max-w-3xl rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold">Työpaikka</h2>
        <div className="space-y-1">
          <InfoRow label="Nimi" value={workplace.name} />
          <InfoRow label="Työpaikkaohjaajia" value={String(workplace.jobSupervisors?.length || 0)} />
        </div>
      </div>

      <div className="max-w-3xl rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold">Työpaikkaohjaajat</h3>
        <div className="space-y-1">
          {workplace.jobSupervisors?.length ? workplace.jobSupervisors.map((jobSupervisor) => (
            <InfoRow
              key={jobSupervisor.id}
              label={`${jobSupervisor.firstName} ${jobSupervisor.lastName}`}
              value={[jobSupervisor.email, jobSupervisor.phoneNumber].filter(Boolean).join(" | ")}
            />
          )) : <p className="text-sm text-muted-foreground">Ei liitettyjä työpaikkaohjaajia.</p>}
        </div>
      </div>
    </div>
  )
}

export default WorkplacePage
