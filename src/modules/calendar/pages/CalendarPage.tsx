import { ITCalendar, ITLoader, ITSelect, ITDialog, ITButton } from "@axzydev/axzy_ui_system";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getVacancies, Vacancy } from "../../vacancies/service/vacancies.service";
import { getInterviews, Interview } from "../../interviews/service/interviews.service";
import { 
  FaUser, 
  FaCalendarAlt, 
  FaClock, 
  FaBriefcase, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaSyncAlt
} from "react-icons/fa";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  color?: string;
  data?: any;
}

const CalendarPage = () => {
    const user = useSelector((state: any) => state.auth);
    const navigate = useNavigate();

    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [selectedVacancyId, setSelectedVacancyId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    // Dialog State
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

    // Initial Fetch (Pattern from example)
    useEffect(() => {
        const fetchDataInitial = async () => {
            setLoading(true);
            try {
                const vacRes = await getVacancies();
                if (vacRes.success && vacRes.data) {
                    setVacancies(vacRes.data);
                    if (vacRes.data.length > 0) {
                        setSelectedVacancyId(String(vacRes.data[0].id));
                    }
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDataInitial();
    }, []);

    // Fetch interviews when vacancy filter changes
    useEffect(() => {
        const fetchInterviewsData = async () => {
            if (!selectedVacancyId) return;
            setLoading(true);
            try {
                const intRes = await getInterviews(Number(selectedVacancyId));
                if (intRes.success && intRes.data) {
                    console.log("Interviews from API:", intRes.data);
                    setInterviews(intRes.data);
                }
            } catch (error) {
                console.error("Error fetching interviews:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInterviewsData();
    }, [selectedVacancyId]);

    const events = useMemo(() => {
        if (!selectedVacancyId) return [];
        
        const interviewColors: any = {
            SCHEDULED: "#3b82f6", // Blue
            COMPLETED: "#10b981", // Emerald
            CANCELLED: "#ef4444", // Red
            NO_SHOW: "#f97316",   // Orange
        };

        const mappedEvents = interviews.map(interview => {
            const applicantName = interview.applicant 
                ? `${interview.applicant.firstName} ${interview.applicant.lastName}`
                : "Candidato";

            const start = dayjs(interview.scheduledAt).toDate();
            const end = dayjs(interview.scheduledAt).add(1, 'hour').toDate();

            return {
                id: String(interview.id),
                title: `👥 ${applicantName}`,
                start,
                end,
                color: interviewColors[interview.status] || "#3b82f6",
                data: { ...interview, _type: 'interview' }
            };
        });

        console.log("Mapped Events for Calendar:", mappedEvents);
        return mappedEvents;
    }, [interviews, selectedVacancyId]);

    const handleSlotClick = (date: Date) => {
        if (user?.role === "RECLUTADOR") return;
        const end = dayjs(date).add(1, 'hour').toDate();
        handleSelectRange(date, end);
    };

    const handleSelectRange = (start: Date, end: Date) => {
        if (user?.role === "RECLUTADOR") return;
        navigate("/vacancies/new", { 
            state: { 
                initialData: {
                    startDate: dayjs(start).toISOString(),
                    slots: [{
                        startTime: dayjs(start).toISOString(),
                        endTime: dayjs(end).toISOString(),
                        positions: 1
                    }]
                }
            } 
        });
    };

    const handleEventClick = (event: CalendarEvent) => {
        if (event.data?._type === 'interview') {
            setSelectedInterview(event.data);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#f6fbf4]">
             {/* Header Section */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-8 py-8 bg-[#f6fbf4] shrink-0">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Calendario de Entrevistas</h1>
                    <p className="text-slate-500 font-medium mt-1">Gestión visual de citas por vacante</p>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="w-full md:w-72">
                         <ITSelect
                            label="Vacante a Evaluar"
                            name="vacancyFilter"
                            options={vacancies.map(v => ({ label: v.title || "Sin título", value: String(v.id) }))}
                            value={selectedVacancyId}
                            onChange={(e) => setSelectedVacancyId(e.target.value)}
                            placeholder="Seleccionar vacante..."
                         />
                    </div>
                    <ITButton 
                        variant="solid" 
                        color="primary" 
                        onClick={() => {
                            const fetchDataInitial = async () => {
                                setLoading(true);
                                try {
                                    const vacRes = await getVacancies();
                                    if (vacRes.success && vacRes.data) {
                                        setVacancies(vacRes.data);
                                    }
                                } catch (error) {
                                    console.error("Error refreshing data:", error);
                                } finally {
                                    setLoading(false);
                                }
                            };
                            fetchDataInitial();
                        }} 
                        className="!h-full !rounded-xl !bg-[#065911] !text-white px-4"
                        title="Sincronizar"
                    >
                        <FaSyncAlt className="text-white" />
                    </ITButton>
                </div>
            </div>

            {/* Calendar Container */}
            <div className="flex-1 overflow-hidden pb-8 px-8">
                 <div className="h-full w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative flex flex-col">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-4">
                                <ITLoader />
                                <span className="text-xs font-black text-[#065911] uppercase tracking-[0.2em] animate-pulse">Cargando eventos...</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex-1 p-4 flex flex-col overflow-hidden">
                        <ITCalendar 
                            events={events}
                            onSlotClick={handleSlotClick}
                            onEventClick={handleEventClick}
                            onSelectRange={handleSelectRange}
                            mode="week"
                        />
                    </div>
                </div>
            </div>

            {/* Interview Detail Modal */}
            <ITDialog 
                isOpen={!!selectedInterview} 
                onClose={() => setSelectedInterview(null)} 
                title="Detalles de la Cita"
            >
                {selectedInterview && (
                    <div className="p-8 space-y-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-emerald-100 text-[#065911] rounded-[2rem] flex items-center justify-center text-3xl font-black rotate-3">
                                {selectedInterview?.applicant?.firstName?.[0] || '?'}{selectedInterview?.applicant?.lastName?.[0] || '?' }
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {selectedInterview?.applicant?.firstName} {selectedInterview?.applicant?.lastName}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                     <div className="px-3 py-1 bg-[#065911]/10 text-[#065911] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#065911]/20">
                                        {selectedInterview?.status}
                                     </div>
                                     <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-2">
                                        <FaBriefcase size={10} /> {selectedInterview?.vacancy?.title}
                                     </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <FaCalendarAlt /> Horario de Cita
                                </h4>
                                <div className="flex flex-col">
                                    <span className="text-lg font-black text-slate-700">
                                        {dayjs(selectedInterview?.scheduledAt).format('dddd D [de] MMMM')}
                                    </span>
                                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                                        <FaClock /> {dayjs(selectedInterview?.scheduledAt).format('hh:mm A')}
                                    </span>
                                </div>
                             </div>
                             <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <FaMapMarkerAlt /> Ubicación
                                </h4>
                                <div className="flex flex-col text-slate-700">
                                    <span className="text-lg font-black">{selectedInterview?.vacancy?.department || 'Oficinas Generales'}</span>
                                </div>
                             </div>
                        </div>

                        <div className="space-y-4">
                             <div className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                    <FaEnvelope size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correo</span>
                                    <span className="text-sm font-bold text-slate-700">{selectedInterview?.applicant?.email || 'N/A'}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                                    <FaPhone size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</span>
                                    <span className="text-sm font-bold text-slate-700">{selectedInterview?.applicant?.phone || 'N/A'}</span>
                                </div>
                             </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <ITButton 
                                variant="outlined" 
                                color="primary" 
                                className="!w-full !rounded-2xl !h-14 font-black uppercase tracking-widest"
                                onClick={() => setSelectedInterview(null)}
                            >
                                Cerrar
                            </ITButton>
                            <ITButton 
                                variant="solid" 
                                color="primary" 
                                className="!w-full !rounded-2xl !h-14 !bg-[#065911] !text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20"
                                onClick={() => navigate(`/vacancies/${selectedInterview?.vacancyId}/applicants`)}
                            >
                                <FaUser size={14} className="text-white" /> Gestión
                            </ITButton>
                        </div>
                    </div>
                )}
            </ITDialog>
        </div>
    );
};

export default CalendarPage;
