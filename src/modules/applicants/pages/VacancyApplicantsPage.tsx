import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ITButton, ITLoader, ITDialog, ITTable } from "@axzydev/axzy_ui_system";
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaArrowLeft, 
  FaEllipsisV, 
  FaBriefcase, 
  FaGraduationCap,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaInfoCircle,
  FaCalendarAlt,
  FaList,
  FaThLarge,
  FaInfo
} from "react-icons/fa";
import dayjs from "dayjs";
import { Applicant, getApplicants, updateApplicantStatus } from "../service/applicants.service";
import { getVacancies, Vacancy } from "../../vacancies/service/vacancies.service";
import { useDispatch } from "react-redux";
import { showToast } from "@app/core/store/toast/toast.slice";

const VacancyApplicantsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [editingStatus, setEditingStatus] = useState<Applicant | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Evaluation States
  const [evaluatingApplicant, setEvaluatingApplicant] = useState<Applicant | null>(null);
  const [evaluationStatus, setEvaluationStatus] = useState<string>("");
  const [interviewNotes, setInterviewNotes] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    if (id) {
      const [applicantsRes, vacanciesRes] = await Promise.all([
        getApplicants(Number(id)),
        getVacancies()
      ]);

      if (applicantsRes.success && applicantsRes.data) {
        setApplicants(applicantsRes.data);
      }
      
      if (vacanciesRes.success && vacanciesRes.data) {
        const found = vacanciesRes.data.find(v => v.id === Number(id));
        setVacancy(found || null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleStatusUpdate = async () => {
      if (!editingStatus) return;
      const res = await updateApplicantStatus(editingStatus.id, newStatus);
      if (res.success) {
          dispatch(showToast({ message: "Estado actualizado exitosamente", type: "success" }));
          setEditingStatus(null);
          fetchData();
      } else {
          dispatch(showToast({ message: "Error al actualizar estado", type: "error" }));
      }
  };

  const handleEvaluationSubmit = async () => {
      if (!evaluatingApplicant) return;
      const res = await updateApplicantStatus(evaluatingApplicant.id, evaluationStatus, interviewNotes);
      if (res.success) {
          dispatch(showToast({ message: "Evaluación guardada exitosamente", type: "success" }));
          setEvaluatingApplicant(null);
          setInterviewNotes("");
          fetchData();
      } else {
          dispatch(showToast({ message: "Error al guardar la evaluación", type: "error" }));
      }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "REGISTERED": return "bg-slate-100 text-slate-600 border-slate-200";
      case "FORM_COMPLETED": return "bg-blue-100 text-blue-600 border-blue-200";
      case "INTERVIEW_SCHEDULED": return "bg-purple-100 text-purple-600 border-purple-200";
      case "INTERVIEWED": return "bg-indigo-100 text-indigo-600 border-indigo-200";
      case "HIRED": return "bg-emerald-100 text-emerald-600 border-emerald-200";
      case "REJECTED": return "bg-rose-100 text-rose-600 border-rose-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "REGISTERED": return "Registrado";
      case "FORM_COMPLETED": return "Postulado";
      case "INTERVIEW_SCHEDULED": return "Cita Agendada";
      case "INTERVIEWED": return "Entrevistado";
      case "HIRED": return "Contratado";
      case "REJECTED": return "Rechazado";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <ITLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <button 
                onClick={() => navigate('/vacancies')}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold uppercase tracking-widest mb-2"
            >
                <FaArrowLeft /> Volver a Vacantes
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Candidatos: <span className="text-[#065911]">{vacancy?.title || 'Cargando...'}</span>
            </h1>
            <p className="text-slate-500 font-medium">
                {applicants.length} personas interesadas en esta posición
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-200/50 p-1 rounded-2xl">
                <button 
                  onClick={() => setViewMode('cards')} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'cards' ? 'bg-white text-[#065911] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <FaThLarge size={14} /> Cards
                </button>
                <button 
                  onClick={() => setViewMode('table')} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-white text-[#065911] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <FaList size={14} /> Tabla
                </button>
             </div>
             <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${vacancy?.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className="text-xs font-black text-slate-700 uppercase">{vacancy?.status === 'ACTIVE' ? 'Activa' : 'Pausada'}</span>
             </div>
          </div>
        </div>

        {/* Grid of Cards / Table */}
        {applicants.length > 0 ? (
            viewMode === 'cards' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {applicants.map((applicant) => (
                    <div 
                        key={applicant.id}
                        className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col"
                    >
                        {/* Card Header/Status */}
                        <div className="p-6 pb-4 flex justify-between items-start">
                             <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(applicant.status)}`}>
                                {getStatusLabel(applicant.status)}
                             </div>
                             <button 
                                onClick={() => {
                                    setEditingStatus(applicant);
                                    setNewStatus(applicant.status);
                                }}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#065911] transition-all"
                             >
                                <FaEllipsisV size={12} />
                             </button>
                        </div>

                        {/* Card Content */}
                        <div className="px-6 pb-6 flex-1 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${getStatusColor(applicant.status).split(' ')[0]} ${getStatusColor(applicant.status).split(' ')[1]}`}>
                                    {applicant.firstName[0]}{applicant.lastName[0]}
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-black text-slate-900 leading-tight group-hover:text-[#065911] transition-colors line-clamp-1">
                                        {applicant.firstName} {applicant.lastName}
                                    </h3>
                                    <span className="text-xs text-slate-400 font-medium line-clamp-1">ID #{applicant.id}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <FaEnvelope size={12} className="opacity-50" />
                                    <span className="text-xs font-medium truncate">{applicant.email || 'Sin correo'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <FaPhone size={12} className="opacity-50" />
                                    <span className="text-xs font-medium">{applicant.phone || 'Sin teléfono'}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 space-y-3">
                                {applicant.status === 'INTERVIEW_SCHEDULED' && applicant.interviews?.[0] && (
                                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-[#065911] opacity-70 uppercase tracking-widest flex items-center gap-2">
                                            <FaCalendarAlt size={10} /> Cita Programada
                                        </span>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-[#065911]">
                                                {dayjs(applicant.interviews[0].scheduledAt).format('DD/MM/YYYY')}
                                            </span>
                                            <span className="text-[10px] font-black text-[#065911] opacity-80">
                                                {dayjs(applicant.interviews[0].scheduledAt).format('hh:mm A')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <FaBriefcase size={12} className="text-[#065911] opacity-60" />
                                    <p className="text-[11px] font-medium text-slate-600 line-clamp-2 leading-tight">
                                        {applicant.experience || "Sin experiencia registrada"}
                                    </p>
                                </div>
                                {applicant.notes && (
                                    <div className="flex items-start gap-2 pt-2 border-t border-slate-50 mt-2">
                                        <FaInfoCircle size={12} className="text-emerald-600 opacity-70 mt-0.5" />
                                        <p className="text-[11px] font-medium text-slate-500 line-clamp-3 leading-tight italic" title={applicant.notes}>
                                            "{applicant.notes}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-4 bg-slate-50/50 mt-auto flex flex-col gap-2">
                            <ITButton 
                                variant="outlined" 
                                color="primary" 
                                className="!w-full !rounded-xl !text-[10px] !h-10 font-black uppercase tracking-widest border-slate-200 text-slate-500"
                                onClick={() => setSelectedApplicant(applicant)}
                            >
                                Detalles
                            </ITButton>
                            {(applicant.status === "INTERVIEWED" || applicant.status === "INTERVIEW_SCHEDULED") && (
                                <div className="grid grid-cols-3 gap-2 w-full mt-2">
                                    <ITButton 
                                        variant="solid"
                                        color="success"
                                        className="!rounded-xl !text-[10px] !h-10 font-black uppercase tracking-widest !bg-emerald-600 border-0 shadow-sm flex items-center justify-center gap-1"
                                        onClick={() => {
                                            setEvaluatingApplicant(applicant);
                                            setEvaluationStatus("HIRED");
                                            setInterviewNotes("");
                                        }}
                                    >
                                        <FaCheckCircle  color="#fff" size={14} />
                                    </ITButton>
                                    <ITButton 
                                        variant="solid"
                                        color="primary"
                                        className="!rounded-xl !text-[10px] !h-10 font-black uppercase tracking-widest !bg-blue-600 border-0 shadow-sm flex items-center justify-center gap-1"
                                        onClick={() => {
                                            setEvaluatingApplicant(applicant);
                                            setEvaluationStatus("INTERVIEWED");
                                            setInterviewNotes("");
                                        }}
                                    >
                                        <FaInfoCircle color="#fff"  size={14} />
                                    </ITButton>
                                    <ITButton 
                                        variant="solid"
                                        color="danger" 
                                        className="!rounded-xl !text-[10px] !h-10 font-black uppercase tracking-widest !bg-rose-600 border-0 shadow-sm flex items-center justify-center gap-1"
                                        onClick={() => {
                                            setEvaluatingApplicant(applicant);
                                            setEvaluationStatus("REJECTED");
                                            setInterviewNotes("");
                                        }}
                                    >
                                        <FaTimesCircle color="#fff"  size={14} />
                                    </ITButton>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <ITTable
                        data={applicants}
                        columns={[
                            { key: "id", label: "ID", type: "number", sortable: true },
                            { 
                                key: "applicant", 
                                label: "Candidato", 
                                type: "string", 
                                sortable: true,
                                render: (row: Applicant) => (
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${getStatusColor(row.status).split(' ')[0]} ${getStatusColor(row.status).split(' ')[1]}`}>
                                            {row.firstName[0]}{row.lastName[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800">{row.firstName} {row.lastName}</span>
                                            <span className="text-[10px] text-slate-500">{row.email || 'Sin correo'} | {row.phone || 'Sin tel'}</span>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                key: "status",
                                label: "Estado",
                                type: "string",
                                render: (row: Applicant) => (
                                    <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(row.status)}`}>
                                        {getStatusLabel(row.status)}
                                    </div>
                                )
                            },
                            {
                                key: "interview",
                                label: "Entrevista",
                                type: "string",
                                render: (row: Applicant) => {
                                    if (row.status === 'INTERVIEW_SCHEDULED' && row.interviews && row.interviews.length > 0) {
                                        return (
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-[#065911]">{dayjs(row.interviews[0].scheduledAt).format('DD/MM/YYYY')}</span>
                                                <span className="text-[10px] text-[#065911] opacity-70 font-black">{dayjs(row.interviews[0].scheduledAt).format('hh:mm A')}</span>
                                            </div>
                                        );
                                    }
                                    return <span className="text-slate-400 text-xs italic">-</span>;
                                }
                            },
                            {
                                key: "experience",
                                label: "Experiencia",
                                type: "string",
                                render: (row: Applicant) => (
                                    <div className="max-w-[150px] text-[11px] text-slate-600 truncate" title={row.experience || "Sin experiencia"}>
                                        {row.experience || <span className="italic opacity-50">Sin registro</span>}
                                    </div>
                                )
                            },
                            {
                                key: "actions",
                                label: "Acciones",
                                type: "actions",
                                actions: (row: Applicant) => (
                                    <div className="flex items-center gap-2">
                                        <ITButton 
                                            color="warning" 
                                            size="small"
                                            className="!rounded-lg w-8 h-8 !p-0 shadow-sm flex items-center justify-center"
                                            onClick={() => setSelectedApplicant(row)}
                                        >
                                            <FaInfo color="#fff"  size={14} />    
                                        </ITButton>
                                        {(row.status === "INTERVIEWED" || row.status === "INTERVIEW_SCHEDULED") && (
                                            <>
                                                <ITButton 
                                                    variant="solid"
                                                    color="success"
                                                    size="small"
                                                    className="!rounded-lg w-8 h-8 !p-0 !bg-emerald-600 border-0 shadow-sm flex items-center justify-center"
                                                    title="Aprobar"
                                                    onClick={() => {
                                                        setEvaluatingApplicant(row);
                                                        setEvaluationStatus("HIRED");
                                                        setInterviewNotes("");
                                                    }}
                                                >
                                                    <FaCheckCircle color="#fff" size={14} />
                                                </ITButton>
                                                <ITButton 
                                                    variant="solid"
                                                    color="primary"
                                                    size="small"
                                                    className="!rounded-lg w-8 h-8 !p-0 !bg-blue-600 border-0 shadow-sm flex items-center justify-center"
                                                    title="Evaluar"
                                                    onClick={() => {
                                                        setEvaluatingApplicant(row);
                                                        setEvaluationStatus("INTERVIEWED");
                                                        setInterviewNotes("");
                                                    }}
                                                >
                                                    <FaList  color="#fff" size={14} />
                                                </ITButton>
                                                <ITButton 
                                                    variant="solid"
                                                    color="danger" 
                                                    size="small"
                                                    className="!rounded-lg w-8 h-8 !p-0 !bg-rose-600 border-0 shadow-sm flex items-center justify-center"
                                                    title="Rechazar"
                                                    onClick={() => {
                                                        setEvaluatingApplicant(row);
                                                        setEvaluationStatus("REJECTED");
                                                        setInterviewNotes("");
                                                    }}
                                                >
                                                    <FaTimesCircle color="#fff"  size={14} />
                                                </ITButton>
                                            </>
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
            )
        ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
                    <FaUser size={48} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Sin Candidatos Aún</h3>
                <p className="text-slate-500 font-medium mb-8">
                    Esta vacante aún no ha recibido postulaciones. Comparte el código QR para empezar a recibir candidatos.
                </p>
                <ITButton 
                    variant="solid" 
                    color="primary" 
                    className="!rounded-2xl !bg-[#065911] !py-6 !px-8 font-black uppercase tracking-widest"
                    onClick={() => navigate('/vacancies')}
                >
                    Volver al Listado
                </ITButton>
            </div>
        )}
      </div>

      {/* Details Dialog */}
      <ITDialog 
        isOpen={!!selectedApplicant} 
        onClose={() => setSelectedApplicant(null)} 
        title="Detalle del Candidato"
      >
        {selectedApplicant && (
            <div className="p-6 space-y-8">
                <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black ${getStatusColor(selectedApplicant.status)}`}>
                        {selectedApplicant.firstName[0]}{selectedApplicant.lastName[0]}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">{selectedApplicant.firstName} {selectedApplicant.lastName}</h2>
                        <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mt-2 ${getStatusColor(selectedApplicant.status)}`}>
                            {getStatusLabel(selectedApplicant.status)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <FaEnvelope /> Email
                        </span>
                        <p className="text-sm font-bold text-slate-700">{selectedApplicant.email || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <FaPhone /> Teléfono
                        </span>
                        <p className="text-sm font-bold text-slate-700">{selectedApplicant.phone || 'N/A'}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                            <FaGraduationCap /> Educación
                        </h4>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                            {selectedApplicant.education || "No se registró información académica."}
                        </p>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                            <FaBriefcase /> Experiencia Laboral
                        </h4>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                            {selectedApplicant.experience || "No se registró experiencia previa."}
                        </p>
                    </div>
                    {selectedApplicant.notes && (
                        <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 shadow-sm space-y-2">
                            <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                                <FaInfoCircle /> Notas de Evaluación
                            </h4>
                            <p className="text-sm text-[#065911] font-medium leading-relaxed">
                                {selectedApplicant.notes}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <ITButton variant="outlined" color="primary" onClick={() => setSelectedApplicant(null)} className="!rounded-xl">Cerrar</ITButton>
                    <ITButton 
                        variant="solid" 
                        color="primary" 
                        className="!rounded-xl !bg-[#065911]"
                        onClick={() => {
                            setEditingStatus(selectedApplicant);
                            setNewStatus(selectedApplicant.status);
                            setSelectedApplicant(null);
                        }}
                    >
                        Cambiar Estado
                    </ITButton>
                </div>
            </div>
        )}
      </ITDialog>

      {/* Edit Status Dialog */}
      <ITDialog isOpen={!!editingStatus} onClose={() => setEditingStatus(null)} title="Gestionar Candidato">
        {editingStatus && (
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-500">
                        {editingStatus.firstName[0]}
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Postulante</p>
                        <h4 className="font-bold text-slate-900">{editingStatus.firstName} {editingStatus.lastName}</h4>
                    </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                     <FaClock /> Definir Nuevo Estado
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                        { val: "REGISTERED", label: "Registrado", icon: <FaClock /> },
                        { val: "FORM_COMPLETED", label: "Postulado", icon: <FaCheckCircle /> },
                        { val: "INTERVIEW_SCHEDULED", label: "Cita Agendada", icon: <FaInfoCircle /> },
                        { val: "INTERVIEWED", label: "Entrevistado", icon: <FaUser /> },
                        { val: "REJECTED", label: "Rechazado", icon: <FaTimesCircle /> },
                        { val: "HIRED", label: "Contratado", icon: <FaCheckCircle /> }
                    ].map((opt) => (
                        <button
                            key={opt.val}
                            onClick={() => setNewStatus(opt.val)}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 ${newStatus === opt.val ? 'bg-[#065911]/5 border-[#065911] shadow-lg shadow-[#065911]/10' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`${newStatus === opt.val ? 'text-[#065911]' : 'text-slate-400'}`}>{opt.icon}</span>
                                <span className={`text-sm font-black uppercase tracking-tight ${newStatus === opt.val ? 'text-[#065911]' : 'text-slate-600'}`}>{opt.label}</span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${newStatus === opt.val ? 'border-[#065911] bg-[#065911]' : 'border-slate-200 bg-white'}`}>
                                {newStatus === opt.val && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                        </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                    <ITButton variant="outlined" color="primary" onClick={() => setEditingStatus(null)} className="!rounded-2xl">Cancelar</ITButton>
                    <ITButton variant="solid" color="primary" onClick={handleStatusUpdate} className="!rounded-2xl !bg-[#065911] !px-8">Guardar Cambios</ITButton>
                </div>
            </div>
        )}
      </ITDialog>

      {/* Evaluation Modal (Aprobado/Rechazado with Notes) */}
      <ITDialog 
        isOpen={!!evaluatingApplicant} 
        onClose={() => setEvaluatingApplicant(null)}
        title={evaluationStatus === "HIRED" ? "Aprobar Candidato" : evaluationStatus === "REJECTED" ? "Rechazar Candidato" : "Evaluar Candidato"}
      >
        {evaluatingApplicant && (
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${evaluationStatus === 'HIRED' ? 'bg-emerald-100 text-emerald-600' : evaluationStatus === 'REJECTED' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                        {evaluatingApplicant.firstName[0]}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evaluando a</p>
                        <h4 className="font-bold text-slate-900">{evaluatingApplicant.firstName} {evaluatingApplicant.lastName}</h4>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        Notas de la Entrevista
                    </label>
                    <textarea 
                        className="w-full h-32 p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#065911]/20 focus:border-[#065911] transition-all text-sm outline-none resize-none"
                        placeholder="Escribe aquí tus observaciones, puntos fuertes, debilidades o cualquier detalle relevante de la entrevista..."
                        value={interviewNotes}
                        onChange={(e) => setInterviewNotes(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 italic px-1">
                        * Al guardar, el candidato será marcado como <span className="font-bold text-slate-600">{evaluationStatus === 'HIRED' ? 'Contratado' : evaluationStatus === 'REJECTED' ? 'Rechazado' : 'Entrevistado (Solo Notas)'}</span>.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                    <ITButton variant="outlined" color="primary" onClick={() => setEvaluatingApplicant(null)} className="!rounded-2xl">
                        Cancelar
                    </ITButton>
                    <ITButton 
                        variant="solid" 
                        color="primary" 
                        disabled={!interviewNotes.trim()}
                        onClick={handleEvaluationSubmit} 
                        className={`!rounded-2xl !px-10 h-12 font-bold shadow-lg ${evaluationStatus === 'HIRED' ? '!bg-emerald-600 shadow-emerald-500/20' : evaluationStatus === 'REJECTED' ? '!bg-rose-600 shadow-rose-500/20' : '!bg-blue-600 shadow-blue-500/20'}`}
                    >
                        Confirmar {evaluationStatus === "HIRED" ? "Aprobar" : evaluationStatus === "REJECTED" ? "Rechazar" : "Guardar Notas"}
                    </ITButton>
                </div>
            </div>
        )}
      </ITDialog>

    </div>
  );
};

export default VacancyApplicantsPage;
