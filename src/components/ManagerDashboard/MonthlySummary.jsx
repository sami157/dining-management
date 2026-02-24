import React from 'react';
import { FaCircleCheck } from "react-icons/fa6";
import { TrendingUp, TrendingDown, Wallet, CheckCircle2 } from "lucide-react";

const MonthlySummary = ({ totalExpenses, depositsData, monthFinalized, finalizeMonth }) => {
    const totalDeposit = depositsData?.reduce((sum, d) => sum + d.amount, 0) || 0;
    const balance = totalDeposit - totalExpenses;
    const isPositive = balance >= 0;

    return (
        <div className="w-full">
            <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                    
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight uppercase italic">Monthly Summary</h2>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Financial Overview</p>
                        </div>

                        <button 
                            onClick={finalizeMonth} 
                            disabled={monthFinalized} 
                            className={`btn btn-md rounded-2xl gap-3 px-6 border-none transition-all active:scale-95
                                ${monthFinalized 
                                    ? 'bg-base-200 text-base-content/30 cursor-not-allowed' 
                                    : 'bg-primary text-primary-content hover:bg-primary/90 shadow-none'
                                }`}
                        >
                            {monthFinalized ? (
                                <>
                                    <CheckCircle2 size={18} />
                                    <span className="font-bold uppercase text-xs tracking-widest">Finalized</span>
                                </>
                            ) : (
                                <>
                                    <FaCircleCheck className="text-lg" />
                                    <span className="font-bold uppercase text-xs tracking-widest">Finalize Month</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* Deposit Card */}
                        <div className="bg-base-200/50 border border-base-300 p-6 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 opacity-60">
                                <TrendingUp size={16} className="text-success" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Total Deposit</span>
                            </div>
                            <div className="text-3xl font-black tracking-tighter text-success">
                                ৳{totalDeposit.toLocaleString()}
                            </div>
                        </div>

                        {/* Expense Card */}
                        <div className="bg-base-200/50 border border-base-300 p-6 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 opacity-60">
                                <TrendingDown size={16} className="text-error" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Total Expense</span>
                            </div>
                            <div className="text-3xl font-black tracking-tighter text-error">
                                ৳{totalExpenses.toLocaleString()}
                            </div>
                        </div>

                        {/* Balance Card */}
                        <div className={`border p-6 rounded-xl space-y-3 transition-colors ${
                            isPositive 
                            ? 'bg-success/5 border-success/20' 
                            : 'bg-error/5 border-error/20'
                        }`}>
                            <div className="flex items-center gap-2 opacity-60">
                                <Wallet size={16} className={isPositive ? 'text-success' : 'text-error'} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-base-content">Net Balance</span>
                            </div>
                            <div className={`text-3xl font-black tracking-tighter ${
                                isPositive ? 'text-success' : 'text-error'
                            }`}>
                                ৳{balance.toLocaleString()}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlySummary;