import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { generateMealImage, generateSpeech } from '../services/gemini';
import { cn } from '../lib/utils';

export const MealPreviewer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    const url = await generateMealImage(`A high-end, professional food photography of ${prompt}, Indian executive tiffin style, clean slate background, aesthetic lighting`, size);
    setImageUrl(url || null);
    setIsGenerating(false);
  };

  const playTTS = async () => {
    if (!prompt) return;
    const audioUrl = await generateSpeech(`Visualizing your custom meal: ${prompt}. Our chefs are ready to craft this for you.`);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <section className="bg-surface-container-lowest p-8 rounded-3xl food-card-shadow border border-outline-variant/20">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-grow space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-on-tertiary-container">
              <Sparkles size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">AI Visualization</span>
            </div>
            <h2 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Visualize Your Custom Tiffin</h2>
            <p className="text-secondary text-sm">Describe your dream meal, and our AI will generate a preview of how it will look in our premium executive packaging.</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Paneer Butter Masala with Garlic Naan and Jeera Rice..."
                className="w-full h-32 bg-surface-container-low border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <button 
                onClick={playTTS}
                className="absolute bottom-4 right-4 p-2 text-primary/40 hover:text-primary transition-colors"
                title="Listen to description"
              >
                <Volume2 size={20} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-surface-container-low p-1 rounded-xl">
                {(['1K', '2K', '4K'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                      size === s ? "bg-surface-container-lowest text-primary shadow-sm" : "text-secondary hover:text-primary"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="flex-grow lg:flex-none bg-primary text-white px-8 py-3 rounded-xl font-headline font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-all disabled:opacity-50 active:scale-95"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                {isGenerating ? 'Generating...' : 'Generate Preview'}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 h-80 bg-surface-container-low rounded-3xl overflow-hidden flex items-center justify-center relative group">
          {imageUrl ? (
            <motion.img 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              src={imageUrl} 
              alt="AI Generated Meal" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center space-y-2 opacity-30">
              <ImageIcon size={48} className="mx-auto" />
              <p className="text-xs font-bold uppercase tracking-widest">Preview Area</p>
            </div>
          )}
          {isGenerating && (
            <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
