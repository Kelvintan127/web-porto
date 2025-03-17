import React, { useState } from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdSend } from 'react-icons/md';
import emailjs from '@emailjs/browser';

const ContactMe = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, submitted: false, error: null });

    try {
      await emailjs.send(
        'service_ds5vhrc',
        'template_ntk9bdq',
        {
          to_name: 'Ferry Wilson',
          from_name: formData.name,
          name: formData.name,
          reply_to: formData.email,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        },
        'mz2jljtkVPH3jCErI'
      );

      setStatus({
        submitting: false,
        submitted: true,
        error: null
      });
      setFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => {
        setStatus(prev => ({ ...prev, submitted: false }));
      }, 5000);

    } catch (error) {
      setStatus({
        submitting: false,
        submitted: false,
        error: 'Failed to send message. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 px-4 md:px-8" id="contact">
      <div className="max-w-6xl mx-auto">
        {status.submitted && (
          <div className="fixed bottom-8 right-8 flex items-center z-50">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Message sent successfully!</span>
            </div>
          </div>
        )}
        {status.error && (
          <div className="fixed bottom-8 right-8 flex items-center z-50">
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="font-medium">{status.error}</span>
            </div>
          </div>
        )}
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Get in Touch
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300">
              <h3 className="text-2xl font-semibold text-white mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <MdEmail className="text-2xl text-purple-400" />
                  <div>
                    <p className="text-gray-300">Email</p>
                    <a href="mailto:ferrywilson123@gmail.com" className="text-white hover:text-purple-400 transition-colors duration-300">
                      ferrywilson123@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MdPhone className="text-2xl text-purple-400" />
                  <div>
                    <p className="text-gray-300">Phone / Whatsapp</p>
                    <a href="tel:+6281234567890" className="text-white hover:text-purple-400 transition-colors duration-300">
                      +62 819-1608-9274
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MdLocationOn className="text-2xl text-purple-400" />
                  <div>
                    <p className="text-gray-300">Location</p>
                    <p className="text-white">Jakarta Barat, Indonesia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300">
            <h3 className="text-2xl font-semibold text-white mb-6">Send Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors duration-300"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors duration-300"
                  required
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors duration-300"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-gray-300 mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors duration-300 resize-none"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MdSend className="text-xl" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactMe;