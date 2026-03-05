import { useState, useEffect } from 'react';
import { supabase, Appointment, Pet } from '../lib/supabase';
import { Calendar, Clock, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface AppointmentWithDetails extends Appointment {
  pet: Pet;
  vet: { full_name: string; email: string };
}

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          *,
          pets (*)
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) throw error;

      const appointmentsWithVets = await Promise.all(
        (appointmentsData || []).map(async (apt) => {
          const { data: vetData } = await supabase
            .from('user_profiles')
            .select('full_name, email')
            .eq('id', apt.vet_id)
            .single();

          return {
            ...apt,
            pet: apt.pets,
            vet: vetData || { full_name: 'Unknown', email: '' },
          };
        })
      );

      setAppointments(appointmentsWithVets as AppointmentWithDetails[]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter.toUpperCase();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'RESCHEDULED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5" />;
      case 'ACCEPTED':
        return <CheckCircle className="w-5 h-5" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5" />;
      case 'RESCHEDULED':
        return <RefreshCw className="w-5 h-5" />;
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
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
      <div className="mb-6 flex space-x-2">
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
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'accepted'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Accepted
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Completed
        </button>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-4">
                  <Calendar className="w-6 h-6 text-teal-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{appointment.pet.name}</h3>
                    <p className="text-sm text-gray-600">{appointment.pet.breed}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  <span>{appointment.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Veterinarian</p>
                  <p className="font-medium text-gray-900">{appointment.vet.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium text-gray-900">
                    {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Issue Description</p>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{appointment.issue_description}</p>
              </div>

              {appointment.diagnosis && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Diagnosis</p>
                  <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded-lg border border-blue-200">{appointment.diagnosis}</p>
                </div>
              )}

              {appointment.medication_notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Medication Notes</p>
                  <p className="text-sm text-gray-900 bg-green-50 p-3 rounded-lg border border-green-200">{appointment.medication_notes}</p>
                </div>
              )}

              {appointment.rejection_reason && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">{appointment.rejection_reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
