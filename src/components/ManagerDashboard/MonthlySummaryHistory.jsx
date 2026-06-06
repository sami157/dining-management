import React from 'react';
import { BanknoteArrowUp, CalendarCheck, Landmark, TrendingUp, TrendingDown, UserCheck, UsersRound, Utensils, Wallet, Zap } from 'lucide-react';

const currency = (value) => `Tk ${Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0
})}`;

const SummaryRow = ({ label, value, icon, status }) => {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3 min-w-0 text-base-content/60">
                {React.createElement(icon, { size: 18 })}
                <span className="text-sm font-medium truncate">{label}</span>
            </div>
            <p className={`text-sm font-semibold text-right ${status === 'positive' ? 'text-success' : status === 'negative' ? 'text-error' : 'text-base-content'}`}>
                {value}
            </p>
        </div>
    );
};

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

export const MonthlySummaryHistory = ({ totalExpenses, depositsData, finalizationData, finalizedByName }) => {
    const totalDeposit = depositsData?.reduce((sum, d) => sum + d.amount, 0) || 0;
    const memberDetails = finalizationData?.memberDetails || [];
    const totalMembers = pickFirstValue(finalizationData, ['totalMembers', 'memberCount', 'totalMemberCount']) ?? memberDetails.length;
    const totalFixedDeposit = pickFirstValue(finalizationData, ['totalFixedDeposit', 'totalFixedDeposits', 'fixedDepositTotal'])
        ?? memberDetails.reduce((sum, member) => sum + (Number(member.fixedDeposit) || 0), 0);
    const totalMosqueFee = pickFirstValue(finalizationData, ['totalMosqueFee', 'totalMosqueFees', 'mosqueFeeTotal'])
        ?? memberDetails.reduce((sum, member) => sum + (Number(member.mosqueFee) || 0), 0);
    const totalMemberBalances = pickFirstValue(finalizationData, ['totalMemberBalances', 'totalMemberBalance', 'totalBalancesAfterFinalization', 'totalMemberBalancesAfterFinalization'])
        ?? memberDetails.reduce((sum, member) => sum + (Number(member.newBalance) || 0), 0);
    const finalizedAt = pickFirstValue(finalizationData, ['finalizedAt', 'finalizedDate', 'createdAt']);

    return (
        <section className="rounded-lg border border-base-300 px-4 py-3">
            <div className="pb-2">
                <h2 className="text-sm font-bold tracking-tight">Monthly Summary</h2>
                <p className="text-xs text-base-content/50 mt-0.5">Finalized report totals for the selected month.</p>
            </div>
            <div className="divide-y divide-base-300">
                <SummaryRow label="Total Deposit" value={currency(totalDeposit)} icon={TrendingUp} status="positive" />
                <SummaryRow label="Total Expense" value={currency(totalExpenses)} icon={TrendingDown} status="negative" />
                <SummaryRow label="Total Meals" value={finalizationData?.totalMealsServed || 0} icon={Utensils} />
                <SummaryRow label="Meal Rate" value={currency(finalizationData?.mealRate)} icon={Zap} />
                <SummaryRow label="Finalized At" value={formatDateTime(finalizedAt)} icon={CalendarCheck} />
                <SummaryRow label="Finalized By" value={finalizedByName || '-'} icon={UserCheck} />
                <SummaryRow label="Total Members" value={totalMembers || 0} icon={UsersRound} />
                <SummaryRow label="Total Fixed Deposit" value={currency(totalFixedDeposit)} icon={BanknoteArrowUp} />
                <SummaryRow label="Total Mosque Fee" value={currency(totalMosqueFee)} icon={Landmark} status="negative" />
                <SummaryRow label="Total Member Balances" value={currency(totalMemberBalances)} icon={Wallet} status={Number(totalMemberBalances) >= 0 ? 'positive' : 'negative'} />
            </div>
        </section>
    );
};
