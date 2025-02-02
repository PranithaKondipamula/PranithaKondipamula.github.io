class PortfolioChatbot {
    constructor() {
        console.log('Initializing chatbot...');
        this.chatHistory = [];
        this.portfolioData = null;
        this.initialize();
    }

    async initialize() {
        console.log('Loading portfolio data...');
        await this.loadPortfolioData();
        this.initializeChatbot();
        this.addMessageToChat('assistant', 'Hello! I'm an AI assistant for Pranitha. Feel free to ask about her qualifications, skills, or experience.');
    }

    async loadPortfolioData() {
        try {
            const response = await fetch('./assets/data/pranitha_info.json');
            this.portfolioData = await response.json();
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            this.portfolioData = {}; 
        }
    }

    initializeChatbot() {
        const chatInterface = `
            <div id="chatbot-container" class="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 transform translate-y-full opacity-0 z-50">
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
                <img src="assets/images/pranitha-profile.png" alt="AI Assistant" class="w-full h-full object-cover">
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
        const message = chatInput.value.trim().toLowerCase();
        
        if (!message) return;

        this.addMessageToChat('user', chatInput.value.trim());
        chatInput.value = '';

        this.addTypingIndicator();
        setTimeout(() => {
            this.removeTypingIndicator();
            const response = this.generateResponse(message);
            this.addMessageToChat('assistant', response);
        }, 1000);
    }

    generateResponse(message) {
        // Keywords for different types of information
        const keywords = {
            education: ['education', 'degree', 'university', 'study', 'studied', 'college', 'academic'],
            skills: ['skills', 'technologies', 'programming', 'languages', 'tools', 'frameworks'],
            experience: ['experience', 'work', 'job', 'position', 'career', 'research'],
            projects: ['projects', 'portfolio', 'developed', 'built', 'created'],
            contact: ['contact', 'email', 'phone', 'reach', 'connect'],
            certifications: ['certifications', 'certificates', 'certified'],
            background: ['background', 'about', 'summary', 'overview']
        };

        // Check for specific questions
        if (message.includes('who are you') || message.includes('what can you do')) {
            return "I'm an AI assistant for Pranitha's portfolio. I can tell you about her education, skills, work experience, projects, and more. What would you like to know?";
        }

        if (message.includes('contact') || message.includes('email') || message.includes('phone')) {
            return `You can contact Pranitha at ${this.portfolioData.personal_info.email} or ${this.portfolioData.personal_info.phone}`;
        }

        if (keywords.education.some(keyword => message.includes(keyword))) {
            const edu = this.portfolioData.education.masters;
            return `Pranitha is pursuing a ${edu.degree} at ${edu.institution} (${edu.period}). Her coursework includes ${edu.relevant_coursework.join(', ')}.`;
        }

        if (keywords.skills.some(keyword => message.includes(keyword))) {
            const skills = this.portfolioData.skills;
            return `Pranitha is skilled in:
            - Programming: ${skills.programming.join(', ')}
            - ML Frameworks: ${skills.ml_frameworks.join(', ')}
            - Databases: ${skills.databases.join(', ')}
            - Data Analysis: ${skills.data_analysis.slice(0, 3).join(', ')} and more`;
        }

        if (keywords.experience.some(keyword => message.includes(keyword))) {
            const exp = this.portfolioData.detailed_experience;
            return `Pranitha's most recent roles include:
            1. ${exp.graduate_research.title} at ${exp.graduate_research.company}
            2. ${exp.hpc_research.title} at ${exp.hpc_research.company}
            3. ${exp.data_analyst.title} at ${exp.data_analyst.company}
            Would you like more details about any of these positions?`;
        }

        if (keywords.projects.some(keyword => message.includes(keyword))) {
            const projects = this.portfolioData.projects;
            return `Here are some of Pranitha's key projects:
            1. ${projects.llm_chatbot.title}
            2. ${projects.adobe_case.title}
            3. ${projects.sales_forecasting.title}
            Would you like to know more about any specific project?`;
        }

        if (keywords.certifications.some(keyword => message.includes(keyword))) {
            const certs = this.portfolioData.certifications;
            return `Pranitha holds the following certifications:
            ${certs.map(cert => `- ${cert.name} (${cert.year})`).join('\n')}`;
        }

        if (keywords.background.some(keyword => message.includes(keyword))) {
            return this.portfolioData.professional_summary;
        }

        // Default response if no specific match is found
        return "I can tell you about Pranitha's education, skills, work experience, projects, or certifications. What specific aspect would you like to know more about?";
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
