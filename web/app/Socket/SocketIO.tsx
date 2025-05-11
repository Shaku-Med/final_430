'use client'
import React, { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import EventEmitter from '@/app/utils/eventEmitter'
import Cookies from 'js-cookie'
// 
interface SocketIOProps {
  serverUrl?: string;
  token?: string;
}

const SocketIO: React.FC<SocketIOProps> = ({ serverUrl = 'https://fluffy-trout-jp9gq54qr4xhq97x-3002.app.github.dev', token }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(serverUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      extraHeaders: {
        Authorization: `${token}`,
        id: Cookies.get('c_usr') ?? ''
      }
    });

    socketInstance.on('connect', () => {
    //   socketInstance.io.opts.extraHeaders = {
    //     Authorization: `${token}`
    //   };
      setIsConnected(true);
      console.log('Socket connected');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    const toggleAuth = (visibility: boolean) => {
      console.log('Auth visibility changed:', visibility);
    };

    EventEmitter.on('socket', toggleAuth);
    setSocket(socketInstance);

    return () => {
      EventEmitter.off('socket', toggleAuth);
      socketInstance.disconnect();
    };
  }, [serverUrl, token]);

  return null;
};

export default SocketIO;
