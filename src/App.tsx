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
import AppLayout from './components/AppLayout';
import ProjectDetails from './components/Routes/ProjectDetails';
import EditProject from './components/Routes/EditProject';
import QualificationUnitPartList from './components/QualificationUnitPartList';
import QualificationUnitPartDetails from './components/Routes/QualificationUnitPartDetails';
import CreatePart from './components/Routes/CreatePart';
import EditPart from './components/Routes/EditPart';
import EditStudies from './components/Routes/EditStudies';
import EducationPath from './components/Routes/EducationPath';
import ReorderParts from './components/Routes/ReorderParts';
import NewUserLogin from './components/Routes/NewUserLogin';

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
        if (isAuthenticated) {
            refetch();
        }
    }, [isAuthenticated, refetch]);

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
        if (!studentData || typeof studentData.amISetUp !== 'boolean') return;

        const isTeacher = role === 'teacher';
        const isStudent = role === 'student';

        const isSetUp = studentData?.amISetUp;

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
                            <AppLayout>
                                <TeacherDashboard />
                            </AppLayout>
                        }
                    />
                }
            />
            <Route
                path="/studentdashboard"
                element={
                    <ProtectedRoute
                        element={
                            <AppLayout>
                                <StudentDashboard />
                            </AppLayout>
                        }
                    />
                }
            />
            <Route
                path="/teacherprojects"
                element={
                    <ProtectedRoute
                        element={
                            <AppLayout>
                                <TeacherProjectsView />
                            </AppLayout>
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
                            <AppLayout>
                                <CreateProject />
                            </AppLayout>
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
                            <AppLayout>
                                <EditProject />
                            </AppLayout>
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
                            <AppLayout>
                                <ProjectDetails />
                            </AppLayout>
                        }
                    />
                }
            />
            <Route
                path="/qualificationunitparts"
                element={
                    <ProtectedRoute
                        element={
                            <AppLayout>
                                <QualificationUnitPartList />
                            </AppLayout>
                        }
                    />
                }
            />
            <Route
                path="/qualificationunitparts/:partId"
                element={
                    <ProtectedRoute
                        element={
                            <AppLayout>
                                <QualificationUnitPartDetails />
                            </AppLayout>
                        }
                    />
                }
            />
            <Route
                path="/qualificationunitparts/new"
                element={
                    <ProtectedRoute
                        element={
                            <AppLayout>
                                <CreatePart />
                            </AppLayout>
                        }
                    />
                }
            />
            <Route
                path="/qualificationunitparts/edit/:partId"
                element={
                    <ProtectedRoute
                        element={
                            <AppLayout>
                                <EditPart />
                            </AppLayout>
                        }
                    />
                }
            />
            <Route
                path="/teacherdashboard/teacherstudies"
                element={
                    <ProtectedRoute
                        allowedRoles={["teacher"]}
                        element={
                            <AppLayout>
                                <EditStudies />
                            </AppLayout>
                        }
                    />
                }
            />
            <Route
                path="/teacherdashboard/educationpath"
                element={
                    <ProtectedRoute
                        allowedRoles={["teacher"]}
                        element={
                            <AppLayout>
                                <EducationPath />
                            </AppLayout>
                        }
                    />
                }
            />
            <Route
                path="/teacherdashboard/reorderparts"
                element={
                    <ProtectedRoute
                        element={
                            <AppLayout>
                                <ReorderParts />
                            </AppLayout>
                        }
                    />
                }
            />
        </Routes>
    );
};

export default App;
