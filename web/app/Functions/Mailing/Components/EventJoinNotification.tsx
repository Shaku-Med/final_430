import React from 'react';

interface EventJoinNotificationEmailProps {
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  joinerName: string;
  joinerProfileLink: string;
  companyName?: string;
  companyLogo?: string;
}

const EventJoinNotificationEmail: React.FC<EventJoinNotificationEmailProps> = ({
  eventTitle,
  eventDate,
  eventLocation,
  joinerName,
  joinerProfileLink,
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
          <h2 className="text-xl font-semibold mb-4">New Event Participant!</h2>
          <p className="mb-4">Someone has joined your event:</p>
          
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-2">{eventTitle}</h3>
            <div className="space-y-2 text-gray-600">
              <p>Date: {new Date(eventDate).toLocaleDateString()}</p>
              <p>Location: {eventLocation}</p>
            </div>
          </div>

          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-2">Participant Details</h3>
            <p className="mb-2">Name: {joinerName}</p>
            <a 
              href={joinerProfileLink}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Profile
            </a>
          </div>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">This is an automated message. Please do not reply to this email.</p>
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

export default EventJoinNotificationEmail; 