import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Plus,
  Image,
  Settings,
  BarChart3,
  LogOut,
  Home,
  ChevronDown,
  ChevronLeft,
  UserCheck,
  Menu,
  FileStack,
  Users,
  Link2,
  Megaphone,
  ListChecks,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

interface AdminSidebarProps {
  onNavigate?: () => void;
}

const AdminSidebar = ({ onNavigate }: AdminSidebarProps) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["posts"]);

  const navItems: NavItem[] = [
    {
      label: "לוח בקרה",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "מאמרים",
      icon: FileText,
      children: [
        { label: "כל המאמרים", href: "/admin" },
        { label: "מאמר חדש", href: "/admin/articles/new" },
        { label: "קטגוריות", href: "/admin/categories" },
      ],
    },
    {
      label: "עמודים",
      icon: FileStack,
      children: [
        { label: "כל העמודים", href: "/admin/pages" },
        { label: "עמוד חדש", href: "/admin/pages/new" },
      ],
    },
    {
      label: "עמוד הבית",
      href: "/admin/homepage",
      icon: Home,
    },
    {
      label: "תפריטים",
      href: "/admin/menus",
      icon: Menu,
    },
    {
      label: "מסלולי השקעה",
      href: "/admin/tracks",
      icon: BarChart3,
    },
    {
      label: "פרסומות ו-CTA",
      href: "/admin/cta-blocks",
      icon: Megaphone,
    },
    {
      label: "שאלונים",
      href: "/admin/quizzes",
      icon: ListChecks,
    },
    {
      label: "מילון מונחים",
      href: "/admin/glossary",
      icon: BookOpen,
    },
    {
      label: "נתוני מחשבונים",
      href: "/admin/calculators",
      icon: BarChart3,
    },
    {
      label: "לידים",
      href: "/admin/leads",
      icon: UserCheck,
    },
    {
      label: "מדיה",
      href: "/admin/media",
      icon: Image,
    },
    {
      label: "הגדרות",
      icon: Settings,
      children: [
        { label: "כללי", href: "/admin/settings" },
        { label: "כותבים", href: "/admin/authors" },
        { label: "הפניות (301)", href: "/admin/redirects" },
      ],
    },
  ];

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin" || 
        (location.pathname.startsWith("/admin/articles") && !location.pathname.includes("/new"));
    }
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  const isParentActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return item.href ? isActive(item.href) : false;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleLinkClick = () => {
    onNavigate?.();
  };

  return (
    <aside className="w-64 bg-card border-l border-border/60 flex flex-col h-screen sticky top-0 shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-border/60">
        <Link to="/admin" className="flex items-center gap-3" onClick={handleLinkClick}>
          <div className="w-10 h-10 bg-gradient-gold rounded-xl flex items-center justify-center shadow-gold">
            <span className="text-primary font-display font-bold text-lg">מ</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">המדריך לצרכן</h1>
            <p className="text-xs text-muted-foreground">ממשק ניהול</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 text-right group",
                    isParentActive(item)
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors",
                      isParentActive(item) ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {expandedMenus.includes(item.label) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
                {expandedMenus.includes(item.label) && (
                  <div className="mr-5 mt-1 space-y-0.5 border-r-2 border-border/50 pr-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "block px-3 py-2 rounded-lg transition-all duration-150 text-sm",
                          isActive(child.href)
                            ? "bg-accent text-accent-foreground font-medium shadow-sm"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.href!}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group",
                  isActive(item.href!)
                    ? "bg-accent text-accent-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive(item.href!) ? "text-accent-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="text-sm">{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/60 space-y-1">
        <Link
          to="/"
          onClick={handleLinkClick}
          className="flex items-center gap-3 px-3 py-2.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-lg transition-all duration-150 group"
        >
          <Home className="w-5 h-5 group-hover:text-foreground" />
          <span className="text-sm">לאתר הראשי</span>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-3 py-2.5 h-auto"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">התנתקות</span>
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
