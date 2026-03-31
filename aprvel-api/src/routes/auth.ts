import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { ID } from 'node-appwrite';

import {
  confirmEmailSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
  oauthSignInSchema,
} from '../schemas/auth';
import { verifyOidSchema } from '../schemas/verify-oid';

import { AUTH_COOKIE } from '../../constant';
import { createAdminClient, createPublicClient } from '../lib/appwrite';
import { sessionMiddleware } from '../lib/session-middleware';
import type { AppPreferences } from '../lib/types';
import { validate } from '../lib/validator';
import { verifyAndClaimOid } from '../services/oid-service';
import { createNotification } from '../services/notification-service';

const auth = new Hono();

// Determine Environment
const isProduction = process.env.NODE_ENV === 'production';

// SIGN IN (Email/Password)
auth.post('/signin', validate('json', signInSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });

    // DYNAMIC COOKIE SETTINGS
    setCookie(c, AUTH_COOKIE, session.secret, {
      path: '/',
      httpOnly: true,

      // If Production (HTTPS) -> true
      // If Development (HTTP) -> false
      secure: isProduction,

      // 'Lax' is better for local dev to avoid "SameSite" blocking on HTTP
      // 'Strict' or 'None' (with Secure) is better for Prod
      sameSite: isProduction ? 'strict' : 'lax',

      maxAge: 60 * 60 * 24 * 30, // 30 Days
    });

    const { users } = await createAdminClient();
    const user = await users.get<AppPreferences>({
      userId: session.userId,
    } as any); // Added `as any` to prevent TS errors if your SDK expects a string

    let status = 'active';
    if (!user.emailVerification) status = 'pending_email';
    else if (!user.prefs.approver_id) status = 'pending_oid';

    return c.json({
      success: true,
      status,
      session,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
        prefs: user.prefs,
        passwordUpdate: user.passwordUpdate,
      },
    });
  } catch (error: any) {
    if (error?.type === 'user_invalid_credentials' || error?.code === 401) {
      return c.json(
        { success: false, message: 'Invalid email or password' },
        401,
      );
    }
    console.error('Sign In Error:', error);
    return c.json(
      { success: false, message: 'An error occurred during sign in' },
      500,
    );
  }
});

// OAUTH SIGN IN (Google)
auth.post('/oauth-signin', validate('json', oauthSignInSchema), async (c) => {
  // Parsing manually to avoid needing a new Zod schema immediately
  const { userId, secret } = await c.req.json();

  if (!userId || !secret) {
    return c.json({ success: false, message: 'Missing OAuth parameters' }, 400);
  }

  try {
    const { account } = await createAdminClient();

    // Consume the temporary OAuth token to generate the permanent session
    const session = await account.createSession({
      userId,
      secret,
    });

    // DYNAMIC COOKIE SETTINGS
    setCookie(c, AUTH_COOKIE, session.secret, {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 Days
    });

    const { users } = await createAdminClient();

    // Fetch the authenticated user's details
    const user = await users.get<AppPreferences>({
      userId: session.userId,
    } as any);

    let status = 'active';
    if (!user.emailVerification) status = 'pending_email';
    else if (!user.prefs.approver_id) status = 'pending_oid';

    return c.json({
      success: true,
      status,
      session,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
        prefs: user.prefs,
        passwordUpdate: user.passwordUpdate,
      },
    });
  } catch (error: any) {
    console.error('OAuth Sign In Error:', error);
    return c.json(
      { success: false, message: 'Invalid or expired OAuth token' },
      401,
    );
  }
});

// SIGN OUT
auth.post('/signout', sessionMiddleware, async (c) => {
  const account = c.get('account');

  try {
    await account.deleteSession({
      sessionId: 'current',
    });

    // DELETE COOKIE (Match options with setCookie for consistency)
    deleteCookie(c, AUTH_COOKIE, {
      path: '/',
      secure: isProduction,
    });

    return c.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    return c.json({ success: false, message: 'Logout failed' }, 500);
  }
});

// GET CURRENT USER
auth.get('/user', sessionMiddleware, async (c) => {
  const user = c.get('user');

  try {
    let status = 'active';
    if (!user.emailVerification) status = 'pending_email';
    else if (!user.prefs.approver_id) status = 'pending_oid';

    return c.json({
      success: true,
      status, // 'active' | 'pending_email' | 'pending_oid'
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
        emailVerification: user.emailVerification,
        prefs: user.prefs,
        passwordUpdate: user.passwordUpdate,
      },
    });
  } catch (error: any) {
    return c.json({ success: false, message: 'Session invalid' }, 401);
  }
});

// SEND VERIFICATION EMAIL
auth.post(
  '/email-verification',
  sessionMiddleware,
  validate('json', verifyEmailSchema),
  async (c) => {
    const { url } = c.req.valid('json');
    const account = c.get('account');

    try {
      await account.createEmailVerification({
        url,
      });

      return c.json({
        success: true,
        message: 'Verification email sent.',
      });
    } catch (error: any) {
      if (error.code === 409) {
        return c.json(
          { success: false, message: 'Email is already verified.' },
          409,
        );
      }
      console.error('Email Verification Error:', error);
      return c.json({ success: false, message: 'Failed to send email.' }, 500);
    }
  },
);

// CONFIRM EMAIL
auth.put(
  '/email-verification',
  validate('json', confirmEmailSchema),
  async (c) => {
    const { userId, secret } = c.req.valid('json');

    try {
      const { account } = await createPublicClient();
      await account.updateEmailVerification({
        userId,
        secret,
      });

      const { users } = await createAdminClient();
      const user = await users.get({
        userId,
      } as any);

      return c.json({
        success: true,
        message: 'Email verified successfully.',
        user: {
          id: user.$id,
          emailVerification: user.emailVerification,
          prefs: user.prefs,
          passwordUpdate: user.passwordUpdate,
        },
      });
    } catch (error: any) {
      return c.json(
        { success: false, message: 'Invalid or expired verification link.' },
        400,
      );
    }
  },
);

// VERIFY OID
auth.post(
  '/verify-oid',
  sessionMiddleware,
  validate('json', verifyOidSchema),
  async (c) => {
    const { oid } = c.req.valid('json');
    const user = c.get('user');

    const secret =
      c.req.header('x-appwrite-session') || getCookie(c, AUTH_COOKIE) || '';

    try {
      if (!user.emailVerification) {
        return c.json({ success: false, message: 'Email not verified.' }, 403);
      }

      const result = await verifyAndClaimOid(oid, user.$id, secret);
      if (!result.success) return c.json(result, 400);

      const account = c.get('account');
      const updatedUser = await account.get();

      return c.json({
        success: true,
        message: 'Account verified.',
        user: {
          id: updatedUser.$id,
          prefs: updatedUser.prefs,
        },
      });
    } catch (error) {
      return c.json({ success: false, message: 'System error' }, 500);
    }
  },
);

// SIGN UP (Create Account + Auto Login)
auth.post('/signup', validate('json', signUpSchema), async (c) => {
  const { email, password, name } = c.req.valid('json');

  const { account } = await createAdminClient();

  try {
    // Create the User
    const user = await account.create({
      userId: ID.unique(),
      email: email,
      password: password,
      name: name,
    } as any);

    await createNotification({
      user_id: user.$id,
      title: 'Welcome Aboard!',
      message:
        "Welcome to Aprvel! 🎉 We're thrilled to have you join us. Your account has been successfully created and you're now logged in. Let's get started!",
      type: 'info',
    });

    // Auto-Login (Create Session immediately)
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });

    // Set the Session Cookie
    setCookie(c, AUTH_COOKIE, session.secret, {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 Days
    });

    // Return Success + User Data
    return c.json({
      success: true,
      message: 'Account created and logged in.',
      session,
      userId: user.$id,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
        emailVerification: user.emailVerification,
        prefs: user.prefs,
        passwordUpdate: user.passwordUpdate,
      },
    });
  } catch (error: any) {
    if (error?.type === 'user_already_exists' || error?.code === 409) {
      return c.json(
        { success: false, message: 'A user with this email already exists.' },
        409,
      );
    }
    console.error('Signup Error:', error);
    return c.json(
      { success: false, message: 'Registration failed. Please try again.' },
      500,
    );
  }
});

// FORGOT PASSWORD (Request Reset Link)
auth.post(
  '/forgot-password',
  validate('json', forgotPasswordSchema),
  async (c) => {
    const { email } = c.req.valid('json');

    try {
      const { account } = await createAdminClient();
      const frontendUrl = process.env.FRONTEND_URL || 'https://aprovel.gavellogistics.com';
      const resetUrl = `${frontendUrl}/reset-password`;

      await account.createRecovery({
        email,
        url: resetUrl,
      });

      return c.json({
        success: true,
        message: 'Password reset link sent to your email.',
      });
    } catch (error: any) {
      console.error('Forgot Password Error:', error);
      return c.json({
        success: true,
        message: 'Password reset link sent to your email.',
      });
    }
  },
);

// RESET PASSWORD (Confirm New Password)
auth.put(
  '/reset-password',
  validate('json', resetPasswordSchema),
  async (c) => {
    const { userId, secret, password } = c.req.valid('json');

    try {
      const { account } = await createPublicClient();
      await account.updateRecovery({
        userId,
        secret,
        password,
      });

      return c.json({
        success: true,
        message: 'Password reset successfully.',
      });
    } catch (error: any) {
      console.error('Reset Password Error:', error);
      return c.json(
        { success: false, message: 'Invalid or expired reset link.' },
        400,
      );
    }
  },
);

// CHANGE PASSWORD
auth.put(
  '/change-password',
  sessionMiddleware,
  validate('json', changePasswordSchema),
  async (c) => {
    const { password, oldPassword } = c.req.valid('json');
    const account = c.get('account');

    try {
      // Check if the user has a password set (passwordUpdate will be present/non-empty)
      const user = await account.get();
      if (!user.passwordUpdate) {
        return c.json(
          {
            success: false,
            message:
              'You cannot change your password as you logged in via OAuth.',
          },
          403,
        );
      }

      await account.updatePassword(password, oldPassword);

      return c.json({
        success: true,
        message: 'Password changed successfully.',
      });
    } catch (error: any) {
      console.error('Change Password Error:', error);
      if (error?.code === 401) {
        return c.json(
          { success: false, message: 'Invalid current password.' },
          401,
        );
      }
      return c.json(
        { success: false, message: 'Failed to change password.' },
        500,
      );
    }
  },
);

export default auth;
