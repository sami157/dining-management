export const DINING_IDS = {
    township: 'township',
    office: 'office',
};

export const diningLabels = {
    [DINING_IDS.township]: 'Township',
    [DINING_IDS.office]: 'Office',
};

export const normalizeDiningId = (diningId) => (
    diningId === DINING_IDS.office ? DINING_IDS.office : DINING_IDS.township
);

export const isOfficeDining = (diningId) => normalizeDiningId(diningId) === DINING_IDS.office;

export const getDiningLabel = (diningId) => diningLabels[normalizeDiningId(diningId)];

export const getDiningIndicatorClass = (diningId) => {
    const normalizedDiningId = normalizeDiningId(diningId);

    if (normalizedDiningId === DINING_IDS.office) {
        return 'bg-office-soft text-office-content border-office-soft';
    }

    return 'bg-primary/10 text-primary border-primary/30';
};
