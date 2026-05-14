export const DELIVERY_LOCATIONS = {
    township: 'township',
    old_admin: 'old_admin',
};

export const deliveryLocationLabels = {
    [DELIVERY_LOCATIONS.township]: 'Township',
    [DELIVERY_LOCATIONS.old_admin]: 'Old Admin',
};

export const normalizeDeliveryLocation = (deliveryLocation) => (
    deliveryLocation === DELIVERY_LOCATIONS.old_admin
        ? DELIVERY_LOCATIONS.old_admin
        : DELIVERY_LOCATIONS.township
);

export const isDeliveryLocation = (deliveryLocation) => (
    deliveryLocation === DELIVERY_LOCATIONS.township || deliveryLocation === DELIVERY_LOCATIONS.old_admin
);

