class PortfolioChatbot {
    constructor() {
        console.log('PortfolioChatbot: Constructor called');
        this.chatHistory = [];
        this.portfolioData = null;
        this.initialize();
    }

    async initialize() {
        console.log('PortfolioChatbot: Initializing...');
        await this.loadPortfolioData();
        this.initializeChatbot();
        this.addMessageToChat('assistant', 'Hello! I'm an AI assistant for Pranitha. Feel free to ask about her qualifications, skills, or experience.');
        console.log('PortfolioChatbot: Initialization complete');
    }

async loadPortfolioData() {
    try {
        const response = await fetch('/assets/pranitha_info.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.portfolioData = await response.json();
        console.log('Portfolio data loaded successfully');
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        try {
            const fallbackResponse = await fetch('../pranitha_info.json');
            if (!fallbackResponse.ok) {
                throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
            }
            this.portfolioData = await fallbackResponse.json();
            console.log('Portfolio data loaded successfully using fallback path');
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            this.portfolioData = {};
        }
    }
}

    initializeChatbot() {
        console.log('PortfolioChatbot: Creating chat interface');
        const chatInterface = `
            <div id="chatbot-container" class="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50">
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
            <button id="chat-trigger" class="fixed bottom-4 right-4 bg-blue-600 w-16 h-16 rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
            </button>
        `;
        
        // Remove any existing chatbot elements
        const existingContainer = document.getElementById('chatbot-container');
        const existingTrigger = document.getElementById('chat-trigger');
        if (existingContainer) existingContainer.remove();
        if (existingTrigger) existingTrigger.remove();

        document.body.insertAdjacentHTML('beforeend', chatInterface);
        this.bindEvents();

        // Initially hide the chat container
        const chatContainer = document.getElementById('chatbot-container');
        chatContainer.style.display = 'none';
    }

    bindEvents() {
        const chatTrigger = document.getElementById('chat-trigger');
        const chatContainer = document.getElementById('chatbot-container');
        const minimizeChat = document.getElementById('minimize-chat');
        const sendButton = document.getElementById('send-message');
        const chatInput = document.getElementById('chat-input');

        chatTrigger.addEventListener('click', () => {
            chatTrigger.style.display = 'none';
            chatContainer.style.display = 'block';
        });

        minimizeChat.addEventListener('click', () => {
            chatContainer.style.display = 'none';
            chatTrigger.style.display = 'flex';
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

        this.addMessageToChat('user', message);
        chatInput.value = '';

        this.addTypingIndicator();
        
        setTimeout(() => {
            this.removeTypingIndicator();
            const response = this.generateResponse(message.toLowerCase());
            this.addMessageToChat('assistant', response);
        }, 1000);
    }

    generateResponse(message) {
        if (!this.portfolioData) {
            return "I apologize, but I'm having trouble accessing Pranitha's information. Please try again in a moment.";
        }

        // Keywords for different types of information
        const keywords = {
            education: ['education', 'degree', 'university', 'study', 'studied', 'college', 'academic'],
            skills: ['skills', 'technologies', 'programming', 'languages', 'tools', 'frameworks'],
            experience: ['experience', 'work', 'job', 'position', 'career'],
            projects: ['projects', 'portfolio', 'developed', 'built', 'created'],
            contact: ['contact', 'email', 'phone', 'reach', 'connect'],
            background: ['background', 'about', 'summary', 'overview']
        };

        // Basic greeting and introduction
        if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
            return "Hello! I can tell you about Pranitha's education, skills, work experience, or projects. What would you like to know?";
        }

        // Check for contact information request
        if (keywords.contact.some(word => message.includes(word))) {
            return `You can contact Pranitha at ${this.portfolioData.personal_info.email}`;
        }

        // Check for education information
        if (keywords.education.some(word => message.includes(word))) {
            const edu = this.portfolioData.education.masters;
            return `Pranitha is pursuing a ${edu.degree} at ${edu.institution} (${edu.period}). Her coursework includes ${edu.relevant_coursework.join(', ')}.`;
        }

        // Check for skills information
        if (keywords.skills.some(word => message.includes(word))) {
            const skills = this.portfolioData.skills;
            return `Pranitha's key skills include:
            • Programming: ${skills.programming.join(', ')}
            • ML Frameworks: ${skills.ml_frameworks.join(', ')}
            • Data Analysis: ${skills.data_analysis.slice(0, 3).join(', ')}
            Would you like to know more about any specific skill area?`;
        }

        // Check for experience information
        if (keywords.experience.some(word => message.includes(word))) {
            const exp = this.portfolioData.detailed_experience;
            return `Pranitha's most recent roles include:
            1. ${exp.graduate_research.title} at ${exp.graduate_research.company}
            2. ${exp.hpc_research.title} at ${exp.hpc_research.company}
            3. ${exp.data_analyst.title} at ${exp.data_analyst.company}
            Would you like more details about any of these positions?`;
        }

        // Check for projects information
        if (keywords.projects.some(word => message.includes(word))) {
            const projects = this.portfolioData.projects;
            return `Here are some of Pranitha's key projects:
            1. ${projects.llm_chatbot.title}
            2. ${projects.adobe_case.title}
            3. ${projects.sales_forecasting.title}
            Would you like to know more about any specific project?`;
        }

        // Check for background/summary information
        if (keywords.background.some(word => message.includes(word))) {
            return this.portfolioData.professional_summary;
        }

        // Default response
        return "I can tell you about Pranitha's education, skills, work experience, or projects. What specific aspect would you like to know more about?";
    }

    addMessageToChat(role, message) {
        const chatMessages = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`;
        
        messageElement.innerHTML = `
            <div class="${role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} rounded-lg px-4 py-2 max-w-[75%]">
                ${message}
            </div>
        `;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    addTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typing-indicator';
        typingIndicator.className = 'flex justify-start mb-4';
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('PortfolioChatbot: Document ready, initializing chatbot');
    window.portfolioChatbot = new PortfolioChatbot();
});
