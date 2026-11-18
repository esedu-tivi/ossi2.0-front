import { useParams } from "react-router-dom"
import BackButton from "@/components/common/back-button"
import { useQuery } from "@apollo/client"
import { GET_JOB_SUPERVISOR } from "../../graphql/GetJobSupervisor"

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

const JobSupervisor = () => {
  const { id } = useParams()
  const { data, loading, error } = useQuery(GET_JOB_SUPERVISOR, { variables: { jobSupervisorId: id } })

  if (loading) {
    return <p className="p-4">Loading...</p>
  }
  if (error) {
    return <p className="p-4">Error: {error.message}</p>
  }

  const jobSupervisor = data.jobSupervisor?.jobSupervisor

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="max-w-3xl rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold">Työpaikkaohjaaja</h2>
        <div className="space-y-1">
          <InfoRow label="Nimi" value={`${jobSupervisor.firstName} ${jobSupervisor.lastName}`} />
          <InfoRow label="Sähköposti" value={jobSupervisor.email} />
          <InfoRow label="Puhelinnumero" value={jobSupervisor.phoneNumber} />
          <InfoRow label="Työpaikka" value={jobSupervisor.workplace?.name} />
        </div>
      </div>
    </div>
  )
}

export default JobSupervisor
