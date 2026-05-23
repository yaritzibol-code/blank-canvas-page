import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Zap,
  Play,
  Library,
  BarChart3,
  Bell,
  Timer,
  NotebookPen,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Flame,
  MessageSquare,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", id: "dashboard" },
  { icon: BookOpen, label: "Materias", path: "/dashboard/materias", id: "materias" },
  { icon: Target, label: "Banco de Preguntas", path: "/dashboard/banco", id: "banco" },
  { icon: Play, label: "Simulador CIAAC", path: "/dashboard/simulador", id: "simulador", badge: "310 Preguntas" },
  { icon: Zap, label: "Flashcards", path: "/dashboard/flashcards", id: "flashcards" },
  { icon: Play, label: "Clases Grabadas", path: "/dashboard/clases", id: "clases" },
  { icon: Library, label: "Biblioteca", path: "/dashboard/biblioteca", id: "biblioteca" },
  { icon: BarChart3, label: "Análisis", path: "/dashboard/analisis", id: "analisis" },
  { icon: Bell, label: "Recordatorios", path: "/dashboard/recordatorios", id: "recordatorios" },
  { icon: Timer, label: "Estudiemos Juntos", path: "/dashboard/sesiones", id: "sesiones" },
  { icon: NotebookPen, label: "Bitácora de Vuelo", path: "/dashboard/bitacora", id: "bitacora" },
  { icon: User, label: "Mi Perfil", path: "/dashboard/perfil", id: "perfil" },
];

function NavLink({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[0];
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path as "/dashboard"}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
        active
          ? "bg-[#F2AEBC]/20 text-[#F2AEBC]"
          : "text-[#F2DCDB]/70 hover:text-[#F2DCDB] hover:bg-white/10"
      }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-[#F2AEBC]" : ""}`} />
      <span className="truncate">{item.label}</span>
      {item.badge && (
        <Badge className="ml-auto bg-[#F2AEBC]/20 text-[#F2AEBC] border-0 text-xs px-1.5 py-0 font-medium">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

function Sidebar({
  onClose,
  currentPath,
}: {
  onClose?: () => void;
  currentPath: string;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F2AEBC] flex items-center justify-center">
            <span className="text-[#6C0820] font-extrabold text-base leading-none">F</span>
          </div>
          <span className="font-extrabold text-white text-lg">FlightPath</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[#F2DCDB]/70 hover:text-[#F2DCDB] md:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Pathy streak widget */}
      <div className="mx-3 mt-4 bg-white/10 rounded-2xl p-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">☁️</div>
          <div className="flex-1 min-w-0">
            <p className="text-[#F2AEBC] font-bold text-sm">¡Pathy Lapis!</p>
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <p className="text-[#F2DCDB] text-xs">14 días de racha</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#F2DCDB]/40 flex-shrink-0" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-2 text-xs font-semibold text-[#F2DCDB]/40 uppercase tracking-wider">
          Principal
        </p>
        {NAV_ITEMS.slice(0, 4).map((item) => (
          <NavLink
            key={item.id}
            item={item}
            active={currentPath === item.path || (item.path === "/dashboard" && currentPath === "/dashboard")}
            onClick={onClose}
          />
        ))}

        <p className="px-3 py-2 mt-2 text-xs font-semibold text-[#F2DCDB]/40 uppercase tracking-wider">
          Herramientas
        </p>
        {NAV_ITEMS.slice(4, 9).map((item) => (
          <NavLink
            key={item.id}
            item={item}
            active={currentPath === item.path}
            onClick={onClose}
          />
        ))}

        <p className="px-3 py-2 mt-2 text-xs font-semibold text-[#F2DCDB]/40 uppercase tracking-wider">
          Estudio
        </p>
        {NAV_ITEMS.slice(9).map((item) => (
          <NavLink
            key={item.id}
            item={item}
            active={currentPath === item.path}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-white/10 space-y-1">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#F2DCDB]/70 hover:text-[#F2DCDB] hover:bg-white/10 transition-all">
          <Settings className="w-4 h-4" />
          Configuración
        </button>
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#F2DCDB]/50 hover:text-[#F2DCDB] hover:bg-white/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </Link>
      </div>
    </div>
  );
}

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-[#3D5D91] fixed inset-y-0 left-0 z-30">
        <Sidebar currentPath={currentPath} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#3D5D91] z-50 shadow-2xl">
            <Sidebar currentPath={currentPath} onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:text-[#3D5D91]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#3D5D91] flex items-center justify-center">
              <span className="text-[#F2AEBC] font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-[#3D5D91]">FlightPath</span>
          </div>
          <button className="p-2 -mr-2 text-slate-600 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#F2AEBC] rounded-full" />
          </button>
        </header>

        {/* Desktop top bar */}
        <header className="hidden md:flex sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-6 h-14 items-center justify-between">
          <div className="text-sm text-slate-400">
            FlightPath /{" "}
            <span className="text-[#3D5D91] font-medium">
              {NAV_ITEMS.find((n) => n.path === currentPath)?.label ?? "Dashboard"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-[#3D5D91] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F2AEBC] rounded-full border-2 border-white" />
            </button>
            <button className="p-2 text-slate-500 hover:text-[#3D5D91] transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-[#3D5D91] rounded-full flex items-center justify-center text-white text-sm font-bold">
              M
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
