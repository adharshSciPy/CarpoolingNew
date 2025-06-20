import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CreateRideSchema = Yup.object().shape({
  startLocation: Yup.string().required('Start location is required'),
  endLocation: Yup.string().required('End location is required'),
  departureTime: Yup.date().required('Departure time is required'),
  availableSeats: Yup.number()
    .min(1, 'At least 1 seat required')
    .required('Number of seats is required'),
  pricePerSeat: Yup.number()
    .min(0, 'Price cannot be negative')
    .required('Price per seat is required'),
});

const CreateRide = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem('id');
      if (!userId) {
        toast.error("User ID not found. Please login again.");
        return;
      }

      const payload = { ...values, driver:userId };

      const { data } = await api.post('/rides', payload);
      toast.success('Ride created successfully!');
      navigate(`/rides/${data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ride');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create a New Ride</h1>

        <div className="bg-white shadow rounded-lg p-6">
          <Formik
            initialValues={{
              startLocation: '',
              endLocation: '',
              departureTime: '',
              availableSeats: 1,
              pricePerSeat: 0,
            }}
            validationSchema={CreateRideSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startLocation">Start Location</label>
                    <Field
                      name="startLocation"
                      type="text"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage name="startLocation" component="div" className="text-red-600 text-sm" />
                  </div>

                  <div>
                    <label htmlFor="endLocation">Destination</label>
                    <Field
                      name="endLocation"
                      type="text"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage name="endLocation" component="div" className="text-red-600 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="departureTime">Departure Date & Time</label>
                    <Field
                      name="departureTime"
                      type="datetime-local"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage name="departureTime" component="div" className="text-red-600 text-sm" />
                  </div>

                  <div>
                    <label htmlFor="availableSeats">Available Seats</label>
                    <Field
                      name="availableSeats"
                      type="number"
                      min="1"
                      className="w-full p-2 border rounded"
                    />
                    <ErrorMessage name="availableSeats" component="div" className="text-red-600 text-sm" />
                  </div>
                </div>

                <div>
                  <label htmlFor="pricePerSeat">Price per Seat</label>
                  <Field
                    name="pricePerSeat"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage name="pricePerSeat" component="div" className="text-red-600 text-sm" />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/driver')}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Ride'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default CreateRide;
