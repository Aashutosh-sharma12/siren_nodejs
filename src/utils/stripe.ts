// import userModel from "@models/user";
// import { NextFunction, Response } from "express";
// import { CustomError } from "./errors";
// import messages from "@Custom_message/index";
// import { StatusCodes } from "http-status-codes";

// const stripeKey = process.env.STRIPE_KEY;
// const stripe = require('stripe')(stripeKey);
// const createCustomer = async (data: any) => {
//     try {
//         const { name, email, phoneNumber, countryCode } = data;
//         // See your keys here: https://dashboard.stripe.com/apikeys
//         const customer = await stripe.customers.create({
//             name: name,
//             email: email,
//             phone: countryCode + "" + phoneNumber
//         });
//         console.log(customer, "customer");
//         return customer;
//     } catch (err) {
//         return err;
//     }
// }
// // createCustomer({ name: "test", email: "test@gmail.com" })
// const deleteCustomer = async (data: any) => {
//     try {
//         const { customerId } = data;
//         const deleted = await stripe.customers.del(customerId);
//         return deleted;
//     } catch (err) {
//         return err;
//     }
// }

// //Used for: Sending money out from your Stripe account (outgoing money)
// const createPayout = async (req: any, res: Response, next: NextFunction) => {
//     try {
//         const { amount, currency, method, source_type, customerId } = req.body;
//         const findUserDetails = await userModel.findOne({ customerId: customerId }, { name: 1, email: 1, phoneNumber: 1, countryCode: 1 });
//         if (!findUserDetails) {
//             throw new CustomError(messages.userNotFound_withEmail, StatusCodes.BAD_REQUEST);
//         }
//         const payout = await stripe.payouts.create({
//             amount: amount,
//             currency: currency ? currency : 'usd',
//             method: method,
//             source_type: source_type,
//             metadata: {
//                 customerId: customerId,
//                 userId: findUserDetails._id,
//                 email: findUserDetails.email,
//                 name: findUserDetails.name,
//                 phoneNumber: findUserDetails.phoneNumber
//             }
//         });
//     } catch (err) {
//         next(err);
//     }
// }

// const payment_intent = async (data: any) => {
//     try {
//         const { amount, currency, userId } = data;
//         const findUserDetails = await userModel.findOne({ _id: userId }, { name: 1, email: 1, stripeId: 1, phoneNumber: 1, countryCode: 1 });
//         if (!findUserDetails) {
//             throw new CustomError(messages.userNotFound_withEmail, StatusCodes.BAD_REQUEST);
//         }
//         const paymentIntent: any = await stripe.paymentIntents.create({
//             amount: amount,
//             currency: currency ? currency : 'usd',
//             // method: method,
//             customer: findUserDetails.stripeId,
//             automatic_payment_methods: {
//                 enabled: true,
//             },
//             metadata: {
//                 customerId: findUserDetails.stripeId,
//                 userId: userId,
//                 email: findUserDetails.email,
//                 name: findUserDetails.name,
//                 phoneNumber: findUserDetails.phoneNumber
//             }
//         });
//         const res_obj = {
//             paymentId: paymentIntent.id,
//             object: paymentIntent.object,
//             amount: paymentIntent.amount,
//             capture_method: paymentIntent.capture_method,
//             client_secret: paymentIntent.client_secret,
//             currency: paymentIntent.currency,
//             metadata: paymentIntent.metadata,
//             livemode: paymentIntent.livemode,
//             status: paymentIntent.status,

//         }
//         return res_obj;
//     } catch (err) {
//         throw (err);
//     }
// }

// export default {
//     createCustomer,
//     deleteCustomer,
//     createPayout,
//     payment_intent
// } as const;