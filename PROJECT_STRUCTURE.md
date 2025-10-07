# craftGPT - Modular Project Structure

A minimalist ChatGPT-like interface with automatic dark mode, file upload, and voice input capabilities.

## 📁 Project Structure

```
ethos/
├── templates/
│   ├── index.html              # Original single-file version
│   └── index_modular.html      # New modular version (recommended)
├── static/
│   ├── css/
│   │   └── style.css          # All styles (theming, components, responsive)
│   └── js/
│       └── app.js             # All JavaScript functionality
├── sample_data/
│   ├── output.csv
│   ├── test.csv
│   └── train.csv
├── uploads/                    # File upload directory
└── README.md                   # This file
```

## 🎨 Features

### Design
- **Minimalist Interface**: Clean ChatGPT-inspired design
- **Light Green Theme**: Primary accent color `#10b981`
- **Automatic Dark Mode**: System preference detection via CSS `prefers-color-scheme`
- **Space Grotesk Font**: Modern, professional typography
- **Fully Responsive**: Mobile-first design with hamburger menu

### Functionality
- **Chat Interface**: Real-time message display with user/assistant avatars
- **Welcome Screen**: 5 prompt suggestion buttons (auto-hides on first message)
- **File Upload**: Drag-and-drop support with 5MB limit validation
- **Voice Input**: Web Speech Recognition API integration
- **CSV Command**: Quick access button for CSV processing
- **Custom Icons**: Pure CSS-drawn icons (document + microphone)
- **Mobile Menu**: Two-line animated toggle button

## 🚀 Getting Started

### Using Modular Version

Open `templates/index_modular.html` in your browser:

```bash
# Simple Python server
cd ethos
python -m http.server 8000

# Then visit: http://localhost:8000/templates/index_modular.html
```

### File Organization

**CSS (`static/css/style.css`)**
- CSS Variables (theming)
- Dark mode support
- Component styles (sidebar, chat, messages, inputs)
- Custom icons (file, microphone)
- Responsive breakpoints (768px, 480px)

**JavaScript (`static/js/app.js`)**
- Mobile menu toggle
- Prompt button handlers
- File upload validation (5MB limit)
- Voice recognition setup
- Message handling (add, display, escape HTML)
- New chat functionality

**HTML (`templates/index_modular.html`)**
- Semantic HTML5 structure
- Accessibility attributes (ARIA labels)
- External CSS/JS references
- Clean, maintainable markup

## 🎨 Color Palette

### Light Theme
- Background: `#f7faf8`
- Text: `#1a202c`
- Accent: `#10b981`
- User Message: `#d1fae5`
- Assistant Message: `#f7fafc`

### Dark Theme
- Background: `#0f1419`
- Text: `#e2e8f0`
- Accent: `#10b981` (same)
- User Message: `#1e4d3a`
- Assistant Message: `#252b3b`

## 🔧 Customization

### Changing Colors

Edit `static/css/style.css`:

```css
:root {
    --accent-primary: #10b981;  /* Change this */
    --accent-hover: #059669;    /* Change this */
}
```

### Adding Features

1. **Update HTML**: Add markup to `templates/index_modular.html`
2. **Style It**: Add CSS to `static/css/style.css`
3. **Add Logic**: Implement JS in `static/js/app.js`

### Backend Integration

Replace the mock response in `static/js/app.js`:

```javascript
// Current (line ~172):
setTimeout(() => {
    addMessage('This is a frontend-only demo...', 'assistant');
}, 500);

// Replace with:
fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message, file: selectedFile })
})
.then(res => res.json())
.then(data => addMessage(data.response, 'assistant'));
```

## 📱 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Voice Input**: Chrome, Edge (Web Speech API)
- **Dark Mode**: All modern browsers (CSS `prefers-color-scheme`)

## 🛠️ Dependencies

- **Google Fonts**: Space Grotesk (via CDN)
- **No JavaScript frameworks**: Vanilla JS
- **No CSS frameworks**: Pure CSS with custom properties

## 📄 Version Comparison

| Feature | `index.html` | `index_modular.html` |
|---------|--------------|----------------------|
| All-in-one | ✅ Single file | ❌ Multiple files |
| Maintainable | ❌ Hard to edit | ✅ Easy to edit |
| Modular | ❌ No | ✅ Yes |
| Production-ready | ✅ Works | ✅ Better organized |
| Load time | ⚡ Fastest | ⚡ Fast (cached) |

## 🎯 Next Steps

1. **Add Backend**: Connect to your chat API (Python Flask, Node.js, etc.)
2. **File Processing**: Implement CSV parsing and analysis
3. **Chat History**: Add persistence (LocalStorage or database)
4. **Authentication**: Add user login system
5. **Streaming**: Implement real-time response streaming
6. **Markdown Support**: Add markdown rendering for code blocks

## 📝 License

This project is open source and available for modification.

## 🙏 Credits

- Design inspired by ChatGPT
- Icons: Custom CSS drawings
- Font: Space Grotesk by Florian Karsten
