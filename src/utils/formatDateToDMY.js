// Utility to convert YYYY-MM-DD to DD-MM-YYYY
const formatToDDMMYYYY = (isoDate) => {
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
};


export default formatToDDMMYYYY;