import { useQuery } from '@apollo/client';
import { GET_STUDENT_STUDY_PLAN } from '@/graphql/GetStudyPlan';
import StudyPlan from './StudyPlan';
import StudyPlanEditor from './StudyPlanEditor';

// A student's study plan for a teacher (StudentInfo > HOKS), with the controls
// for changing the student's path.
const StudentStudyPlan = ({ studentId }: { studentId: string }) => {
  const { data, loading, error } = useQuery(GET_STUDENT_STUDY_PLAN, {
    variables: { studentId },
    fetchPolicy: 'cache-and-network',
  });

  if (loading && !data) return <p className="p-4">Ladataan opintosuunnitelmaa...</p>;
  if (error) return <p className="p-4 text-destructive">Opintosuunnitelman haku epäonnistui: {error.message}</p>;

  const student = data?.student?.student;
  if (!student) return <p className="p-4">Opiskelijaa ei löytynyt.</p>;

  return (
    <div className="space-y-4">
      <StudyPlanEditor student={student} />
      <StudyPlan student={student} />
    </div>
  );
};

export default StudentStudyPlan;
