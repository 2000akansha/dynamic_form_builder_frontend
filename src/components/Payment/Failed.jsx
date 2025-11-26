import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// const Failed = () => {
//   const navigate = useNavigate();

//   const handleGoHome = () => {
//     navigate('/home/my-properties');
//   };

//   return (
//     <div className="h-screen flex flex-col bg-white relative">
//       <div className="h-30 w-full rounded-b-3xl overflow-hidden bg-gradient-to-b from-[#3B1C8C] to-[#5638b9] text-white flex justify-center pb-[44px]">
//         <div className="w-full text-white px-6 py-4 relative">
//           <div className="flex justify-between items-center">
//             <div></div>
//             <h1 className="text-xl font-semibold">Payment Status</h1>
//             <div className="relative"></div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-[#f5f2ff] px-1 py-1 rounded-t-3xl -mt-12"></div>

//       <div className="flex-1 overflow-y-auto bg-[#f5f2ff] px-6 pb-10">
//         <div className="flex flex-col items-center justify-center flex-grow mt-10">
//           {/* Checkmark Icon */}
//           <div className="mb-6">
//             <img
//               src="/failed.gif"
//               alt="Background"
//               className="w-full h-full object-cover object-center w-[139px]"
//             />
//           </div>

//           {/* Status Text */}
//           <h2 className="text-red-600 text-2xl font-bold mb-4">
//             Payment Failed
//           </h2>

//           {/* Description */}
//           <p className="text-center text-base text-black px-4">
//             We couldn’t process your payment <br /> at this moment. Please check
//             your <br />
//             payment details or try again using a <br /> different method.
//           </p>
//         </div>

//         {/* Button */}
//         <div className="w-full px-6 absolute left-0 right-0 bottom-4">
//           <button
//             className="w-full bg-indigo-800 text-white py-3 rounded-xl text-lg font-semibold"
//             onClick={handleGoHome}
//           >
//             Home
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };














const Failed = () => {
  const navigate = useNavigate();
  const [refreshCountdown, setRefreshCountdown] = useState(null);

  useEffect(() => {
    // Detect refresh using modern Navigation Timing API
    const navigationType = performance.getEntriesByType("navigation")[0]?.type;

    if (navigationType === "reload") {
      setRefreshCountdown(5);

      const interval = setInterval(() => {
        setRefreshCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            navigate("/home/my-properties", { replace: true });
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [navigate]);

  const handleGoHome = () => {
    navigate("/home/my-properties");
  };

  return (
    <div className="h-screen flex flex-col bg-white relative">
      <div className="h-30 w-full rounded-b-3xl overflow-hidden bg-gradient-to-b from-[#3B1C8C] to-[#5638b9] text-white flex justify-center pb-[44px]">
        <div className="w-full text-white px-6 py-4 relative">
          <div className="flex justify-between items-center">
            <div></div>
            <h1 className="text-xl font-semibold">Payment Status</h1>
            <div className="relative"></div>
          </div>
        </div>
      </div>

      <div className="bg-[#f5f2ff] px-1 py-1 rounded-t-3xl -mt-12"></div>

      <div className="flex-1 overflow-y-auto bg-[#f5f2ff] px-6 pb-10">
        <div className="flex flex-col items-center justify-center flex-grow mt-10">
          {/* Refresh Countdown Message */}
          {refreshCountdown !== null && (
            <p className="text-red-600 text-sm text-center mb-4 font-semibold">
              Oops 😅 You refreshed! Redirecting to properties listing in{" "}
              {refreshCountdown}...
            </p>
          )}

          {/* Show main failed content only if NOT refreshing */}
          {refreshCountdown === null && (
            <>
              {/* Checkmark Icon */}
              <div className="mb-6">
                <img
                  src="/failed.gif"
                  alt="Background"
              className="w-[250px] h-[250px] object-cover rounded-full shadow-lg"
                />
              </div>

              {/* Status Text */}
              <h2 className="text-red-600 text-2xl font-bold mb-4">
                Payment Failed
              </h2>

              {/* Description */}
              <p className="text-center text-base text-black px-4">
                We couldn’t process your payment <br /> at this moment. Please
                check your <br />
                payment details or try again using a <br /> different method.
              </p>
            </>
          )}
        </div>

        {/* Button - hide while refreshing */}
        {refreshCountdown === null && (
          <div className="w-full px-6 absolute left-0 right-0 bottom-4">
            <button
              className="w-full bg-indigo-800 text-white py-3 rounded-xl text-lg font-semibold"
              onClick={handleGoHome}
            >
              Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


export default Failed;