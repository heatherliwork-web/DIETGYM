import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, User, X, Check, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';

const CircularProgress = ({ value, max, color, label, unit, size = 120, strokeWidth = 8 }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(value / max, 1);
  const strokeDashoffset = circumference - percent * circumference;
  const remaining = Math.max(0, max - value);
  const isCompleted = value >= max;

  return (
    <div className="flex flex-col items-center relative">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-zinc-900"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isCompleted ? "#10B981" : color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
            strokeLinecap="round"
            className={isCompleted ? "drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]" : ""}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-mono font-light text-white tracking-tighter">{remaining}</span>
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">{unit} LEFT</span>
        </div>
      </div>
      <span className="mt-4 text-[10px] font-medium text-zinc-400 tracking-widest uppercase">{label}</span>
    </div>
  );
};

const BottomSheet = ({ isOpen, onClose, children, title }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800/50 rounded-t-3xl z-50 p-6 pb-12 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-medium text-zinc-300 uppercase tracking-widest">{title}</h2>
              <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CameraView = ({ onLog, onClose }: any) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        analyze(reader.result as string, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyze = async (base64: string, mimeType: string) => {
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: base64.split(',')[1],
              mimeType
            }
          },
          "Analyze this food image. Estimate the macronutrients and calories. Return ONLY a JSON object with keys: 'foodName' (string), 'calories' (number), 'carbs' (number in grams), 'protein' (number in grams), 'fat' (number in grams)."
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              foodName: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              fat: { type: Type.NUMBER }
            },
            required: ["foodName", "calories", "carbs", "protein", "fat"]
          }
        }
      });
      setResult(JSON.parse(response.text));
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {!image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-square bg-zinc-900 rounded-2xl border border-dashed border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/50 transition-colors"
        >
          <Camera size={32} strokeWidth={1.5} className="text-zinc-500 mb-4" />
          <span className="text-zinc-400 text-sm font-medium tracking-wide">TAP TO CAPTURE</span>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <img src={image} alt="Food" className="w-full h-48 object-cover rounded-2xl border border-zinc-800" />
          
          {analyzing ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-6 h-6 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
              <span className="text-xs text-zinc-500 uppercase tracking-widest animate-pulse">ANALYZING...</span>
            </div>
          ) : result ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800"
            >
              <h3 className="text-lg font-medium text-white mb-6 text-center capitalize">{result.foodName}</h3>
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-mono text-white">{result.calories}</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">KCAL</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-mono text-blue-400">{result.carbs}</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">CARBS</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-mono text-red-400">{result.protein}</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">PRO</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-mono text-yellow-400">{result.fat}</span>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">FAT</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  onLog(result);
                  onClose();
                }}
                className="w-full py-4 bg-white text-black rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
              >
                <Check size={16} />
                CONFIRM LOG
              </button>
            </motion.div>
          ) : null}
        </div>
      )}
    </div>
  );
};

const VoiceView = ({ onLog, onClose }: any) => {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (text) analyze(text);
    } else {
      setIsRecording(true);
      // Fallback for demo: auto-stop after 3s if no real STT
      setTimeout(() => {
        setIsRecording(false);
        if (!text) setText("Ran 5km in 25 minutes");
      }, 3000);
    }
  };

  useEffect(() => {
    if (text && !isRecording && !result && !analyzing) {
      analyze(text);
    }
  }, [text, isRecording]);

  const analyze = async (workoutText: string) => {
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this workout description: "${workoutText}". Estimate the calories burned. Return ONLY a JSON object with keys: 'workoutName' (string), 'caloriesBurned' (number).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              workoutName: { type: Type.STRING },
              caloriesBurned: { type: Type.NUMBER }
            },
            required: ["workoutName", "caloriesBurned"]
          }
        }
      });
      setResult(JSON.parse(response.text));
    } catch (error) {
      console.error(error);
      alert("Failed to analyze workout.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {!result && !analyzing ? (
        <div className="flex flex-col items-center gap-8 py-4">
          <div 
            onClick={toggleRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 ${
              isRecording 
                ? 'bg-red-500/10 text-red-500 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.2)]' 
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <Mic size={32} strokeWidth={1.5} className={isRecording ? 'animate-pulse' : ''} />
          </div>
          
          <div className="w-full">
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your workout..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 resize-none h-32 text-center"
            />
          </div>
          
          {text && !isRecording && (
            <button 
              onClick={() => analyze(text)}
              className="w-full py-4 bg-white text-black rounded-xl text-sm font-medium"
            >
              ANALYZE WORKOUT
            </button>
          )}
        </div>
      ) : analyzing ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-6 h-6 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
          <span className="text-xs text-zinc-500 uppercase tracking-widest animate-pulse">CALCULATING...</span>
        </div>
      ) : result ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 text-center"
        >
          <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Flame size={24} strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-medium text-white mb-2 capitalize">{result.workoutName}</h3>
          <div className="flex items-end justify-center gap-2 mb-8">
            <span className="text-4xl font-mono text-white tracking-tighter">{result.caloriesBurned}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">KCAL BURNED</span>
          </div>
          <button 
            onClick={() => {
              onLog(result);
              onClose();
            }}
            className="w-full py-4 bg-white text-black rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
          >
            <Check size={16} />
            CONFIRM LOG
          </button>
        </motion.div>
      ) : null}
    </div>
  );
};

const ProfileView = ({ goals, setGoals, onClose }: any) => {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);

  const recalculateGoals = () => {
    setGoals({
      calories: Math.round(weight * 24 * 1.2),
      protein: Math.round(weight * 2),
      fat: Math.round(weight * 1),
      carbs: Math.round((weight * 24 * 1.2 - (weight * 2 * 4) - (weight * 1 * 9)) / 4)
    });
    onClose();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-8">
        <div>
          <div className="flex justify-between mb-4">
            <label className="text-zinc-500 text-xs uppercase tracking-widest">Weight</label>
            <span className="text-white font-mono text-sm">{weight} kg</span>
          </div>
          <input 
            type="range" 
            min="40" max="150" 
            value={weight} 
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-4">
            <label className="text-zinc-500 text-xs uppercase tracking-widest">Height</label>
            <span className="text-white font-mono text-sm">{height} cm</span>
          </div>
          <input 
            type="range" 
            min="140" max="220" 
            value={height} 
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
        <h4 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-4">Daily Targets</h4>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
          <div className="flex justify-between items-end">
            <span className="text-zinc-400 text-xs">Calories</span>
            <span className="text-white font-mono text-sm">{goals.calories}</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-zinc-400 text-xs">Protein</span>
            <span className="text-white font-mono text-sm">{goals.protein}g</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-zinc-400 text-xs">Carbs</span>
            <span className="text-white font-mono text-sm">{goals.carbs}g</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-zinc-400 text-xs">Fat</span>
            <span className="text-white font-mono text-sm">{goals.fat}g</span>
          </div>
        </div>
      </div>

      <button 
        onClick={recalculateGoals}
        className="w-full py-4 bg-white text-black rounded-xl text-sm font-medium"
      >
        UPDATE PROFILE
      </button>
    </div>
  );
};

export default function App() {
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [isVoiceOpen, setVoiceOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);

  const [goals, setGoals] = useState({
    calories: 2200,
    carbs: 250,
    protein: 140,
    fat: 70
  });

  const [intake, setIntake] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0
  });

  const [burned, setBurned] = useState({
    calories: 0
  });

  const handleLogFood = (foodData: any) => {
    setIntake(prev => ({
      calories: prev.calories + foodData.calories,
      carbs: prev.carbs + foodData.carbs,
      protein: prev.protein + foodData.protein,
      fat: prev.fat + foodData.fat
    }));
  };

  const handleLogWorkout = (workoutData: any) => {
    setBurned(prev => ({
      calories: prev.calories + workoutData.caloriesBurned
    }));
  };

  const netCalories = Math.max(0, goals.calories - intake.calories + burned.calories);
  const isGoalMet = intake.protein >= goals.protein && intake.carbs >= goals.carbs && intake.fat >= goals.fat;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-50 font-sans selection:bg-zinc-800 overflow-hidden">
      <header className="flex justify-between items-center p-6">
        <h1 className="text-xs font-bold tracking-[0.2em] uppercase text-white">Aura</h1>
        <button onClick={() => setProfileOpen(true)} className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors border border-zinc-800">
          <User size={16} />
        </button>
      </header>

      <main className="flex flex-col items-center pt-12 pb-32 px-6">
        
        <div className="w-full max-w-sm flex items-center justify-center mb-16">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-10 w-full">
            <CircularProgress value={intake.carbs} max={goals.carbs} color="#3B82F6" label="CARBS" unit="g" size={90} strokeWidth={4} />
            <CircularProgress value={intake.protein} max={goals.protein} color="#EF4444" label="PROTEIN" unit="g" size={90} strokeWidth={4} />
            <CircularProgress value={intake.fat} max={goals.fat} color="#EAB308" label="FAT" unit="g" size={90} strokeWidth={4} />
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-4 font-medium">Energy Gap</div>
          <div className="text-7xl font-mono font-light tracking-tighter mb-6 text-white">
            {netCalories} <span className="text-xl text-zinc-600 font-sans tracking-normal">kcal</span>
          </div>
          
          <div className="inline-flex items-center justify-center gap-4 bg-zinc-900/50 rounded-full px-6 py-2.5 border border-zinc-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span className="text-xs text-zinc-400 font-mono">{intake.calories} in</span>
            </div>
            <div className="w-px h-3 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <Flame size={12} className="text-orange-500/80" />
              <span className="text-xs text-orange-500/80 font-mono">{burned.calories} out</span>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {isGoalMet && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <div className="fixed bottom-10 left-0 right-0 flex justify-center gap-6 pointer-events-none z-30">
        <button 
          onClick={() => setCameraOpen(true)} 
          className="pointer-events-auto w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-all"
        >
          <Camera size={20} strokeWidth={2} />
        </button>
        <button 
          onClick={() => setVoiceOpen(true)} 
          className="pointer-events-auto w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center border border-zinc-800 shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Mic size={20} strokeWidth={2} />
        </button>
      </div>

      <BottomSheet isOpen={isCameraOpen} onClose={() => setCameraOpen(false)} title="Log Meal">
        <CameraView onLog={handleLogFood} onClose={() => setCameraOpen(false)} />
      </BottomSheet>
      
      <BottomSheet isOpen={isVoiceOpen} onClose={() => setVoiceOpen(false)} title="Log Activity">
        <VoiceView onLog={handleLogWorkout} onClose={() => setVoiceOpen(false)} />
      </BottomSheet>
      
      <BottomSheet isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} title="Body Data">
        <ProfileView goals={goals} setGoals={setGoals} onClose={() => setProfileOpen(false)} />
      </BottomSheet>
    </div>
  );
}
