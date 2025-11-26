import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_HMAC_SECRET_KEY;

const encryptData = (data) => {
  try {
    let stringData;

    if (data === null || data === undefined) {
      throw new Error("Cannot encrypt null or undefined data");
    }

    if (typeof data === "number") {
      if (isNaN(data) || !isFinite(data)) {
        throw new Error(`Invalid number for encryption: ${data}`);
      }
      stringData = data.toString();
    } else if (typeof data === "string") {
      stringData = data;
    } else {
      stringData = JSON.stringify(data);
    }

    if (!stringData || stringData.trim() === "") {
      throw new Error("Cannot encrypt empty data");
    }

    if (!SECRET_KEY) {
      throw new Error("SECRET_KEY is not defined. Check your .env file.");
    }

    const encrypted = CryptoJS.AES.encrypt(stringData, SECRET_KEY).toString();

    if (!encrypted) {
      throw new Error("Encryption resulted in empty string");
    }

    return encrypted;
  } catch (error) {
    throw error;
  }
};

export default encryptData;
