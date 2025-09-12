import React from "react";

const TermsModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative border-2 border-blue-200 animate-fadeIn">
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-blue-600 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-3xl font-extrabold mb-4 text-blue-700 text-center tracking-tight drop-shadow">Terms &amp; Conditions</h2>
        <div className="max-h-[60vh] overflow-y-auto text-base text-gray-700 space-y-4 px-1">
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Service Usage:</strong> YatraOne provides real-time bus tracking, ticketing, and information services for public transport users. Use of our platform is subject to these terms.
            </li>
            <li>
              <strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account and OTPs. Do not share your credentials with others.
            </li>
            <li>
              <strong>Accurate Information:</strong> You agree to provide accurate and up-to-date information during registration and while using the service.
            </li>
            <li>
              <strong>Acceptable Use:</strong> Do not misuse the platform for unlawful activities, spamming, or disrupting bus operations. Respect fellow passengers and transport staff.
            </li>
            <li>
              <strong>Ticketing & Payments:</strong> All ticket purchases are subject to availability and the rules of the respective transport authority. Refunds and cancellations are governed by local transport policies.
            </li>
            <li>
              <strong>Travel Conduct:</strong> Please follow all safety instructions, maintain cleanliness, and behave respectfully while using public transport.
            </li>
            <li>
              <strong>Data Usage:</strong> Your location and travel data may be used to improve service quality and for analytics, as described in our Privacy Policy.
            </li>
            <li>
              <strong>Liability:</strong> YatraOne is not liable for delays, cancellations, or inaccuracies in bus schedules, as these are managed by the transport authority.
            </li>
            <li>
              <strong>Changes to Terms:</strong> We may update these terms from time to time. Continued use of the service means you accept the revised terms.
            </li>
            <li>
              <strong>Contact:</strong> For any queries, contact us at <a href="mailto:support@yatraone.com" className="text-blue-600 underline">support@yatraone.com</a>.
            </li>
          </ol>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Last updated: July 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;