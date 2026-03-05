import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Calendar, Shield, Clock, Stethoscope, Users } from 'lucide-react';
import { useEffect } from 'react';

export function LandingPage() {
  const navigate = useNavigate();
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && userProfile) {
      if (userProfile.role === 'VET') {
        navigate('/vet-dashboard');
      } else {
        navigate('/pet-dashboard');
      }
    }
  }, [user, userProfile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <nav className="bg-white bg-opacity-90 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-teal-600" fill="currentColor" />
              <span className="text-2xl font-bold text-gray-900">FurrEver</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-gray-700 hover:text-teal-600 transition-colors font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Quality Veterinary Care,<br />From Anywhere
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with licensed veterinarians for telemedicine consultations. Keep your pet healthy and happy with professional care at your fingertips.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center space-x-2 bg-teal-600 text-white px-8 py-4 rounded-lg hover:bg-teal-700 transition-colors text-lg font-medium shadow-lg hover:shadow-xl"
          >
            <span>Start Your Journey</span>
            <Heart className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Booking</h3>
            <p className="text-gray-600">
              Schedule appointments with qualified veterinarians at times that work for you. No more waiting rooms.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Stethoscope className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Care</h3>
            <p className="text-gray-600">
              Access board-certified veterinarians with various specializations for comprehensive pet healthcare.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Health Tracking</h3>
            <p className="text-gray-600">
              Keep all your pet's medical records, vaccinations, and prescriptions organized in one secure place.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Create Account</h4>
              <p className="text-sm text-gray-600">Sign up as a pet owner or veterinarian</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Add Your Pet</h4>
              <p className="text-sm text-gray-600">Create a complete health profile for your pet</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Book Appointment</h4>
              <p className="text-sm text-gray-600">Choose a vet and schedule your consultation</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Get Care</h4>
              <p className="text-sm text-gray-600">Receive expert advice and prescriptions</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl shadow-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-teal-50">
            Join thousands of pet owners who trust FurrEver for their pet's healthcare needs
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-teal-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium shadow-lg"
          >
            Create Free Account
          </button>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-300 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="w-6 h-6 text-teal-400" fill="currentColor" />
            <span className="text-xl font-bold text-white">FurrEver</span>
          </div>
          <p className="text-sm">Veterinary Telemedicine Platform</p>
          <p className="text-xs mt-2 text-gray-500">Professional pet healthcare, anytime, anywhere</p>
        </div>
      </footer>
    </div>
  );
}
