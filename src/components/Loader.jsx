


// // components/Loader.jsx
// import { Triangle } from 'react-loader-spinner';

// const Loader = ({ message = "Processing... Please wait ⏳" }) => {
//   return (
//     <div className="fixed inset-0 z-[9999] bg-black bg-opacity-70 flex flex-col items-center justify-center">
//       <Triangle height={100} width={100} color="#ffffff" ariaLabel="loading" />
//       <p className="text-white text-lg mt-6">{message}</p>
//     </div>
//   );
// };

// export default Loader;





// components/Loader.jsx
import { CirclesWithBar } from 'react-loader-spinner';

const Loader = ({ message = "Processing... Please wait ⏳" }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] bg-opacity-90 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center animate-pulse">
        <CirclesWithBar
          height="100"
          width="100"
          color="#38bdf8"
          outerCircleColor="#94a3b8"
          innerCircleColor="#38bdf8"
          barColor="#facc15"
          ariaLabel="loader-animation"
        />
        <p className="text-slate-200 text-xl font-semibold mt-6 animate-pulse tracking-wide drop-shadow-md">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Loader;
