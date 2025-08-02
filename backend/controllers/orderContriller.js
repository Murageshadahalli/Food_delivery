import { CurrencyCodes } from "validator/lib/isISO4217.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPEA_SECRET_KEY)


//placing user order for frontend
const placeOrder = async (req,res) =>{
    const frontend_url = "http://localhost:5174";

    try {
        const newOrder = new orderModel({
            userId:req.userId,
            items:req.body.items,
            amount:req.body.amount,
            address:req.body.address
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});
        const line_items = req.body.items.map((item)=>({
            price_data:{
                currency:"inr",
                product_data:{
                    name:item.name
                },
                unit_amount:item.price*100*80
            },
            quantity:item.quantity
        }))

        line_items.push({
            price_data:{
                currency:"inr",
                product_data:{
                    name:"Delivery Charges"
                },
                unit_amount:2*100*80
            },
            quantity:1
        })

        const session = await stripe.checkout.sessions.create({
            line_items:line_items,
            mode:"payment",
            success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`

        })
        res.json({success:true,session_url:session.url})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
        
    }
}
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body; // Fix: get success from body
    try {
        if (success == "true") {
            await orderModel.findByIdAndUpdate(orderId, { Payment: true }); // Fix: use capital P
            res.json({ success: true, message: "paid" });
        } else {
            await orderModel.findByIdAndUpdate(orderId);
            res.json({ success: false, message: " Not Paid" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}
 const userOrders = async (req, res) => {
    try {
        const userId = req.userId; // ✅ from authMiddleware
        const orders = await orderModel.find({ userId }); // ✅ simple and clean
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching user orders" });
    }
};

//listing orders for admin panel
const listOrders = async(req,res)=>{
    try {
        const orders = await orderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
        
    }

}

//update order status for admin
const updateOrderStatus = async(req,res)=>{
    try {
        const {orderId, status} = req.body;
        
        // Validate status options
        const validStatuses = ["Food Processing", "Out for Delivery", "Delivered"];
        if (!validStatuses.includes(status)) {
            return res.json({success: false, message: "Invalid status"});
        }
        
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId, 
            {status: status}, 
            {new: true}
        );
        
        if (!updatedOrder) {
            return res.json({success: false, message: "Order not found"});
        }
        
        res.json({success: true, data: updatedOrder, message: "Order status updated successfully"});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error updating order status"});
    }
}

export {placeOrder, verifyOrder,userOrders,listOrders,updateOrderStatus}