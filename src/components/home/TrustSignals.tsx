import { Shield, Users, Award, Clock } from "lucide-react";

const TrustSignals = () => {
  const signals = [
    {
      icon: Users,
      value: "250,000+",
      label: "קוראים בחודש",
    },
    {
      icon: Shield,
      value: "100%",
      label: "מידע אובייקטיבי",
    },
    {
      icon: Award,
      value: "15+",
      label: "שנות ניסיון",
    },
    {
      icon: Clock,
      value: "24/7",
      label: "תוכן מעודכן",
    },
  ];

  return (
    <section className="py-8 md:py-12 bg-secondary/30">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {signals.map((signal, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-3">
                <signal.icon className="w-6 h-6 text-accent" />
              </div>
              <span className="font-display font-bold text-2xl text-foreground mb-1">
                {signal.value}
              </span>
              <span className="text-sm text-muted-foreground">{signal.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;