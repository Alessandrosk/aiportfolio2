
import React, { useState, useEffect } from 'react';
import AssetSelector from './components/AssetSelector';
import RiskSelector from './components/RiskSelector';
import AnalysisView from './components/AnalysisView';
import SavedPortfoliosView from './components/SavedPortfoliosView';
import FinancialCalculators from './components/FinancialCalculators';
import { RiskLevel, PortfolioResponse, Language, SavedPortfolio } from './types';
import { TRANSLATIONS } from './constants';
import { generatePortfolioAnalysis } from './services/geminiService';
import { savePortfolio, getPortfolios, deletePortfolio } from './services/firebase'; // Now using LocalStorage implementation
import { LayoutDashboard, Wallet, Sparkles, AlertCircle, Globe, BookMarked, PlusCircle, Calculator, ExternalLink, Heart } from 'lucide-react';

function App() {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(RiskLevel.MEDIUM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PortfolioResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('en');
  
  // Navigation & Library State
  const [currentView, setCurrentView] = useState<'create' | 'library' | 'calculators'>('create');
  const [savedPortfolios, setSavedPortfolios] = useState<SavedPortfolio[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  const t = TRANSLATIONS[lang];

  // Load Portfolios on Mount
  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
      setLoadingLibrary(true);
      try {
          const data = await getPortfolios();
          setSavedPortfolios(data);
      } catch (e) {
          console.error("Failed to load portfolios", e);
      } finally {
          setLoadingLibrary(false);
      }
  };

  const handleToggleAsset = (symbol: string) => {
    setSelectedAssets(prev => 
      prev.includes(symbol) 
        ? prev.filter(a => a !== symbol) 
        : [...prev, symbol]
    );
  };

  const handleGenerate = async () => {
    if (selectedAssets.length === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await generatePortfolioAnalysis(selectedAssets, riskLevel, lang);
      setResult(data);
    } catch (err) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const handleSavePortfolio = async (portfolioToSave: PortfolioResponse) => {
    const newSaved: SavedPortfolio = {
        ...portfolioToSave,
        id: '', // ID will be assigned by service
        createdAt: Date.now(),
        originalAssets: selectedAssets,
        riskLevel: riskLevel
    };

    try {
        const docId = await savePortfolio(newSaved);
        // Optimistic UI update or reload
        const savedWithId = { ...newSaved, id: docId };
        setSavedPortfolios(prev => [savedWithId, ...prev]);
        setCurrentView('library');
    } catch (e) {
        alert("Failed to save locally.");
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (confirm(t.library.delete + "?")) {
        try {
            await deletePortfolio(id);
            setSavedPortfolios(prev => prev.filter(p => p.id !== id));
        } catch (e) {
            console.error(e);
            alert("Error deleting");
        }
    }
  };

  const handleLoadPortfolio = (p: SavedPortfolio) => {
    setSelectedAssets(p.originalAssets);
    setRiskLevel(p.riskLevel);
    setResult(p); // Load the portfolio structure
    setCurrentView('create'); // Switch back to main view
  };

  // Helper to render current content
  const renderContent = () => {
      if (currentView === 'calculators') {
          return <FinancialCalculators lang={lang} />;
      }

      if (currentView === 'library') {
          return loadingLibrary ? (
              <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
              </div>
          ) : (
              <SavedPortfoliosView 
                  portfolios={savedPortfolios}
                  onLoad={handleLoadPortfolio}
                  onDelete={handleDeletePortfolio}
                  lang={lang}
              />
          );
      }

      // Default Create View
      return !result ? (
        <div className="space-y-12 animate-fade-in-up">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                {t.heroTitle}<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{t.heroTitleHighlight}</span>
            </h1>
            <p className="text-slate-400 text-lg">
                {t.heroDesc}
            </p>
            </div>

            <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl p-6 md:p-8 space-y-10 shadow-2xl">
            <AssetSelector 
                selectedAssets={selectedAssets} 
                onToggleAsset={handleToggleAsset} 
                lang={lang}
            />
            
            <div className="w-full h-px bg-slate-800/50" />
            
            <RiskSelector 
                value={riskLevel} 
                onChange={setRiskLevel} 
                lang={lang}
            />
            </div>

            {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle size={20} />
                {error}
            </div>
            )}

            <div className="flex justify-center pb-8">
            <button
                onClick={handleGenerate}
                disabled={selectedAssets.length === 0 || loading}
                className={`
                relative group px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-white text-lg shadow-lg shadow-cyan-900/20 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                ${!loading && selectedAssets.length > 0 ? 'hover:shadow-cyan-500/40 hover:scale-105' : ''}
                `}
            >
                {loading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t.loading}
                </span>
                ) : (
                <span className="flex items-center gap-2">
                    <Sparkles size={20} className="text-yellow-300" />
                    {t.analyzeBtn}
                </span>
                )}
            </button>
            </div>
        </div>
        ) : (
        <AnalysisView 
            result={result} 
            onReset={handleReset} 
            onSaveToLibrary={handleSavePortfolio}
            lang={lang} 
            riskLevel={riskLevel}
            assets={selectedAssets}
        />
        );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('create')}>
            <div className="bg-gradient-to-tr from-cyan-500 to-purple-600 p-2 rounded-lg">
              <Wallet size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:inline">
              {t.appTitle}<span className="text-slate-400 font-light">{t.appSubtitle}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Nav Tabs */}
             <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 overflow-x-auto">
                <button 
                    onClick={() => setCurrentView('create')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all whitespace-nowrap ${
                        currentView === 'create' ? 'bg-slate-700 text-cyan-400 shadow' : 'text-slate-500 hover:text-slate-200'
                    }`}
                >
                    <PlusCircle size={14} /> {t.nav.create}
                </button>
                <button 
                    onClick={() => setCurrentView('library')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all whitespace-nowrap ${
                        currentView === 'library' ? 'bg-slate-700 text-purple-400 shadow' : 'text-slate-500 hover:text-slate-200'
                    }`}
                >
                    <BookMarked size={14} /> {t.nav.library}
                </button>
                <button 
                    onClick={() => setCurrentView('calculators')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all whitespace-nowrap ${
                        currentView === 'calculators' ? 'bg-slate-700 text-orange-400 shadow' : 'text-slate-500 hover:text-slate-200'
                    }`}
                >
                    <Calculator size={14} /> {t.nav.calculators}
                </button>
             </div>

            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 rounded-lg p-1 border border-slate-800">
               <Globe size={14} className="ml-2 text-slate-500"/>
               {(['it', 'en', 'es'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`text-xs font-bold px-2 py-1 rounded uppercase transition-colors ${
                       lang === l ? 'bg-slate-700 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {l}
                  </button>
               ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-grow w-full">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <a 
                href="https://www.eharth.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-all duration-300 font-medium group text-sm"
            >
                <span className="group-hover:scale-110 transition-transform">Discover</span> 
                <span className="font-bold text-slate-200 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 transition-all">eHarth.com</span>
                <ExternalLink size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </a>
            <p className="text-[10px] text-slate-600 mt-2">
                Powered by Gemini AI • Built for the future
            </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
