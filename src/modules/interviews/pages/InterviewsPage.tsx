import { AppState } from "@app/core/store/store";
import { ITButton, ITDialog, ITLoader, ITTable } from "@axzydev/axzy_ui_system";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FaEdit, FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "@app/core/store/toast/toast.slice";
import { InterviewForm } from "../components/InterviewForm";
import { createInterview, getInterviews, Interview, updateInterview } from "../service/interviews.service";

const InterviewsPage = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state: AppState) => state.auth);

  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);

  const fetchInterviews = async () => {
    setLoading(true);
    const res = await getInterviews();
    if (res.success && res.data) {
        setInterviews(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleCreate = async (data: any) => {
    // Inject the interviewerId as the current user's ID
    const payload = { ...data, interviewerId: (user as any)?.user?.id };
    const res = await createInterview(payload);
    
    if (res.success) {
       dispatch(showToast({ message: "Entrevista agendada correctamente", type: "success" }));
       setIsModalOpen(false);
       fetchInterviews();
    } else {
       dispatch(showToast({ message: res.messages?.[0] || "Error al agendar entrevista", type: "error" }));
    }
  };

  const handleEdit = async (data: any) => {
      if (!editingInterview) return;
      const res = await updateInterview(editingInterview.id, data);
      if (res.success) {
          dispatch(showToast({ message: "Entrevista actualizada exitosamente", type: "success" }));
          setEditingInterview(null);
          fetchInterviews();
      } else {
          dispatch(showToast({ message: res.messages?.[0] || "Error al actualizar", type: "error" }));
      }
  };

  if (loading) return <div className="flex justify-center p-10"><ITLoader /></div>;

  return (
    <div className="p-6 bg-[#f6fbf4] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-[#1b1b1f] tracking-tight">Entrevistas</h1>
           <p className="text-[#54634d] text-sm mt-1">Gestión y programación de entrevistas</p>
        </div>
        {user?.role !== "OPERATOR" && (
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-[#065911] text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-[#086f16] transition-colors"
            >
                <FaPlus className="text-xs" />
                <span>Agendar Entrevista</span>
            </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e1e4d5] overflow-hidden">
        <ITTable
            data={interviews as any[]}
            columns={[
                { key: "id", label: "ID", type: "number", sortable: true },
                { 
                    key: "applicant", 
                    label: "Candidato", 
                    type: "string",
                    render: (row: Interview) => (
                        <div className="font-bold text-[#1b1b1f]">
                            {row.applicant?.firstName} {row.applicant?.lastName}
                        </div>
                    )
                },
                { 
                    key: "vacancy", 
                    label: "Vacante", 
                    type: "string",
                    render: (row: Interview) => (
                        <span className="text-sm text-gray-600">{row.vacancy?.title}</span>
                    )
                },
                { 
                    key: "scheduledAt", 
                    label: "Fecha y Hora", 
                    type: "string",
                    sortable: true,
                    render: (row: Interview) => (
                        <span className="text-sm font-medium">{dayjs(row.scheduledAt).format("DD/MM/YYYY HH:mm")}</span>
                    )
                },
                { 
                    key: "status",
                    label: "Estado",
                    type: "string",
                    render: (row: Interview) => {
                        const colors: any = {
                           SCHEDULED: "bg-blue-100 text-blue-800",
                           COMPLETED: "bg-green-100 text-green-800",
                           CANCELLED: "bg-red-100 text-red-800",
                           NO_SHOW: "bg-gray-200 text-gray-800",
                        };
                        return (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[row.status]}`}>
                             {row.status}
                          </span>
                        );
                    }
                },
                {
                    key: "actions",
                    label: "Acciones",
                    type: "actions",
                    actions: (row: Interview) => (
                        <div className="flex items-center gap-2">
                             {user?.role !== "OPERATOR" && (
                                <ITButton
                                    onClick={() => setEditingInterview(row)}
                                    size="small"
                                    variant="ghost"
                                    className="!p-2 text-slate-500 hover:text-slate-700"
                                    title="Editar / Actualizar Estado"
                                >
                                    <FaEdit />
                                </ITButton>
                             )}
                        </div>
                    )
                }
            ]}
            itemsPerPageOptions={[10, 20]}
            defaultItemsPerPage={10}
            title=""
        />
      </div>

      <ITDialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agendar Entrevista">
        <InterviewForm onSubmit={handleCreate} onCancel={() => setIsModalOpen(false)} />
      </ITDialog>

      <ITDialog isOpen={!!editingInterview} onClose={() => setEditingInterview(null)} title="Actualizar Entrevista">
        {editingInterview && (
            <InterviewForm 
                initialData={editingInterview}
                onSubmit={handleEdit} 
                onCancel={() => setEditingInterview(null)} 
            />
        )}
      </ITDialog>
    </div>
  );
};

export default InterviewsPage;
