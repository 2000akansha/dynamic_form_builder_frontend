const getCurrentFinancialYear = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  return currentMonth >= 4
    ? `${currentYear}-${currentYear + 1}`
    : `${currentYear - 1}-${currentYear}`;
};

export default getCurrentFinancialYear;
