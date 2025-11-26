import { toWords } from "number-to-words";

const convertToINRWords = (num) => {
  if (isNaN(num)) return "Invalid number";

  const integerPart = Math.floor(num); // Extract integer part
  const decimalPart = Math.round((num - integerPart) * 100); // Extract paise (2 decimal places)

  const crore = Math.floor(integerPart / 10000000);
  const lakh = Math.floor((integerPart % 10000000) / 100000);
  const thousand = Math.floor((integerPart % 100000) / 1000);
  const hundred = Math.floor((integerPart % 1000) / 100);
  const remainder = integerPart % 100;

  let words = "";

  if (crore) words += toWords(crore) + " crore ";
  if (lakh) words += toWords(lakh) + " lakh ";
  if (thousand) words += toWords(thousand) + " thousand ";
  if (hundred) words += toWords(hundred) + " hundred ";
  if (remainder) words += toWords(remainder);

  words = words.trim();

  if (decimalPart > 0) {
    words += ` and ${toWords(decimalPart)} paise`;
  }

  return `Rupees ${words} only`;
};

export default convertToINRWords;
