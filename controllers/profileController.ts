import Profile from '../models/Profile';
import User from '../models/User';
import { Request, Response } from 'express';
import { Novu } from '@novu/node';
import jwt from 'jsonwebtoken';

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: For managing user's profile
 */

const novuApiKey: string | undefined = process.env.NOVU_API_KEY;
if (!novuApiKey) {
  throw new Error('Novu API key is not defined');
}
const novuRoot = new Novu(novuApiKey);

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

const createProfile = async (req: Request, res: Response): Promise<void> => {
  const { user, propertyType, bedrooms, pets, minPrice, maxPrice, location } =
    req.body;

  try {
    if (
      !user ||
      !propertyType ||
      !bedrooms ||
      !pets ||
      !minPrice ||
      !maxPrice ||
      !location
    ) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const existingProfile = await Profile.findOne({ user });
    if (existingProfile) {
      res.status(409).json({ message: 'User profile already exists' });
      return;
    }

    // Create a new profile
    const newProfile = new Profile({
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

    const foundUser = await User.findById({ _id: user });

    if (!foundUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Generate a verification token
    const token = jwt.sign(
      { id: foundUser._id },
      process.env.VERIFY_ACCOUNT_SECRET as string,
      { expiresIn: '2m' }
    );

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
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    } else {
      console.error('Unexpected error', error);
      res.status(500).json({
        message: 'Server error',
        error: 'An unexpected error occurred',
      });
    }
  }
};

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

const getProfileByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;

  try {
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json({ profile });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    } else {
      console.error('Unexpected error', error);
      res.status(500).json({
        message: 'Server error',
        error: 'An unexpected error occurred',
      });
    }
  }
};

export { getProfileByUserId };

export { createProfile };
