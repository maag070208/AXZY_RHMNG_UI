import { AppState } from "@app/core/store/store";
import { ITBadget, ITButton, ITLoader, ITTable, ITDialog } from "@axzydev/axzy_ui_system";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { FaEdit, FaExternalLinkAlt, FaPlus, FaQrcode, FaSyncAlt, FaUsers, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showToast } from "@app/core/store/toast/toast.slice";
import { getVacancies, updateVacancy, deleteVacancy, Vacancy } from "../service/vacancies.service";

const VacanciesPage = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusVacancy, setStatusVacancy] = useState<Vacancy | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: AppState) => state.auth);
  
  const [vacancyToDelete, setVacancyToDelete] = useState<Vacancy | null>(null);

  const fetchVacancies = async () => {
    setLoading(true);
    const res = await getVacancies();
    if (res.success && res.data) {
        setVacancies(res.data);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!vacancyToDelete) return;
    const res = await deleteVacancy(vacancyToDelete.id);
    if (res.success) {
        dispatch(showToast({ message: "Vacante eliminada correctamente", type: "success" }));
        setVacancyToDelete(null);
        fetchVacancies();
    } else {
        dispatch(showToast({ message: "Error al eliminar la vacante", type: "error" }));
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!statusVacancy) return;
    const res = await updateVacancy(statusVacancy.id, { status: newStatus as any });
    if (res.success) {
        dispatch(showToast({ message: `Estado actualizado a ${newStatus}`, type: "success" }));
        setStatusVacancy(null);
        fetchVacancies();
    } else {
        dispatch(showToast({ message: "Error al actualizar estado", type: "error" }));
    }
  };

  const handlePrintQR = async (vacancy: Vacancy) => {
      try {
          if (!vacancy.qrToken) {
            dispatch(showToast({ message: "La vacante no tiene un código QR asignado", type: "warning" }));
            return;
          }

          // Build public URL context
          const applyUrl = `${window.location.origin}/#/apply/${vacancy.qrToken}`;
          const qrDataUrl = await QRCode.toDataURL(applyUrl, { width: 300 });

          const printWindow = window.open('', '_blank');
          if (!printWindow) {
              dispatch(showToast({ message: "Habilita los pop-ups para imprimir.", type: "warning" }));
              return;
          }

          printWindow.document.write(`
              <html>
                  <head>
                      <title>QR Reclutamiento - ${vacancy.title}</title>
                      <link rel="preconnect" href="https://fonts.googleapis.com">
                      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap" rel="stylesheet">
                      <style>
                          body {
                              display: flex;
                              flex-direction: column;
                              align-items: center;
                              justify-content: center;
                              min-height: 100vh;
                              margin: 0;
                              font-family: 'Outfit', sans-serif;
                              background-color: #f8fafc;
                              -webkit-print-color-adjust: exact;
                          }
                          .poster {
                              width: 80%;
                              max-width: 600px;
                              background: white;
                              border-radius: 40px;
                              overflow: hidden;
                              box-shadow: 0 20px 50px rgba(6, 89, 17, 0.1);
                              text-align: center;
                              border: 1px solid #e2e8f0;
                              position: relative;
                          }
                          .header {
                              background: linear-gradient(135deg, #065911 0%, #086f16 100%);
                              padding: 60px 40px;
                              color: white;
                          }
                          .badge {
                              display: inline-block;
                              background: rgba(255, 255, 255, 0.2);
                              padding: 8px 20px;
                              border-radius: 100px;
                              font-size: 14px;
                              font-weight: 800;
                              text-transform: uppercase;
                              letter-spacing: 2px;
                              margin-bottom: 20px;
                              backdrop-filter: blur(10px);
                              border: 1px solid rgba(255, 255, 255, 0.3);
                          }
                          h1 { 
                            font-size: 42px; 
                            font-weight: 900; 
                            margin: 0; 
                            line-height: 1.1;
                            letter-spacing: -1px;
                          }
                          .subtitle {
                              font-size: 20px;
                              opacity: 0.9;
                              margin-top: 15px;
                              font-weight: 500;
                          }
                          .content {
                              padding: 60px 40px;
                              display: flex;
                              flex-direction: column;
                              align-items: center;
                          }
                          .qr-wrapper {
                              background: #f1f5f9;
                              padding: 30px;
                              border-radius: 30px;
                              margin-bottom: 30px;
                              border: 2px dashed #cbd5e1;
                          }
                          .qr-wrapper img {
                              display: block;
                              width: 250px;
                              height: 250px;
                          }
                          .footer-text {
                              font-size: 18px;
                              color: #64748b;
                              margin-bottom: 5px;
                          }
                          .footer-cta {
                              font-size: 24px;
                              font-weight: 800;
                              color: #065911;
                              text-transform: uppercase;
                              letter-spacing: 1px;
                          }
                          .decor {
                              position: absolute;
                              bottom: -50px;
                              right: -50px;
                              width: 200px;
                              height: 200px;
                              background: #065911;
                              opacity: 0.03;
                              border-radius: 50%;
                          }
                          @media print {
                              body { background: white; }
                              .poster { box-shadow: none; border-color: #eee; }
                          }
                      </style>
                  </head>
                  <body>
                      <div class="poster">
                          <div class="header">
                              <span class="badge">Vacante Disponible</span>
                              <h1>${vacancy.title}</h1>
                              <div class="subtitle">${vacancy.department || 'Área de Operaciones'}</div>
                          </div>
                          <div class="content">
                              <div class="qr-wrapper">
                                  <img src="${qrDataUrl}" alt="QR Code" />
                              </div>
                              <p class="footer-text">¡Postúlate ahora!</p>
                              <p class="footer-cta">Escanea el código QR</p>
                          </div>
                          <div class="decor"></div>
                      </div>
                      <script>
                          window.onload = function() {
                              window.print();
                              window.onafterprint = function() {
                                  window.close();
                              }
                          }
                      </script>
                  </body>
              </html>
          `);
          printWindow.document.close();

      } catch (error) {
          dispatch(showToast({ message: "Error al generar el código QR", type: "error" }));
      }
  };

  if (loading) return <div className="flex justify-center p-10"><ITLoader /></div>;

  return (
    <div className="p-6 bg-[#f6fbf4] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-[#1b1b1f] tracking-tight">Vacantes</h1>
           <p className="text-[#54634d] text-sm mt-1">Gestión de ofertas laborales</p>
        </div>
        {user?.role !== "RECLUTADOR" && (
            <button 
                onClick={() => navigate("/vacancies/new")}
                className="flex items-center gap-2 bg-[#065911] text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-[#086f16] transition-colors"
            >
                <FaPlus className="text-xs" />
                <span>Nueva Vacante</span>
            </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e1e4d5] overflow-hidden">
        <ITTable
            data={vacancies as any[]}
            columns={[
                { key: "id", label: "ID", type: "number", sortable: true },
                { 
                    key: "title", 
                    label: "Puesto", 
                    type: "string", 
                    sortable: true,
                    render: (row: Vacancy) => (
                        <div className="font-bold text-[#1b1b1f]">{row.title}</div>
                    )
                },
                { key: "department", label: "Departamento", type: "string" },
                { key: "positions", label: "Plazas", type: "number" },
                { 
                    key: "workSchedule", 
                    label: "Horario Laboral", 
                    type: "string",
                    render: (row: Vacancy) => {
                        if (!row.workSchedule) return <span className="text-gray-400 font-medium italic text-xs">No definido</span>;
                        
                        try {
                            if (row.workSchedule.startsWith('[')) {
                                const shifts = JSON.parse(row.workSchedule);
                                return (
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        {shifts.map((s: any, i: number) => (
                                            <ITBadget key={i} variant="outlined" color="success" size="small" className="!text-[10px] !px-1.5 whitespace-nowrap">
                                                {s.name}: {s.startTime}-{s.endTime}
                                            </ITBadget>
                                        ))}
                                    </div>
                                );
                            }
                        } catch (e) {}

                        return (
                            <ITBadget variant="outlined" color="secondary" size="small" className="!text-[10px] !px-1.5 truncate max-w-[150px]">
                                {row.workSchedule}
                            </ITBadget>
                        );
                    }
                },
                { 
                    key: "appointmentTime", 
                    label: "Horarios Cita", 
                    type: "string",
                    render: (row: Vacancy) => {
                        const slots = row.slots || [];
                        if (slots.length === 0) return <span className="text-gray-400">-</span>;
                        const first = slots[0];
                        const start = new Date(first.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const end = new Date(first.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-blue-600">{start} - {end}</span>
                                {slots.length > 1 && <span className="text-[10px] text-gray-500">+{slots.length - 1} más</span>}
                            </div>
                        );
                    }
                },
                { 
                    key: "status",
                    label: "Estado",
                    type: "string",
                    render: (row: Vacancy) => {
                        const statusMap: any = {
                           DRAFT: { label: "Borrador", color: "bg-gray-100 text-gray-800" },
                           ACTIVE: { label: "Activa", color: "bg-green-100 text-green-800" },
                           PAUSED: { label: "Pausada", color: "bg-yellow-100 text-yellow-800" },
                           CLOSED: { label: "Cerrada", color: "bg-red-100 text-red-800" },
                           CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-800" },
                        };
                        const current = statusMap[row.status] || { label: row.status, color: "bg-gray-100" };
                        return (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${current.color}`}>
                             {current.label}
                          </span>
                        );
                    }
                },
                {
                    key: "actions",
                    label: "Acciones",
                    type: "actions",
                    actions: (row: Vacancy) => (
                        <div className="flex items-center gap-2">
                             <ITButton
                                onClick={() => navigate(`/vacancies/${row.id}/applicants`)}
                                variant="outlined"
                                size="small"
                                className="!p-2 text-amber-500"
                                title="Ver Candidatos"
                             >
                                <FaUsers />
                             </ITButton>
                             <ITButton
                                onClick={() => setStatusVacancy(row)}
                                size="small"
                                variant="outlined"
                                color="warning"
                                className="!p-2 text-amber-500"
                                title="Cambiar Estado"
                             >
                                <FaSyncAlt />
                             </ITButton>
                             <ITButton
                                onClick={() => handlePrintQR(row)}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                className="!p-2"
                                title="Imprimir QR Candidatos"
                             >
                                <FaQrcode />
                             </ITButton>
                             <ITButton
                                onClick={() => window.open(`${window.location.origin}/#/apply/${row.qrToken}`, '_blank')}
                                size="small"
                                variant="outlined"
                                color="primary"
                                className="!p-2"
                                title="Probar link de postulación"
                             >
                                <FaExternalLinkAlt />
                             </ITButton>
                             {user?.role !== "RECLUTADOR" && (
                                <ITButton
                                    onClick={() => navigate(`/vacancies/edit/${row.id}`)}
                                    size="small"
                                variant="outlined"
                                    className="!p-2 text-slate-500 hover:text-slate-700"
                                    title="Editar"
                                >
                                    <FaEdit />
                                </ITButton>
                             )}
                             <ITButton
                                onClick={() => setVacancyToDelete(row)}
                                size="small"
                                variant="outlined"
                                color="danger"
                                className="!p-2 text-red-500"
                                title="Eliminar Vacante"
                             >
                                <FaTrash />
                             </ITButton>
                        </div>
                    )
                }
            ]}
            itemsPerPageOptions={[10, 20, 50]}
            defaultItemsPerPage={10}
            title=""
        />
      </div>

      {/* Modal de Actualización de Estado */}
      <ITDialog 
        isOpen={!!statusVacancy} 
        onClose={() => setStatusVacancy(null)}
        title="Actualizar Estado de Vacante"
      >
        <div className="p-6">
            <p className="text-sm text-slate-500 mb-6">Selecciona el nuevo estado para la vacante <span className="font-bold text-slate-800">{statusVacancy?.title}</span></p>
            <div className="grid grid-cols-2 gap-3">
                {[
                    { val: 'ACTIVE', label: 'Activa', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
                    { val: 'PAUSED', label: 'Pausada', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
                    { val: 'CLOSED', label: 'Cerrada', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
                    { val: 'CANCELLED', label: 'Cancelada', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
                    { val: 'DRAFT', label: 'Borrador', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
                ].map((st) => (
                    <button
                        key={st.val}
                        onClick={() => handleUpdateStatus(st.val)}
                        className={`p-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${st.color} ${statusVacancy?.status === st.val ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                    >
                        {st.label}
                    </button>
                ))}
            </div>
            <div className="mt-8 flex justify-end">
                <ITButton variant="outlined" color="secondary" onClick={() => setStatusVacancy(null)}>
                    Cancelar
                </ITButton>
            </div>
        </div>
      </ITDialog>

      {/* Modal de Confirmación de Eliminación */}
      <ITDialog
        isOpen={!!vacancyToDelete}
        onClose={() => setVacancyToDelete(null)}
        title="Confirmar Eliminación"
      >
        <div className="p-6">
            <p className="text-[#1b1b1f] text-base mb-6">
                ¿Estás seguro de que deseas eliminar la vacante <span className="font-bold">{vacancyToDelete?.title}</span>? Esta acción no se puede deshacer y podría afectar a los candidatos postulados.
            </p>
            <div className="flex justify-end gap-3">
                <ITButton variant="outlined" color="secondary" onClick={() => setVacancyToDelete(null)}>
                    Cancelar
                </ITButton>
                <ITButton variant="solid" className="bg-red-600 hover:bg-red-700 text-white border-0" onClick={handleDelete}>
                    Eliminar
                </ITButton>
            </div>
        </div>
      </ITDialog>
    </div>
  );
};

export default VacanciesPage;
