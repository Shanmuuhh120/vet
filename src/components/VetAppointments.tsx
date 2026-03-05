import { useState, useEffect } from 'react';
import { supabase, Appointment, Pet, Prescription } from '../lib/supabase';
import { Calendar, Clock, CheckCircle, XCircle, FileText, Upload } from 'lucide-react';
import { AppointmentDetails } from './AppointmentDetails';

interface AppointmentWithDetails extends Appointment {
  pet: Pet;
  owner: { full_name: string; email: string; phone?: string };
  prescriptions?: Prescription[];
}

export function VetAppointments() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('pending');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);

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
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      const appointmentsWithDetails = await Promise.all(
        (appointmentsData || []).map(async (apt) => {
          const { data: ownerData } = await supabase
            .from('user_profiles')
            .select('full_name, email, phone')
            .eq('id', apt.owner_id)
            .single();

          const { data: prescriptionsData } = await supabase
            .from('prescriptions')
            .select('*')
            .eq('appointment_id', apt.id);

          return {
            ...apt,
            pet: apt.pets,
            owner: ownerData || { full_name: 'Unknown', email: '' },
            prescriptions: prescriptionsData || [],
          };
        })
      );

      setAppointments(appointmentsWithDetails as AppointmentWithDetails[]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'ACCEPTED' })
        .eq('id', appointmentId);

      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error('Error accepting appointment:', error);
      alert('Failed to accept appointment');
    }
  };

  const handleReject = async (appointmentId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'REJECTED', rejection_reason: reason })
        .eq('id', appointmentId);

      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      alert('Failed to reject appointment');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter.toUpperCase();
  });

  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
  const acceptedCount = appointments.filter(a => a.status === 'ACCEPTED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-3xl font-bold text-blue-600">{acceptedCount}</p>
            </div>
            <Calendar className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedCount}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Appointments</h3>
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
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No appointments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-4">
                    <Calendar className="w-6 h-6 text-teal-600 mt-1" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{appointment.pet.name}</h4>
                      <p className="text-sm text-gray-600">{appointment.pet.breed} - {appointment.pet.species}</p>
                      <p className="text-sm text-gray-600 mt-1">Owner: {appointment.owner.full_name}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium text-gray-900">
                      {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium text-gray-900">{appointment.owner.email}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Issue Description</p>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{appointment.issue_description}</p>
                </div>

                <div className="flex space-x-2">
                  {appointment.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleAccept(appointment.id)}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleReject(appointment.id)}
                        className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                  {(appointment.status === 'ACCEPTED' || appointment.status === 'COMPLETED') && (
                    <button
                      onClick={() => setSelectedAppointment(appointment)}
                      className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Details & Add Notes</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          onClose={() => {
            setSelectedAppointment(null);
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
}
