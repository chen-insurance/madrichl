import { useEffect, useRef } from "react";

const MarketTicker = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = "";

    // Create the widget container div that TradingView expects
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";

    // Create script element for TradingView Ticker Tape widget
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
        { proName: "NASDAQ:NDX", title: "Nasdaq 100" },
        { proName: "TASE:TA35", title: "TA-35" },
        { proName: "FX_IDC:USDILS", title: "USD/ILS" },
        { proName: "FX_IDC:EURILS", title: "EUR/ILS" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "compact",
      colorTheme: "light",
      locale: "he_IL",
    });

    containerRef.current.appendChild(widgetContainer);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div
      className="w-full bg-card border-b border-border"
      style={{
        height: "44px",
        overflow: "hidden",
      }}
    >
      <div
        ref={containerRef}
        className="tradingview-widget-container"
        style={{
          width: "100%",
          height: "44px",
          overflow: "hidden",
        }}
      />
    </div>
  );
};

export default MarketTicker;
