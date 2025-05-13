import React from 'react'

interface ProjectJoinNotificationProps {
  projectTitle: string
  projectDescription: string
  joinerName: string
  joinerProfileLink: string
  companyName: string
  companyLogo: string
}

const ProjectJoinNotification: React.FC<ProjectJoinNotificationProps> = ({
  projectTitle,
  projectDescription,
  joinerName,
  joinerProfileLink,
  companyName,
  companyLogo
}) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img src={companyLogo} alt={companyName} style={{ width: '100px', height: 'auto' }} />
      </div>
      <h1 style={{ color: '#333', textAlign: 'center' }}>New Project Participant</h1>
      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#666' }}>
        Hello,
      </p>
      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#666' }}>
        {joinerName} has joined your project "{projectTitle}".
      </p>
      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
        <h2 style={{ color: '#333', marginTop: 0 }}>Project Details:</h2>
        <p style={{ margin: '5px 0' }}><strong>Title:</strong> {projectTitle}</p>
        <p style={{ margin: '5px 0' }}><strong>Description:</strong> {projectDescription}</p>
      </div>
      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#666' }}>
        You can view {joinerName}'s profile by clicking the link below:
      </p>
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a
          href={joinerProfileLink}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '5px',
            display: 'inline-block'
          }}
        >
          View Profile
        </a>
      </div>
      <p style={{ fontSize: '14px', color: '#999', textAlign: 'center', marginTop: '30px' }}>
        This is an automated message from {companyName}. Please do not reply to this email.
      </p>
    </div>
  )
}

export default ProjectJoinNotification 