import { NavLink, useNavigate } from "react-router-dom";
import { BarChart3, ClipboardList, Droplet, LayoutDashboard, LogOut, PlusCircle } from "lucide-react";
import { clearSession } from "../api";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/readings/new", label: "Add Reading", icon: PlusCircle },
  { to: "/readings", label: "My Readings", icon: ClipboardList },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

function Sidebar({ isOpen, onNavigate }) {
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    navigate("/login");
  }

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="brand">
        <Droplet size={22} />
        Sweety
      </div>

      <nav className="nav-list">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={onNavigate}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <button className="logout-button" onClick={handleLogout}>
        <LogOut size={18} />
        Log out
      </button>
    </aside>
  );
}

export default Sidebar;