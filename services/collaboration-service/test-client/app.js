import * as Y from 'https://esm.sh/yjs@13.6.8';
import { WebsocketProvider } from 'https://esm.sh/y-websocket@1.5.0';

// Elements
const statusEl = document.getElementById('status');
const docNameInput = document.getElementById('docName');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const editor = document.getElementById('editor');
const userCountEl = document.getElementById('userCount');
const userListEl = document.getElementById('userList');

let ydoc = null;
let provider = null;
let ytext = null;
let binding = null;

const updateStatus = (status) => {
    statusEl.textContent = status;
    statusEl.className = status.toLowerCase();

    if (status === 'Connected') {
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
        docNameInput.disabled = true;
        editor.disabled = false;
    } else {
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
        docNameInput.disabled = false;
        editor.disabled = true;
        userCountEl.textContent = '0';
        userListEl.innerHTML = '';
    }
};

const connect = () => {
    const docName = docNameInput.value.trim() || 'test-doc';
    updateStatus('Connecting');

    ydoc = new Y.Doc();

    // Connect to WebSocket
    provider = new WebsocketProvider(
        'ws://localhost:4003',
        docName,
        ydoc
    );

    // Sync Status
    provider.on('status', event => {
        updateStatus(event.status === 'connected' ? 'Connected' : 'Disconnected');
    });

    // Awareness (User presence)
    const awareness = provider.awareness;

    // Set random user info
    const userColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    const userId = Math.floor(Math.random() * 1000);

    awareness.setLocalStateField('user', {
        name: `User ${userId}`,
        color: userColor
    });

    awareness.on('change', () => {
        const states = Array.from(awareness.getStates().values());
        userCountEl.textContent = states.length;

        userListEl.innerHTML = states.map(state => {
            if (!state.user) return '';
            return `<li class="user-badge" style="background-color: ${state.user.color}20; color: ${state.user.color}">
                ${state.user.name} ${state.user.name === `User ${userId}` ? '(You)' : ''}
            </li>`;
        }).join('');
    });

    // Text Sync
    ytext = ydoc.getText('content');

    // Bind textarea to Y.Text
    editor.value = ytext.toString();

    ytext.observe(event => {
        if (document.activeElement === editor) return; // Don't overwrite if typing
        editor.value = ytext.toString();
    });

    editor.addEventListener('input', () => {
        const currentVal = editor.value;
        if (currentVal !== ytext.toString()) {
            ydoc.transact(() => {
                ytext.delete(0, ytext.length);
                ytext.insert(0, currentVal);
            });
        }
    });
};

const disconnect = () => {
    if (provider) {
        provider.disconnect();
        provider.destroy();
        provider = null;
    }
    if (ydoc) {
        ydoc.destroy();
        ydoc = null;
    }
    updateStatus('Disconnected');
};

connectBtn.addEventListener('click', connect);
disconnectBtn.addEventListener('click', disconnect);

// Initial state
updateStatus('Disconnected');
