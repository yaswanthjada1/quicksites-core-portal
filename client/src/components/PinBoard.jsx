import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


// Icon component definitions
const LayoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
    <rect x="3" y="3" width="7" height="9" rx="1"></rect>
    <rect x="14" y="3" width="7" height="5" rx="1"></rect>
    <rect x="14" y="12" width="7" height="9" rx="1"></rect>
    <rect x="3" y="16" width="7" height="5" rx="1"></rect>
  </svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);
const MoveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-emerald-400 transition-colors">
    <polyline points="5 9 2 12 5 15"></polyline>
    <polyline points="9 5 12 2 15 5"></polyline>
    <polyline points="15 19 12 22 9 19"></polyline>
    <polyline points="19 9 22 12 19 15"></polyline>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <line x1="12" y1="2" x2="12" y2="22"></line>
  </svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 animate-pulse">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
  </svg>
);
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

// Widget component rendering telemetry-driven card content
function WidgetComponent({ 
  widget, 
  getResolvedValue, 
  formatWidgetDescription, 
  handleInteractionStart, 
  removeWidget, 
  interactingWidgetId, 
  interactionType 
}) {
  const [telemetryData, setTelemetryData] = useState(null);

  useEffect(() => {
    const metricTag = widget.description?.metric;
    const category = widget.category || String(metricTag || widget.title || 'telemetry').toLowerCase();

    const normalizeValue = (value) => {
      if (typeof value !== 'number') return Number(value) || 0;
      return value;
    };

    let baseValue = 0;
    if (metricTag && String(metricTag).toLowerCase().includes('sales')) {
      baseValue = 420;
    } else if (category.includes('memory') || category.includes('devops')) {
      baseValue = 68;
    } else if (category.includes('cpu') || category.includes('load')) {
      baseValue = 32;
    } else {
      baseValue = 54;
    }

    setTelemetryData(prev => ({
      category,
      label: metricTag ? String(metricTag) : widget.title || category,
      value: prev?.value ?? baseValue,
      unit: category.includes('memory') || category.includes('devops') ? '%' : 'count',
      timestamp: new Date().toLocaleTimeString()
    }));

    const intervalId = window.setInterval(() => {
      setTelemetryData((prev) => {
        const currentValue = normalizeValue(prev?.value ?? baseValue);
        const swing = Math.floor(Math.random() * 9) - 4;
        const nextValue = Math.max(0, Math.min(100, currentValue + swing));

        return {
          category,
          label: metricTag ? String(metricTag) : String(widget.title || category),
          value: nextValue,
          unit: category.includes('memory') || category.includes('devops') ? '%' : 'count',
          timestamp: new Date().toLocaleTimeString()
        };
      });
    }, 2000);

    // Example backend telemetry fetch for future integration:
    // axios.get(`http://localhost:5000/api/telemetry/${category}`)
    //   .then((res) => {
    //     setTelemetryData(res.data);
    //   })
    //   .catch((err) => console.error('Telemetry fetch failed', err));

    return () => {
      window.clearInterval(intervalId);
    };
  }, [widget]);

  const safeRenderValue = (value, fallback = 'image_0682ca.png') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  const liveDisplayValue = safeRenderValue(getResolvedValue(widget.id) ?? widget.value, 'image_0682ca.png');
  const descriptionText = formatWidgetDescription(widget.description ?? widget.desc ?? 'No description available');

  return (
    <div 
      style={{
        position: 'absolute',
        left: `${widget.x}px`,
        top: `${widget.y}px`,
        width: `${widget.w}px`,
        height: `${widget.h}px`,
      }}
      className={`bg-zinc-900/90 border backdrop-blur-sm rounded-lg p-4 flex flex-col justify-between shadow-2xl group transition-shadow ${
        interactingWidgetId === widget.id && interactionType === 'drag' 
          ? 'border-emerald-500/60 shadow-emerald-950/10' 
          : 'border-zinc-800 hover:border-zinc-700 shadow-black/80'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="max-w-[70%]">
          <span className="text-[8px] font-black tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-1.5 py-0.5 rounded uppercase">
            {widget.type}
          </span>
          <h3 className="font-bold text-zinc-200 mt-2 text-xs truncate select-none">{widget.title}</h3>
        </div>
        
        <div className="flex items-center gap-1.5">
          <div 
            onMouseDown={(e) => handleInteractionStart(e, widget, 'drag')}
            className="p-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-emerald-400 cursor-grab active:cursor-grabbing transition-colors"
          >
            <MoveIcon />
          </div>
          <button 
            onClick={() => removeWidget(widget.id)}
            className="p-1 rounded bg-zinc-950 border border-zinc-850 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
          >
            <XIcon />
          </button>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-zinc-950/60 flex-1 flex flex-col justify-center min-h-0">
        <p className="text-lg font-bold text-zinc-100 tracking-tight font-mono text-emerald-400/90 truncate">
          {telemetryData ? (
            telemetryData.unit === '%' ?
              `${telemetryData.label}: ${telemetryData.value}%` :
              `${telemetryData.label}: ${telemetryData.value.toLocaleString()}`
          ) : liveDisplayValue}
        </p>
        <p className="text-[10px] text-zinc-500 font-sans mt-0.5 leading-normal line-clamp-2">
          {telemetryData ? `Updated ${telemetryData.timestamp}` : descriptionText}
        </p>
      </div>

      <div 
        onMouseDown={(e) => handleInteractionStart(e, widget, 'resize')}
        className="absolute bottom-0 right-0 w-3.5 h-3.5 cursor-se-resize flex items-end justify-end p-0.5 group-hover:bg-zinc-800 rounded-br-lg transition-colors"
      >
        <svg width="6" height="6" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg" className="text-zinc-600 group-hover:text-emerald-400">
          <path d="M6 0L0 6M6 3L3 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

export default function PinBoard() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [widgetBox, setWidgetBox] = useState([]);
  const [activeWidgets, setActiveWidgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Aggregated dashboard statistics state
  const [dbStats, setDbStats] = useState({ totalCount: 0, flaggedCount: 0 });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Drag and resize interaction state
  const [interactingWidgetId, setInteractingWidgetId] = useState(null);
  const [interactionType, setInteractionType] = useState(null);
  const [startMousePos, setStartMousePos] = useState({ x: 0, y: 0 });
  const [startWidgetDims, setStartWidgetDims] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const clientProfile = JSON.parse(localStorage.getItem('activeClientProfile') || '{}');

  // Initial board synchronization from backend
  useEffect(() => {
    const fetchLayoutAndData = async () => {
      try {
        // Request saved board layout from backend
        const layoutRes = await fetch('http://localhost:5000/api/pinboard/layout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            databaseUri: clientProfile.databaseUri,
            targetCollection: clientProfile.companyName
          })
        });

        if (!layoutRes.ok) {
          const message = await layoutRes.text();
          throw new Error(`Pinboard layout request failed: ${layoutRes.status} ${layoutRes.statusText} - ${message}`);
        }

        const layoutJson = await layoutRes.json();
        
        let initialActive = layoutJson.activeWidgets || [];
        let initialBox = layoutJson.widgetBox || [];

        if (!layoutJson.success || initialActive.length === 0) {
          // Fallback layout when backend returns no active configuration
          initialBox = [
            { id: 'w_ticks', title: 'Screen Ticks Monitor', type: 'metric', desc: 'Avg activity capacity' },
            { id: 'w_idle', title: 'Idle Time Alert', type: 'status', desc: 'Node tracking trigger' },
          ];
          initialActive = [
            { id: 'w_dept', title: 'Department Breakdown', type: 'chart', desc: 'Engineering vs Design Nodes', x: 40, y: 40, w: 320, h: 200 }
          ];
        }

        // Request initial content statistics for telemetry metrics
        const dataRes = await fetch('http://localhost:5000/api/onboarding/browse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            databaseType: clientProfile.databaseType,
            databaseUri: clientProfile.databaseUri,
            targetCollection: 'corporate' // Primary business collection stream
          })
        });
        const dataJson = await dataRes.json();

        if (dataJson.success && dataJson.rows) {
          const rows = dataJson.rows;
          const totalCount = rows.length;
          // Compute flagged idle node count from returned rows
          const flaggedCount = rows.filter(row => row.idleMinutes > 15 || row.idleMinutes?.['$gt'] > 15).length;
          
          setDbStats({ totalCount, flaggedCount });
        }

        setWidgetBox(initialBox);
        setActiveWidgets(initialActive);
      } catch (err) {
        console.error('Failed to sync artboard layout structures:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLayoutAndData();
  }, []);

  // Resolve fallback widget display text for standard IDs
  const getResolvedValue = (widgetId) => {
    if (widgetId === 'w_ticks') return `${dbStats.totalCount.toLocaleString()} Elements`;
    if (widgetId === 'w_idle') return dbStats.flaggedCount > 0 ? `${dbStats.flaggedCount} Flagged Nodes` : '0 Idle Flags';
    if (widgetId === 'w_dept') return `Active Cluster Layout`;
    return null;
  };

  const formatWidgetDescription = (description) => {
    if (typeof description === 'string') {
      return description;
    }

    if (description && typeof description === 'object') {
      const { metric, interval, ...rest } = description;
      const formattedParts = [];

      if (metric !== undefined) formattedParts.push(`Metric: ${String(metric)}`);
      if (interval !== undefined) formattedParts.push(`Interval: ${String(interval)}`);

      Object.keys(rest).forEach((key) => {
        const value = rest[key];
        formattedParts.push(`${key}: ${typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}`);
      });

      return formattedParts.length > 0 ? formattedParts.join(' | ') : JSON.stringify(description);
    }

    return String(description || '');
  };

  // Persist current layout to backend storage
  const handleCommitLayout = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/pinboard/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          databaseUri: clientProfile.databaseUri,
          targetCollection: clientProfile.companyName,
          widgetBox,
          activeWidgets
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Pinboard save request failed: ${res.status}`);
      }

      alert('[SYSTEM SUCCESS]: Workspace coordinates locked into database cluster.');
    } catch (err) {
      alert('Network failure syncing visual state variables.');
    } finally {
      setIsSaving(false);
    }
  };

  const placeWidget = (widgetId) => {
    const target = widgetBox.find(w => w.id === widgetId);
    if (target) {
      const newWidget = { ...target, x: 80, y: 80, w: 280, h: 180 };
      setActiveWidgets([...activeWidgets, newWidget]);
      setWidgetBox(widgetBox.filter(w => w.id !== widgetId));
    }
  };

  const removeWidget = (widgetId) => {
    const target = activeWidgets.find(w => w.id === widgetId);
    if (target) {
      const { x, y, w, h, value, ...cleanWidget } = target;
      setWidgetBox([...widgetBox, cleanWidget]);
      setActiveWidgets(activeWidgets.filter(w => w.id !== widgetId));
    }
  };

  const handleInteractionStart = (e, widget, type) => {
    e.preventDefault();
    setInteractingWidgetId(widget.id);
    setInteractionType(type);
    setStartMousePos({ x: e.clientX, y: e.clientY });
    setStartWidgetDims({ x: widget.x, y: widget.y, w: widget.w, h: widget.h });
  };

  const handleGlobalMouseMove = (e) => {
    if (!interactingWidgetId) return;
    const deltaX = e.clientX - startMousePos.x;
    const deltaY = e.clientY - startMousePos.y;

    setActiveWidgets(prev => prev.map(w => {
      if (w.id !== interactingWidgetId) return w;
      if (interactionType === 'drag') {
        return {
          ...w,
          x: Math.max(0, startWidgetDims.x + deltaX),
          y: Math.max(0, startWidgetDims.y + deltaY)
        };
      } else if (interactionType === 'resize') {
        return {
          ...w,
          w: Math.max(200, startWidgetDims.w + deltaX),
          h: Math.max(140, startWidgetDims.h + deltaY)
        };
      }
      return w;
    }));
  };

  const handleInteractionEnd = () => {
    setInteractingWidgetId(null);
    setInteractionType(null);
  };

  // Generate new widget blueprints from the AI prompt
  const handleAiGeneration = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('http://localhost:5000/api/pinboard/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const json = await res.json();

      if (json.success && json.widget) {
        setWidgetBox(prev => [json.widget, ...prev]);
        setAiPrompt('');
      } else {
        console.error('System factory generation failed:', json.error || 'Unknown error code.');
      }
    } catch (err) {
      console.error('Network transaction exception parsing component generation values:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono text-xs text-emerald-400 tracking-widest animate-pulse">
        &gt; PARSING_ACTIVE_WORKSPACE_COORDINATES...
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-mono flex flex-col select-none overflow-hidden h-screen"
      onMouseMove={handleGlobalMouseMove}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-70" />
      
      <div className="flex flex-wrap gap-4 justify-between items-center border-b border-zinc-900 pb-4 mb-4 relative z-10 bg-zinc-950/80 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-zinc-100">
            <LayoutIcon /> Infinite Workspace Board
          </h1>
          <p className="text-[11px] text-zinc-500 mt-0.5 font-sans">Figma Engine Active: Grab canvas components to position or stretch dimensions freely across absolute pixels.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded text-xs font-bold transition-all text-emerald-400 cursor-pointer shadow-sm"
          >
            <PlusIcon /> [OPEN_BLUEPRINT_DRAWER]
          </button>
          
          <button 
            onClick={handleCommitLayout}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 px-3 py-1.5 rounded text-xs font-bold text-zinc-950 transition-all cursor-pointer shadow-md"
          >
            <SaveIcon /> {isSaving ? '[COMMITTING...]' : '[COMMIT_ARTBOARD_COORDINATES]'}
          </button>
        </div>
      </div>

      <div 
        className="flex-1 rounded-xl border border-zinc-900 bg-zinc-950/40 relative z-10 overflow-auto shadow-inner min-h-0"
      >
        {activeWidgets.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 text-xs gap-2 font-sans pointer-events-none">
            <p>Infinite artboard layer is completely blank.</p>
            <button onClick={() => setIsDrawerOpen(true)} className="text-xs text-emerald-400 underline hover:text-emerald-300 font-mono pointer-events-auto cursor-pointer">
              [SPAWN_NEW_BLUEPRINT_FRAME]
            </button>
          </div>
        ) : (
          activeWidgets.map((widget) => (
            <WidgetComponent
              key={widget.id}
              widget={widget}
              getResolvedValue={getResolvedValue}
              formatWidgetDescription={formatWidgetDescription}
              handleInteractionStart={handleInteractionStart}
              removeWidget={removeWidget}
              interactingWidgetId={interactingWidgetId}
              interactionType={interactionType}
            />
          ))
        )}
      </div>

      <div className={`fixed inset-y-0 right-0 w-96 bg-zinc-900/95 backdrop-blur-md border-l border-zinc-800 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
          <h2 className="font-bold text-xs tracking-wider uppercase text-zinc-400">Blueprint Registry</h2>
          <button onClick={() => setIsDrawerOpen(false)} className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer">
            <XIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-0 bg-zinc-900/50">
          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block mb-2">Available Frames:</span>
          {widgetBox.length === 0 ? (
            <p className="text-[10px] text-zinc-600 italic py-4 text-center font-sans">No module blueprints remaining in buffer.</p>
          ) : (
            widgetBox.map((w) => (
              <div key={w.id} className="bg-zinc-950 border border-zinc-850 rounded p-3 hover:border-emerald-500/20 transition-all flex justify-between items-center group">
                <div className="max-w-[220px]">
                  <h4 className="text-xs font-bold text-zinc-300 truncate">{w.title}</h4>
                  <p className="text-[10px] text-zinc-600 mt-0.5 font-sans truncate">{w.desc}</p>
                </div>
                <button 
                  onClick={() => placeWidget(w.id)}
                  className="text-[10px] bg-zinc-900 hover:bg-emerald-500 border border-zinc-800 hover:border-emerald-600 text-zinc-400 hover:text-zinc-950 px-2.5 py-1 rounded transition-all font-bold cursor-pointer uppercase"
                >
                  Place
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-1.5 mb-2">
            <SparklesIcon />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">AI Widget Compiler</span>
          </div>

          <form onSubmit={handleAiGeneration} className="space-y-2">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Compile customized layouts directly via Repo 2 model directives..."
              disabled={isGenerating}
              className="w-full h-20 bg-zinc-900 border border-zinc-850 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 resize-none transition-colors leading-relaxed"
            />
            <button
              type="submit"
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 font-bold hover:border-zinc-700 hover:text-white disabled:opacity-40 disabled:text-zinc-700 py-2 rounded text-xs transition-all flex items-center justify-center gap-1.5 shadow-md uppercase cursor-pointer"
            >
              {isGenerating ? (
                <div className="flex items-center gap-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                </div>
              ) : (
                'Execute Factory Compilation'
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="fixed bottom-6 left-6 z-40 group">
        <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-zinc-950 border border-zinc-800 text-zinc-400 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap font-sans">
          Return to Core Console
        </span>
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-12 h-12 bg-zinc-900 hover:bg-zinc-850 text-emerald-400 border border-zinc-800 hover:border-emerald-500/50 rounded-full flex items-center justify-center shadow-2xl shadow-black/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <HomeIcon />
        </button>
      </div>

    </div>
  );
}