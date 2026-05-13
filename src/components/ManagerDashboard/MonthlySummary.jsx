import React from 'react';
import { FaCircleCheck } from "react-icons/fa6";
import { TrendingUp, TrendingDown, Wallet, CheckCircle2, BanknoteArrowUp, Info } from "lucide-react";
import { DINING_IDS, getDiningIndicatorClass, getDiningLabel, isOfficeDining } from '../../utils/dining';

const SummaryCardSkeleton = () => (
    <div className="bg-base-200/50 border border-base-300 p-6 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
            <div className="skeleton h-4 w-4 rounded-full"></div>
            <div className="skeleton h-3 w-28"></div>
        </div>
        <div className="skeleton h-9 w-32"></div>
    </div>
);

const MonthlySummary = ({ totalExpenses, depositsData, monthFinalized, finalizeMonth, totalFixedDeposit, mealRates = {}, finalizationData, isLoading, isRefreshing, mealRateLoading, mealRateRefreshing }) => {
    const totalDeposit = depositsData?.reduce((sum, d) => sum + d.amount, 0) || 0;
    const balance = totalDeposit - totalExpenses;
    const isPositive = balance >= 0;
    const uniqueEmailCount = new Set(depositsData?.map(item => item.userEmail)).size;
    return (
        <div className="w-full">
            <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">
                <div className="p-6 md:p-6 space-y-6">

                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight uppercase italic">Monthly Summary</h2>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Financial Overview</p>
                        </div>

                        <button
                            onClick={finalizeMonth}
                            disabled={monthFinalized || isLoading}
                            className={`btn btn-md rounded-2xl gap-1 px-3 border-none transition-all active:scale-95
                                ${monthFinalized
                                    ? 'bg-base-200 text-base-content/30 cursor-not-allowed'
                                    : 'bg-primary text-primary-content hover:bg-primary/90 shadow-none'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm" />
                                    <span className="font-bold uppercase text-xs tracking-widest">Loading</span>
                                </>
                            ) : monthFinalized ? (
                                <>
                                    <CheckCircle2 size={18} />
                                    <span className="font-bold uppercase text-xs tracking-widest">Finalized</span>
                                </>
                            ) : (
                                <>
                                    <FaCircleCheck className="text-lg" />
                                    <span className="font-bold uppercase text-xs tracking-widest">Finalize</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {isLoading ? (
                            <>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <SummaryCardSkeleton key={index} />
                                ))}
                            </>
                        ) : (
                            <>

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
                        <div className={`border p-6 rounded-xl space-y-3 transition-colors ${isPositive
                                ? 'bg-success/5 border-success/20'
                                : 'bg-error/5 border-error/20'
                            }`}>
                            <div className="flex items-center gap-2 opacity-60">
                                <Wallet size={16} className={isPositive ? 'text-success' : 'text-error'} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-base-content">Net Balance</span>
                            </div>
                            <div className={`text-3xl font-black tracking-tighter ${isPositive ? 'text-success' : 'text-error'
                                }`}>
                                ৳{balance.toLocaleString()}
                            </div>
                        </div>

                        {/* Fixed Deposit Card */}
                        <div className={`border p-6 rounded-xl space-y-3 transition-colors bg-info/5 border-info/20`}>
                            <div className="flex items-center gap-2 opacity-60">
                                <BanknoteArrowUp size={16} className='text-info' />
                                <span className="text-[10px] font-black uppercase tracking-widest text-info">Fixed Deposits</span>
                            </div>
                            <div className={`text-3xl font-black tracking-tighter text-info`}>
                                ৳{totalFixedDeposit}
                            </div>
                        </div>

                        {Object.values(DINING_IDS).map(diningId => (
                            <div key={diningId} className={`border p-6 rounded-xl space-y-3 transition-colors flex-3 ${diningId === DINING_IDS.office ? 'bg-office-soft border-office-soft' : 'bg-primary/5 border-primary/20'}`}>
                                <div className="flex items-center gap-2 opacity-80">
                                    <Info size={16} className={diningId === DINING_IDS.office ? 'text-office' : 'text-primary'} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${diningId === DINING_IDS.office ? 'text-office-content' : 'text-primary'}`}>
                                        {getDiningLabel(diningId)} Meal Rate
                                    </span>
                                </div>
                                {mealRateLoading && (
                                    <div className="skeleton h-9 w-24"></div>
                                )}
                                <div className={`text-3xl font-black tracking-tighter ${diningId === DINING_IDS.office ? 'text-office-content' : 'text-primary'} ${mealRateLoading ? 'hidden' : ''}`}>
                                    ৳{mealRates[diningId] || '0.00'}
                                </div>
                                {mealRateRefreshing && (
                                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-base-content/40">
                                        <span className="loading loading-spinner loading-xs text-primary"></span>
                                        Updating
                                    </div>
                                )}
                            </div>
                        ))}
                        {finalizationData?.isFinalized && (
                            <div className={`border p-6 rounded-xl space-y-3 transition-colors flex-3 bg-success/5 border-success/20`}>
                                <div className="flex items-center gap-2 opacity-60">
                                    <Wallet size={16} className='text-success' />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-success">Cash At Hand</span>
                                </div>
                                <div className={`text-3xl font-black tracking-tighter text-success`}>
                                    ৳{Number(finalizationData?.cashAtHand || 0).toLocaleString()}
                                </div>
                            </div>
                        )}
                        {/* Deposit Count Card */}
                        <div className={`border p-6 rounded-xl space-y-3 transition-colors flex-3 bg-base-200 border-base-200/20`}>
                            <div className="flex items-center gap-2 opacity-60">
                                <Info size={16} className='text-base-content' />
                                <span className="text-[10px] font-black uppercase tracking-widest text-base-content">Deposit Received Count</span>
                            </div>
                            <div className={`text-3xl font-black tracking-tighter text-base-content`}>
                                {uniqueEmailCount} <span className='text-lg tracking-normal font-normal'>People</span>
                            </div>
                        </div>
                            </>
                        )}
                    </div>
                    {finalizationData?.diningBreakdown?.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {finalizationData.diningBreakdown.map(item => (
                                <div key={item.diningId} className={`border rounded-xl p-4 space-y-2 ${isOfficeDining(item.diningId) ? getDiningIndicatorClass(item.diningId) : 'bg-base-200 border-base-300 text-base-content'}`}>
                                    <div className="text-[10px] font-black uppercase tracking-widest">{getDiningLabel(item.diningId)}</div>
                                    <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                                        <span>Meals: {item.totalMealsServed || 0}</span>
                                        <span>Expense: ৳{Number(item.totalExpenses || 0).toLocaleString()}</span>
                                        <span>Rate: ৳{Number(item.mealRate || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {isRefreshing && !isLoading && (
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-base-content/40">
                            <span className="loading loading-spinner loading-xs text-primary"></span>
                            Refreshing summary
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MonthlySummary;
