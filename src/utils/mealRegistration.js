export const buildMealRegistrationPayload = (basePayload, comment) => {
    const trimmedComment = typeof comment === 'string' ? comment.trim() : '';

    if (!trimmedComment) {
        return basePayload;
    }

    return {
        ...basePayload,
        comment: trimmedComment,
    };
};
