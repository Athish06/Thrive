import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentRegistrationForm from '../parent/ParentRegistrationForm';

const quotes = [
  "The potential of a child is the most intriguing and stimulating in all creation.",
  "Every student can learn, just not on the same day, or in the same way.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "A child's life is like a piece of paper on which every person leaves a mark.",
  "It is easier to build strong children than to repair broken men."
];

export const RegistrationPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'parent' as 'therapist' | 'parent',
    phone: '',
    address: '',
    emergencyContact: '',
    agreeToTerms: false,
    privacyConsent: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const [characterState, setCharacterState] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showParentForm, setShowParentForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
  }, []);

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
    if (!formData.agreeToTerms || !formData.privacyConsent) return;
    
    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    setPasswordError('');
    setIsLoading(true);
    
    try {
      // Send registration data to backend API
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
          address: formData.address,
          emergencyContact: formData.emergencyContact
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const userData = await response.json();
      console.log('User registered successfully:', userData);
      
      // Navigate to login page with success notification
      navigate('/login', { 
        state: { 
          registrationSuccess: true, 
          message: 'Account created successfully! Please log in with your credentials.',
          email: formData.email 
        } 
      });
    } catch (error) {
      console.error('Registration failed:', error);
      setPasswordError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Show parent registration form when parent role is selected
    if (name === 'role' && value === 'parent') {
      setShowParentForm(true);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleParentFormSuccess = () => {
    navigate('/login', { 
      state: { 
        registrationSuccess: true, 
        message: 'Parent account created successfully! Please log in and wait for verification.',
      } 
    });
  };

  const handleParentFormClose = () => {
    setShowParentForm(false);
    setFormData(prev => ({ ...prev, role: 'therapist' })); // Reset to therapist if they close
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

        /* ======================= Registration Modal Styles ======================= */
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
            padding: 20px;
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
            max-width: 900px;
            max-height: 90vh;
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
            width: 35%;
            clip-path: polygon(0 0, 100% 0, 85% 100%, 0% 100%);
            flex-shrink: 0;
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
            font-size: 0.9rem;
        }
        
        .form-container {
            width: 65%;
            padding: 2.5rem 2rem 2.5rem 3rem;
            overflow-y: auto;
            max-height: 90vh;
            background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
        }
        
        .form-container::-webkit-scrollbar {
            width: 6px;
        }
        
        .form-container::-webkit-scrollbar-track {
            background: transparent;
        }
        
        .form-container::-webkit-scrollbar-thumb {
            background: var(--primary-color);
            border-radius: 10px;
            opacity: 0.3;
        }
        
        .form-container::-webkit-scrollbar-thumb:hover {
            opacity: 0.6;
        }
        
        .form-container h2 {
            text-align: center;
            margin-bottom: 1.5rem;
            color: var(--heading-color);
            font-size: 1.8rem;
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
            margin-bottom: 1.4rem;
            position: relative;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.6rem;
            font-weight: 600;
            color: var(--text-color);
            font-size: 0.9rem;
            transition: color 0.2s ease;
        }
        
        .form-group input, .form-group select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid var(--border-color);
            border-radius: 12px;
            font-size: 0.95rem;
            font-family: var(--font-family);
            background: #F7F5F2;
            color: #333;
            outline: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
        }
        
        .form-group input:focus, .form-group select:focus {
            border-color: var(--primary-color);
            background: #fff;
            box-shadow: 0 0 0 3px rgba(74, 124, 124, 0.1);
            transform: translateY(-1px);
        }
        
        .form-group input:hover:not(:focus), .form-group select:hover:not(:focus) {
            border-color: #c0c0c0;
            transform: translateY(-0.5px);
        }
        
        .radio-group {
            display: flex;
            gap: 2rem;
            margin-top: 0.8rem;
        }
        
        .radio-option {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            cursor: pointer;
            padding: 0.8rem 1.2rem;
            border-radius: 12px;
            border: 2px solid var(--border-color);
            transition: all 0.3s ease;
            background: #F7F5F2;
            flex: 1;
            justify-content: center;
        }
        
        .radio-option:hover {
            border-color: var(--primary-color);
            background: #fff;
            transform: translateY(-1px);
        }
        
        .radio-option input[type="radio"]:checked + span {
            color: var(--primary-color);
            font-weight: 600;
        }
        
        .radio-option:has(input[type="radio"]:checked) {
            border-color: var(--primary-color);
            background: rgba(74, 124, 124, 0.05);
            box-shadow: 0 0 0 3px rgba(74, 124, 124, 0.1);
        }
        
        .radio-option input[type="radio"] {
            width: auto;
            margin: 0;
        }
        
        .checkbox-group {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            margin: 1.2rem 0;
            padding: 1rem;
            background: rgba(74, 124, 124, 0.03);
            border-radius: 12px;
            border: 1px solid rgba(74, 124, 124, 0.1);
            transition: all 0.3s ease;
        }
        
        .checkbox-group:hover {
            background: rgba(74, 124, 124, 0.05);
            border-color: rgba(74, 124, 124, 0.2);
        }
        
        .checkbox-group input[type="checkbox"] {
            width: auto;
            margin: 0;
            margin-top: 3px;
            transform: scale(1.1);
            accent-color: var(--primary-color);
        }
        
        .checkbox-group label {
            margin: 0;
            font-size: 0.85rem;
            line-height: 1.4;
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
            padding: 14px;
            font-size: 1rem;
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
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
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
            width: 120px;
            height: 120px;
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
        .login-link {
            text-align: center;
            margin-top: 2rem;
            font-size: 0.9rem;
            color: #4B5563;
            padding: 1rem;
            background: rgba(74, 124, 124, 0.03);
            border-radius: 12px;
            border: 1px solid rgba(74, 124, 124, 0.1);
        }
        
        .login-link span {
            color: var(--primary-color);
            cursor: pointer;
            text-decoration: underline;
            font-weight: 600;
            transition: all 0.3s ease;
            padding: 0.2rem 0.5rem;
            border-radius: 6px;
        }
        
        .login-link span:hover {
            color: #3A6363;
            background: rgba(74, 124, 124, 0.1);
            text-decoration: none;
        }
        
        /* ======================= Responsive Styles ======================= */
        @media (max-width: 768px) {
            .modal-content {
                flex-direction: column;
                max-width: 95vw;
                max-height: 95vh;
                border-radius: 16px;
            }
            
            .character-panel {
                width: 100%;
                clip-path: none;
                border-radius: 16px 16px 0 0;
                padding: 1.5rem;
            }
            
            .form-container {
                width: 100%;
                padding: 2rem 1.5rem;
                max-height: 70vh;
                background: white;
            }
            
            .interactive-character {
                width: 100px;
                height: 100px;
            }
            
            .radio-group {
                flex-direction: column;
                gap: 1rem;
            }
            
            .radio-option {
                justify-content: flex-start;
            }
        }
        
        /* ======================= Enhanced Focus States ======================= */
        .form-group input:focus + label,
        .form-group select:focus + label {
            color: var(--primary-color);
        }
        
        /* ======================= Loading State ======================= */
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
      `}</style>

      <div className="modal-page">
        <div className="modal-content">
          <div className="character-panel">
            <svg 
              id="register-character" 
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
            
            <h2>Create Your Account</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Joining as</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="role"
                      value="parent"
                      checked={formData.role === 'parent'}
                      onChange={handleInputChange}
                    />
                    <span>Parent</span>
                  </label>
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => navigate('/parent-registration')}
                      className="inline-flex items-center px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
                    >
                      Complete Parent Registration
                    </button>
                    <p className="text-xs text-slate-500 mt-2">
                      Comprehensive parent registration with child verification
                    </p>
                  </div>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="role"
                      value="therapist"
                      checked={formData.role === 'therapist'}
                      onChange={handleInputChange}
                    />
                    <span>Therapist</span>
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onFocus={handleEmailFocus}
                  onBlur={handleInputBlur}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onFocus={handleEmailFocus}
                  onBlur={handleInputBlur}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={handleEmailFocus}
                  onBlur={handleInputBlur}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={handlePasswordFocus}
                  onBlur={handleInputBlur}
                  required
                  minLength={8}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onFocus={handlePasswordFocus}
                  onBlur={handleInputBlur}
                  required
                  minLength={8}
                />
                {passwordError && (
                  <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {passwordError}
                  </div>
                )}
              </div>
              
              {formData.role === 'therapist' && (
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onFocus={handleEmailFocus}
                    onBlur={handleInputBlur}
                    required
                  />
                </div>
              )}
              
              {formData.role === 'parent' && (
                <>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onFocus={handleEmailFocus}
                      onBlur={handleInputBlur}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange}
                      onFocus={handleEmailFocus}
                      onBlur={handleInputBlur}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="emergencyContact">Emergency Contact</label>
                    <input
                      id="emergencyContact"
                      name="emergencyContact"
                      type="text"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      onFocus={handleEmailFocus}
                      onBlur={handleInputBlur}
                      placeholder="Name and phone number"
                    />
                  </div>
                </>
              )}
              
              <div className="checkbox-group">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="agreeToTerms">
                  I agree to the Terms of Service
                </label>
              </div>
              
              <div className="checkbox-group">
                <input
                  id="privacyConsent"
                  name="privacyConsent"
                  type="checkbox"
                  checked={formData.privacyConsent}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="privacyConsent">
                  I consent to the Privacy Policy
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !formData.agreeToTerms || !formData.privacyConsent}
                className="btn btn-primary"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            
            <div className="login-link">
              Already have an account?{' '}
              <span onClick={handleLoginClick}>
                Sign in
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Parent Registration Form Modal */}
      {showParentForm && (
        <ParentRegistrationForm
          onSuccess={handleParentFormSuccess}
          onClose={handleParentFormClose}
        />
      )}
    </>
  );
};

export default RegistrationPage;