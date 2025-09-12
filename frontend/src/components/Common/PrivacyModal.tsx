import React from "react";

const PrivacyModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative border-2 border-green-200 animate-fadeIn">
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-green-600 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-3xl font-extrabold mb-4 text-green-700 text-center tracking-tight drop-shadow">Privacy Policy</h2>
        <div className="max-h-[60vh] overflow-y-auto text-base text-gray-700 space-y-4 px-1">
          <p>
            <strong>Information We Collect:</strong> We collect your name, email, phone number, and travel details to provide and improve our public transport services.
          </p>
          <p>
            <strong>Location Data:</strong> With your permission, we use your device location to show nearby buses and stops. You can disable location access at any time.
          </p>
          <p>
            <strong>How We Use Data:</strong> Your data is used for account management, service improvement, analytics, and to send important notifications (like bus delays or ticket info).
          </p>
          <p>
            <strong>Data Sharing:</strong> We do not sell your personal data. We may share information with transport authorities or partners only as required to provide the service.
          </p>
          <p>
            <strong>Security:</strong> We use industry-standard security measures to protect your data. However, no method is 100% secure.
          </p>
          <p>
            <strong>Your Rights:</strong> You can request to view, update, or delete your personal data by contacting us at <a href="mailto:support@yatraone.com" className="text-green-600 underline">support@yatraone.com</a>.
          </p>
          <p>
            <strong>Policy Updates:</strong> We may update this policy. Continued use of YatraOne means you accept the revised policy.
          </p>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Last updated: July 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;