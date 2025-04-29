import React from 'react';
import Nav from '../Home/Nav/Nav';
import Footer from '../Home/Footer/Footer';
import Logo from '../Home/Icons/Logo';

const PrivacyPolicy = () => {
  return (
    <>
        <Nav/>
        <div className="max-w-4xl mt-10 mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className={`text-center flex flex-col items-center`}>
                <Logo svgClassName="w-[200px] h-[200px]" pathClassName="fill-foreground"/>
            </div>
        <h1 className="text-3xl font-bold text-center mb-8">Privacy Policy</h1>
        
        <div className="space-y-6">
            <section>
            <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
            <p className="mb-4">
                Welcome to CSI Spotlight. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our platform.
            </p>
            <p>
                CSI Spotlight is a platform designed to showcase and highlight events and projects ongoing in the CS Department.
            </p>
            </section>

            <section>
            <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
            <p className="mb-4">We collect several types of information from and about users of our platform, including:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Personal identifiable information such as name, email address, and academic information when you create an account</li>
                <li>Profile information including your profile picture and user preferences</li>
                <li>Information about events you create, join, or interact with</li>
                <li>Project details that you submit to our platform</li>
                <li>Comments and feedback you provide on projects and events</li>
                <li>Usage data regarding how you interact with our platform</li>
            </ul>
            </section>

            <section>
            <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Create and maintain your account</li>
                <li>Provide the core functionality of CSI Spotlight, including event management and project showcases</li>
                <li>Send notifications about events you've subscribed to</li>
                <li>Improve and optimize our platform</li>
                <li>Respond to your requests and feedback</li>
                <li>Personalize your experience on the platform</li>
            </ul>
            </section>

            <section>
            <h2 className="text-2xl font-semibold mb-3">Data Storage and Security</h2>
            <p className="mb-4">
                We use Supabase to securely store your data. We implement appropriate security measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            </section>

            <section>
            <h2 className="text-2xl font-semibold mb-3">Third-Party Services</h2>
            <p>
                We may use third-party services to help us operate our platform, such as:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Authentication services for Single Sign-On (SSO)</li>
                <li>Language translation services</li>
                <li>Email notification services</li>
            </ul>
            <p className="mt-2">
                These third parties may have access to your personal information only to perform these tasks on our behalf.
            </p>
            </section>

            <section>
            <h2 className="text-2xl font-semibold mb-3">Your Data Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to our processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Request transfer of your personal data</li>
                <li>Withdraw consent at any time, where we rely on consent to process your personal data</li>
            </ul>
            </section>

            <section>
            <h2 className="text-2xl font-semibold mb-3">Cookies and Tracking</h2>
            <p>
                We use cookies and similar tracking technologies to track activity on our platform and store certain information. 
                Cookies are files with a small amount of data which may include an anonymous unique identifier. 
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
            </section>

            <section>
            <h2 className="text-2xl font-semibold mb-3">Children's Privacy</h2>
            <p>
                Our platform is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If you are a parent or guardian and you are aware that your child 
                has provided us with personal information, please contact us.
            </p>
            </section>

            <section>
            <h2 className="text-2xl font-semibold mb-3">Changes to this Privacy Policy</h2>
            <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "Last Updated" date.
            </p>
            </section>

            <section>
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
            <p>
                If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <address className="mt-2 not-italic">
                <p>Email: privacy@csispotlight.edu</p>
                <p>CS Department</p>
                <p>CSI Spotlight Team</p>
            </address>
            </section>

            <div className="text-sm text-gray-500 mt-10 text-center">
            Last Updated: April 27, 2025
            </div>
        </div>
        </div>
        <Footer/>
    </>
  );
};

export default PrivacyPolicy;