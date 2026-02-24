import React from 'react';
import Loading from '../Loading';
import { 
    TrendingUp, 
    Receipt, 
    Landmark, 
    History, 
    Wallet 
} from 'lucide-react';

export const UserMonthlyStats = ({ finalizationData, finalizationLoading }) => {
    // 1. Loading State
    if (finalizationLoading) return <Loading />;

    // 2. No Data State
    if (!finalizationData) {
        return (
            <div className="bg-base-200/50 rounded-xl p-10 border-2 border-dashed border-base-300 flex flex-col items-center justify-center text-center">
                <Receipt size={40} className="text-base-content/20 mb-3" />
                <p className='text-xs font-black uppercase tracking-[0.2em] text-base-content/40'>
                    No finalization record for this month
                </p>
            </div>
        );
    }

    // 3. Data Ready State
    const { mealRate, mealCost, mosqueFee, previousBalance, newBalance } = finalizationData;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 px-2">
                <TrendingUp size={20} className="text-primary" />
                <h2 className='text-xl font-black uppercase tracking-tighter italic'>Monthly Summary</h2>
            </div>

            <div className='bg-base-100 rounded-2xl p-4 sm:p-4 space-y-6'>
                {/* Stats Grid */}
                <div className='grid grid-cols-2 gap-4'>
                    <StatBox 
                        label="Meal Rate" 
                        value={mealRate} 
                        icon={<TrendingUp size={14}/>} 
                    />
                    <StatBox 
                        label="Meal Cost" 
                        value={mealCost} 
                        isNegative 
                        icon={<Receipt size={14}/>} 
                    />
                    <StatBox 
                        label="Mosque Fee" 
                        value={mosqueFee} 
                        isNegative 
                        icon={<Landmark size={14}/>} 
                    />
                    <StatBox 
                        label="Prev. Balance" 
                        value={previousBalance} 
                        isDynamic 
                        icon={<History size={14}/>} 
                    />
                </div>

                {/* Closing Balance Highlight */}
                <div className={`
                    relative overflow-hidden rounded-xl p-6 text-center transition-all duration-500
                    ${newBalance >= 0 
                        ? 'bg-success/5 text-success' 
                        : 'bg-error/5 text-error'}
                `}>
                    <div className='relative z-10'>
                        <div className='text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1'>
                            Closing Balance
                        </div>
                        <div className='text-4xl font-black tracking-tighter flex items-center justify-center gap-1'>
                            <span className="text-2xl font-medium">৳</span>
                            {newBalance?.toFixed(0)}
                        </div>
                    </div>
                    {/* Background Icon Decoration */}
                    <Wallet size={80} className="absolute -bottom-4 -right-4 opacity-5 rotate-12" />
                </div>
            </div>
        </div>
    );
};

// Reusable Stat Component for consistency
const StatBox = ({ label, value, isNegative, isDynamic, icon }) => {
    const val = value || 0;
    const isRed = isNegative || (isDynamic && val < 0);
    const isGreen = isDynamic && val >= 0;

    return (
        <div className='bg-base-200/90 rounded-xl p-4 flex flex-col gap-1 transition-hover hover:bg-base-200'>
            <div className='flex items-center gap-2 opacity-40 mb-1'>
                {icon}
                <span className='text-[9px] font-black uppercase tracking-widest leading-none'>{label}</span>
            </div>
            <div className={`text-lg font-black tracking-tighter ${isRed ? 'text-error' : isGreen ? 'text-success' : 'text-base-content'}`}>
                ৳{val.toFixed(0)}
            </div>
        </div>
    );
};