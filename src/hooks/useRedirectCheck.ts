import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useRedirectCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkRedirect = async () => {
      // Only check for article routes
      if (!location.pathname.startsWith("/news/")) {
        setIsChecking(false);
        return;
      }

      const slug = location.pathname.replace("/news/", "");
      
      try {
        const { data: redirect } = await supabase
          .from("redirects")
          .select("new_slug")
          .eq("old_slug", slug)
          .maybeSingle();

        if (redirect) {
          // Perform 301-style redirect (replace in history)
          console.log(`Redirecting from ${slug} to ${redirect.new_slug}`);
          navigate(`/news/${redirect.new_slug}`, { replace: true });
          return;
        }
      } catch (err) {
        console.error("Error checking redirect:", err);
      }

      setIsChecking(false);
    };

    checkRedirect();
  }, [location.pathname, navigate]);

  return { isChecking };
};
