import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { LabProvider } from './contexts/LabContext';
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
                                    <Route path="/signin" element={<SignIn />} />
                                    <Route path="/profile-setup" element={<ProfileSetup />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/labs" element={<Laboratories />} />
                                    <Route path="/admin" element={<AdminLogin />} />
                                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                    <Route path="/cabinet" element={<CabinetOverview />} />
                                    <Route path="/cabinet/laboratory" element={<CabinetLaboratory />} />
                                    <Route path="/cabinet/payment" element={<CabinetPayment />} />
                                    <Route path="/cabinet/library" element={<CabinetLibrary />} />
                                    <Route path="/cabinet/study-plan" element={<CabinetStudyPlan />} />
                                    <Route path="/cabinet/simulations" element={<CabinetSimulations />} />
                                    <Route path="/cabinet/editor" element={<CabinetEditor />} />
                                    <Route path="/cabinet/certificates" element={<CabinetCertificates />} />
                                    <Route path="/cabinet/data" element={<CabinetData />} />
                                    <Route path="/cabinet/marketplace" element={<CabinetMarketplace />} />
                                    <Route path="/teacher" element={<TeacherOverview />} />
                                    <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                                    <Route path="/teacher/video" element={<TeacherVideo />} />
                                    <Route path="/teacher/quiz" element={<TeacherQuiz />} />
                                    <Route path="/teacher/pricing" element={<TeacherPricing />} />
                                    <Route path="/teacher/resources" element={<TeacherResources />} />
                                    <Route path="/teacher/laboratory" element={<TeacherLaboratory />} />
                                    <Route path="/teacher/students" element={<TeacherStudents />} />
                                    <Route path="/teacher/earnings" element={<TeacherEarnings />} />
                                    <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
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
