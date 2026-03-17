import { ITButton, ITTimePicker, ITDatePicker, ITInput } from "@axzydev/axzy_ui_system";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { Vacancy } from "../service/vacancies.service";
import { FaBriefcase, FaCalendarAlt, FaClock, FaCheckCircle } from "react-icons/fa";

interface VacancyFormProps {
  initialData?: Vacancy;
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
  isPage?: boolean;
  onSaveDraft?: (values: any) => void;
}

export const sanitizeVacancyPayload = (values: any) => {
  const payload = { ...values };
  // Si hay shifts estructurados, los guardamos como JSON en workSchedule
  if (values.workShifts && values.workShifts.length > 0) {
    payload.workSchedule = JSON.stringify(values.workShifts);
  }
  // Eliminamos campos que no existen en el modelo de Prisma
  delete (payload as any).workShifts;
  return payload;
};

export const VacancyForm = ({ initialData, onSubmit, onCancel, isPage, onSaveDraft }: VacancyFormProps) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      department: initialData?.department || "",
      salary: initialData?.salary || 0,
      positions: initialData?.positions || 1,
      status: initialData?.status || "DRAFT",
      startDate: initialData?.startDate ? new Date(initialData.startDate) : undefined,
      endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
      workSchedule: initialData?.workSchedule || "",
      workShifts: (() => {
        try {
          if (initialData?.workSchedule?.startsWith('[')) {
            return JSON.parse(initialData.workSchedule);
          }
        } catch (e) {}
        return [];
      })(),
      slots: initialData?.slots?.map(s => ({
        id: s.id,
        date: s.startTime.split('T')[0],
        startTime: new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        positions: s.positions
      })) || [],
    },
    validationSchema: Yup.object({
      title: Yup.string().required("El título es obligatorio"),
      positions: Yup.number().min(1, "Al menos 1 posición").required("Requerido"),
      startDate: Yup.date()
        .required("Fecha de inicio requerida")
        .test('is-before', 'La fecha de inicio no puede ser posterior al fin', function(value) {
            const { endDate } = this.parent;
            return !value || !endDate || new Date(value) <= new Date(endDate);
        }),
      endDate: Yup.date()
        .required("Fecha de fin requerida")
        .min(Yup.ref('startDate'), "La fecha de fin debe ser posterior al inicio"),
    }),
    onSubmit: async (values) => {
      const payload = sanitizeVacancyPayload(values);
      await onSubmit(payload);
    },
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [newSlot, setNewSlot] = useState({ 
    date: initialData?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    startTime: "09:00", 
    endTime: "10:00", 
    positions: 1 
  });
  const [newShift, setNewShift] = useState({ name: "", startTime: "09:00", endTime: "18:00" });

  const handleAddShift = () => {
    if (!newShift.name) return;
    formik.setFieldValue("workShifts", [...formik.values.workShifts, { ...newShift }]);
    setNewShift({ name: "", startTime: "09:00", endTime: "18:00" });
  };

  // Update newSlot date if startDate changes and newSlot date is still default
  useEffect(() => {
    if (formik.values.startDate && !initialData) {
        const dateStr = formik.values.startDate instanceof Date 
            ? formik.values.startDate.toISOString().split('T')[0]
            : String(formik.values.startDate).split('T')[0];
        setNewSlot(prev => ({ ...prev, date: dateStr }));
    }
  }, [formik.values.startDate]);

  const handleAddSlot = () => {
    formik.setFieldValue("slots", [...formik.values.slots, { ...newSlot }]);
    // Reset to next hour logically
    const [h, m] = newSlot.endTime.split(':');
    const nextH = (parseInt(h) + 1).toString().padStart(2, '0');
    setNewSlot({ ...newSlot, startTime: newSlot.endTime, endTime: `${nextH}:${m}` });
  };




  const steps = [
    {
      label: "General",
      icon: <FaBriefcase />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
          <ITInput
            label="Título de la Vacante"
            name="title"
            placeholder="Ej. Reclutador Jr."
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            touched={formik.touched.title}
            error={formik.errors.title as string}
            required
          />
          <ITInput
            label="Departamento"
            name="department"
            placeholder="Ej. Recursos Humanos"
            value={formik.values.department}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <ITInput
            label="Salario (Opcional)"
            name="salary"
            type="number"
            placeholder="0.00"
            value={formik.values.salary}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <ITInput
            label="Número de Posiciones"
            name="positions"
            type="number"
            value={formik.values.positions}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            required
          />
          <div className="md:col-span-2">
            <ITInput
              label="Descripción de la Vacante"
              name="description"
              type="textarea"
              rows={4}
              placeholder="Describe las responsabilidades y requisitos..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          {/* Ocultamos el input simple de horario si ya tenemos el sistema de steps */}
          {!formik.values.workShifts.length && (
            <div className="md:col-span-2">
                <ITInput
                label="Horario Laboral Informativo (Texto Simple)"
                name="workSchedule"
                placeholder="Ej. L-V 9:00 AM - 6:00 PM"
                value={formik.values.workSchedule}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                />
            </div>
          )}
        </div>
      )
    },
    {
      label: "Horarios",
      icon: <FaClock />,
      content: (
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
             <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Definir Turnos de Trabajo</h4>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                   <ITInput 
                      name="shiftName"
                      label="Nombre del Turno" 
                      placeholder="Ej. Matutino"
                      value={newShift.name}
                      onChange={(e) => setNewShift(prev => ({ ...prev, name: e.target.value }))}
                      onBlur={() => {}}
                   />
                </div>
                <ITTimePicker
                    name="shiftStart"
                    label="Inicio"
                    value={newShift.startTime}
                    onChange={(val: any) => {
                        const timeStr = typeof val === 'object' && val?.target ? val.target.value : val;
                        setNewShift(prev => ({ ...prev, startTime: typeof timeStr === 'string' ? timeStr : prev.startTime }));
                    }}
                    onBlur={() => {}}
                />
                <ITTimePicker
                    name="shiftEnd"
                    label="Fin"
                    value={newShift.endTime}
                    onChange={(val: any) => {
                        const timeStr = typeof val === 'object' && val?.target ? val.target.value : val;
                        setNewShift(prev => ({ ...prev, endTime: typeof timeStr === 'string' ? timeStr : prev.endTime }));
                    }}
                    onBlur={() => {}}
                />
                <ITButton 
                   variant="solid" 
                   color="primary" 
                   onClick={handleAddShift} 
                   type="button" 
                   className="!h-[38px] !rounded-xl w-full"
                   disabled={!newShift.name}
                >
                    Agregar Turno
                </ITButton>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {formik.values.workShifts.map((shift: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-[#065911]/30 transition-all">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{shift.name}</p>
                      <p className="text-sm font-bold text-slate-700">{shift.startTime} - {shift.endTime}</p>
                   </div>
                   <button 
                      type="button"
                      className="text-slate-300 hover:text-red-500 p-2"
                      onClick={() => {
                        const updated = [...formik.values.workShifts];
                        updated.splice(index, 1);
                        formik.setFieldValue("workShifts", updated);
                      }}
                   >
                     ✕
                   </button>
                </div>
             ))}
          </div>
          
          {formik.values.workShifts.length === 0 && (
             <div className="text-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 italic text-sm">
                No has definido turnos de trabajo estructurados. 
             </div>
          )}
        </div>
      )
    },
    {
      label: "Vigencia",
      icon: <FaCalendarAlt />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-slate-50/50 rounded-3xl border border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">A</span>
              Inicio de Reclutamiento
            </h4>
            <ITDatePicker
              name="startDate"
              label="Fecha desde que se reciben citas"
              value={formik.values.startDate}
              onChange={(e: any) => formik.setFieldValue("startDate", e.target.value)}
              required
            />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">B</span>
              Fin de Reclutamiento
            </h4>
            <ITDatePicker
              name="endDate"
              label="Fecha límite para entrevistas"
              value={formik.values.endDate}
              minDate={formik.values.startDate}
              onChange={(e: any) => formik.setFieldValue("endDate", e.target.value)}
              touched={formik.touched.endDate}
              error={formik.errors.endDate as string}
              required
            />
          </div>
          <div className="md:col-span-2 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-xs flex items-start gap-3">
             <div className="mt-1">⚠️</div>
             <p>Asegúrate de que el rango de fechas cubra todos los días en los que planeas realizar entrevistas presenciales o remotas.</p>
          </div>
        </div>
      )
    },
    {
      label: "Citas",
      icon: <FaClock />,
      content: (
        <div className="space-y-6">
          <div className="bg-[#f0f7ef] p-6 rounded-3xl border border-[#d1e4cf] shadow-sm">
            <h4 className="text-sm font-black text-[#065911] uppercase tracking-widest mb-4">Programar Cita</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2">
                <ITDatePicker
                  name="newSlotDate"
                  label="Día de la Cita"
                  value={newSlot.date ? new Date(newSlot.date + 'T12:00:00') : undefined}
                  minDate={formik.values.startDate}
                  maxDate={formik.values.endDate}
                  onChange={(e: any) => {
                    const d = e.target.value;
                    if (d instanceof Date) {
                        setNewSlot(prev => ({ ...prev, date: d.toISOString().split('T')[0] }));
                    }
                  }}
                />
              </div>
              <ITTimePicker
                name="startTime"
                label="Hora Inicio"
                value={newSlot.startTime}
                onChange={(val: any) => {
                  const timeStr = typeof val === 'object' && val?.target ? val.target.value : val;
                  setNewSlot(prev => ({ ...prev, startTime: typeof timeStr === 'string' ? timeStr : prev.startTime }));
                }}
                onBlur={() => {}}
              />
              <ITTimePicker
                name="endTime"
                label="Hora Fin"
                value={newSlot.endTime}
                onChange={(val: any) => {
                  const timeStr = typeof val === 'object' && val?.target ? val.target.value : val;
                  setNewSlot(prev => ({ ...prev, endTime: typeof timeStr === 'string' ? timeStr : prev.endTime }));
                }}
                onBlur={() => {}}
              />
              <div>
                <label className="text-[10px] font-bold text-[#54634d] uppercase mb-1 block px-1">Cupos</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    className="w-full border p-2 h-[38px] rounded-xl border-gray-300 bg-white text-sm"
                    value={newSlot.positions}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, positions: Number(e.target.value) }))}
                  />
                  <ITButton variant="solid" color="primary" onClick={handleAddSlot} type="button" className="!min-w-[40px] !h-[38px] !rounded-xl">+</ITButton>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Horarios Configurados</h4>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">
                TOTAL: {formik.values.slots.length}
              </span>
            </div>

            {formik.values.slots.length === 0 ? (
              <div className="text-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 italic text-sm">
                No has agregado horarios todavía. Usa el panel superior para programar citas.
              </div>
            ) : (
              Object.entries(
                formik.values.slots.reduce((acc: any, slot: any) => {
                  const dateKey = slot.date || "Sin fecha";
                  if (!acc[dateKey]) acc[dateKey] = [];
                  acc[dateKey].push(slot);
                  return acc;
                }, {})
              ).sort().map(([dateLabel, slots]: [string, any]) => (
                <div key={dateLabel} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">
                      {new Date(dateLabel + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{slots.length} Citas</span>
                  </div>
                  <div className="p-2 space-y-1">
                    {slots.map((slot: any) => {
                      const globalIndex = formik.values.slots.findIndex((s: any) => s === slot);
                      return (
                        <div key={globalIndex} className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group">
                          <div className="flex items-center gap-4">
                             <span className="text-sm font-bold text-slate-600">{slot.startTime} - {slot.endTime}</span>
                             <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                             <span className="text-[10px] font-black text-emerald-600 uppercase italic">{slot.positions} Lugares</span>
                          </div>
                          <button
                            type="button"
                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                            onClick={() => {
                              const newSlots = [...formik.values.slots];
                              newSlots.splice(globalIndex, 1);
                              formik.setFieldValue("slots", newSlots);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )
    },
    {
      label: "Revisión",
      icon: <FaCheckCircle />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <FaBriefcase size={80} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{formik.values.title}</h3>
                <p className="text-emerald-600 font-bold text-sm uppercase mb-4">{formik.values.department || 'Sin Departamento'}</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 block mb-1">Salario</span>
                        <span className="font-bold text-slate-800">${formik.values.salary || '0.00'}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 block mb-1">Posiciones</span>
                        <span className="font-bold text-slate-800">{formik.values.positions}</span>
                    </div>
                </div>
                {formik.values.description && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descripción</h4>
                      <p className="text-sm text-slate-600 leading-relaxed italic">{formik.values.description}</p>
                  </div>
                )}
                {formik.values.workShifts.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Horarios Operativos</h4>
                      <div className="flex flex-wrap gap-2">
                         {formik.values.workShifts.map((s: any, i: number) => (
                           <div key={i} className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-[11px]">
                              <span className="font-black text-emerald-800 uppercase">{s.name}:</span> {s.startTime} - {s.endTime}
                           </div>
                         ))}
                      </div>
                  </div>
                )}
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-xl shadow-emerald-600/20">
                <h4 className="text-xs font-black uppercase tracking-widest opacity-80 mb-4">Vigencia</h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="opacity-70">Desde:</span>
                        <span className="font-black">{formik.values.startDate?.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="opacity-70">Hasta:</span>
                        <span className="font-black">{formik.values.endDate?.toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/20">
                   <div className="flex justify-between items-center">
                       <span className="text-xs opacity-80 font-bold uppercase">Citas Programadas</span>
                       <span className="text-2xl font-black">{formik.values.slots.length}</span>
                   </div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Estado Inicial</h4>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                   <span className="text-sm font-bold text-slate-700">BORRADOR / PENDIENTE</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">La vacante se publicará como {initialData ? 'ACTIVA' : 'BORRADOR'} al confirmar.</p>
             </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      formik.handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  // Consolidated Auto-save logic
  useEffect(() => {
    if (!isPage || !onSaveDraft) return;
    const timer = setTimeout(() => {
        if (formik.dirty) {
            formik.validateForm().then(errors => {
                // Solo guardamos si no hay errores críticos
                if (Object.keys(errors).length === 0) {
                    onSaveDraft(sanitizeVacancyPayload(formik.values));
                }
            });
        }
    }, 10000); // Debounce de 10 segundos para no saturar
    return () => clearTimeout(timer);
  }, [formik.values, isPage, onSaveDraft, formik.dirty]);

  return (
    <div className="w-full max-w-6xl mx-auto py-4">
      {/* Container Principal */}
      <div className="bg-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-100 overflow-hidden min-h-[70vh] flex flex-col">
        {/* Header con Titulo */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-slate-930 tracking-tight">Configurador de Vacante</h2>
            <p className="text-sm text-slate-400 mt-1">Sigue los pasos para publicar tu oferta laboral y gestionar entrevistas.</p>
          </div>
          {initialData && (
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                formik.values.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 
                formik.values.status === 'PAUSED' ? 'bg-amber-100 text-amber-600' :
                formik.values.status === 'CLOSED' ? 'bg-red-100 text-red-600' :
                'bg-slate-100 text-slate-600'
            }`}>
                {formik.values.status === 'ACTIVE' ? 'ACTIVA' : 
                 formik.values.status === 'PAUSED' ? 'PAUSADA' :
                 formik.values.status === 'CLOSED' ? 'CERRADA' :
                 formik.values.status === 'CANCELLED' ? 'CANCELADA' : 'BORRADOR'}
            </div>
          )}
        </div>

        {/* Stepper Superior Personalizado */}
        <div className="relative px-8 lg:px-16 mb-8 mt-6">
          <div className="hidden md:flex justify-between items-center relative">
            {/* Background line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 rounded-full -z-10" />
            
            {steps.map((step, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center relative cursor-pointer group" 
                  onClick={() => setCurrentStep(index)}
                  style={{ width: `${100 / steps.length}%` }}
                >
                    {/* Active line filler */}
                    {index <= currentStep && index > 0 && (
                        <div 
                          className="absolute top-1/2 right-1/2 h-1 bg-emerald-500 -translate-y-1/2 -z-10 transition-all duration-500" 
                          style={{ width: '100%' }}
                        />
                    )}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 ${
                        index === currentStep 
                          ? 'bg-[#065911] text-white shadow-xl shadow-[#065911]/30 scale-110' 
                          : index < currentStep 
                            ? 'bg-emerald-100 text-[#065911] border-2 border-transparent group-hover:bg-emerald-200' 
                            : 'bg-white border-2 border-slate-200 text-slate-300 group-hover:border-emerald-300 group-hover:text-emerald-300'
                    }`}>
                        {step.icon || index + 1}
                    </div>
                </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-6">
            {steps.map((step, index) => (
                <div 
                  key={`label-${index}`} 
                  className="flex-col items-center relative text-center hidden md:flex" 
                  style={{ width: `${100 / steps.length}%` }}
                >
                    <span className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-300 ${
                        index === currentStep ? 'text-[#065911]' : 
                        index < currentStep ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                        {step.label}
                    </span>
                </div>
            ))}
          </div>

          {/* Mobile Text fallback */}
          <div className="md:hidden text-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Paso {currentStep + 1} de {steps.length}</span>
            <h3 className="text-xl font-black text-[#065911] mt-1">{steps[currentStep].label}</h3>
          </div>
        </div>

        {/* Contenido Dinámico */}
        <div className="flex-1 px-8 pb-8 overflow-y-auto">
          {steps[currentStep].content}
        </div>

        {/* Footer de Navegación */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <ITButton 
            variant="outline" 
            color="secondary" 
            onClick={handleBack}
            className="!rounded-2xl !px-8 h-12 border-slate-200 text-slate-500 hover:bg-white"
          >
            {currentStep === 0 ? "Salir" : "Atrás"}
          </ITButton>

          <div className="flex gap-4">
             {isPage && currentStep < steps.length - 1 && (
                <ITButton 
                    variant="outline" 
                    color="primary" 
                    onClick={() => onSaveDraft && onSaveDraft(formik.values)}
                    className="!rounded-2xl !px-6 h-12"
                >
                    Guardar Borrador
                </ITButton>
             )}
             <ITButton 
                variant="solid" 
                color="primary" 
                onClick={handleNext}
                disabled={formik.isSubmitting}
                className="!rounded-2xl !px-12 h-12 font-bold shadow-lg shadow-emerald-500/20"
             >
                {formik.isSubmitting ? "Enviando..." : (currentStep === steps.length - 1 ? (initialData ? "Actualizar" : "Publicar Ahora") : "Continuar")}
             </ITButton>
          </div>
        </div>
      </div>
    </div>
  );
};
