import { AppState } from "@app/core/store/store";
import { useEffect, useState } from "react";
import { FaChild, FaListAlt, FaUserTie, FaUsers } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { HomeCardItem } from "../components/HomeCardItem";

const HomePage = () => {
  const navigate = useNavigate();
  const user = useSelector((state: AppState) => state.auth);

  const [homeCardItem, setHomeCardItem] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !user.token) {
      navigate("/login");
      return;
    }

    const cards = [
      {
        title: "Vacantes",
        description: "Gestionar ofertas de empleo",
        icon: <FaListAlt className="text-white" />,
        action: () => navigate("/vacancies"),
      },
      {
        title: "Candidatos",
        description: "Seguimiento de aspirantes",
        icon: <FaUsers className="text-white" />,
        action: () => navigate("/applicants"),
      },
      {
        title: "Entrevistas",
        description: "Programación de entrevistas",
        icon: <FaUserTie className="text-white" />,
        action: () => navigate("/interviews"),
      }
    ];

    if (user.role === "ADMIN") {
        cards.push(
            {
              title: "Usuarios",
              description: "Administrar usuarios del sistema",
              icon: <FaChild className="text-white" />,
              action: () => navigate("/users"),
            }
        );
    }
    
    setHomeCardItem(cards);
  }, [user]);

  return (
    <div className="bg-[#f6fbf4] min-h-screen p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto relative z-10">
          {homeCardItem.map((item, index) => (
            <HomeCardItem key={index} item={item} index={index} />
          ))}
        </div>
    </div>
  );
};

export default HomePage;

