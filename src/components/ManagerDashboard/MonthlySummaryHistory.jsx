import React from 'react';
import { TrendingUp, TrendingDown, Utensils, Zap, History } from "lucide-react";

export const MonthlySummaryHistory = ({ totalExpenses, depositsData, finalizationData }) => {
    const totalDeposit = depositsData?.reduce((sum, d) => sum + d.amount, 0) || 0;

    return (
        <div className="w-full">
            <div className="bg-base-100 border border-base-300 rounded-[2rem] overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                    
                    {/* Header Section */}
                    <div className="flex items-center justify-between border-b border-base-300 pb-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight uppercase italic flex items-center gap-2">
                                <History size={24} className="text-primary" />
                                Monthly Summary
                            </h2>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Finalized Report</p>
                        </div>
                        <div className="badge badge-outline border-base-300 font-bold px-4 py-3 rounded-full opacity-60">
                            ARCHIVED
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        
                        {/* Deposit Card */}
                        <div className="bg-base-200/50 border border-base-300 p-4 sm:p-6 rounded-3xl space-y-2">
                            <div className="flex items-center gap-2 opacity-60">
                                <TrendingUp size={14} className="text-success" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Deposit</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-black tracking-tighter text-success">
                                ৳{totalDeposit.toLocaleString()}
                            </div>
                        </div>

                        {/* Expense Card */}
                        <div className="bg-base-200/50 border border-base-300 p-4 sm:p-6 rounded-3xl space-y-2">
                            <div className="flex items-center gap-2 opacity-60">
                                <TrendingDown size={14} className="text-error" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Expense</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-black tracking-tighter text-error">
                                ৳{totalExpenses.toLocaleString()}
                            </div>
                        </div>

                        {/* Meals Card */}
                        <div className="bg-base-200/50 border border-base-300 p-4 sm:p-6 rounded-3xl space-y-2">
                            <div className="flex items-center gap-2 opacity-60">
                                <Utensils size={14} className="text-primary" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Meals</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-black tracking-tighter">
                                {finalizationData?.totalMealsServed || 0}
                            </div>
                        </div>

                        {/* Meal Rate Card */}
                        <div className="bg-primary/5 border border-primary/20 p-4 sm:p-6 rounded-3xl space-y-2">
                            <div className="flex items-center gap-2 opacity-60">
                                <Zap size={14} className="text-primary" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Meal Rate</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-black tracking-tighter text-primary">
                                ৳{finalizationData?.mealRate?.toFixed(0) || 0}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};