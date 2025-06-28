import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

const Contact = () => {
  const form = useRef();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const formData = {
        name: e.target.name.value,
        email: e.target.email.value,
        subject: e.target.subject.value,
        message: e.target.message.value,
      };

      // Send email
      const emailResponse = await fetch('/api/mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Send WhatsApp message via Fonnte
      const whatsappResponse = await fetch('/api/fonnte', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `New Contact Form Submission\n\nName: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`,
        }),
      });

      const emailData = await emailResponse.json();
      const whatsappData = await whatsappResponse.json();

      if (!emailResponse.ok) {
        throw new Error(emailData.message || "Failed to send email");
      }

      if (!whatsappResponse.ok) {
        throw new Error(whatsappData.message || "Failed to send WhatsApp message");
      }

      setStatus({
        type: "success",
        message: "Thank you! Your message has been sent successfully.",
      });
      form.current.reset();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Oops! Something went wrong. Please try again later.",
      });
      await fetch('/api/fonnte', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Error Sending Message From Website Portfolio\n\nName: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}\nError Details:\n${error.message}`,
        }),
      });

      console.log("Contact error details:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section
      className="relative w-full max-w-[1300px] mx-auto px-6 sm:px-8 md:px-12 py-20 dark:bg-transparent light:bg-white/80"
      id="contact"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 dark:from-blue-300 dark:via-blue-500 dark:to-blue-600 text-transparent bg-clip-text mb-4">
          Contact me
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">— get in touch —</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Get in Touch</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            I thrive on challenges to achieve a better solution in business and
            ambitious goals. My greatest strength is to combine business design
            with technologies that used in nowadays society. I am a committed
            and enthusiastic candidate seeking to become an outstanding business
            partner in IT related business.
          </p>

          <div className="space-y-6">
            {/* Contact Info Items */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-gray-900/50 border border-blue-200 dark:border-gray-800/50">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM17.707 17.707a1 1 0 01-1.414 0l-1.586-1.586a6.993 6.993 0 00-4.891-2.115h-.002a6.993 6.993 0 00-4.891 2.115l-1.586 1.586a1 1 0 01-1.414-1.414l1.586-1.586a8.993 8.993 0 016.304-2.701h.002a8.993 8.993 0 016.304 2.701l1.586 1.586a1 1 0 010 1.414z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">Name</p>
                <p className="text-gray-600 dark:text-gray-400">Kelvin Tan</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-gray-900/50 border border-blue-200 dark:border-gray-800/50">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">Address</p>
                <p className="text-gray-600 dark:text-gray-400">North Jakarta, Indonesia</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-gray-900/50 border border-blue-200 dark:border-gray-800/50">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">Email</p>
                <p className="text-gray-600 dark:text-gray-400">kelvin@klveen.com</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Message me</h3>
          <motion.form
            ref={form}
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-blue-50 dark:bg-gray-900/50 border border-blue-200 dark:border-gray-800/50 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400 dark:focus:border-gray-600 transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-blue-50 dark:bg-gray-900/50 border border-blue-200 dark:border-gray-800/50 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400 dark:focus:border-gray-600 transition-colors"
                  placeholder="Your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                className="w-full px-4 py-3 rounded-lg bg-blue-50 dark:bg-gray-900/50 border border-blue-200 dark:border-gray-800/50 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400 dark:focus:border-gray-600 transition-colors"
                placeholder="Subject of your message"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows="6"
                className="w-full px-4 py-3 rounded-lg bg-blue-50 dark:bg-gray-900/50 border border-blue-200 dark:border-gray-800/50 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400 dark:focus:border-gray-600 transition-colors"
                placeholder="Your message"
              ></textarea>
            </div>

            {status.message && (
              <div
                className={`p-4 rounded-lg ${
                  status.type === "success"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {status.message}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full md:w-auto px-8 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-gray-900/50 dark:border dark:border-white text-white dark:text-gray-300 dark:hover:bg-gray-800 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                    
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
