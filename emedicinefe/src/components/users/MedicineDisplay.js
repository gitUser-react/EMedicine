import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../constants";
import Header from "./Header";

export default function MedicineDisplay() {
  const [data, setData] = useState([]);
  const [quantity, setOrderQuantity] = useState(1);

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    const data = {
      email: "admin",
      userId: 0,
      unitPrice: 0,
      discount: 0,
      quantity: 0,
      totalPrice: 0,
      medicineID: 0,
      medicineName: "",
      manufacturer: "",
      imageUrl: ""
    };
    const url = `${baseUrl}/api/Admin/cartList`;
    console.log("Sending request to:", url, "with data:", data);

    axios
      .post(url, data)
      .then((result) => {
        console.log("Received API response:", result.data);
        if (result.data.statusCode === 200) {
          setData(result.data.listCart);
        } else {
          console.error("Unexpected response structure", result.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
        }
      });
  };

  const handleAddToCart = (e, id) => {
    e.preventDefault();
    const data = {
      ID: id,
      Quantity: quantity,
      Email: localStorage.getItem("username"),
      userId: 0,
      unitPrice: 0,
      discount: 0,
      totalPrice: 0,
      medicineID: 0,
      medicineName: "",
      manufacturer: "",
      imageUrl: ""
    };
    const url = `${baseUrl}/api/Medicines/addToCart`;
    console.log("Sending request to:", url, "with data:", data);

    axios
      .post(url, data)
      .then((result) => {
        console.log("Received API response:", result.data);
        if (result.data.statusCode === 200) {
          getData();
          alert(result.data.statusMessage);
        }
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
        }
      });
  };

  return (
    <Fragment>
      <Header />
      <br />
      <div
        style={{
          backgroundColor: "white",
          width: "80%",
          margin: "0 auto",
          borderRadius: "11px",
        }}
      >
        <div className="card-deck">
          {data && data.length > 0
            ? data.map((val, index) => {
                return (
                  <div
                    key={index}
                    className="col-md-3"
                    style={{ marginBottom: "21px" }}
                  >
                    <div className="card">
                      <img
                        className="card-img-top"
                        src={`assets/images/${val.imageUrl}`}
                        alt="Card image"
                      />
                      <div className="card-body">
                        <h4 className="card-title"> {val.medicineName}</h4>
                        <h4 className="card-title">
                          <select
                            id="medicineQuantity"
                            className="form-control"
                            onChange={(e) => setOrderQuantity(parseInt(e.target.value, 10))}
                          >
                            <option value="-1">Select Quantity</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                          </select>
                        </h4>
                        <button className="btn btn-primary" onClick={(e) => handleAddToCart(e, val.id)}>
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            : "Loading products..."}
        </div>
      </div>
    </Fragment>
  );
}
