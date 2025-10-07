// craftGPT - API Service Module
// Handles communication with backend API

class APIService {
    constructor() {
        this.baseURL = 'http://localhost:5000';
        this.isBackendAvailable = false;
        this.checkingBackend = false;
        this.lastCheckTime = 0;
        this.checkInterval = 30000; // Check every 30 seconds
        
        // Initialize backend check
        this.checkBackendAvailability();
    }

    /**
     * Check if backend server is available
     */
    async checkBackendAvailability() {
        if (this.checkingBackend) return;
        
        const now = Date.now();
        if (now - this.lastCheckTime < this.checkInterval) {
            return this.isBackendAvailable;
        }

        this.checkingBackend = true;
        this.lastCheckTime = now;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            this.isBackendAvailable = response.ok;
            console.log('✅ Backend is available');
            return true;
        } catch (error) {
            this.isBackendAvailable = false;
            console.log('⚠️ Backend not available, using fallback responses');
            return false;
        } finally {
            this.checkingBackend = false;
        }
    }

    /**
     * Send message to backend API
     */
    async sendMessage(message, fileData = null) {
        // Check backend availability first
        await this.checkBackendAvailability();

        if (!this.isBackendAvailable) {
            return this.getFallbackResponse(message);
        }

        try {
            const formData = new FormData();
            formData.append('message', message);

            if (fileData) {
                formData.append('file', fileData);
            }

            const response = await fetch(`${this.baseURL}/chat`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    message: data.response,
                    metadata: data.metadata || {}
                };
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (error) {
            console.error('API Error:', error);
            this.isBackendAvailable = false;
            return this.getFallbackResponse(message);
        }
    }

    /**
     * Send message with streaming response
     */
    async sendMessageStream(message, onChunk, fileData = null) {
        await this.checkBackendAvailability();

        if (!this.isBackendAvailable) {
            // Simulate streaming for fallback
            const response = this.getFallbackResponse(message);
            const words = response.message.split(' ');
            
            for (let i = 0; i < words.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 50));
                onChunk(words.slice(0, i + 1).join(' '));
            }
            
            return response;
        }

        try {
            const formData = new FormData();
            formData.append('message', message);
            formData.append('stream', 'true');

            if (fileData) {
                formData.append('file', fileData);
            }

            const response = await fetch(`${this.baseURL}/chat/stream`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            return {
                                success: true,
                                message: fullText,
                                metadata: {}
                            };
                        }

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.text) {
                                fullText += parsed.text;
                                onChunk(fullText);
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }

            return {
                success: true,
                message: fullText,
                metadata: {}
            };
        } catch (error) {
            console.error('Streaming Error:', error);
            this.isBackendAvailable = false;
            const fallback = this.getFallbackResponse(message);
            onChunk(fallback.message);
            return fallback;
        }
    }

    /**
     * Process file with backend
     */
    async processFile(file, query = '') {
        await this.checkBackendAvailability();

        if (!this.isBackendAvailable) {
            return {
                success: false,
                message: 'Backend not available. File processing requires an active backend connection.',
                metadata: {}
            };
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            if (query) formData.append('query', query);

            const response = await fetch(`${this.baseURL}/process-file`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: data.success,
                message: data.response || data.error,
                metadata: data.metadata || {}
            };
        } catch (error) {
            console.error('File Processing Error:', error);
            return {
                success: false,
                message: 'Failed to process file. Please ensure the backend is running.',
                metadata: {}
            };
        }
    }

    /**
     * Get fallback responses when backend is unavailable
     */
    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Context-aware fallback responses
        const responses = {
            greeting: [
                "Hello! I'm currently running in offline mode. Connect the backend to get AI-powered responses!",
                "Hi there! The backend isn't connected yet, but I'm here to help with basic responses.",
                "Hey! I'm operating in fallback mode. For full functionality, please start the backend server."
            ],
            help: [
                "I'm currently in offline mode. To get full functionality:\n\n1. Start the backend server: `python simple_backend.py`\n2. Ensure your API key is configured\n3. Refresh this page\n\nFor now, I can only provide basic responses.",
                "To connect me to the AI backend:\n• Make sure Python is installed\n• Run: python simple_backend.py\n• Check that port 5000 is available\n• Reload this page"
            ],
            file: [
                "File processing requires the backend server. Please start it with: python simple_backend.py",
                "I can't process files in offline mode. Connect the backend to enable file analysis."
            ],
            default: [
                "I'm running in offline mode right now. Start the backend server to get AI-powered responses!",
                "Backend connection needed! Run 'python simple_backend.py' to enable full functionality.",
                "This is a fallback response. Connect to the backend for real AI assistance.",
                "I'm currently offline. Start the backend server at localhost:5000 for full features."
            ]
        };

        // Detect message type
        let responseSet = responses.default;
        
        if (/^(hi|hello|hey|greetings)/i.test(lowerMessage)) {
            responseSet = responses.greeting;
        } else if (/help|how|setup|install|backend|connect/i.test(lowerMessage)) {
            responseSet = responses.help;
        } else if (/file|upload|csv|document|pdf/i.test(lowerMessage)) {
            responseSet = responses.file;
        }

        // Random response from set
        const response = responseSet[Math.floor(Math.random() * responseSet.length)];

        return {
            success: true,
            message: response,
            metadata: {
                fallback: true,
                backendAvailable: false
            }
        };
    }

    /**
     * Get backend status
     */
    async getBackendStatus() {
        await this.checkBackendAvailability();
        return {
            available: this.isBackendAvailable,
            url: this.baseURL,
            lastCheck: new Date(this.lastCheckTime).toISOString()
        };
    }

    /**
     * Set custom backend URL
     */
    setBackendURL(url) {
        this.baseURL = url;
        this.isBackendAvailable = false;
        this.lastCheckTime = 0;
        this.checkBackendAvailability();
    }
}

// Export for use in main app
window.APIService = APIService;
