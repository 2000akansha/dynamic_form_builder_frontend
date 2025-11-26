

export const maskSensitiveFields = (dataArray, fieldsToMask = []) => {
    return dataArray.map((item) => {
        const maskedItem = { ...item._doc || item };
        fieldsToMask.forEach((field) => {
            if (maskedItem[field]) {
                maskedItem[field] = maskingFunction(maskedItem[field], field);
            }
        });
        return maskedItem;
    });
};
