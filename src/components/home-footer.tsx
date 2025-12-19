import {
  Calculator,
  GraduationCap,
  Heart,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function HomeFooter() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-pink-500/5 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <Calculator className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">GraderX</h3>
                <p className="text-sm text-gray-300">LNMIIT Grade Calculator</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              The simplest and most accurate way to calculate your SGPA and CGPA
              at LNMIIT. Built with modern technology for the best user
              experience.
            </p>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-200">Built for LNMIIT</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-200">100% Free</span>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
              Quick Access
            </h4>
            <div className="space-y-3">
              <a
                href="#calculator"
                className="block text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
              >
                Grade Calculator
              </a>
              <Link
                href="/coming-soon"
                className="block text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
              >
                Student Portal
              </Link>
              <Link
                href="/coming-soon"
                className="block text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* LNMIIT */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
              <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full mr-3"></div>
              LNMIIT
            </h4>
            <div className="space-y-3">
              <a
                href="https://lnmiit.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-300 hover:text-white transition-colors duration-300 group"
              >
                Official Website
                <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </a>
              <div className="text-sm text-gray-400 leading-relaxed">
                <p>The LNM Institute of</p>
                <p>Information Technology</p>
                <p className="text-xs mt-2 text-gray-500">Jaipur, Rajasthan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700/50 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <div className="text-sm text-gray-300 flex items-center">
                © 2024 GraderX. Made with{" "}
                <Heart className="w-4 h-4 mx-1 text-red-400 animate-pulse" />
                for LNMIIT students.
              </div>
              <div className="text-sm text-gray-400 flex items-center">
                <Sparkles className="w-4 h-4 mr-1 text-yellow-400" />
                Made with love by{" "}
                <span className="font-medium text-white ml-1">Amrendra</span>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-gray-500">
                Privacy Policy (Coming Soon)
              </span>
              <span className="text-gray-500">•</span>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full text-blue-300 border border-blue-500/30">
                v1.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
