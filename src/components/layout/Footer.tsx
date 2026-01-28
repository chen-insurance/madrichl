import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MenuItem {
  id: string;
  type: string;
  label: string;
  url: string;
}

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Fetch footer menus
  const { data: footerCol1 } = useQuery({
    queryKey: ["public-menus", "footer_col_1"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menus")
        .select("items_json")
        .eq("location", "footer_col_1")
        .maybeSingle();
      if (error) throw error;
      return (data?.items_json as unknown as MenuItem[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: footerCol2 } = useQuery({
    queryKey: ["public-menus", "footer_col_2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menus")
        .select("items_json")
        .eq("location", "footer_col_2")
        .maybeSingle();
      if (error) throw error;
      return (data?.items_json as unknown as MenuItem[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: footerCol3 } = useQuery({
    queryKey: ["public-menus", "footer_col_3"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menus")
        .select("items_json")
        .eq("location", "footer_col_3")
        .maybeSingle();
      if (error) throw error;
      return (data?.items_json as unknown as MenuItem[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fallback links if no menu configured
  const defaultCol1 = [
    { label: "ביטוח חיים", url: "/category/life-insurance" },
    { label: "ביטוח בריאות", url: "/category/health-insurance" },
    { label: "פנסיה", url: "/category/pension" },
  ];

  const defaultCol2 = [
    { label: "אודות", url: "/about" },
    { label: "צור קשר", url: "/contact" },
  ];

  const defaultCol3 = [
    { label: "תנאי שימוש", url: "/terms" },
    { label: "מדיניות פרטיות", url: "/privacy" },
  ];

  const col1Links = footerCol1 && footerCol1.length > 0 ? footerCol1 : defaultCol1;
  const col2Links = footerCol2 && footerCol2.length > 0 ? footerCol2 : defaultCol2;
  const col3Links = footerCol3 && footerCol3.length > 0 ? footerCol3 : defaultCol3;

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
                <span className="text-primary font-display font-bold text-lg">מ</span>
              </div>
              <div>
                <h2 className="font-display font-bold text-lg">המדריך לצרכן</h2>
                <p className="text-xs text-primary-foreground/60">מגזין ביטוח ופיננסים</p>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              המקור המהימן שלך למידע על ביטוח ופיננסים בישראל.
              מדריכים, חדשות וניתוחים לטובת הצרכן.
            </p>
          </div>

          {/* Column 1 */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">קטגוריות</h3>
            <ul className="space-y-2">
              {col1Links.map((link, index) => (
                <li key={`col1-${index}`}>
                  <Link
                    to={link.url}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">החברה</h3>
            <ul className="space-y-2">
              {col2Links.map((link, index) => (
                <li key={`col2-${index}`}>
                  <Link
                    to={link.url}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">מידע משפטי</h3>
            <ul className="space-y-2">
              {col3Links.map((link, index) => (
                <li key={`col3-${index}`}>
                  <Link
                    to={link.url}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/60">
              © {currentYear} המדריך לצרכן. כל הזכויות שמורות.
            </p>
            <p className="text-sm text-primary-foreground/60">
              האתר אינו מהווה ייעוץ פיננסי או ביטוחי
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
