import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const quotes = [
  "The potential of a child is the most intriguing and stimulating in all creation.",
  "Every student can learn, just not on the same day, or in the same way.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "A child's life is like a piece of paper on which every person leaves a mark.",
  "It is easier to build strong children than to repair broken men."
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const [characterState, setCharacterState] = useState('');
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
    
    // Check for registration success message
    if (location.state?.registrationSuccess) {
      setSuccessMessage(location.state.message);
      if (location.state.email) {
        setEmail(location.state.email);
      }
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }
  }, [location.state]);

  const handleEmailFocus = () => {
    setCharacterState('waving');
  };

  const handlePasswordFocus = () => {
    setCharacterState('hiding');
  };

  const handleInputBlur = () => {
    setCharacterState('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    setShowRegisterPrompt(false);
    
    try {
      // Use AuthContext login method
      await login(email, password);
      
      // Navigate to dashboard on success
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      
      // Handle different error scenarios
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      if (errorMessage.includes('User not found')) {
        setLoginError('User not found. Would you like to register?');
        setShowRegisterPrompt(true);
      } else if (errorMessage.includes('Invalid email or password') || errorMessage.includes('Invalid password')) {
        setLoginError('Invalid email or password. Please check your credentials.');
      } else if (errorMessage.includes('fetch')) {
        setLoginError('Unable to connect to server. Please check your internet connection.');
      } else {
        setLoginError(errorMessage || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpClick = () => {
    navigate('/register');
  };

  return (
    <>
      <style>{`
        /* ======================= Global Variables ======================= */
        :root {
            --primary-color: #4A7C7C;
            --secondary-color: #EADBC8;
            --background-color: #F7F5F2;
            --text-color: #4B5563;
            --heading-color: #333333;
            --card-bg: #FFFFFF;
            --border-color: #EAEAEA;
            --font-family: 'Poppins', sans-serif;
        }

        /* ======================= Login Modal Styles ======================= */
        .modal-page {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(74, 124, 124, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 200;
            font-family: var(--font-family);
            animation: fadeIn 0.4s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .modal-content {
            display: flex;
            align-items: stretch;
            background-color: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.05);
            width: 100%;
            max-width: 800px;
            position: relative;
            overflow: hidden;
            animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            transform-origin: center bottom;
        }
        
        @keyframes slideUp {
            from { 
                transform: translateY(30px) scale(0.95);
                opacity: 0;
            }
            to { 
                transform: translateY(0) scale(1);
                opacity: 1;
            }
        }
        
        .character-panel {
            background: linear-gradient(135deg, var(--primary-color) 0%, #3A6363 100%);
            padding: 2rem;
            text-align: center;
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 45%;
            clip-path: polygon(0 0, 100% 0, 85% 100%, 0% 100%);
            position: relative;
            overflow: hidden;
        }
        
        .character-panel::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.03"/><circle cx="80" cy="40" r="0.5" fill="white" opacity="0.02"/><circle cx="40" cy="80" r="1.5" fill="white" opacity="0.02"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grain)"/></svg>');
            pointer-events: none;
        }
        
        .modal-quote {
            font-style: italic;
            margin-top: 1.5rem;
            position: relative;
            transform: translateX(-1.6px);
        }
        
        .form-container {
            padding: 3rem;
            width: 55%;
            padding-left: 4rem;
            background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
        }
        
        .form-container h2 {
            text-align: center;
            margin-bottom: 2rem;
            color: var(--heading-color);
            font-size: 2rem;
            font-weight: 700;
            position: relative;
            padding-bottom: 1rem;
        }
        
        .form-container h2::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-color), #3A6363);
            border-radius: 2px;
        }
        
        .form-group {
            margin-bottom: 1.8rem;
            position: relative;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.6rem;
            font-weight: 600;
            color: var(--text-color);
            transition: color 0.2s ease;
        }
        
        .form-group input {
            width: 100%;
            padding: 14px 18px;
            border: 2px solid var(--border-color);
            border-radius: 12px;
            font-size: 1rem;
            font-family: var(--font-family);
            background: #F7F5F2;
            color: #333;
            outline: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
        }
        
        .form-group input:focus {
            border-color: var(--primary-color);
            background: #fff;
            box-shadow: 0 0 0 3px rgba(74, 124, 124, 0.1);
            transform: translateY(-1px);
        }
        
        .form-group input:hover:not(:focus) {
            border-color: #c0c0c0;
            transform: translateY(-0.5px);
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            font-family: var(--font-family);
        }
        
        .btn-primary {
            background: linear-gradient(135deg, var(--primary-color) 0%, #3A6363 100%);
            color: white;
            width: 100%;
            padding: 16px;
            font-size: 1.1rem;
            margin-top: 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 15px rgba(74, 124, 124, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .btn-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .btn-primary:hover::before {
            left: 100%;
        }
        
        .btn-primary:hover {
            background: linear-gradient(135deg, #3A6363 0%, var(--primary-color) 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(74, 124, 124, 0.4);
        }
        
        .btn-primary:active {
            transform: translateY(0);
            box-shadow: 0 4px 15px rgba(74, 124, 124, 0.3);
        }
        
        .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
            background: linear-gradient(135deg, #ccc 0%, #999 100%);
            box-shadow: none;
        }
        
        .btn-primary:disabled::before {
            display: none;
        }
        
        .error-message {
            background-color: #fee2e2;
            border: 2px solid #fecaca;
            color: #dc2626;
            padding: 14px;
            border-radius: 12px;
            margin: 20px 0;
            font-size: 14px;
            text-align: center;
            animation: slideDown 0.3s ease-out;
        }
        
        .success-message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #d1fae5;
            border: 1px solid #a7f3d0;
            color: #065f46;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 14px;
            text-align: center;
            animation: slideDownFromTop 0.5s ease-out;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-width: 400px;
            width: 90%;
        }
        
        .register-prompt {
            background-color: #fef3c7;
            border: 2px solid #fcd34d;
            color: #92400e;
            padding: 14px;
            border-radius: 12px;
            margin: 15px 0;
            font-size: 14px;
            text-align: center;
            animation: slideDown 0.3s ease-out;
        }
        
        .register-prompt button {
            background: linear-gradient(135deg, var(--primary-color) 0%, #3A6363 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            margin-left: 10px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(74, 124, 124, 0.3);
        }
        
        .register-prompt button:hover {
            background: linear-gradient(135deg, #3A6363 0%, var(--primary-color) 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(74, 124, 124, 0.4);
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideDownFromTop {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        .close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            border: none;
            font-size: 1.8rem;
            cursor: pointer;
            color: #666;
            z-index: 5;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .close-btn:hover {
            background: rgba(255, 255, 255, 1);
            color: #333;
            transform: rotate(90deg) scale(1.1);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        /* ======================= Interactive Character SVG ======================= */
        .interactive-character {
            width: 150px;
            height: 150px;
            filter: drop-shadow(0 4px 10px rgba(0,0,0,0.2));
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .interactive-character:hover {
            transform: scale(1.05) rotate(2deg);
        }
        
        .interactive-character .body { 
            fill: #EADBC8; 
        }
        
        .interactive-character .hair { 
            fill: #333; 
        }
        
        .interactive-character .eyes { 
            fill: #333; 
            transition: opacity 0.15s ease; 
        }
        
        .interactive-character .mouth { 
            fill: none; 
            stroke: #333; 
            stroke-width: 2; 
            stroke-linecap: round; 
        }
        
        .interactive-character .arm { 
            fill: #EADBC8; 
            stroke: #333; 
            stroke-width: 2; 
            transition: transform 0.3s ease; 
            transform-origin: center; 
        }
        
        /* ======================= Character Animations ======================= */
        .interactive-character.waving .arm-right {
            transform: rotate(-30deg) translate(-5px, 5px);
            animation: wave 1s ease-in-out infinite;
        }
        
        @keyframes wave {
            0%, 100% { transform: rotate(-30deg) translate(-5px, 5px); }
            50% { transform: rotate(-45deg) translate(-8px, 8px); }
        }
        
        .interactive-character.hiding .arm-right, 
        .interactive-character.hiding .arm-left {
            transform: translateY(-25px) scale(1.1);
            transition: transform 0.4s ease;
        }
        
        .interactive-character.hiding .eyes {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        /* ======================= Additional Styles ======================= */
        .forgot-link {
            text-align: center;
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(74, 124, 124, 0.03);
            border-radius: 12px;
            border: 1px solid rgba(74, 124, 124, 0.1);
        }
        
        .forgot-link a {
            color: var(--primary-color);
            text-decoration: none;
            font-size: 0.95rem;
            font-weight: 600;
            transition: all 0.3s ease;
            padding: 0.3rem 0.6rem;
            border-radius: 6px;
        }
        
        .forgot-link a:hover {
            text-decoration: underline;
            background: rgba(74, 124, 124, 0.1);
            color: #3A6363;
        }
        
        .demo-section {
            margin-top: 2.5rem;
            background: linear-gradient(135deg, #F7F5F2 0%, #EADBC8 100%);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            font-size: 0.95rem;
            color: #4B5563;
            border: 2px solid rgba(74, 124, 124, 0.1);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        .demo-section strong {
            color: var(--primary-color);
        }
        
        .signup-link {
            text-align: center;
            margin-top: 2rem;
            font-size: 0.95rem;
            color: #4B5563;
            padding: 1rem;
            background: rgba(74, 124, 124, 0.03);
            border-radius: 12px;
            border: 1px solid rgba(74, 124, 124, 0.1);
        }
        
        .signup-link span {
            color: var(--primary-color);
            cursor: pointer;
            text-decoration: underline;
            font-weight: 600;
            transition: all 0.3s ease;
            padding: 0.2rem 0.5rem;
            border-radius: 6px;
        }
        
        .signup-link span:hover {
            color: #3A6363;
            background: rgba(74, 124, 124, 0.1);
            text-decoration: none;
        }
        
        /* ======================= Responsive Styles ======================= */
        @media (max-width: 768px) {
            .modal-content {
                flex-direction: column;
                max-width: 95vw;
                max-height: 90vh;
                overflow-y: auto;
                border-radius: 16px;
            }
            
            .character-panel {
                width: 100%;
                clip-path: none;
                border-radius: 16px 16px 0 0;
            }
            
            .form-container {
                width: 100%;
                padding: 2rem;
                background: white;
            }
        }
        
        /* ======================= Enhanced Focus States ======================= */
        .form-group input:focus + label {
            color: var(--primary-color);
        }
      `}</style>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <div className="modal-page">
        <div className="modal-content">
          <div className="character-panel">
            <svg 
              id="login-character" 
              className={`interactive-character ${characterState}`} 
              viewBox="0 0 100 100"
            >
              <g className="body">
                <circle cx="50" cy="50" r="30"/>
              </g>
              <g className="hair">
                <path d="M 35,25 Q 50,10 65,25"/>
              </g>
              <g className="eyes">
                <circle cx="40" cy="45" r="3"/>
                <circle cx="60" cy="45" r="3"/>
              </g>
              <g className="mouth">
                <path d="M 45,60 Q 50,65 55,60"/>
              </g>
              <g className="arm arm-left">
                <path d="M 20,55 Q 30,70 40,60"/>
              </g>
              <g className="arm arm-right">
                <path d="M 80,55 Q 70,70 60,60"/>
              </g>
            </svg>
            <p className="modal-quote">"{currentQuote}"</p>
          </div>
          
          <div className="form-container">
            <button 
              className="close-btn"
              onClick={() => navigate('/')}
              type="button"
            >
              &times;
            </button>
            
            <h2>Let's Begin</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleEmailFocus}
                  onBlur={handleInputBlur}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handlePasswordFocus}
                  onBlur={handleInputBlur}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </button>
            </form>
            
            {loginError && (
              <div className="error-message">
                {loginError}
              </div>
            )}
            
            {showRegisterPrompt && (
              <div className="register-prompt">
                Don't have an account?
                <button onClick={handleSignUpClick}>
                  Register Now
                </button>
              </div>
            )}
            
            <div className="forgot-link">
              <a href="#">Forgot your password?</a>
            </div>
            
            
            
            <div className="signup-link">
              Don't have an account?{' '}
              <span onClick={handleSignUpClick}>
                Sign up
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};