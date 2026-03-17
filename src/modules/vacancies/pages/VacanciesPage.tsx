import { AppState } from "@app/core/store/store";
import { ITButton, ITDialog, ITLoader, ITTable } from "@axzydev/axzy_ui_system";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaQrcode } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "@app/core/store/toast/toast.slice";
import { VacancyForm } from "../components/VacancyForm";
import { createVacancy, getVacancies, updateVacancy, Vacancy } from "../service/vacancies.service";

const VacanciesPage = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state: AppState) => state.auth);

  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);

  const fetchVacancies = async () => {
    setLoading(true);
    const res = await getVacancies();
    if (res.success && res.data) {
        setVacancies(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  const handleCreate = async (data: any) => {
    await createVacancy(data);
    setIsModalOpen(false);
    fetchVacancies();
  };

  const handleEdit = async (data: any) => {
      if (!editingVacancy) return;
      await updateVacancy(editingVacancy.id, data);
      setEditingVacancy(null);
      fetchVacancies();
  };

  const handlePrintQR = async (vacancy: Vacancy) => {
      try {
          if (!vacancy.qrToken) {
            dispatch(showToast({ message: "La vacante no tiene un código QR asignado", type: "warning" }));
            return;
          }

          // Build public URL context
          const applyUrl = `${window.location.origin}/apply/${vacancy.qrToken}`;
          const qrDataUrl = await QRCode.toDataURL(applyUrl, { width: 300 });

          const printWindow = window.open('', '_blank');
          if (!printWindow) {
              dispatch(showToast({ message: "Habilita los pop-ups para imprimir.", type: "warning" }));
              return;
          }

          printWindow.document.write(`
              <html>
                  <head>
                      <style>
                          body {
                              display: flex;
                              flex-direction: column;
                              align-items: center;
                              justify-content: center;
                              height: 100vh;
                              margin: 0;
                              font-family: Arial, sans-serif;
                          }
                          .container {
                              text-align: center;
                              border: 2px solid #000;
                              padding: 40px;
                              border-radius: 20px;
                          }
                          img { margin-bottom: 20px; }
                          h1 { font-size: 28px; margin: 0; color: #1b1b1f; }
                          h2 { font-size: 20px; color: #54634d; margin-top: 5px; }
                          p { font-size: 16px; color: #555; }
                      </style>
                  </head>
                  <body>
                      <div class="container">
                          <h2>Únete a nuestro equipo</h2>
                          <h1>${vacancy.title}</h1>
                          <p>${vacancy.department || 'Sin área definida'}</p>
                          <img src="${qrDataUrl}" alt="QR Code" />
                          <p>Escanea para aplicar</p>
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
                onClick={() => setIsModalOpen(true)}
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
                    key: "status",
                    label: "Estado",
                    type: "string",
                    render: (row: Vacancy) => {
                        const colors: any = {
                           DRAFT: "bg-gray-100 text-gray-800",
                           ACTIVE: "bg-green-100 text-green-800",
                           PAUSED: "bg-yellow-100 text-yellow-800",
                           CLOSED: "bg-red-100 text-red-800",
                           CANCELLED: "bg-red-100 text-red-800",
                        };
                        return (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[row.status]}`}>
                             {row.status}
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
                                onClick={() => handlePrintQR(row)}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                className="!p-2"
                                title="Imprimir QR Candidatos"
                             >
                                <FaQrcode />
                             </ITButton>
                             {user?.role !== "RECLUTADOR" && (
                                <ITButton
                                    onClick={() => setEditingVacancy(row)}
                                    size="small"
                                    variant="ghost"
                                    className="!p-2 text-slate-500 hover:text-slate-700"
                                    title="Editar"
                                >
                                    <FaEdit />
                                </ITButton>
                             )}
                        </div>
                    )
                }
            ]}
            itemsPerPageOptions={[10, 20, 50]}
            defaultItemsPerPage={10}
            title=""
        />
      </div>

      <ITDialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Vacante">
        <VacancyForm onSubmit={handleCreate} onCancel={() => setIsModalOpen(false)} />
      </ITDialog>

      <ITDialog isOpen={!!editingVacancy} onClose={() => setEditingVacancy(null)} title="Editar Vacante">
        {editingVacancy && (
            <VacancyForm 
                initialData={editingVacancy}
                onSubmit={handleEdit} 
                onCancel={() => setEditingVacancy(null)} 
            />
        )}
      </ITDialog>
    </div>
  );
};

export default VacanciesPage;
