import React, { useEffect, useRef } from "react";

const ConfirmationDialog = ({
    show,
    onClose,
    onConfirm,
    title = "Confirmation",
    message = "Are you sure?",
    confirmText = "Yes",
    cancelText = "No",
}) => {
    const dialogRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (show) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
            <div
                ref={dialogRef}
                className="bg-white p-6 rounded-lg shadow-lg w-100 max-w-md"
            >
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <p className="mb-4">{message}</p>
                <div className="flex justify-end space-x-4">
                    {/* Cancel / No Button */}
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>

                    {/* Confirm / Upload Button (if confirmText is provided) */}
                    {confirmText && onConfirm && (
                        <button
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;
