import React from 'react';
import { BanknoteArrowUp, CalendarCheck, CheckCircle2, Landmark, LockKeyhole, TrendingDown, TrendingUp, UserCheck, UsersRound, Wallet, Zap } from 'lucide-react';

const currency = (value) => `Tk ${Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2
})}`;

const SummaryRowSkeleton = () => (
    <div className="flex items-center justify-between gap-4 py-3 animate-pulse">
        <div className="flex items-center gap-3">
            <div className="skeleton h-5 w-5 rounded-full" />
            <div className="skeleton h-4 w-32" />
        </div>
        <p className="skeleton skeleton-text text-sm font-semibold">Loading</p>
    </div>
);

const SummaryRow = ({ label, value, icon, status, isLoading, helper }) => (
    <div className="flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3 min-w-0 text-base-content/60">
            {React.createElement(icon, { size: 18 })}
            <div className="min-w-0">
                <p className="text-sm font-medium truncate">{label}</p>
                {helper && <p className="text-xs text-base-content/40">{helper}</p>}
            </div>
        </div>
        {isLoading ? (
            <p className="skeleton skeleton-text text-sm font-semibold">Loading</p>
        ) : (
            <p className={`text-sm font-semibold text-right ${status === 'positive' ? 'text-success' : status === 'negative' ? 'text-error' : 'text-base-content'}`}>
                {value}
            </p>
        )}
    </div>
);

const pickFirstValue = (source, keys) => {
    for (const key of keys) {
        if (source?.[key] !== undefined && source?.[key] !== null && source?.[key] !== '') {
            return source[key];
        }
    }
    return null;
};

const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const MonthlySummary = ({ totalExpenses, depositsData, monthFinalized, finalizeMonth, totalFixedDeposit, mealRate, isLoading, isRefreshing, mealRateLoading, mealRateRefreshing, finalizationData, finalizedByName }) => {
    const totalDeposit = depositsData?.reduce((sum, d) => sum + d.amount, 0) || 0;
    const balance = totalDeposit - totalExpenses;
    const uniqueEmailCount = new Set(depositsData?.map(item => item.userEmail)).size;
    const memberDetails = finalizationData?.memberDetails || [];
    const totalMembers = pickFirstValue(finalizationData, ['totalMembers', 'memberCount', 'totalMemberCount']) ?? memberDetails.length;
    const finalizedTotalFixedDeposit = pickFirstValue(finalizationData, ['totalFixedDeposit', 'totalFixedDeposits', 'fixedDepositTotal'])
        ?? memberDetails.reduce((sum, member) => sum + (Number(member.fixedDeposit) || 0), 0);
    const totalMosqueFee = pickFirstValue(finalizationData, ['totalMosqueFee', 'totalMosqueFees', 'mosqueFeeTotal'])
        ?? memberDetails.reduce((sum, member) => sum + (Number(member.mosqueFee) || 0), 0);
    const totalMemberBalances = pickFirstValue(finalizationData, ['totalMemberBalances', 'totalMemberBalance', 'totalBalancesAfterFinalization', 'totalMemberBalancesAfterFinalization'])
        ?? memberDetails.reduce((sum, member) => sum + (Number(member.newBalance) || 0), 0);
    const finalizedAt = pickFirstValue(finalizationData, ['finalizedAt', 'finalizedDate', 'createdAt']);

    return (
        <section className="rounded-lg border border-base-300 px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-2">
                <div>
                    <h2 className="text-sm font-bold tracking-tight">Monthly Summary</h2>
                    <p className="text-xs text-base-content/50 mt-0.5">Live finance overview for the selected month.</p>
                </div>
                <button
                    onClick={finalizeMonth}
                    disabled={monthFinalized || isLoading}
                    className="btn btn-sm btn-primary disabled:btn-ghost disabled:text-base-content/40"
                >
                    {isLoading ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : monthFinalized ? (
                        <LockKeyhole size={16} />
                    ) : (
                        <CheckCircle2 size={16} />
                    )}
                    {monthFinalized ? 'Finalized' : 'Finalize'}
                </button>
            </div>

            <div className="divide-y divide-base-300">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, index) => <SummaryRowSkeleton key={index} />)
                ) : (
                    <>
                        <SummaryRow label="Total Deposit" value={currency(totalDeposit)} icon={TrendingUp} status="positive" />
                        <SummaryRow label="Total Expense" value={currency(totalExpenses)} icon={TrendingDown} status="negative" />
                        <SummaryRow label="Net Balance" value={currency(balance)} icon={Wallet} status={balance >= 0 ? 'positive' : 'negative'} />
                        <SummaryRow label="Fixed Deposits" value={currency(totalFixedDeposit)} icon={BanknoteArrowUp} />
                        <SummaryRow
                            label={monthFinalized ? 'Finalized Meal Rate' : 'Running Meal Rate'}
                            value={currency(monthFinalized ? finalizationData?.mealRate : mealRate)}
                            icon={Zap}
                            isLoading={mealRateLoading}
                            helper={mealRateRefreshing ? 'Updating' : null}
                        />
                        <SummaryRow label="Deposit Received Count" value={`${uniqueEmailCount} People`} icon={UsersRound} />
                        {monthFinalized && (
                            <>
                                <SummaryRow label="Finalized At" value={formatDateTime(finalizedAt)} icon={CalendarCheck} />
                                <SummaryRow label="Finalized By" value={finalizedByName || '-'} icon={UserCheck} />
                                <SummaryRow label="Total Members" value={totalMembers || 0} icon={UsersRound} />
                                <SummaryRow label="Total Fixed Deposit" value={currency(finalizedTotalFixedDeposit)} icon={BanknoteArrowUp} />
                                <SummaryRow label="Total Mosque Fee" value={currency(totalMosqueFee)} icon={Landmark} status="negative" />
                                <SummaryRow label="Total Member Balances" value={currency(totalMemberBalances)} icon={Wallet} status={Number(totalMemberBalances) >= 0 ? 'positive' : 'negative'} />
                            </>
                        )}
                    </>
                )}
            </div>

            {isRefreshing && !isLoading && (
                <div className="flex items-center gap-2 pt-3 text-xs font-semibold uppercase tracking-widest text-base-content/40">
                    <span className="loading loading-spinner loading-xs text-primary"></span>
                    Refreshing summary
                </div>
            )}
        </section>
    );
};

export default MonthlySummary;
