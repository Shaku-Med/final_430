import React from 'react';

interface PasswordResetEmailProps {
  username?: string;
  resetLink: string;
  expiryMinutes?: number;
  companyName?: string;
  companyLogo?: string;
}

const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  username = 'User',
  resetLink,
  expiryMinutes = 30,
  companyName = 'CSI SPOTLIGHT',
  companyLogo = 'https://kpmedia.medzyamara.dev/icon-512.png',
}) => {
  return (
    <>
      <head>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      </head>
      
      <div className="flex flex-col items-center w-full max-w-xl mx-auto bg-gray-50 shadow-lg overflow-hidden font-sans rounded-lg">
        {/* Header with logo */}
        <div className="w-full bg-gray/50 border-b border-gray-200 py-6 px-8">
          <div className="flex justify-between items-center flex-col text-center">
            <div className="flex items-center flex-col space-x-2">
              <img src={companyLogo} alt={`${companyName} logo`} className="h-20 w-20 object-contain" /> <br />
              <div className="text-lg font-bold text-2xl">{companyName}</div>
            </div>
          </div>
        </div>

        {/* Email content */}
        <div className="w-full px-8 py-6">
          <h2 className="text-xl font-semibold mb-4">Password Reset Request</h2>
          <p className="mb-4">Hello {username},</p>
          <p className="mb-4">We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div className="my-6 text-center">
            <a 
              href={resetLink}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Reset Password
            </a>
          </div>

          <p className="mb-4">This link will expire in {expiryMinutes} minutes for security reasons.</p>
          <p className="mb-4">If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">For security reasons, this link will expire in {expiryMinutes} minutes.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full bg-gray-50 px-8 py-4 text-center border-t border-gray-200">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="#" className="text-xs text-blue-600 hover:underline">Privacy Policy</a>
            <a href="#" className="text-xs text-blue-600 hover:underline">Terms of Service</a>
            <a href="#" className="text-xs text-blue-600 hover:underline">Contact Support</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordResetEmail; 