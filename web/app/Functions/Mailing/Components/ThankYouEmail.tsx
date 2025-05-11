'use server'

import React from 'react'

const ThankYouEmail: React.FC = () => {
  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto bg-gray-50 shadow-lg overflow-hidden font-sans rounded-lg">
      {/* Header with logo */}
      <div className="w-full bg-gray/50 border-b border-gray-200 py-6 px-8">
        <div className="flex justify-between items-center flex-col text-center">
          <div className="flex items-center flex-col space-x-2">
            <img src="https://kpmedia.medzyamara.dev/icon-512.png" alt="CSI SPOTLIGHT logo" className="h-20 w-20 object-contain" /> <br />
            <div className="text-lg font-bold text-2xl">CSI SPOTLIGHT</div>
          </div>
        </div>
      </div>

      {/* Email content */}
      <div className="w-full px-8 py-6">
        <h2 className="text-xl font-semibold mb-4">Welcome to our newsletter!</h2>
        <p className="mb-4">Thank you for subscribing to our newsletter. We're excited to have you join our community!</p>
        <p className="mb-4">You'll be the first to know about our latest updates and news.</p>
        
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-gray-50 px-8 py-4 text-center border-t border-gray-200">
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} CSI SPOTLIGHT. All rights reserved.</p>
        <div className="mt-2 flex justify-center space-x-4">
          <a href="#" className="text-xs text-blue-600 hover:underline">Privacy Policy</a>
          <a href="#" className="text-xs text-blue-600 hover:underline">Terms of Service</a>
          <a href="#" className="text-xs text-blue-600 hover:underline">Contact Support</a>
        </div>
      </div>
    </div>
  )
}

export default ThankYouEmail 