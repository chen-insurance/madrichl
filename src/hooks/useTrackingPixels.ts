import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTrackingPixels = () => {
  const { data: settings } = useQuery({
    queryKey: ["tracking-pixel-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["facebook_pixel_id", "gtm_id"]);
      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((item) => {
        settingsMap[item.key] = item.value || "";
      });
      return settingsMap;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const fbPixelId = settings?.facebook_pixel_id;
    const gtmId = settings?.gtm_id;

    // Inject Facebook Pixel
    if (fbPixelId && !document.getElementById("fb-pixel-script")) {
      const fbScript = document.createElement("script");
      fbScript.id = "fb-pixel-script";
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${fbPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);

      // Also add noscript fallback
      const noscript = document.createElement("noscript");
      noscript.id = "fb-pixel-noscript";
      noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1"/>`;
      document.body.appendChild(noscript);
    }

    // Inject Google Tag Manager
    if (gtmId && !document.getElementById("gtm-script")) {
      const gtmScript = document.createElement("script");
      gtmScript.id = "gtm-script";
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `;
      document.head.appendChild(gtmScript);

      // Add GTM noscript iframe
      const gtmNoscript = document.createElement("noscript");
      gtmNoscript.id = "gtm-noscript";
      gtmNoscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(gtmNoscript, document.body.firstChild);
    }

    return () => {
      // Cleanup on unmount (though typically these stay)
    };
  }, [settings]);
};
