import User from "../models/user.model.js";
import Transaction from "../models/transcation.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// const {RAZORPAY_ID_KEY,RAZORPAY_SECRET_KEY}=process.env;
const razorpay = new Razorpay({
  key_id: "rzp_test_klizSuH9gYSnG6",
  key_secret: "1pIqepadp3v2lF6DMyuks9lV",
});

export const addMoney = async (req, res) => {
  let newTransaction;
  try {
    const { amount } = req.body;
    const userId = req.id;
    // console.log(userId);

    if (!amount || amount <= 999) {
      return res
        .status(400)
        .json({ message: "Invalid amount(Minimum deposit is 1000 rs." });
    }

    const user = await User.findById(userId);

    let walletBalance = user.walletBalance;
    // let parsedAmount=null;
    // if (typeof amount === 'string') {
    //     parsedAmount = Number(amount);
    //     if (isNaN(parsedAmount)) {
    //         return res.status(400).json({ message: 'Invalid amount format' });
    //     }
    //     req.body.amount = parsedAmount; // Convert amount to number
    // }

    // const finalAmount = req.body.amount;
    // console.log(typeof finalAmount);
    // console.log(typeof walletBalance);

    newTransaction = new Transaction({
      userId: user._id,
      transactionType: "Add Balance",
      amount: amount,
      walletBalanceBefore: walletBalance,
      walletBalanceAfter: walletBalance + amount,
      status: "Pending", // Initially pending
    });

    await newTransaction.save();

    // Create Razorpay Order
    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `rcptid_${newTransaction._id}`, // Unique receipt ID for this transaction
    };

    const order = await razorpay.orders.create(options);
    if (!order) {
      return res
        .status(400)
        .json({ message: "Failed to create Razorpay order" });
    }

    // Simulate payment process (in real scenario, integrate with payment gateway)
    // e.g. const paymentStatus = await razorpayPayment(...);
    // Assume payment is successful here

    // Update the user's wallet balance
    // user.walletBalance += amount;

    // // Save the updated user document
    // await user.save();

    // // Update the transaction status to 'Completed'
    // newTransaction.status = 'Completed';
    // await newTransaction.save();

    // return res.status(200).json({
    //     message: 'Money added to wallet successfully',
    //     walletBalance: user.walletBalance,
    //     transaction: newTransaction,
    // });
    // Send order info to the frontend
    return res.status(200).json({
      key: process.env.RAZORPAY_ID_KEY,
      orderId: order.id,
      order: order,
      amount: order.amount,
      transactionId: newTransaction._id
    });
  } catch (error) {
    console.error("Error adding money to wallet:", error);

    // If transaction creation was successful but something else failed, mark it as 'Failed'
    if (newTransaction) {
      newTransaction.status = "Failed";
      await newTransaction.save();
    }

    return res
      .status(500)
      .json({ message: "Server error. Transaction failed." });
  }
};

export const verifyPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount,transaction_id } = req.body;
  // console.log(req.body);
  // console.log(transaction_id);
  // console.log(razorpay_payment_id, razorpay_order_id, razorpay_signature,amount);
  let transaction = await Transaction.findOne({
    _id: transaction_id,
    status: "Pending",
  });
  if (!transaction) {
    return res
      .status(404)
      .json({ message: "Transaction not found or already processed" });
  }
  if(!razorpay_payment_id || !razorpay_order_id || razorpay_signature){
    transaction.status = "Failed";
      await transaction.save();
      return res.status(400).json({ message: "Transcation failed,HAHAHAHA" });

  }
  // console.log(transaction);
  // console.log(razorpay_signature, process.env.RAZORPAY_SECRET_KEY);
  try {
    // Step 1: Verify signature to ensure payment is legitimate
    // const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
    // shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    // const digest = shasum.digest("hex");

    // if (digest !== razorpay_signature) {
    //   return res.status(400).json({ message: "Invalid payment signature" });
    // }
    // console.log(digest === razorpay_signature);


    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest.trim() !== razorpay_signature.trim()) {
      transaction.status = "Failed";
      await transaction.save();
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Step 2: Check Payment Status from Razorpay API
    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (razorpayPayment.status !== 'captured') {
      transaction.status = "Failed";
      await transaction.save();
      return res.status(400).json({ message: "Payment failed or not captured" });
    }

   

    // Step 3: Update user's wallet balance
    const user = await User.findById(transaction.userId);
    user.walletBalance += amount;
    await user.save();

    // Step 4: Mark transaction as completed
    transaction.status = "Completed";
    await transaction.save();

    return res
      .status(200)
      .json({
        message: "Payment verified and wallet updated",
        walletBalance: user.walletBalance,
      });
  } catch (error) {
    transaction.status = "Failed";
    await transaction.save();
    
    return res
      .status(500)  
      .json({ message: "Server error. Transaction failed." });
  }
};

export const clearMoney = async (req, res) => {
  try {
    const userId = req.id;
    let user = await User.findById(userId);

    let walletBalance = user.walletBalance;
    walletBalance = 0;
    user.walletBalance = walletBalance;
    await user.save();
    // console.log(process.env.RAZORPAY_ID_KEY,process.env.RAZORPAY_SECRET_KEY);

    return res.status(200).json({
      message: "Wallet clear successfully",
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    console.log(error);
  }
};
