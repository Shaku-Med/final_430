import React from 'react';

interface OTPEmailProps {
  username?: string;
  otpCode?: string;
  expiryMinutes?: number;
  companyName?: string;
  companyLogo?: string;
}

const OTPVerificationEmail: React.FC<OTPEmailProps> = ({
  username = `User`,
  otpCode = "...",
  expiryMinutes = 30,
  companyName = `CSI SPOTLIGHT`,
  companyLogo = `http://localhost:3000/web/icon-192.png`,
}) => {
  return (
    <>
      {/* Include Tailwind CSS */}
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
        <div className="w-full px-8 py-8 text-gray-800 bg-white">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Verify Your Account</h1>
          
          <p className="mb-6">Hi {username},</p>
          
          <p className="mb-6">Thank you for using our service. To complete your verification, please use the following code:</p>
          
          {/* OTP Code display */}
          <div className="my-8 flex justify-center">
            <div className="bg-gray-100 rounded-lg py-4 px-6 flex justify-center shadow-md border border-gray-200">
              <div className="flex space-x-3">
                {otpCode.split('').map((digit, index) => (
                  <div key={index} className="w-10 h-12 flex items-center justify-center bg-white rounded-md border border-gray-300 text-xl font-bold shadow-sm">
                    {digit}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <p className="mb-2">This verification code will expire in <span className="font-semibold">{expiryMinutes} minutes</span>.</p>
          
          <p className="mb-6">If you didn't request this code, please ignore this email or contact our support team if you believe this is suspicious activity.</p>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <p className="text-sm text-gray-600">
              For security reasons, never share this code with anyone, including our support team. We will never ask for your verification code.
            </p>
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

export default OTPVerificationEmail;