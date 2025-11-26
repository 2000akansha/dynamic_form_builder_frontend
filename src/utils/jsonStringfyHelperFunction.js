export function stringifyWithSortedKeys(obj) {
    if (Array.isArray(obj)) {
        return `[${obj.map(stringifyWithSortedKeys).join(",")}]`;
    } else if (obj !== null && typeof obj === "object") {
        const keys = Object.keys(obj).sort();
        return `{${keys.map(k => `"${k}":${stringifyWithSortedKeys(obj[k])}`).join(",")}}`;
    } else {
        return JSON.stringify(obj);
    }
}
