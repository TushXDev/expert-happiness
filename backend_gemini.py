"""
Simple Flask Backend for Gemini API Integration
Run this file to test the frontend with Gemini API safely
"""

from flask import Flask, request, jsonify, render_template, send_from_directory
import google.generativeai as genai
import os
import json

app = Flask(__name__)

# Configure Gemini API
# Set your API key as environment variable or replace here
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'YOUR_API_KEY_HERE')
genai.configure(api_key=GEMINI_API_KEY)

# Initialize Gemini model
model = genai.GenerativeModel('gemini-pro')

@app.route('/')
def index():
    return render_template('index_modular.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')

        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Craft prompt for structured reasoning response
        prompt = f"""You are a technical assistant. For the following question, provide your response as a JSON object with this exact structure:
{{
  "reasoning_steps": ["step 1 explanation", "step 2 explanation", "step 3 explanation"],
  "final_answer": "your complete answer here"
}}

Make your reasoning steps clear and logical. Each step should explain your thought process.

User question: {user_message}

Response (JSON only, no markdown):"""

        # Generate response from Gemini
        response = model.generate_content(prompt)
        generated_text = response.text

        # Parse JSON response
        try:
            # Remove markdown code blocks if present
            cleaned_text = generated_text.replace('```json', '').replace('```', '').strip()
            reasoning_response = json.loads(cleaned_text)
            
            # Validate structure
            if 'reasoning_steps' not in reasoning_response or 'final_answer' not in reasoning_response:
                raise ValueError('Invalid JSON structure')
                
            return jsonify(reasoning_response)
            
        except (json.JSONDecodeError, ValueError) as parse_error:
            print(f"JSON Parse Error: {parse_error}")
            # Fallback: return as structured response
            return jsonify({
                'reasoning_steps': [
                    'Received and processed user query',
                    'Generated response from AI model',
                    'Formatting response for display'
                ],
                'final_answer': generated_text
            })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'reasoning_steps': ['Error occurred during processing'],
            'final_answer': f'Sorry, I encountered an error: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Flask server on http://localhost:5000")
    print("📝 Make sure to set your GEMINI_API_KEY environment variable")
    app.run(debug=True, port=5000, host='0.0.0.0')
