import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "ראשי", href: "/" },
    { label: "חדשות", href: "/news" },
    { label: "ביטוח חיים", href: "/life-insurance" },
    { label: "ביטוח בריאות", href: "/health-insurance" },
    { label: "פנסיה", href: "/pension" },
    { label: "אודות", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-gold rounded-lg flex items-center justify-center shadow-gold">
              <span className="text-primary font-display font-bold text-lg md:text-xl">מ</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-lg md:text-xl text-foreground">המדריך לצרכן</h1>
              <p className="text-xs text-muted-foreground">מגזין ביטוח ופיננסים</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="sm">
                כניסת מנהלים
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="תפריט"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block px-4 py-3 text-foreground hover:bg-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="px-4 pt-4">
              <Button variant="gold" className="w-full">
                הרשמה לניוזלטר
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
