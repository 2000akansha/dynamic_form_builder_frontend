const fmt = new Intl.NumberFormat("en-IN");

const convertToINR = (amount) => {
  if (typeof amount !== "number" || isNaN(amount)) {
    const numberAmt = Number(amount);
    return "₹ " + fmt.format(numberAmt.toFixed(2));
    // return "₹ 0.00";
  }

  const [integerPart, decimalPart] = amount.toFixed(2).split(".");
  return "₹ " + fmt.format(Number(integerPart)) + "." + decimalPart;
};

export default convertToINR;
