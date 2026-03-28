import { Helmet } from "react-helmet-async";

interface NavItem {
  label: string;
  href: string;
}

interface NavigationSchemaProps {
  items: NavItem[];
}

const NavigationSchema = ({ items }: NavigationSchemaProps) => {
  const siteUrl = "https://the-guide.co.il";

  const schema = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: "תפריט ראשי",
    url: siteUrl,
    hasPart: items.map((item) => ({
      "@type": "WebPage",
      name: item.label,
      url: `${siteUrl}${item.href}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default NavigationSchema;
