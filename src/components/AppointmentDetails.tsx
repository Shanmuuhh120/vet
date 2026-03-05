import { useState } from 'react';
import { supabase, Appointment, Pet, Prescription } from '../lib/supabase';
import { X, Save, CheckCircle, Upload, FileText } from 'lucide-react';

interface AppointmentWithDetails extends Appointment {
  pet: Pet;
  owner: { full_name: string; email: string; phone?: string };
  prescriptions?: Prescription[];
}

interface AppointmentDetailsProps {
  appointment: AppointmentWithDetails;
  onClose: () => void;
}

export function AppointmentDetails({ appointment, onClose }: AppointmentDetailsProps) {
  const [diagnosis, setDiagnosis] = useState(appointment.diagnosis || '');
  const [medicationNotes, setMedicationNotes] = useState(appointment.medication_notes || '');
  const [prescriptionUrl, setPrescriptionUrl] = useState('');
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSaveNotes = async () => {
    setSaving(true);
    setError('');

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          diagnosis,
          medication_notes: medicationNotes,
        })
        .eq('id', appointment.id);

      if (error) throw error;
      alert('Notes saved successfully!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPrescription = async () => {
    if (!prescriptionUrl.trim()) {
      alert('Please enter a prescription URL');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { error } = await supabase
        .from('prescriptions')
        .insert([{
          appointment_id: appointment.id,
          pet_id: appointment.pet_id,
          vet_id: appointment.vet_id,
          prescription_url: prescriptionUrl,
          notes: prescriptionNotes,
        }]);

      if (error) throw error;
      alert('Prescription added successfully!');
      setPrescriptionUrl('');
      setPrescriptionNotes('');
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!diagnosis.trim()) {
      alert('Please add a diagnosis before marking as completed');
      return;
    }

    if (!confirm('Are you sure you want to mark this appointment as completed?')) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'COMPLETED',
          diagnosis,
          medication_notes: medicationNotes,
        })
        .eq('id', appointment.id);

      if (error) throw error;
      alert('Appointment marked as completed!');
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Pet Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{appointment.pet.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Breed & Species</p>
                    <p className="font-medium text-gray-900">{appointment.pet.breed} - {appointment.pet.species}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age & Gender</p>
                    <p className="font-medium text-gray-900">{appointment.pet.age} years - {appointment.pet.gender}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Owner Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{appointment.owner.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{appointment.owner.email}</p>
                  </div>
                  {appointment.owner.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{appointment.owner.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-teal-300">
              <p className="text-sm text-gray-600 mb-1">Appointment Date & Time</p>
              <p className="font-medium text-gray-900">
                {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
              </p>
            </div>
          </div>

          {appointment.pet.medical_history && (
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Medical History</h3>
              <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {appointment.pet.medical_history}
              </p>
            </div>
          )}

          {appointment.pet.current_symptoms && (
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Current Symptoms</h3>
              <p className="text-sm text-gray-900 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                {appointment.pet.current_symptoms}
              </p>
            </div>
          )}

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Issue Description</h3>
            <p className="text-sm text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-200">
              {appointment.issue_description}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-bold text-gray-900 mb-4">Clinical Notes</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis *
                </label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your diagnosis..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medication & Treatment Notes
                </label>
                <textarea
                  value={medicationNotes}
                  onChange={(e) => setMedicationNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter medication and treatment recommendations..."
                />
              </div>

              <button
                onClick={handleSaveNotes}
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Notes'}</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-bold text-gray-900 mb-4">Prescriptions</h3>

            {appointment.prescriptions && appointment.prescriptions.length > 0 && (
              <div className="mb-4 space-y-2">
                {appointment.prescriptions.map((prescription) => (
                  <div key={prescription.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <a
                          href={prescription.prescription_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                        >
                          View Prescription
                        </a>
                        {prescription.notes && (
                          <p className="text-xs text-gray-600 mt-1">{prescription.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prescription Document URL
                </label>
                <input
                  type="url"
                  value={prescriptionUrl}
                  onChange={(e) => setPrescriptionUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="https://example.com/prescription.pdf"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upload your prescription to a file hosting service and paste the URL here
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prescription Notes
                </label>
                <textarea
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Additional notes about the prescription..."
                />
              </div>

              <button
                onClick={handleAddPrescription}
                disabled={saving || !prescriptionUrl}
                className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{saving ? 'Adding...' : 'Add Prescription'}</span>
              </button>
            </div>
          </div>

          {appointment.status !== 'COMPLETED' && (
            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={handleComplete}
                disabled={saving || !diagnosis.trim()}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{saving ? 'Processing...' : 'Mark Appointment as Completed'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
