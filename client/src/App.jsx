import React, { useState } from 'react';

export default function OnboardingWizard({ onConnectionSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    businessType: 'SaaS',
    databaseType: 'mongodb', 
    databaseUri: '',
    industryContext: ''
  });
  const [telemetryData, setTelemetryData] = useState(null);

  /**
   * Updates form state on user input and clears previous validation errors.
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  /**
   * Establishes a connection to the specified database.
   * Validates credentials and retrieves initial telemetry metrics.
   * @param {Event} e - Form submission event
   */
  const handleConnectDatabase = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/onboarding/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setTelemetryData(data.initialTelemetry);
        setStep(3);
      } else {
        setError(data.message || 'Database connection handshake rejected.');
      }
    } catch (err) {
      setError('System core failure: Unable to bridge to local secure gateway server.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Finalizes the onboarding workflow and persists client configuration.
   * Packages database parameters and telemetry data for session establishment.
   * Invokes parent callback to navigate to the main application dashboard.
   */
  const handleFinalizeOnboarding = () => {
    if (onConnectionSuccess && telemetryData) {
      onConnectionSuccess({
        companyName: formData.companyName,
        businessType: formData.businessType,
        industryContext: formData.industryContext,
        databaseType: formData.databaseUri.toLowerCase().startsWith('mongo') ? 'mongodb' : 'postgresql',
        databaseUri: formData.databaseUri, 
        telemetryTimestamp: telemetryData.telemetryTimestamp,
        metrics: telemetryData.metrics,
        predictions: telemetryData.predictions
      });
    }
  };
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  /**
   * Submits natural language queries to the database chat interface.
   * Translates user input to database queries and retrieves matching results.
   * Updates the data display with retrieved records and operation logs.
   * @param {Event} e - Form submission event
   */
  const handleSubmitAiChat = async (e) => {
    e.preventDefault();
    if (!chatPrompt.trim() || !targetCollection) {
      return alert("Please select or specify a target database collection first!");
    }
    
    setIsChatLoading(true);
    try {
      setTerminalLogs(prev => [...prev, `🤖 [AI GATEWAY]: Parsing natural language input: "${chatPrompt}"...`]);
      
      const res = await fetch('http://localhost:5000/api/chat/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          databaseUri: activeClientProfile.databaseUri,
          databaseType: activeClientProfile.databaseType,
          targetCollection: targetCollection,
          prompt: chatPrompt
        })
      });
      const json = await res.json();
      
      if (json.success) {
        const results = Array.isArray(json.data?.results) ? json.data.results : [];
        setBrowsedRows(results);
        setTerminalLogs(prev => [
          ...prev,
          `✨ [PARSER SUCCESS]: Query translated to language dialect -> ${json.data?.computedQuery}`,
          `📈 [DATA INGEST]: Fetched ${results.length} records matching search criteria.`
        ]);
        setIsChatOpen(false); 
        setChatPrompt('');    
      } else {
        setTerminalLogs(prev => [...prev, `❌ Engine Exception: ${json.message}`]);
      }
    } catch (err) {
      setTerminalLogs(prev => [...prev, "❌ Connection Error: Gateway timed out or returned no response packet."]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.6)] text-zinc-100 relative overflow-hidden animate-fadeIn">
      
      {/* Decorative visual accent elements */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      <div className="absolute top-0 right-12 w-24 h-[20px] bg-emerald-500/10 blur-xl rounded-full" />

      {/* Header section with title and status indicator */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Isolated Node Authorization
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1 font-sans">
            Core Environment Setup
          </h2>
        </div>
        <div className="font-mono text-xs bg-zinc-950 px-3 py-1.5 rounded-md border border-zinc-800 text-zinc-400 shadow-inner">
          SYS_PHASE: <span className="text-emerald-400 font-bold">0{step}</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/20 border border-red-900/40 text-red-400 text-xs rounded-xl font-mono flex items-start gap-3 backdrop-blur-md">
          <span className="text-red-500 font-bold">[ERROR]:</span>
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Organization Configuration */}
      {step === 1 && (
        <div className="space-y-6">
          <p className="text-xs text-zinc-400 font-mono leading-relaxed bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/40">
            // Enter organization details and operational classification parameters.
          </p>
          
          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Corporate / Platform Designation
            </label>
            <input 
              type="text" name="companyName" value={formData.companyName} onChange={handleChange}
              placeholder="e.g. ALPHA_KITCHENS_INC"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500/70 rounded-xl px-4 py-3.5 text-sm font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(16,185,129,0.05)] shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Operational Vector Model
            </label>
            <div className="relative">
              <select 
                name="businessType" value={formData.businessType} onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500/70 rounded-xl px-4 py-3.5 text-sm font-mono text-zinc-300 focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="SaaS">Digital Product Architecture (SaaS)</option>
                <option value="E-Commerce">High-Velocity Retail / E-Comm</option>
                <option value="B2B Agency">Professional Enterprise B2B Services</option>
                <option value="Local Storefront">Brick & Mortar / Logistical Nodes</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-600 text-xs font-mono">▼</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Industry Context Signature
            </label>
            <input 
              type="text" name="industryContext" value={formData.industryContext} onChange={handleChange}
              placeholder="e.g. Automation infrastructure for industrial operations"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500/70 rounded-xl px-4 py-3.5 text-sm font-sans text-zinc-200 placeholder-zinc-700 focus:outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(16,185,129,0.05)] shadow-inner"
            />
          </div>

          <button 
            disabled={!formData.companyName}
            onClick={() => setStep(2)}
            className="w-full mt-4 bg-zinc-100 hover:bg-white disabled:bg-zinc-800/50 disabled:text-zinc-600 text-zinc-950 font-sans font-bold tracking-tight py-4 rounded-xl text-sm transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
          >
            Initialize Network Config 
            <span className="transform group-hover:translate-x-1 transition-transform font-mono">→</span>
          </button>
        </div>
      )}

      {/* Step 2: Database Connection Configuration */}
      {step === 2 && (
        <form onSubmit={handleConnectDatabase} className="space-y-6">
          <div className="p-4 bg-emerald-950/10 border border-emerald-500/20 text-emerald-300/90 text-xs rounded-xl font-mono space-y-1.5 leading-relaxed">
            <div className="font-bold uppercase text-emerald-400 tracking-wider text-[10px]">Security Notice:</div>
            <p>Connection credentials are processed securely in isolated runtime environments. Sensitive data is automatically redacted from diagnostic output.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Target Database Protocol Engine
            </label>
            <div className="relative">
              <select 
                name="databaseType" value={formData.databaseType} onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500/70 rounded-xl px-4 py-3.5 text-sm font-mono text-zinc-300 focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="mongodb">MongoDB NoSQL Database Store</option>
                <option value="postgresql">PostgreSQL Relational Storage Node</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-600 text-xs font-mono">▼</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Isolated Data Target URI String
            </label>
            <input 
              type="text" name="databaseUri" value={formData.databaseUri} onChange={handleChange}
              placeholder={formData.databaseType === 'mongodb' ? "mongodb://localhost:27017/production_cluster" : "postgresql://db_admin:secure_password@localhost:5432/production_node"}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-400 rounded-xl px-4 py-4 text-xs focus:outline-none font-mono transition-all duration-300 text-emerald-400/90 placeholder-zinc-800 shadow-inner"
              autoFocus
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button" onClick={() => setStep(1)}
              className="w-1/3 border border-zinc-800 hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 py-4 rounded-xl text-xs font-mono font-bold transition-all duration-300 cursor-pointer"
            >
              [BACK_STEP]
            </button>
            <button 
              type="submit" disabled={loading || !formData.databaseUri}
              className="w-2/3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800/50 disabled:text-zinc-600 text-zinc-950 font-sans font-bold py-4 rounded-xl text-sm transition-all duration-300 shadow-xl flex justify-center items-center gap-2 cursor-pointer shadow-emerald-900/10"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  Analyzing Target Clusters...
                </>
              ) : (
                "Establish Secure Pipeline Link 🔒"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Connection Validation and Initial Metrics Display */}
      {step === 3 && telemetryData && (
        <div className="space-y-6">
          <div className="text-center py-4 relative">
            <div className="w-14 h-14 rounded-full bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 text-2xl shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              ✓
            </div>
            <h3 className="text-xl font-bold tracking-tight mt-4 text-white">Handshake Validated</h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-wider">
              PIPELINE_TIMESTAMP: {new Date(telemetryData.telemetryTimestamp).toLocaleTimeString()}
            </p>
          </div>

          {/* System performance and utilization metrics */}
          <div className="grid grid-cols-3 gap-4 font-mono text-center">
            <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800/60 shadow-inner">
              <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Records Indexed</span>
              <span className="text-xl font-black text-white mt-1 block tracking-tighter">
                {telemetryData.metrics.totalTrackedRecords}
              </span>
            </div>
            <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800/60 shadow-inner">
              <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Active Velocity</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block tracking-tighter">
                {telemetryData.metrics.activeMonthlyPercentage}
              </span>
            </div>
            <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800/60 shadow-inner">
              <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-bold">System Decay</span>
              <span className="text-xl font-black text-amber-500 mt-1 block tracking-tighter">
                {telemetryData.metrics.calculatedChurn}
              </span>
            </div>
          </div>

          {/* Predictive analytics and system health assessment */}
          <div className="bg-zinc-950/90 p-5 rounded-xl border border-zinc-800/80 font-mono text-xs text-zinc-400 space-y-2.5 shadow-inner">
            <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-black block">
              // System Predictions and Health Assessment
            </span>
            <div className="h-[1px] bg-zinc-800/60 my-2" />
            <p className="flex justify-between items-center">
              <span className="text-zinc-600">Health Classification Matrix:</span> 
              <span className="text-amber-400 font-bold px-2 py-0.5 bg-amber-950/30 border border-amber-900/40 rounded text-[10px]">
                {telemetryData.predictions.estimatedSystemHealthScore}
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-zinc-600">30-Day Growth Expectation:</span> 
              <span className="text-zinc-200 font-bold">
                +{telemetryData.predictions.forecastedGrowthNextMonth} units
              </span>
            </p>
          </div>

          <button 
            onClick={handleFinalizeOnboarding}
            className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-sans font-bold py-4 rounded-xl text-sm transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
          >
            Enter Platform Intelligence Command Core
            <span className="transform group-hover:translate-x-1 transition-transform font-mono font-bold">→</span>
          </button>
        </div>
      )}
    </div>
  );
}