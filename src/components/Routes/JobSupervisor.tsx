import { Box, Table, TableBody, TableCell, TableRow as MuiTableRow, Typography } from "@mui/material"
import { useParams } from "react-router-dom"
import BackButton from "../common/BackButton"
import { useQuery } from "@apollo/client"
import { GET_JOB_SUPERVISOR } from "../../graphql/GetJobSupervisor"

interface TableRowProps {
  label: string
  value: string
}

const TableRow = ({ label, value }: TableRowProps) => (
  <MuiTableRow>
    <TableCell align="right">{label}</TableCell>
    <TableCell>{value}</TableCell>
  </MuiTableRow>
)

const JobSupervisor = () => {
  const { id } = useParams()
  const { data, loading, error } = useQuery(GET_JOB_SUPERVISOR, { variables: { jobSupervisorId: id } })

  if (loading) {
    return <Box><Typography>Loading...</Typography></Box>
  }
  if (error) {
    return <Box><Typography>Error: {error.message}</Typography></Box>
  }
  console.log(data)
  const jobSupervisor = data.jobSupervisor?.jobSupervisor
  return (
    <Box>
      <BackButton />
      <Box sx={{ maxWidth: 20 }}>
        <Table>
          <TableBody>
            <TableRow label="Nimi" value={`${jobSupervisor.firstName} ${jobSupervisor.lastName}`} />
            <TableRow label="Sähköposti" value={jobSupervisor.email} />
            <TableRow label="Puhelinnumero" value={jobSupervisor.phoneNumber} />
            <TableRow label="Työpaikka" value={jobSupervisor.workplace?.name}></TableRow>
          </TableBody>
        </Table>

      </Box>

    </Box>
  )
}

export default JobSupervisor