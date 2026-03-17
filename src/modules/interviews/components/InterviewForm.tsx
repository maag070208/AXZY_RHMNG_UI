import { ITButton } from "@axzydev/axzy_ui_system";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { Applicant, getApplicants } from "../../applicants/service/applicants.service";
import { getVacancies, Vacancy } from "../../vacancies/service/vacancies.service";
import { Interview } from "../service/interviews.service";

interface InterviewFormProps {
  initialData?: Interview;
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
}

export const InterviewForm = ({ initialData, onSubmit, onCancel }: InterviewFormProps) => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  useEffect(() => {
    getVacancies("ACTIVE").then(res => setVacancies(res.data || []));
    getApplicants().then(res => setApplicants(res.data || []));
  }, []);

  // Set minimum date to today for scheduler
  const currentDateTimeString = new Date().toISOString().slice(0, 16);

  const formik = useFormik({
    initialValues: {
      vacancyId: initialData?.vacancyId || "",
      applicantId: initialData?.applicantId || "",
      scheduledAt: initialData?.scheduledAt 
          ? new Date(initialData.scheduledAt).toISOString().slice(0,16) 
          : "",
      notes: initialData?.notes || "",
      status: initialData?.status || "SCHEDULED",
    },
    validationSchema: Yup.object({
      vacancyId: Yup.string().required("Debes seleccionar una vacante"),
      applicantId: Yup.string().required("Debes seleccionar un candidato"),
      scheduledAt: Yup.string().required("La fecha y hora son obligatorias"),
    }),
    onSubmit: async (values) => {
      await onSubmit({
        ...values,
        vacancyId: Number(values.vacancyId),
        applicantId: Number(values.applicantId),
        scheduledAt: new Date(values.scheduledAt).toISOString()
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 p-4 text-[#1b1b1f]">
      
      {!initialData && (
          <>
            <div>
              <label className="text-sm font-semibold mb-1 block">Vacante</label>
              <select
                name="vacancyId"
                className="w-full border p-2 rounded-lg border-gray-300"
                value={formik.values.vacancyId}
                onChange={formik.handleChange}
              >
                <option value="" disabled>Selecciona una vacante</option>
                {vacancies.map((v) => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                ))}
              </select>
              {formik.touched.vacancyId && formik.errors.vacancyId && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.vacancyId}</div>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Candidato</label>
              <select
                name="applicantId"
                className="w-full border p-2 rounded-lg border-gray-300"
                value={formik.values.applicantId}
                onChange={formik.handleChange}
              >
                <option value="" disabled>Selecciona un candidato</option>
                {applicants.map((a) => (
                    <option key={a.id} value={a.id}>{a.firstName} {a.lastName} ({a.email})</option>
                ))}
              </select>
              {formik.touched.applicantId && formik.errors.applicantId && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.applicantId}</div>
              )}
            </div>
          </>
      )}

      <div>
        <label className="text-sm font-semibold mb-1 block">Fecha y Hora</label>
        <input
          type="datetime-local"
          name="scheduledAt"
          min={currentDateTimeString}
          className="w-full border p-2 rounded-lg border-gray-300"
          value={formik.values.scheduledAt}
          onChange={formik.handleChange}
        />
        {formik.touched.scheduledAt && formik.errors.scheduledAt && (
          <div className="text-red-500 text-xs mt-1">{formik.errors.scheduledAt}</div>
        )}
      </div>

      <div>
        <label className="text-sm font-semibold mb-1 block">Notas / Link de reunión</label>
        <textarea
          name="notes"
          className="w-full border p-2 rounded-lg border-gray-300"
          rows={3}
          value={formik.values.notes}
          onChange={formik.handleChange}
        />
      </div>

      {initialData && (
        <div>
          <label className="text-sm font-semibold mb-1 block">Estado</label>
          <select
            name="status"
            className="w-full border p-2 rounded-lg border-gray-300"
            value={formik.values.status}
            onChange={formik.handleChange}
          >
            <option value="SCHEDULED">Programada</option>
            <option value="COMPLETED">Completada</option>
            <option value="CANCELLED">Cancelada</option>
            <option value="NO_SHOW">No Asistió</option>
          </select>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-4">
        <ITButton variant="outlined" color="primary" onClick={onCancel} type="button">Cancelar</ITButton>
        <ITButton variant="solid" color="primary" type="submit" className="disabled:opacity-50">
          {formik.isSubmitting ? "Cargando..." : (initialData ? "Actualizar" : "Agendar")}
        </ITButton>
      </div>
    </form>
  );
};
