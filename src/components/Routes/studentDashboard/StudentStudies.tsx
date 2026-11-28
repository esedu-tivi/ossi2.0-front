import { useQuery } from '@apollo/client';
import { GET_MY_STUDY_PLAN } from '@/graphql/GetStudyPlan';
import StudyPlan from '@/components/StudyPlan/StudyPlan';

// The logged-in student's own study plan ("Omat opinnot").
const StudentStudies = () => {
  const { data, loading, error } = useQuery(GET_MY_STUDY_PLAN, { fetchPolicy: 'cache-and-network' });

  if (loading && !data) return <p className="p-4">Ladataan opintoja...</p>;
  if (error) return <p className="p-4 text-destructive">Opintojen haku epäonnistui: {error.message}</p>;

  const student = data?.me?.user;
  if (!student) return <p className="p-4">Opintotietoja ei löytynyt.</p>;

  return <StudyPlan student={student} />;
};

export default StudentStudies;
