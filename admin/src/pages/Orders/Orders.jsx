import React from 'react'
import './Orders.css'
import { useState } from 'react'
import {toast} from "react-toastify"
import { useEffect } from 'react'
import axios from "axios"
import {assets} from "../../assets/assets"

const Orders = ({url}) => {

  const [orders,setOrders] = useState([]);
  
  const fetchAllOrders = async()=>{
    try {
      const response = await axios.get(url+"/api/order/list");
      if(response.data.success){
        setOrders(response.data.data);
        console.log("Orders data:", response.data.data);
        
        // Debug: Log each order's items
        response.data.data.forEach((order, index) => {
          console.log(`Order ${index}:`, order);
          console.log(`Order ${index} items:`, order.items);
        });
      }
      else{
        toast.error("Error fetching orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error fetching orders")
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.post(url + "/api/order/update-status", {
        orderId: orderId,
        status: newStatus
      });
      
      if (response.data.success) {
        toast.success("Order status updated successfully!");
        // Refresh the orders list
        fetchAllOrders();
      } else {
        toast.error(response.data.message || "Error updating order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Error updating order status");
    }
  }

  // Calculate total number of items in an order
  const getTotalItems = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  }
  
  useEffect(()=>{
    fetchAllOrders(); // Fixed: Added parentheses to call the function
  },[])
  
  return (
    <div className='order add'>
      <h3>Order Management</h3>
      <div className="order-list">
        {orders.map((order,index)=>(
          <div key={index} className="order-item">
            <div className="order-main-content">
              <div className="order-icon">
                <img src={assets.parcel_icon} alt="" />
                <span className="order-number">#{index + 1}</span>
              </div>
              <div className="order-details">
                <div className="order-header">
                  <h4>Order Details</h4>
                  <span className="total-items">Total Items: {getTotalItems(order.items)}</span>
                </div>
                <p className='order-item-food'>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item,itemIndex)=>{
                      if (itemIndex === order.items.length-1) {
                        return item.name +" x "+item.quantity
                      }
                      else{
                        return item.name +" x "+item.quantity +", "
                      }
                    })
                  ) : (
                    "No items found"
                  )}
                </p>
                <div className="order-info">
                  <p className='order-item-address'>
                    📍 {order.address?.street}, {order.address?.city}, {order.address?.state}
                  </p>
                  <p className='order-item-phone'>
                    📞 {order.address?.phone}
                  </p>
                  <p className='order-item-amount'>
                    💰 ${order.amount}
                  </p>
                </div>
              </div>
            </div>
            <div className="order-options">
              <div className='order-item-status'>
                <label>Status: </label>
                <select 
                  value={order.status || "Food Processing"} 
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  className="status-select"
                >
                  <option value="Food Processing">Food Processing</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div className="order-date">
                <span>Order Date: {new Date(order.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )
        )}
      </div>
      
    </div>
  )
}

export default Orders
