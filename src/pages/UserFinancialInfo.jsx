import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { addMonths, format, subMonths } from 'date-fns';
import { BanknoteArrowUp, ChevronLeft, ChevronRight, HandCoins, TrendingDown, TrendingUp, Utensils, Wallet, Zap } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useAuth from '../hooks/useAuth';
import useAxiosSecure from '../hooks/useAxiosSecure';

const currency = (value) => `Tk ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: Number(value || 0) % 1 !== 0 ? 2 : 0
})}`;

const InfoListItem = ({ label, value, icon, status, isLoading }) => {
    return (
        <div className={`flex items-center justify-between gap-4 py-3 ${isLoading ? 'animate-pulse opacity-70' : ''}`}>
            <div className="flex items-center gap-3 min-w-0 text-base-content/60">
                {React.createElement(icon, { size: 18 })}
                <span className="text-sm font-medium truncate">
                    {label}
                </span>
            </div>
            {isLoading ? (
                <p className="skeleton skeleton-text text-sm font-semibold">
                    Loading
                </p>
            ) : (
                <p className={`text-sm font-semibold text-right ${status === 'negative' ? 'text-error' : status === 'positive' ? 'text-success' : 'text-base-content'}`}>
                    {value}
                </p>
            )}
        </div>
    );
};

const InfoListSection = ({ title, description, children }) => {
    return (
        <section className="rounded-lg border border-base-300 px-4 py-3">
            <div className="pb-2">
                <h2 className="text-sm font-bold tracking-tight">{title}</h2>
                {description && (
                    <p className="text-xs text-base-content/50 mt-0.5">{description}</p>
                )}
            </div>
            <div className="divide-y divide-base-300">
                {children}
            </div>
        </section>
    );
};

const BalanceSummary = ({ label, value, statusText, isNegative }) => {
    return (
        <section className="rounded-lg border border-base-300 px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-base-content/50 mb-2">
                        {label}
                    </p>
                    <p className={`text-3xl font-bold tracking-tight ${isNegative ? 'text-error' : 'text-success'}`}>{value}</p>
                </div>
                <p className="text-xs text-base-content/50">
                    {statusText}
                </p>
            </div>
        </section>
    );
};

const TrendBarShape = ({ x, y, width, height, payload }) => {
    const isPositive = Number(payload?.balance || 0) >= 0;
    const barY = height < 0 ? y + height : y;
    const barHeight = Math.abs(height);
    const fill = payload?.isCurrent
        ? 'var(--color-primary)'
        : isPositive
            ? 'var(--color-success)'
            : 'var(--color-error)';

    return (
        <rect
            x={x}
            y={barY}
            width={width}
            height={barHeight}
            rx={4}
            ry={4}
            fill={fill}
            fillOpacity={payload?.isCurrent ? 0.14 : 1}
            stroke={payload?.isCurrent ? 'var(--color-primary)' : 'none'}
            strokeWidth={payload?.isCurrent ? 2 : 0}
            strokeDasharray={payload?.isCurrent ? '4 3' : undefined}
        />
    );
};

const BalanceTrend = ({ points, isLoading }) => {
    if (isLoading) {
        return (
            <div className="rounded-lg border border-base-300 bg-base-100 p-4 animate-pulse">
                <div className="h-4 w-36 bg-base-300 rounded mb-4" />
                <div className="h-24 bg-base-200 rounded-lg" />
            </div>
        );
    }

    if (!points.length) {
        return (
            <div className="rounded-xl border border-base-300 bg-base-100 p-4">
                <p className="text-sm font-bold uppercase tracking-widest">Balance Trend</p>
                <p className="text-xs text-base-content/50 mt-1">No finalized balance history found yet.</p>
            </div>
        );
    }

    const chartData = points.map((point) => ({
        ...point,
        monthLabel: format(new Date(`${point.month}-01`), 'MMM'),
        balanceLabel: currency(point.balance),
    }));
    return (
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 flex flex-col gap-4">
            <div>
                <p className="text-sm font-bold uppercase tracking-widest">Balance Trend</p>
                <p className="text-xs text-base-content/50">Finalized balances with the current month shown as not finalized.</p>
            </div>

            <div className="h-56 w-full text-base-content/70">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 12, left: 4, bottom: 6 }}>
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
                            formatter={(value, _, item) => [
                                currency(value),
                                item?.payload?.isCurrent ? 'Current balance' : 'Finalized balance'
                            ]}
                            labelFormatter={(_, payload) => payload?.[0]?.payload?.month ? format(new Date(`${payload[0].payload.month}-01`), 'MMMM yyyy') : ''}
                        />
                        <Bar
                            dataKey="balance"
                            barSize={28}
                            minPointSize={6}
                            shape={<TrendBarShape />}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {points.slice(-4).map((point) => (
                    <div key={point.month} className={`rounded-md border p-3 ${point.isCurrent ? 'border-dashed border-base-content/30 bg-base-100' : 'border-base-300 bg-base-200/30'}`}>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                            {point.isCurrent ? 'Current' : format(new Date(`${point.month}-01`), 'MMM yyyy')}
                        </p>
                        <p className={`text-sm font-bold ${point.balance >= 0 ? 'text-success' : 'text-error'}`}>
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
    const previousBalance = Number(finalizationData?.previousBalance ?? 0);
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
    const trendPointsWithCurrent = isCurrentMonth && !finalizationData
        ? [
            ...trendPoints,
            {
                month: currentCalendarMonth,
                balance: Number(balance || 0),
                isCurrent: true,
            }
        ]
        : trendPoints;


    return (
        <div className="p-4 md:p-6">
            <div className="max-w-4xl mx-auto flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
                        <p className="text-sm text-base-content/50">Monthly deposits, meal costs, and balance history.</p>
                    </div>
                    <div className="flex items-center justify-between border border-base-300/70 p-2 rounded-lg max-w-md mx-auto w-full sm:w-72">
                        <button onClick={() => setCurrentMonth(prev => subMonths(prev, 1))} className="p-1.5 cursor-pointer hover:bg-base-200 rounded-full transition-all active:scale-95">
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="text-sm md:text-base font-bold uppercase px-6">{format(currentMonth, 'MMMM yyyy')}</h2>
                        <button onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} className="p-1.5 cursor-pointer hover:bg-base-200 rounded-full transition-all active:scale-95">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {finalizationData && (
                    <BalanceSummary
                        label="Previous Month Balance"
                        value={currency(previousBalance)}
                        statusText={`Carried from ${format(subMonths(currentMonth, 1), 'MMMM yyyy')}`}
                        isNegative={previousBalance < 0}
                    />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-5 lg:items-start">
                    <div className="flex flex-col gap-5">
                        <InfoListSection
                            title="Monthly Summary"
                            description="Basic charges and activity for the selected month."
                        >
                            <InfoListItem label="Fixed Deposit" value={currency(userData?.fixedDeposit)} icon={BanknoteArrowUp} isLoading={dataLoading} />
                            <InfoListItem label="Mosque Fee" value={currency(userData?.mosqueFee)} icon={HandCoins} status="negative" isLoading={dataLoading} />
                            <InfoListItem
                                label="Monthly Deposit"
                                value={currency(depositData?.deposit)}
                                icon={TrendingUp}
                                status={(depositData?.deposit || 0) <= 0 ? 'negative' : 'positive'}
                                isLoading={dataLoading}
                            />
                            <InfoListItem label="Total Meals" value={mealCountData?.totalMeals || 0} icon={Utensils} isLoading={dataLoading} />
                        </InfoListSection>

                        {!finalizationData && (
                            <BalanceSummary
                                label="Current Balance"
                                value={currency(balance)}
                                isNegative={balance < 0}
                            />
                        )}
                    </div>

                    {finalizationData && (
                        <InfoListSection
                            title="Finalized Information"
                            description="Calculated after the month is closed by management."
                        >
                            <InfoListItem label="Meal Rate" value={currency(finalizationData?.mealRate)} icon={Zap} isLoading={dataLoading} />
                            <InfoListItem label="Meal Cost" value={currency(finalizationData?.mealCost)} icon={TrendingDown} status="negative" isLoading={dataLoading} />
                            <InfoListItem
                                label="Closing Balance"
                                value={currency(balance)}
                                icon={Wallet}
                                status={balance < 0 ? 'negative' : 'positive'}
                                isLoading={dataLoading}
                            />
                        </InfoListSection>
                    )}

                    {!finalizationData && isCurrentMonth && (
                        <BalanceTrend points={trendPointsWithCurrent} isLoading={finalizationsLoading || userDataLoading || userBalanceLoading} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserFinancialInfo;
