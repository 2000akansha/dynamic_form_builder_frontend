// utils/checkDuplicateUID.js

export const checkDuplicateUID = (rows, key = 'uniqueTransactionIdBeneficiary') => {
    const seen = new Map();
    let duplicateValue = null;
    const duplicateRows = [];

    rows.forEach((row, idx) => {
        const value = row[key]?.trim?.();
        if (value) {
            if (seen.has(value)) {
                duplicateValue = value;
                duplicateRows.push(idx + 1); // UI display row (1-based)
            } else {
                seen.set(value, idx);
            }
        }
    });

    if (duplicateValue) {
        return {
            value: duplicateValue,
            rows: [seen.get(duplicateValue) + 1, ...duplicateRows],
        };
    }

    return null;
};

// 🆕 Clean and readable toast message builder
export const getDuplicateToastMessage = (duplicateInfo) => {
    if (!duplicateInfo) return '';

    return [
        ` Duplicate UID found!`,
        ` UID: ${duplicateInfo.value}`,
        ` Appears in Rows: ${duplicateInfo.rows.join(', ')}`,
        ` Fix this before continuing.`,
    ].join('\n');
};
