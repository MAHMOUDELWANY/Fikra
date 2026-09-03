import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Camera, Check, Upload, Sparkles, CheckCircle2 } from 'lucide-react';

interface PortraitImageProps {
  className?: string;
  priority?: boolean;
}

export const PortraitImage: React.FC<PortraitImageProps> = ({ className = '', priority = true }) => {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('mahmoud_custom_photo');
      if (saved) return saved;
    } catch {
      // ignore
    }
    return '/IMG_20260809_132258_580.jpg';
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveImage = (dataUrl: string) => {
    setImgSrc(dataUrl);
    try {
      localStorage.setItem('mahmoud_custom_photo', dataUrl);
    } catch {
      // ignore quota
    }
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2500);

    // Also persist to server disk via /api/upload-photo
    fetch('/api/upload-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl })
    }).catch(err => console.log('Saved to client state/localStorage:', err));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          saveImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          saveImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`relative select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Floating Status Pill: "Live Booking Open" */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-3.5 left-6 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#29232F] border border-[#87A878]/50 shadow-md text-xs font-semibold text-[#362E3B] dark:text-[#F5E6D3] cursor-default backdrop-blur-md"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#87A878] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#87A878]"></span>
        </span>
        <span>Accepting 1-on-1 Students</span>
      </motion.div>

      {/* Floating Accreditation Badge */}
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        className="absolute -bottom-4 right-4 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#29232F] border border-[#B8A9C9]/50 shadow-lg text-xs font-medium text-[#362E3B] dark:text-[#F5E6D3] cursor-default backdrop-blur-md"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#B8A9C9]" />
        <span>Al-Azhar Foundation</span>
      </motion.div>

      {/* Main Portrait Frame */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-white dark:bg-[#29232F] border-2 transition-all duration-300 ${
          isDragging
            ? 'border-[#87A878] ring-4 ring-[#87A878]/30 scale-[1.01]'
            : 'border-white/90 dark:border-[#3E3545] shadow-[0_20px_50px_rgba(54,46,59,0.14)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
        } aspect-[4/5] sm:aspect-[4/5.2] w-full max-w-[430px] mx-auto`}
      >
        <motion.img
          src={imgSrc}
          alt="Ustadh Mahmoud - 1-on-1 Quran, Arabic, and Islamic Studies Teacher"
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => {
            if (imgSrc !== '/mahmoud.jpg') {
              setImgSrc('/mahmoud.jpg');
            }
          }}
        />

        {/* Subtle Warm Gradient Vignette at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#201A24]/85 via-[#201A24]/30 to-transparent pointer-events-none" />

        {/* Name and Credentials Tag at bottom */}
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white pointer-events-none">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-[#87A878]"></span>
              <p className="font-serif text-lg font-medium text-white tracking-tight leading-none">
                Ustadh Mahmoud
              </p>
            </div>
            <p className="text-[12px] text-[#F5E6D3]/90 font-sans tracking-wide">
              Al-Azhar Graduate • Online 1-on-1
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] uppercase tracking-wider text-[#B8A9C9] font-semibold">
            Certified
          </span>
        </div>

        {/* Quick Upload / Replace Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          title="Upload or update Ustadh Mahmoud's photo"
          aria-label="Upload photo"
          className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer text-xs font-medium ${
            isHovered || isDragging
              ? 'opacity-100 translate-y-0 bg-[#362E3B]/80 hover:bg-[#362E3B] text-white shadow-md'
              : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          {uploadSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#87A878]" />
              <span className="text-[#87A878]">Photo Updated!</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5" />
              <span>Change Photo</span>
            </>
          )}
        </motion.button>

        {/* Drag Overlay Hint */}
        {isDragging && (
          <div className="absolute inset-0 bg-[#87A878]/85 backdrop-blur-xs flex flex-col items-center justify-center text-white text-center p-6 animate-fadeIn">
            <Upload className="w-10 h-10 mb-2 animate-bounce" />
            <p className="font-medium text-sm">Drop Mahmoud’s photo here</p>
            <p className="text-xs text-white/80 mt-1">IMG_20260809_132258_580.jpg</p>
          </div>
        )}
      </div>

      {/* Understated Framing Accent in Lavender & Sage */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#B8A9C9]/50 rounded-br-3xl -z-10 pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#87A878]/40 rounded-tl-3xl -z-10 pointer-events-none"
      />
    </motion.div>
  );
};

