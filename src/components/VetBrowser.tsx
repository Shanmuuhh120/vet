import { useState, useEffect } from 'react';
import { supabase, VetProfile, UserProfile, Pet } from '../lib/supabase';
import { Star, DollarSign, Clock, Filter } from 'lucide-react';
import { AppointmentBooking } from './AppointmentBooking';

interface VetWithUser extends VetProfile {
  user_profiles: UserProfile;
}

interface VetBrowserProps {
  pets: Pet[];
}

export function VetBrowser({ pets }: VetBrowserProps) {
  const [vets, setVets] = useState<VetWithUser[]>([]);
  const [filteredVets, setFilteredVets] = useState<VetWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVet, setSelectedVet] = useState<VetWithUser | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const [filters, setFilters] = useState({
    specialization: '',
    minRating: 0,
    maxFee: 1000,
    availableOnly: false,
  });

  const specializations = ['General Practice', 'Surgery', 'Cardiology', 'Dermatology', 'Dentistry', 'Oncology', 'Orthopedics', 'Emergency Care'];

  useEffect(() => {
    fetchVets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vets, filters]);

  const fetchVets = async () => {
    try {
      const { data, error } = await supabase
        .from('vet_profiles')
        .select(`
          *,
          user_profiles (*)
        `)
        .order('average_rating', { ascending: false });

      if (error) throw error;
      setVets(data as VetWithUser[] || []);
    } catch (error) {
      console.error('Error fetching vets:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...vets];

    if (filters.specialization) {
      result = result.filter(v => v.specialization === filters.specialization);
    }

    if (filters.minRating > 0) {
      result = result.filter(v => v.average_rating >= filters.minRating);
    }

    if (filters.maxFee < 1000) {
      result = result.filter(v => v.consultation_fee <= filters.maxFee);
    }

    if (filters.availableOnly) {
      result = result.filter(v => v.is_available);
    }

    setFilteredVets(result);
  };

  const handleBookAppointment = (vet: VetWithUser) => {
    if (pets.length === 0) {
      alert('Please add a pet first before booking an appointment.');
      return;
    }
    setSelectedVet(vet);
    setShowBooking(true);
  };

  const resetFilters = () => {
    setFilters({
      specialization: '',
      minRating: 0,
      maxFee: 1000,
      availableOnly: false,
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </h3>
          <button
            onClick={resetFilters}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <select
              value={filters.specialization}
              onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Rating
            </label>
            <select
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="0">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Fee: ${filters.maxFee}
            </label>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={filters.maxFee}
              onChange={(e) => setFilters({ ...filters, maxFee: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.availableOnly}
                onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">Available Only</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredVets.length} of {vets.length} veterinarians
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVets.map((vet) => (
          <div key={vet.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center text-2xl font-bold text-teal-700">
                  {vet.user_profiles.full_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{vet.user_profiles.full_name}</h3>
                      <p className="text-sm text-gray-600">{vet.specialization}</p>
                    </div>
                    {vet.is_available && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Available
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 mt-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">{vet.average_rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({vet.total_reviews} reviews)</span>
                  </div>
                </div>
              </div>

              {vet.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{vet.bio}</p>
              )}

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-1 text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{vet.experience_years} years exp.</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-900 font-medium">
                  <DollarSign className="w-4 h-4" />
                  <span>{vet.consultation_fee.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => handleBookAppointment(vet)}
                disabled={!vet.is_available}
                className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredVets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No veterinarians match your filters</p>
        </div>
      )}

      {showBooking && selectedVet && (
        <AppointmentBooking
          vet={selectedVet}
          pets={pets}
          onClose={() => {
            setShowBooking(false);
            setSelectedVet(null);
          }}
        />
      )}
    </div>
  );
}
