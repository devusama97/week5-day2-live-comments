// "use client";

// import { createContext, useContext, useEffect, useState, ReactNode } from "react";
// import { api } from "@/lib/axios";

// interface User {
//   id: string;
//   username: string;
//   email: string;
//   bio?: string;
//   profilePicture?: string;
//   followersCount: number;
//   followingCount: number;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<void>;
//   register: (username: string, email: string, password: string) => Promise<void>;
//   logout: () => void;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Always ensure token is set in axios headers
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     }
//   });

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//       api.get("/users/profile")
//         .then(response => {
//           console.log("User data from API:", response.data);
//           // Ensure we use _id as id for consistency
//           const userData = {
//             ...response.data,
//             id: response.data._id || response.data.id
//           };
//           setUser(userData);
//         })
//         .catch(() => {
//           // Don't logout on error
//         })
//         .finally(() => {
//           setLoading(false);
//         });
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const login = async (email: string, password: string) => {
//     const response = await api.post("/auth/login", { email, password });
//     const { token, user } = response.data;
    
//     localStorage.setItem("token", token);
//     api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     setUser(user);
//   };

//   const register = async (username: string, email: string, password: string) => {
//     await api.post("/auth/register", { username, email, password });
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     delete api.defaults.headers.common["Authorization"];
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, register, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }




"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/axios";

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  followersCount: number;
  followingCount: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Set token header once on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  // Load user profile on app start
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        const userData = {
          ...res.data,
          id: res.data._id || res.data.id,
        };
        setUser(userData);
      } catch (error) {
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
    } catch (error) {
      throw new Error("Login failed. Please check your credentials.");
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      await api.post("/auth/register", { username, email, password });
    } catch (error) {
      throw new Error("Registration failed.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
