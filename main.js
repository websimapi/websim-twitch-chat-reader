import tmi from 'tmi.js';
import { defaultChannel } from './config.js';

const channelInput = document.getElementById('channel');
const connectBtn = document.getElementById('connect-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const chatMessages = document.getElementById('chat-messages');

let client = null;
let currentChannel = '';

channelInput.value = defaultChannel; // Set default channel from config

// Function to add a message to the chat display
const addMessage = (userstate, message) => {
  const li = document.createElement('li');
  const usernameSpan = document.createElement('strong');

  usernameSpan.textContent = userstate['display-name'] || userstate.username;
  // Use Twitch user color if available
  if (userstate.color) {
    usernameSpan.style.color = userstate.color;
  }

  li.appendChild(usernameSpan);
  li.appendChild(document.createTextNode(`: ${message}`));
  chatMessages.appendChild(li);

  // Auto-scroll to the bottom
  const chatContainer = document.getElementById('chat-container');
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Optional: Limit the number of messages displayed
  const maxMessages = 100; // Adjust as needed
  if (chatMessages.children.length > maxMessages) {
    chatMessages.removeChild(chatMessages.children[0]);
  }
};

// Function to add a system message (e.g., connected, disconnected)
const addSystemMessage = (message) => {
    const li = document.createElement('li');
    li.style.fontStyle = 'italic';
    li.style.color = '#666';
    li.textContent = message;
    chatMessages.appendChild(li);
    const chatContainer = document.getElementById('chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
};


// Function to connect to Twitch chat
const connectChat = () => {
  const channel = channelInput.value.trim();
  if (!channel) {
    alert('Please enter a channel name.');
    return;
  }

  if (client && client.readyState() === 'OPEN') {
      addSystemMessage(`Already connected to #${currentChannel}. Disconnect first.`);
      return;
  }


  addSystemMessage(`Connecting to #${channel}...`);
  connectBtn.disabled = true;
  channelInput.disabled = true;


  client = new tmi.Client({
    channels: [channel]
  });

  client.on('message', (channel, userstate, message, self) => {
    // Don't display messages from the bot itself
    if (self) return;
    addMessage(userstate, message);
  });

   client.on('connected', (address, port) => {
    currentChannel = channel;
    addSystemMessage(`Connected to #${currentChannel}`);
    disconnectBtn.disabled = false;
    connectBtn.disabled = true; // Keep connect disabled while connected
    channelInput.disabled = true; // Keep input disabled while connected
  });

   client.on('disconnected', (reason) => {
    addSystemMessage(`Disconnected: ${reason || 'Connection closed'}`);
    disconnectBtn.disabled = true;
    connectBtn.disabled = false;
    channelInput.disabled = false;
    client = null; // Reset client
    currentChannel = '';
  });

  client.connect().catch(err => {
      addSystemMessage(`Failed to connect: ${err}`);
      console.error("Connection error:", err);
      disconnectBtn.disabled = true;
      connectBtn.disabled = false;
       channelInput.disabled = false;
      client = null; // Reset client
  });
};

// Function to disconnect from Twitch chat
const disconnectChat = () => {
  if (client && client.readyState() === 'OPEN') {
    addSystemMessage(`Disconnecting from #${currentChannel}...`);
    client.disconnect();
    disconnectBtn.disabled = true; // Disable immediately
  } else {
      addSystemMessage('Not connected.');
      disconnectBtn.disabled = true;
      connectBtn.disabled = false;
      channelInput.disabled = false;
  }
};

// Event listeners
connectBtn.addEventListener('click', connectChat);
disconnectBtn.addEventListener('click', disconnectChat);

// Allow connecting by pressing Enter in the input field
channelInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        connectChat();
    }
});

// Initial state
disconnectBtn.disabled = true;

import tmi from 'tmi.js';
import { defaultChannel } from './config.js';

const channelInput = document.getElementById('channel');
const connectBtn = document.getElementById('connect-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const chatMessages = document.getElementById('chat-messages');
const chatContainer = document.getElementById('chat-container'); // Get chat container

let client = null;
let currentChannel = '';

// Set default channel from config file
channelInput.value = defaultChannel || 'twitchdev'; // Use twitchdev if config is empty

// --- Helper Functions ---

// Add a chat message to the list
const addChatMessage = (userstate, message) => {
  const li = document.createElement('li');
  const usernameSpan = document.createElement('strong');

  usernameSpan.textContent = userstate['display-name'] || userstate.username;
  // Apply Twitch user color if available
  if (userstate.color) {
    usernameSpan.style.color = userstate.color;
  } else {
      // Assign a default color if none provided (optional)
      usernameSpan.style.color = getRandomColor(userstate.username); // Or a fixed default
  }


  li.appendChild(usernameSpan);
  li.appendChild(document.createTextNode(`: ${message}`)); // Add the message text
  chatMessages.appendChild(li);

  scrollToBottom();
  limitMessages(); // Keep the message list tidy
};

// Add a system message (e.g., connected, disconnected)
const addSystemMessage = (message) => {
    const li = document.createElement('li');
    li.style.fontStyle = 'italic';
    li.style.color = '#666';
    li.textContent = message;
    chatMessages.appendChild(li);
    scrollToBottom();
    limitMessages(); // Keep the message list tidy
};

// Auto-scroll to the bottom of the chat
const scrollToBottom = () => {
  chatContainer.scrollTop = chatContainer.scrollHeight;
};

// Optional: Limit the number of messages displayed to prevent performance issues
const limitMessages = (maxMessages = 150) => {
  while (chatMessages.children.length > maxMessages) {
    chatMessages.removeChild(chatMessages.firstChild);
  }
};

// Generate a consistent color based on username (simple hash)
const getRandomColor = (username) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash % 16777215).toString(16); // Ensure positive hash for color
    // Pad with zeros if needed
    return `#${'00000'.substring(0, 6 - color.length)}${color}`;
};


// --- Core Logic ---

// Function to connect to Twitch chat
const connectChat = () => {
  const channel = channelInput.value.trim().toLowerCase(); // Use lowercase channel name
  if (!channel) {
    alert('Please enter a Twitch channel name.');
    return;
  }

  // Prevent connecting if already connected or connecting
  if (client && (client.readyState() === 'OPEN' || client.readyState() === 'CONNECTING')) {
      addSystemMessage(`Already connected or connecting to #${currentChannel}. Disconnect first.`);
      return;
  }

  // Clear previous messages and indicate connection attempt
  // chatMessages.innerHTML = ''; // Optional: Clear chat on new connection
  addSystemMessage(`Connecting to #${channel}...`);
  connectBtn.disabled = true;
  disconnectBtn.disabled = true; // Disable disconnect during connection attempt
  channelInput.disabled = true;


  client = new tmi.Client({
    options: { debug: false }, // Set debug to true for more logs if needed
    connection: {
      secure: true,
      reconnect: true
    },
    channels: [channel]
  });

  // --- TMI.js Event Listeners ---
  client.on('message', (target, userstate, message, self) => {
    // Ignore messages from the bot itself (if it had an identity)
    if (self) return;
    addChatMessage(userstate, message);
  });

   client.on('connected', (address, port) => {
    currentChannel = channel; // Store the successfully connected channel
    addSystemMessage(`Successfully connected to #${currentChannel}`);
    disconnectBtn.disabled = false; // Enable disconnect now
    connectBtn.disabled = true; // Keep connect disabled
    channelInput.disabled = true; // Keep input disabled
  });

   client.on('disconnected', (reason) => {
    // Only show disconnect message if it wasn't intentional
    if (reason && !disconnectBtn.disabled) {
        addSystemMessage(`Disconnected from #${currentChannel}: ${reason}`);
    } else if (!disconnectBtn.disabled) {
        addSystemMessage(`Disconnected from #${currentChannel}`);
    }
    // Reset state only if disconnect wasn't manually triggered while already disconnected
    if (client) { // Check if client exists before resetting
        client = null;
        currentChannel = '';
        disconnectBtn.disabled = true;
        connectBtn.disabled = false;
        channelInput.disabled = false;
    }
  });

  client.on('join', (target, username, self) => {
    if (self) return; // Don't log the bot joining its own channel
    // addSystemMessage(`${username} joined ${target}`); // Optional: Log joins
  });

   client.on('part', (target, username, self) => {
    if (self) return;
    // addSystemMessage(`${username} left ${target}`); // Optional: Log parts
   });

   // Handle connection errors
   client.connect().catch(err => {
      addSystemMessage(`Error connecting to #${channel}: ${err}`);
      console.error(`[${channel}] Connection error:`, err);
      // Reset state on connection failure
      disconnectBtn.disabled = true;
      connectBtn.disabled = false;
      channelInput.disabled = false;
      client = null; // Ensure client is nullified on error
      currentChannel = '';
  });
};

// Function to disconnect from Twitch chat
const disconnectChat = () => {
  if (client && client.readyState() === 'OPEN') {
    addSystemMessage(`Disconnecting from #${currentChannel}...`);
    disconnectBtn.disabled = true; // Disable button immediately
    client.disconnect()
        .then(() => {
            addSystemMessage(`Successfully disconnected from #${currentChannel}.`);
            // State is reset by the 'disconnected' event handler
        })
        .catch(err => {
            addSystemMessage(`Error during disconnection: ${err}`);
            console.error(`[${currentChannel}] Disconnect error:`, err);
             // Still reset state even if disconnect promise rejects, as connection might be lost
            client = null;
            currentChannel = '';
            connectBtn.disabled = false;
            channelInput.disabled = false;
        });
  } else {
      addSystemMessage('Not currently connected.');
      // Ensure state is correct if disconnect is clicked while not connected
      disconnectBtn.disabled = true;
      connectBtn.disabled = false;
      channelInput.disabled = false;
      client = null;
      currentChannel = '';
  }
};

// --- Event Listeners ---
connectBtn.addEventListener('click', connectChat);
disconnectBtn.addEventListener('click', disconnectChat);

// Allow connecting by pressing Enter in the input field
channelInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !connectBtn.disabled) {
        connectChat();
    }
});

// Initial UI State
disconnectBtn.disabled = true;
connectBtn.disabled = false;
channelInput.disabled = false;

addSystemMessage('Enter a Twitch channel name and click Connect.');

