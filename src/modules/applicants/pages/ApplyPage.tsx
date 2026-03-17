import { ITButton } from "@axzydev/axzy_ui_system";
import { useFormik } from "formik";
import { useState } from "react";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
import { applyPublic } from "../service/applicants.service";

const ApplyPage = () => {
  const { qrToken } = useParams<{ qrToken: string }>();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      experience: "",
      education: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("El nombre es obligatorio"),
      lastName: Yup.string().required("El apellido es obligatorio"),
      email: Yup.string().email("Correo inválido").required("El correo es obligatorio"),
      phone: Yup.string().required("El teléfono es obligatorio"),
    }),
    onSubmit: async (values) => {
      if (!qrToken) {
        setError("El enlace de postulación no es válido o carece de token.");
        return;
      }
      
      const payload = {
          ...values,
          formData: {} // extra json data if any
      };

      const result = await applyPublic(qrToken, payload);
      
      if (result.success) {
         setSubmitted(true);
         setError("");
      } else {
         setError(result.messages?.[0] || "Hubo un error procesando su postulación. Intente más tarde.");
      }
    },
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg text-center border border-[#e1e4d5]">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
          <h2 className="text-2xl font-bold text-[#1b1b1f] mb-2">¡Postulación Enviada!</h2>
          <p className="text-[#54634d]">Hemos recibido su información correctamente. Nuestro equipo de Recursos Humanos se pondrá en contacto pronto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">Únete al equipo</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Por favor, completa la siguiente información para procesar tu postulación.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 relative">
          
          {error && (
            <div className="bg-red-50 p-3 rounded-lg mb-6 border border-red-200">
                <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre</label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#065911] focus:border-[#065911] sm:text-sm"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                    />
                    {formik.touched.firstName && formik.errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.firstName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellidos</label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#065911] focus:border-[#065911] sm:text-sm"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                    />
                    {formik.touched.lastName && formik.errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.lastName}</p>
                    )}
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#065911] focus:border-[#065911] sm:text-sm"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                    />
                    {formik.touched.email && formik.errors.email && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#065911] focus:border-[#065911] sm:text-sm"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                    />
                    {formik.touched.phone && formik.errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.phone}</p>
                    )}
                  </div>
                </div>
            </div>

            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700">Último grado de estudios</label>
              <div className="mt-1">
                <input
                  id="education"
                  name="education"
                  type="text"
                  placeholder="Ej. Ing. en Sistemas (Trunco)"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#065911] focus:border-[#065911] sm:text-sm"
                  value={formik.values.education}
                  onChange={formik.handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Experiencia Laboral Resumida</label>
              <div className="mt-1">
                <textarea
                  id="experience"
                  name="experience"
                  rows={4}
                  placeholder="Menciona tus últimos dos empleos y cuánto tiempo estuviste."
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-[#065911] focus:border-[#065911] sm:text-sm"
                  value={formik.values.experience}
                  onChange={formik.handleChange}
                />
              </div>
            </div>

            <div className="pt-4">
              <ITButton 
                type="submit" 
                variant="solid" 
                color="primary" 
                className="w-full justify-center !text-lg !py-3 disabled:opacity-50"
              >
                {formik.isSubmitting ? "Enviando..." : "Enviar Postulación"}
              </ITButton>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
