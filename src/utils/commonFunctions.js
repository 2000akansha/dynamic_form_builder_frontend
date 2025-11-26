const sanitizeExcelValue = (value, fieldType = null) => {
    if (value === null || value === undefined) return "value is empty";

    let cleanedValue = "";

    if (typeof value === "object") {
        if (value.hasOwnProperty("richText")) {
            const parts = value.richText;
            if (!Array.isArray(parts)) {
                throw new Error("Invalid richText format");
            }

            for (const part of parts) {
                const { text, font } = part;
                if (!text) {
                    throw new Error("richText part missing text content");
                }

                if (
                    font?.bold ||
                    font?.italic ||
                    font?.underline ||
                    font?.strike ||
                    font?.color ||
                    font?.size ||
                    font?.name ||
                    font?.family ||
                    font?.scheme
                ) {
                    throw new Error(
                        "Cell contains styled text (bold, italic, underline, color, size, etc.)"
                    );
                }
            }

            cleanedValue = parts.map((p) => p.text).join("");
        } else if (value.hasOwnProperty("text")) {
            cleanedValue = value.text;
        } else if (value.hasOwnProperty("formula")) {
            throw new Error("Cell contains a formula — not allowed");
        } else {
            throw new Error("Unsupported Excel cell structure");
        }
    } else {
        cleanedValue = String(value);
    }

    // 🧼 Clean the value
    cleanedValue = cleanedValue.replace(/[\n\r]+/g, "").trim();

    // ✅ Field-specific validations
    switch (fieldType) {
        case "aadhaar":
            const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
            if (!aadhaarRegex.test(cleanedValue)) {
                throw new Error(
                    "Invalid Aadhaar number — must be 12 digits and not start with 0 or 1"
                );
            }
            break;


        case "name":
            const nameRegex = /^[A-Za-z\s'-]+$/;
            if (!nameRegex.test(cleanedValue)) {
                throw new Error(
                    "Invalid name — only alphabets, spaces, hyphens and apostrophes allowed"
                );
            }
            break;

        case "mobile":
            const mobileRegex = /^[6-9][0-9]{9}$/;
            if (!mobileRegex.test(cleanedValue)) {
                throw new Error("Invalid mobile number — must be 10 digits starting with 6–9");
            }
            break;

        case "email":
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanedValue)) {
                throw new Error("Invalid email address");
            }
            break;

        case "ifsc":
            const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
            if (!ifscRegex.test(cleanedValue)) {
                throw new Error("Invalid IFSC code — format: 4 letters, 0, 6 alphanumeric");
            }
            break;

        case "pan":
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(cleanedValue)) {
                throw new Error("Invalid PAN — format: 5 letters, 4 digits, 1 letter");
            }
            break;

        default:
            // no extra validation
            break;
    }

    return cleanedValue;
};

export { sanitizeExcelValue };
