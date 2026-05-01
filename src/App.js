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
