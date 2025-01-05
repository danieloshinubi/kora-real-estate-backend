"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Profile_1 = __importDefault(require("../models/Profile"));
/**
 * @swagger
 * tags:
 *   name: User
 *   description: User details and all related fields
 */
/**
 * @swagger
 * /user:
 *   get:
 *     summary: Retrieve all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 64c9f8e3f12e4b73bced86d2
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: user@example.com
 *                   phoneNo:
 *                     type: string
 *                     example: "+1234567890"
 *                   roles:
 *                     type: object
 *                     properties:
 *                       User:
 *                         type: string
 *                         example: "User"
 *                   isVerified:
 *                     type: boolean
 *                     example: false
 *                   accountDisabled:
 *                     type: boolean
 *                     example: false
 *       404:
 *         description: No users found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No User found
 *                 status:
 *                   type: integer
 *                   example: 404
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 *                   example: An unexpected error occurred
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find();
        if (!users || users.length === 0) {
            res.status(404).json({ message: 'No User found', status: 404 });
            return;
        }
        res.status(200).json(users);
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
exports.getAllUsers = getAllUsers;
/**
 * @swagger
 * /user/{userId}:
 *   get:
 *     summary: Retrieve a specific user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the user
 *     responses:
 *       200:
 *         description: Successfully retrieved the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 64c9f8e3f12e4b73bced86d2
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: user@example.com
 *                     phoneNo:
 *                       type: string
 *                       example: "+1234567890"
 *                     roles:
 *                       type: object
 *                       properties:
 *                         User:
 *                           type: string
 *                           example: "User"
 *                     isVerified:
 *                       type: boolean
 *                       example: false
 *                     accountDisabled:
 *                       type: boolean
 *                       example: false
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *                 status:
 *                   type: integer
 *                   example: 404
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 *                   example: An unexpected error occurred
 */
const getUserById = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found', status: 404 });
            return;
        }
        res.status(200).json({ user });
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
exports.getUserById = getUserById;
/**
 * @swagger
 * /user/{userId}:
 *   delete:
 *     summary: Delete a specific user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the user
 *     responses:
 *       200:
 *         description: Successfully deleted the user and associated profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User and associated profile deleted successfully
 *                 status:
 *                   type: integer
 *                   example: 200
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *                 status:
 *                   type: integer
 *                   example: 404
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 *                   example: An unexpected error occurred
 */
const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        // Find the user by ID
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found', status: 404 });
            return;
        }
        // Find and delete the associated profile
        const profile = await Profile_1.default.findOneAndDelete({ user: userId });
        // Delete the user
        await User_1.default.findByIdAndDelete(userId);
        res.status(200).json({
            message: 'User and associated profile deleted successfully',
            status: 200,
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
exports.deleteUser = deleteUser;
