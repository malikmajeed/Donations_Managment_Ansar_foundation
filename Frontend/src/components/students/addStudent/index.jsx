import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaUpload, FaCamera, FaUserPlus, FaTimes, FaCheckCircle } from 'react-icons/fa';

export default function AddStudent({ onClose }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        fatherName: '',
        dateOfBirth: '',
        gender: '',
        phone: '',
        profileUrl: '',
        address: '',
        school: '',
        studentGrade: '',
        introduction: '',
        monthlyFee: ''
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [image, setImage] = useState(null)
    const [error, setError] = useState({});
    const fileInputRef = useRef(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (error[name]) {
            setError({
                ...error,
                [name]: ''
            });
        }
    };

    const handlePhoneChange = (value) => {
        setFormData({
            ...formData,
            phone: value
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
            setFormData({
                ...formData,
                profileUrl: file
            });
        }
    };

    const validateForm = () => {
        let newError = {};
        
        if (!formData.firstName.trim()) {
            newError.firstName = 'First name is required';
        }
        if (!formData.fatherName.trim()) {
            newError.fatherName = 'Father name is required';
        }
        if (!formData.gender) {
            newError.gender = 'Gender is required';
        }
        if (!formData.dateOfBirth) {
            newError.dateOfBirth = 'Date of birth is required';
        }

        setError(newError);
        return Object.keys(newError).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            const formDataToSend = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (key !== 'profileUrl') {
                    if (key === 'phone') {
                        // Sanitize phone: remove non-digits and send as number
                        const sanitizedPhone = formData.phone.replace(/\D/g, '');
                        formDataToSend.append('phone', Number(sanitizedPhone));
                    } else {
                        formDataToSend.append(key, formData[key]);
                    }
                }
            });

            if (formData.profileUrl instanceof File) {
                console.log('File to upload:', {
                    name: formData.profileUrl.name,
                    type: formData.profileUrl.type,
                    size: formData.profileUrl.size
                });
                formDataToSend.append('profileImage', formData.profileUrl);
            } else {
                console.log('No image file selected');
            }

            console.log('Sending form data:', Object.fromEntries(formDataToSend));
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3000/student/addStudent', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                localStorage.removeItem('studentDraft');
                setShowSuccess(true);
                setFormData({
                    firstName: '',
                    lastName: '',
                    fatherName: '',
                    dateOfBirth: '',
                    gender: '',
                    phone: '',
                    profileUrl: '',
                    address: '',
                    school: '',
                    studentGrade: '',
                    introduction: '',
                    monthlyFee: ''
                });
                setPreviewImage(null);
                setError({});
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }
        } catch (error) {
            console.error('Error adding student:', error.response?.data || error.message);
            
            if (error.response?.data?.missingFields) {
                const missingFields = error.response.data.missingFields;
                const newErrors = {};
                Object.keys(missingFields).forEach(field => {
                    if (missingFields[field]) {
                        newErrors[field] = `${field} is required`;
                    }
                });
                setError(newErrors);
                return;
            }

            const errorMessage = error.response?.data?.message || 'Failed to add student. Please try again.';
            setError(prev => ({ ...prev, general: errorMessage }));
        }
    };

    const handleSaveDraft = () => {
        const draftData = {
            ...formData,
            previewImage: previewImage
        };
        
        localStorage.setItem('studentDraft', JSON.stringify(draftData));
    };

    useEffect(() => {
        const savedDraft = localStorage.getItem('studentDraft');
        if (savedDraft) {
            const draftData = JSON.parse(savedDraft);
            setFormData({
                firstName: draftData.firstName || '',
                lastName: draftData.lastName || '',
                fatherName: draftData.fatherName || '',
                dateOfBirth: draftData.dateOfBirth || '',
                gender: draftData.gender || '',
                phone: draftData.phone || '',
                profileUrl: draftData.profileUrl || '',
                address: draftData.address || '',
                school: draftData.school || '',
                studentGrade: draftData.studentGrade || '',
                introduction: draftData.introduction || '',
                monthlyFee: draftData.monthlyFee || ''
            });
            if (draftData.previewImage) {
                setPreviewImage(draftData.previewImage);
            }
        }
    }, []);

    return (<>

            {/* Right Panel */}
            {showSuccess ? (
                <div className="w-full flex flex-col items-center justify-center p-12">
                  <FaCheckCircle className="text-green-500 w-20 h-20 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Student Added Successfully!</h3>
                  <p className="text-gray-600 mb-8 text-center">The new student has been added. You can add another or return to the dashboard.</p>
                  <div className="flex gap-4">
                    <button
                      className="py-[5px] px-6 rounded-lg font-semibold border border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center gap-2"
                      onClick={() => setShowSuccess(false)}
                    >
                      Add New
                    </button>
                    <button
                      className="py-[5px] px-6 rounded-lg font-semibold border border-green-500 text-green-600 bg-green-50 hover:bg-green-100 transition-colors duration-200 flex items-center justify-center gap-2"
                      onClick={onClose}
                    >
                      Ok
                    </button>
                  </div>
                </div>
              ) : ( 
            <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col md:flex-row overflow-hidden">
              
                {/* Left Panel */}
                <div className="w-full md:w-1/4 bg-gray-50 border-r border-gray-200 p-6 flex flex-col items-center gap-6">
                    {/* Avatar Upload */}
                    <div className="relative w-32 h-32 mb-2">
                        {previewImage ? (
                            <div className="relative group w-full h-full">
                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-full border-3 border-gray-300 shadow-md" />
                                <label htmlFor="profileUpload" className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                    <FaCamera size={24} className="text-white mb-1" />
                                    <span className="text-white text-xs font-medium">Change</span>
                                    <input
                                        type="file"
                                        id="profileUpload"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        ref={fileInputRef}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        ) : (
                            <label htmlFor="profileUpload" className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-400 rounded-full cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors">
                                <FaUpload className="text-gray-500 text-2xl mb-1" />
                                <span className="text-gray-600 font-medium text-sm">Upload</span>
                                <input
                                    type="file"
                                    id="profileUpload"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    ref={fileInputRef}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                    
                    {/* Gender */}
                    <div className="w-full mb-2">
                        <label className="block mb-2 font-semibold text-gray-700 text-sm">Gender *</label>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} required className="accent-emerald-600" />
                                <span className="text-gray-700">Male</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} required className="accent-emerald-600" />
                                <span className="text-gray-700">Female</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <input type="radio" name="gender" value="other" checked={formData.gender === 'other'} onChange={handleChange} required className="accent-emerald-600" />
                                <span className="text-gray-700">Other</span>
                            </label>
                        </div>
                        {error.gender && <span className="text-red-500 text-xs mt-1">{error.gender}</span>}
                    </div>
                    
                    {/* Date of Birth */}
                    <div className="w-full mb-2">
                        <label className="block mb-2 font-semibold text-gray-700 text-sm">Date of Birth *</label>
                        <input 
                            type="date" 
                            name="dateOfBirth" 
                            value={formData.dateOfBirth} 
                            onChange={handleChange} 
                            required 
                            max={new Date().toISOString().split('T')[0]} 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                        />
                        {error.dateOfBirth && <span className="text-red-500 text-xs mt-1">{error.dateOfBirth}</span>}
                    </div>
                    
                    {/* Monthly Fee */}
                    <div className="w-full">
                        <label className="block mb-2 font-semibold text-gray-700 text-sm">Monthly Fee</label>
                        <input 
                            type="number" 
                            name="monthlyFee" 
                            value={formData.monthlyFee} 
                            onChange={handleChange} 
                            min="0" 
                            step="0.01" 
                            placeholder="Amount" 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                        />
                    </div>
                </div>

            
                  <form onSubmit={handleSubmit} className="w-full md:w-3/4 p-6 flex flex-col">
                    {/* Header */}
                    <div className="w-full  px-4 py-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                            <FaUserPlus className="w-7 h-7" />
                            Add New Student
                        </h2>
                    </div>
                    
                    {/* Row 1 - Names */}
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">First Name *</label>
                            <input 
                                type="text" 
                                name="firstName" 
                                value={formData.firstName} 
                                onChange={handleChange} 
                                required 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                                placeholder="Enter first name"
                            />
                            {error.firstName && <span className="text-red-500 text-xs mt-1">{error.firstName}</span>}
                        </div>
                        <div className="flex-1">
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">Last Name</label>
                            <input 
                                type="text" 
                                name="lastName" 
                                value={formData.lastName} 
                                onChange={handleChange} 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                                placeholder="Enter last name"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">Father Name *</label>
                            <input 
                                type="text" 
                                name="fatherName" 
                                value={formData.fatherName} 
                                onChange={handleChange} 
                                required 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                                placeholder="Enter father's name"
                            />
                            {error.fatherName && <span className="text-red-500 text-xs mt-1">{error.fatherName}</span>}
                        </div>
                    </div>
                    
                    {/* Row 2 - School and Class */}
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-[2]">
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">School</label>
                            <input 
                                type="text" 
                                name="school" 
                                value={formData.school} 
                                onChange={handleChange} 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                                placeholder="Enter school name"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">Class</label>
                            <select
                                name="studentGrade"
                                value={formData.studentGrade}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                required
                            >
                                <option value="">Select class</option>
                                <option value="Nursery">Nursery</option>
                                <option value="KG">KG</option>
                                <option value="1st">1st</option>
                                <option value="2nd">2nd</option>
                                <option value="3rd">3rd</option>
                                <option value="4th">4th</option>
                                <option value="5th">5th</option>
                                <option value="6th">6th</option>
                                <option value="7th">7th</option>
                                <option value="8th">8th</option>
                                <option value="9th">9th</option>
                                <option value="10th">10th</option>
                                <option value="11th">11th</option>
                                <option value="12th">12th</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Row 3 - Address and Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mb-4">
                        <div>
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">Address</label>
                            <input 
                                type="text" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleChange} 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                                placeholder="Enter address"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-semibold text-gray-700 text-sm">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={e => {
                                    // Only allow digits in the input
                                    const digitsOnly = e.target.value.replace(/\D/g, '');
                                    handleChange({ target: { name: 'phone', value: digitsOnly } });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                placeholder="923001234567"
                                autoComplete="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                            <span className="text-xs text-gray-500 mt-1 block">Enter phone number as digits only, e.g. 923001234567</span>
                        </div>
                    </div>
                    
                    {/* Introduction */}
                    <div className="mb-6">
                        <label className="block mb-2 font-semibold text-gray-700 text-sm">Introduction</label>
                        <textarea 
                            name="introduction" 
                            value={formData.introduction} 
                            onChange={handleChange} 
                            rows="4" 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none" 
                            placeholder="Brief introduction about the student..."
                        />
                    </div>
                    
                    {error.general && (
                      <div className="mb-4 text-red-600 text-sm font-semibold text-center">
                        {error.general}
                      </div>
                    )}
                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-auto">
                        <button 
                            type="button" 
                            className="inline-flex items-center gap-2 bg-red-50 text-red-600 font-semibold px-6 py-[5px] rounded-lg hover:bg-red-100 transition-colors border border-red-500" 
                            onClick={() => window.history.back()}
                        >
                            <FaTimes className="w-4 h-4" /> 
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 font-semibold px-6 py-[5px] rounded-lg hover:bg-blue-100 transition-colors border border-blue-500" 
                            onClick={handleSaveDraft}
                        >
                            <FaUpload className="w-4 h-4" /> 
                            Save Draft
                        </button>
                        <button 
                            type="submit" 
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold px-6 py-[5px] rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 transition-all"
                        >
                            <FaUserPlus className="w-4 h-4" /> 
                            Add Student
                        </button>
                    </div>
                  </form>
                
            </div>
        )}

        </>
        // </div>
    );
}
