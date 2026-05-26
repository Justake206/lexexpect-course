class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = [];
    }

    connect() {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.log('Нет токена, WebSocket не подключён');
            return;
        }

        const wsUrl = `ws://127.0.0.1:8000/ws/notifications/?token=${token}`;
        
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('✅ WebSocket подключён');
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('📨 Получено:', data);
            this.listeners.forEach(listener => listener(data));
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket ошибка:', error);
        };

        this.socket.onclose = (event) => {
            console.log('WebSocket отключён, код:', event.code);
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }
}

export default new WebSocketService();