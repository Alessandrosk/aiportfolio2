
import React, { useState, useEffect } from 'react';
import { Language, HelpContent } from '../types';
import { TRANSLATIONS } from '../constants';
import { Calculator, Percent, Scale, TrendingUp, ArrowRight, DollarSign, Layers, ArrowLeft, HelpCircle, X, BookOpen, Clock, Lightbulb } from 'lucide-react';

interface Props {
    lang: Language;
}

type CalculatorType = 'compound' | 'delta' | 'risk' | 'average';

const FinancialCalculators: React.FC<Props> = ({ lang }) => {
    const t = TRANSLATIONS[lang].calc;

    // --- State: Order of Cards ---
    const [order, setOrder] = useState<CalculatorType[]>(['compound', 'delta', 'risk', 'average']);
    
    // --- State: Active Help Modal ---
    const [activeHelp, setActiveHelp] = useState<{content: HelpContent, color: string} | null>(null);

    // --- State: Compound Interest ---
    const [compPrincipal, setCompPrincipal] = useState<string>('10000');
    const [compRate, setCompRate] = useState<string>('8');
    const [compYears, setCompYears] = useState<string>('10');
    const [compResult, setCompResult] = useState({ total: 0, profit: 0 });

    // --- State: Percentage Delta ---
    const [deltaA, setDeltaA] = useState<string>('100');
    const [deltaB, setDeltaB] = useState<string>('150');
    const [deltaResult, setDeltaResult] = useState({ diff: 0, perc: 0 });

    // --- State: Position Sizing ---
    const [riskBalance, setRiskBalance] = useState<string>('10000');
    const [riskPerc, setRiskPerc] = useState<string>('1');
    const [riskStop, setRiskStop] = useState<string>('5');
    const [riskResult, setRiskResult] = useState({ size: 0, amount: 0 });

    // --- State: Average Down ---
    const [avgOwned, setAvgOwned] = useState<string>('100');
    const [avgPrice, setAvgPrice] = useState<string>('50');
    const [avgNewPrice, setAvgNewPrice] = useState<string>('40');
    const [avgBuy, setAvgBuy] = useState<string>('100');
    const [avgResult, setAvgResult] = useState({ newAvg: 0, totalShares: 0 });

    // --- Reordering Logic ---
    const moveCard = (index: number, direction: 'left' | 'right') => {
        const newOrder = [...order];
        const targetIndex = direction === 'left' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newOrder.length) {
            [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
            setOrder(newOrder);
        }
    };

    // --- Effects for Auto-Calculation ---
    useEffect(() => {
        const p = parseFloat(compPrincipal) || 0;
        const r = parseFloat(compRate) || 0;
        const y = parseFloat(compYears) || 0;
        const total = p * Math.pow((1 + r / 100), y);
        const profit = total - p;
        setCompResult({ total, profit });
    }, [compPrincipal, compRate, compYears]);

    useEffect(() => {
        const a = parseFloat(deltaA) || 0;
        const b = parseFloat(deltaB) || 0;
        const diff = b - a;
        const perc = a !== 0 ? (diff / a) * 100 : 0;
        setDeltaResult({ diff, perc });
    }, [deltaA, deltaB]);

    useEffect(() => {
        const bal = parseFloat(riskBalance) || 0;
        const rp = parseFloat(riskPerc) || 0;
        const sl = parseFloat(riskStop) || 0;
        const amount = bal * (rp / 100);
        const size = sl !== 0 ? amount / (sl / 100) : 0;
        setRiskResult({ size, amount });
    }, [riskBalance, riskPerc, riskStop]);

    useEffect(() => {
        const q1 = parseFloat(avgOwned) || 0;
        const p1 = parseFloat(avgPrice) || 0;
        const p2 = parseFloat(avgNewPrice) || 0;
        const q2 = parseFloat(avgBuy) || 0;

        const totalCost = (q1 * p1) + (q2 * p2);
        const totalQ = q1 + q2;
        const newAvg = totalQ !== 0 ? totalCost / totalQ : 0;

        setAvgResult({ newAvg, totalShares: totalQ });
    }, [avgOwned, avgPrice, avgNewPrice, avgBuy]);

    // --- Render Functions for Cards ---
    const renderCard = (type: CalculatorType, index: number) => {
        const isFirst = index === 0;
        const isLast = index === order.length - 1;

        const Header = ({ title, icon: Icon, colorClass, onHelp }: any) => (
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${colorClass.bg} ${colorClass.text} transition-colors`}>
                        <Icon size={24} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-lg text-slate-100 leading-tight">{title}</h3>
                        <button 
                            onClick={onHelp} 
                            className="text-xs text-slate-500 hover:text-white flex items-center gap-1 mt-1 transition-colors w-fit"
                        >
                           <HelpCircle size={12} /> Help
                        </button>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button 
                        onClick={() => moveCard(index, 'left')} 
                        disabled={isFirst}
                        className={`p-1 rounded hover:bg-slate-800 transition-colors ${isFirst ? 'opacity-20 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <button 
                         onClick={() => moveCard(index, 'right')} 
                         disabled={isLast}
                         className={`p-1 rounded hover:bg-slate-800 transition-colors ${isLast ? 'opacity-20 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
                    >
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );

        if (type === 'compound') {
            return (
                <div key="compound" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all animate-fade-in">
                    <Header 
                        title={t.compound.title} 
                        icon={TrendingUp} 
                        colorClass={{bg: 'bg-cyan-500/10', text: 'text-cyan-400'}} 
                        onHelp={() => setActiveHelp({content: t.compound.help, color: 'text-cyan-400'})}
                    />
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t.compound.principal}</label>
                            <input type="number" value={compPrincipal} onChange={e => setCompPrincipal(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t.compound.rate}</label>
                                <input type="number" value={compRate} onChange={e => setCompRate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t.compound.years}</label>
                                <input type="number" value={compYears} onChange={e => setCompYears(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"/>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                            <div className="flex justify-between items-center"><span className="text-sm text-slate-400">{t.compound.profit}</span><span className="font-mono font-bold text-green-400">+${compResult.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                            <div className="flex justify-between items-center bg-cyan-950/20 p-3 rounded-lg border border-cyan-500/20"><span className="text-sm font-bold text-cyan-100">{t.compound.result}</span><span className="font-mono font-bold text-xl text-cyan-400">${compResult.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                        </div>
                    </div>
                </div>
            );
        }

        if (type === 'delta') {
            return (
                <div key="delta" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/30 transition-all animate-fade-in">
                    <Header 
                        title={t.delta.title} 
                        icon={Percent} 
                        colorClass={{bg: 'bg-purple-500/10', text: 'text-purple-400'}} 
                        onHelp={() => setActiveHelp({content: t.delta.help, color: 'text-purple-400'})}
                    />
                    <div className="space-y-4">
                        <div className="relative"><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t.delta.valA}</label><input type="number" value={deltaA} onChange={e => setDeltaA(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-purple-500 focus:outline-none"/></div>
                        <div className="flex justify-center -my-2 relative z-10"><div className="bg-slate-800 rounded-full p-1 border border-slate-700"><ArrowRight size={16} className="text-slate-400 rotate-90" /></div></div>
                        <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t.delta.valB}</label><input type="number" value={deltaB} onChange={e => setDeltaB(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-purple-500 focus:outline-none"/></div>
                        <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                            <div className="flex justify-between items-center"><span className="text-sm text-slate-400">{t.delta.diff}</span><span className="font-mono font-bold text-slate-200">{deltaResult.diff.toLocaleString()}</span></div>
                            <div className={`flex justify-between items-center p-3 rounded-lg border ${deltaResult.perc > 0 ? 'bg-green-500/10 border-green-500/20' : deltaResult.perc < 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-800 border-slate-700'}`}><span className="text-sm font-bold text-slate-200">{t.delta.change}</span><span className={`font-mono font-bold text-xl ${deltaResult.perc > 0 ? 'text-green-400' : deltaResult.perc < 0 ? 'text-red-400' : 'text-slate-400'}`}>{deltaResult.perc > 0 ? '+' : ''}{deltaResult.perc.toFixed(2)}%</span></div>
                        </div>
                    </div>
                </div>
            );
        }

        if (type === 'risk') {
            return (
                <div key="risk" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-orange-500/30 transition-all animate-fade-in">
                    <Header 
                        title={t.risk.title} 
                        icon={Scale} 
                        colorClass={{bg: 'bg-orange-500/10', text: 'text-orange-400'}} 
                        onHelp={() => setActiveHelp({content: t.risk.help, color: 'text-orange-400'})}
                    />
                    <div className="space-y-4">
                        <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t.risk.balance}</label><div className="relative"><DollarSign size={16} className="absolute left-3 top-3 text-slate-500"/><input type="number" value={riskBalance} onChange={e => setRiskBalance(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-9 pr-3 text-white focus:ring-1 focus:ring-orange-500 focus:outline-none"/></div></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t.risk.riskPerc}</label><input type="number" value={riskPerc} onChange={e => setRiskPerc(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-orange-500 focus:outline-none"/></div>
                            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t.risk.stopLoss}</label><input type="number" value={riskStop} onChange={e => setRiskStop(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-orange-500 focus:outline-none"/></div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                            <div className="flex justify-between items-center"><span className="text-sm text-slate-400">{t.risk.riskAmount}</span><span className="font-mono font-bold text-red-400">${riskResult.amount.toLocaleString()}</span></div>
                            <div className="flex justify-between items-center bg-orange-950/20 p-3 rounded-lg border border-orange-500/20"><span className="text-sm font-bold text-orange-100">{t.risk.positionSize}</span><span className="font-mono font-bold text-xl text-orange-400">${riskResult.size.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                        </div>
                    </div>
                </div>
            );
        }

        if (type === 'average') {
            return (
                <div key="average" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-pink-500/30 transition-all animate-fade-in">
                    <Header 
                        title={t.average.title} 
                        icon={Layers} 
                        colorClass={{bg: 'bg-pink-500/10', text: 'text-pink-400'}} 
                        onHelp={() => setActiveHelp({content: t.average.help, color: 'text-pink-400'})}
                    />
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t.average.ownedShares}</label><input type="number" value={avgOwned} onChange={e => setAvgOwned(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-pink-500 focus:outline-none"/></div>
                            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t.average.avgPrice}</label><input type="number" value={avgPrice} onChange={e => setAvgPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-pink-500 focus:outline-none"/></div>
                        </div>
                        <div className="flex justify-center -my-2 relative z-10"><div className="bg-slate-800 rounded-full p-1 border border-slate-700"><ArrowRight size={16} className="text-slate-400 rotate-90" /></div></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t.average.newPrice}</label><input type="number" value={avgNewPrice} onChange={e => setAvgNewPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-pink-500 focus:outline-none"/></div>
                            <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{t.average.buyShares}</label><input type="number" value={avgBuy} onChange={e => setAvgBuy(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-pink-500 focus:outline-none"/></div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                             <div className="flex justify-between items-center"><span className="text-sm text-slate-400">{t.average.totalShares}</span><span className="font-mono font-bold text-slate-300">{avgResult.totalShares.toLocaleString()}</span></div>
                            <div className="flex justify-between items-center bg-pink-950/20 p-3 rounded-lg border border-pink-500/20"><span className="text-sm font-bold text-pink-100">{t.average.newAvg}</span><span className="font-mono font-bold text-xl text-pink-400">${avgResult.newAvg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                {t.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {order.map((type, index) => renderCard(type, index))}
            </div>

            {/* Modal Implementation */}
            {activeHelp && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setActiveHelp(null)} />
                    <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 animate-fade-in-up">
                        <button onClick={() => setActiveHelp(null)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
                            <X size={20}/>
                        </button>

                        <div className="mb-6">
                             <div className={`w-12 h-12 rounded-xl bg-opacity-10 flex items-center justify-center mb-4 ${activeHelp.color.replace('text-', 'bg-')}`}>
                                <BookOpen size={24} className={activeHelp.color} />
                             </div>
                             <h3 className={`text-2xl font-bold ${activeHelp.color}`}>{activeHelp.content.title}</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-200 uppercase mb-2">
                                    <Lightbulb size={16} className="text-yellow-400" /> What
                                </h4>
                                <p className="text-slate-300 text-sm leading-relaxed">{activeHelp.content.what}</p>
                            </div>

                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-200 uppercase mb-2">
                                    <Clock size={16} className="text-blue-400" /> When
                                </h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{activeHelp.content.when}</p>
                            </div>

                            <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/10">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-green-400 uppercase mb-2">
                                    Example
                                </h4>
                                <p className="text-slate-300 text-sm font-mono leading-relaxed">{activeHelp.content.example}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialCalculators;
