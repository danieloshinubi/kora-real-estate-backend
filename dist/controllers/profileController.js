"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfile = exports.getProfileByUserId = void 0;
const Profile_1 = __importDefault(require("../models/Profile"));
const User_1 = __importDefault(require("../models/User"));
const node_1 = require("@novu/node");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: For managing user's profile
 */
const novuApiKey = process.env.NOVU_API_KEY;
if (!novuApiKey) {
    throw new Error('Novu API key is not defined');
}
const novuRoot = new node_1.Novu(novuApiKey);
/**
 * @swagger
 * /profile:
 *   post:
 *     summary: Create a new user profile with property preferences
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - propertyType
 *               - bedrooms
 *               - pets
 *               - minPrice
 *               - maxPrice
 *               - location
 *             properties:
 *               user:
 *                 type: string
 *                 description: The ID of the user for the profile
 *                 example: "60d5f7c9d7a2c943bf0ef12d"
 *               propertyType:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of property type IDs
 *                 example: ["60d5f7c9d7a2c943bf0ef13d"]
 *               bedrooms:
 *                 type: integer
 *                 description: The number of bedrooms in the property
 *                 example: 3
 *               pets:
 *                 type: integer
 *                 description: The number of pets allowed
 *                 example: 2
 *               minPrice:
 *                 type: number
 *                 description: The minimum price of the property
 *                 example: 100000
 *               maxPrice:
 *                 type: number
 *                 description: The maximum price of the property
 *                 example: 500000
 *               location:
 *                 type: object
 *                 required:
 *                   - longitude
 *                   - latitude
 *                 properties:
 *                   longitude:
 *                     type: number
 *                     description: The longitude of the property
 *                     example: 12.9716
 *                   latitude:
 *                     type: number
 *                     description: The latitude of the property
 *                     example: 77.5946
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Profile:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                       example: "60d5f7c9d7a2c943bf0ef12d"
 *                     propertyType:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["60d5f7c9d7a2c943bf0ef13d"]
 *                     bedrooms:
 *                       type: integer
 *                       example: 3
 *                     pets:
 *                       type: integer
 *                       example: 2
 *                     minPrice:
 *                       type: number
 *                       example: 100000
 *                     maxPrice:
 *                       type: number
 *                       example: 500000
 *                     location:
 *                       type: object
 *                       properties:
 *                         longitude:
 *                           type: number
 *                           example: 12.9716
 *                         latitude:
 *                           type: number
 *                           example: 77.5946
 *                 message:
 *                   type: string
 *                   example: "Profile created successfully"
 *       400:
 *         description: Bad request, missing required fields or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bad request, missing required fields or invalid input"
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
const createProfile = async (req, res) => {
    const { user, propertyType, bedrooms, pets, minPrice, maxPrice, location } = req.body;
    try {
        if (!user ||
            !propertyType ||
            !bedrooms ||
            !pets ||
            !minPrice ||
            !maxPrice ||
            !location) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        const existingProfile = await Profile_1.default.findOne({ user });
        if (existingProfile) {
            res.status(409).json({ message: 'User profile already exists' });
            return;
        }
        // Create a new profile
        const newProfile = new Profile_1.default({
            user,
            propertyType,
            bedrooms,
            pets,
            minPrice,
            maxPrice,
            location,
        });
        // Save the profile to the database
        const savedProfile = await newProfile.save();
        const foundUser = await User_1.default.findById({ _id: user });
        if (!foundUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Generate a verification token
        const token = jsonwebtoken_1.default.sign({ id: foundUser._id }, process.env.VERIFY_ACCOUNT_SECRET, { expiresIn: '2m' });
        const verificationLink = `${process.env.BACKEND_URL}/auth/user/verify-account/${token}`;
        // Send LINK to the user's email
        await novuRoot.trigger('kora-verify-account', {
            to: {
                subscriberId: foundUser._id.toString(),
                email: foundUser.email,
            },
            payload: {
                LINK: verificationLink,
            },
        });
        // Return the created profile
        res.status(201).json({
            message: 'Profile created successfully',
            profile: savedProfile,
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
exports.createProfile = createProfile;
/**
 * @swagger
 * /profile/{userId}:
 *   get:
 *     summary: Get a user profile by user ID
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose profile is to be fetched
 *         example: "60d5f7c9d7a2c943bf0ef12d"
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                       example: "60d5f7c9d7a2c943bf0ef12d"
 *                     propertyType:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["60d5f7c9d7a2c943bf0ef13d"]
 *                     bedrooms:
 *                       type: integer
 *                       example: 3
 *                     pets:
 *                       type: integer
 *                       example: 2
 *                     minPrice:
 *                       type: number
 *                       example: 100000
 *                     maxPrice:
 *                       type: number
 *                       example: 500000
 *                     location:
 *                       type: object
 *                       properties:
 *                         longitude:
 *                           type: number
 *                           example: 12.9716
 *                         latitude:
 *                           type: number
 *                           example: 77.5946
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile not found"
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
const getProfileByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const profile = await Profile_1.default.findOne({ user: userId });
        if (!profile) {
            res.status(404).json({ message: 'Profile not found' });
            return;
        }
        res.status(200).json({ profile });
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
exports.getProfileByUserId = getProfileByUserId;
