import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const logoIcon = "/logo-icon.png";

interface MenuItem {
  id: string;
  type: string;
  label: string;
  url: string;
}

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Batch all footer menus into a single query
  const { data: footerMenus } = useQuery({
    queryKey: ["public-menus", "footer-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menus")
        .select("location, items_json")
        .in("location", ["footer_col_1", "footer_col_2", "footer_col_3"]);
      if (error) throw error;

      const map: Record<string, MenuItem[]> = {};
      data?.forEach((row) => {
        map[row.location] = (row.items_json as unknown as MenuItem[]) || [];
      });
      return map;
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

  const col1Links = footerMenus?.footer_col_1?.length ? footerMenus.footer_col_1 : defaultCol1;
  const col2Links = footerMenus?.footer_col_2?.length ? footerMenus.footer_col_2 : defaultCol2;
  const col3Links = footerMenus?.footer_col_3?.length ? footerMenus.footer_col_3 : defaultCol3;

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img
                src={logoIcon}
                alt="המדריך לצרכן"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
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
