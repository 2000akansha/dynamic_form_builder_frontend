import React from "react";
import { createRoot } from "react-dom/client";
import { store } from "../redux/store";
import { userLogout } from "../redux/apis/auth";

let root = null;
let modalContainer = null;

export const showSingleSessionModal = (message, onOkCallback) => {
  // Create container only once
  if (!modalContainer) {
    modalContainer = document.createElement("div");
    modalContainer.id = "single-session-modal";
    document.body.appendChild(modalContainer);
  }

  // Create root only once
  if (!root) {
    root = createRoot(modalContainer);
  }

  const Modal = () => {
    React.useEffect(() => {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }, []);

    const handleOk = async () => {
      try {
        if (onOkCallback) {
          await onOkCallback();
        } else {
          await store.dispatch(userLogout());
        }
      } catch (err) {
      } finally {
        root.unmount();
        modalContainer.remove();
        root = null;
        modalContainer = null;
      }
    };

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.9)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "2rem",
            borderRadius: "8px",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <p>{message}</p>
          <button
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={handleOk}
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  root.render(<Modal />);
};
