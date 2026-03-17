import { showToast } from "@app/core/store/toast/toast.slice";
import { ITLoader } from "@axzydev/axzy_ui_system";
import { useEffect, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { VacancyForm } from "../components/VacancyForm";
import { createVacancy, getVacancyById, updateVacancy, Vacancy } from "../service/vacancies.service";

const VacancyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [vacancy, setVacancy] = useState<Vacancy | null>(location.state?.initialData || null);
  const [loading, setLoading] = useState(!!id && !location.state?.initialData);

  useEffect(() => {
    if (id) {
      const fetchVacancy = async () => {
        const res = await getVacancyById(Number(id));
        if (res.success && res.data) {
          setVacancy(res.data);
        } else {
          dispatch(showToast({ message: "No se pudo cargar la vacante", type: "error" }));
          navigate("/vacancies");
        }
        setLoading(false);
      };
      fetchVacancy();
    }
  }, [id, navigate, dispatch]);

  const handleSave = async (values: any, status: string = "DRAFT") => {
    const payload = { ...values, status };
    try {
      if (id) {
        const res = await updateVacancy(Number(id), payload);
        if (res.success) {
          dispatch(showToast({ message: status === "ACTIVE" ? "Vacante publicada" : "Borrador guardado", type: "success" }));
          if (status === "ACTIVE") navigate("/vacancies");
        }
      } else {
        const res = await createVacancy(payload);
        if (res.success && res.data) {
          dispatch(showToast({ message: "Vacante iniciada como borrador", type: "success" }));
          navigate(`/vacancies/edit/${res.data.id}`);
        }
      }
    } catch (error) {
      dispatch(showToast({ message: "Error al guardar la vacante", type: "error" }));
    }
  };

  if (loading) return <div className="flex justify-center p-20"><ITLoader /></div>;

  return (
    <div className="p-6 bg-[#f6fbf4] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate("/vacancies")}
            className="p-2 hover:bg-white rounded-full transition-colors text-slate-600"
          >
            <FaChevronLeft />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#1b1b1f] tracking-tight">
              {id ? "Editar Vacante" : "Nueva Vacante"}
            </h1>
            <p className="text-[#54634d] text-sm mt-1">
              {id ? `Editando borrador #${id}` : "Completa la información para tu nueva vacante"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#e1e4d5] overflow-hidden p-2">
          <VacancyForm 
            initialData={vacancy || undefined} 
            onSubmit={(values) => handleSave(values, "ACTIVE")}
            onCancel={() => navigate("/vacancies")}
            isPage={true}
            onSaveDraft={(values) => handleSave(values, "DRAFT")}
          />
        </div>
      </div>
    </div>
  );
};

export default VacancyDetailPage;
