import React, { useState, useRef } from 'react';
import { Play, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
}

export const AudioPlayer = ({ src }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100);

      const mins = Math.floor(current / 60);
      const secs = Math.floor(current % 60);
      setCurrentTime(`${mins}:${secs.toString().padStart(2, '0')}`);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      const total = audioRef.current.duration;
      const mins = Math.floor(total / 60);
      const secs = Math.floor(total % 60);
      setDuration(`${mins}:${secs.toString().padStart(2, '0')}`);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = x / rect.width;
      audioRef.current.currentTime = pct * audioRef.current.duration;
    }
  };

  return (
    <div className="mt-auto mb-8 bg-gray-50/50 rounded-3xl p-4 flex items-center gap-6 border border-gray-100/50">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      <button
        onClick={togglePlay}
        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md text-gray-700 hover:scale-105 transition-transform active:scale-95"
      >
        {isPlaying ? <span className="font-bold text-xl">||</span> : <Play size={20} fill="currentColor" />}
      </button>
      <div className="flex-1 space-y-2">
        <div 
          className="h-1.5 w-full bg-gray-200 rounded-full relative overflow-hidden cursor-pointer" 
          onClick={handleProgressClick}
        >
          <div 
            className="absolute inset-y-0 left-0 bg-gray-600 rounded-full transition-all duration-100" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-gray-400 tracking-wider">
          <span>{currentTime} / {duration}</span>
          <Volume2 size={12} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
};
