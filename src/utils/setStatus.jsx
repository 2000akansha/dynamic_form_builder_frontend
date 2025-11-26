// Function to set userRole
export const setStatus = (status) => {
  if (status === '1') {
    return <div className="text-green-400">ACTIVE</div>;
  } else {
    return <div className="text-red-400">IN-ACTIVE</div>;
  }
};

// Function to set guarantee variety
export const setVariety = (variety) => {
  if (variety === '0') {
    return <div>Bank</div>;
  } else {
    return <div>Insurance</div>;
  }
};

// Function to set guarantee variety
export const setCategory = (variety) => {
  if (variety === '1') {
    return <div>Performance</div>;
  } else if (variety === '2') {
    return <div>Security</div>;
  } else if (variety === '3') {
    return <div>Mobility</div>;
  } else {
    return <div>Others</div>;
  }
};

export const setBGStatus = (status, fromBulk, editAfterBulk) => {
  if (status === '1') {
    return <div className="text-green-400">APPROVED</div>;
  } else if (status === '0') {
    return <div className="text-red-400">REJECTED</div>;
  } else if (status === '3') {
    return <div className="text-green-400">ENCASHED</div>;
  } else if (status === '4') {
    return <div className="text-green-400">RELEASED</div>;
  } else if (status === '5') {
    return <div className="text-blue-400">EXTENDED</div>;
  } else if (status === '6') {
    return <div className="text-blue-400">AMENDED</div>;
  } else if (status === '7') {
    return <div className="text-blue-400">PENDING MANAGER APPROVAL</div>;
  } else if (editAfterBulk === '0' && fromBulk === '1') {
    return <div className="text-red-400">BULK UPLOAD - DOCUMENTS PENDING</div>;
  } else {
    return <div className="text-blue-400">PENDING</div>;
  }
};
