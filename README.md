# Javid Studio - Local Computer Installation Guide

Javid Studio is a local AI web interface, model management dashboard, and Google Colab-style hardware telemetry monitor designed to run seamlessly on your computer.

---

## ⚡ Quick Start Options

### Option 1: macOS & Linux (Automated Installer)
Open your terminal in the downloaded folder and run:
```bash
chmod +x install.sh
./install.sh
```
This script will:
1. Verify Node.js and Ollama installations.
2. Install dependencies and build the production assets.
3. Create a CLI command (`javid-studio`) and Linux desktop shortcut.
4. Launch Javid Studio and open your default browser to `http://localhost:3000`.

---

### Option 2: Windows (PowerShell or Command Prompt)

#### PowerShell (Recommended):
Right-click `install.ps1` and select **Run with PowerShell**, or in terminal:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\install.ps1
```

#### Command Prompt:
Double-click `install.bat` or run:
```cmd
install.bat
```
This automatically installs dependencies, builds the app, and places a **Javid Studio** shortcut on your Desktop and Start Menu.

#### Creating or Re-creating Desktop Shortcut:
If you already ran `install.bat` or moved the folder, double-click:
```cmd
create-shortcut.bat
```
or run in PowerShell:
```powershell
.\create-shortcut.ps1
```
This instantly generates a `Javid Studio` icon on your Desktop and Start Menu pointing to your installation.

---

### ⚠️ Troubleshooting: "package.json is missing"
If you see the error:
```
npm ERR! enoent ENOENT: no such file or directory, open '...\package.json'
```
This occurs when:
1. **Running `install.bat` standalone**: The script was saved to a folder without the rest of the application files.
2. **Not unzipping first**: The `.bat` was launched directly from inside Windows File Explorer's compressed zip preview without extracting all files first.

**How to Fix:**
- **Extract All**: Right-click the downloaded zip (`javid-studio-full.zip`) and click **"Extract All..."** into a folder (e.g., `C:\javid-studio`), then open that folder and run `install.bat`.
- **Automatic Recovery**: The latest `install.bat` and `install.ps1` scripts detect when `package.json` is missing and automatically download the full application bundle for you.
- **Direct Download**: You can download the complete project zip anytime from:
  `https://ais-pre-koknghk65sn5nn6y2kcn7z-178731558169.europe-west2.run.app/api/download/project-zip`

---

### Option 3: Manual Installation (Any OS)
If you prefer standard Node commands:
```bash
# 1. Clone or extract files into a folder
cd javid-studio

# 2. Install dependencies
npm install

# 3. Build the frontend
npm run build

# 4. Start Javid Studio
npm start
```
Visit **http://localhost:3000** in your browser.

---

### Option 4: Docker & Docker Compose
Run with zero local configuration:
```bash
docker compose up -d --build
```
Javid Studio will be available at `http://localhost:3000` and automatically link to Ollama on your host machine via `host.docker.internal:11434`.

---

## ⚙️ Connecting to Local Ollama & Enabling CORS

To allow Javid Studio to communicate with your local Ollama instance without browser CORS blocking:

### On Linux & macOS:
```bash
OLLAMA_ORIGINS="*" ollama serve
```
*(If using systemd service on Linux, edit `/etc/systemd/system/ollama.service` and add `Environment="OLLAMA_ORIGINS=*"`)*

### On Windows:
In PowerShell:
```powershell
[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')
ollama serve
```

---

## 🔍 Why did 127.0.0.1:11434 not show models or VRAM/CPU?

1. **Cloud Preview vs. Local Machine**:
   - If you accessed Javid Studio through the **remote cloud preview URL** (`https://ais-dev-...run.app` or `https://ais-pre-...run.app`), the server is hosted in the cloud. A remote cloud container cannot access `127.0.0.1` (your computer's private localhost).
   - Furthermore, modern web browsers block HTTPS web pages from making insecure requests to your private network (`http://127.0.0.1:11434`) due to Private Network Access & Mixed Content security policies.
   - **Fix**: Run Javid Studio locally on your computer via `./install.bat` or `npm start` and open **http://localhost:3000**.
   - **Alternative**: If you want to use the cloud interface, expose Ollama with `ngrok http 11434` and enter the `https://....ngrok-free.app` URL into the Host input.

2. **Hardware (VRAM & CPU) Detection**:
   - When running locally, Javid Studio automatically detects your machine's real processor model (`os.cpus()`), RAM, and uses `nvidia-smi` / Windows VideoController / Apple Metal to display your exact GPU and VRAM.
   - Any models loaded into memory via `ollama run` or `ollama ps` are automatically reflected in the top Google Colab-style resource indicators!

---

## 🚀 Recommended Models to Pull Locally
Once installed, open the **Models** tab or Terminal in Javid Studio and run:
```bash
ollama run llama3.3:70b     # High performance 70B
ollama run deepseek-r1:14b   # DeepSeek reasoning trace
ollama run qwen2.5-coder:14b # Coding specialist
ollama run phi4:14b          # Math & reasoning
```
