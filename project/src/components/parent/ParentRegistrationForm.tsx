import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Baby, MapPin, Shield, CheckCircle } from 'lucide-react';
import Stepper, { Step } from '../ui/Stepper';

interface ParentRegistrationData {
  // User Account Information (also serves as Parent Information)
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Child Verification Details
  childFirstName: string;
  childLastName: string;
  childDob: string;
  
  // Contact Information
  phone: string;
  alternatePhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Relationship Details
  relationToChild: string;
  
  // Terms and Privacy
  agreeToTerms: boolean;
  privacyConsent: boolean;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface ParentRegistrationFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const ParentRegistrationForm: React.FC<ParentRegistrationFormProps> = ({
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<ParentRegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    childFirstName: '',
    childLastName: '',
    childDob: '',
    phone: '',
    alternatePhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    relationToChild: '',
    agreeToTerms: false,
    privacyConsent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (field: keyof ParentRegistrationData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1: // User Account Information
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;

      case 2: // Child Verification
        if (!formData.childFirstName.trim()) newErrors.childFirstName = 'Child first name is required';
        if (!formData.childLastName.trim()) newErrors.childLastName = 'Child last name is required';
        if (!formData.childDob) newErrors.childDob = 'Child date of birth is required';
        if (!formData.relationToChild) newErrors.relationToChild = 'Relationship to child is required';
        break;

      case 3: // Contact Information
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
        break;

      case 4: // Terms and Confirmation
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms of service';
        if (!formData.privacyConsent) newErrors.privacyConsent = 'You must consent to the privacy policy';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      // Step 1: Verify child details to get child_id
      console.log('Verifying child details...');
      const verifyResponse = await fetch('http://localhost:8000/api/verify-child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childFirstName: formData.childFirstName,
          childLastName: formData.childLastName,
          childDob: formData.childDob
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.detail || 'Child verification failed. Please check the child details.');
      }

      const verifyData = await verifyResponse.json();
      const childId = verifyData.child_id;
      
      if (!childId) {
        throw new Error('No matching child found in our records. Please verify the child details or contact support.');
      }

      console.log('Child verified successfully. Child ID:', childId);

      // Step 2: Register parent with child_id
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Basic user account fields
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: 'parent',
          phone: formData.phone,
          address: `${formData.addressLine1}${formData.addressLine2 ? ', ' + formData.addressLine2 : ''}, ${formData.city}, ${formData.state} ${formData.postalCode}`,
          emergencyContact: formData.alternatePhone || '',
          
          // Parent-specific fields with verified child_id
          parentFirstName: formData.firstName,
          parentLastName: formData.lastName,
          childFirstName: formData.childFirstName,
          childLastName: formData.childLastName,
          childDob: formData.childDob,
          childId: childId, // Use child_id instead of student_id
          relationToChild: formData.relationToChild,
          
          // Additional contact details
          alternatePhone: formData.alternatePhone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const userData = await response.json();
      console.log('Parent registered successfully:', userData);
      
      // Navigate to login page with success notification
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ 
        email: error instanceof Error ? error.message : 'Registration failed. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const relationOptions = [
    { value: 'mother', label: 'Mother' },
    { value: 'father', label: 'Father' },
    { value: 'guardian', label: 'Guardian' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-8 pb-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Parent Registration
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Create your parent account and verify your child relationship
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <Stepper
            initialStep={1}
            onFinalStepCompleted={handleSubmit}
            backButtonText="Previous"
            nextButtonText="Next"
          >
            {/* Step 1: User Account Information */}
            <Step>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Account Information
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Set up your login credentials (also used as parent information)
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      First Name (Parent)
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                        errors.firstName ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'
                      }`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Last Name (Parent)
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                        errors.lastName ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'
                      }`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                        errors.password ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'
                      }`}
                      placeholder="Create a password"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                        errors.confirmPassword ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'
                      }`}
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            </Step>

            {/* Step 2: Child Verification Details */}
            <Step>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Baby className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Child Verification
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Verify your relationship with your child
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Child First Name
                    </label>
                    <input
                      type="text"
                      value={formData.childFirstName}
                      onChange={(e) => handleInputChange('childFirstName', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                        errors.childFirstName ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'
                      }`}
                      placeholder="Enter child's first name"
                    />
                    {errors.childFirstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.childFirstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Child Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.childLastName}
                      onChange={(e) => handleInputChange('childLastName', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                        errors.childLastName ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'
                      }`}
                      placeholder="Enter child's last name"
                    />
                    {errors.childLastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.childLastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Child Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.childDob}
                    onChange={(e) => handleInputChange('childDob', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                      errors.childDob ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.childDob && (
                    <p className="text-red-500 text-sm mt-1">{errors.childDob}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Relationship to Child
                  </label>
                  <select
                    value={formData.relationToChild}
                    onChange={(e) => handleInputChange('relationToChild', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                      errors.relationToChild ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <option value="">Select relationship</option>
                    {relationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.relationToChild && (
                    <p className="text-red-500 text-sm mt-1">{errors.relationToChild}</p>
                  )}
                </div>
              </div>
            </Step>

            {/* Step 3: Contact Information */}
            <Step>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Contact Information
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Provide your contact details and address
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                        errors.phone ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'
                      }`}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Alternate Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.alternatePhone}
                      onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="Enter alternate phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                      errors.addressLine1 ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    placeholder="Enter street address"
                  />
                  {errors.addressLine1 && (
                    <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                        errors.city ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'
                      }`}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                        errors.state ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'
                      }`}
                      placeholder="Enter state"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
                        errors.postalCode ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'
                      }`}
                      placeholder="Enter postal code"
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </Step>

            {/* Step 4: Terms and Confirmation */}
            <Step>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Review & Confirm
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Review your information and agree to our terms
                  </p>
                </div>

                {/* Registration Summary */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 space-y-4">
                  <h4 className="font-semibold text-slate-800 dark:text-white">Registration Summary</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Parent Name:</span>
                      <span className="text-slate-800 dark:text-white">
                        {formData.firstName} {formData.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Email:</span>
                      <span className="text-slate-800 dark:text-white">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Child Name:</span>
                      <span className="text-slate-800 dark:text-white">
                        {formData.childFirstName} {formData.childLastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Relationship:</span>
                      <span className="text-slate-800 dark:text-white capitalize">
                        {formData.relationToChild}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Phone:</span>
                      <span className="text-slate-800 dark:text-white">{formData.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Terms and Privacy */}
                <div className="space-y-4">
                  <div className={`flex items-start space-x-3 p-4 rounded-xl border ${
                    errors.agreeToTerms ? 'border-red-300 bg-red-50' : 'border-slate-200 dark:border-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      className="mt-1 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-slate-700 dark:text-slate-300">
                      I agree to the <span className="text-violet-600 font-medium">Terms of Service</span> and understand that my parent-child relationship will need to be verified by a therapist before accessing all features.
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>
                  )}

                  <div className={`flex items-start space-x-3 p-4 rounded-xl border ${
                    errors.privacyConsent ? 'border-red-300 bg-red-50' : 'border-slate-200 dark:border-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      id="privacyConsent"
                      checked={formData.privacyConsent}
                      onChange={(e) => handleInputChange('privacyConsent', e.target.checked)}
                      className="mt-1 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <label htmlFor="privacyConsent" className="text-sm text-slate-700 dark:text-slate-300">
                      I consent to the <span className="text-violet-600 font-medium">Privacy Policy</span> and the collection and processing of my personal information for therapeutic services.
                    </label>
                  </div>
                  {errors.privacyConsent && (
                    <p className="text-red-500 text-sm">{errors.privacyConsent}</p>
                  )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                        Verification Process
                      </h5>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        After registration, your parent-child relationship will be verified by our licensed therapists. This ensures the safety and security of all participants in our program.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Step>
          </Stepper>
        </div>

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Creating your account...</p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ParentRegistrationForm;
