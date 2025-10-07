"""
Agentic Reasoning System - Web Application

A modern web interface for the Agentic Reasoning System with ChatGPT-like UI,
CSV file handling, and real-time reasoning visualization.

Author: Agentic Reasoning System
License: MIT
"""

import os
import json
import csv
import io
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from flask import Flask, render_template, request, jsonify, send_file, session
from werkzeug.utils import secure_filename
import uuid

# Setup logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import our reasoning system components
from enhanced_agentic_system import EnhancedAgenticReasoningSystem
from evaluation_framework import EvaluationFramework
from data_processor import DataProcessingPipeline

# Try to import Gemini integration
try:
    from gemini_integration import GeminiEnhancedAgenticSystem
    GEMINI_AVAILABLE = True
    logger.info("Gemini integration available")
except ImportError as e:
    GEMINI_AVAILABLE = False
    logger.warning(f"Gemini integration not available: {e}")

# Setup Flask app
app = Flask(__name__)
app.secret_key = 'agentic_reasoning_secret_key_2024'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('static/output', exist_ok=True)

# Global system instances
reasoning_system = None
evaluation_framework = None
current_mode = None


def should_use_gemini() -> bool:
    """Determine whether Gemini should be used based on environment variables."""
    env_flag = os.environ.get('USE_GEMINI')
    api_key = os.environ.get('GOOGLE_API_KEY')

    if env_flag is None:
        # If no explicit flag, fall back to auto detection: enable when API key is present
        return bool(api_key)

    env_flag = env_flag.strip().lower()
    return env_flag in {'1', 'true', 'yes', 'on'}


def initialize_systems():
    """Initialize the reasoning systems."""
    global reasoning_system, evaluation_framework, current_mode

    desired_mode = 'gemini' if should_use_gemini() else 'local'

    # Rebuild systems if this is the first time or the desired mode changed
    if reasoning_system is None or current_mode != desired_mode:
        reasoning_system = None

        if desired_mode == 'gemini':
            if not GEMINI_AVAILABLE:
                logger.warning("Gemini package unavailable (install google-generativeai). Falling back to local mode.")
                desired_mode = 'local'
            elif not os.environ.get('GOOGLE_API_KEY'):
                logger.warning("GOOGLE_API_KEY not detected. Set the variable to enable Gemini. Falling back to local mode.")
                desired_mode = 'local'

        if desired_mode == 'gemini':
            try:
                reasoning_system = GeminiEnhancedAgenticSystem(use_hybrid=True)
                logger.info("✓ Gemini-Enhanced Agentic System initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini system: {e}. Falling back to local system.")
                desired_mode = 'local'
                reasoning_system = EnhancedAgenticReasoningSystem()
        
        if desired_mode == 'local':
            if reasoning_system is None:
                reasoning_system = EnhancedAgenticReasoningSystem()
            logger.info("✓ Local Agentic Reasoning System initialized")

        current_mode = desired_mode

        evaluation_framework = EvaluationFramework(EnhancedAgenticReasoningSystem)
        logger.info("Agentic reasoning systems initialized")


class ReasoningSession:
    """Context manager for reasoning sessions."""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.start_time = datetime.now()
        self.results = []
        self.traces = []
    
    def add_result(self, result: Dict[str, Any]):
        """Add a result to the session."""
        self.results.append({
            'timestamp': datetime.now().isoformat(),
            'result': result
        })
    
    def add_trace(self, trace: Dict[str, Any]):
        """Add a reasoning trace."""
        self.traces.append({
            'timestamp': datetime.now().isoformat(),
            'trace': trace
        })
    
    def get_session_summary(self) -> Dict[str, Any]:
        """Get session summary."""
        return {
            'session_id': self.session_id,
            'start_time': self.start_time.isoformat(),
            'duration': (datetime.now() - self.start_time).total_seconds(),
            'total_problems': len(self.results),
            'results': self.results,
            'traces': self.traces
        }


# Sessions storage
active_sessions: Dict[str, ReasoningSession] = {}


@app.route('/')
def index():
    """Main application page."""
    initialize_systems()
    return render_template('index.html')


@app.route('/api/message', methods=['POST'])
def process_message():
    """Process user messages and return reasoning results."""
    try:
        initialize_systems()
        
        data = request.get_json()
        message = data.get('message', '').strip()
        session_id = data.get('session_id', str(uuid.uuid4()))
        
        if not message:
            return jsonify({'error': 'Empty message'}), 400
        
        # Initialize session if needed
        if session_id not in active_sessions:
            active_sessions[session_id] = ReasoningSession(session_id)
        
        session_obj = active_sessions[session_id]
        
        # Generate unique problem ID
        problem_id = f"problem_{len(session_obj.results) + 1}"
        
        # Process the problem
        logger.info(f"Processing problem: {message[:100]}...")
        
        result = reasoning_system.solve(message, problem_id)
        
        # Add to session
        session_obj.add_result(result)
        
        # Get reasoning traces
        traces = reasoning_system.trace_manager.get_traces()
        formatted_traces = []
        
        for trace in traces[-10:]:  # Last 10 traces for display
            formatted_traces.append({
                'step_id': trace.step_id,
                'description': trace.description,
                'subproblem_id': trace.subproblem_id,
                'tool_used': trace.tool_used.value if trace.tool_used else None,
                'confidence': trace.confidence,
                'timestamp': trace.timestamp.isoformat()
            })
        
        response = {
            'success': True,
            'session_id': session_id,
            'result': {
                'problem_id': result.get('problem_id'),
                'final_answer': result['final_answer'],
                'confidence': result['overall_confidence'],
                'execution_time': result['execution_time'],
                'success': result['success'],
                'subproblems_count': len(result['subproblems']),
                'reasoning_steps': result['reasoning_steps'],
                'verification_passed': result['verification_passed']
            },
            'reasoning_traces': formatted_traces,
            'performance_stats': reasoning_system.get_performance_stats()
        }
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/upload_csv', methods=['POST'])
def upload_csv():
    """Handle CSV file upload and processing."""
    try:
        initialize_systems()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.lower().endswith('.csv'):
            return jsonify({'error': 'Only CSV files are allowed'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Process CSV file
        session_id = str(uuid.uuid4())
        active_sessions[session_id] = ReasoningSession(session_id)
        
        # Read and analyze CSV
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        
        if not rows:
            return jsonify({'error': 'CSV file is empty'}), 400
        
        # Validate required columns with support for new schema
        header_map = {col.strip().lower(): col for col in rows[0].keys()}

        has_problem_text = any(key in header_map for key in ['problem', 'problem_statement'])
        if not has_problem_text:
            return jsonify({
                'error': "CSV must include a 'problem' or 'problem_statement' column."
            }), 400

        # 'id' column is optional because the pipeline can generate IDs
        
        # Process each row
        results = []
        processing_results = []
        
        try:
            pipeline = DataProcessingPipeline(EnhancedAgenticReasoningSystem)
            result = pipeline.process_dataset(
                input_file=filepath,
                output_file='static/output/processed_results.csv',
                batch_size=5,
                detailed_output=True,
                generate_report=True
            )
            
            # Read processed results
            if os.path.exists('static/output/processed_results.csv'):
                with open('static/output/processed_results.csv', 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    results = list(reader)
            
            processing_results = {
                'status': result['status'],
                'total_problems': result.get('total_problems', len(rows)),
                'results_count': result.get('results_count', len(results)),
                'statistics': result.get('statistics', {}),
                'output_file': 'processed_results.csv'
            }
        
        except Exception as e:
            processing_results = {
                'status': 'error',
                'error': str(e),
                'total_problems': len(rows),
                'results_count': 0
            }
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'filename': filename,
            'file_info': {
                'rows_count': len(rows),
                'columns': list(rows[0].keys()),
                'sample_rows': rows[:3]
            },
            'processing_results': processing_results,
            'results': results[:5]  # First 5 results for preview
        })
    
    except Exception as e:
        logger.error(f"Error processing CSV: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/download/<filename>')
def download_file(filename):
    """Download processed CSV file."""
    try:
        file_path = os.path.join('static/output', filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/session/<session_id>')
def get_session(session_id: str):
    """Get session data."""
    if session_id in active_sessions:
        return jsonify({
            'success': True,
            'session': active_sessions[session_id].get_session_summary()
        })
    else:
        return jsonify({'error': 'Session not found'}), 404


@app.route('/api/clear_session/<session_id>', methods=['DELETE'])
def clear_session(session_id: str):
    """Clear session data."""
    if session_id in active_sessions:
        del active_sessions[session_id]
        return jsonify({'success': True, 'message': 'Session cleared'})
    else:
        return jsonify({'error': 'Session not found'}), 404


@app.route('/api/capabilities')
def get_capabilities():
    """Get system capabilities information."""
    return jsonify({
        'problem_types': [
            'Arithmetic calculations',
            'Logical reasoning',
            'Geometric problems',
            'Algebraic equations',
            'Word problems'
        ],
        'tools': [
            'Calculator Tool',
            'Symbolic Solver Tool',
            'Rule Engine Tool',
            'Geometric Calculator Tool',
            'Text Parser Tool'
        ],
        'features': [
            'Real-time reasoning traces',
            'Confidence scoring',
            'Result verification',
            'CSV batch processing',
            'Performance metrics'
        ]
    })


# Error handlers
@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large'}), 413


@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("Agentic Reasoning System - Web Application")
    print("=" * 50)
    print("Starting Flask development server...")
    print("Access the application at: http://localhost:5000")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
