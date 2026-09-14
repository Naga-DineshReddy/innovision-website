import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';
import Toast from './components/ui/Toast';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Team from './pages/Team';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Gallery from './pages/Gallery';
import GalleryView from './pages/GalleryView';
import Contact from './pages/Contact';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ManageEvents from './pages/admin/ManageEvents';
import ManageRegistrations from './pages/admin/ManageRegistrations';
import ManageBanners from './pages/admin/ManageBanners';
import ManageGallery from './pages/admin/ManageGallery';
import ManageTeam from './pages/admin/ManageTeam';
import ManageMessages from './pages/admin/ManageMessages';
import Settings from './pages/admin/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toast />
          <Routes>
            {/* Public Routes */}
            <Route element={<MainLayout><Home /></MainLayout>} path="/" />
            <Route element={<MainLayout><About /></MainLayout>} path="/about" />
            <Route element={<MainLayout><Team /></MainLayout>} path="/team" />
            <Route element={<MainLayout><Events /></MainLayout>} path="/events" />
            <Route element={<MainLayout><EventDetails /></MainLayout>} path="/events/:id" />
            <Route element={<MainLayout><Gallery /></MainLayout>} path="/gallery" />
            <Route element={<MainLayout><GalleryView /></MainLayout>} path="/gallery/:eventId" />
            <Route element={<MainLayout><Contact /></MainLayout>} path="/contact" />

            {/* Admin Login (no layout) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
            <Route path="/admin/events" element={<AdminLayout><ManageEvents /></AdminLayout>} />
            <Route path="/admin/registrations" element={<AdminLayout><ManageRegistrations /></AdminLayout>} />
            <Route path="/admin/banners" element={<AdminLayout><ManageBanners /></AdminLayout>} />
            <Route path="/admin/gallery" element={<AdminLayout><ManageGallery /></AdminLayout>} />
            <Route path="/admin/team" element={<AdminLayout><ManageTeam /></AdminLayout>} />
            <Route path="/admin/messages" element={<AdminLayout><ManageMessages /></AdminLayout>} />
            <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
