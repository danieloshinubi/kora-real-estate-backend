import request from 'supertest';
import app from '../../server';
import User from '../../models/User';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../models/User');
jest.mock('jsonwebtoken');

/* Signup route */
describe('POST /auth/user/signup', () => {
  /* Increase timeout for tests */
  jest.setTimeout(30000);

  // Clean up mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  /* user already exists */
  it('should return 409 if user already exists', async () => {
    User.findOne = jest.fn().mockResolvedValue({
      email: 'user@example.com',
      password: 'Correctpassword123!',
      phoneNo: '08155668282',
    });

    const res = await request(app).post('/auth/user/signup').send({
      email: 'user@example.com',
      password: 'NewPassword123!',
      phoneNo: '08155668282',
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('User already exists');
    expect(res.body.status).toBe(409);
  });

  /* signup successfull */
  it('should return 201 if user signup is successful', async () => {
    const hashedPassword = 'hashedPassword123!';
    bcrypt.hash = jest.fn().mockResolvedValue(hashedPassword);

    // Mock User.findOne to simulate the user not existing yet
    User.findOne = jest.fn().mockResolvedValue(null);

    // Mock User.save to simulate saving a new user
    User.prototype.save = jest.fn().mockResolvedValue({
      email: 'user@example.com',
      password: hashedPassword,
      phoneNo: '08155668282',
    });

    // Send a request to the signup route
    const res = await request(app).post('/auth/user/signup').send({
      email: 'user@example.com',
      password: 'Correctpassword123!',
      phoneNo: '08155668282',
    });

    // Asserting the response status and message
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Sign-up completed');
    expect(res.body.user.email).toBe('user@example.com');
    expect(res.body.user.phoneNo).toBe('08155668282');
    expect(res.body.user.password).not.toBe('Correctpassword123!');
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(User.prototype.save).toHaveBeenCalledTimes(1);
  });
});

/* Verify account route */
describe('POST /auth/user/verify/:token', () => {
  const mockToken = 'mockedToken123';
  const mockDecoded = { id: '12345' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* User not found */
  it('should return 404 if the user is not found', async () => {
    jwt.verify = jest.fn().mockReturnValue(mockDecoded);

    // Mock User.findById to return null (user not found)
    User.findById = jest.fn().mockResolvedValue(null);

    const res = await request(app).get(
      `/auth/user/verify-account/${mockToken}`
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  /* Successful verification and redirection */
  it('should return a redirect to the login page when user is verified', async () => {
    jwt.verify = jest.fn().mockReturnValue(mockDecoded);

    // Mock User.findById to return a valid user
    User.findById = jest.fn().mockResolvedValue({
      _id: '12345',
      isVerified: false,
      save: jest.fn(),
    });

    // Mock res.redirect to verify redirection
    const res = await request(app).get(
      `/auth/user/verify-account/${mockToken}`
    );

    expect(res.status).toBe(302);
    expect(res.header['location']).toBe(`${process.env.FRONTEND_URL}/login`);
  });

  /* Error handling - Invalid token */
  it('should return 500 if an error occurs during verification', async () => {
    // Simulate jwt verification failure
    jwt.verify = jest.fn().mockImplementation(() => {
      throw new Error('Token verification failed');
    });

    const res = await request(app).get(
      `/auth/user/verify-account/${mockToken}`
    );

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
    expect(res.body.error).toBe('Token verification failed');
  });
});

/* login route */
describe('POST /auth/user/login', () => {
  /* Increase timeout for tests */
  jest.setTimeout(30000);

  // Clean up mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  /* login successfull */
  it('should log in the user successfully', async () => {
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    // Mock User.findOne to return a user object
    User.findOne = jest.fn().mockResolvedValue({
      email: 'user@example.com',
      password: 'hashedPassword',
      isVerified: true,
      accountDisabled: false,
      _id: 'userId123',
    });

    // Mock the jwt.sign to return a mocked token
    jwt.sign = jest.fn().mockReturnValue('mockedAccessToken123');

    // Make the request to the login route
    const res = await request(app).post('/auth/user/login').send({
      email: 'user@example.com',
      password: 'CorrectPassword123!',
    });

    // Test the response
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.accessToken).toBe('mockedAccessToken123');
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('user@example.com');
  });

  /* user sends wrong password */
  it('should return 400 for incorrect password', async () => {
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    User.findOne = jest.fn().mockResolvedValue({
      email: 'user@example.com',
      password: 'hashedPassword',
      isVerified: true,
      accountDisabled: false,
    });

    const res = await request(app).post('/auth/user/login').send({
      email: 'user@example.com',
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid email or password');
  });

  /* user sends wrong email */
  it('should return 400 if user is not found', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);

    const res = await request(app).post('/auth/user/login').send({
      email: 'user@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid email or password');
  });

  /* checks if email and password fields are filled */
  it('should return 400 if the fields are not filled', async () => {
    const res = await request(app).post('/auth/user/login').send({
      email: '',
      password: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });

  /* user account not verified */
  it('should return 403 if the user account is not verified', async () => {
    User.findOne = jest.fn().mockResolvedValue({
      email: 'user@example.com',
      password: 'hashedPassword',
      isVerified: false,
      accountDisabled: false,
      comparePassword: jest.fn().mockResolvedValue(true),
    });

    const res = await request(app).post('/auth/user/login').send({
      email: 'user@example.com',
      password: 'CorrectPassword123!',
    });

    // Assertions
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Account not verified');
  });

  /* user account is disabled */
  it('should return 403 if user account is disabled', async () => {
    User.findOne = jest.fn().mockResolvedValue({
      email: 'user@example.com',
      password: 'hashedPassword',
      isVerified: true,
      accountDisabled: true,
      comparePassword: jest.fn().mockResolvedValue(true),
    });

    const res = await request(app).post('/auth/user/login').send({
      email: 'user@example.com',
      password: 'CorrectPassword123!',
    });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Account disabled');
  });
});

// describe('POST /auth/user/resetpassword', () => {
//   it('should reset the password successfully', async () => {
//     User.findOne = jest.fn().mockResolvedValue({
//       email: 'user@example.com',
//       otp: '12345',
//       save: jest.fn(),
//     });

//     const res = await request(app).post('/auth/user/resetpassword').send({
//       email: 'user@example.com',
//       otp: '12345',
//       newPassword: 'NewPassword123!',
//     });

//     expect(res.status).toBe(200);
//     expect(res.body.message).toBe('Password has been changed successfully.');
//   });

//   it('should return 400 for invalid email', async () => {
//     User.findOne = jest.fn().mockResolvedValue(null);

//     const res = await request(app).post('/auth/user/resetpassword').send({
//       email: 'wrong@example.com',
//       otp: '12345',
//       newPassword: 'NewPassword123!',
//     });

//     expect(res.status).toBe(400);
//     expect(res.body.message).toBe('Invalid email');
//   });
// });

afterAll(async () => {
  await mongoose.connection.close();
});
