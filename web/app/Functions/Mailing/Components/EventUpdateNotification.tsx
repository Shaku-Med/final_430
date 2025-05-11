import React from 'react';

interface EventUpdateNotificationEmailProps {
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  userName: string;
  updateType: 'event_update' | 'new_comment';
  updateDetails: {
    title?: string;
    date?: string;
    location?: string;
    description?: string;
    commentAuthor?: string;
    commentContent?: string;
  };
  companyName?: string;
  companyLogo?: string;
}

const EventUpdateNotificationEmail: React.FC<EventUpdateNotificationEmailProps> = ({
  eventTitle,
  eventDate,
  eventLocation,
  userName,
  updateType,
  updateDetails,
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
          <h2 className="text-xl font-semibold mb-4">
            {updateType === 'event_update' ? 'Event Update' : 'New Comment'}
          </h2>
          <p className="mb-4">Dear {userName},</p>
          
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-2">Event Details</h3>
            <div className="space-y-2 text-gray-600">
              <p><strong>Event:</strong> {eventTitle}</p>
              <p><strong>Date:</strong> {new Date(eventDate).toLocaleDateString()}</p>
              <p><strong>Location:</strong> {eventLocation}</p>
            </div>
          </div>

          {updateType === 'event_update' ? (
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-2">Event Updates</h3>
              <div className="space-y-2 text-gray-600">
                {updateDetails.title && <p><strong>New Title:</strong> {updateDetails.title}</p>}
                {updateDetails.date && <p><strong>New Date:</strong> {new Date(updateDetails.date).toLocaleDateString()}</p>}
                {updateDetails.location && <p><strong>New Location:</strong> {updateDetails.location}</p>}
                {updateDetails.description && <p><strong>Description Update:</strong> {updateDetails.description}</p>}
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-2">New Comment</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>From:</strong> {updateDetails.commentAuthor}</p>
                <p><strong>Comment:</strong> {updateDetails.commentContent}</p>
              </div>
            </div>
          )}
          
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

export default EventUpdateNotificationEmail; 