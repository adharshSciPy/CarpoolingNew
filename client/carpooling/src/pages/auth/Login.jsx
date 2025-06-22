import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./style.css";

// Yup validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Debug to check if reload is happening
  useEffect(() => {
    window.addEventListener("beforeunload", () => {
      console.log("Page is reloading...");
    });
  }, []);

const handleSubmit = async (values, { setSubmitting }) => {
  setIsLoading(true);

  try {
    const res = await login(values); // ❗DO NOT assume it always resolves safely

    toast.success("Logged in successfully", {
      autoClose: 2000,
    });

    setTimeout(() => {
      const role = localStorage.getItem("role");
      if (role === "driver") navigate("/driver");
      else if (role === "admin") navigate("/admin");
      else navigate("/");
    }, 2000);
  } catch (error) {
    // ✅ Prevent Vite reload by not letting errors leak
    console.error("Login failed:", error);

    let msg =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong. Try again.";

    // ✅ Safe toast
    toast.error(msg, { autoClose: 3000 });
  } finally {
    setIsLoading(false);
    setSubmitting(false);
  }
};



useEffect(() => {
  const handleBeforeUnload = () => {
    console.warn("🚨 PAGE IS RELOADING (beforeunload event)");
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, []);


  return (
    <div className="container">
      <div className="form-box">
        <h2 className="form-title">Sign in to your account</h2>
<Formik
  initialValues={{ email: "", password: "" }}
  validationSchema={LoginSchema}
  onSubmit={handleSubmit}
>
  {({ isSubmitting }) => (
    <Form noValidate autoComplete="off">

      <Field
        name="email"
        placeholder="Email address"
        type="email"
        className="input"
        autoComplete="email"
      />
      <ErrorMessage name="email" component="div" className="error-message" />

      <Field
        name="password"
        placeholder="Password"
        type="password"
        className="input"
        autoComplete="current-password"
      />
      <ErrorMessage name="password" component="div" className="error-message" />

      <div className="checkbox-label">
        <Field type="checkbox" name="remember" />
        <label htmlFor="remember">Remember me</label>
      </div>

      <button
        type="submit"
        disabled={isLoading || isSubmitting}
        className="button"
      >
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
