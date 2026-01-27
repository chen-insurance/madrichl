import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch categories dynamically
  const { data: categories } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");
      if (error) throw error;
      return data as Category[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Build navigation items from categories
  const navItems = [
    { label: "ראשי", href: "/" },
    ...(categories?.map((cat) => ({
      label: cat.name,
      href: `/news?category=${cat.slug}`,
    })) || []),
    { label: "צור קשר", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Right side in RTL */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-gold rounded-lg flex items-center justify-center shadow-gold">
              <span className="text-primary font-display font-bold text-lg md:text-xl">מ</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg md:text-xl text-foreground">המדריך לצרכן</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">מגזין ביטוח ופיננסים</p>
            </div>
          </Link>

          {/* Desktop Navigation - Left side in RTL */}
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

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="sm">
                כניסת מנהלים
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button - Left side in RTL */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <button
                className="p-2 text-foreground"
                aria-label="תפריט"
              >
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="p-6 border-b border-border">
                  <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                    <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center shadow-gold">
                      <span className="text-primary font-display font-bold text-lg">מ</span>
                    </div>
                    <div>
                      <h1 className="font-display font-bold text-lg text-foreground">המדריך לצרכן</h1>
                      <p className="text-xs text-muted-foreground">מגזין ביטוח ופיננסים</p>
                    </div>
                  </Link>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 p-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="block px-4 py-3 text-foreground hover:bg-secondary transition-colors rounded-lg mb-1"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Footer */}
                <div className="p-4 border-t border-border">
                  <Link to="/admin" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full mb-2">
                      כניסת מנהלים
                    </Button>
                  </Link>
                  <Button variant="gold" className="w-full">
                    בדיקת ביטוח חינם
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
