import { io } from "socket.io-client";

export const socket = io("http://localhost:3000");

(window as any).socket = socket;