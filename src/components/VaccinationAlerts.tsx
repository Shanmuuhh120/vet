import { useState, useEffect } from 'react';
import { supabase, Pet, Vaccination } from '../lib/supabase';
import { AlertCircle, Calendar, CheckCircle, Bell } from 'lucide-react';

interface VaccinationAlertsProps {
  pets: Pet[];
}

interface VaccinationWithPet extends Vaccination {
  pet: Pet;
}

export function VaccinationAlerts({ pets }: VaccinationAlertsProps) {
  const [vaccinations, setVaccinations] = useState<VaccinationWithPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue'>('all');

  useEffect(() => {
    fetchVaccinations();
  }, [pets]);

  const fetchVaccinations = async () => {
    if (pets.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const petIds = pets.map(p => p.id);
      const { data, error } = await supabase
        .from('vaccinations')
        .select('*')
        .in('pet_id', petIds)
        .order('next_due_date', { ascending: true });

      if (error) throw error;

      const vaccinationsWithPets = (data || []).map(vac => ({
        ...vac,
        pet: pets.find(p => p.id === vac.pet_id)!,
      }));

      setVaccinations(vaccinationsWithPets);
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVaccinations = vaccinations.filter(vac => {
    if (filter === 'all') return true;
    return vac.status === filter.toUpperCase();
  });

  const upcomingCount = vaccinations.filter(v => v.status === 'UPCOMING').length;
  const overdueCount = vaccinations.filter(v => v.status === 'OVERDUE').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'border-l-4 border-green-500 bg-green-50';
      case 'UPCOMING':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'OVERDUE':
        return 'border-l-4 border-red-500 bg-red-50';
      default:
        return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'UPCOMING':
        return <Calendar className="w-6 h-6 text-yellow-600" />;
      case 'OVERDUE':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
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
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vaccinations</p>
              <p className="text-3xl font-bold text-gray-900">{vaccinations.length}</p>
            </div>
            <Bell className="w-12 h-12 text-teal-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming (7 days)</p>
              <p className="text-3xl font-bold text-yellow-600">{upcomingCount}</p>
            </div>
            <Calendar className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-red-600">{overdueCount}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Vaccination Timeline</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'overdue'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Overdue
            </button>
          </div>
        </div>

        {filteredVaccinations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No vaccination records found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVaccinations.map((vaccination) => (
              <div key={vaccination.id} className={`rounded-lg p-4 ${getStatusColor(vaccination.status)}`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(vaccination.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900">{vaccination.vaccine_name}</h4>
                        <p className="text-sm text-gray-600">For: {vaccination.pet.name} ({vaccination.pet.breed})</p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-white border border-gray-200">
                        {vaccination.status}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Administered:</p>
                        <p className="font-medium text-gray-900">{new Date(vaccination.date_administered).toLocaleDateString()}</p>
                      </div>
                      {vaccination.next_due_date && (
                        <div>
                          <p className="text-gray-600">Next Due:</p>
                          <p className="font-medium text-gray-900">{new Date(vaccination.next_due_date).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                    {vaccination.veterinarian_notes && (
                      <p className="mt-2 text-sm text-gray-700 bg-white bg-opacity-50 p-2 rounded">
                        <span className="font-medium">Notes:</span> {vaccination.veterinarian_notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
