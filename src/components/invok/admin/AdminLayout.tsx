import { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  
  BarChart3,
  Newspaper,
  Video,
  FolderOpen,
  Image as ImageIcon,
  Inbox,
  Handshake,
  UserCog,
  Settings,
  Activity,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/invok/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
};

const adminNav: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/ziadosti", label: "Žiadosti škôl", icon: Inbox },
  { to: "/admin/skoly", label: "Školy", icon: Building2 },
  { to: "/admin/triedy", label: "Triedy", icon: Users },
  { to: "/admin/ziaci", label: "Žiaci", icon: GraduationCap },
  
  { to: "/admin/vysledky", label: "Výsledky", icon: BarChart3 },
  { to: "/admin/reporty", label: "Reporty", icon: BarChart3 },
  { to: "/admin/blog", label: "Blog", icon: Newspaper },
  { to: "/admin/videa", label: "Videá", icon: Video },
  { to: "/admin/dokumenty", label: "Dokumenty", icon: FolderOpen },
  { to: "/admin/galeria", label: "Fotogaléria", icon: ImageIcon },
  { to: "/admin/partneri", label: "Partneri", icon: Handshake },
  { to: "/admin/pouzivatelia", label: "Používatelia", icon: UserCog },
  { to: "/admin/nastavenia", label: "Nastavenia", icon: Settings },
  { to: "/admin/log", label: "Activity log", icon: Activity },
];

export function AdminLayout({
  title,
  children,
  userEmail,
}: {
  title: string;
  children: ReactNode;
  userEmail?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const onLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Odhlásený.");
    navigate({ to: "/prihlasenie" });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Link to="/admin/dashboard" aria-label="INVOK admin">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground/80 hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Odhlásiť sa
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground truncate">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {userEmail && <span className="hidden sm:inline">{userEmail}</span>}
            <span className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
              {(userEmail ?? "?").slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
