import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ResultCard from '../components/ResultCard';
import CongestionChart from '../components/CongestionChart';
import { getCongestionByPnr, getCongestionByStationAndDate, getStations } from '../services/api';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Load initial demo data for the chart
  useEffect(() => {
    const loadDemoChart = async () => {
      try {
        const stations = await getStations();
        // Since we don't have a bulk congestion endpoint, we'll simulate some chart data
        // based on realistic Indian railway traffic for the demo experience
        const demoTrafficData = [
          { name: 'New Delhi', passengers: 1850 },
          { name: 'Mumbai Central', passengers: 1400 },
          { name: 'Howrah Jn', passengers: 1600 },
          { name: 'Chennai', passengers: 800 },
          { name: 'Bangalore', passengers: 1200 },
          { name: 'Ahmedabad', passengers: 450 },
          { name: 'Pune', passengers: 950 },
        ];
        // If API provides enough stations, use their names, else fallback to predefined demo
        if (stations && stations.length >= 5) {
            setChartData(demoTrafficData.map((d, i) => ({
                name: stations[i]?.stationName?.split(' ')[0] || d.name,
                passengers: d.passengers
            })));
        } else {
            setChartData(demoTrafficData);
        }
      } catch (err) {
        console.error("Chart data failed to load", err);
      }
    };
    loadDemoChart();
  }, []);

  const handlePnrSearch = async (pnr) => {
    setLoading(true);
    setError(null);
    setResultData(null);
    try {
      const data = await getCongestionByPnr(pnr);
      if (data) {
        setResultData(data);
        
        // Update chart to feature queried station
        updateChartWithNewData(data.stationName.split(' ')[0], data.totalPassengers);
      } else {
        setError('PNR not found or invalid format.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch congestion data.');
    } finally {
      setLoading(false);
    }
  };

  const handleStationSearch = async (stationId, date) => {
    setLoading(true);
    setError(null);
    setResultData(null);
    try {
      const data = await getCongestionByStationAndDate(stationId, date);
      if (data) {
        setResultData(data);
        updateChartWithNewData(data.stationName.split(' ')[0], data.totalPassengers);
      } else {
        setError('No data found for this station and date.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch congestion data.');
    } finally {
      setLoading(false);
    }
  };

  const updateChartWithNewData = (stationName, passengers) => {
    setChartData(prev => {
        // Replace existing entry if it exists, otherwise add to front
        const filtered = prev.filter(d => !d.name.includes(stationName));
        return [{ name: stationName, passengers }, ...filtered.slice(0, 6)];
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Dynamic Background */}
      {darkMode && (
        <>
          <div className="fixed inset-0 z-0 bg-gradient-dark opacity-80" />
          <div className="fixed inset-0 z-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[128px] animate-pulse-glow delay-100" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[128px] animate-pulse-glow delay-300" />
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[128px] animate-pulse-glow delay-500" />
          </div>
        </>
      )}

      <div className="relative z-10 font-sans">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-12 pt-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm mb-6 animate-float">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live Monitoring Active
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
              Smart Railway Station
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Congestion Monitor
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Predictive crowd analytics based on real-time reservation data. 
              Search by PNR or Station to check safety and passenger volume.
            </p>
          </div>

          <SearchBar 
            onSearchPnr={handlePnrSearch} 
            onSearchStation={handleStationSearch} 
            loading={loading} 
          />

          {/* Error Message */}
          {error && (
            <div className="max-w-3xl mx-auto mt-6 animate-fade-in">
              <div className="glass border-red-500/30 bg-red-500/10 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Result Section */}
          {!loading && resultData && (
            <ResultCard data={resultData} />
          )}

          {/* Empty State */}
          {!loading && !resultData && !error && (
            <div className="max-w-3xl mx-auto mt-12 text-center animate-fade-in-up delay-300">
              <div className="inline-flex glass-card p-6">
                <p className="text-gray-400 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Enter a valid PNR to predict congestion for your upcoming journey.
                </p>
              </div>
            </div>
          )}

          {/* Analytics Chart */}
          <div className="mt-12">
            <CongestionChart chartData={chartData} />
          </div>

        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 mt-12 glass">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
              &copy; 2026 Smart Railway Congestion Monitoring System. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
