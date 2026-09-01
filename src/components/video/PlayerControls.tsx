import { useRef, useState } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Loader2,
} from 'lucide-react';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

interface PlayerControlsProps {
  visible: boolean;
  isPlaying: boolean;
  buffering: boolean;
  currentTime: number;
  duration: number;
  furthestTime: number;
  allowSeekForward: boolean;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onSetPlaybackRate: (rate: number) => void;
  onToggleFullscreen: () => void;
}

export function PlayerControls({
  visible, isPlaying, buffering, currentTime, duration, furthestTime, allowSeekForward,
  volume, isMuted, playbackRate, isFullscreen,
  onTogglePlay, onSeek, onVolumeChange, onToggleMute, onSetPlaybackRate, onToggleFullscreen,
}: PlayerControlsProps) {
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const maxSeekable = allowSeekForward ? duration : Math.max(furthestTime, currentTime);
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const seekLimitPct = duration > 0 ? (maxSeekable / duration) * 100 : 100;

  const seekFromClientX = (clientX: number) => {
    const bar = barRef.current;
    if (!bar || duration <= 0) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onSeek(Math.min(ratio * duration, maxSeekable));
  };

  return (
    <div
      className={`absolute inset-x-0 bottom-0 px-3 sm:px-4 pb-2.5 pt-8 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Barra de progresso */}
      <div
        ref={barRef}
        role="slider"
        aria-label="Progresso do vídeo"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        tabIndex={0}
        className="group/bar relative h-4 flex items-center cursor-pointer touch-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          seekFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) seekFromClientX(e.clientX);
        }}
      >
        <div className="absolute inset-x-0 h-1 rounded-full bg-white/25 group-hover/bar:h-1.5 transition-all">
          {!allowSeekForward && seekLimitPct < 100 && (
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white/20"
              style={{ width: `${seekLimitPct}%` }}
            />
          )}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary-500"
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
        </div>
        <div
          className="absolute w-3 h-3 rounded-full bg-primary-500 shadow scale-0 group-hover/bar:scale-100 transition-transform"
          style={{ left: `calc(${Math.min(100, progressPct)}% - 6px)` }}
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 mt-1">
        <button
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          className="text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer flex-shrink-0"
        >
          {buffering ? (
            <Loader2 size={20} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" />
          )}
        </button>

        <span className="text-white text-xs font-medium tabular-nums whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="flex-1" />

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-1.5 group/vol">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Ativar som' : 'Mudo'}
            className="text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            aria-label="Volume"
            className="w-0 group-hover/vol:w-16 transition-all duration-200 accent-primary-500 cursor-pointer"
          />
        </div>

        {/* Velocidade */}
        <div className="relative">
          <button
            onClick={() => setSpeedMenuOpen((v) => !v)}
            aria-label="Velocidade de reprodução"
            className="text-white text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-white/10 cursor-pointer min-w-[38px]"
          >
            {playbackRate}x
          </button>
          {speedMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-24 bg-surface-900/95 backdrop-blur rounded-lg shadow-lg border border-white/10 py-1 z-10">
              {SPEEDS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    onSetPlaybackRate(speed);
                    setSpeedMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium cursor-pointer ${
                    speed === playbackRate ? 'text-primary-400' : 'text-white hover:bg-white/10'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          className="text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer flex-shrink-0"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>

        <button
          aria-label="Configurações"
          className="hidden sm:block text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer flex-shrink-0"
          onClick={() => setSpeedMenuOpen((v) => !v)}
        >
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}
