"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransaction = exports.createTransaction = void 0;
const node_1 = require("@novu/node");
const Transactions_1 = __importDefault(require("../models/Transactions"));
const User_1 = __importDefault(require("../models/User"));
const Listings_1 = __importDefault(require("../models/Listings"));
/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Transaction creation and history
 */
const novuApiKey = process.env.NOVU_API_KEY;
if (!novuApiKey) {
    throw new Error('Novu API key is not defined');
}
const novuRoot = new node_1.Novu(novuApiKey);
const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(date).toLocaleDateString('en-GB', options);
    // Add ordinal suffix to the day
    const day = new Date(date).getDate();
    const ordinal = ['th', 'st', 'nd', 'rd'][((day % 10) - 1 + 4) % 10] || 'th';
    return `${day}${ordinal} ${formattedDate.slice(2)}`;
};
const currentDate = new Date();
const billedDate = formatDate(currentDate);
/**
 * @swagger
 * /transaction:
 *   post:
 *     summary: Creates a new transaction
 *     tags: [Transaction]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: The ID of the user making the transaction
 *                 example: "64c9f8e3f12e4b73bced86d2"
 *               listing:
 *                 type: string
 *                 description: The ID of the listing being purchased
 *                 example: "65a2f7e5d9c8b174e2a4e1b9"
 *               location:
 *                 type: string
 *                 description: The location of the listing (optional)
 *                 example: "123 Main Street, New York"
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "transaction created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65b1f5e9d4a9c3e6a8f7d5c1"
 *                     user:
 *                       type: string
 *                       example: "64c9f8e3f12e4b73bced86d2"
 *                     listing:
 *                       type: string
 *                       example: "65a2f7e5d9c8b174e2a4e1b9"
 *       400:
 *         description: Bad request due to missing or invalid user or listing ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing userId or ListingId"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */
const createTransaction = async (req, res) => {
    const { user, listing, location } = req.body;
    try {
        if (!user && !listing) {
            res.status(400).json({ message: 'Missing userId or ListingId' });
            return;
        }
        const foundUser = await User_1.default.findById(user);
        if (!foundUser) {
            res.status(400).json({ message: 'User not found' });
            return;
        }
        const foundListing = await Listings_1.default.findById(listing);
        if (!foundListing) {
            res.status(400).json({ message: 'Listing not found' });
            return;
        }
        const newTransaction = new Transactions_1.default({
            user: user,
            listing: listing,
        });
        const savedTransaction = await newTransaction.save();
        await novuRoot.trigger('kora-transaction', {
            to: {
                subscriberId: foundUser._id.toString(),
                email: foundUser.email,
            },
            payload: {
                reservation_id: newTransaction._id,
                user_email: foundUser.email,
                listing_name: foundListing.name,
                listing_address: location || 'null',
                amount: foundListing.price,
                billed_date: billedDate,
            },
        });
        res.status(201).json({
            message: 'transaction created successfully',
            data: savedTransaction,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
        else {
            console.error('Unexpected error', error);
            res.status(500).json({
                message: 'Server error',
                error: 'An unexpected error occurred',
            });
        }
    }
};
exports.createTransaction = createTransaction;
/**
 * @swagger
 * /transaction/{userId}/{listingId}:
 *   get:
 *     summary: Retrieves a specific transaction
 *     tags: [Transaction]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user involved in the transaction
 *         example: "64c9f8e3f12e4b73bced86d2"
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the listing involved in the transaction
 *         example: "65a2f7e5d9c8b174e2a4e1b9"
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65b1f5e9d4a9c3e6a8f7d5c1"
 *                     user:
 *                       type: string
 *                       example: "64c9f8e3f12e4b73bced86d2"
 *                     listing:
 *                       type: string
 *                       example: "65a2f7e5d9c8b174e2a4e1b9"
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transaction not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred"
 */
const getTransaction = async (req, res) => {
    const { userId, listingId } = req.params;
    try {
        const transaction = await Transactions_1.default.findOne({
            user: userId,
            listing: listingId,
        });
        if (!transaction) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }
        res.status(200).json({ data: transaction });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
        else {
            console.error('Unexpected error', error);
            res.status(500).json({
                message: 'Server error',
                error: 'An unexpected error occurred',
            });
        }
    }
};
exports.getTransaction = getTransaction;
