// Initialize OpenAI configuration
const OPENAI_API_KEY = CONFIG.OPENAI_API_KEY;

class PortfolioChatbot {
    constructor() {
        this.chatHistory = [];
        this.portfolioData = null;
        this.initialize();
    }

    async initialize() {
        await this.loadPortfolioData();
        this.initializeChatbot();
        // Add welcome message
        this.addMessageToChat('assistant', 'Hello! I'm Pranitha's AI assistant. Feel free to ask me about her qualifications, skills, or experience.');
    }

    async loadPortfolioData() {
        try {
            const response = await fetch('./assets/data/pranitha_info.json');
            this.portfolioData = await response.json();
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            this.portfolioData = {}; // Set empty object as fallback
        }
    }

    initializeChatbot() {
        // Create chat interface
        const chatInterface = `
            <div id="chatbot-container" class="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 transform translate-y-full opacity-0">
                <div class="bg-blue-600 p-4 flex justify-between items-center">
                    <h3 class="text-white font-bold">Ask me about Pranitha</h3>
                    <button id="minimize-chat" class="text-white hover:text-gray-200">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                </div>
                <div id="chat-messages" class="h-96 overflow-y-auto p-4 space-y-4"></div>
                <div class="border-t p-4">
                    <div class="flex space-x-2">
                        <input type="text" id="chat-input" class="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" placeholder="Ask about Pranitha's qualifications...">
                        <button id="send-message" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            Send
                        </button>
                    </div>
                </div>
            </div>
            <button id="chat-trigger" class="fixed bottom-4 right-4 w-16 h-16 rounded-full shadow-lg hover:transform hover:scale-110 transition-transform duration-300 overflow-hidden border-2 border-blue-600">
                <img src="./assets/images/pranitha-profile.png" alt="AI Assistant" class="w-full h-full object-cover">
            </button>
        `;
        document.body.insertAdjacentHTML('beforeend', chatInterface);
        this.bindEvents();
    }

    bindEvents() {
        const chatTrigger = document.getElementById('chat-trigger');
        const chatContainer = document.getElementById('chatbot-container');
        const minimizeChat = document.getElementById('minimize-chat');
        const sendButton = document.getElementById('send-message');
        const chatInput = document.getElementById('chat-input');

        chatTrigger.addEventListener('click', () => {
            chatContainer.classList.remove('translate-y-full', 'opacity-0');
            chatTrigger.classList.add('hidden');
        });

        minimizeChat.addEventListener('click', () => {
            chatContainer.classList.add('translate-y-full', 'opacity-0');
            chatTrigger.classList.remove('hidden');
        });

        sendButton.addEventListener('click', () => this.handleUserMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserMessage();
            }
        });
    }

    async handleUserMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addMessageToChat('user', message);
        chatInput.value = '';

        // Show typing indicator
        this.addTypingIndicator();

        try {
            const response = await this.getAIResponse(message);
            this.removeTypingIndicator();
            this.addMessageToChat('assistant', response);
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessageToChat('assistant', 'I apologize, but I encountered an error. Please try again.');
            console.error('Error:', error);
        }
    }

    async getAIResponse(message) {
        try {
            if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_API_KEY_HERE') {
                throw new Error('OpenAI API key not configured');
            }
            const portfolioContext = JSON.stringify(this.portfolioData);
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system",
                            content: `You are an AI assistant for Pranitha Kondipamula's portfolio website. Here is her detailed information: ${portfolioContext}. Use this information to provide accurate and relevant responses about Pranitha's qualifications, skills, and experience. When comparing with job requirements, focus on relevant skills and experience from this data.`
                        },
                        ...this.chatHistory,
                        {
                            role: "user",
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API request failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            if (error.message.includes('API key')) {
                return "I apologize, but I'm not properly configured yet. Please make sure the OpenAI API key is set correctly.";
            }
            if (error.message.includes('loading portfolio data')) {
                return "I apologize, but I'm having trouble accessing Pranitha's information. Please try again in a moment.";
            }
            throw error;
        }
    }

    addMessageToChat(role, message) {
        const chatMessages = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
        
        messageElement.innerHTML = `
            <div class="${role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} rounded-lg px-4 py-2 max-w-[75%]">
                ${message}
            </div>
        `;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add message to chat history
        this.chatHistory.push({
            role: role,
            content: message
        });
    }

    addTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typing-indicator';
        typingIndicator.className = 'flex justify-start';
        typingIndicator.innerHTML = `
            <div class="bg-gray-200 text-gray-800 rounded-lg px-4 py-2">
                <div class="flex space-x-2">
                    <div class="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Initialize chatbot when the page loads
window.addEventListener('load', () => {
    const chatbot = new PortfolioChatbot();
}); 
