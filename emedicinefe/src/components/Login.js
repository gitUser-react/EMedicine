import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { baseUrl } from './constants';
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
  
    let error = '';
    if (email === '') error += 'Email, ';
    if (password === '') error += 'Password ';
  
    if (error.length > 0) {
      error += 'cannot be blank';
      alert(error);
      return;
    }

    const createdOn = new Date().toISOString();
    const url = `${baseUrl}/api/Users/login`;
    const data = {
      email: email,
      password: password,
      fund: "",        // Add required fields
      type: "",
      lastName: "",
      firstName: "",
      orderDate: "",
      actionType: "",
      createdOn: createdOn
    };
  
    console.log("Request Data:", JSON.stringify(data));
    console.log("Request Headers:", {
      'Content-Type': 'application/json'
    });
  
    axios
      .post(url, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((result) => {
        const dt = result.data;
        if (dt.statusCode === 200) {
          const redirectUrl = email === "admin" && password === "admin" ? "/admindashboard" : "/dashboard";
          localStorage.setItem("username", email);
          window.location.href = redirectUrl;
        } else {
          alert(dt.statusMessage);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  
  
  
  return (
    <Fragment>
      <div style={{ backgroundColor: "white", width: "80%", margin: "0 auto", borderRadius: "11px" }}>
        <div className="mt-4" style={{ margin: "0 auto", width: "430px" }}>
          <h3>E-Medicine Login</h3>
        </div>

        <section className="vh-100">
          <div className="container py-5 h-100">
            <div className="row d-flex align-items-center justify-content-center h-100">
              <div className="col-md-8 col-lg-7 col-xl-6">
                <img src="../1.jpg" className="img-fluid" alt="Phone image" />
              </div>
              <div className="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
                <form>
                  <div className="form-outline mb-4">
                    <input
                      type="email"
                      id="form1Example13"
                      className="form-control form-control-lg"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      placeholder="Enter Email"
                    />
                  </div>

                  <div className="form-outline mb-4">
                    <input
                      type="password"
                      id="form1Example23"
                      className="form-control form-control-lg"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      placeholder="Enter Password"
                    />
                  </div>

                  <div className="d-flex justify-content-around align-items-center mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value=""
                        id="form1Example3"
                        checked
                      />
                      <label className="form-check-label" htmlFor="form1Example3">
                        Remember me
                      </label>
                    </div>
                    <a href="#!">Forgot password?</a>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-block"
                    onClick={(e) => handleLogin(e)}
                  >
                    Sign in
                  </button>
                  <Link to="/Registration" className="btn btn-info btn-lg btn-block">
                    Registration
                  </Link>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Fragment>
  );
}
