import { useAuth } from "@clerk/nextjs";

export function useUser() {
  const { userId, getToken, signOut } = useAuth();

  return {
    user: {
      id: userId,
      firstName: '', // Clerk no proporciona firstName directamente, necesitarías obtenerlo de user metadata
      getToken,
      signOut
    }
  };
}
