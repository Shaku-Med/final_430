import React from 'react'
import New from '../../new/Component/New';

interface Data {
    id: string;
    name: string;
    role: string;
    description: string;
    expertise: string[];
    information: string;
    user_id: string;
    attachments: any[];
    socialLinks: { platform: string; url: string }[];
    users: {
      firstname: string;
      lastname: string;
      profile: string;
    };
    created_at: string;
    updated_at: string;
    isAuth: boolean;
  }

const Teams = ({ data }: { data: Data }) => {
  return (
    <>
      <New id={`Your Team Id`} isEdit={true} editData={data}/>
    </>
  )
}

export default Teams
