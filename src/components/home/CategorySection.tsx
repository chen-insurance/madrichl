import { Link } from "react-router-dom";
import { Shield, Heart, Car, Building2, Users, PiggyBank } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Category {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

const CategorySection = () => {
  const categories: Category[] = [
    {
      id: "life",
      title: "ביטוח חיים",
      description: "פוליסות חיים, ריסק ועוד",
      icon: Shield,
      href: "/life-insurance",
    },
    {
      id: "health",
      title: "ביטוח בריאות",
      description: "בריאות, סיעודי ונסיעות",
      icon: Heart,
      href: "/health-insurance",
    },
    {
      id: "car",
      title: "ביטוח רכב",
      description: "חובה, מקיף וצד ג׳",
      icon: Car,
      href: "/car-insurance",
    },
    {
      id: "property",
      title: "ביטוח רכוש",
      description: "דירה, עסק ותכולה",
      icon: Building2,
      href: "/property-insurance",
    },
    {
      id: "pension",
      title: "פנסיה",
      description: "קרנות פנסיה וגמל",
      icon: PiggyBank,
      href: "/pension",
    },
    {
      id: "employers",
      title: "ביטוח מעסיקים",
      description: "אחריות מקצועית ועובדים",
      icon: Users,
      href: "/employer-insurance",
    },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            עיינו לפי קטגוריה
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            מצאו את המידע שאתם מחפשים לפי תחום הביטוח הרלוונטי
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={category.href}
              className="group bg-card rounded-xl p-5 text-center shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-secondary rounded-xl flex items-center justify-center group-hover:bg-accent/90 dark:group-hover:bg-accent/70 group-hover:text-accent-foreground transition-colors">
                <category.icon className="w-7 h-7" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">
                {category.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
