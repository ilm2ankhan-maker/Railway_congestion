import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
};

const getColor = (passengers) => {
  if (passengers < 500) return COLORS.LOW;
  if (passengers <= 1500) return COLORS.MEDIUM;
  return COLORS.HIGH;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const passengers = payload[0].value;
    const level = passengers < 500 ? 'LOW' : passengers <= 1500 ? 'MEDIUM' : 'HIGH';
    return (
      <div className="glass-card p-3 border border-white/20 rounded-xl">
        <p className="text-white font-semibold text-sm">{label}</p>
        <p className="text-gray-300 text-xs mt-1">
          Passengers: <span className="font-bold text-white">{passengers.toLocaleString()}</span>
        </p>
        <p className="text-xs mt-1" style={{ color: COLORS[level] }}>
          {level} Congestion
        </p>
      </div>
    );
  }
  return null;
};

const CongestionChart = ({ chartData }) => {
  if (!chartData || chartData.length === 0) return null;

  return (
    <div id="analytics" className="max-w-3xl mx-auto mt-8 animate-fade-in-up delay-400">
      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              📊 Congestion Overview
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Passenger volume across stations
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Low
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Medium
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              High
            </span>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="passengers" radius={[8, 8, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.passengers)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {chartData.filter(d => d.passengers < 500).length}
            </p>
            <p className="text-xs text-gray-400">Low Stations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">
              {chartData.filter(d => d.passengers >= 500 && d.passengers <= 1500).length}
            </p>
            <p className="text-xs text-gray-400">Medium Stations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {chartData.filter(d => d.passengers > 1500).length}
            </p>
            <p className="text-xs text-gray-400">High Stations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CongestionChart;
