import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./style.css";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

 const handleSubmit = async (values) => {
  setIsLoading(true);
  try {
    const user = await login(values);
    toast.success("Logged in successfully");

    const role = localStorage.getItem("role");

    if (role === "driver") {
      navigate("/driver");
    } else if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      "Login failed. Please try again.";
    toast.error(errorMsg);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="container">
      <div className="form-box">
        <h2 className="form-title">Sign in to your account</h2>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form>
              <Field
                name="email"
                placeholder="Email address"
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

              <div className="checkbox-label">
                <Field type="checkbox" name="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>

              <button type="submit" disabled={isLoading} className="button">
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
