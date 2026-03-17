import { ITButton } from "@axzydev/axzy_ui_system";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Vacancy } from "../service/vacancies.service";

interface VacancyFormProps {
  initialData?: Vacancy;
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
}

export const VacancyForm = ({ initialData, onSubmit, onCancel }: VacancyFormProps) => {
  const formik = useFormik({
    initialValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      department: initialData?.department || "",
      salary: initialData?.salary || 0,
      positions: initialData?.positions || 1,
      status: initialData?.status || "ACTIVE",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("El título es obligatorio"),
      positions: Yup.number().min(1, "Al menos 1 posición").required("Requerido"),
    }),
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 p-4 text-[#1b1b1f]">
      <div>
        <label className="text-sm font-semibold mb-1 block">Título</label>
        <input
          name="title"
          className="w-full border p-2 rounded-lg border-gray-300"
          value={formik.values.title}
          onChange={formik.handleChange}
        />
        {formik.touched.title && formik.errors.title && (
          <div className="text-red-500 text-xs mt-1">{formik.errors.title}</div>
        )}
      </div>

      <div>
        <label className="text-sm font-semibold mb-1 block">Departamento</label>
        <input
          name="department"
          className="w-full border p-2 rounded-lg border-gray-300"
          value={formik.values.department}
          onChange={formik.handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold mb-1 block">Salario</label>
          <input
            name="salary"
            type="number"
            className="w-full border p-2 rounded-lg border-gray-300"
            value={formik.values.salary}
            onChange={formik.handleChange}
          />
        </div>
        <div>
          <label className="text-sm font-semibold mb-1 block">Posiciones</label>
          <input
            name="positions"
            type="number"
            className="w-full border p-2 rounded-lg border-gray-300"
            value={formik.values.positions}
            onChange={formik.handleChange}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold mb-1 block">Descripción</label>
        <textarea
          name="description"
          className="w-full border p-2 rounded-lg border-gray-300"
          rows={3}
          value={formik.values.description}
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
            <option value="DRAFT">Borrador</option>
            <option value="ACTIVE">Activa</option>
            <option value="PAUSED">Pausada</option>
            <option value="CLOSED">Cerrada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-4">
        <ITButton variant="outlined" color="primary" onClick={onCancel} type="button">Cancelar</ITButton>
        <ITButton variant="solid" color="primary" type="submit" className="disabled:opacity-50">
          {formik.isSubmitting ? "Guardando..." : (initialData ? "Guardar" : "Crear")}
        </ITButton>
      </div>
    </form>
  );
};
