import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import NavigationSchema from "@/components/layout/NavigationSchema";
import { Menu, Search } from "lucide-react";
// Logo served from /public
const logoIcon = "/logo-icon.png";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Lazy load SearchDialog - only needed on click
const SearchDialog = lazy(() => import("@/components/common/SearchDialog"));

interface MenuItem {
  id: string;
  type: string;
  label: string;
  url: string;
}

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Fetch header menu from menus table
  const { data: headerMenu } = useQuery({
    queryKey: ["public-menus", "header"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menus")
        .select("items_json")
        .eq("location", "header")
        .maybeSingle();
      if (error) throw error;
      return (data?.items_json as unknown as MenuItem[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Build navigation items from menu or fallback to defaults
  const navItems = headerMenu && headerMenu.length > 0
    ? headerMenu.map((item) => ({ label: item.label, href: item.url }))
    : [
        { label: "ראשי", href: "/" },
        { label: "כל הכתבות", href: "/blog" },
        { label: "צור קשר", href: "/contact" },
      ];

  return (
    <>
      <NavigationSchema items={navItems} />
      <header className="sticky top-0 z-50 bg-card border-b border-border" style={{ willChange: 'transform' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - Right side in RTL */}
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={logoIcon} 
                alt="המדריך לצרכן" 
                width={48}
                height={48}
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
              <div>
                <span className="font-display font-bold text-lg md:text-xl text-foreground block">המדריך לצרכן</span>
                <p className="text-xs text-muted-foreground hidden sm:block">מגזין ביטוח ופיננסים</p>
              </div>
            </Link>

            {/* Desktop Navigation - Left side in RTL */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item, index) => (
                <Link
                  key={`${item.href}-${index}`}
                  to={item.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border rounded-full hover:bg-secondary transition-colors min-w-[200px]"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">חפש כתבה או נושא...</span>
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSearch(true)}
                aria-label="חיפוש"
                className="border-border"
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
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
                        <img 
                          src={logoIcon} 
                          alt="המדריך לצרכן" 
                          width={40}
                          height={40}
                          className="w-10 h-10 object-contain"
                        />
                        <div>
                          <span className="font-display font-bold text-lg text-foreground block">המדריך לצרכן</span>
                          <p className="text-xs text-muted-foreground">מגזין ביטוח ופיננסים</p>
                        </div>
                      </Link>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="flex-1 p-4">
                      {navItems.map((item, index) => (
                        <Link
                          key={`${item.href}-${index}`}
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
                      <Button variant="gold" className="w-full">
                        בדיקת ביטוח חינם
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      {showSearch && (
        <Suspense fallback={null}>
          <SearchDialog open={showSearch} onOpenChange={setShowSearch} />
        </Suspense>
      )}
    </>
  );
};

export default Header;
