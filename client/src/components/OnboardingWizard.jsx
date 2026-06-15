import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './LandingPage';
import PinBoard from './PinBoard';
import OnboardingWizard from '../App.jsx';

export default function App() {
  const [activeClientProfile, setActiveClientProfile] = useState(() => {
    try {
      const savedSession = localStorage.getItem('activeClientProfile');
      return savedSession ? JSON.parse(savedSession) : null;
    } catch (error) {
      console.warn('Invalid saved client profile, clearing storage.', error);
      localStorage.removeItem('activeClientProfile');
      return null;
    }
  });

  // Application state management for database exploration features
  const [discoveredCollections, setDiscoveredCollections] = useState([]);
  const [targetCollection, setTargetCollection] = useState('');
  const [browsedRows, setBrowsedRows] = useState([]);
  const [terminalLogs, setTerminalLogs] = useState([
    "// Live database transaction payload logging terminal stream...",
    "> Node connected via secure network interface parameters.",
    "> Hit discover above to explore your local MongoDB cluster layout names."
  ]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am connected to your local AI engine. Ask me to query or filter your active collection using natural language.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const isThinking = isChatLoading;

  const activeUsageVelocity = (() => {
    const totalRecords = activeClientProfile?.metrics?.totalTrackedRecords ?? 0;
    const usageCount = browsedRows?.length ?? 0;

    if (usageCount > 0 && totalRecords > 0) {
      // Calculate a true percentage slice of the database currently loaded
      const truePercentage = (usageCount / totalRecords) * 100;
      
      // Cap at 100% dynamically if active entries outpace baseline metrics
      return `${Math.min(truePercentage, 100).toFixed(1)}%`;
    }

    // Baseline fallback if no rows have been pulled yet
    return activeClientProfile?.metrics?.activeMonthlyPercentage ?? '0.0%';
  })();

  const navigate = useNavigate();
  const location = useLocation();

  const handleOnboardingComplete = (profileData) => {
    console.log("Client portal authenticated:", profileData);
    localStorage.setItem('activeClientProfile', JSON.stringify(profileData));
    setActiveClientProfile(profileData);
    navigate('/dashboard');
  };

  const handleDiscoverCollections = async () => {
    if (!activeClientProfile?.databaseUri) return alert("Connection parameters missing. Please complete session setup.");

    try {
      setTerminalLogs(prev => [...prev, "Submitting database schema inquiry..."]);

      const res = await fetch('http://localhost:5000/api/onboarding/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          databaseType: activeClientProfile.databaseType,
          databaseUri: activeClientProfile.databaseUri
        })
      });
      const json = await res.json();

      if (json.success) {
        const userCollections = json.collections.filter(
          name => name !== 'qss_pinboard_metadata' && !name.startsWith('system.')
        );

        setDiscoveredCollections(userCollections);
        setTerminalLogs(prev => [
          ...prev,
          `Successfully discovered collections: [${userCollections.join(', ')}]`,
          "Select a collection from the available options to browse records."
        ]);
      } else {
        setTerminalLogs(prev => [...prev, `Discovery failed: ${json.message || 'Database query rejected.'}`]);
      }
    } catch (e) {
      setTerminalLogs(prev => [...prev, "Network error: Unable to connect to discovery service."]);
    }
  };

  const handleStreamRows = async () => {
    if (!targetCollection) return alert("Please select or enter a collection name.");
    if (!activeClientProfile?.databaseUri) return alert("Connection parameters missing.");

    try {
      setTerminalLogs(prev => [...prev, `Initiating data retrieval for collection: "${targetCollection}"...`]);

      const res = await fetch('http://localhost:5000/api/onboarding/browse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          databaseType: activeClientProfile.databaseType,
          databaseUri: activeClientProfile.databaseUri,
          targetCollection: targetCollection
        })
      });
      const json = await res.json();

      if (json.success) {
        const rowsCount = json.rows ? json.rows.length : 0;
        setBrowsedRows(json.rows || []);

        setTerminalLogs(prev => [
          ...prev,
          `Successfully retrieved ${rowsCount} documents from collection.`,
          `Document data rendered below.`
        ]);
      } else {
        setTerminalLogs(prev => [...prev, `Error: ${json.message || 'Query execution failed.'}`]);
      }
    } catch (e) {
      setTerminalLogs(prev => [...prev, "Network error: Unable to retrieve collection data."]);
    }
  };

  const handleSubmitAiChat = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inputValue.trim() || !targetCollection) {
      return alert("Please select a collection first, then enter your query.");
    }

    setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
    const currentInput = inputValue;
    setInputValue('');
    setIsChatLoading(true);

    try {
      setTerminalLogs(prev => [...prev, `Processing natural language query: "${currentInput}"...`]);

      const res = await fetch('http://localhost:5000/api/chat/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          databaseUri: activeClientProfile.databaseUri,
          databaseType: activeClientProfile.databaseType,
          targetCollection: targetCollection,
          prompt: currentInput
        })
      });
      const json = await res.json();

      if (json && json.success) {
        const results = json.data?.results ?? [];
        setBrowsedRows(results);

        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: json.data?.explanation || 'Query matched successfully.',
            computedQuery: json.data?.computedQuery,
            results: results 
          }
        ]);
      } else {
        setTerminalLogs(prev => [...prev, `Query execution error: ${json?.message || 'Unknown error'}`]);
      }
    } catch (err) {
      setTerminalLogs(prev => [...prev, "Network error: Unable to execute query."]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // ⚡ UPGRADED: FULLY DYNAMIC SCHEMA-ADAPTIVE PLOTTING PARSER ENGINE
  const chartDataset = (() => {
    if (!browsedRows || browsedRows.length === 0) return [];
    
    // Window slice limits display to 10 plot elements for clean tracking layout width
    const dataWindow = browsedRows.slice(0, 10);
    
    return dataWindow.map((row, i) => {
      // 1. Dynamic Label Extraction Strategy
      let extractedLabel = row.department || row.name || row.label || row.category || row.title || '';
      if (!extractedLabel) {
        // Fallback fallback: Search for the first valid string key layout signature that isn't a tracking ID
        const stringKey = Object.keys(row).find(k => typeof row[k] === 'string' && k !== '_id' && k !== 'id');
        extractedLabel = stringKey ? row[stringKey] : `Idx_${i + 1}`;
      }
      // Clean up technical system sub-node labeling annotations cleanly
      const cleanLabel = String(extractedLabel).replace(" Node", "");

      // 2. Dynamic Value Extraction Strategy
      let extractedValue = row.value || row.count || row.idleMinutes || row.capturedScreenTicks || row.score || 0;
      if (extractedValue === 0) {
        // Fallback fallback: Search object indices for the first property explicitly containing a number
        const numberKey = Object.keys(row).find(k => typeof row[k] === 'number');
        extractedValue = numberKey ? row[numberKey] : 0;
      }

      return { label: cleanLabel, value: Number(extractedValue) };
    });
  })();

  const maxChartValue = Math.max(...chartDataset.map(d => d.value), 1);

  // SVG dimensions for trendline coordinates computing layout matrix
  const svgWidth = 650;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 25;

  const linePoints = chartDataset.map((item, idx) => {
    const x = paddingX + (idx * (svgWidth - paddingX * 2)) / Math.max(chartDataset.length - 1, 1);
    const y = svgHeight - paddingY - ((item.value / maxChartValue) * (svgHeight - paddingY * 2));
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = chartDataset.length > 0 
    ? `${paddingX},${svgHeight - paddingY} ${linePoints} ${paddingX + ((chartDataset.length - 1) * (svgWidth - paddingX * 2)) / Math.max(chartDataset.length - 1, 1)},${svgHeight - paddingY}`
    : '';

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col justify-center items-center p-6 antialiased selection:bg-emerald-500 selection:text-zinc-950 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-30" />

      <div className="w-full relative z-10 py-12">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingWizard onConnectionSuccess={handleOnboardingComplete} />} />

          <Route
            path="/dashboard"
            element={
              activeClientProfile ? (
                <div className="w-full max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl text-zinc-100 font-mono text-sm animate-fadeIn relative">

                  {/* Console Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
                    <div>
                      <h1 className="text-xl font-bold tracking-tight text-zinc-100">{activeClientProfile.companyName || "NEXUS"} Core Console</h1>
                      <p className="text-xs text-zinc-500 mt-0.5">Instance Parameter: {activeClientProfile.businessType || "SaaS Matrix"}</p>
                    </div>
                    <span className="bg-emerald-950/50 text-emerald-400 border border-emerald-800/60 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider animate-pulse">
                      ● Live Local Node
                    </span>
                  </div>

                  {/* Metrics Dashboard Grid */}
                  <div className="p-6 bg-zinc-950 rounded-lg border border-zinc-800 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold uppercase tracking-wider text-xs text-emerald-400 flex items-center gap-2">
                        System Metrics and Performance Indicators
                      </h3>
                      <span className="text-[10px] text-zinc-500 font-sans">
                        System Sync: {activeClientProfile.telemetryTimestamp ? new Date(activeClientProfile.telemetryTimestamp).toLocaleTimeString() : 'ONLINE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-lg flex flex-col justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-bold">Data Elements Indexed</span>
                        <span className="text-2xl font-bold text-zinc-100 mt-2 font-mono">
                          {browsedRows && browsedRows.length > 0 ? browsedRows.length : (activeClientProfile?.metrics?.totalTrackedRecords ?? 0)}
                        </span>
                      </div>

                      <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-lg flex flex-col justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-bold">Active Usage Velocity</span>
                        <span className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
                          {activeUsageVelocity}
                        </span>
                      </div>

                      <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-lg flex flex-col justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-bold">Predicted System Health</span>
                        <span className="text-sm font-bold text-zinc-300 mt-3 uppercase tracking-tight truncate font-mono">
                          {browsedRows && browsedRows.length > 0 ? "OPTIMAL" : "CAUTION"}
                        </span>
                      </div>
                    </div>

                    {/* DYNAMIC ADAPTIVE TRENDLINE SVG COMPONENT */}
                    <div className="border-t border-zinc-900 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">// Dynamic Vector Optimization Analytics Matrix</span>
                        <span className="text-[9px] text-zinc-600 font-mono">Dynamic Peak Vector: [ {maxChartValue} ]</span>
                      </div>
                      
                      {chartDataset.length > 0 ? (
                        <div className="w-full bg-black/20 border border-zinc-900/60 rounded-xl p-4 shadow-inner relative">
                          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                            <defs>
                              <linearGradient id="neonFillGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            
                            <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#1f1f23" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#1f1f23" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#27272a" strokeWidth="1" />

                            {areaPoints && <polygon points={areaPoints} fill="url(#neonFillGradient)" />}

                            {linePoints && (
                              <polyline 
                                points={linePoints} 
                                fill="none" 
                                stroke="#22d3ee" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                              />
                            )}

                            {chartDataset.map((item, idx) => {
                              const x = paddingX + (idx * (svgWidth - paddingX * 2)) / Math.max(chartDataset.length - 1, 1);
                              const y = svgHeight - paddingY - ((item.value / maxChartValue) * (svgHeight - paddingY * 2));
                              return (
                                <g key={idx} className="group/node">
                                  <circle 
                                    cx={x} 
                                    cy={y} 
                                    r="3.5" 
                                    className="fill-zinc-950 stroke-cyan-400 stroke-2 transition-all duration-150 group-hover/node:r-5 group-hover/node:stroke-emerald-400 cursor-pointer" 
                                  />
                                  <text x={x} y={svgHeight - 8} textAnchor="middle" className="text-[8px] fill-zinc-500 font-mono tracking-tighter">
                                    {item.label}
                                  </text>
                                  <g className="opacity-0 group-hover/node:opacity-100 transition-opacity duration-150 pointer-events-none">
                                    <rect x={x - 24} y={y - 24} width="48" height="16" rx="3" className="fill-zinc-900 stroke-zinc-800 stroke shadow-xl" />
                                    <text x={x} y={y - 14} textAnchor="middle" className="text-[9px] fill-emerald-400 font-bold font-mono">
                                      {item.value}
                                    </text>
                                  </g>
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                      ) : (
                        <div className="h-32 w-full bg-black/10 border border-zinc-900 border-dashed rounded-xl flex items-center justify-center text-[10px] text-zinc-600 italic font-mono">
                          ⚡ Awaiting data vectors. Activate collection discovery components to compute trendline coordinates.
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-zinc-400 leading-relaxed text-xs border-t border-zinc-900 pt-4">
                    Database connection established successfully. Operational analysis indicates projected system growth of
                    <span className="text-emerald-400 font-bold mx-1">+{activeClientProfile.predictions?.forecastedGrowthNextMonth ?? 0} units</span> in the next period.
                  </p>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-sans font-medium px-4 py-2.5 rounded transition-all duration-200 text-xs shadow-md cursor-pointer font-semibold"
                    >
                      💬 Open Database Query Interface
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem('activeClientProfile');
                        setActiveClientProfile(null);
                        window.location.href = '/';
                      }}
                      className="border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-sans font-medium px-4 py-2.5 rounded transition-all duration-200 text-xs cursor-pointer"
                    >
                      Disconnect Instance
                    </button>
                  </div>
                </div>
              ) : (
                <Navigate to="/onboarding" replace />
              )
            }
          />
          <Route path="/pinboard" element={<PinBoard />} />
        </Routes>
      </div>

      {/* Database Explorer Console Layer */}
      {activeClientProfile && location.pathname === '/dashboard' && (
        <div className="w-full max-w-4xl mx-auto px-8 relative z-10 -mt-6">
          <div className="mt-8 border-t border-zinc-800/80 pt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
                  <span>🗂️</span> Database Collection Explorer
                </h4>
                <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">Click discover to enumerate collections, then select a collection to retrieve records.</p>
              </div>
              <button
                onClick={handleDiscoverCollections}
                className="text-[10px] bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:text-white px-3 py-1.5 rounded font-mono transition-all text-zinc-400 cursor-pointer font-bold uppercase"
              >
                [DISCOVER_COLLECTIONS]
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1 bg-zinc-950 p-4 border border-zinc-800/60 rounded-lg flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <label className="block text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Collection Name</label>
                  <input
                    type="text"
                    value={targetCollection}
                    onChange={(e) => setTargetCollection(e.target.value)}
                    placeholder="e.g. corporate"
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-emerald-400 px-3 py-2 rounded focus:outline-none focus:border-emerald-600 shadow-inner"
                  />
                  <button
                    onClick={handleStreamRows}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[10px] py-2 rounded font-mono transition-all cursor-pointer font-bold uppercase shadow-sm"
                  >
                    Retrieve Records
                  </button>
                </div>

                {discoveredCollections?.length > 0 && (
                  <div className="pt-2 border-t border-zinc-900 space-y-1.5">
                    <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest block">Discovered Collections:</span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {discoveredCollections.map(name => (
                        <button
                          key={name}
                          onClick={() => setTargetCollection(name)}
                          className={`text-[9px] px-2 py-0.5 rounded font-mono border transition-all cursor-pointer ${targetCollection === name ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/50' : 'bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'}`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-3 bg-zinc-950 border border-zinc-800/60 rounded-lg overflow-hidden flex flex-col justify-between shadow-2xl">
                <div className="bg-zinc-900/50 border-b border-zinc-800 px-4 py-2.5 text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center justify-between">
                  <span>Output Console</span>
                  <span className="text-emerald-500 bg-emerald-950/20 px-2 py-0.5 rounded text-[9px] border border-emerald-900/30 font-bold uppercase tracking-wide">Active</span>
                </div>
                <div className="p-4 overflow-y-auto h-56 text-left font-mono text-[10px] space-y-1.5 leading-relaxed bg-black/30 shadow-inner">
                  {terminalLogs.map((log, index) => (
                    <p key={index} className={log.startsWith('❌') ? 'text-red-400' : log.startsWith('✅') || log.startsWith('📈') ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                      {log}
                    </p>
                  ))}
                  {browsedRows?.length > 0 && (
                    <pre className="text-zinc-300 bg-zinc-900/30 p-3 rounded border border-zinc-800/60 mt-3 max-h-40 overflow-y-auto text-[9px] scrollbar-thin text-emerald-300/80 shadow-2xl">
                      {JSON.stringify(browsedRows, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI INTERFACE OVERLAY MODAL WINDOW */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="w-full max-w-2xl mx-4 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl font-mono text-sm text-zinc-100 flex flex-col h-[540px]">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Local System Intelligent Query Agent
                </h2>
                <p className="text-[10px] text-zinc-500 mt-0.5">Target Scope: {targetCollection ? `[${targetCollection.toUpperCase()}]` : 'None Selected'}</p>
              </div>
              <button
                onClick={() => {
                  setIsChatOpen(false);
                  setInputValue('');
                }}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors cursor-pointer font-sans"
              >
                ✕
              </button>
            </div>

            {!targetCollection && (
              <div className="mb-4 p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg text-amber-400 text-xs leading-relaxed">
                ⚠️ [WARNING]: No system target parameters specified. Please click a discovered collection name in your background explorer layout before firing queries.
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/60 border border-zinc-850 rounded-lg shadow-inner min-h-0">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-xl text-xs max-w-[90%] leading-relaxed border ${
                    m.role === 'user' ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                  }`}>
                    <span className={`text-[8px] uppercase font-black tracking-widest block mb-1 ${m.role === 'user' ? 'text-emerald-500' : 'text-cyan-400'}`}>
                      {m.role === 'user' ? '// Client_Input' : '// Intelligence_Node'}
                    </span>
                    <div className="whitespace-pre-wrap font-sans text-[11px] leading-normal">{m.content}</div>
                    
                    {m.results && m.results.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] text-zinc-400 font-bold uppercase tracking-wider bg-zinc-950 border border-zinc-800/60 px-2 py-1 rounded">
                          <span>📊 Active Execution Output:</span>
                          <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-1 rounded text-[8px]">
                            {m.results.length} records found
                          </span>
                        </div>
                        <pre className="bg-black/60 p-3 rounded-lg border border-zinc-850 text-[10px] text-emerald-300/90 font-mono max-h-36 overflow-y-auto scrollbar-thin shadow-inner text-left">
                          {JSON.stringify(m.results, null, 2)}
                        </pre>
                      </div>
                    )}

                    {m.computedQuery && (
                      <pre className="bg-black/40 p-2.5 rounded border border-zinc-850 text-[10px] text-emerald-400/90 font-mono mt-2 overflow-x-auto max-w-full text-left">
                        {typeof m.computedQuery === 'string' ? m.computedQuery : JSON.stringify(m.computedQuery, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 border border-zinc-850 p-3 rounded-xl text-xs text-zinc-500 italic flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                    Local model compiling query structures...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitAiChat} className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={targetCollection ? "Search collection via natural English..." : "Awaiting database scope configuration..."}
                disabled={isThinking || !targetCollection}
                className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-cyan-600 transition-all"
              />
              <button
                type="submit"
                disabled={isThinking || !targetCollection || !inputValue.trim()}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-850 text-zinc-950 disabled:text-zinc-600 font-bold px-4 py-2.5 rounded-lg text-xs transition-all uppercase tracking-wider cursor-pointer shadow-md"
              >
                Execute
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) for Pin Board */}
      {location.pathname === '/dashboard' && (
        <div className="fixed bottom-6 right-6 z-50 group">
          <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap font-sans">
            Open Pin Board Canvas
          </span>
          <button
            onClick={() => navigate('/pinboard')}
            className="w-12 h-12 bg-zinc-900 hover:bg-zinc-850 text-emerald-400 border border-zinc-800 hover:border-emerald-500/50 rounded-full flex items-center justify-center shadow-2xl shadow-black/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:rotate-12">
              <rect x="3" y="3" width="7" height="9" rx="1"></rect>
              <rect x="14" y="3" width="7" height="5" rx="1"></rect>
              <rect x="14" y="12" width="7" height="9" rx="1"></rect>
              <rect x="3" y="16" width="7" height="5" rx="1"></rect>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}