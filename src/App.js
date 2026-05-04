import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { LabProvider } from './contexts/LabContext';
import { ProtectedRoute, OnboardingRoute, PublicRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Demo from './pages/Demo';
import SignIn from './pages/SignIn';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Laboratories from './pages/Laboratories';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import CabinetOverview from './pages/cabinet/CabinetOverview';
import CabinetLaboratory from './pages/cabinet/CabinetLaboratory';
import CabinetPayment from './pages/cabinet/CabinetPayment';
import CabinetLibrary from './pages/cabinet/CabinetLibrary';
import CabinetStudyPlan from './pages/cabinet/CabinetStudyPlan';
import CabinetSimulations from './pages/cabinet/CabinetSimulations';
import CabinetEditor from './pages/cabinet/CabinetEditor';
import CabinetCertificates from './pages/cabinet/CabinetCertificates';
import CabinetData from './pages/cabinet/CabinetData';
import CabinetMarketplace from './pages/cabinet/CabinetMarketplace';
import TeacherOverview from './pages/teacher/TeacherOverview';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherVideo from './pages/teacher/TeacherVideo';
import TeacherQuiz from './pages/teacher/TeacherQuiz';
import TeacherPricing from './pages/teacher/TeacherPricing';
import TeacherResources from './pages/teacher/TeacherResources';
import TeacherLaboratory from './pages/teacher/TeacherLaboratory';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherEarnings from './pages/teacher/TeacherEarnings';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AuthProvider>
                    <AdminProvider>
                        <LabProvider>
                            <Router>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/demo" element={<Demo />} />
                                    <Route path="/signin" element={
                                        <PublicRoute>
                                            <SignIn />
                                        </PublicRoute>
                                    } />
                                    <Route path="/profile-setup" element={
                                        <OnboardingRoute>
                                            <ProfileSetup />
                                        </OnboardingRoute>
                                    } />
                                    <Route path="/dashboard" element={
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/profile" element={
                                        <ProtectedRoute>
                                            <Profile />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/labs" element={
                                        <ProtectedRoute>
                                            <Laboratories />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/admin" element={<AdminLogin />} />
                                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                    <Route path="/cabinet" element={
                                        <ProtectedRoute>
                                            <CabinetOverview />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/cabinet/laboratory" element={
                                        <ProtectedRoute>
                                            <CabinetLaboratory />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/cabinet/payment" element={
                                        <ProtectedRoute>
                                            <CabinetPayment />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/cabinet/library" element={
                                        <ProtectedRoute>
                                            <CabinetLibrary />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/cabinet/study-plan" element={
                                        <ProtectedRoute>
                                            <CabinetStudyPlan />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/cabinet/simulations" element={
                                        <ProtectedRoute>
                                            <CabinetSimulations />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/cabinet/editor" element={
                                        <ProtectedRoute>
                                            <CabinetEditor />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/cabinet/certificates" element={
                                        <ProtectedRoute>
                                            <CabinetCertificates />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/cabinet/data" element={
                                        <ProtectedRoute>
                                            <CabinetData />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/cabinet/marketplace" element={
                                        <ProtectedRoute>
                                            <CabinetMarketplace />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/teacher" element={
                                        <ProtectedRoute>
                                            <TeacherOverview />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/teacher/dashboard" element={
                                        <ProtectedRoute>
                                            <TeacherDashboard />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/teacher/video" element={
                                        <ProtectedRoute>
                                            <TeacherVideo />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/teacher/quiz" element={
                                        <ProtectedRoute>
                                            <TeacherQuiz />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/teacher/pricing" element={
                                        <ProtectedRoute>
                                            <TeacherPricing />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/teacher/resources" element={
                                        <ProtectedRoute>
                                            <TeacherResources />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/teacher/laboratory" element={
                                        <ProtectedRoute>
                                            <TeacherLaboratory />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/teacher/students" element={
                                        <ProtectedRoute>
                                            <TeacherStudents />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/teacher/earnings" element={
                                        <ProtectedRoute>
                                            <TeacherEarnings />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/teacher/analytics" element={
                                        <ProtectedRoute>
                                            <TeacherAnalytics />
                                        </ProtectedRoute>
                                    } />
                                </Routes>
                            </Router>
                        </LabProvider>
                    </AdminProvider>
                </AuthProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;
