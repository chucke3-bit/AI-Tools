#!/usr/bin/env bash
# ==============================================================================
# Javid Studio - Automated Local Installer for Linux & macOS
# ==============================================================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "  ██╗ █████╗ ██╗   ██╗██╗██████╗     ███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗ "
echo "  ██║██╔══██╗██║   ██║██║██╔══██╗    ██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗"
echo "  ██║███████║██║   ██║██║██║  ██║    ███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║"
echo "  ██║██╔══██║╚██╗ ██╔╝██║██║  ██║    ╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║"
echo "  ██║██║  ██║ ╚████╔╝ ██║██████╔╝    ███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝"
echo "  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝╚═════╝     ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ "
echo -e "${NC}"
echo -e "${BOLD}Local AI Interface & Colab-Style Runtime Monitor Installer${NC}"
echo "=============================================================================="

INSTALL_DIR="${HOME}/.javid-studio"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. System Requirements Check
echo -e "\n${BLUE}[1/5] Checking System Prerequisites...${NC}"

# Check Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node -v)
    echo -e "  ${GREEN}✓${NC} Node.js detected: ${BOLD}${NODE_VERSION}${NC}"
else
    echo -e "  ${YELLOW}!${NC} Node.js not detected."
    echo -e "    Installing Node.js LTS via official package manager..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew >/dev/null 2>&1; then
            brew install node
        else
            echo -e "${RED}Error: Homebrew is required on macOS. Install it from https://brew.sh${NC}"
            exit 1
        fi
    elif command -v apt-get >/dev/null 2>&1; then
        curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif command -v dnf >/dev/null 2>&1; then
        sudo dnf install -y nodejs
    else
        echo -e "${RED}Error: Please install Node.js 18+ from https://nodejs.org${NC}"
        exit 1
    fi
fi

# Check Ollama
echo -e "\n${BLUE}[2/5] Checking Local Ollama Engine...${NC}"
if command -v ollama >/dev/null 2>&1; then
    OLLAMA_VERSION=$(ollama --version 2>/dev/null || echo "installed")
    echo -e "  ${GREEN}✓${NC} Ollama detected: ${BOLD}${OLLAMA_VERSION}${NC}"
else
    echo -e "  ${YELLOW}!${NC} Ollama was not found in your PATH."
    read -p "  Would you like to install Ollama now? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        echo -e "    Installing Ollama..."
        curl -fsSL https://ollama.com/install.sh | sh
    else
        echo -e "    ${YELLOW}Continuing without installing Ollama. You can connect to a remote instance later.${NC}"
    fi
fi

# 2. Setup Files and Install Dependencies
echo -e "\n${BLUE}[3/5] Installing Dependencies & Building Project...${NC}"
mkdir -p "$INSTALL_DIR"
cp -r "$APP_DIR"/* "$INSTALL_DIR/" 2>/dev/null || true
cd "$INSTALL_DIR"

if [ ! -f ".env" ]; then
    cp .env.example .env 2>/dev/null || touch .env
fi

echo -e "  Running npm install in ${INSTALL_DIR}..."
npm install --force --silent

echo -e "  Building production frontend assets..."
npm run build

# 3. Create Launchers & Desktop Shortcuts
echo -e "\n${BLUE}[4/5] Creating Launcher Scripts & Desktop Shortcuts...${NC}"

# Create run script
cat << 'EOF' > "${INSTALL_DIR}/run.sh"
#!/usr/bin/env bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Ensure Ollama allows cross-origin requests from the web UI
export OLLAMA_ORIGINS="*"
export PORT=3000

# Start Ollama service if not already running
if ! pgrep -x "ollama" >/dev/null && command -v ollama >/dev/null 2>&1; then
    echo "Starting background Ollama daemon with OLLAMA_ORIGINS=*..."
    OLLAMA_ORIGINS="*" nohup ollama serve >/dev/null 2>&1 &
    sleep 2
fi

echo "=================================================="
echo " Starting Javid Studio on http://localhost:3000"
echo "=================================================="

# Open browser automatically after 1.5 seconds
(sleep 2 && (xdg-open "http://localhost:3000" 2>/dev/null || open "http://localhost:3000" 2>/dev/null)) &

# Run Node full-stack application
npm start
EOF

chmod +x "${INSTALL_DIR}/run.sh"

# Create symlink in /usr/local/bin if permitted
if [ -w "/usr/local/bin" ]; then
    ln -sf "${INSTALL_DIR}/run.sh" /usr/local/bin/javid-studio
    echo -e "  ${GREEN}✓${NC} Created CLI command: ${BOLD}javid-studio${NC}"
else
    echo -e "  ${YELLOW}!${NC} Run with: ${BOLD}${INSTALL_DIR}/run.sh${NC} (or add alias 'javid-studio=\"${INSTALL_DIR}/run.sh\"')"
fi

# Linux Desktop Entry
if [[ "$OSTYPE" == "linux"* ]] && [ -d "${HOME}/.local/share/applications" ]; then
    cat << EOF > "${HOME}/.local/share/applications/javid-studio.desktop"
[Desktop Entry]
Name=Javid Studio
Comment=Local AI Interface & Colab-Style Runtime Monitor
Exec=${INSTALL_DIR}/run.sh
Icon=${INSTALL_DIR}/src/assets/images/javid_silhouette_glasses_1791554167543.jpg
Terminal=true
Type=Application
Categories=Development;ArtificialIntelligence;Science;
EOF
    echo -e "  ${GREEN}✓${NC} Created Linux desktop shortcut: ${BOLD}Javid Studio${NC}"
fi

# 4. Finish
echo -e "\n${GREEN}${BOLD}[5/5] Installation Complete!${NC}"
echo "=============================================================================="
echo -e "${BOLD}To start Javid Studio:${NC}"
echo -e "  1. Run:  ${CYAN}${BOLD}${INSTALL_DIR}/run.sh${NC}"
echo -e "  2. Or run CLI command: ${CYAN}${BOLD}javid-studio${NC}"
echo -e "  3. Open your browser to: ${BOLD}http://localhost:3000${NC}"
echo "=============================================================================="

read -p "Would you like to start Javid Studio now? (Y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    exec "${INSTALL_DIR}/run.sh"
fi
