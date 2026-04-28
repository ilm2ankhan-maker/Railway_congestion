import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import ResultCard from "../components/ResultCard";
import CongestionChart from "../components/CongestionChart";

import {
  getCongestionByPnr,
  getCongestionByStationAndDate,
  getStations,
} from "../services/api";

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultData, setResultData] = useState(null);
  const [chartData, setChartData] = useState([]);

  /* ------------------------------------
     Load Initial Chart Demo Data
  ------------------------------------ */
  useEffect(() => {
    const loadChart = async () => {
      try {
        const stations = await getStations();

        const demo = [
          { name: "Delhi", passengers: 1850 },
          { name: "Mumbai", passengers: 1450 },
          { name: "Howrah", passengers: 1680 },
          { name: "Chennai", passengers: 880 },
          { name: "Bengaluru", passengers: 1250 },
          { name: "Pune", passengers: 970 },
        ];

        if (stations?.length) {
          setChartData(
            demo.map((item, index) => ({
              name:
                stations[index]?.stationName?.split(" ")[0] || item.name,
              passengers: item.passengers,
            }))
          );
        } else {
          setChartData(demo);
        }
      } catch (err) {
        console.log("Chart load failed", err);
      }
    };

    loadChart();
  }, []);

  /* ------------------------------------
     Search by PNR
  ------------------------------------ */
  const handlePnrSearch = async (pnr) => {
    setLoading(true);
    setError("");
    setResultData(null);

    try {
      const data = await getCongestionByPnr(pnr);

      if (!data) {
        setError("PNR not found.");
      } else {
        setResultData(data);
        updateChart(data.stationName, data.totalPassengers);
      }
    } catch (err) {
      setError("Unable to fetch congestion details.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------
     Search by Station + Date
  ------------------------------------ */
  const handleStationSearch = async (stationId, date) => {
    setLoading(true);
    setError("");
    setResultData(null);

    try {
      const data = await getCongestionByStationAndDate(stationId, date);

      if (!data) {
        setError("No data found.");
      } else {
        setResultData(data);
        updateChart(data.stationName, data.totalPassengers);
      }
    } catch (err) {
      setError("Unable to fetch station data.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------
     Update Chart
  ------------------------------------ */
  const updateChart = (stationName, passengers) => {
    const shortName = stationName?.split(" ")[0];

    setChartData((prev) => {
      const filtered = prev.filter((item) => item.name !== shortName);

      return [
        { name: shortName, passengers },
        ...filtered.slice(0, 5),
      ];
    });
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">

      {/* Background Glow */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 -z-10" />

      <div className="fixed top-20 left-20 w-72 h-72 bg-indigo-500/20 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-20 right-20 w-72 h-72 bg-purple-500/20 blur-[120px] rounded-full -z-10" />

      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="container-app pt-28 pb-16">

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto"
        >
          <span className="px-4 py-2 rounded-full glass text-sm text-indigo-300 inline-block mb-6">
            🚆 AI Powered Live Monitoring
          </span>

          <h1 className="text-5xl md:text-6xl font-black leading-tight">
            Railway Station
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Congestion Dashboard
            </span>
          </h1>

          <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto">
            Analyze station crowd density using reservation data,
            platform trends, and passenger volume insights.
          </p>
        </motion.section>

        {/* Search */}
        <section className="mt-12">
          <SearchBar
            onSearchPnr={handlePnrSearch}
            onSearchStation={handleStationSearch}
            loading={loading}
          />
        </section>

        {/* Loading */}
        {loading && (
          <div className="mt-10 glass-card p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">
              Fetching latest congestion data...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-8 glass-card border border-red-500/20 p-5 text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Result */}
        {!loading && resultData && (
          <div className="mt-10">
            <ResultCard data={resultData} />
          </div>
        )}

        {/* Empty State */}
        {!loading && !resultData && !error && (
          <div className="mt-10 glass-card p-8 text-center text-gray-400">
            Enter a valid PNR or choose a station to view congestion prediction.
          </div>
        )}

        {/* Chart */}
        <div className="mt-14">
          <CongestionChart chartData={chartData} />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/5 py-8 text-center text-gray-500 text-sm">
        © 2026 Smart Railway Congestion Monitoring System
      </footer>
    </div>
  );
};

export default Dashboard;
