import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "./AdminSidebar";
import Auth from "@/pages/Auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasShownDenied, setHasShownDenied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Check admin status via server-side DB function
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdminUser(null);
        setCheckingAdmin(false);
        return;
      }
      try {
        const { data, error } = await supabase.rpc('is_admin_user');
        if (error) throw error;
        setIsAdminUser(!!data);
      } catch {
        setIsAdminUser(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    if (!loading) checkAdmin();
  }, [user, loading]);

  useEffect(() => {
    // If user is logged in but not an admin, redirect to homepage
    if (!loading && user && !isAdminUser && !hasShownDenied) {
      setHasShownDenied(true);
      toast({
        title: "גישה נדחתה",
        description: "אין לך הרשאה לגשת לאזור הניהול",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, loading, isAdminUser, navigate, toast, hasShownDenied]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // If not logged in, show the Auth component inline
  if (!user) {
    return <Auth />;
  }

  // If logged in but not admin, show nothing (will redirect)
  if (!isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // User is authenticated and is an admin
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      {!isMobile && <AdminSidebar />}
      
      {/* Mobile Header with Hamburger */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">פתח תפריט</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-72">
              <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
              <span className="text-primary font-display font-bold text-sm">מ</span>
            </div>
            <span className="font-display font-bold text-foreground">המדריך לצרכן</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      )}
      
      {/* Main Content */}
      <main className={`flex-1 overflow-auto ${isMobile ? 'pt-16' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
