import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "./AdminSidebar";
import Auth from "@/pages/Auth";

// Whitelist of allowed admin emails
const ADMIN_EMAILS = ["bensagi981@gmail.com"];

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasShownDenied, setHasShownDenied] = useState(false);

  const isAdminUser = user?.email && ADMIN_EMAILS.includes(user.email);

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
      <div className="min-h-screen flex items-center justify-center bg-background">
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // User is authenticated and is an admin
  return (
    <div className="min-h-screen flex bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
