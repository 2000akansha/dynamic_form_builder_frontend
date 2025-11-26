import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { sendOtp, verifyOtp } from "../redux/apis/resendExcel";
import { useDispatch } from "react-redux";
import { Loader } from "lucide-react";

const OtpVerificationModal = ({
    onClose = () => {},
    onVerified = () => {},
    pushDate,
    fileNameToPush
}) => {
    const [step, setStep] = useState("enterNumber"); // new first step
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [postVerifyLoading, setPostVerifyLoading] = useState(false);
    const [sftpSendingLoader, setSftpSendingLoader] = useState(false);

    const dispatch = useDispatch();

    const handleGenerateOtp = async () => {
        if (!/^\d{10}$/.test(mobileNumber)) {
            toast.error("Please enter a valid 10-digit mobile number");
            return;
        }

        setLoading(true);
        try {
            const res = await dispatch(sendOtp(mobileNumber));

            if (res.success) {
                toast.success(`OTP sent to ${mobileNumber}`);
                setStep("verify");
            } else {
                toast.error(res.message || "Failed to send OTP");
            }
        } catch (err) {
            toast.error("Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            toast.error("Enter the OTP first");
            return;
        }

        setLoading(true);
        try {
            const res = await dispatch(verifyOtp({ mobileNumber, phoneOtp: otp.trim() }));

            if (res.success) {
                toast.success("OTP Verified Successfully");
                setPostVerifyLoading(true);

                setTimeout(async () => {
                    setPostVerifyLoading(false);

                    try {
                        setSftpSendingLoader(true);

                        const payload = {
                            pushDate,
                            filenames: [fileNameToPush],
                        };

                        const pushResponse = await dispatch(updatePushdate(payload));

                        if (pushResponse?.success) {
                            toast.success("Pushdate updated!");
                        } else {
                            toast.error(pushResponse?.message || "Failed to update push date");
                        }
                    } catch (err) {
                        toast.error("Failed to update push date");
                    }

                    setTimeout(() => {
                        setSftpSendingLoader(false);
                        toast.success("These records are sent to SFTP!");
                        onClose();
                        onVerified();
                    }, 5000);
                }, 2000);
            } else {
                toast.error(res.message || "Incorrect OTP");
            }
        } catch (err) {
            toast.error("OTP verification failed");
        } finally {
            setLoading(false);
        }
    };

    // Loader states
    if (postVerifyLoading) {
        return (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl text-center w-full max-w-sm">
                    <Loader className="animate-spin mx-auto mb-3 text-blue-600" size={32} />
                    <p className="text-gray-700 font-semibold">OTP Verified! Preparing SFTP Push...</p>
                </div>
            </div>
        );
    }

    if (sftpSendingLoader) {
        return (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl text-center w-full max-w-sm">
                    <Loader className="animate-spin mx-auto mb-3 text-green-600" size={32} />
                    <p className="text-gray-700 font-semibold">Sending records to SFTP...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl text-center">
                <h2 className="text-lg font-bold mb-4 text-gray-800">OTP Verification</h2>

                {step === "enterNumber" && (
                    <>
                        <input
                            type="text"
                            placeholder="Enter mobile number"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md mb-4"
                            maxLength={10}
                        />
                        <button
                            onClick={handleGenerateOtp}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Generate OTP"}
                        </button>
                    </>
                )}

                {step === "verify" && (
                    <>
                        <p className="text-sm text-gray-600 mb-2">
                            OTP sent to: <strong>{mobileNumber}</strong>
                        </p>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md mb-4"
                            maxLength={6}
                        />
                        <button
                            onClick={handleVerifyOtp}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </>
                )}

                <button
                    onClick={onClose}
                    className="mt-4 text-sm text-gray-500 hover:underline"
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default OtpVerificationModal;
