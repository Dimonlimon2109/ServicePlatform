import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from '../api/axiosInstance';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import {useAuth} from "../hooks/useAuth.ts";

interface ChatComponentProps {
    receiverId: string;
}

interface Message {
    senderId: string;
    receiverId: string;
    content: string;
    sentAt: string;
}

let socket: Socket;

const ChatComponent: React.FC<ChatComponentProps> = ({ receiverId }) => {
    const {user} = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Получение профиля и подключение сокета
    useEffect(() => {
        const fetchProfileAndChat = async () => {
            try {

                // Загрузка истории сообщений
                const chatRes = await axios.get(`/messages/chat/${receiverId}`);
                setMessages(chatRes.data);

                // Подключение к сокету
                socket = io('http://localhost:3000');
                socket.on('connect', () => {
                    socket.emit('register', user?.id);
                });

                socket.on('receive_message', (message: Message) => {
                    // Добавляем новое сообщение в конец
                    setMessages((prev) => [...prev, message]);
                });
            } catch (error) {
                console.error('Ошибка при инициализации чата:', error);
            }
        };

        fetchProfileAndChat();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [receiverId, user]); // Заново перезапускать, если receiverId изменится

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim()) return;

        const message: Message = {
            senderId: user.id,
            receiverId,
            content: input.trim(),
            sentAt: new Date().toISOString(),
        };

        socket.emit('send_message', message);
        setMessages((prev) => [...prev, message]);
        setInput('');
    };

    return (
        <Box>
            <Paper variant="outlined" sx={{ height: 400, overflowY: 'auto', p: 2, mb: 2 }}>
                <List>
                    {messages.map((msg, index) => (
                        <ListItem
                            key={index}
                            sx={{ justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start' }}
                        >
                            <Box
                                sx={{
                                    bgcolor: msg.senderId === user.id ? '#1976d2' : '#e0e0e0',
                                    color: msg.senderId === user.id ? '#fff' : '#000',
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    maxWidth: '70%',
                                }}
                            >
                                <ListItemText
                                    primary={<Typography>{msg.content}</Typography>}
                                    secondary={
                                        <Typography variant="caption">
                                            {new Date(msg.sentAt).toLocaleTimeString()}
                                        </Typography>
                                    }
                                />
                            </Box>
                        </ListItem>
                    ))}
                </List>
                <div ref={messagesEndRef} />
            </Paper>

            <Box display="flex" gap={1}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Введите сообщение..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <IconButton color="primary" onClick={sendMessage}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default ChatComponent;
