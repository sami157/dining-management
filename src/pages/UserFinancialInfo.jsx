import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { addMonths, format, subMonths } from 'date-fns';
import { BanknoteArrowUp, ChevronLeft, ChevronRight, HandCoins, ReceiptText, Utensils, Wallet } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useAuth from '../hooks/useAuth';
import useAxiosSecure from '../hooks/useAxiosSecure';

const currency = (value) => `Tk ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: Number(value || 0) % 1 !== 0 ? 2 : 0
})}`;

const InfoCard = ({ label, value, icon, tone = 'base', isLoading }) => {
    const tones = {
        base: 'bg-base-200 text-base-content',
        primary: 'bg-primary/10 text-primary',
        success: 'bg-success/10 text-success',
        error: 'bg-error/10 text-error border border-error border-dashed',
        info: 'bg-info/10 text-info',
    };

    return (
        <div className={`rounded-xl p-4 ${tones[tone] || tones.base} ${isLoading ? 'animate-pulse opacity-70' : ''}`}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {React.createElement(icon, { size: 20 })}
                    <span className="text-[10px] uppercase tracking-widest font-black opacity-70 truncate">
                        {label}
                    </span>
                </div>
                {isLoading ? (
                    <div className="h-6 w-20 bg-current/20 rounded-md" />
                ) : (
                    <p className="text-lg font-black leading-none text-right">
                        {value}
                    </p>
                )}
            </div>
        </div>
    );
};

const BalanceTrend = ({ points, isLoading }) => {
    if (isLoading) {
        return (
            <div className="rounded-xl border border-base-300 p-4 animate-pulse">
                <div className="h-4 w-36 bg-base-300 rounded mb-4" />
                <div className="h-24 bg-base-200 rounded-lg" />
            </div>
        );
    }

    if (!points.length) {
        return (
            <div className="rounded-xl border border-base-300 p-4">
                <p className="text-sm font-black uppercase tracking-widest">Balance Trend</p>
                <p className="text-xs text-base-content/50 mt-1">No finalized balance history found yet.</p>
            </div>
        );
    }

    const chartData = points.map((point) => ({
        ...point,
        monthLabel: format(new Date(`${point.month}-01`), 'MMM'),
        balanceLabel: currency(point.balance),
    }));
    const latest = points[points.length - 1];
    const first = points[0];
    const delta = latest.balance - first.balance;

    return (
        <div className="rounded-xl border border-base-300 p-4 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-black uppercase tracking-widest">Balance Trend</p>
                    <p className="text-xs text-base-content/50">Finalized balances up to the previous month.</p>
                </div>
                <div className={`text-right font-black ${delta >= 0 ? 'text-success' : 'text-error'}`}>
                    <p className="text-xs uppercase tracking-widest opacity-70">Change</p>
                    <p>{currency(delta)}</p>
                </div>
            </div>

            <div className="h-56 w-full text-base-content/70">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 12, left: 4, bottom: 6 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-base-content/10" vertical={false} />
                        <XAxis
                            dataKey="monthLabel"
                            tickLine={false}
                            axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.55 }}
                        />
                        <YAxis
                            width={56}
                            tickLine={false}
                            axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.55 }}
                            tickFormatter={(value) => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{
                                borderRadius: '0.5rem',
                                border: '1px solid hsl(var(--bc) / 0.15)',
                                background: 'hsl(var(--b1))',
                                color: 'hsl(var(--bc))',
                            }}
                            formatter={(value) => [currency(value), 'Balance']}
                            labelFormatter={(_, payload) => payload?.[0]?.payload?.month ? format(new Date(`${payload[0].payload.month}-01`), 'MMMM yyyy') : ''}
                        />
                        <Line
                            type="monotone"
                            dataKey="balance"
                            stroke="currentColor"
                            strokeWidth={3}
                            connectNulls
                            dot={{ r: 4, fill: 'currentColor', strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {points.slice(-4).map((point) => (
                    <div key={point.month} className="rounded-lg bg-base-200/70 p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">
                            {format(new Date(`${point.month}-01`), 'MMM yyyy')}
                        </p>
                        <p className={`text-sm font-black ${point.balance >= 0 ? 'text-success' : 'text-error'}`}>
                            {currency(point.balance)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UserFinancialInfo = () => {
    const axiosSecure = useAxiosSecure();
    const { user, loading } = useAuth();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const monthString = format(currentMonth, 'yyyy-MM');
    const currentCalendarMonth = format(new Date(), 'yyyy-MM');
    const isCurrentMonth = monthString === currentCalendarMonth;

    const { data: finalizationData, isLoading: finalizationLoading } = useQuery({
        queryKey: ['myFinalizationData', monthString],
        enabled: !loading,
        retry: false,
        throwOnError: false,
        queryFn: async () => {
            const response = await axiosSecure.get(`/finance/user-finalization?month=${monthString}`);
            return response.data.finalization;
        }
    });

    const { data: depositData, isLoading: depositLoading } = useQuery({
        queryKey: ['userDeposit', monthString],
        enabled: !loading,
        retry: false,
        throwOnError: false,
        queryFn: async () => {
            const response = await axiosSecure.get(`/finance/user-deposit?month=${monthString}`);
            return response.data;
        }
    });

    const { data: userBalanceData, isLoading: userBalanceLoading } = useQuery({
        queryKey: ['userBalance'],
        enabled: !loading,
        retry: false,
        throwOnError: false,
        queryFn: async () => {
            const response = await axiosSecure.get('/finance/my-balance');
            return response.data;
        }
    });

    const { data: userData, isLoading: userDataLoading } = useQuery({
        queryKey: ['userData', user?.email],
        enabled: !loading && !!user?.email,
        queryFn: async () => {
            const response = await axiosSecure.get('/users/profile');
            return response.data.user;
        }
    });

    const { data: mealCountData, isLoading: countLoading } = useQuery({
        queryKey: ['userMealsData', user?.email, monthString],
        enabled: !loading && !!user?.email,
        queryFn: async () => {
            const response = await axiosSecure.get(`/users/meals/total/${user.email}?month=${monthString}`);
            return response.data;
        }
    });

    const { data: finalizationsData, isLoading: finalizationsLoading } = useQuery({
        queryKey: ['finalizations'],
        enabled: !loading && !!user?.email && isCurrentMonth,
        retry: false,
        throwOnError: false,
        queryFn: async () => {
            const response = await axiosSecure.get('/finance/finalizations');
            return response.data.finalizations;
        }
    });

    const dataLoading = finalizationLoading || depositLoading || userBalanceLoading || userDataLoading || countLoading;
    const balance = finalizationData?.newBalance ?? userBalanceData?.balance ?? 0;
    const userId = userData?._id?.toString?.() || userData?._id;
    const trendPoints = (finalizationsData || [])
        .filter((record) => record.month < currentCalendarMonth)
        .map((record) => {
            const member = record.memberDetails?.find((item) => {
                const memberUserId = item.userId?.toString?.() || item.userId;
                return memberUserId === userId;
            });

            if (!member) return null;

            return {
                month: record.month,
                balance: Number(member.newBalance || 0),
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.month.localeCompare(b.month));


    return (
        <div className="p-4 md:p-6">
            <div className="max-w-3xl mx-auto flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h1 className="text-2xl font-black uppercase tracking-tight">Financial Information</h1>
                    <div className="flex items-center justify-between border border-base-300/70 p-2 rounded-lg w-full sm:w-72">
                        <button onClick={() => setCurrentMonth(prev => subMonths(prev, 1))} className="p-1.5 cursor-pointer hover:bg-base-200 rounded-full transition-all active:scale-95">
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="text-sm md:text-base font-bold uppercase">{format(currentMonth, 'MMMM yyyy')}</h2>
                        <button onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} className="p-1.5 cursor-pointer hover:bg-base-200 rounded-full transition-all active:scale-95">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InfoCard label="Fixed Deposit" value={currency(userData?.fixedDeposit)} icon={BanknoteArrowUp} tone="info" isLoading={dataLoading} />
                    <InfoCard label="Mosque Fee" value={currency(userData?.mosqueFee)} icon={HandCoins} isLoading={dataLoading} />
                    <InfoCard
                        label="Monthly Deposit"
                        value={currency(depositData?.deposit)}
                        icon={Wallet}
                        tone={(depositData?.deposit || 0) <= 0 ? 'error' : 'success'}
                        isLoading={dataLoading}
                    />
                    <InfoCard label="Total Meals" value={mealCountData?.totalMeals || 0} icon={Utensils} tone="primary" isLoading={dataLoading} />
                </div>

                {finalizationData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-base-300">
                        <InfoCard label="Meal Rate" value={currency(finalizationData?.mealRate)} icon={ReceiptText} tone="primary" isLoading={dataLoading} />
                        <InfoCard label="Meal Cost" value={currency(finalizationData?.mealCost)} icon={ReceiptText} tone="error" isLoading={dataLoading} />
                    </div>
                )}

                <div className={`rounded-xl p-6 text-center ${balance < 0 ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">
                        {finalizationData ? 'Closing Balance' : 'Current Balance'}
                    </p>
                    <p className="text-4xl font-black tracking-tight">{currency(balance)}</p>
                </div>

                {isCurrentMonth && (
                    <BalanceTrend points={trendPoints} isLoading={finalizationsLoading || userDataLoading} />
                )}
            </div>
        </div>
    );
};

export default UserFinancialInfo;
