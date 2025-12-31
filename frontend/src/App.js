import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { CompareProvider } from "./context/CompareContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./components/pages/HomePage";
import VehiclesPage from "./components/pages/VehiclesPage";
import VehicleDetailPage from "./components/pages/VehicleDetailPage";
import ComparePage from "./components/pages/ComparePage";
import FavoritesPage from "./components/pages/FavoritesPage";
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import AdminPage from "./components/pages/AdminPage";
import NewsPage from "./components/pages/NewsPage";
import NewsDetailPage from "./components/pages/NewsDetailPage";
import BlogPage from "./components/pages/BlogPage";
import BlogDetailPage from "./components/pages/BlogDetailPage";
import GaragePage from "./components/pages/GaragePage";
import MyGaragePage from "./components/pages/MyGaragePage";
import UserGaragePage from "./components/pages/UserGaragePage";
import GarageVehicleDetailPage from "./components/pages/GarageVehicleDetailPage";
import SmartAdvisorPage from "./components/pages/SmartAdvisorPage";
import ProfilePage from "./components/pages/ProfilePage";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Snowfall from "./components/layout/Snowfall";
import BackgroundShapes from "./components/layout/BackgroundShapes";
import ChristmasDecorations from "./components/layout/ChristmasDecorations";
import "./styles/christmas.css";
import "./styles/garage.css";

const AppContent = () => (
  <div className="App min-h-screen flex flex-col">
    <BackgroundShapes />
    <Snowfall />
    <ChristmasDecorations />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route
        path="*"
        element={
          <>
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/vehicles" element={<VehiclesPage />} />
                <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:id" element={<NewsDetailPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:id" element={<BlogDetailPage />} />
                <Route path="/garage" element={<GaragePage />} />
                <Route path="/garage/my" element={<MyGaragePage />} />
                <Route path="/garage/user/:userId" element={<UserGaragePage />} />
                <Route path="/garage/vehicle/:vehicleId" element={<GarageVehicleDetailPage />} />
                <Route path="/ai-asistan" element={<SmartAdvisorPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </main>
            <Footer />
          </>
        }
      />
    </Routes>
  </div>
);

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CompareProvider>
          <BrowserRouter>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </BrowserRouter>
        </CompareProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
