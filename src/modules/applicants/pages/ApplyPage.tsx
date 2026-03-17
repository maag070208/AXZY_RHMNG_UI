import { ITButton } from "@axzydev/axzy_ui_system";
import { useFormik } from "formik";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
import { applyPublic } from "../service/applicants.service";
import { getVacancyByToken, Vacancy } from "../../vacancies/service/vacancies.service";
import { 
  FaClock, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaGraduationCap, 
  FaBriefcase,
  FaCheckCircle,
  FaArrowRight,
  FaInfoCircle,
  FaMapMarkerAlt
} from "react-icons/fa";

const ApplyPage = () => {
  const { qrToken } = useParams<{ qrToken: string }>();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchVacancy = async () => {
      setLoading(true);
      if (qrToken) {
        const res = await getVacancyByToken(qrToken);
        if (res.success) {
          setVacancy(res.data);
        } else {
          setError(res.messages?.[0] || "No se pudo cargar la información de la vacante.");
        }
      }
      setLoading(false);
    };
    fetchVacancy();
  }, [qrToken]);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      experience: "",
      education: "",
      slotId: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("El nombre es obligatorio"),
      lastName: Yup.string().required("El apellido es obligatorio"),
      email: Yup.string()
        .email("Correo electrónico inválido")
        .required("El correo es obligatorio"),
      phone: Yup.string()
        .required("El teléfono es obligatorio")
        .min(10, "El teléfono debe tener al menos 10 dígitos"),
      slotId: Yup.string().required("Selecciona un horario de entrevista"),
    }),
    onSubmit: async (values) => {
      if (!qrToken) {
        setError("El enlace de postulación no es válido");
        return;
      }
      
      const payload = {
        ...values,
        formData: {}
      };

      const result = await applyPublic(qrToken, payload);
      
      if (result.success) {
        setSubmitted(true);
        setError("");
      } else {
        setError(result.messages?.[0] || "Error al procesar la postulación. Intenta más tarde.");
      }
    },
  });

  // Agrupar slots disponibles por fecha
  const groupedSlots = useMemo(() => {
     if (!vacancy?.slots) return {};
     
     // Filtrar slots que ya están llenos
     const availableSlots = vacancy.slots.filter(slot => {
        const applicantCount = (slot as any)._count?.applicants || 0;
        return applicantCount < slot.positions;
     });

     return availableSlots.reduce((acc: any, slot) => {
        const dateKey = new Date(slot.startTime).toLocaleDateString('es-ES', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        });
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(slot);
        return acc;
      }, {});
  }, [vacancy?.slots]);

  // Set initial active date when slots are loaded
  useEffect(() => {
    const dates = Object.keys(groupedSlots);
    if (dates.length > 0 && !activeDate) {
      setActiveDate(dates[0]);
    }
  }, [groupedSlots, activeDate]);

  const parsedShifts = useMemo(() => {
    try {
      if (vacancy?.workSchedule?.startsWith('[')) {
        return JSON.parse(vacancy.workSchedule);
      }
    } catch (e) {}
    return null;
  }, [vacancy?.workSchedule]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Cargando vacante...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    const selectedSlot = vacancy?.slots?.find(s => String(s.id) === formik.values.slotId);
    const appointmentDate = selectedSlot ? new Date(selectedSlot.startTime).toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
    }) : "";
    const appointmentTime = selectedSlot ? new Date(selectedSlot.startTime).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    }) : "";

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-xl w-full p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-emerald-500/10 text-center border border-slate-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30 rotate-3">
            <FaCheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">¡Cita Confirmada!</h2>
          <p className="text-slate-500 mb-8 font-medium">
            ¡Ya estás agendado para tu entrevista! Por favor guarda esta información:
          </p>

          <div className="w-full bg-slate-900 rounded-[2rem] p-8 text-white mb-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700" />
             <div className="relative z-10 space-y-6">
                 <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Tu Cita de Entrevista</span>
                    <h4 className="text-2xl font-black capitalize">{appointmentDate}</h4>
                 </div>
                 <div className="flex items-center justify-center gap-6 py-4 border-y border-white/10">
                    <div className="flex items-center gap-3">
                        <FaClock className="text-emerald-400" />
                        <span className="text-2xl font-black">{appointmentTime}</span>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-emerald-400" />
                        <span className="text-sm font-bold truncate max-w-[150px]">{vacancy?.department || 'Oficinas RH'}</span>
                    </div>
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">🚀 Te esperamos puntualmente</p>
             </div>
          </div>

          <div className="w-full bg-emerald-50 rounded-3xl p-6 border border-emerald-100 text-left">
            <h4 className="text-emerald-800 font-black text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
              <FaInfoCircle /> Recomendaciones
            </h4>
            <ul className="text-emerald-700 text-xs space-y-2 font-medium">
              <li className="flex items-start gap-2">• Presenta una identificación oficial al llegar.</li>
              <li className="flex items-start gap-2">• Se recomienda llegar 10 minutos antes de tu cita.</li>
              <li className="flex items-start gap-2">• Si no puedes asistir, avísanos con tiempo.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (error && !vacancy) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-xl border border-red-50 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FaInfoCircle size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Ops, algo salió mal</h3>
                <p className="text-slate-500 mb-6">{error}</p>
                <ITButton variant="solid" color="primary" onClick={() => window.location.reload()} className="w-full !rounded-xl">Reintentar</ITButton>
            </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-emerald-50/50 rounded-bl-[100px] -z-10 blur-3xl overflow-hidden" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
               <div className="inline-flex px-4 py-1.5 bg-[#065911]/10 text-[#065911] rounded-full text-[10px] font-black uppercase tracking-widest">
                  Vacante Disponible
               </div>
               <h1 className="text-5xl md:text-6xl font-black text-slate-930 tracking-tight leading-[1.1]">
                 {vacancy?.title}
               </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              {vacancy?.department && (
                <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 text-sm font-bold text-slate-700">
                  <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <FaMapMarkerAlt />
                  </div>
                  {vacancy.department}
                </div>
              )}
              {vacancy?.workSchedule && !parsedShifts && (
                <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 text-sm font-bold text-slate-700">
                  <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <FaClock />
                  </div>
                  {vacancy.workSchedule}
                </div>
              )}
              {parsedShifts && parsedShifts.map((shift: any, i: number) => (
                <div key={i} className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 text-sm font-bold text-slate-700">
                  <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-black text-[10px]">
                    {i + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400 leading-none">{shift.name}</span>
                    <span>{shift.startTime} - {shift.endTime}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <FaInfoCircle /> Descripción del Puesto
               </h3>
               <p className="text-slate-600 leading-relaxed italic">
                 {vacancy?.description || "Inicia tu carrera con nosotros. Buscamos talento con ganas de crecer y desarrollarse profesionalmente en un ambiente dinámico."}
               </p>
            </div>

            <div className="hidden lg:block pt-8">
               <div className="flex items-center gap-4 text-slate-400">
                  <div className="w-12 h-px bg-slate-200" />
                  <span className="text-xs font-medium">Desliza para ver horarios</span>
               </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
              
              <div className="p-8 md:p-12 space-y-12">
                
                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-600 animate-shake">
                    <FaInfoCircle />
                    <span className="text-sm font-bold">{error}</span>
                  </div>
                )}

                {/* Step 1: Slot Selection */}
                <div className="space-y-8">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#065911] text-white rounded-xl flex items-center justify-center font-black">1</div>
                      <h3 className="text-2xl font-black text-slate-930">Selecciona tu Cita</h3>
                   </div>

                    {vacancy?.status !== 'ACTIVE' ? (
                      <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center space-y-3">
                         <FaInfoCircle className="mx-auto text-slate-400" size={32} />
                         <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Postulaciones Pausadas</p>
                         <p className="text-slate-400 text-xs">Esta vacante no está recibiendo aplicaciones en este momento.</p>
                      </div>
                    ) : Object.keys(groupedSlots).length > 0 ? (
                      <div className="space-y-8">
                         {/* Selector de Fecha (Pills) */}
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                              Paso 1: Elige el día
                            </label>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide py-1">
                               {Object.keys(groupedSlots).map((dateKey) => {
                                  const isActive = activeDate === dateKey;
                                  const [weekday, day, month] = dateKey.split(' ');
                                  return (
                                     <button
                                        key={dateKey}
                                        type="button"
                                        onClick={() => setActiveDate(dateKey)}
                                        className={`
                                           flex-shrink-0 min-w-[100px] p-3 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-1
                                           ${isActive 
                                              ? 'bg-[#065911] border-[#065911] text-white shadow-lg shadow-[#065911]/20' 
                                              : 'bg-white border-slate-100 text-slate-400 hover:border-[#065911]/30 hover:text-slate-600'}
                                        `}
                                     >
                                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-80">{weekday}</span>
                                        <span className="text-xl font-black leading-none">{day}</span>
                                        <span className="text-[10px] font-bold uppercase">{month}</span>
                                     </button>
                                  );
                               })}
                            </div>
                         </div>

                         {/* Selector de Hora (Basado en activeDate) */}
                         {activeDate && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                 Paso 2: Elige el horario disponible para el {activeDate}
                               </label>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {groupedSlots[activeDate].map((slot: any) => {
                                     const isSelected = formik.values.slotId === String(slot.id);
                                     const start = new Date(slot.startTime).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit',
                                        hour12: true 
                                     });
                                     
                                     return (
                                        <label 
                                           key={slot.id} 
                                           className="relative group cursor-pointer h-16"
                                        >
                                           <input 
                                              type="radio" 
                                              name="slotId" 
                                              className="sr-only" 
                                              value={String(slot.id)}
                                              onChange={() => formik.setFieldValue("slotId", String(slot.id))}
                                           />
                                           <div className={`
                                              absolute inset-0 px-4 rounded-2xl border-2 flex items-center justify-between transition-all duration-300
                                              ${isSelected 
                                              ? 'bg-[#065911]/5 border-[#065911] shadow-lg shadow-[#065911]/10' 
                                              : 'bg-slate-50 border-slate-100 group-hover:border-[#065911]/30 group-hover:bg-white'}
                                           `}>
                                              <div className="flex items-center gap-3">
                                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-[#065911] text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                                 <FaClock size={14} />
                                              </div>
                                              <span className={`font-black text-sm uppercase ${isSelected ? 'text-[#065911]' : 'text-slate-600'}`}>
                                                 {start}
                                              </span>
                                              </div>
                                              
                                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#065911] bg-[#065911]' : 'border-slate-200 bg-white'}`}>
                                                 {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                              </div>
                                           </div>
                                        </label>
                                     );
                                  })}
                               </div>
                            </div>
                         )}
                      </div>
                    ) : (
                      <div className="p-10 bg-emerald-50 rounded-[2rem] border border-emerald-100 text-center space-y-4">
                         <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-3">
                            <FaInfoCircle size={32} />
                         </div>
                         <h4 className="text-emerald-900 font-black text-xl tracking-tight">¡Muchas Gracias!</h4>
                         <p className="text-emerald-700 font-medium text-sm leading-relaxed overflow-hidden">
                           Ya no tenemos horarios de entrevista disponibles para esta vacante por el momento.
                         </p>
                         <div className="pt-2">
                           <span className="text-[10px] font-black bg-emerald-200/50 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-widest">Proceso en espera</span>
                         </div>
                      </div>
                    )}
                   {formik.touched.slotId && formik.errors.slotId && (
                     <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide px-2 animate-pulse">{formik.errors.slotId}</p>
                   )}
                </div>

                {/* Step 2: Form */}
                <div className="space-y-8">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#065911] text-white rounded-xl flex items-center justify-center font-black">2</div>
                      <h3 className="text-2xl font-black text-slate-930">Tus Datos</h3>
                   </div>

                   <form onSubmit={formik.handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                             <FaUser /> Nombre(s)
                           </label>
                           <input 
                              name="firstName" 
                              placeholder="Ej. Juan" 
                              className={`w-full bg-slate-50 border-2 rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all ${formik.touched.firstName && formik.errors.firstName ? 'border-red-200 bg-red-50 focus:border-red-400' : 'border-slate-100 focus:border-[#065911] focus:bg-white focus:shadow-xl focus:shadow-emerald-900/5'}`}
                              value={formik.values.firstName}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                             <FaUser /> Apellidos
                           </label>
                           <input 
                              name="lastName" 
                              placeholder="Ej. Pérez López" 
                              className={`w-full bg-slate-50 border-2 rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all ${formik.touched.lastName && formik.errors.lastName ? 'border-red-200 bg-red-50 focus:border-red-400' : 'border-slate-100 focus:border-[#065911] focus:bg-white focus:shadow-xl focus:shadow-emerald-900/5'}`}
                              value={formik.values.lastName}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                           />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                             <FaEnvelope /> Email
                           </label>
                           <input 
                              name="email" 
                              type="email"
                              placeholder="juan@ejemplo.com" 
                              className={`w-full bg-slate-50 border-2 rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all ${formik.touched.email && formik.errors.email ? 'border-red-200 bg-red-50 focus:border-red-400' : 'border-slate-100 focus:border-[#065911] focus:bg-white focus:shadow-xl focus:shadow-emerald-900/5'}`}
                              value={formik.values.email}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                             <FaPhone /> Teléfono
                           </label>
                           <input 
                              name="phone" 
                              placeholder="10 dígitos" 
                              className={`w-full bg-slate-50 border-2 rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all ${formik.touched.phone && formik.errors.phone ? 'border-red-200 bg-red-50 focus:border-red-400' : 'border-slate-100 focus:border-[#065911] focus:bg-white focus:shadow-xl focus:shadow-emerald-900/5'}`}
                              value={formik.values.phone}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                           />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                          <FaGraduationCap /> Estudios Realizados
                        </label>
                        <input 
                           name="education" 
                           placeholder="Ej. Licenciatura en Administración" 
                           className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-[#065911] focus:bg-white focus:shadow-xl focus:shadow-emerald-900/5 transition-all"
                           value={formik.values.education}
                           onChange={formik.handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                          <FaBriefcase /> Resumen de Experiencia
                        </label>
                        <textarea 
                           name="experience" 
                           rows={3}
                           placeholder="Cuéntanos brevemente sobre tus trabajos anteriores..." 
                           className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-[#065911] focus:bg-white focus:shadow-xl focus:shadow-emerald-900/5 transition-all resize-none"
                           value={formik.values.experience}
                           onChange={formik.handleChange}
                        />
                      </div>

                      <div className="pt-6">
                        <ITButton
                          type="submit"
                          variant="solid"
                          color="primary"
                          className="w-full !h-16 !text-lg !font-black !rounded-2xl !bg-[#065911] hover:!bg-[#04330b] shadow-xl shadow-[#065911]/20 transition-all flex items-center justify-center gap-3"
                          disabled={formik.isSubmitting || Object.keys(groupedSlots).length === 0}
                        >
                          {formik.isSubmitting ? (
                            <span className="flex items-center gap-3">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              PROCESANDO...
                            </span>
                          ) : (
                            <>
                              POSTULARME AHORA <FaArrowRight />
                            </>
                          )}
                        </ITButton>
                        <p className="text-center text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-widest">
                          Tus datos están seguros y serán tratados con confidencialidad.
                        </p>
                      </div>
                   </form>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ApplyPage;