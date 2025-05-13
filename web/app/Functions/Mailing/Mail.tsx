import nodemailer from 'nodemailer';
import React from 'react';

export let transport = nodemailer.createTransport({
  host: `${process.env.API_HOST}`,
  port: 587,
  secure: false,
  auth: {
    user: `${process.env.API_USER}`,
    pass: `${process.env.API_PASS}`,
  },
});

let from = `"CSI SPOTLIGHT" ${process.env.API_USER}`;

export const getData = async (component?: React.ReactElement) => {
  try {
    if (!component) return null;
    const ReactDOMServer = (await import('react-dom/server')).default;
    const staticMarkup = ReactDOMServer.renderToStaticMarkup(component);
    return staticMarkup;
  } catch (e) {
    console.error('Error rendering component to static markup:', e);
    return null;
  }
};

export interface EmailOptions {
  logoUrl?: string;
  category?: string;
}

export const SubmitMail = async (
  to: string,
  subject: string,
  text?: string,
  design?: React.ReactElement,
  options?: EmailOptions
) => {
  try {
    const htmlContent = await getData(design);
    
    if (!htmlContent) {
      return null;
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from,
      to,
      subject,
      text,
      html: htmlContent,
    };

    if (options) {
      if (!mailOptions.headers) {
        mailOptions.headers = {};
      }
      
      if (options.logoUrl) {
        mailOptions.headers = {
          ...mailOptions.headers,
          'X-Company-Logo': options.logoUrl
        };
      }

      if (options.category) {
        mailOptions.headers = {
          ...mailOptions.headers,
          'X-Category': options.category
        };
      }
    }

    const send = await transport.sendMail(mailOptions);
    return send;
  } catch (e) {
    console.error('Error sending email:', e);
    return null;
  }
};