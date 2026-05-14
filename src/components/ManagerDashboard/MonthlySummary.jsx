import React from 'react';
import { FaCircleCheck } from "react-icons/fa6";
import { TrendingUp, TrendingDown, Wallet, CheckCircle2, BanknoteArrowUp, Info, Utensils } from "lucide-react";
import { getDiningLabel, isOfficeDining } from '../../utils/dining';

const SummaryCardSkeleton = () => (
    <div className="bg-base-200/50 border border-base-300 p-6 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
            <div className="skeleton h-4 w-4 rounded-full"></div>
            <div className="skeleton h-3 w-28"></div>
        </div>
        <div className="skeleton h-9 w-32"></div>
    </div>
);

const MonthlySummary = ({ mode = 'common', diningId, totalExpenses, depositsData, monthFinalized, finalizeMonth, totalFixedDeposit, mealRates = {}, finalizationData, isLoading, isRefreshing, mealRateLoading, mealRateRefreshing }) => {
    const totalDeposit = depositsData?.reduce((sum, d) => sum + d.amount, 0) || 0;
    const uniqueEmailCount = new Set(depositsData?.map(item => item.userEmail)).size;
    const isDiningSummary = mode === 'dining';
    const officeLane = isOfficeDining(diningId);
    const townshipLane = isDiningSummary && !officeLane;
    const diningBreakdown = finalizationData?.diningBreakdown?.find(item => item.diningId === diningId);
    const totalMealsServed = diningBreakdown?.totalMealsServed || 0;
    const diningRate = finalizationData?.isFinalized
        ? Number(diningBreakdown?.mealRate || 0).toFixed(2)
        : mealRates[diningId] || '0.00';

    return (
        <div className="w-full">
            <div className={`bg-base-100 border rounded-2xl overflow-hidden ${officeLane ? 'border-office-soft' : townshipLane ? 'border-primary/20' : 'border-base-300'}`}>
                <div className="p-6 md:p-6 space-y-6">

                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className={`text-2xl font-black tracking-tight uppercase italic ${officeLane ? 'text-office-content' : ''}`}>
                                {isDiningSummary ? `${getDiningLabel(diningId)} Summary` : 'Common Deposit'}
                            </h2>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
                                {isDiningSummary ? 'Dining Financial Overview' : 'Deposits And Balances'}
                            </p>
                        </div>

                        {!isDiningSummary && (
                            <button
                                onClick={finalizeMonth}
                                disabled={monthFinalized || isLoading}
                                className={`btn btn-md rounded-2xl gap-1 px-3 border-none transition-all active:scale-95
                                ${monthFinalized
                                        ? 'bg-base-200 text-base-content/30 cursor-not-allowed'
                                        : 'bg-info text-info-content hover:bg-info/90 shadow-none'
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
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className={`grid grid-cols-1 gap-4 ${isDiningSummary ? 'sm:grid-cols-2' : finalizationData?.isFinalized ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                        {isLoading ? (
                            <>
                                {Array.from({ length: isDiningSummary ? 3 : finalizationData?.isFinalized ? 4 : 3 }).map((_, index) => (
                                    <SummaryCardSkeleton key={index} />
                                ))}
                            </>
                        ) : (
                            <>

                        {isDiningSummary ? (
                            <>
                        <div className={`border p-6 rounded-xl space-y-3 ${officeLane ? 'bg-office-soft border-office-soft' : 'bg-primary/5 border-primary/20'}`}>
                            <div className="flex items-center gap-2 opacity-80">
                                <Info size={16} className={officeLane ? 'text-office' : 'text-primary'} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${officeLane ? 'text-office-content' : 'text-primary'}`}>Meal Rate</span>
                            </div>
                            {mealRateLoading && (
                                <div className="skeleton h-9 w-24"></div>
                            )}
                            <div className={`text-3xl font-black tracking-tighter ${officeLane ? 'text-office-content' : 'text-primary'} ${mealRateLoading ? 'hidden' : ''}`}>
                                ৳{diningRate}
                            </div>
                            {mealRateRefreshing && (
                                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-base-content/40">
                                    <span className="loading loading-spinner loading-xs text-primary"></span>
                                    Updating
                                </div>
                            )}
                        </div>

                        <div className="bg-base-200/50 border border-base-300 p-6 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 opacity-60">
                                <TrendingDown size={16} className="text-error" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Expenses</span>
                            </div>
                            <div className="text-3xl font-black tracking-tighter text-error">
                                ৳{totalExpenses.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-base-200/50 border border-base-300 p-6 rounded-xl space-y-3 sm:col-span-2">
                            <div className="flex items-center gap-2 opacity-60">
                                <Utensils size={16} className={officeLane ? 'text-office' : 'text-primary'} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Meals Served</span>
                            </div>
                            <div className={`text-3xl font-black tracking-tighter ${officeLane ? 'text-office-content' : 'text-primary'}`}>
                                {totalMealsServed}
                            </div>
                        </div>
                            </>
                        ) : (
                            <>
                        <div className="bg-base-200/50 border border-base-300 p-6 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 opacity-60">
                                <TrendingUp size={16} className="text-success" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Total Deposit</span>
                            </div>
                            <div className="text-3xl font-black tracking-tighter text-success">
                                ৳{totalDeposit.toLocaleString()}
                            </div>
                        </div>

                        {/* Fixed Deposit Card */}
                        <div className={`border p-6 rounded-xl space-y-3 transition-colors bg-info/5 border-info/20`}>
                            <div className="flex items-center gap-2 opacity-60">
                                <BanknoteArrowUp size={16} className='text-info' />
                                <span className="text-[10px] font-black uppercase tracking-widest text-info">Fixed Deposits</span>
                            </div>
                            <div className={`text-3xl font-black tracking-tighter text-info`}>
                                ৳{Number(totalFixedDeposit || 0).toLocaleString()}
                            </div>
                        </div>

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
                            </>
                        )}
                    </div>
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
