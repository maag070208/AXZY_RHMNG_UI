import { AppState } from "@app/core/store/store";
import { ITButton, ITDialog, ITLoader, ITTable } from "@axzydev/axzy_ui_system";
import { useEffect, useState } from "react";
import { FaEdit, FaEye } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { showToast } from "@app/core/store/toast/toast.slice";
import { Applicant, getApplicants, updateApplicantStatus } from "../service/applicants.service";

const ApplicantsPage = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: AppState) => state.auth);
  const dispatch = useDispatch();

  const [viewingApplicant, setViewingApplicant] = useState<Applicant | null>(null);
  const [editingStatus, setEditingStatus] = useState<Applicant | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  const fetchApplicants = async () => {
    setLoading(true);
    const res = await getApplicants();
    if (res.success && res.data) {
        setApplicants(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleStatusUpdate = async () => {
      if (!editingStatus) return;
      const res = await updateApplicantStatus(editingStatus.id, newStatus);
      if (res.success) {
          dispatch(showToast({ message: "Estado actualizado exitosamente", type: "success" }));
          setEditingStatus(null);
          fetchApplicants();
      } else {
          dispatch(showToast({ message: "Error al actualizar estado", type: "error" }));
      }
  };

  if (loading) return <div className="flex justify-center p-10"><ITLoader /></div>;

  return (
    <div className="p-6 bg-[#f6fbf4] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-[#1b1b1f] tracking-tight">Candidatos</h1>
           <p className="text-[#54634d] text-sm mt-1">Seguimiento de aspirantes y postulaciones</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e1e4d5] overflow-hidden">
        <ITTable
            data={applicants as any[]}
            columns={[
                { key: "id", label: "ID", type: "number", sortable: true },
                { 
                    key: "name", 
                    label: "Nombre completo", 
                    type: "string", 
                    sortable: true,
                    render: (row: Applicant) => (
                        <div className="font-bold text-[#1b1b1f]">{row.firstName} {row.lastName}</div>
                    )
                },
                { 
                    key: "vacancy", 
                    label: "Vacante", 
                    type: "string",
                    render: (row: Applicant) => (
                        <span>{row.vacancy?.title || 'N/A'}</span>
                    )
                },
                { key: "phone", label: "Teléfono", type: "string" },
                { 
                    key: "status",
                    label: "Estado",
                    type: "string",
                    render: (row: Applicant) => {
                        const colors: any = {
                           REGISTERED: "bg-gray-100 text-gray-800",
                           FORM_COMPLETED: "bg-blue-100 text-blue-800",
                           INTERVIEW_SCHEDULED: "bg-purple-100 text-purple-800",
                           INTERVIEWED: "bg-indigo-100 text-indigo-800",
                           HIRED: "bg-green-100 text-green-800",
                           REJECTED: "bg-red-100 text-red-800",
                        };
                        return (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[row.status] || 'bg-gray-100'}`}>
                             {row.status}
                          </span>
                        );
                    }
                },
                {
                    key: "actions",
                    label: "Acciones",
                    type: "actions",
                    actions: (row: Applicant) => (
                        <div className="flex items-center gap-2">
                             <ITButton
                                onClick={() => setViewingApplicant(row)}
                                size="small"
                                variant="ghost"
                                className="!p-2 text-slate-500 hover:text-slate-700"
                                title="Ver Detalles"
                             >
                                <FaEye />
                             </ITButton>
                             {user?.role !== "OPERATOR" && (
                                <ITButton
                                    onClick={() => {
                                        setEditingStatus(row);
                                        setNewStatus(row.status);
                                    }}
                                    size="small"
                                    variant="outlined"
                                    color="secondary"
                                    className="!p-2"
                                    title="Actualizar Estado"
                                >
                                    <FaEdit />
                                </ITButton>
                             )}
                        </div>
                    )
                }
            ]}
            itemsPerPageOptions={[10, 20, 50]}
            defaultItemsPerPage={20}
            title=""
        />
      </div>

      <ITDialog isOpen={!!viewingApplicant} onClose={() => setViewingApplicant(null)} title="Destalles del Candidato">
        {viewingApplicant && (
            <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div>
                        <p className="text-xs font-bold text-gray-500">Nombre</p>
                        <p className="text-sm">{viewingApplicant.firstName} {viewingApplicant.lastName}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500">Email</p>
                        <p className="text-sm">{viewingApplicant.email || 'N/A'}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div>
                         <p className="text-xs font-bold text-gray-500">Teléfono</p>
                         <p className="text-sm">{viewingApplicant.phone || 'N/A'}</p>
                    </div>
                    <div>
                         <p className="text-xs font-bold text-gray-500">Estado Actual</p>
                         <p className="text-sm font-semibold">{viewingApplicant.status}</p>
                    </div>
                </div>
                <div>
                     <p className="text-xs font-bold text-gray-500">Experiencia / Educación</p>
                     <p className="text-sm bg-gray-50 p-2 rounded mt-1">{viewingApplicant.experience || viewingApplicant.education || 'Sin datos registrados'}</p>
                </div>
                <div className="flex justify-end mt-4">
                    <ITButton color="secondary" onClick={() => setViewingApplicant(null)}>Cerrar</ITButton>
                </div>
            </div>
        )}
      </ITDialog>

      <ITDialog isOpen={!!editingStatus} onClose={() => setEditingStatus(null)} title="Actualizar Estado">
        {editingStatus && (
            <div className="p-4 space-y-4">
                <p className="text-sm text-gray-600 mb-4">Actualizando el estado para: <span className="font-bold">{editingStatus.firstName} {editingStatus.lastName}</span></p>
                
                <div>
                  <label className="text-sm font-semibold mb-1 block">Nuevo Estado</label>
                  <select
                    className="w-full border p-2 rounded-lg border-gray-300"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="REGISTERED">Registrado</option>
                    <option value="FORM_COMPLETED">Formulario Completado</option>
                    <option value="INTERVIEW_SCHEDULED">Entrevista Agendada</option>
                    <option value="INTERVIEWED">Entrevistado</option>
                    <option value="REJECTED">Rechazado</option>
                    <option value="HIRED">Contratado</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <ITButton variant="outlined" color="primary" onClick={() => setEditingStatus(null)}>Cancelar</ITButton>
                    <ITButton variant="solid" color="primary" onClick={handleStatusUpdate}>Actualizar</ITButton>
                </div>
            </div>
        )}
      </ITDialog>
    </div>
  );
};

export default ApplicantsPage;
