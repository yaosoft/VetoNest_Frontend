import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

let globalSocket = null;
let globalListeners = [];

const getSocket = () => {
  if (!globalSocket) {
    const url = process.env.REACT_APP_SIGNALING_URL || 'https://vetonest.com';
    globalSocket = io(url, { transports: ['websocket', 'polling'] });
    globalSocket.on('connect', () => console.log('Presence socket connected'));
  }
  return globalSocket;
};

export const useOnlineUsers = () => {
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();
    const onUsers = (users) => {
      setOnlineUserIds(users);
    };
    socketRef.current.on('users-online', onUsers);
    return () => {
      socketRef.current.off('users-online', onUsers);
    };
  }, []);

  const isUserOnline = (userId) => onlineUserIds.includes(String(userId));

  return { onlineUserIds, isUserOnline };
};