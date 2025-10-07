// craftGPT - Main JavaScript with Offline Chat History Storage & Backend Integration

// ============================================================================
// STORAGE MANAGER - Handles all localStorage operations
// ============================================================================
class ChatStorageManager {
    constructor() {
        this.storageKey = 'craftgpt_chats';
        this.currentChatKey = 'craftgpt_current_chat';
        this.initStorage();
    }

    initStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    generateChatId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getAllChats() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || [];
        } catch (e) {
            console.error('Error reading chats:', e);
            return [];
        }
    }

    getCurrentChatId() {
        return localStorage.getItem(this.currentChatKey);
    }

    setCurrentChatId(chatId) {
        localStorage.setItem(this.currentChatKey, chatId);
    }

    getChat(chatId) {
        const chats = this.getAllChats();
        return chats.find(chat => chat.id === chatId);
    }

    createChat(firstMessage) {
        const chatId = this.generateChatId();
        const chat = {
            id: chatId,
            title: this.generateTitle(firstMessage),
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const chats = this.getAllChats();
        chats.unshift(chat); // Add to beginning
        localStorage.setItem(this.storageKey, JSON.stringify(chats));
        this.setCurrentChatId(chatId);
        return chat;
    }

    generateTitle(message) {
        // Take first 50 characters of the message as title
        const title = message.trim().substring(0, 50);
        return title.length < message.length ? title + '...' : title;
    }

    updateChat(chatId, messages) {
        const chats = this.getAllChats();
        const chatIndex = chats.findIndex(chat => chat.id === chatId);
        
        if (chatIndex !== -1) {
            chats[chatIndex].messages = messages;
            chats[chatIndex].updatedAt = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(chats));
            return true;
        }
        return false;
    }

    renameChat(chatId, newTitle) {
        const chats = this.getAllChats();
        const chatIndex = chats.findIndex(chat => chat.id === chatId);
        
        if (chatIndex !== -1) {
            chats[chatIndex].title = newTitle;
            chats[chatIndex].updatedAt = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(chats));
            return true;
        }
        return false;
    }

    deleteChat(chatId) {
        const chats = this.getAllChats();
        const filteredChats = chats.filter(chat => chat.id !== chatId);
        localStorage.setItem(this.storageKey, JSON.stringify(filteredChats));
        
        // If deleted chat was current, clear current
        if (this.getCurrentChatId() === chatId) {
            localStorage.removeItem(this.currentChatKey);
        }
        return true;
    }

    clearAllChats() {
        localStorage.setItem(this.storageKey, JSON.stringify([]));
        localStorage.removeItem(this.currentChatKey);
        return true;
    }

    exportChats() {
        return JSON.stringify(this.getAllChats(), null, 2);
    }

    importChats(jsonData) {
        try {
            const chats = JSON.parse(jsonData);
            if (Array.isArray(chats)) {
                localStorage.setItem(this.storageKey, JSON.stringify(chats));
                return true;
            }
        } catch (e) {
            console.error('Error importing chats:', e);
        }
        return false;
    }
}

// ============================================================================
// MAIN APP - Chat Interface Manager
// ============================================================================
class ChatApp {
    constructor() {
        this.storage = new ChatStorageManager();
        this.api = new window.APIService();
        this.currentChatId = null;
        this.currentMessages = [];
        
        // DOM Elements
        this.form = document.getElementById('chatForm');
        this.input = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebar = document.getElementById('sidebar');
        this.welcomeSection = document.getElementById('welcomeSection');
        this.promptButtons = document.querySelectorAll('.prompt-button');
        this.micBtn = document.getElementById('micBtn');
        this.conversationList = document.getElementById('conversationList');
        
        // File upload elements
        this.fileInput = document.getElementById('fileInput');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.removeFileBtn = document.getElementById('removeFileBtn');
        this.selectedFile = null;
        
        // Voice recognition
        this.isRecording = false;
        this.recognition = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupVoiceRecognition();
        this.loadChatHistory();
        this.loadCurrentChat();
    }

    setupEventListeners() {
        // Mobile menu toggle
        this.menuToggle.addEventListener('click', () => {
            this.sidebar.classList.toggle('active');
            this.menuToggle.classList.toggle('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!this.sidebar.contains(e.target) && !this.menuToggle.contains(e.target)) {
                    this.sidebar.classList.remove('active');
                    this.menuToggle.classList.remove('active');
                }
            }
        });

        // Prompt buttons
        this.promptButtons.forEach(button => {
            button.addEventListener('click', () => {
                const prompt = button.getAttribute('data-prompt');
                this.input.value = prompt;
                this.input.focus();
                this.autoResizeTextarea();
            });
        });

        // New chat button
        this.newChatBtn.addEventListener('click', () => {
            this.startNewChat();
        });

        // File upload
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.removeFileBtn.addEventListener('click', () => this.removeFile());

        // Auto-resize textarea
        this.input.addEventListener('input', () => this.autoResizeTextarea());

        // Send message
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.input.value = transcript;
                this.autoResizeTextarea();
                this.input.focus();
            };

            this.recognition.onend = () => {
                this.isRecording = false;
                this.micBtn.classList.remove('recording');
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isRecording = false;
                this.micBtn.classList.remove('recording');
                if (event.error === 'not-allowed') {
                    alert('Microphone access denied. Please enable microphone permissions.');
                }
            };

            this.micBtn.addEventListener('click', () => {
                if (this.isRecording) {
                    this.recognition.stop();
                } else {
                    this.recognition.start();
                    this.isRecording = true;
                    this.micBtn.classList.add('recording');
                }
            });
        } else {
            this.micBtn.style.display = 'none';
        }
    }

    autoResizeTextarea() {
        this.input.style.height = 'auto';
        this.input.style.height = Math.min(this.input.scrollHeight, 200) + 'px';
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size exceeds 5MB. Please choose a smaller file.');
            this.fileInput.value = '';
            return;
        }

        this.selectedFile = file;
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        this.fileInfo.style.display = 'flex';
    }

    removeFile() {
        this.selectedFile = null;
        this.fileInput.value = '';
        this.fileInfo.style.display = 'none';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    async handleSubmit(e) {
        e.preventDefault();
        const message = this.input.value.trim();
        if (!message) return;

        // Create new chat if this is the first message
        if (!this.currentChatId) {
            const chat = this.storage.createChat(message);
            this.currentChatId = chat.id;
            this.loadChatHistory();
        }

        // Hide welcome section
        if (this.welcomeSection) {
            this.welcomeSection.classList.add('hidden');
        }

        // Add user message
        this.addMessage(message, 'user');
        this.input.value = '';
        this.input.style.height = 'auto';

        // Disable input while processing
        this.setInputState(false);

        // Save to storage
        this.saveCurrentChat();

        // Show typing indicator
        const typingIndicator = this.addTypingIndicator();

        try {
            // Send to backend API with file if attached
            const response = await this.api.sendMessage(message, this.selectedFile);
            
            // Remove typing indicator
            typingIndicator.remove();
            
            // Add assistant response
            this.addMessage(response.message, 'assistant');
            
            // Clear file if it was attached
            if (this.selectedFile) {
                this.removeFile();
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            typingIndicator.remove();
            this.addMessage('Sorry, something went wrong. Please try again.', 'assistant');
        } finally {
            // Re-enable input
            this.setInputState(true);
            this.saveCurrentChat();
        }
    }

    setInputState(enabled) {
        this.input.disabled = !enabled;
        this.sendBtn.disabled = !enabled;
        this.fileInput.disabled = !enabled;
        if (enabled) {
            this.input.focus();
        }
    }

    addTypingIndicator() {
        const indicator = document.createElement('article');
        indicator.className = 'message message--assistant typing-indicator';
        indicator.innerHTML = `
            <div class="message__avatar" aria-hidden="true">🤖</div>
            <div class="message__bubble">
                <p class="message__label">Assistant</p>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(indicator);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        return indicator;
    }

    addMessage(text, type) {
        // Change layout when first message is added
        if (this.chatMessages.querySelectorAll('.message').length === 0) {
            this.chatMessages.style.justifyContent = 'flex-start';
            this.chatMessages.style.alignItems = 'stretch';
        }

        const message = {
            text: text,
            type: type,
            timestamp: new Date().toISOString()
        };

        this.currentMessages.push(message);

        const article = document.createElement('article');
        article.className = `message message--${type}`;
        article.dataset.timestamp = message.timestamp;
        
        const avatar = type === 'user' ? '👤' : '🤖';
        const label = type === 'user' ? 'You' : 'Assistant';
        const time = this.formatTime(message.timestamp);
        
        article.innerHTML = `
            <div class="message__avatar" aria-hidden="true">${avatar}</div>
            <div class="message__bubble">
                <p class="message__label">${label} <span class="message__time">${time}</span></p>
                <p>${this.escapeHtml(text)}</p>
            </div>
        `;
        
        this.chatMessages.appendChild(article);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveCurrentChat() {
        if (this.currentChatId) {
            this.storage.updateChat(this.currentChatId, this.currentMessages);
        }
    }

    loadChat(chatId) {
        const chat = this.storage.getChat(chatId);
        if (!chat) return;

        this.currentChatId = chatId;
        this.currentMessages = chat.messages || [];
        this.storage.setCurrentChatId(chatId);

        // Clear chat messages
        this.chatMessages.innerHTML = '';
        
        if (this.currentMessages.length === 0) {
            // Show welcome section
            this.showWelcomeSection();
        } else {
            // Load messages
            this.chatMessages.style.justifyContent = 'flex-start';
            this.chatMessages.style.alignItems = 'stretch';
            
            this.currentMessages.forEach(msg => {
                const article = document.createElement('article');
                article.className = `message message--${msg.type}`;
                article.dataset.timestamp = msg.timestamp;
                
                const avatar = msg.type === 'user' ? '👤' : '🤖';
                const label = msg.type === 'user' ? 'You' : 'Assistant';
                const time = this.formatTime(msg.timestamp);
                
                article.innerHTML = `
                    <div class="message__avatar" aria-hidden="true">${avatar}</div>
                    <div class="message__bubble">
                        <p class="message__label">${label} <span class="message__time">${time}</span></p>
                        <p>${this.escapeHtml(msg.text)}</p>
                    </div>
                `;
                
                this.chatMessages.appendChild(article);
            });
        }

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('active');
            this.menuToggle.classList.remove('active');
        }

        // Update active state in sidebar
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.toggle('active', item.dataset.chatId === chatId);
        });
    }

    loadCurrentChat() {
        const currentChatId = this.storage.getCurrentChatId();
        if (currentChatId) {
            this.loadChat(currentChatId);
        } else {
            this.showWelcomeSection();
        }
    }

    showWelcomeSection() {
        this.chatMessages.style.justifyContent = 'center';
        this.chatMessages.style.alignItems = 'center';
        
        this.chatMessages.innerHTML = `
            <div class="welcome-section" id="welcomeSection">
                <h2 class="welcome-title">What can I help you with?</h2>
                <div class="welcome-buttons">
                    <button class="prompt-button" data-prompt="Create an image for me">
                        <span class="prompt-icon icon-green">🎨</span>
                        <span>Create image</span>
                    </button>
                    <button class="prompt-button" data-prompt="Help me brainstorm ideas">
                        <span class="prompt-icon icon-blue">💡</span>
                        <span>Brainstorm</span>
                    </button>
                    <button class="prompt-button" data-prompt="Make a plan for me">
                        <span class="prompt-icon icon-yellow">📘</span>
                        <span>Make a plan</span>
                    </button>
                    <button class="prompt-button" data-prompt="Analyze this data">
                        <span class="prompt-icon icon-orange">🧠</span>
                        <span>Analyze data</span>
                    </button>
                    <button class="prompt-button" data-prompt="Help me write">
                        <span class="prompt-icon icon-purple">✍️</span>
                        <span>Help me write</span>
                    </button>
                </div>
            </div>
        `;

        this.welcomeSection = document.getElementById('welcomeSection');
        
        // Re-attach prompt button listeners
        document.querySelectorAll('.prompt-button').forEach(button => {
            button.addEventListener('click', () => {
                const prompt = button.getAttribute('data-prompt');
                this.input.value = prompt;
                this.input.focus();
                this.autoResizeTextarea();
            });
        });
    }

    startNewChat() {
        this.currentChatId = null;
        this.currentMessages = [];
        this.storage.setCurrentChatId('');
        this.showWelcomeSection();
        
        // Clear active state
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    loadChatHistory() {
        const chats = this.storage.getAllChats();
        
        if (chats.length === 0) {
            this.conversationList.innerHTML = '<p class="history__empty">No conversations yet</p>';
            return;
        }

        this.conversationList.innerHTML = '';
        
        chats.forEach(chat => {
            const chatItem = this.createChatItem(chat);
            this.conversationList.appendChild(chatItem);
        });
    }

    createChatItem(chat) {
        const div = document.createElement('div');
        div.className = 'chat-item';
        div.dataset.chatId = chat.id;
        
        if (chat.id === this.currentChatId) {
            div.classList.add('active');
        }

        const date = new Date(chat.createdAt);
        const dateStr = this.formatDate(date);

        div.innerHTML = `
            <div class="chat-item__content" data-chat-id="${chat.id}">
                <div class="chat-item__title">${this.escapeHtml(chat.title)}</div>
                <div class="chat-item__date">${dateStr}</div>
            </div>
        `;

        // Load chat on click
        div.addEventListener('click', () => {
            this.loadChat(chat.id);
        });

        return div;
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return 'Today';
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }
}

// ============================================================================
// INITIALIZE APP
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});
