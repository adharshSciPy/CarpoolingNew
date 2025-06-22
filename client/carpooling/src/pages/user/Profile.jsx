import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import "./Profile.css";

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

  if (!initialValues.name) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading your profile...</p>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal and driver information</p>
      </div>
      
      <div className="profile-sections">
        <div className="profile-card">
          <div className="card-header">
            <div className="avatar">
              {initialValues.name.charAt(0).toUpperCase()}
            </div>
            <h2>Personal Information</h2>
          </div>
          
          <Formik
            initialValues={initialValues}
            validationSchema={ProfileSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">
                    Full Name
                  </label>
                  <Field
                    name="name"
                    type="text"
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email
                  </label>
                  <Field
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="Enter your email"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    Phone Number
                  </label>
                  <Field
                    name="phone"
                    type="tel"
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="error-message"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span> Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </Form>
            )}
          </Formik>
        </div>

        {user?.role === 'driver' && (
          <div className="profile-card driver-card">
            <div className="card-header">
              <div className="icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
                </svg>
              </div>
              <h2>Driver Information</h2>
            </div>
            
            {driverProfile ? (
              <div className="driver-info-grid">
                <div className="info-item">
                  <span className="info-label">License Number</span>
                  <span className="info-value">{driverProfile.licenseNumber}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Car Model</span>
                  <span className="info-value">{driverProfile.carModel}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Car Color</span>
                  <span className="info-value">{driverProfile.carColor}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Plate Number</span>
                  <span className="info-value">{driverProfile.carPlateNumber}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Seat Capacity</span>
                  <span className="info-value">{driverProfile.carCapacity}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Approval Status</span>
                  <span className={`status-badge ${driverProfile.approved ? 'approved' : 'pending'}`}>
                    {driverProfile.approved ? 'Approved' : 'Pending Approval'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="no-profile">
                <p>You haven't set up your driver profile yet</p>
                <button className="complete-profile-btn">
                  Complete Driver Profile
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;