import React, { useState, useEffect, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, 
  BarChart, Bar, Cell, LineChart, Line, PieChart, Pie, ScatterChart, Scatter
} from 'recharts';
import { 
  Zap, DollarSign, Leaf, Clock, TrendingUp, AlertCircle, ChevronRight, RefreshCw,
  ArrowLeft, AlertTriangle, Activity, Calendar, Filter, Settings, Bot, Plus, Trash2,
  PieChart as PieIcon, BarChart2, BellRing, ToggleLeft, ToggleRight, Sliders
} from 'lucide-react';

/**
 * Advanced Data Generators
 */
const generateTelemetryData = (scale) => {
  const points = scale === 'Min' ? 60 : scale === 'Day' ? 30 : 24;
  return Array.from({ length: points }, (_, i) => {
    const baseVal = Math.random() * 2;
    const hour = (new Date().getHours() - (23 - i) + 24) % 24;
    const isNight = hour < 6 || hour > 22;
    return {
      time: scale === 'Min' ? `${i}m` : scale === 'Day' ? `D${i+1}` : `${hour}:00`,
      kwh_a: parseFloat((baseVal * 0.9 + Math.random() * 0.2).toFixed(2)),
      kwh_b: parseFloat((baseVal * 1.1 + Math.random() * 0.2).toFixed(2)),
      kwh_c: parseFloat((baseVal * 1.0 + Math.random() * 0.2).toFixed(2)),
      v_a: parseFloat((230 + Math.random() * 5).toFixed(1)),
      v_b: parseFloat((228 + Math.random() * 5).toFixed(1)),
      v_c: parseFloat((231 + Math.random() * 5).toFixed(1)),
      pf_a: parseFloat((0.85 + Math.random() * 0.1).toFixed(2)),
      pf_b: parseFloat((0.82 + Math.random() * 0.1).toFixed(2)),
      pf_c: parseFloat((0.88 + Math.random() * 0.1).toFixed(2)),
      current: parseFloat((10 + Math.random() * 20).toFixed(1)),
      voltage: parseFloat((220 + Math.random() * 20).toFixed(1)),
      isNight,
      cost: parseFloat((baseVal * (isNight ? 0.08 : 0.22)).toFixed(2))
    };
  });
};

const PIE_DATA = [
  { name: 'HVAC', value: 450, color: '#3b82f6' },
  { name: 'Lighting', value: 300, color: '#10b981' },
  { name: 'Industrial', value: 250, color: '#f59e0b' },
  { name: 'Server Room', value: 150, color: '#ef4444' },
];

const MASTER_ALERTS = [
  { id: 'phase', type: 'Phase Loss', severity: 'CRITICAL', color: 'text-red-600', bg: 'bg-red-50', msg: 'Main DB Phase A failure.' },
  { id: 'pf', type: 'Low Power Factor', severity: 'MEDIUM', color: 'text-amber-600', bg: 'bg-amber-50', msg: 'PF dropped below threshold.' },
  { id: 'overload', type: 'Overcurrent', severity: 'HIGH', color: 'text-orange-600', bg: 'bg-orange-50', msg: 'Current exceed 120% limit.' },
  { id: 'sag', type: 'Voltage Sag', severity: 'MEDIUM', color: 'text-blue-600', bg: 'bg-blue-50', msg: 'Momentary voltage drop detected.' },
];

// --- Sub-Components ---

const WidgetHeader = ({ title, onRemove, onSettings }) => (
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{title}</h3>
    <div className="flex gap-2">
      {onSettings && (
        <button onClick={onSettings} className="p-1 text-slate-400 hover:text-blue-500 transition-colors">
          <Sliders size={14} />
        </button>
      )}
      {onRemove && (
        <button onClick={onRemove} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 size={14} />
        </button>
      )}
    </div>
  </div>
);

const ThreePhasePlot = ({ data, timeScale, setTimeScale, metric, setMetric }) => {
  const getKeys = () => {
    if (metric === 'PF') return { a: 'pf_a', b: 'pf_b', c: 'pf_c' };
    if (metric === 'Voltage') return { a: 'v_a', b: 'v_b', c: 'v_c' };
    return { a: 'kwh_a', b: 'kwh_b', c: 'kwh_c' };
  };
  const keys = getKeys();

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-1 lg:col-span-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold">3-Phase Analysis</h2>
          <div className="flex gap-4 mt-1">
            {['Consumption', 'PF', 'Voltage'].map(m => (
              <button 
                key={m} 
                onClick={() => setMetric(m)}
                className={`text-[10px] font-bold uppercase transition-colors ${metric === m ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {['Min', 'Hour', 'Day'].map(s => (
            <button key={s} onClick={() => setTimeScale(s)} className={`px-3 py-1 text-xs font-bold rounded ${timeScale === s ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>{s}</button>
          ))}
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} domain={metric === 'PF' ? [0.5, 1] : ['auto', 'auto']} />
            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
            <Line type="monotone" dataKey={keys.a} name="Phase A" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey={keys.b} name="Phase B" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey={keys.c} name="Phase C" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Detailed Sub-Views ---

const UptimeView = ({ onBack }) => {
  const uptimeData = Array.from({ length: 48 }, (_, i) => ({
    time: `${i}:00`,
    active: Math.random() > 0.05 ? 1 : 0,
    load: 30 + Math.random() * 60
  }));

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><ArrowLeft size={24}/></button>
        <div>
          <h1 className="text-3xl font-bold">System Availability</h1>
          <p className="text-slate-500 font-medium">Uptime tracking and MTBF analytics</p>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Load Activity Logic</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={uptimeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" hide />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="step" dataKey="active" stroke="#10b981" strokeWidth={3} dot={false} name="Status" />
                <Line type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={2} dot={false} name="Load Factor" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-lg">
            <Activity className="mb-2 w-8 h-8 opacity-50" />
            <p className="text-emerald-100 text-xs font-bold uppercase">Current State</p>
            <h4 className="text-4xl font-black uppercase tracking-tighter">Running</h4>
            <div className="mt-4 flex gap-4 text-[10px] font-bold">
              <span>MTBF: 1.2k Hrs</span>
              <span>SLO: 99.9%</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold mb-4">Recent Disconnects</h4>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Node-29 Offline</span>
                  <span className="font-bold text-red-500">2m 40s</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConsumptionFilterView = ({ onBack }) => {
  const [start, setStart] = useState('2024-05-20T08:00');
  const [end, setEnd] = useState('2024-05-21T08:00');

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><ArrowLeft size={24}/></button>
        <div>
          <h1 className="text-3xl font-bold">Consumption Intelligence</h1>
          <p className="text-slate-500 font-medium">Historical window energy profile</p>
        </div>
      </header>
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Window Start</label>
            <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-lg text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Window End</label>
            <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-lg text-sm" />
          </div>
          <button className="bg-blue-600 text-white py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
            <Filter size={14} /> Apply Filter
          </button>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={generateTelemetryData('Hour')}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="kwh_a" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Consumption (kWh)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const CostView = ({ onBack }) => {
  const costData = generateTelemetryData('Hour');
  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><ArrowLeft size={24}/></button>
        <div>
          <h1 className="text-3xl font-bold">Billing & Tariffs</h1>
          <p className="text-slate-500 font-medium">Time-of-Use (ToU) expenditure breakdown</p>
        </div>
      </header>
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-8">Day/Night Cost Differential</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={{fontSize: 10}} />
              <YAxis tick={{fontSize: 10}} />
              <Tooltip formatter={v => `$${v}`} />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                {costData.map((e, i) => (
                  <Cell key={i} fill={e.isNight ? '#3b82f6' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 flex justify-center gap-6">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500" /> <span className="text-xs font-bold text-slate-500 uppercase">Peak Day Rate</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500" /> <span className="text-xs font-bold text-slate-500 uppercase">Off-Peak Night Rate</span></div>
        </div>
      </div>
    </div>
  );
};

// --- Alert Configuration ---

const AlertConfigView = ({ settings, setSettings, onBack }) => {
  const toggleAlert = (id) => {
    setSettings(prev => ({
      ...prev,
      enabled: { ...prev.enabled, [id]: !prev.enabled[id] }
    }));
  };

  const updateThreshold = (key, val) => {
    setSettings(prev => ({
      ...prev,
      thresholds: { ...prev.thresholds, [key]: val }
    }));
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><ArrowLeft size={24}/></button>
        <div>
          <h1 className="text-3xl font-bold">Alert Configuration</h1>
          <p className="text-slate-500 font-medium">Set custom thresholds and toggle fault monitoring</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6">
          <h3 className="text-lg font-bold border-b pb-4">Fault Toggles</h3>
          {MASTER_ALERTS.map(a => (
            <div key={a.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <h4 className="font-bold text-slate-900">{a.type}</h4>
                <p className="text-xs text-slate-500">Severity: {a.severity}</p>
              </div>
              <button onClick={() => toggleAlert(a.id)} className="transition-all hover:scale-110">
                {settings.enabled[a.id] ? <ToggleRight className="text-blue-600 w-10 h-10" /> : <ToggleLeft className="text-slate-300 w-10 h-10" />}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6">
          <h3 className="text-lg font-bold border-b pb-4">Operating Thresholds</h3>
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-bold">Power Factor (PF) Alert</label>
                <span className="text-blue-600 font-bold">{settings.thresholds.pf}</span>
              </div>
              <input 
                type="range" min="0.5" max="1" step="0.01" 
                value={settings.thresholds.pf} 
                onChange={e => updateThreshold('pf', e.target.value)}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-400">Alert triggers when system PF drops below this value for {" > "} 5 mins.</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-bold">Voltage Sag Threshold (%)</label>
                <span className="text-blue-600 font-bold">-{settings.thresholds.sag}%</span>
              </div>
              <input 
                type="range" min="5" max="30" step="1" 
                value={settings.thresholds.sag} 
                onChange={e => updateThreshold('sag', e.target.value)}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-400">Triggered if voltage deviation exceeds nominal supply.</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-bold">Current Overload (%)</label>
                <span className="text-blue-600 font-bold">{settings.thresholds.load}%</span>
              </div>
              <input 
                type="range" min="100" max="150" step="5" 
                value={settings.thresholds.load} 
                onChange={e => updateThreshold('load', e.target.value)}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-400">Nominal current limit before critical alarm.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Layouts ---

const DashboardView = ({ activeWidgets, removeWidget, telemetry, timeScale, setTimeScale, metric, setMetric, onNavigate, onCustomize, onAlertConfig, alertSettings }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Analytical Portal</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium">
            <Activity className="w-4 h-4 text-blue-500" /> Dynamic Telemetry Visualization
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert('Agent Intelligence: Coming Soon')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-xs font-bold"
          >
            <Bot size={16} className="text-blue-400" /> Ask Agent
          </button>
          <button 
            onClick={onCustomize}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:shadow-md transition-all text-xs font-bold"
          >
            <Settings size={16} /> Customize Dash
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { id: 'uptime', label: 'System Uptime', value: '24', unit: 'Hrs', icon: Clock, color: 'bg-slate-600' },
          { id: 'consumption', label: 'Consumption', value: '482.4', unit: 'kWh', icon: Zap, color: 'bg-amber-500' },
          { id: 'cost', label: 'Daily Cost', value: '$112.50', unit: 'USD', icon: DollarSign, color: 'bg-emerald-500' },
          { id: 'co2', label: 'CO2 Savings', value: '12.2', unit: 'kg', icon: Leaf, color: 'bg-blue-500' },
        ].map(m => (
          <div 
            key={m.id} 
            onClick={m.id !== 'co2' ? () => onNavigate(m.id) : undefined} 
            className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all ${m.id !== 'co2' ? 'cursor-pointer hover:border-blue-500 hover:ring-4 hover:ring-blue-500/5' : ''}`}
          >
            <div className={`p-3 ${m.color} rounded-xl w-fit mb-4`}><m.icon className="text-white w-6 h-6" /></div>
            <p className="text-xs font-bold text-slate-400 uppercase">{m.label}</p>
            <h3 className="text-2xl font-bold">{m.value} <span className="text-sm font-medium text-slate-500">{m.unit}</span></h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {activeWidgets.includes('threePhase') && (
          <ThreePhasePlot 
            data={telemetry} 
            timeScale={timeScale} 
            setTimeScale={setTimeScale} 
            metric={metric} 
            setMetric={setMetric} 
          />
        )}
        
        {activeWidgets.includes('vitalPie') && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <WidgetHeader title="Load Distribution" onRemove={() => removeWidget('vitalPie')} />
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PIE_DATA} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {PIE_DATA.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-medium text-slate-500">
              {PIE_DATA.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeWidgets.includes('alerts') && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
            <WidgetHeader 
              title="Active Faults" 
              onRemove={() => removeWidget('alerts')} 
              onSettings={onAlertConfig} 
            />
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {MASTER_ALERTS.filter(a => alertSettings.enabled[a.id]).map(a => (
                <div key={a.id} className={`${a.bg} border border-slate-100 p-3 rounded-xl transition-all hover:translate-x-1`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/50 ${a.color}`}>{a.severity}</span>
                    <BellRing size={12} className={a.color} />
                  </div>
                  <p className="text-sm font-bold text-slate-800">{a.type}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{a.msg}</p>
                </div>
              ))}
              {MASTER_ALERTS.filter(a => alertSettings.enabled[a.id]).length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <AlertCircle className="mx-auto mb-2 opacity-20" size={32} />
                  <p className="text-xs font-medium">All monitored systems clear</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeWidgets.includes('scatter') && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <WidgetHeader title="Voltage vs Current" onRemove={() => removeWidget('scatter')} />
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="voltage" name="Voltage" unit="V" tick={{fontSize: 10}} />
                  <YAxis type="number" dataKey="current" name="Current" unit="A" tick={{fontSize: 10}} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Telemetry" data={telemetry} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomizeView = ({ activeWidgets, addWidget, removeWidget, onBack }) => {
  const AVAILABLE = [
    { id: 'vitalPie', name: 'Distribution Pie', icon: <PieIcon size={20} />, desc: 'Energy breakdown by sector' },
    { id: 'scatter', name: 'V/I Scatter Plot', icon: <Activity size={20} />, desc: 'Voltage vs Current correlation' },
    { id: 'efficiency', name: 'Efficiency Metric', icon: <TrendingUp size={20} />, desc: 'Real-time PUE calculation' },
    { id: 'alerts', name: 'Fault Monitoring', icon: <AlertTriangle size={20} />, desc: 'System critical alerts list' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><ArrowLeft size={24}/></button>
        <div>
          <h1 className="text-3xl font-bold">Customize Workspace</h1>
          <p className="text-slate-500 font-medium">Add specialized widgets to your analytical dashboard</p>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {AVAILABLE.map(w => {
          const isActive = activeWidgets.includes(w.id);
          return (
            <div key={w.id} className={`p-6 rounded-2xl border transition-all ${isActive ? 'bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/5' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{w.icon}</div>
                <button onClick={() => isActive ? removeWidget(w.id) : addWidget(w.id)} className={`p-1 rounded-lg ${isActive ? 'text-red-500 hover:bg-red-50' : 'text-blue-500 hover:bg-blue-50'}`}>
                  {isActive ? <Trash2 size={20}/> : <Plus size={20}/>}
                </button>
              </div>
              <h3 className="font-bold text-slate-900">{w.name}</h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">{w.desc}</p>
            </div>
          );
        })}
      </div>

      {/* RESTORED AI SECTION */}
      <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden mt-12">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl font-bold mb-2">Want more analytics?</h2>
          <p className="text-slate-400 mb-6">We are building advanced ML-driven plots including Harmonic Distortion, Transient Analysis, and Predictive Maintenance forecasting.</p>
          <div className="flex gap-4">
            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Harmonics</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">THD%</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Failure Prediction</span>
          </div>
        </div>
        <Settings className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 rotate-12" />
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState('dashboard');
  const [timeScale, setTimeScale] = useState('Hour');
  const [metric, setMetric] = useState('Consumption');
  const [activeWidgets, setActiveWidgets] = useState(['threePhase', 'vitalPie', 'alerts']);
  const [isLoading, setIsLoading] = useState(true);
  
  // Alert Configuration State
  const [alertSettings, setAlertSettings] = useState({
    enabled: { phase: true, pf: true, overload: true, sag: true },
    thresholds: { pf: 0.85, sag: 15, load: 120 }
  });

  const telemetry = useMemo(() => generateTelemetryData(timeScale), [timeScale]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest animate-pulse">Syncing Telemetry...</p>
        </div>
      </div>
    );
  }

  const addWidget = (id) => setActiveWidgets(prev => [...new Set([...prev, id])]);
  const removeWidget = (id) => setActiveWidgets(prev => prev.filter(w => w !== id));

  const renderContent = () => {
    switch(view) {
      case 'customize': return <CustomizeView activeWidgets={activeWidgets} addWidget={addWidget} removeWidget={removeWidget} onBack={() => setView('dashboard')} />;
      case 'uptime': return <UptimeView onBack={() => setView('dashboard')} />;
      case 'consumption': return <ConsumptionFilterView onBack={() => setView('dashboard')} />;
      case 'cost': return <CostView onBack={() => setView('dashboard')} />;
      case 'alertConfig': return <AlertConfigView settings={alertSettings} setSettings={setAlertSettings} onBack={() => setView('dashboard')} />;
      case 'dashboard':
        return (
          <DashboardView 
            activeWidgets={activeWidgets} 
            removeWidget={removeWidget}
            telemetry={telemetry}
            timeScale={timeScale}
            setTimeScale={setTimeScale}
            metric={metric}
            setMetric={setMetric}
            alertSettings={alertSettings}
            onNavigate={(v) => setView(v)}
            onCustomize={() => setView('customize')}
            onAlertConfig={() => setView('alertConfig')}
          />
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto pb-24">
        {renderContent()}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 p-4 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> MQTT Connected</span>
            <span>Gateway: ANALYTICS-X1</span>
          </div>
          <div className="flex gap-4">
            <button className="hover:text-blue-500 transition-colors">Documentation</button>
            <button className="hover:text-red-500 transition-colors">Emergency Stop</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
