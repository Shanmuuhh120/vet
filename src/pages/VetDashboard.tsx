import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, VetProfile } from '../lib/supabase';
import { LogOut, Calendar, User, Settings } from 'lucide-react';
import { VetAppointments } from '../components/VetAppointments';
import { VetProfileSettings } from '../components/VetProfileSettings';

type TabType = 'appointments' | 'profile';

export function VetDashboard() {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('appointments');
  const [vetProfile, setVetProfile] = useState<VetProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVetProfile();
  }, [userProfile]);

  const fetchVetProfile = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('vet_profiles')
        .select('*')
        .eq('user_id', userProfile.id)
        .maybeSingle();

      if (error) throw error;
      setVetProfile(data);
    } catch (error) {
      console.error('Error fetching vet profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FurrEver</h1>
                <p className="text-xs text-gray-500">Veterinarian Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userProfile?.full_name}</p>
                <p className="text-xs text-gray-500">{vetProfile?.specialization}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'appointments'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Appointments</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Profile Settings</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'appointments' && <VetAppointments />}
        {activeTab === 'profile' && vetProfile && (
          <VetProfileSettings profile={vetProfile} onUpdate={fetchVetProfile} />
        )}
      </div>
    </div>
  );
}
