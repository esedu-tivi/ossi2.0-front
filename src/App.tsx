import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import TeacherDashboard from './components/Routes/teacherDashboard';
import StudentDashboard from './components/Routes/studentDashboard';
import { useAuth } from './utils/auth-context';
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

const App = () => {
    const { isAuthenticated, userEmail } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Prevent redirects if the user is already on a valid route.
    useEffect(() => {
        if (isAuthenticated) {
            console.log('Current location:', location.pathname);

            const isTeacherRoute = userEmail.endsWith('@esedulainen.fi');
            const isStudentRoute = userEmail.endsWith('@esedu.fi');

            if (
                isTeacherRoute &&
                !location.pathname.startsWith('/teacherdashboard') &&
                !location.pathname.startsWith('/teacherprojects') &&
                !location.pathname.startsWith('/qualificationunitparts')
            ) {
                console.log('Redirecting to /teacherdashboard');
                navigate('/teacherdashboard');
            } else if (isStudentRoute && !location.pathname.startsWith('/studentdashboard')) {
                console.log('Redirecting to /studentdashboard');
                navigate('/studentdashboard');
            }
        }
    }, [isAuthenticated, userEmail, navigate, location]);

    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route
                path="/teacherdashboard"
                element={
                    <ProtectedRoute
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
                        element={
                            <AppLayout>
                                <EditStudies />
                            </AppLayout>
                        }
                    />
                }
            />
        </Routes>
    );
};

export default App;
