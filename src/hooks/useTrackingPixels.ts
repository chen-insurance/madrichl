import { useEffect } from "react";
import { useSiteSettings } from "./useSiteSettings";

/**
 * Injects tracking pixels (FB Pixel, GTM) from site_settings.
 * Uses requestIdleCallback to defer non-critical tracking scripts.
 */
export const useTrackingPixels = () => {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    const fbPixelId = settings?.facebook_pixel_id;
    const gtmId = settings?.gtm_id;

    const injectTracking = () => {
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

        const noscript = document.createElement("noscript");
        noscript.id = "fb-pixel-noscript";
        noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1"/>`;
        document.body.appendChild(noscript);
      }

      // Inject Google Tag Manager (skip if already in index.html)
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
      }
    };

    if (!fbPixelId && !gtmId) return;

    // Defer tracking injection to avoid blocking main thread
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(injectTracking, { timeout: 3000 });
    } else {
      setTimeout(injectTracking, 2000);
    }
  }, [settings]);
};
