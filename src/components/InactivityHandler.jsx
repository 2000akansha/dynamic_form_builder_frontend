import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userLogout } from "../redux/apis/auth";
import { removeUserDetails } from "../redux/slices/userDetailsSlice";

const InactivityHandler = ({ children }) => {
  const dispatch = useDispatch();
  const accessToken = useSelector(
    (state) => state.userDetailsSlice.details.accessToken
  );
  const [warning, setWarning] = useState(false);

  const timeoutId = useRef(null);
  const warningId = useRef(null);

  const resetTimer = () => {
    if (!accessToken) return; // ⛔ Do nothing if logged out

    if (timeoutId.current) clearTimeout(timeoutId.current);
    if (warningId.current) clearTimeout(warningId.current);

    setWarning(false);

    // Show warning after 9 minutes
    warningId.current = setTimeout(() => {
      setWarning(true);
    }, 9 * 60 * 1000);

    // Force logout after 10 minutes
    timeoutId.current = setTimeout(async () => {
      if (accessToken) {
        await dispatch(userLogout(accessToken));
      }
    }, 10 * 60 * 1000);
  };

  useEffect(() => {
    if (!accessToken) {
      // 🔑 If logged out, clear timers & hide warning
      clearTimeout(timeoutId.current);
      clearTimeout(warningId.current);
      setWarning(false);
      return;
    }

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // start when logged in

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timeoutId.current);
      clearTimeout(warningId.current);
    };
  }, [accessToken]);

  return (
    <>
      {accessToken && warning && ( // ✅ Only show if logged in
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-yellow-100 p-4 shadow-lg rounded-xl z-50">
          <p className="text-yellow-800 font-medium text-center">
            ⚠️ You will be logged out in 1 minute due to inactivity.
          </p>
        </div>
      )}
      {children}
    </>
  );
};

export default InactivityHandler;
