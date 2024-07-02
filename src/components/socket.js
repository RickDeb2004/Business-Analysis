import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // Change this to your server URL
export const socket = io(SOCKET_URL);
