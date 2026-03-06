# 💬 Anonymous Chat

A lightweight, self-hosted anonymous chat application with real-time messaging and file sharing. Built with Node.js, WebSockets, and Nginx — deployable with a single Docker Compose command.

![Anonymous Chat](https://img.shields.io/badge/Docker-Ready-blue?logo=docker) ![Node.js](https://img.shields.io/badge/Node.js-18-green?logo=node.js) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- 💬 **Real-time chat** via WebSockets
- 👤 **Anonymous usernames** — no account required
- 📁 **File sharing** — upload and download files
- 📜 **Chat history** — messages persist across sessions
- 👥 **Online user list** — see who's currently in the chat
- 🖤 **Matrix-style UI** — green on black terminal aesthetic
- 🐳 **Docker ready** — one command to deploy
- 🧅 **Tor compatible** — works as a hidden service

## 🚀 Quick Start

### Requirements
- Docker
- Docker Compose

### Deploy

```bash
git clone https://github.com/xdfsx/anonymous-chat.git
cd anonymous-chat
docker compose up -d
```

Access the chat at `http://localhost:8086`

## 🗂️ Project Structure

```
anonymous-chat/
├── frontend/
│   └── index.html        # Chat UI
├── backend/
│   ├── server.js         # Node.js WebSocket + REST API
│   └── package.json
├── nginx.conf            # Nginx reverse proxy config
└── compose.yml           # Docker Compose
```

## ⚙️ Configuration

By default the app runs on port `8086`. To change it edit `compose.yml`:

```yaml
ports:
  - "YOUR_PORT:80"
```

## 🧅 Tor Hidden Service

This app works great as a Tor hidden service for fully anonymous communication. Pair it with a Tor container like `goldy/tor-hidden-service` and point it to the chat-nginx container on port 80.

## 🛡️ Security Notes

- No user accounts or passwords
- No logging of IP addresses
- Chat history stored locally in a Docker volume
- Uploaded files stored in a Docker volume
- All data stays on your server

## 🐳 Docker Services

| Service | Description |
|---|---|
| `chat-backend` | Node.js WebSocket + REST API server |
| `chat-nginx` | Nginx reverse proxy + static file server |

## 📦 Tech Stack

- **Frontend** — Vanilla HTML/CSS/JavaScript
- **Backend** — Node.js with WebSockets
- **Proxy** — Nginx
- **Container** — Docker + Docker Compose

## 📄 License

MIT — do whatever you want with it!

---

⭐ If you find this useful, give it a star!
