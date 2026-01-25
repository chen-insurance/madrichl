import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    categories: [
      { label: "ביטוח חיים", href: "/life-insurance" },
      { label: "ביטוח בריאות", href: "/health-insurance" },
      { label: "ביטוח רכב", href: "/car-insurance" },
      { label: "פנסיה", href: "/pension" },
      { label: "ביטוח עסקי", href: "/business-insurance" },
    ],
    company: [
      { label: "אודות", href: "/about" },
      { label: "צור קשר", href: "/contact" },
      { label: "הצטרפו לצוות", href: "/careers" },
      { label: "פרסום באתר", href: "/advertise" },
    ],
    legal: [
      { label: "תנאי שימוש", href: "/terms" },
      { label: "מדיניות פרטיות", href: "/privacy" },
      { label: "נגישות", href: "/accessibility" },
    ],
  };

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

          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">קטגוריות</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">החברה</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">מידע משפטי</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
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
