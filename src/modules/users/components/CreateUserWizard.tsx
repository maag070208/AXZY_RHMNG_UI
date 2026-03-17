import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ITInput, ITSelect, ITButton } from "@axzydev/axzy_ui_system";
import { createUser, updateUser, User } from "../services/UserService";
import { useDispatch } from "react-redux";
import { showToast } from "@app/core/store/toast/toast.slice";

interface Props {
  userToEdit?: User;
  onCancel: () => void;
  onSuccess: () => void;
}


import { FaEye, FaEyeSlash } from "react-icons/fa";

export const CreateUserWizard: React.FC<Props> = ({ userToEdit, onCancel, onSuccess }) => {
  const isEditing = !!userToEdit;
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const formik = useFormik({
    initialValues: {
      name: userToEdit?.name || "",
      lastName: userToEdit?.lastName || "",
      username: userToEdit?.username || "",
      password: "",
      confirmPassword: "",
      role: userToEdit?.role || "OPERATOR",
      shiftStart: userToEdit?.shiftStart || "",
      shiftEnd: userToEdit?.shiftEnd || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Requerido"),
      lastName: Yup.string().required("Requerido"),
      username: Yup.string().required("Requerido"),
      password: isEditing 
        ? Yup.string().notRequired() 
        : Yup.string().min(6, "Mínimo 6 caracteres").required("Requerido"),
      confirmPassword: isEditing 
        ? Yup.string().notRequired() 
        : Yup.string()
        .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
        .required("Requerido"),
        role: Yup.string().required("Requerido"),
    }),
    onSubmit: async (values) => {
      let res;
      if (isEditing && userToEdit) {
          res = await updateUser(userToEdit.id, {
            name: values.name,
            lastName: values.lastName,
            role: values.role,
          } as any);
      } else {
          res = await createUser({
            name: values.name,
            lastName: values.lastName,
            username: values.username,
            password: values.password,
            role: values.role,
          } as any);
      }

      if (res.success) {
        dispatch(showToast({ message: isEditing ? "Usuario editado correctamente" : "Usuario creado correctamente", type: "success" }));
        onSuccess();
      } else {
        dispatch(showToast({ message: isEditing ? "Error al editar usuario" : "Error al crear usuario", type: "error" }));
      }
    },
  });

  const steps = [
    {
      label: "Datos Personales",
      content: (
        <div className="flex flex-col gap-4 p-4">
          <ITInput
            label="Nombre"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.name}
            touched={formik.touched.name}
          />
          <ITInput
            label="Apellido"
            name="lastName"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.lastName}
            touched={formik.touched.lastName}
          />
          <ITInput
            label="Nombre de Usuario"
            name="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.username}
            touched={formik.touched.username}
          />
        </div>
      ),
    },
    {
      label: "Seguridad y Rol",
      content: (
        <div className="flex flex-col gap-4 p-4">
            {!isEditing && (
              <>
              <div className="relative">
              <ITInput
              label="Contraseña"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.password}
              touched={formik.touched.password}
            />
             <button
              type="button"
              className="absolute right-3 top-[2.7rem] text-slate-500 hover:text-slate-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            </div>
            <div className="relative">
            <ITInput
              label="Confirmar Contraseña"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.confirmPassword}
              touched={formik.touched.confirmPassword}
            />
            <button
              type="button"
              className="absolute right-3 top-[2.7rem] text-slate-500 hover:text-slate-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            </div>
            </>
            )}
          <ITSelect
            label="Rol"
            name="role"
            value={formik.values.role}
            onChange={formik.handleChange}
            options={[
              { label: "Administrador", value: "ADMIN" },
              { label: "Recursos Humanos", value: "RECURSOS_HUMANOS" },
              { label: "Reclutador", value: "RECLUTADOR" },
            ]}
            error={formik.errors.role}
            touched={formik.touched.role}
          />
          
        </div>
      ),
    },
    {
      label: "Confirmación",
      content: (
        <div className="flex flex-col gap-4 p-4">
          <h3 className="text-lg font-semibold">Resumen de Datos</h3>
          <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-4 rounded-lg">
            <span className="font-medium text-slate-600">Nombre:</span>
            <span className="text-slate-900">{formik.values.name} {formik.values.lastName}</span>
            <span className="font-medium text-slate-600">Usuario:</span>
            <span className="text-slate-900">{formik.values.username}</span>
            <span className="font-medium text-slate-600">Rol:</span>
            <span className="text-slate-900">{formik.values.role}</span>
          </div>
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
             Por favor verifica que la información sea correcta antes de confirmar.
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
      // Basic validation trigger could go here if needed, but Formik handles it on submit usually.
      // For wizard, we might want to validate current step fields.
      // Simple implementation: just move next for now, Formik validates on submit.
      // Ideally check errors for fields in current step.
      if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
      } else {
          formik.submitForm();
      }
  };

  const handleBack = () => {
      if (currentStep > 0) {
          setCurrentStep(currentStep - 1);
      }
  };

  return (
    <div className="w-full">
        {/* Title Header */}
        <div className="mb-8 px-4 text-center mt-4">
            <h2 className="text-2xl font-bold text-slate-800">
                {isEditing ? 'Editar Usuario' : 'Alta de Usuario'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
                {isEditing ? 'Modifica los datos y permisos del usuario' : 'Ingresa los datos para registrar un nuevo perfil'}
            </p>
        </div>

        {/* Stepper Header */}
        <div className="flex justify-between mb-8 px-4">
            {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-200 ${
                        index === currentStep ? 'border-indigo-600 bg-indigo-600 text-white' : 
                        index < currentStep ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-300 text-gray-400'
                    }`}>
                        {index + 1}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${index === currentStep ? 'text-indigo-600' : 'text-gray-500'}`}>
                        {step.label}
                    </span>
                    {index < steps.length - 1 && (
                        <div className="hidden md:block absolute w-full h-0.5 bg-gray-200 top-4 left-1/2 -z-10" />
                    )}
                </div>
            ))}
        </div>

        {/* Step Content */}
        <div className="mb-8">
            {steps[currentStep].content}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between px-4 pt-6 pb-2 border-t border-slate-100 mt-4">
            <div>
                 {currentStep === 0 ? (
                    <ITButton color="secondary" variant="outlined" onClick={onCancel}>Cancelar</ITButton>
                 ) : (
                    <ITButton color="secondary" variant="outlined" onClick={handleBack}>Atrás</ITButton>
                 )}
            </div>
            <ITButton 
                onClick={handleNext} 
                disabled={formik.isSubmitting}
            >
                {currentStep === steps.length - 1 ? (
                    formik.isSubmitting ? 'Guardando...' : (isEditing ? 'Confirmar y Guardar Cambios' : 'Confirmar y Crear')
                ) : 'Siguiente'}
            </ITButton>
        </div>
    </div>
  );
};
