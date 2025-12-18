import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LandingExperience = lazy(() => import("./components/LandingExperience.jsx"));

function App() {
  const navigate = useNavigate();

  const [patientData, setPatientData] = useState({
    age: "", sex: "", cp: "", trestbps: "", chol: "", fbs: "",
    restecg: "", thalch: "", exang: "", oldpeak: "", slope: "", ca: "", thal: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [activeField, setActiveField] = useState('age');
  const [completedFields, setCompletedFields] = useState(new Set());
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const activeFieldRef = useRef(null);
  const formRef = useRef(null);

  const [showLanding, setShowLanding] = useState(() => {
    try {
      return localStorage.getItem("cra_seen_landing") !== "1";
    } catch {
      return true;
    }
  });

  const goToHeart = () => navigate("/heart");
  const isHeartSymbol = (value) =>
    typeof value === "string" && /❤️|💗|💓|💝|🫀|♥/.test(value);

  // Field order for progressive flow
  const fieldOrder = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalch', 'exang', 'oldpeak', 'slope', 'ca', 'thal'];
  const totalFields = fieldOrder.length;

  // Gaming-style field information
  const fieldInfo = {
    age: {
      title: "Age Analysis",
      icon: "👤",
      description: "Your chronological age in years",
      normal: "Adult range: 18-65 years",
      risk: "Risk increases significantly after 45 (men) and 55 (women)",
      detail: "Age is the strongest predictor of cardiovascular disease. As we age, arteries naturally stiffen and heart muscle weakens.",
      color: "from-purple-500 to-pink-500"
    },
    sex: {
      title: "Biological Sex",
      icon: "⚥",
      description: "Biological sex impacts heart disease risk patterns",
      normal: "Both sexes can develop heart disease",
      risk: "Men have higher risk at younger ages, women's risk increases post-menopause",
      detail: "Hormonal differences affect cardiovascular health. Estrogen provides some protection before menopause.",
      color: "from-blue-500 to-cyan-500"
    },
    cp: {
      title: "Chest Pain Analysis",
      icon: "💓",
      description: "Type and pattern of chest discomfort",
      normal: "No chest pain or non-cardiac pain",
      risk: "Typical angina indicates possible coronary artery disease",
      detail: "Different chest pain types suggest varying levels of cardiac involvement and urgency.",
      color: "from-red-500 to-orange-500"
    },
    trestbps: {
      title: "Blood Pressure Monitor",
      icon: "🩺",
      description: "Resting systolic blood pressure measurement",
      normal: "Optimal: <120 mmHg, Normal: 120-129 mmHg",
      risk: "High: >140 mmHg indicates hypertension",
      detail: "Blood pressure measures the force of blood against artery walls. High pressure damages vessels over time.",
      color: "from-green-500 to-teal-500"
    },
    chol: {
      title: "Cholesterol Levels",
      icon: "🧪",
      description: "Total serum cholesterol concentration",
      normal: "Desirable: <200 mg/dL",
      risk: "High: >240 mg/dL significantly increases risk",
      detail: "Cholesterol builds up in arteries, forming plaques that can block blood flow to the heart.",
      color: "from-yellow-500 to-amber-500"
    },
    fbs: {
      title: "Blood Sugar Status",
      icon: "🍯",
      description: "Fasting blood glucose levels",
      normal: "Normal: <100 mg/dL fasting",
      risk: "Diabetes: >126 mg/dL doubles heart disease risk",
      detail: "High blood sugar damages blood vessels and increases atherosclerosis risk.",
      color: "from-orange-500 to-red-500"
    },
    restecg: {
      title: "ECG Analysis",
      icon: "📈",
      description: "Resting electrocardiogram results",
      normal: "Normal electrical activity patterns",
      risk: "Abnormalities may indicate heart muscle damage",
      detail: "ECG measures electrical activity of the heart, revealing rhythm and structural problems.",
      color: "from-indigo-500 to-purple-500"
    },
    thalch: {
      title: "Maximum Heart Rate",
      icon: "💝",
      description: "Peak heart rate achieved during exercise",
      normal: "Age-predicted maximum: 220 - age",
      risk: "Low max heart rate may indicate poor fitness or heart disease",
      detail: "Higher maximum heart rate generally indicates better cardiovascular fitness.",
      color: "from-pink-500 to-rose-500"
    },
    exang: {
      title: "Exercise Angina",
      icon: "🏃",
      description: "Chest pain triggered by physical activity",
      normal: "No exercise-induced chest pain",
      risk: "Exercise angina strongly suggests coronary artery disease",
      detail: "Chest pain during exercise indicates inadequate blood flow to heart muscle.",
      color: "from-cyan-500 to-blue-500"
    },
    oldpeak: {
      title: "ST Depression",
      icon: "📊",
      description: "Exercise-induced ST segment depression",
      normal: "Minimal or no ST depression (<1.0)",
      risk: "Significant depression (>2.0) indicates ischemia",
      detail: "ST depression on ECG during exercise suggests reduced blood flow to heart muscle.",
      color: "from-violet-500 to-purple-500"
    },
    slope: {
      title: "ST Slope Pattern",
      icon: "📈",
      description: "Slope of peak exercise ST segment",
      normal: "Upsloping pattern is most favorable",
      risk: "Flat or downsloping patterns suggest coronary disease",
      detail: "The shape of ST segment changes during exercise provides diagnostic information.",
      color: "from-emerald-500 to-green-500"
    },
    ca: {
      title: "Vessel Blockage",
      icon: "🫀",
      description: "Major vessels with significant narrowing",
      normal: "0 vessels with blockage",
      risk: "Each blocked vessel significantly increases risk",
      detail: "Coronary angiography reveals blocked arteries supplying the heart muscle.",
      color: "from-red-500 to-pink-500"
    },
    thal: {
      title: "Stress Test Results",
      icon: "🔬",
      description: "Thalassemia stress test findings",
      normal: "Normal perfusion patterns",
      risk: "Fixed or reversible defects indicate heart muscle damage",
      detail: "Nuclear stress tests show blood flow patterns to different areas of heart muscle.",
      color: "from-blue-500 to-indigo-500"
    }
  };

  const fieldOptions = {
    sex: [
      { value: "0", label: "Female" },
      { value: "1", label: "Male" }
    ],
    cp: [
      { value: "0", label: "Typical Angina" },
      { value: "1", label: "Atypical Angina" },
      { value: "2", label: "Non-Anginal Pain" },
      { value: "3", label: "No Chest Pain" }
    ],
    fbs: [
      { value: "0", label: "Normal (≤ 120 mg/dl)" },
      { value: "1", label: "High (> 120 mg/dl)" }
    ],
    restecg: [
      { value: "0", label: "Normal" },
      { value: "1", label: "ST-T Wave Abnormality" },
      { value: "2", label: "Left Ventricular Hypertrophy" }
    ],
    exang: [
      { value: "0", label: "No" },
      { value: "1", label: "Yes" }
    ],
    slope: [
      { value: "0", label: "Upsloping" },
      { value: "1", label: "Flat" },
      { value: "2", label: "Downsloping" }
    ],
    ca: [
      { value: "0", label: "0 vessels" },
      { value: "1", label: "1 vessel" },
      { value: "2", label: "2 vessels" },
      { value: "3", label: "3 vessels" }
    ],
    thal: [
      { value: "0", label: "Normal" },
      { value: "1", label: "Fixed Defect" },
      { value: "2", label: "Reversible Defect" },
      { value: "3", label: "Unknown" }
    ]
  };

  const fieldConstraints = {
    age: { min: 1, max: 120, step: 1 },
    trestbps: { min: 60, max: 250, step: 1 },
    chol: { min: 50, max: 600, step: 1 },
    thalch: { min: 40, max: 220, step: 1 },
    oldpeak: { min: 0, max: 10, step: 0.1 }
  };

  const fieldLabels = {
    age: "Age (years)",
    sex: "Biological sex",
    cp: "Chest pain type",
    trestbps: "Resting blood pressure (mm Hg)",
    chol: "Cholesterol (mg/dL)",
    fbs: "Fasting blood sugar",
    restecg: "Resting ECG",
    thalch: "Max heart rate",
    exang: "Exercise-induced angina",
    oldpeak: "ST depression",
    slope: "ST slope",
    ca: "Major vessels (0–3)",
    thal: "Thalassemia"
  };

  // Calculate completion percentage
  const completionPercentage = (completedFields.size / totalFields) * 100;

  const progressHint = useMemo(() => {
    if (completionPercentage < 10) return "You’re just getting started";
    if (completionPercentage < 40) return "Great pace — keep going";
    if (completionPercentage < 70) return "You’re over halfway";
    if (completionPercentage < 100) return "Almost there";
    return "Ready to analyze";
  }, [completionPercentage]);

  const formatPercentage = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0.00";
    }
    return Number(value).toFixed(2);
  };

  const hasValue = (value) => value !== "" && value !== null && value !== undefined;

  const getMicroFeedback = (fieldName) => {
    const rawValue = patientData[fieldName];
    if (!hasValue(rawValue)) return null;

    const constraint = fieldConstraints[fieldName];
    if (constraint) {
      const numericValue = Number(rawValue);
      if (Number.isNaN(numericValue)) {
        return { tone: "warn", label: "⚠ Please enter a number" };
      }
      if (
        (constraint.min !== undefined && numericValue < constraint.min) ||
        (constraint.max !== undefined && numericValue > constraint.max)
      ) {
        return { tone: "warn", label: "⚠ Outside expected range" };
      }
    }

    return { tone: "good", label: "✓ Looks good" };
  };

  useEffect(() => {
    // Update completed fields
    const completed = new Set();
    Object.entries(patientData).forEach(([key, value]) => {
      if (value !== "") completed.add(key);
    });
    setCompletedFields(completed);
  }, [patientData]);

  // Check if a field is complete
  const isFieldComplete = (fieldName) => {
    return patientData[fieldName] !== "";
  };

  // Get the current field to display (only one at a time)
  const getCurrentField = () => {
    // Show the field at currentStep, or first incomplete field if currentStep is beyond
    if (currentStep < fieldOrder.length) {
      return { field: fieldOrder[currentStep], index: currentStep };
    }
    
    // Fallback: find first incomplete field
    for (let i = 0; i < fieldOrder.length; i++) {
      if (!isFieldComplete(fieldOrder[i])) {
        return { field: fieldOrder[i], index: i };
      }
    }
    // All fields complete, show last field
    return { field: fieldOrder[fieldOrder.length - 1], index: fieldOrder.length - 1 };
  };

  // Handle manual navigation
  const navigateToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < fieldOrder.length) {
      setCurrentStep(stepIndex);
      setActiveField(fieldOrder[stepIndex]);
    }
  };

  const setFieldValue = (name, value) => {
    const newPatientData = { ...patientData, [name]: value };
    setPatientData(newPatientData);
    setActiveField(name);
    setError(null);
  };

  const adjustFieldValue = (name, delta) => {
    const currentValue = patientData[name] ? parseFloat(patientData[name]) : 0;
    if (isNaN(currentValue)) return;
    const updatedValue = (currentValue + delta).toFixed(1).replace(/\.0$/, '');
    setFieldValue(name, updatedValue);
  };

  const updateField = (e) => {
    const { name, value } = e.target;
    setFieldValue(name, value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (completedFields.has(currentField) && currentFieldIndex < fieldOrder.length - 1) {
        navigateToStep(currentFieldIndex + 1);
      } else if (completionPercentage === 100) {
        submitPrediction(e);
      }
    }
  };

  const submitPrediction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      console.log('Making request to:', `${apiUrl}/predict`);
      
      // First test if backend is reachable
      try {
        const healthCheck = await axios.get(`${apiUrl}/health`, { timeout: 5000 });
        console.log('Backend health check:', healthCheck.data);
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        throw new Error('Backend server is not responding. Please ensure the backend is running on port 8000.');
      }
      
      const response = await axios.post(`${apiUrl}/predict`, patientData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000  // Increased timeout to 30 seconds
      });
      
      setPrediction(response.data);
    } catch (error) {
      console.error('Prediction error:', error);
      if (error.code === 'ECONNREFUSED') {
        setError('Cannot connect to prediction service. Please ensure the backend server is running.');
      } else if (error.response) {
        setError(`Prediction failed: ${error.response.data?.detail || error.response.statusText}`);
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPatientData({
      age: "", sex: "", cp: "", trestbps: "", chol: "", fbs: "",
      restecg: "", thalch: "", exang: "", oldpeak: "", slope: "", ca: "", thal: ""
    });
    setPrediction(null);
    setError(null);
    setActiveField('age');
    setCompletedFields(new Set());
    setCurrentStep(0);
  };

  const renderField = (field) => {
    const isCompleted = completedFields.has(field);
    const isActive = activeField === field;
    const isSelect = fieldOptions[field];
    const constraints = fieldConstraints[field];
    const numericStep = constraints?.step ? Number(constraints.step) : 1;
    const midpoint = constraints?.min !== undefined && constraints?.max !== undefined
      ? ((constraints.min + constraints.max) / 2).toFixed(1).replace(/\.0$/, '')
      : null;

    const fieldClass = `
      w-full px-8 py-7 text-3xl bg-white border-2 rounded-2xl shadow-inner
      ${isActive ? 'border-blue-600 ring-4 ring-blue-100' : 
        isCompleted ? 'border-green-500' : 'border-gray-300'}
      text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100
      font-normal cursor-text min-h-[92px]
    `;

    const handleFieldFocus = (fieldName) => {
      setActiveField(fieldName);
      setShowMobileInfo(true);
    };

    if (isSelect) {
      return (
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium text-gray-700">{fieldLabels[field] || fieldInfo[field]?.title}</label>
            <span className="text-xs text-gray-500">Select one</span>
          </div>
          {/* Segmented buttons for categorical fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fieldOptions[field].map(option => {
              const isChosen = patientData[field] === option.value;
              return (
                <button
                  key={`option-${option.value}`}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFieldValue(field, option.value);
                  }}
                  className={`px-8 py-6 rounded-2xl text-xl font-medium text-left border-2 min-h-[84px] ${
                    isChosen 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                      : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          
          {/* Mobile/Responsive Info Panel */}
          {isActive && showMobileInfo && (
            <div className="lg:hidden absolute left-0 top-full mt-2 w-full max-w-md z-50 bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
              <button 
                onClick={() => setShowMobileInfo(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              
              <div className={`text-center mb-4 bg-gradient-to-r ${fieldInfo[field].color} p-1 rounded-xl`}>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-4xl mb-2">{fieldInfo[field].icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{fieldInfo[field].title}</h3>
                  <p className="text-gray-700 text-sm">{fieldInfo[field].description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-300">
                  <h4 className="font-semibold text-green-700 mb-1 flex items-center text-sm">
                    <span className="mr-1">✅</span> Normal Range
                  </h4>
                  <p className="text-green-800 text-xs">{fieldInfo[field].normal}</p>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-3 rounded-lg border border-amber-300">
                  <h4 className="font-semibold text-amber-700 mb-1 flex items-center text-sm">
                    <span className="mr-1">⚠️</span> Risk Factors
                  </h4>
                  <p className="text-amber-800 text-xs">{fieldInfo[field].risk}</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-300">
                  <h4 className="font-semibold text-blue-700 mb-1 flex items-center text-sm">
                    <span className="mr-1">🔬</span> Clinical Details
                  </h4>
                  <p className="text-blue-800 text-xs">{fieldInfo[field].detail}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <label className="text-sm font-medium text-gray-700">{fieldLabels[field] || fieldInfo[field]?.title}</label>
          {constraints?.min !== undefined && constraints?.max !== undefined && (
            <span className="text-xs text-gray-500">Expected: {constraints.min}–{constraints.max}</span>
          )}
        </div>
        {/* Large input card */}
        <div 
          onClick={() => activeFieldRef.current?.focus()}
          className="cursor-pointer"
        >
          <input
            ref={isActive ? activeFieldRef : null}
            type="number"
            name={field}
            value={patientData[field]}
            onChange={updateField}
            onFocus={() => handleFieldFocus(field)}
            required
            {...constraints}
            className={fieldClass}
            placeholder=""
          />
        </div>

        {/* Smart Assist Row - Compact Pills */}
        {constraints && (
          <div className="flex items-center justify-center gap-2 text-sm">
            {constraints.min !== undefined && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setFieldValue(field, String(constraints.min));
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
              >
                Min
              </button>
            )}
            {midpoint && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setFieldValue(field, midpoint);
                }}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium"
              >
                Typical
              </button>
            )}
            {constraints.max !== undefined && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setFieldValue(field, String(constraints.max));
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
              >
                Max
              </button>
            )}
            <span className="text-gray-300 mx-1">|</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                adjustFieldValue(field, -numericStep);
              }}
              className="w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center justify-center font-medium text-lg"
            >
              −
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                adjustFieldValue(field, numericStep);
              }}
              className="w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center justify-center font-medium text-lg"
            >
              +
            </button>
          </div>
        )}
      </div>
    );
  };





  const currentFieldData = getCurrentField();
  const currentField = currentFieldData.field;
  const currentFieldIndex = currentFieldData.index;
  const currentFieldInfo = fieldInfo[currentField] || fieldInfo[fieldOrder[0]];

  return (
    <div className="min-h-screen flex flex-col app-shell">
      {showLanding && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-white">
              <div className="text-center">
                <button
                  type="button"
                  onClick={goToHeart}
                  className="text-5xl leading-none"
                  aria-label="Open 3D heart"
                  title="Open 3D heart"
                >
                  ❤️
                </button>
                <div className="mt-4 text-gray-700 font-medium">Loading…</div>
              </div>
            </div>
          }
        >
          <LandingExperience
            onComplete={() => {
              setShowLanding(false);
              // Ensure the existing flow starts exactly as it does today.
              setPrediction(null);
              setError(null);
              setActiveField('age');
              setCurrentStep(0);
            }}
          />
        </Suspense>
      )}

      {/* Top Sticky Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToHeart}
                className="text-3xl leading-none hover:text-blue-600 transition-colors"
                aria-label="Open 3D heart"
                title="Open 3D heart"
              >
                ❤️
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-900 font-medium text-base hover:text-blue-600 transition-colors"
              >
                Cardiac Risk Analyzer
              </button>
            </div>
            
            <div className="absolute left-1/2 -translate-x-1/2 text-center">
              <div className="text-sm font-semibold text-gray-700">
                {prediction
                  ? "Results"
                  : `Step ${Math.min(currentStep + 1, fieldOrder.length)} of ${fieldOrder.length} • ${Math.round(completionPercentage)}%`}
              </div>
              {!prediction && (
                <div className="text-xs text-gray-500 mt-0.5">{progressHint}</div>
              )}
            </div>
            
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-base font-medium transition-colors"
            >
              Reset
            </button>
          </div>
          
          {/* Smooth progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-100">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-blue-700"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
      </header>

        {/* Main content area */}
        <main className={`${!prediction ? "pt-24 pb-32" : "py-12"} px-6 flex-1`}>
          <div className="max-w-7xl mx-auto">
            <div className="lg:grid lg:grid-cols-[280px_minmax(0,720px)_280px] lg:gap-10">
              {/* LEFT PANEL — Emotional Hook */}
              <aside className="hidden lg:block">
                <div className="sticky top-28 space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <button
                      type="button"
                      onClick={goToHeart}
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xl hover:bg-blue-100"
                      aria-label="Open 3D heart"
                      title="Open 3D heart"
                    >
                      💗
                    </button>
                    <h3 className="mt-4 text-2xl font-semibold text-gray-900 leading-tight tracking-tight">
                      Your Heart.
                      <br />
                      Your Numbers.
                    </h3>
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                      Understand your cardiac risk before symptoms appear.
                    </p>
                    <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="text-xs font-semibold text-gray-900">Why this matters</div>
                      <ul className="mt-3 space-y-2 text-sm text-gray-600">
                        <li className="flex gap-2"><span className="text-gray-400">•</span><span>Age is the strongest predictor of cardiac risk</span></li>
                        <li className="flex gap-2"><span className="text-gray-400">•</span><span>Used by ML models worldwide</span></li>
                        <li className="flex gap-2"><span className="text-gray-400">•</span><span>Helps personalize risk estimation</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Center Column (Input Focus Area) */}
              <div className="min-w-0">
                <div className="max-w-[720px] mx-auto">
            {/* Prediction Results - Guided, Reassuring, Premium */}
            {prediction && (
              <div className="mb-8 p-8 md:p-12 bg-white rounded-3xl border border-gray-300 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                {/* Header with Checkmark */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-3xl mb-5">✓</div>
                  <h2 className="text-4xl font-semibold text-gray-900 mb-3 tracking-tight">Analysis Complete</h2>
                  <p className="text-gray-600 text-lg">Your cardiac risk assessment has been processed</p>
                </div>
                
                {/* Risk Visualization - Primary Focus */}
                <div className="flex flex-col items-center mb-16">
                  <div className="relative mb-6">
                    {/* Circular Progress Ring */}
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                      {/* Background circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r="85"
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="12"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r="85"
                        fill="none"
                        stroke={
                          prediction.risk_level === 'Low Risk' ? '#10b981' :
                          prediction.risk_level === 'Moderate Risk' ? '#f59e0b' : '#ef4444'
                        }
                        strokeWidth="12"
                        strokeDasharray={`${(parseFloat(prediction.risk_probability) / 100) * 534} 534`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className={`text-5xl font-semibold mb-1 ${
                        prediction.risk_level === 'Low Risk' ? 'text-green-600' :
                        prediction.risk_level === 'Moderate Risk' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {parseFloat(prediction.risk_probability).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-500">Risk Score</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Overall Heart Disease Risk</h3>
                  <p className={`text-base font-medium ${
                    prediction.risk_level === 'Low Risk' ? 'text-green-600' :
                    prediction.risk_level === 'Moderate Risk' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {prediction.risk_level}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="text-sm font-medium text-gray-500 mb-2">Risk Probability</div>
                    <div className="text-3xl font-semibold text-gray-900">{parseFloat(prediction.risk_probability).toFixed(1)}%</div>
                  </div>
                  
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="text-sm font-medium text-gray-500 mb-2">Risk Classification</div>
                    <div className={`text-2xl font-semibold ${
                      prediction.risk_level === 'Low Risk' ? 'text-green-600' :
                      prediction.risk_level === 'Moderate Risk' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {prediction.risk_level.replace(' Risk', '')}
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="text-sm font-medium text-gray-500 mb-2">Model Confidence</div>
                    <div className="text-3xl font-semibold text-gray-900">{formatPercentage(prediction.confidence)}%</div>
                  </div>
                </div>

                {/* Contributing Factors - Expandable */}
                <details className="mb-8 group">
                  <summary className="cursor-pointer p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">What influenced this score?</h3>
                        <p className="text-sm text-gray-500 mt-1">View key contributing factors</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </summary>
                  <div className="mt-4 p-6 bg-white border border-gray-100 rounded-2xl">
                    <p className="text-sm text-gray-600 mb-4">Analysis based on these biomarkers:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <div>
                          <span className="font-medium text-gray-900">Age & Gender</span>
                          <span className="text-gray-600"> - Demographic risk factors</span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <div>
                          <span className="font-medium text-gray-900">Blood Pressure</span>
                          <span className="text-gray-600"> - Resting systolic measurement</span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <div>
                          <span className="font-medium text-gray-900">Cholesterol Levels</span>
                          <span className="text-gray-600"> - Serum cholesterol concentration</span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <div>
                          <span className="font-medium text-gray-900">Chest Pain Pattern</span>
                          <span className="text-gray-600"> - Type and characteristics</span>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <div>
                          <span className="font-medium text-gray-900">Exercise & ECG Results</span>
                          <span className="text-gray-600"> - Cardiac stress indicators</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </details>

                {/* Medical Recommendation - Calm and Clear */}
                <div className="p-7 bg-blue-50 rounded-2xl border-2 border-blue-100 mb-8">
                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-base font-semibold text-blue-900 mb-3">Important Medical Guidance</h3>
                      <p className="text-base text-blue-800 leading-relaxed mb-3">{prediction.recommendation}</p>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        This analysis is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. 
                        Always consult with qualified healthcare professionals for proper medical evaluation and personalized care.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Two CTAs - Clear Hierarchy */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch mb-6">
                  <button
                    onClick={resetForm}
                    className="flex-1 px-10 py-5 bg-white border-2 border-gray-300 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all text-lg"
                  >
                    Run New Analysis
                  </button>
                  <button
                    type="button"
                    className="flex-1 px-10 py-5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 text-lg"
                    onClick={() => window.open('https://www.heart.org/en/healthy-living', '_blank')}
                  >
                    View Heart Health Guide
                  </button>
                </div>
              </div>
            )}

            {/* Error Display - Minimal Style */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Single column form - Guided Flow */}
            {!prediction && (
              <div className="max-w-[720px] mx-auto">
                {/* Premium form with fade-in */}
                <form ref={formRef} onSubmit={submitPrediction} onKeyDown={handleKeyDown} className="space-y-10">
                  {currentField && (
                    <div key={currentField} className="space-y-8">
                      <div className="bg-white border border-gray-300 rounded-3xl p-8 md:p-10 shadow-md relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                        {/* Step Title - Strong Hierarchy */}
                        <div className="text-center space-y-4 mb-10">
                          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 text-xl mb-4">
                            {isHeartSymbol(fieldInfo[currentField].icon) ? (
                              <button
                                type="button"
                                onClick={goToHeart}
                                className="w-full h-full rounded-full"
                                aria-label="Open 3D heart"
                                title="Open 3D heart"
                              >
                                {fieldInfo[currentField].icon}
                              </button>
                            ) : (
                              fieldInfo[currentField].icon
                            )}
                          </div>
                          <h2 className="text-4xl font-semibold text-gray-900 tracking-tight">{fieldInfo[currentField].title}</h2>
                          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">{fieldInfo[currentField].description}</p>
                        </div>

                        {/* Primary Input - Very Important */}
                        <div className="space-y-5">
                          {renderField(currentField)}

                          {/* Micro-Feedback (supports 0 / "0") */}
                          {(() => {
                            const feedback = getMicroFeedback(currentField);
                            if (!feedback) return null;
                            const isWarn = feedback.tone === "warn";
                            return (
                              <div className={`flex items-center gap-2 text-sm font-medium ${isWarn ? 'text-amber-700' : 'text-green-700'}`}>
                                <span>{feedback.label.split(" ")[0]}</span>
                                <span>{feedback.label.replace(/^\S+\s/, "")}</span>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Contextual Insight - Collapsible */}
                        <details className="group mt-8">
                          <summary className="cursor-pointer p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors list-none flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Why we ask this</span>
                            <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>
                          <div className="mt-4 space-y-4 text-sm">
                            <div className="p-5 bg-green-50/50 rounded-xl border border-green-100">
                              <p className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Normal Range
                              </p>
                              <p className="text-green-800 leading-relaxed">{currentFieldInfo.normal}</p>
                            </div>
                            <div className="p-5 bg-amber-50/50 rounded-xl border border-amber-100">
                              <p className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                How This Affects Risk
                              </p>
                              <p className="text-amber-800 leading-relaxed">{currentFieldInfo.risk}</p>
                            </div>
                            <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                              <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                Clinical Context
                              </p>
                              <p className="text-blue-800 leading-relaxed">{currentFieldInfo.detail}</p>
                            </div>
                          </div>
                        </details>

                        {/* Actions (inside card bottom) */}
                        <div className="mt-10 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => navigateToStep(currentFieldIndex - 1)}
                            disabled={currentFieldIndex === 0}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-0 disabled:cursor-not-allowed"
                          >
                            ← Back
                          </button>

                          {currentFieldIndex < fieldOrder.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => navigateToStep(currentFieldIndex + 1)}
                              disabled={!completedFields.has(currentField)}
                              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                            >
                              Next
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={submitPrediction}
                              disabled={isSubmitting || completionPercentage < 100}
                              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                            >
                              {isSubmitting ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Analyzing...</span>
                                </>
                              ) : (
                                <span>Complete Analysis</span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}

                </div>
              </div>

              {/* RIGHT PANEL — Confidence Builder */}
              <aside className="hidden lg:block">
                <div className="sticky top-28 space-y-4">
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="text-xs font-semibold text-gray-900 tracking-wide">Quick Facts</div>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <div className="text-sm font-medium text-gray-700">13 clinical inputs</div>
                        <div className="text-sm font-semibold text-gray-900">13</div>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <div className="text-sm font-medium text-gray-700">AI-powered analysis</div>
                        <div className="text-sm font-semibold text-gray-900">XGBoost</div>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <div className="text-sm font-medium text-gray-700">Takes &lt; 2 minutes</div>
                        <div className="text-sm font-semibold text-gray-900">~2 min</div>
                      </div>
                      {!prediction && (
                        <div className="pt-1 text-sm text-gray-600">Calm, step-by-step. You’ve got this.</div>
                      )}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>

        {/* Footer (always visible, not sticky) */}
        <footer className="mt-8 px-6 pb-10">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-base text-gray-600">
              <a
                href="https://github.com/hemanthsankar0007/Heart-Disease-Predictor-Updated"
                target="_blank"
                rel="noreferrer"
                className="font-medium hover:text-gray-800"
              >
                Developed by Hemanth Sankar
              </a>
            </p>
          </div>
        </footer>
      </div>
    );
  }

export default App;
