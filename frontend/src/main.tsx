import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home.tsx";
import Pricing from "./pages/Pricing.tsx";
import Solutions from "./pages/Solutions.tsx";
import Integrations from "./pages/Integrations.tsx";
import Resources from "./pages/Resources.tsx";
import Docs from "./pages/Docs.tsx";
import BookDemo from "./pages/BookDemo.tsx";
import Login from "./pages/Login.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Register from "./pages/Register.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Support from "./pages/Support.tsx";
import Summarize from "./pages/Summarize";
import PersonalHome from "./pages/PersonalHome";
import AboutPersonal from "./pages/AboutPersonal";
import ProjectsPersonal from "./pages/ProjectsPersonal";
import ContactPersonal from "./pages/ContactPersonal";
import HowItWorks from "./pages/HowItWorks";
import OauthCallback from "./pages/OauthCallback";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import PageShell from "./components/PageShell";
import "./index.css";
import { useEffect, useState } from "react";
import OnboardingModal from "./components/OnboardingModal";

function RootApp() {
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  useEffect(() => {
    const handler = () => setShowOnboardingModal(true);
    window.addEventListener('openOnboardingModal', handler as EventListener);
    return () => window.removeEventListener('openOnboardingModal', handler as EventListener);
  }, []);

  return (
    <>
      <Navbar />
      <PageShell>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<App />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing" element={<Pricing />} />
  <Route path="/oauth-callback" element={<OauthCallback />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/docs" element={<Docs />} />
  <Route path="/book-demo" element={<BookDemo />} />
  <Route path="/summarize" element={<Summarize />} />
  <Route path="/personal" element={<PersonalHome />} />
  <Route path="/personal/about" element={<AboutPersonal />} />
  <Route path="/personal/projects" element={<ProjectsPersonal />} />
  <Route path="/personal/contact" element={<ContactPersonal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/support" element={<Support />} />
        </Routes>
      </PageShell>
      <Footer />
      {showOnboardingModal && <OnboardingModal isOpen={showOnboardingModal} onClose={() => setShowOnboardingModal(false)} />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <RootApp />
    </BrowserRouter>
  </React.StrictMode>
);
