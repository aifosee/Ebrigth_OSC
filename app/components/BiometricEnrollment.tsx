"use client";

import { useState } from "react";
import { generateBiometricTemplate } from "@/lib/biometric";

interface BiometricEnrollmentProps {
  employeeId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function BiometricEnrollment({
  employeeId,
  onComplete,
  onCancel,
}: BiometricEnrollmentProps) {
  const [enrolling, setEnrolling] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "ready" | "scanning" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleStartBiometricEnrollment = async () => {
    setEnrolling(true);
    setStatus("ready");
    setMessage("Place your finger on the biometric scanner...");

    try {
      // Simulate scanning delay (in real implementation, this would connect to actual biometric scanner)
      setStatus("scanning");
      setMessage("Scanning fingerprint...");

      // Simulate scanning time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate biometric template (in real system, comes from scanner device)
      const biometricTemplate = generateBiometricTemplate();

      // Enroll the biometric
      const response = await fetch(`/api/employees/${employeeId}/biometric`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ biometricTemplate }),
      });

      if (!response.ok) {
        throw new Error("Failed to enroll biometric");
      }

      setStatus("success");
      setMessage("Biometric enrolled successfully!");

      // Notify parent component
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    } catch (error) {
      setStatus("error");
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Failed to enroll biometric"}`
      );
      setEnrolling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Biometric Enrollment
        </h2>

        {/* Status Indicator */}
        <div className="mb-8 p-6 rounded-lg border-2 border-gray-300 text-center bg-gray-50">
          {status === "idle" && (
            <div>
              <div className="text-4xl mb-4">👆</div>
              <p className="text-gray-700 font-medium">Ready to enroll fingerprint</p>
            </div>
          )}

          {status === "ready" && (
            <div>
              <div className="text-4xl mb-4 animate-pulse">🔍</div>
              <p className="text-blue-600 font-medium">{message}</p>
            </div>
          )}

          {status === "scanning" && (
            <div>
              <div className="text-4xl mb-4">🔐</div>
              <p className="text-purple-600 font-medium">{message}</p>
              <div className="flex justify-center mt-4">
                <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
              </div>
            </div>
          )}

          {status === "success" && (
            <div>
              <div className="text-4xl mb-4">✓</div>
              <p className="text-green-600 font-medium">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div>
              <div className="text-4xl mb-4">✗</div>
              <p className="text-red-600 font-medium">{message}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {status === "idle" && (
            <>
              <button
                onClick={handleStartBiometricEnrollment}
                disabled={enrolling}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                Start Enrollment
              </button>
              <button
                onClick={onCancel}
                disabled={enrolling}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
            </>
          )}

          {(status === "ready" || status === "scanning") && (
            <div className="w-full text-center py-2 text-gray-600">
              Processing... Please wait
            </div>
          )}

          {status === "success" && (
            <button
              onClick={onComplete}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Done
            </button>
          )}

          {status === "error" && (
            <>
              <button
                onClick={() => {
                  setStatus("idle");
                  setMessage("");
                  setEnrolling(false);
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Retry
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
