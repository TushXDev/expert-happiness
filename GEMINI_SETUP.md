# 🚀 Setup Guide - Connect to Google Gemini API# Google Gemini API Integration - Setup Guide



This guide will help you connect your chatbot frontend to Google Gemini API for testing.## 🚀 Quick Setup (3 Steps)



## 📋 Prerequisites### Step 1: Install Google Gemini API

```powershell

1. **Google Gemini API Key**pip install google-generativeai

   - Visit: https://makersuite.google.com/app/apikey```

   - Sign in with your Google account

   - Click "Create API Key"### Step 2: Get Your API Key

   - Copy your API key1. Visit: https://makersuite.google.com/app/apikey

2. Click "Create API Key"

2. **Python 3.8+** (for backend option)3. Copy your API key



---### Step 3: Set Environment Variable

```powershell

## 🎯 Two Options to Connect# Windows PowerShell

$env:GOOGLE_API_KEY="your-actual-api-key-here"

### **Option 1: Backend API (Recommended - Secure)**

# USE_GEMINI is now optional – it's auto-enabled when a key is present

This option uses a Flask backend to keep your API key secure.# Set it explicitly only if you want to force on/off behaviour

# $env:USE_GEMINI="true"

#### Step 1: Install Required Packages

# Then start the app

Open PowerShell in your project directory and run:python app.py

```

```powershell

pip install flask google-generativeai flask-corsThat's it! When the API key is present, the app automatically switches to Google Gemini AI! 🎉

```

---

#### Step 2: Set Your API Key

## 📋 Detailed Setup

**Option A - Environment Variable (Recommended):**

```powershell### Install Requirements

$env:GEMINI_API_KEY="your_actual_api_key_here"```powershell

```# Install all dependencies including Gemini

pip install -r requirements.txt

**Option B - Edit File:**```

Open `backend_gemini.py` and replace:

```python### Configure API Key

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'YOUR_API_KEY_HERE')

```**Option 1: Environment Variable (Recommended)**

with:```powershell

```python# Windows PowerShell

GEMINI_API_KEY = 'your_actual_api_key_here'$env:GOOGLE_API_KEY="your-actual-api-key-here"

```

# Optional: override automatic detection

#### Step 3: Update Frontend to Use Backend# $env:USE_GEMINI="true"   # Force Gemini on

# $env:USE_GEMINI="false"  # Force local-only mode

The JavaScript is currently set to call Gemini directly. You need to update it to use the backend.

# Linux/Mac

Open `static/js/app.js` and find the `callGeminiAPI` method (around line 325).export GOOGLE_API_KEY="your-actual-api-key-here"

# export USE_GEMINI="true"   # Optional override

Replace the entire method with this backend version:```



```javascript**Option 2: In Code (Not Recommended)**

async callGeminiAPI(userMessage) {Edit `gemini_integration.py`:

    try {```python

        // Call Flask backend instead of Gemini directlysystem = GeminiEnhancedAgenticSystem(

        const response = await fetch('/api/chat', {    api_key="your-api-key-here",

            method: 'POST',    use_hybrid=True

            headers: {)

                'Content-Type': 'application/json'```

            },

            body: JSON.stringify({### Start the Application

                message: userMessage```powershell

            })python app.py

        });```



        if (!response.ok) {Open browser: http://localhost:5000

            throw new Error(`API Error: ${response.status}`);

        }---



        const reasoningResponse = await response.json();## 🎯 How It Works



        // Display reasoning response with streaming### Three Modes Available

        this.addReasoningMessage(reasoningResponse, 'assistant');

        this.saveCurrentChat();#### 1. **Gemini-Only Mode** (Pure Google AI)

```powershell

    } catch (error) {$env:USE_GEMINI="true"

        console.error('API Error:', error);$env:GOOGLE_API_KEY="your-key"

        this.addMessage(`Sorry, I encountered an error: ${error.message}`, 'assistant');python app.py

        this.saveCurrentChat();```

    }- Uses Google Gemini for all reasoning

}- Best for: Complex natural language problems

```- Response time: ~2-5 seconds



#### Step 4: Run the Backend#### 2. **Hybrid Mode** (Local + Gemini)

```powershell

```powershell$env:USE_GEMINI="true"

python backend_gemini.py$env:GOOGLE_API_KEY="your-key"

```# In gemini_integration.py, set use_hybrid=True

python app.py

You should see:```

```- Uses local reasoning first

🚀 Starting Flask server on http://localhost:5000- Enhances with Gemini if confidence < 70%

📝 Make sure to set your GEMINI_API_KEY environment variable- Best for: Mix of math and reasoning problems

```- Response time: ~0.5-3 seconds



#### Step 5: Open Your Browser#### 3. **Local-Only Mode** (No API Required)

```powershell

Navigate to: **http://localhost:5000**# Don't set USE_GEMINI or set it to false

$env:USE_GEMINI="false"

Your chatbot is now live with Gemini AI! 🎉python app.py

```

---- Uses built-in reasoning system

- Best for: Math, logic, calculations

### **Option 2: Direct Frontend Call (Quick Test Only)**- Response time: ~0.1-0.5 seconds



⚠️ **WARNING:** This exposes your API key in the browser. Only use for local testing!---



#### Step 1: Add Your API Key## 🧪 Test Your Setup



Open `static/js/app.js` and find line ~327:### Test Script

Create `test_gemini.py`:

```javascript```python

const API_KEY = 'YOUR_GEMINI_API_KEY_HERE';import os

```from gemini_integration import GeminiEnhancedAgenticSystem



Replace with your actual API key:# Set your API key

os.environ['GOOGLE_API_KEY'] = 'your-key-here'

```javascript

const API_KEY = 'AIzaSyC...your_actual_key_here';# Initialize system

```system = GeminiEnhancedAgenticSystem(use_hybrid=True)



#### Step 2: Open HTML Directly# Test

result = system.solve("What is 25 + 17 * 3?")

Simply open `templates/index_modular.html` in your browser.print(f"Answer: {result['final_answer']}")

print(f"Confidence: {result['overall_confidence']:.2%}")

The frontend will call Gemini API directly from the browser.print(f"Method: {result.get('reasoning_method', 'unknown')}")

```

---

Run:

## 🧪 Testing the Integration```powershell

python test_gemini.py

1. **Send a test message:**```

   ```

   What is machine learning?Expected output:

   ``````

Answer: 76

2. **You should see:**Confidence: 95.00%

   - Reasoning steps appear one-by-one with animationMethod: hybrid

   - Each step numbered (1, 2, 3...)```

   - Final answer highlighted in green box

---

3. **Test persistence:**

   - Refresh the page## 🔧 Configuration Options

   - Your chat should reload from localStorage

   - Reasoning steps should all appear instantly (no animation)### Model Selection



---Edit `gemini_integration.py` or pass parameters:

```python

## 🐛 Troubleshooting# Use different Gemini models

system = GeminiEnhancedAgenticSystem(

### Error: "API Error: 400"    model_name="gemini-pro",        # Default, balanced

- **Cause:** Invalid API key or malformed request    # model_name="gemini-1.5-pro",  # More advanced (if available)

- **Fix:** Double-check your API key is correct    # model_name="gemini-pro-vision",  # For image input

    use_hybrid=True

### Error: "API Error: 429")

- **Cause:** Rate limit exceeded```

- **Fix:** Wait a few minutes or upgrade your API plan

### Generation Parameters

### JSON Parse Error in Console

- **Cause:** Gemini returned non-JSON responseIn `gemini_integration.py`, adjust `generation_config`:

- **Fix:** The code has fallback handling - it will display as regular message```python

self.generation_config = {

### CORS Error (Option 2 only)    'temperature': 0.7,        # 0=deterministic, 1=creative

- **Cause:** Browser blocking direct API calls    'top_p': 0.95,            # Nucleus sampling

- **Fix:** Use Option 1 (Backend API) instead    'top_k': 40,              # Top-k sampling

    'max_output_tokens': 2048, # Max response length

### "Module not found: flask"}

- **Cause:** Flask not installed```

- **Fix:** Run `pip install flask google-generativeai`

### Safety Settings

### Port 5000 Already in Use

- **Cause:** Another app using port 5000Adjust content filtering:

- **Fix:** Edit `backend_gemini.py` line 80:```python

  ```pythonself.safety_settings = [

  app.run(debug=True, port=5001, host='0.0.0.0')    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},

  ```    # Options: BLOCK_NONE, BLOCK_ONLY_HIGH, BLOCK_MEDIUM_AND_ABOVE, BLOCK_LOW_AND_ABOVE

]

---```



## 📊 API Response Format---



Your backend returns JSON in this format:## 📊 Features



```json### What Works with Gemini

{

  "reasoning_steps": [✅ **Natural Language Problems**

    "Step 1: Understanding the question",- "Explain why the sky is blue"

    "Step 2: Analyzing key concepts",- "What's the capital of France?"

    "Step 3: Formulating response"- "How do I solve this word problem?"

  ],

  "final_answer": "Machine learning is a subset of artificial intelligence..."✅ **Complex Reasoning**

}- Multi-step logic problems

```- Contextual understanding

- Ambiguous questions

The frontend automatically:

1. Parses this JSON✅ **Math & Calculations**

2. Streams reasoning steps with 400ms delays- Arithmetic: "What is 15 + 27 * 3?"

3. Displays final answer in highlighted box- Algebra: "Solve for x: 2x + 5 = 15"

4. Saves everything to localStorage- Word problems with context



---✅ **CSV Batch Processing**

- Upload CSV files

## 🎨 Customization- Process multiple problems

- Download results with Gemini answers

### Adjust Streaming Speed

✅ **Hybrid Intelligence**

Edit `static/js/app.js` around line 490:- Fast local calculations

- Gemini for complex reasoning

```javascript- Best of both worlds

await new Promise(resolve => setTimeout(resolve, 400)); // Change 400 to desired ms

```### Response Structure



### Change Number of Reasoning Steps```json

{

The prompt in `backend_gemini.py` (line 37) or `app.js` (line 335) controls this:    "problem_id": "problem_1",

    "final_answer": "76",

```python    "overall_confidence": 0.95,

"reasoning_steps": ["step 1 explanation", "step 2 explanation", "step 3 explanation"],    "reasoning_method": "hybrid",

```    "reasoning_steps": [

        {"step": 1, "description": "...", "result": "..."}

Add more examples to encourage more steps from Gemini.    ],

    "execution_time": 1.23,

### Modify Styling    "timestamp": "2025-10-04T22:50:00"

}

Edit `static/css/style.css` - look for:```

- `.reasoning-step` - Individual step styling

- `.step-number` - Circular badge---

- `.reasoning-answer` - Final answer box

## 💡 Usage Examples

---

### In Web Interface

## 🔒 Security Best Practices

1. **Start with Gemini enabled:**

**For Production:**   ```powershell

   $env:GOOGLE_API_KEY="your-key"

1. ✅ **Never expose API keys in frontend code**   $env:USE_GEMINI="true"

2. ✅ **Use environment variables**   python app.py

3. ✅ **Implement rate limiting**   ```

4. ✅ **Add authentication**

5. ✅ **Use HTTPS**2. **Ask questions:**

6. ✅ **Validate user input**   - "What is the meaning of life?"

7. ✅ **Add error logging**   - "Solve: 15 + 27 * 3 - 8"

   - "If all cats are mammals..."

---

3. **Upload CSV:**

## 📝 Next Steps   - Menu → Upload CSV

   - Gemini processes each problem

1. ✅ Get Gemini API key   - Download results

2. ✅ Choose Option 1 (Backend) or Option 2 (Direct)

3. ✅ Install dependencies (if using backend)### In Python Code

4. ✅ Set API key

5. ✅ Update frontend code (if using backend)```python

6. ✅ Run the serverfrom gemini_integration import GeminiEnhancedAgenticSystem

7. ✅ Test the chatbotimport os

8. ✅ Enjoy your AI-powered reasoning chatbot! 🎉

# Set API key

---os.environ['GOOGLE_API_KEY'] = 'your-key'



## 🆘 Need Help?# Initialize

system = GeminiEnhancedAgenticSystem(use_hybrid=True)

- **Gemini API Docs:** https://ai.google.dev/docs

- **Flask Docs:** https://flask.palletsprojects.com/# Single problem

- **Project Structure:** See `PROJECT_STRUCTURE.md`result = system.solve("What is 2 + 2?")

print(result['final_answer'])

---

# Batch processing

**Current Status:** ✅ Frontend ready | ⏳ Backend template ready | 🔧 Need to add API keyproblems = ["Problem 1", "Problem 2", "Problem 3"]

for prob in problems:
    result = system.solve(prob)
    print(f"{prob}: {result['final_answer']}")

# Get statistics
stats = system.get_stats()
print(f"Total solved: {stats['total_problems']}")
```

### CSV Processing with Gemini

```python
from gemini_integration import GeminiEnhancedAgenticSystem
from data_processor import DataProcessingPipeline
import os

os.environ['GOOGLE_API_KEY'] = 'your-key'

# Create pipeline with Gemini system
pipeline = DataProcessingPipeline(GeminiEnhancedAgenticSystem)

# Process dataset
result = pipeline.process_dataset(
    input_file='problems.csv',
    output_file='gemini_results.csv',
    batch_size=5
)

print(f"Processed: {result['total_problems']} problems")
print(f"Success rate: {result['statistics']['success_rate']:.1%}")
```

---

## 🔍 Troubleshooting

### "Import google.generativeai could not be resolved"
```powershell
pip install google-generativeai
```

### "Google API key not provided"
```powershell
# Set the environment variable
$env:GOOGLE_API_KEY="your-actual-key-here"

# Verify it's set
echo $env:GOOGLE_API_KEY
```

### "Gemini integration not available"
1. Check installation: `pip list | Select-String google-generativeai`
2. Reinstall: `pip install --upgrade google-generativeai`
3. Check API key is set: `echo $env:GOOGLE_API_KEY`

### "Invalid API key"
1. Verify key at: https://makersuite.google.com/app/apikey
2. Generate new key if needed
3. Check for extra spaces in key

### Slow responses
- Gemini API calls take 2-5 seconds
- Use hybrid mode for faster local calculations
- Consider caching results

### Rate limiting
- Free tier: 60 requests per minute
- Implement delays between requests:
  ```python
  import time
  time.sleep(1)  # Wait 1 second between requests
  ```

---

## 📈 Performance Comparison

| Feature | Local System | Gemini-Only | Hybrid Mode |
|---------|--------------|-------------|-------------|
| Math problems | ⚡ 0.1s | 🐢 3s | ⚡ 0.1s |
| Logic problems | ✅ Good | ✅✅ Excellent | ✅✅ Excellent |
| Natural language | ❌ Limited | ✅✅ Excellent | ✅✅ Excellent |
| Complex reasoning | ✅ Good | ✅✅ Excellent | ✅✅ Excellent |
| Response time | ⚡ Fast | 🐢 Slow | ⚡ Balanced |
| API required | ❌ No | ✅ Yes | ✅ Yes |
| Cost | 💚 Free | 💛 API costs | 💛 API costs |

---

## 💰 Pricing

### Google Gemini API
- **Free tier**: 60 requests/minute
- **Paid tier**: Higher limits
- Check current pricing: https://ai.google.dev/pricing

### Recommendations
- Use hybrid mode to minimize API calls
- Cache common results
- Use local system for math problems
- Use Gemini for complex reasoning

---

## 🎓 Best Practices

### 1. Use Hybrid Mode
```python
system = GeminiEnhancedAgenticSystem(use_hybrid=True)
```
- Faster for simple problems
- Gemini for complex ones
- Best overall experience

### 2. Set Confidence Threshold
Adjust when to use Gemini:
```python
# In gemini_integration.py, line ~350
if local_result.get('overall_confidence', 0) < 0.7:  # Adjust this
    # Use Gemini
```

### 3. Handle Errors Gracefully
```python
try:
    result = system.solve(problem)
    if result['success']:
        print(result['final_answer'])
    else:
        print(f"Error: {result['error']}")
except Exception as e:
    print(f"Failed: {e}")
```

### 4. Monitor Usage
```python
stats = system.get_stats()
print(f"Gemini calls: {stats['gemini_solutions']}")
print(f"Local solutions: {stats['hybrid_solutions'] - stats['gemini_solutions']}")
```

---

## 📚 Additional Resources

- **Gemini API Docs**: https://ai.google.dev/docs
- **Get API Key**: https://makersuite.google.com/app/apikey
- **Pricing**: https://ai.google.dev/pricing
- **Python SDK**: https://github.com/google/generative-ai-python

---

## ✅ Quick Checklist

- [ ] Install google-generativeai: `pip install google-generativeai`
- [ ] Get API key from: https://makersuite.google.com/app/apikey
- [ ] Set environment variable: `$env:GOOGLE_API_KEY="your-key"`
- [ ] Enable Gemini: `$env:USE_GEMINI="true"`
- [ ] Start app: `python app.py`
- [ ] Test in browser: http://localhost:5000
- [ ] Verify Gemini is working (check logs)

---

## 🎉 You're All Set!

Your agentic AI system now has Google Gemini integration! 

**Start the app:**
```powershell
$env:GOOGLE_API_KEY="your-key-here"
$env:USE_GEMINI="true"
python app.py
```

**Open:** http://localhost:5000

Enjoy the power of Google's AI! 🚀
