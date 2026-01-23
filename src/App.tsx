import { useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useAuth } from './utils/auth-context';
import { USER_SETUP } from './graphql/UserSetup';

import TeacherDashboard from './components/Routes/teacherDashboard';
import StudentDashboard from './components/Routes/studentDashboard';
import ProtectedRoute from './ProtectedRoute';
import Login from './components/Login';
import TeacherProjectsView from './components/Routes/TeacherProjectsView';
import CreateProject from './components/Routes/CreateProject';
import ProjectDetails from './components/Routes/ProjectDetails';
import EditProject from './components/Routes/EditProject';
import QualificationUnitPartList from './components/QualificationUnitPartList';
import QualificationUnitPartDetails from './components/Routes/QualificationUnitPartDetails';
import CreatePart from './components/Routes/CreatePart';
import EditPart from './components/Routes/EditPart';
import ReorderParts from './components/Routes/ReorderParts';
import NewUserLogin from './components/Routes/NewUserLogin';
import Workplaces from './components/Routes/Workplaces';
import StudentInfo from './components/Routes/StudentInfo';
import Workplace from './components/Routes/Workplace';
import JobSupervisor from './components/Routes/JobSupervisor';
import Layout from './components/Layout';

const App = () => {
    const { isAuthenticated, userEmail, role } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const hasRedirectedRef = useRef(false);
    const [postLoginLoading, setPostLoginLoading] = useState(true);

    const { data: studentData, loading: studentLoading, refetch } = useQuery(USER_SETUP, {
        skip: !isAuthenticated,
        fetchPolicy: 'network-only',
    });

    useEffect(() => {
        if (!isAuthenticated) return;

        if (!studentLoading && studentData) {
            const timer = setTimeout(() => {
                setPostLoginLoading(false);
            }, 800); // Wait 800ms to settle down after studentData ready

            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, studentLoading, studentData]);

    // Prevent redirects if the user is already on a valid route.
    useEffect(() => {
        if (hasRedirectedRef.current) return;
        if (!isAuthenticated) return;
        if (studentLoading) return;
        if (!studentData || typeof studentData.amISetUp?.amISetUp !== 'boolean') return;

        const isTeacher = role === 'teacher';
        const isStudent = role === 'student';

        const isSetUp = studentData?.amISetUp?.amISetUp;

        if (
            isTeacher &&
            !location.pathname.startsWith('/teacherdashboard') &&
            !location.pathname.startsWith('/teacherprojects') &&
            !location.pathname.startsWith('/qualificationunitparts')
        ) {
            console.log('Redirecting to /teacherdashboard');
            navigate('/teacherdashboard');
            hasRedirectedRef.current = true;
        } else if (isStudent && !isSetUp && location.pathname !== '/studentdashboard/newuserlogin') {
            navigate('/studentdashboard/newuserlogin');
            hasRedirectedRef.current = true;
        } else if (isStudent && isSetUp && location.pathname !== '/studentdashboard') {
            navigate('/studentdashboard');
            hasRedirectedRef.current = true;
        }
    }, [studentLoading, isAuthenticated, userEmail, studentData, location.pathname, navigate]);

    // Loading screen while data is fetched
    if (isAuthenticated && (studentLoading || !studentData || postLoginLoading)) {
        refetch()
        return (
            <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <div className="bounce-spinner">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <p style={{ marginTop: '1rem' }}>Ladataan käyttäjän tietoja...</p>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Login />} />

            <Route
                path="/studentdashboard/newuserlogin"
                element={
                    <ProtectedRoute
                        element={<NewUserLogin />}
                    />
                }
            />

            <Route
                path="/teacherdashboard"
                element={
                    <ProtectedRoute
                        allowedRoles={["teacher"]}
                        element={
                            <Layout>
                                <TeacherDashboard />
                            </Layout>
                        }
                    />
                }
            />
            <Route
                path="/studentdashboard"
                element={
                    <ProtectedRoute
                        element={
                            <Layout>
                                <StudentDashboard />
                            </Layout>
                        }
                    />
                }
            />
            <Route
                path="/teacherprojects"
                element={
                    <ProtectedRoute
                        element={
                            <Layout>
                                <TeacherProjectsView />
                            </Layout>
                        }
                    />
                }
            />
            <Route
                path="/teacherprojects/new"
                element={
                    <ProtectedRoute
                        allowedRoles={["teacher"]}
                        element={
                            <Layout>
                                <CreateProject />
                            </Layout>
                        }
                    />
                }
            />
            <Route
                path="/teacherprojects/edit/:projectId"
                element={
                    <ProtectedRoute
                        allowedRoles={["teacher"]}
                        element={
                            <Layout>
                                <EditProject />
                            </Layout>
                        }
                    />
                }
            />
            <Route
                path="/teacherprojects/:projectId"
                element={
                    <ProtectedRoute
                        allowedRoles={["teacher"]}
                        element={
                            <Layout>
                                <ProjectDetails />
                            </Layout>
                        }
                    />
                }
            />
            <Route
                path="/qualificationunitparts"
                element={
                    <ProtectedRoute
                        element={
                            <Layout>
                                <QualificationUnitPartList />
                            </Layout>
                        }
                    />
                }
            />
            <Route
                path="/qualificationunitparts/:partId"
                element={
                    <ProtectedRoute
                        element={
                            <Layout>
                                <QualificationUnitPartDetails />
                            </Layout>
                        }
                    />
                }
            />
            <Route
                path="/qualificationunitparts/new"
                element={
                    <ProtectedRoute
                        element={
                            <Layout>
                                <CreatePart />
                            </Layout>
                        }
                    />
                }
            />
            <Route
                path="/qualificationunitparts/edit/:partId"
                element={
                    <ProtectedRoute
                        element={
                            <Layout>
                                <EditPart />
                            </Layout>
                        }
                    />
                }
            />
            <Route
                path="/teacherdashboard/reorderparts"
                element={
                    <ProtectedRoute
                        element={
                            <Layout>
                                <ReorderParts />
                            </Layout>
                        }
                    />
                }
            />
            <Route
                path="/teacherdashboard/students/:studentId"
                element={
                    <ProtectedRoute
                        allowedRoles={["teacher"]}
                        element={
                            <Layout>
                                <StudentInfo />
                            </Layout>
                        }
                    />
                }
            />
            <Route
                path="/workplaces"
                element={
                    <ProtectedRoute
                        allowedRoles={["teacher"]}
                        element={
                            <Layout>
                                <Workplaces />
                            </Layout>
                        }
                    />
                }
            />
            <Route
                path="/workplaces/:id"
                element={
                    <ProtectedRoute
                        allowedRoles={["teacher"]}
                        element={
                            <Layout>
                                <Workplace />
                            </Layout>
                        }
                    />
                }
            />
            <Route
                path="/jobsupervisors/:id"
                element={
                    <ProtectedRoute
                        allowedRoles={["teacher"]}
                        element={
                            <Layout>
                                <JobSupervisor />
                            </Layout>
                        }
                    />
                }
            />

        </Routes>
    );
};

export default App;
