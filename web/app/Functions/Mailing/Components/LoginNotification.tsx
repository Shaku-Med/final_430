import React from 'react';

interface LoginNotificationEmailProps {
  username?: string;
  loginTime: string;
  deviceInfo?: string;
  location?: string;
  companyName?: string;
  companyLogo?: string;
}

const LoginNotificationEmail: React.FC<LoginNotificationEmailProps> = ({
  username = 'User',
  loginTime,
  deviceInfo = 'Unknown device',
  location = 'Unknown location',
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
          <h2 className="text-xl font-semibold mb-4">New Login Detected</h2>
          <p className="mb-4">Hello {username},</p>
          <p className="mb-4">We noticed a new login to your account. Here are the details:</p>
          
          <div className="my-6 p-4 bg-gray-100 rounded-lg">
            <div className="space-y-2">
              <p><span className="font-medium">Time:</span> {loginTime}</p>
              <p><span className="font-medium">Device:</span> {deviceInfo}</p>
              <p><span className="font-medium">Location:</span> {location}</p>
            </div>
          </div>

          <p className="mb-4">If this was you, you can safely ignore this email.</p>
          <p className="mb-4">If you don't recognize this login, please secure your account immediately by:</p>
          
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Changing your password</li>
            <li>Reviewing your account activity</li>
            <li>Enabling two-factor authentication if not already enabled</li>
          </ul>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">If you believe someone else has accessed your account, please contact our support team immediately.</p>
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

export default LoginNotificationEmail; 