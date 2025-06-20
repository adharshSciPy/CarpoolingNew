import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "./style.css";
import { toast } from "react-toastify";

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6).required("Required"),
  phone: Yup.string().required("Required"),
  role: Yup.string().required("Required"),

  carModel: Yup.string().when("role", {
    is: "driver",
    then: (schema) => schema.required("Car model is required"),
  }),
  carColor: Yup.string().when("role", {
    is: "driver",
    then: (schema) => schema.required("Car color is required"),
  }),
  carCapacity: Yup.string().when("role", {
    is: "driver",
    then: (schema) => schema.required("Car capacity is required"),
  }),
  plateNumber: Yup.string().when("role", {
    is: "driver",
    then: (schema) => schema.required("Plate number is required"),
  }),
  licenseNumber: Yup.string().when("role", {
    is: "driver",
    then: (schema) => schema.required("License number is required"),
  }),
});

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values, { resetForm }) => {
    setIsLoading(true);
    try {
      console.log(values);
      const res = await axios.post(
        "http://localhost:5000/api/v1/auth/register",
        values
      );

      if (res.status === 200 || res.status === 201) {
        const message = res.data?.message || "Registration successful";
        toast.success(message);
        resetForm();
        navigate("/login")
      } else {
        toast.error("Unexpected response from server");
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-box">
        <h1 className="form-title">Register</h1>
        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            phone: "",
            role: "",
            carModel: "",
            carColor: "",
            carCapacity: "",
            plateNumber: "",
            licenseNumber: "",
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ values }) => (
            <Form>
              <Field name="name" placeholder="Name" className="input" />
              <ErrorMessage
                name="name"
                component="div"
                className="error-message"
              />

              <Field
                name="email"
                placeholder="Email"
                type="email"
                className="input"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="error-message"
              />

              <Field
                name="password"
                placeholder="Password"
                type="password"
                className="input"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="error-message"
              />

              <Field name="phone" placeholder="Phone" className="input" />
              <ErrorMessage
                name="phone"
                component="div"
                className="error-message"
              />

              <div className="radio-group">
                <label>
                  <Field type="radio" name="role" value="user" /> User
                </label>
                <label>
                  <Field type="radio" name="role" value="driver" /> Driver
                </label>
              </div>
              <ErrorMessage
                name="role"
                component="div"
                className="error-message"
              />

              {values.role === "driver" && (
                <>
                  <Field
                    name="carModel"
                    placeholder="Car Model"
                    className="input"
                  />
                  <ErrorMessage
                    name="carModel"
                    component="div"
                    className="error-message"
                  />

                  <Field
                    name="carColor"
                    placeholder="Car Color"
                    className="input"
                  />
                  <ErrorMessage
                    name="carColor"
                    component="div"
                    className="error-message"
                  />

                  <Field
                    name="carCapacity"
                    placeholder="Car Capacity"
                    className="input"
                  />
                  <ErrorMessage
                    name="carCapacity"
                    component="div"
                    className="error-message"
                  />

                  <Field
                    name="plateNumber"
                    placeholder="Plate Number"
                    className="input"
                  />
                  <ErrorMessage
                    name="plateNumber"
                    component="div"
                    className="error-message"
                  />

                  <Field
                    name="licenseNumber"
                    placeholder="License Number"
                    className="input"
                  />
                  <ErrorMessage
                    name="licenseNumber"
                    component="div"
                    className="error-message"
                  />
                </>
              )}

              <button type="submit" className="button" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </button>

              {/* ✅ Back to login button */}
              <button
                type="button"
                className="button"
                style={{ marginTop: "0.75rem", backgroundColor: "#6b7280" }}
                onClick={() => navigate("/login")}
              >
                Back to Login
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
