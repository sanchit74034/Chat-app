import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/checkauth");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error?.response?.data || error.message);
      set({ authUser: null });
      get().disconnectSocket();
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      // Ensure data.fullname is used instead of fullName
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (file) => {
  set({ isUpdatingProfile: true });
  try {
    if (!file) throw new Error("No file selected");

    const formData = new FormData();
    formData.append("image", file); // must match backend upload.single("image")

    const res = await axiosInstance.put("/auth/update-profile-pic", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

    set({ authUser: res.data });
    toast.success("Profile updated successfully");
  } catch (error) {
    console.log("Error in update profile:", error);
    toast.error(error?.response?.data?.message || "Profile update failed");
  } finally {
    set({ isUpdatingProfile: false });
  }
},



  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: { userId: String(authUser._id) }, // force to string
    });
    newSocket.connect();

    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.off("getOnlineUsers");
      socket.disconnect();
    }
  },
}));
