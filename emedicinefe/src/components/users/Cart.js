import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header";
import { baseUrl } from "../constants";

export default function Cart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    const data = {
      Email: localStorage.getItem("username"),
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
    axios
      .post(url, data)
      .then((result) => {
        const data = result.data;
        if (data.statusCode === 200) {
          setData(data.listCart);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const data = {
      Email: localStorage.getItem("username"),
      // Assuming these fields are necessary and should be filled appropriately
      Password: "",
      Fund: "",
      Type: "",
      LastName: "",
      FirstName: "",
      OrderDate: new Date().toISOString(), // Assuming an ISO format date
      ActionType: "PlaceOrder", // Make sure this matches what the backend expects
      CreatedOn: new Date().toISOString() // Assuming an ISO format date
    };
    console.log("Data sent to placeOrder API:", data); // Log the data being sent

    const url = `${baseUrl}/api/Medicines/placeOrder`;
    axios
      .post(url, data)
      .then((result) => {
        const dt = result.data;
        console.log("Received API response:", dt); // Log the response data
        if (dt.statusCode === 200) {
          setData([]);
          alert(dt.statusMessage);
        }
      })
      .catch((error) => {
        console.error("Error placing order:", error);
        if (error.response) {
          console.error("Response data:", error.response.data); // Log the response data
        }
      });
  };

  const handleRemoveToCart = (e, id) => {
    e.preventDefault();
    const data = {
      ID: id,
      Email: localStorage.getItem("username"),
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
    const url = `${baseUrl}/api/Medicines/removeFromCart`;
    axios
      .post(url, data)
      .then((result) => {
        const dt = result.data;
        if (dt.statusCode === 200) {
          getData();
          alert(dt.statusMessage);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Fragment>
      <Header />
      <br />
      <div className="form-group col-md-12">
        <h3>Cart items</h3>
        {data && data.length ? (
          <button className="btn btn-primary" onClick={(e) => handlePlaceOrder(e)}>
            Place Order
          </button>
        ) : (
          ""
        )}
      </div>
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
                  <div key={index} className="col-md-3" style={{ marginBottom: "21px" }}>
                    <div className="card">
                      <img className="card-img-top" src={`assets/images/${val.imageUrl}`} alt="Card image" />
                      <div className="card-body">
                        <h4 className="card-title">Name : {val.medicineName}</h4>
                        <h4 className="card-title">Quantity : {val.quantity}</h4>
                        <button className="btn btn-primary" onClick={(e) => handleRemoveToCart(e, val.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            : "No item to display. Kindly add..."}
        </div>
      </div>
    </Fragment>
  );
}
