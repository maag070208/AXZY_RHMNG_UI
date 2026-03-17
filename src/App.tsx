import LoginPage from "@app/modules/auth/pages/LoginPage";
import RegisterPage from "@app/modules/auth/pages/RegisterPage";
import { ITLoader } from "@axzydev/axzy_ui_system";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { PrivateRoutes } from "./core/routes/PrivateRoutes";
import { setAuth } from "./core/store/auth/auth.slice";
import HomePage from "./modules/home/pages/HomePage";
import UsersPage from "./modules/users/pages/UsersPage";

import VacanciesPage from "./modules/vacancies/pages/VacanciesPage";
import VacancyDetailPage from "./modules/vacancies/pages/VacancyDetailPage";
import ApplicantsPage from "./modules/applicants/pages/ApplicantsPage";
import VacancyApplicantsPage from "./modules/applicants/pages/VacancyApplicantsPage";
import InterviewsPage from "./modules/interviews/pages/InterviewsPage";
import CalendarPage from "./modules/calendar/pages/CalendarPage";

// Public route for QR scanner application
import ApplyPage from "./modules/applicants/pages/ApplyPage";

function App() {
  const token = useSelector((state: any) => state.auth.token);
  const dispatch = useDispatch();

  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeunload", () => {});
    window.addEventListener("unload", handleTabClosing);
    return () => {
      window.removeEventListener("beforeunload", () => {});
      window.removeEventListener("unload", handleTabClosing);
    };
  });

  const handleTabClosing = () => {
    localStorage.setItem("token", token);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken && storedToken !== "null") {
      dispatch(setAuth(storedToken));
    }
    setIsAppReady(true);
  }, [dispatch]);

  if (!isAppReady) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <ITLoader size="lg" />
      </div>
    );
  }

  // Rutas públicas que se pueden visualizar SIN tener sesión
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Landing para escanear QR */}
      <Route path="/apply/:qrToken" element={<ApplyPage />} />

      {/* Rutas Privadas */}
      {token ? (
        <Route element={<PrivateRoutes />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/vacancies" element={<VacanciesPage />} />
          <Route path="/vacancies/new" element={<VacancyDetailPage />} />
          <Route path="/vacancies/edit/:id" element={<VacancyDetailPage />} />
          <Route path="/vacancies/:id/applicants" element={<VacancyApplicantsPage />} />
          <Route path="/applicants" element={<ApplicantsPage />} />
          <Route path="/interviews" element={<InterviewsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
}

export default App;

