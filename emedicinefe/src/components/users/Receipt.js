import React, { useEffect, useState, Fragment } from 'react';
import axios from "axios";
import { baseUrl } from "../constants";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const Receipt = () => {
  const { id } = useParams();

  const [itemData, setItemData] = useState([]);
  const [orderNo, setOrderNo] = useState('');
  const [orderTotal, setOrderTotal] = useState('');

  useEffect(() => {
    getData("UserItems", id);
  }, [id]);

  const getData = (type, orderId) => {
    const requestData = {
      ID: orderId,
      Type: type,
      Email: localStorage.getItem("username"),
      MedicineName: "",
      Manufacturer: "",
      UnitPrice: "",
      Quantity: "",
      TotalPrice: "",
      CreatedOn: "",
    };
    console.log("Request Data:", requestData);  // Debug: Log request data

    const url = `${baseUrl}/api/Medicines/orderList`;
    axios
      .post(url, requestData)
      .then((result) => {
        const data = result.data;
        console.log("Response Data:", data);  // Debug: Log response data
        if (data.statusCode === 200) {
          setOrderNo(data.listOrders[0].orderNo);
          setOrderTotal(data.listOrders[0].orderTotal);
          setItemData(data.listOrders);
        } else {
          console.error("Unexpected response structure", data);  // Debug: Log unexpected responses
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);  // Debug: Log errors
      });
  };

  const downloadPdfDocument = (rootElementId) => {
    const input = document.getElementById(rootElementId);
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'JPEG', 0, 0);
        pdf.save(`receipt_${orderNo}.pdf`);
      });
  };

  return (
    <Fragment>
      <button onClick={() => downloadPdfDocument("receiptContainer")}>Download PDF</button>
      <div id="receiptContainer" style={{
        backgroundColor: '#f5f5f5',
        width: '600px',
        margin: '20px auto',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }}>
        <h2>Order Receipt</h2>
        <p><b>Order No:</b> {orderNo}</p>
        <p><b>Order Total:</b> {orderTotal}</p>
        <hr />

        {itemData.length > 0 ? (
          <table className="table stripped table-hover mt-4">
            <thead className="thead-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Manufacturer</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Order Date</th>
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
                  <td>{new Date(val.createdOn).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No data found</p>
        )}
      </div>
    </Fragment>
  );
};

export default Receipt;
