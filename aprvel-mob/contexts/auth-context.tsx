import { apiFetch, SESSION_KEY } from "@/utils/api";
import { makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { openAuthSessionAsync } from "expo-web-browser";
import React, { createContext, useContext, useEffect, useState } from "react";
import { account, client, OAuthProvider } from "../lib/appwrite";
import { registerAppwritePushTarget } from "../utils/push-notifications";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerification: boolean;
  prefs: { approver_id?: string; permission?: string; avatar_url?: string };
  passwordUpdate?: string;
}

interface AuthContextType {
  user: User | null;
  status: "active" | "pending_email" | "pending_oid" | "unauthenticated";
  isLoading: boolean;
  signIn: (data: any) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  resendVerification: () => Promise<void>;
  verifyOid: (oid: string) => Promise<void>;
  confirmResetPassword: (data: any) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] =
    useState<AuthContextType["status"]>("unauthenticated");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (status === "active" && user) {
      registerAppwritePushTarget();
    }
  }, [status, user]);

  const loadUser = async () => {
    try {
      const token = await SecureStore.getItemAsync(SESSION_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const session = JSON.parse(token);
        client.setSession(session.secret || token);
      } catch (e) {
        client.setSession(token);
      }

      await checkAuthStatus();
    } catch (error) {
      console.error("Failed to load user", error);
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const res = await apiFetch("/api/user");
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setStatus(data.status);
      } else {
        await SecureStore.deleteItemAsync(SESSION_KEY);
        setUser(null);
        setStatus("unauthenticated");
      }
    } catch (error) {
      console.error("Failed to check auth status", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (credentials: any) => {
    const res = await apiFetch("/api/signin", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(data.session));
    client.setSession(data.session.secret || data.session);
    setUser(data.user);
    setStatus(data.status);
  };

  const signUp = async (credentials: any) => {
    const res = await apiFetch("/api/signup", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(data.session));
    client.setSession(data.session.secret || data.session);
    setUser(data.user);

    // Trigger verification email logic
    try {
      await apiFetch("/api/email-verification", {
        method: "POST",
        body: JSON.stringify({
          url: "https://aprovel.gavellogistics.com/verify",
        }), // Placeholder URL
      });
    } catch (e) {
      console.error("Failed to send verification email on signup", e);
    }

    setStatus("pending_email");
  };

  const signOut = async () => {
    try {
      await apiFetch("/api/signout", { method: "POST" });
    } catch (e) {
      console.error("Signout failed on server, clearing local anyway");
    }
    await SecureStore.deleteItemAsync(SESSION_KEY);
    client.setSession("");
    setUser(null);
    setStatus("unauthenticated");
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const customScheme = `appwrite-callback-${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;

      const isExpoGo = Constants.appOwnership === "expo";
      const redirectUri = makeRedirectUri({
        scheme: customScheme,
        ...(isExpoGo ? {} : { path: "callback" }),
      });
      console.log("Redirect URI:", redirectUri);

      const loginUrl = await account.createOAuth2Token({
        provider: OAuthProvider.Google,
        success: redirectUri,
        failure: redirectUri,
      });

      if (!loginUrl) throw new Error("Failed to start OAuth flow");

      const browserResult = await openAuthSessionAsync(
        loginUrl.toString(),
        redirectUri,
      );

      if (browserResult.type === "success" && browserResult.url) {
        const url = new URL(browserResult.url);
        const secret = url.searchParams.get("secret");
        const userId = url.searchParams.get("userId");

        if (!secret || !userId)
          throw new Error("Create OAuth2 token failed: Missing parameters");

        // STOP! Do not consume the token on the frontend!
        // Pass the temporary token to your backend so it can get the permanent cookie.
        const res = await apiFetch("/api/oauth-signin", {
          method: "POST",
          body: JSON.stringify({ userId, secret }),
        });

        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        // Save the permanent session generated by the backend (just like Email auth)
        await SecureStore.setItemAsync(
          SESSION_KEY,
          JSON.stringify(data.session),
        );
        client.setSession(data.session.secret || data.session);

        // Hydrate the user state
        await checkAuthStatus();
      } else {
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      setIsLoading(false);
      throw new Error(error.message || "Google Sign In Failed");
    }
  };

  const resetPassword = async (email: string) => {
    const res = await apiFetch("/api/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);
  };

  const confirmResetPassword = async ({
    userId,
    secret,
    password,
    passwordAgain,
  }: any) => {
    const res = await apiFetch("/api/reset-password", {
      method: "PUT",
      body: JSON.stringify({ userId, secret, password, passwordAgain }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message);
  };

  const resendVerification = async () => {
    const res = await apiFetch("/api/email-verification", {
      method: "POST",
      body: JSON.stringify({
        url: "https://aprovel.gavellogistics.com/verify",
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
  };

  const verifyOid = async (oid: string) => {
    const res = await apiFetch("/api/verify-oid", {
      method: "POST",
      body: JSON.stringify({ oid }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    // Refresh user status after verification
    await checkAuthStatus();
  };

  const changePassword = async (data: any) => {
    const res = await apiFetch("/api/change-password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isLoading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        resetPassword,
        checkAuthStatus,
        resendVerification,
        verifyOid,
        confirmResetPassword,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
