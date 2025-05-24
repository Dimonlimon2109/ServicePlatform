import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import CatalogPage from "./pages/CatalogPage.tsx";
import ServiceDetailsPage from "./pages/ServiceDetailsPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import ManageServicePage from "./pages/ManageServicePage.tsx";
import UserServicesPage from "./pages/UserServicesPage.tsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BookingsPage from './pages/BookingsPage.tsx';
import ServiceBookingsPage from './pages/ServiceBookingsPage.tsx';
import ChatPage from './pages/ChatPage.tsx';
import UsersPage from "./pages/UsersPage.tsx";
import FavoritesPage from "./pages/FavoritesPage.tsx";
import Header from "./components/Header.tsx";

function App() {
    return (
        <BrowserRouter>
            <Header />
                <Routes>
                    <Route path="/" element={<CatalogPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="services/:id" element={<ServiceDetailsPage/>} />
                    <Route path="services/create" element={<ManageServicePage/>} />
                    <Route path="services/edit/:id" element={<ManageServicePage/>} />
                    <Route path="services/my" element={<UserServicesPage/>} />
                    <Route path="profile" element={<ProfilePage/>}/>
                    <Route path="users/:id" element={<ProfilePage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/bookings" element={<BookingsPage />} />
                    <Route path="/services/:id/bookings" element={<ServiceBookingsPage />} />
                    <Route path="/chat/:id" element={<ChatPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                </Routes>
            <ToastContainer position="top-right" autoClose={3000}/>
        </BrowserRouter>
    );
}

export default App;
