import User from '../models/User';
import { Request, Response } from 'express';
import ROLES_LIST from '../config/roles_list';
import { Novu } from '@novu/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and registration
 */

const novuApiKey: string | undefined = process.env.NOVU_API_KEY;
if (!novuApiKey) {
  throw new Error('Novu API key is not defined');
}
const novuRoot = new Novu(novuApiKey);

interface IUser {
  email: string;
  password: string;
  phoneNo: string;
  roles: {
    User: number;
    Admin?: number;
  };
  otp?: string | null;
  isVerified: boolean;
  accountDisabled: boolean;
}

/**
 * @swagger
 * /auth/user/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - phoneNo
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               phoneNo:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       201:
 *         description: Sign-up completed successfully
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
 *                 message:
 *                   type: string
 *                   example: Sign-up completed
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bad request
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User already exists
 *                 status:
 *                   type: integer
 *                   example: 409
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

const handleNewUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password, phoneNo } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }],
    });

    if (existingUser) {
      res.status(409).json({ message: 'User already exists', status: 409 });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User<IUser>({
      email,
      password: hashedPassword,
      phoneNo,
      roles: { User: ROLES_LIST.User },
      isVerified: false,
      accountDisabled: false,
      otp: null,
    });

    // Save user to the database
    const savedUser = await newUser.save();

    res.status(201).json({ user: savedUser, message: 'Sign-up completed' });
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
 * /auth/user/verify-account/{token}:
 *   get:
 *     summary: Verify user account
 *     tags: [Auth]
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         description: Verification token sent to the user's email
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Successfully verified the account and redirected to the login page
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
 *       500:
 *         description: Server error occurred during account verification
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

const verifyAccount = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { token } = req.params;

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.VERIFY_ACCOUNT_SECRET as string
    );

    // Find the user by ID
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the user's account
    user.isVerified = true;
    await user.save();

    // Redirect to login page or return a success message
    return res.status(302).redirect(`${process.env.FRONTEND_URL}/login`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: 'Server error', error: error.message });
    } else {
      console.error('Unexpected error', error);
      return res.status(500).json({
        message: 'Server error',
        error: 'An unexpected error occurred',
      });
    }
  }
};

/**
 * @swagger
 * /auth/user/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 64c9f8e3f12e4b73bced86d2
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [ "user", "admin" ]
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 *       403:
 *         description: Account not verified or disabled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account not verified
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

const handleLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check if account is verified
    if (!user.isVerified) {
      res.status(403).json({ message: 'Account not verified' });
      return;
    }

    // Check if account is disabled
    if (user.accountDisabled) {
      res.status(403).json({ message: 'Account disabled' });
      return;
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate a token
    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '3h' }
    );

    const maxAge = 24 * 60 * 60;
    res.cookie('accessToken', token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
      sameSite: 'none',
      secure: true,
      partitioned: true,
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken: token,
      user: user,
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
 * /auth/user/forgotpassword:
 *   post:
 *     summary: Request a password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: password reset token sent
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

const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    // check if user already exists
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const resetToken = Math.floor(10000 + Math.random() * 90000).toString();

    user.otp = resetToken;

    await user.save();

    await novuRoot.trigger('kora-forgot-password', {
      to: {
        subscriberId: user._id.toString(),
        email: email,
      },
      payload: {
        OTP: resetToken,
      },
    });

    res.status(200).json({ message: 'password reset token sent' });
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
 * /auth/user/resetpassword:
 *   post:
 *     summary: Reset a user's password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: 12345
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password has been changed successfully.
 *       400:
 *         description: Invalid email or OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email
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

const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid email' });
      return;
    }

    if (otp !== user.otp) {
      res.status(400).json({ message: 'Invalid otp' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    await user.save();

    res.json({ message: 'Password has been changed successfully.' });
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

export {
  handleNewUser,
  verifyAccount,
  handleLogin,
  forgotPassword,
  resetPassword,
};
