import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import "./Profile.css"

const ProfileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.string().required('Phone number is required'),
});

const Profile = () => {
  const { user } = useAuth();
  const [driverProfile, setDriverProfile] = useState(null);
  const [initialValues, setInitialValues] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setInitialValues({
          name: data.data.user.name,
          email: data.data.user.email,
          phone: data.data.user.phone,
        });
        if (data.data.driverProfile) {
          setDriverProfile(data.data.driverProfile);
        }
      } catch (error) {
        toast.error('Failed to fetch profile data');
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (values) => {
    try {
      await api.put(`/users/${user.id}`, values);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  if (!initialValues.name) return <div>Loading...</div>;

  return (
    <div className="container ">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={ProfileSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Field
                  name="name"
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Field
                  name="email"
                  type="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <Field
                  name="phone"
                  type="tel"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <ErrorMessage
                  name="phone"
                  component="div"
                  className="mt-1 text-sm text-red-600"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {user?.role === 'driver' && (
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Driver Information</h2>
          {driverProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">License Number</h3>
                <p className="text-gray-900">{driverProfile.licenseNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Car Model</h3>
                <p className="text-gray-900">{driverProfile.carModel}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Car Color</h3>
                <p className="text-gray-900">{driverProfile.carColor}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Plate Number</h3>
                <p className="text-gray-900">{driverProfile.carPlateNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Seat Capacity</h3>
                <p className="text-gray-900">{driverProfile.carCapacity}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Approval Status</h3>
                <p className="text-gray-900">
                  {driverProfile.approved ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Approval
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No driver profile found</p>
              <button className="mt-2 text-primary-600 hover:text-primary-800 font-medium">
                Complete Driver Profile
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;