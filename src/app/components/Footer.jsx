import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black/30 backdrop-blur-sm border-t border-gray-800">
      <div className="max-w-[1300px] mx-auto px-6 sm:px-8 md:px-12 py-6">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <p className="text-gray-400 text-lg">
            © {currentYear} Kelvin Tan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;