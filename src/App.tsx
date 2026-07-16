  // Dynamic live-fetching from DPBoss Scraper API every 10 seconds
  useEffect(() => {
    const fetchLiveResults = async () => {
      try {
        const response = await fetch("https://matka-backend-o9td.onrender.com/api/results");
        const result = await response.json();
        
        // direct result.status ki jagah, response check karke data pass karenge
        if (result && (result.status === "success" || result.status === "fallback")) {
          const apiData = result.data;
          setMarkets((prevMarkets) => {
            const updated = prevMarkets.map((m) => {
              let apiMarket = null;
              if (m.id === 'kalyan' && apiData.KALYAN) {
                apiMarket = apiData.KALYAN;
              } else if (m.id === 'time-bazar' && apiData['TIME BAZAR']) {
                apiMarket = apiData['TIME BAZAR'];
              } else if (m.id === 'milan-day' && apiData['MILAN DAY']) {
                apiMarket = apiData['MILAN DAY'];
              } else {
                const upperName = m.name.toUpperCase();
                if (apiData[upperName]) {
                  apiMarket = apiData[upperName];
                }
              }

              if (apiMarket) {
                return {
                  ...m,
                  openPana: apiMarket.openPana,
                  openSingle: apiMarket.openSingle,
                  closeSingle: apiMarket.closeSingle,
                  closePana: apiMarket.closePana,
                  status: 'CLOSED',
                  lastUpdated: `Live DPBoss Sync at ${getCurrentTimeFormatted()}`
                };
              }
              return m;
            });
            localStorage.setItem('satta_markets', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (error) {
        console.error("Error fetching live results:", error);
      }
    };

    fetchLiveResults();
    const interval = setInterval(fetchLiveResults, 10000); // Har 10 seconds mein auto-fetch
    return () => clearInterval(interval);
  }, []);
