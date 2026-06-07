import { createContext, useContext, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMe,
  getGetMeQueryKey,
  useLogin,
  useRegister,
  useLogout,
  type AuthUser,
  type LoginRequest,
  type RegisterRequest,
} from "@workspace/api-client-react";

// Must match the key used in main.tsx for setAuthTokenGetter
const AUTH_TOKEN_KEY = "auth_token";

/**
 * The backend wraps every response in { success, message, data }.
 * For login/register the `data` payload is { user, token }.
 * The generated types don't capture the wrapper, so we cast at runtime.
 */
interface BackendAuthResponse {
  success?: boolean;
  message?: string;
  data?: {
    user?: AuthUser;
    token?: string;
  };
  // When the generated client strips the wrapper, the user fields may
  // exist directly on the object — handle both shapes defensively.
  token?: string;
}

function extractAndSaveToken(raw: unknown): void {
  const res = raw as BackendAuthResponse;
  // Shape 1: wrapped  → { data: { token } }
  // Shape 2: flat     → { token }
  const token = res?.data?.token ?? res?.token;
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (data: LoginRequest) => Promise<AuthUser>;
  register: (data: RegisterRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
      staleTime: 1000 * 60 * 5,
    },
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const invalidateMe = () =>
    queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });

  const login = async (data: LoginRequest): Promise<AuthUser> => {
    const result = await loginMutation.mutateAsync({ data });
    // Save the JWT token from the backend response into localStorage
    extractAndSaveToken(result);
    await invalidateMe();
    return result;
  };

  const register = async (data: RegisterRequest): Promise<AuthUser> => {
    const result = await registerMutation.mutateAsync({ data });
    // Save the JWT token from the backend response into localStorage
    extractAndSaveToken(result);
    await invalidateMe();
    return result;
  };

  const logout = async (): Promise<void> => {
    // Clear the stored token so future requests are unauthenticated
    localStorage.removeItem(AUTH_TOKEN_KEY);
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Even if the server logout call fails, we've already cleared
      // the local token so the user is effectively logged out.
    }
    queryClient.setQueryData(getGetMeQueryKey(), null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isLoggedIn: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
