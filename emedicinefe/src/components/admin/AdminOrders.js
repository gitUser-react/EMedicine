import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import Header from "./AdminHeader";
import { baseUrl } from "../constants";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "../users/modal.css";

export default function AdminOrders() {
  const [data, setData] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [orderNo, setOrderNo] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [show, setShow] = useState(false);
  const [showOrderStatus, setShowOrderStatus] = useState(false);

  // New state variables for the order details
  const [customerName, setCustomerName] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [unitPrice, setUnitPrice] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const handleClose = () => setShow(false);
  const handleCloseOrderStatus = () => setShowOrderStatus(false);

  useEffect(() => {
    getData("Admin", 0);
  }, []);

  const getData = (type, id) => {
    const requestData = {
      ID: id,
      Type: type,
      Email: localStorage.getItem("username"),
      Password: "",
      Fund: "",
      LastName: "",
      FirstName: "",
      OrderDate: "",
      ActionType: "",
    };
    console.log("Data sent to orderList API:", requestData);

    const url = `${baseUrl}/api/Medicines/orderList`;
    axios
      .post(url, requestData)
      .then((result) => {
        const data = result.data;
        console.log("Received API response:", data);
        if (data.statusCode === 200) {
          if (type === "Admin") {
            setData(data.listOrders);
          } else {
            setItemData(data.listOrders);
          }
        } else {
          console.error("Unexpected response structure", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
        }
      });
  };

  const handleItemDetail = (id) => {
    getData("UserItems", id);
    setShow(true);
  };

  const handleOrderStatusDetail = (order) => {
    setOrderNo(order.orderNo);
    setOrderStatus(order.orderStatus);
    setCustomerName(order.customerName || "");
    setMedicineName(order.medicineName || "");
    setManufacturer(order.manufacturer || "");
    setImageUrl(order.imageUrl || "");
    setUnitPrice(order.unitPrice || 0);
    setOrderTotal(order.orderTotal || 0);
    setQuantity(order.quantity || 0);
    setTotalPrice(order.totalPrice || 0);
    setShowOrderStatus(true);
  };

  const handleOrderStatus = (e) => {
    e.preventDefault();
    const url = `${baseUrl}/api/Admin/updateOrderStatus`;
    const requestData = {
      order: {
        OrderNo: orderNo,
        OrderStatus: orderStatus,
        CustomerName: "",
        MedicineName: medicineName,
        Manufacturer: manufacturer,
        UnitPrice: Number.isFinite(unitPrice) ? unitPrice : 0.0,
        OrderTotal: Number.isFinite(orderTotal) ? orderTotal : 0.0,
        CreatedOn: new Date().toISOString(),
        Quantity: Number.isInteger(quantity) ? quantity : 0,
        ExpDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        ImageUrl: imageUrl,
        TotalPrice: Number.isFinite(totalPrice) ? totalPrice : 0.0
      }
    };
    console.log("Data sent to updateOrderStatus API:", requestData);

    axios
      .post(url, requestData)
      .then((result) => {
        setShowOrderStatus(false);
        getData("Admin", 0);
        setOrderStatus("");
        setCustomerName("");
        setMedicineName("");
        setManufacturer("");
        setImageUrl("");
        const dt = result.data;
        alert(dt.statusMessage);
      })
      .catch((error) => {
        console.error("Error updating order status:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
        }
      });
  };

  return (
    <Fragment>
      <Header />
      <br></br>
      <div className="form-group col-md-12">
        <h3>All Orders</h3>
      </div>
      {data.length > 0 ? (
        <table
          className="table stripped table-hover mt-4"
          style={{ backgroundColor: "white", width: "80%", margin: "0 auto" }}
        >
          <thead className="thead-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Customer Name</th>
              <th scope="col">Order No</th>
              <th scope="col">Total</th>
              <th scope="col">Status</th>
              <th scope="col">Order Date</th>
              <th scope="col">Update Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((val, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{val.customerName}</td>
                <td onClick={() => handleItemDetail(val.id)}>
                  {val.orderNo}
                </td>
                <td>{val.orderTotal}</td>
                <td>{val.orderStatus}</td>
                <td>{val.createdOn}</td>
                <td>
                  <Button
                    variant="secondary"
                    onClick={() => handleOrderStatusDetail(val)}>
                    Update
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        "No data found"
      )}
      <div style={{ width: "100%" }}>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header>
            <Modal.Title>Order Details for : ({itemData.length > 0 ? itemData[0]["orderNo"] : ""})</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {itemData.length > 0 ? (
              <table className="table stripped table-hover mt-4">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Medicine Name</th>
                    <th scope="col">Manufacturer</th>
                    <th scope="col">Unit Price</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Total Price</th>
                    <th scope="col">Order Date</th>
                  </tr>
                </thead>
                <tbody>
                  {itemData.map((val, index) => (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{val.medicineName}</td>
                      <td>{val.manufacturer}</td>
                      <td>{val.unitPrice}</td>
                      <td>{val.quantity}</td>
                      <td>{val.totalPrice}</td>
                      <td>{val.createdOn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              "No data found"
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
      <div style={{ width: "100%" }}>
        <Modal show={showOrderStatus} onHide={handleCloseOrderStatus}>
          <Modal.Header>
            <Modal.Title>Update Order Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-6">
                <label>
                  Select Status
                </label>
                <select
                  id="orderStatus"
                  className="form-control"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}>
                  <option value="Cancel">Cancel</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={(e) => handleOrderStatus(e)}>
              Update Status
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Fragment>
  );
}
