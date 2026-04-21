import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@apollo/client"
import { useNavigate } from "react-router-dom"
import { GET_WORKPLACES } from "../../graphql/GetWorkplaces"
import { Plus, Pencil, Info, Trash2, UserPlus } from "lucide-react"

import WorkplaceForm, { WorkplaceFormData } from "../WorkplaceForm"
import { CREATE_WORKPLACE } from "../../graphql/CreateWorkplace"
import { EDIT_WORKPLACE } from "../../graphql/EditWorkpalce"
import { DELETE_WORKPLACE } from "../../graphql/DeleteWorkplace"
import { useConfirmDialog } from "@/hooks/useConfirmDialog"
import DataTable, { type TableHeaderCell } from "@/components/common/data-table"
import { GET_JOB_SUPERVISORS } from "../../graphql/GetJobSupervisors"
import { UPDATE_JOB_SUPERVISOR_ASSIGNS } from "../../graphql/UpdateJobSupervisorAssigns"
import AppDialog from "@/components/common/app-dialog"
import { useAlerts } from "../../context/use-alerts"
import { JobSupervisor, Workplace } from "../../types"
import JobSupervisorForm from "../JobSupervisorForm"
import { CREATE_JOB_SUPERVISOR } from "../../graphql/CreateJobSupervisor"
import { DELETE_JOB_SUPERVISOR } from "../../graphql/DeleteJobSupervisor"
import { REQUEST_MAGIC_LINK } from "../../graphql/RequestMagicLink"
import { EDIT_JOB_SUPERVISOR } from "../../graphql/EditJobSupervisor"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/app-accordion"
import { Button } from "@/components/ui/button"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"

interface JobSupervisorWithId extends JobSupervisor {
  id: string
}

interface WorkplaceWithJobSupervisorId extends Workplace {
  jobSupervisors: JobSupervisorWithId[]
}

interface JobSupervisorWithFullNameAndWorkplace extends JobSupervisor {
  id: string,
  fullName: string,
  workplace?: Workplace
}

const headerCells: readonly TableHeaderCell[] = [
  {
    id: 0,
    sortPath: "id",
    label: "ID#",
    type: "sort"
  },
  {
    id: 1,
    sortPath: "name",
    label: "Työpaikan nimi",
    type: "sort"
  },
  {
    id: 2,
    label: "Työpaikkaohjaajat",
    type: "default"
  },
  {
    id: 3,
    type: "search",
    searchPath: "name"
  }
]

const jobSupervisorsHeaderCells: readonly TableHeaderCell[] = [
  {
    id: 0,
    sortPath: "id",
    label: "ID#",
    type: "sort"
  },
  {
    id: 1,
    sortPath: "fullName",
    label: "Nimi",
    type: "sort"
  },
  {
    id: 2,
    sortPath: "workplace.name",
    label: "Työpaikan nimi",
    type: "sort"
  },
  {
    id: 3,
    type: "search",
    searchPath: "fullName"
  }
]

const Workplaces = () => {
  const navigate = useNavigate()
  const { loading: workplaceLoading, error: workplaceError, data: workplaceData } = useQuery(GET_WORKPLACES)
  const { loading: jobSupervisorsLoading, error: jobSupervisorsError, data: jobSupervisorsData } = useQuery(GET_JOB_SUPERVISORS)

  const [createWorkplace] = useMutation(CREATE_WORKPLACE, {
    refetchQueries: [{ query: GET_WORKPLACES }]
  })

  const [editWorkplace] = useMutation(EDIT_WORKPLACE, {
    refetchQueries: [{ query: GET_WORKPLACES }]
  })

  const [deleteWorkplace] = useMutation(DELETE_WORKPLACE, {
    refetchQueries: [GET_WORKPLACES, GET_JOB_SUPERVISORS]
  })

  const [editJobSupervisor] = useMutation(EDIT_JOB_SUPERVISOR, { refetchQueries: [GET_JOB_SUPERVISORS, GET_WORKPLACES] })

  const [updateSupervisorAssigns] = useMutation(UPDATE_JOB_SUPERVISOR_ASSIGNS, { refetchQueries: [GET_JOB_SUPERVISORS] })

  const [createJobSupervisor] = useMutation(CREATE_JOB_SUPERVISOR, { refetchQueries: [GET_JOB_SUPERVISORS] })
  const [deleteJobSupervisor] = useMutation(DELETE_JOB_SUPERVISOR, { refetchQueries: [GET_JOB_SUPERVISORS, GET_WORKPLACES] })

  const [requestMagicLink] = useMutation(REQUEST_MAGIC_LINK)

  const { addAlert } = useAlerts()
  const { confirm, ConfirmDialog } = useConfirmDialog()

  const [showNewWorkplaceForm, setShowNewForm] = useState(false)
  const [showEditWorkplaceForm, setShowEditForm] = useState(false)
  const [showNewJobSupervisorForm, setShowNewJobSupervisorForm] = useState(false)
  const [showEditJobSupervisorForm, setShowEditJobSupervisorForm] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)

  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<number | null>(null)
  const [selectedJobSupervisorId, setSelectedJobSupervisorId] = useState<string | null>(null)

  const [expandedAccordion, setExpandedAccordion] = useState<string>("")

  const initWorkplaceFormData = {
    id: null,
    name: "",
    jobSupervisorIds: []
  }

  const initJobSupervisorFormData = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  }

  const [workplaceFormData, setWorkplaceFormData] = useState<WorkplaceFormData>(initWorkplaceFormData);
  const [jobSupervisorFormData, setJobSupervisorFormData] = useState<JobSupervisor>(initJobSupervisorFormData)

  const getErrorMessage = (error: unknown) => {
    if (error && typeof error === "object") {
      const possibleGraphQLErrors = (error as { graphQLErrors?: { message?: string }[] }).graphQLErrors
      if (possibleGraphQLErrors?.length && possibleGraphQLErrors[0]?.message) {
        return possibleGraphQLErrors[0].message
      }
      const possibleMessage = (error as { message?: string }).message
      if (possibleMessage) return possibleMessage
    }
    return "Tuntematon virhe"
  }

  useEffect(() => {
    if (!dialogOpen) {
      setShowNewForm(false)
      setShowEditForm(false)
      setShowNewJobSupervisorForm(false)
      setShowEditJobSupervisorForm(false)
    }
  }, [dialogOpen])

  useEffect(() => {
    if (showNewWorkplaceForm || showEditWorkplaceForm || showNewJobSupervisorForm || showEditJobSupervisorForm) {
      setDialogOpen(true)
    } else {
      setDialogOpen(false)
    }
  }, [showNewWorkplaceForm, showEditWorkplaceForm, showNewJobSupervisorForm, showEditJobSupervisorForm])

  const workplaces: WorkplaceWithJobSupervisorId[] = workplaceData?.workplaces?.workplaces || []

  const jobSupervisors: JobSupervisorWithFullNameAndWorkplace[] = jobSupervisorsData?.jobSupervisors?.jobSupervisors?.map(((jobSupervisor: JobSupervisorWithFullNameAndWorkplace) => ({
    ...jobSupervisor,
    fullName: `${jobSupervisor.firstName} ${jobSupervisor.lastName}`,
    phoneNumber: jobSupervisor.phoneNumber || ""
  }))) || []

  useEffect(() => {
    if (!selectedWorkplaceId) return

    const foundWorkplace = workplaces.find(workplace => Number(workplace.id) === selectedWorkplaceId)
    const workplace = foundWorkplace ? {
      ...foundWorkplace,
      jobSupervisorIds: foundWorkplace.jobSupervisors.map(jobSupervisor => jobSupervisor.id)
    } : initWorkplaceFormData

    setWorkplaceFormData(workplace)
    setSelectedWorkplaceId(null)
  }, [selectedWorkplaceId, workplaces])

  useEffect(() => {
    if (!selectedJobSupervisorId) return

    const foundJobSupervisor = jobSupervisors.find(jobSupervisor => jobSupervisor.id === selectedJobSupervisorId)
    if (foundJobSupervisor) {
      setJobSupervisorFormData({
        id: selectedJobSupervisorId,
        firstName: foundJobSupervisor.firstName,
        lastName: foundJobSupervisor.lastName,
        email: foundJobSupervisor.email,
        phoneNumber: foundJobSupervisor.phoneNumber || ""
      })
    }
    setSelectedJobSupervisorId(null)
  }, [selectedJobSupervisorId, jobSupervisors])

  const loading = workplaceLoading || jobSupervisorsLoading
  const error = workplaceError || jobSupervisorsError

  if (loading) return <p className="p-4">Loading...</p>
  if (error) return <p className="p-4">Error: {error.message}</p>


  const handleDelete = async (id: number, name: string) => {
    const confirmed = await confirm({
      title: "Poisto",
      description: `Oletko aivan varma, että haluat poistaa '${name}' työpaikan?`
    })

    if (!confirmed) return

    try {
      const response = await deleteWorkplace({ variables: { deleteWorkplaceId: id } })
      if (response.data.deleteWorkplace.success) {
        addAlert("Työpaikka poistettu", "success")
        return
      }
      addAlert("Poistossa tapahtui virhe", "error")
    } catch (deleteError) {
      addAlert(`Poisto epäonnistui: ${getErrorMessage(deleteError)}`, "error", true)
    }
  }

  const handleJobSupervisorDelete = async (id: string, fullName: string, workplaceId?: string) => {
    const confirmed = await confirm({
      title: "Poisto",
      description: `Oletko aivan varma, että haluat poistaa '${fullName}' työpaikkaohjaajan?`
    })

    if (!confirmed) return

    try {
      const response = await deleteJobSupervisor({ variables: { jobSupervisorId: id } })
      if (response.data.deleteJobSupervisor.success) {
        addAlert("Työpaikkaohjaaja poistettu", "success")
        return
      }
    } catch (initialDeleteError) {
      if (workplaceId) {
        try {
          await updateSupervisorAssigns({
            variables: {
              workplaceId,
              assignIds: [],
              unassignIds: [id]
            }
          })

          const retryResponse = await deleteJobSupervisor({ variables: { jobSupervisorId: id } })
          if (retryResponse.data.deleteJobSupervisor.success) {
            addAlert("Työpaikkaohjaaja poistettu", "success")
            return
          }
        } catch (retryError) {
          addAlert(`Poisto epäonnistui: ${getErrorMessage(retryError)}`, "error", true)
          return
        }
      }

      addAlert(`Poisto epäonnistui: ${getErrorMessage(initialDeleteError)}`, "error", true)
      return
    }

    addAlert("Poistossa tapahtui virhe", "error")
  }

  const handleNewWorkplaceFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const confirmed = await confirm({
      title: 'Lisäys',
      description: `Oletko aivan varma, että haluat lisätä '${workplaceFormData.name}' työpaikan?`
    })

    if (confirmed) {
      await createWorkplace({ variables: { name: workplaceFormData.name } })
      setWorkplaceFormData(initWorkplaceFormData)

      addAlert("Työpaikka lisätty", "success")
      setDialogOpen(false)
    }
  }

  const handleEditWorkplaceFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const workplace = workplaces.find((workplace: WorkplaceWithJobSupervisorId) => workplace.id === workplaceFormData.id)

    if (workplace && workplace.jobSupervisors) {
      const jobSupervisorIds = workplace.jobSupervisors.map(jobSupervisor => jobSupervisor.id)

      const assignIds: string[] = workplaceFormData.jobSupervisorIds.filter(id => !jobSupervisorIds.includes(id))
      const unassignIds: string[] = jobSupervisorIds.filter(id => !workplaceFormData.jobSupervisorIds.includes(id))

      if (!assignIds.length && !unassignIds.length) {
        assignIds.push(...workplaceFormData.jobSupervisorIds)
      }

      await updateSupervisorAssigns({
        variables: {
          workplaceId: workplace.id,
          assignIds,
          unassignIds
        }
      })
    }

    await editWorkplace({ variables: { editWorkplaceId: workplaceFormData.id, name: workplaceFormData.name } })

    setDialogOpen(false)
    addAlert("Työpaikkaa muokattu", "success")
  }

  const handleNewJobSupervisorFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const confirmed = await confirm({
      title: "Luonti",
      description: `Oletko aivan varma, että haluat luoda työpaikkaohjaajan nimellä '${jobSupervisorFormData.firstName} ${jobSupervisorFormData.lastName}' ja sähköpostiosoitteella '${jobSupervisorFormData.email}'?`
    })
    if (confirmed) {
      const response = await createJobSupervisor({ variables: { jobSupervisor: jobSupervisorFormData } })
      if (!response.data.createJobSupervisor.success) {
        if (response.data.createJobSupervisor.status === 400) {
          return addAlert("Sähköpostiosoite on jo olemassa", "error")
        }
        addAlert("Työpaikkaohjaajan lisäämisessä tapahtui virhe", "error", true)

      }
      setJobSupervisorFormData(initJobSupervisorFormData)
      requestMagicLink({ variables: { email: jobSupervisorFormData.email } });
      setDialogOpen(false)
      if (response.data.createJobSupervisor.success) {
        addAlert("Uusi työpaikkaohjaaja luotu onnistuneesti", "success")
      }
    }
  }

  const handleEditJobSupervisorFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const confirmed = await confirm({
      title: "Muokkaus",
      description: `Oletko aivan varma, että haluat muokata työpaikkaohjaajaa?`
    })

    if (!confirmed) return

    try {
      const { id, ...jobSupervisorPayload } = jobSupervisorFormData
      const response = await editJobSupervisor({
        variables: { jobSupervisorId: id, jobSupervisor: jobSupervisorPayload }
      })
      setDialogOpen(false)
      if (response.data.editJobSupervisor.success) {
        return addAlert("Työpaikkaohjaajan muokkaus onnistui", "success")
      }
      addAlert("Työpaikkaohjaajan muokkauksessa tapahtui virhe", "error", true)
    } catch (editError) {
      addAlert(`Työpaikkaohjaajan muokkaus epäonnistui: ${getErrorMessage(editError)}`, "error", true)
    }
  }

  const handleShowNewWorkplaceForm = () => {
    setWorkplaceFormData(initWorkplaceFormData)
    setShowNewForm(true)
  }

  const handleShowEditForm = (id: number) => {
    setSelectedWorkplaceId(id)
    setShowEditForm(true)
  }

  const handleShowNewJobSupervisorForm = () => {
    setJobSupervisorFormData(initJobSupervisorFormData)
    setShowNewJobSupervisorForm(true)
  }

  const handleShowEditJobSupervisorForm = (id: string) => {
    setSelectedJobSupervisorId(id)
    setShowEditJobSupervisorForm(true)
  }

  const handleNavigateToWorkplaceDetails = (workplaceId?: string | null) => {
    if (!workplaceId) {
      addAlert("Työpaikan tietoja ei voi avata: puuttuva tunniste", "error")
      return
    }
    navigate(`/workplaces/${workplaceId}`)
  }

  const handleNavigateToJobSupervisorDetails = (jobSupervisorId?: string | null) => {
    if (!jobSupervisorId) {
      addAlert("Työpaikkaohjaajan tietoja ei voi avata: puuttuva tunniste", "error")
      return
    }
    navigate(`/jobsupervisors/${jobSupervisorId}`)
  }

  return (
    <>
      <div className="mx-2 mb-4 flex flex-wrap gap-2">
        <Button onClick={handleShowNewWorkplaceForm}>
          <Plus className="mr-2 h-4 w-4" />
          Lisää työpaikka
        </Button>
        <Button onClick={handleShowNewJobSupervisorForm}>
          <UserPlus className="mr-2 h-4 w-4" />
          Lisää uusi työpaikkaohjaaja
        </Button>
      </div>

      <Accordion type="single" collapsible value={expandedAccordion} onValueChange={setExpandedAccordion}>
        <AccordionItem value="workplaces">
          <AccordionTrigger className="px-4 text-base font-semibold">
            Työpaikat
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <DataTable<Workplace> headerCells={headerCells} data={workplaces}>
              {rows =>
                <TableBody>
                  {rows.map((workplace) => (
                    <TableRow key={workplace.id}>
                      <TableCell>{workplace.id}</TableCell>
                      <TableCell>{workplace.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {workplace.jobSupervisors?.length
                            ? workplace.jobSupervisors.map((supervisor) => (
                              <Button
                                key={supervisor.id}
                                variant="ghost"
                                size="sm"
                                className="h-auto px-2 py-1"
                                onClick={() => handleNavigateToJobSupervisorDetails(supervisor.id)}
                              >
                                {`${supervisor.firstName} ${supervisor.lastName}`}
                              </Button>
                            ))
                            : <span className="text-sm text-muted-foreground">Ei liitettyjä ohjaajia</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowEditForm(Number(workplace.id))}
                          >
                            <Pencil className="mr-1 h-3 w-3" />
                            Muokkaa
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNavigateToWorkplaceDetails(workplace.id)}
                          >
                            <Info className="mr-1 h-3 w-3" />
                            Tiedot
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(Number(workplace.id), workplace.name)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Poista
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>}
            </DataTable>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="jobSupervisors">
          <AccordionTrigger className="px-4 text-base font-semibold">
            Työpaikkaohjaajat
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <DataTable<JobSupervisorWithFullNameAndWorkplace> headerCells={jobSupervisorsHeaderCells} data={jobSupervisors}>
              {rows =>
                <TableBody>
                  {rows.map((jobSupervisor) => (
                    <TableRow key={jobSupervisor.id}>
                      <TableCell>{jobSupervisor.id}</TableCell>
                      <TableCell>{jobSupervisor.fullName}</TableCell>
                      <TableCell>
                        {jobSupervisor.workplace
                          ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto px-2 py-1"
                              onClick={() => handleNavigateToWorkplaceDetails(jobSupervisor.workplace?.id)}
                            >
                              {jobSupervisor.workplace.name}
                            </Button>
                          )
                          : ""}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowEditJobSupervisorForm(jobSupervisor.id)}
                          >
                            <Pencil className="mr-1 h-3 w-3" />
                            Muokkaa
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNavigateToJobSupervisorDetails(jobSupervisor.id)}
                          >
                            <Info className="mr-1 h-3 w-3" />
                            Tiedot
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleJobSupervisorDelete(jobSupervisor.id, jobSupervisor.fullName, jobSupervisor.workplace?.id)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Poista
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>}
            </DataTable>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <AppDialog
        title={
          showNewWorkplaceForm
            ? 'Lisää uusi työpaikka'
            : showEditWorkplaceForm
              ? 'Muokkaa työpaikkaa'
              : showNewJobSupervisorForm
                ? "Lisää uusi työpaikkaohjaaja"
                : showEditJobSupervisorForm
                  ? "Muokkaa työpaikkaohjaajaa" :
                  ""
        }
        open={dialogOpen}
        onClose={setDialogOpen}
      >
        {showNewWorkplaceForm ? (
          <WorkplaceForm
            formData={workplaceFormData}
            setFormData={setWorkplaceFormData}
            handleSubmit={handleNewWorkplaceFormSubmit}
            submitButtonTitle='Luo työpaikka'
          />
        ) : null}
        {showEditWorkplaceForm ? (
          <WorkplaceForm
            formData={workplaceFormData}
            setFormData={setWorkplaceFormData}
            handleSubmit={handleEditWorkplaceFormSubmit}
            submitButtonTitle='Muokkaa työpaikkaa'
            jobSupervisors={jobSupervisors}
          />
        ) : null}
        {showNewJobSupervisorForm ? (
          <JobSupervisorForm
            formData={jobSupervisorFormData}
            setFormData={setJobSupervisorFormData}
            handleSubmit={handleNewJobSupervisorFormSubmit}
            submitButtonTitle="Lisää työpaikkaohjaaja"
          />
        ) : null}
        {showEditJobSupervisorForm ? (
          <JobSupervisorForm
            formData={jobSupervisorFormData}
            setFormData={setJobSupervisorFormData}
            handleSubmit={handleEditJobSupervisorFormSubmit}
            submitButtonTitle="Muokkaa työpaikkaohjaaja"
          />
        ) : null}
      </AppDialog>
      <ConfirmDialog />
    </>
  )
}

export default Workplaces
