import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, AlertCircle, RotateCcw } from 'lucide-react';
import { loadYouTubeApi, type YTPlayer, type YTPlayerEvent } from './youtubeApi';
import { PlayerControls } from './PlayerControls';
import { progressService } from '../../hooks/useProgress';

const SAVE_INTERVAL_MS = 5000;
const COMPLETE_THRESHOLD = 0.9;
const HIDE_CONTROLS_DELAY_MS = 2800;

interface CourseVideoPlayerProps {
  youtubeVideoId: string;
  lessonId: string;
  courseId: string;
  userId?: string;
  /** false trava o avanço pra além do ponto mais assistido. Default: true (livre). */
  allowSeekForward?: boolean;
  onCompleted?: () => void;
  /** true quando o pai já controla a altura (ex: layout "modo cinema" flex-1) — preenche 100% em vez de manter aspect-video. */
  fill?: boolean;
}

export function CourseVideoPlayer({
  youtubeVideoId, lessonId, courseId, userId, allowSeekForward = true, onCompleted, fill = false,
}: CourseVideoPlayerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const pollRef = useRef<number | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveRef = useRef(0);
  const furthestTimeRef = useRef(0);
  const completedRef = useRef(false);
  const onCompletedRef = useRef(onCompleted);
  onCompletedRef.current = onCompleted;

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [furthestTime, setFurthestTime] = useState(0);
  const [volume, setVolumeState] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const persistProgress = useCallback((time: number, dur: number) => {
    if (!userId || dur <= 0) return;
    progressService.saveVideoProgress(userId, courseId, lessonId, time, dur).then((result) => {
      if (result?.completed && !completedRef.current) {
        completedRef.current = true;
        onCompletedRef.current?.();
      }
    });
  }, [userId, courseId, lessonId]);

  // Monta o player uma única vez por videoId. YT.Player controla o iframe internamente —
  // não existe nenhum <video>/<iframe> nosso por cima, só essa camada de controles.
  useEffect(() => {
    let cancelled = false;
    setIsReady(false);
    setError(null);
    completedRef.current = false;
    furthestTimeRef.current = 0;
    setFurthestTime(0);
    setCurrentTime(0);

    // Um videoId malformado faz a IFrame API rejeitar de um jeito que não passa
    // pelo onError (fica pendurada em "Carregando..." pra sempre) — valida antes.
    if (!/^[A-Za-z0-9_-]{11}$/.test(youtubeVideoId)) {
      setError('Não foi possível reproduzir este vídeo. Tente novamente mais tarde.');
      return;
    }

    loadYouTubeApi().then((YT) => {
      if (cancelled || !mountRef.current) return;

      const player = YT.Player;
      const instance = new player(mountRef.current, {
        videoId: youtubeVideoId,
        playerVars: {
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: YTPlayerEvent) => {
            if (cancelled) return;
            playerRef.current = e.target;
            const dur = e.target.getDuration();
            setDuration(dur);
            setVolumeState(e.target.getVolume());

            if (userId) {
              progressService.getLessonVideoProgress(userId, lessonId).then((saved) => {
                if (cancelled || !saved) return;
                const resumeAt = saved.timeSpent;
                furthestTimeRef.current = resumeAt;
                setFurthestTime(resumeAt);
                setCurrentTime(resumeAt);
                completedRef.current = saved.completed;
                if (resumeAt > 3) {
                  e.target.seekTo(resumeAt, true);
                }
              });
            }
            setIsReady(true);
          },
          onStateChange: (e: YTPlayerEvent) => {
            if (cancelled) return;
            const state = e.data;
            // 1 = playing, 2 = paused, 3 = buffering, 0 = ended
            setIsPlaying(state === 1);
            setBuffering(state === 3);
            if (state === 0 && playerRef.current) {
              const dur = playerRef.current.getDuration();
              furthestTimeRef.current = dur;
              setFurthestTime(dur);
              setCurrentTime(dur);
              persistProgress(dur, dur);
            }
          },
          onError: () => {
            if (cancelled) return;
            setError('Não foi possível reproduzir este vídeo. Tente novamente mais tarde.');
          },
        },
      });

      playerRef.current = instance;
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeVideoId, lessonId, reloadKey]);

  // Loop de leitura: só existe enquanto o vídeo está tocando (a API não empurra tempo sozinha)
  useEffect(() => {
    if (!isPlaying) {
      if (pollRef.current) window.clearInterval(pollRef.current);
      return;
    }

    pollRef.current = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const time = player.getCurrentTime();
      setCurrentTime(time);
      if (time > furthestTimeRef.current) {
        furthestTimeRef.current = time;
        setFurthestTime(time);
      }

      const now = Date.now();
      if (now - lastSaveRef.current >= SAVE_INTERVAL_MS) {
        lastSaveRef.current = now;
        const dur = player.getDuration();
        persistProgress(furthestTimeRef.current, dur);
      }
    }, 250);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [isPlaying, persistProgress]);

  // Fallback de conclusão: não depender só do ENDED (spec pede >=90% mesmo sem chegar ao fim)
  useEffect(() => {
    if (completedRef.current || duration <= 0) return;
    if (currentTime / duration >= COMPLETE_THRESHOLD) {
      completedRef.current = true;
      onCompletedRef.current?.();
    }
  }, [currentTime, duration]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) player.pauseVideo();
    else player.playVideo();
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    const player = playerRef.current;
    if (!player) return;
    const maxSeekable = allowSeekForward ? duration : Math.max(furthestTimeRef.current, currentTime);
    const clamped = Math.min(Math.max(0, time), maxSeekable);
    player.seekTo(clamped, true);
    setCurrentTime(clamped);
  }, [allowSeekForward, duration, currentTime]);

  const changeVolume = useCallback((next: number) => {
    playerRef.current?.setVolume(next);
    setVolumeState(next);
    if (next > 0 && isMuted) {
      playerRef.current?.unMute();
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isMuted) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  }, [isMuted]);

  const setRate = useCallback((rate: number) => {
    playerRef.current?.setPlaybackRate(rate);
    setPlaybackRate(rate);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Some com os controles quando o mouse fica parado enquanto o vídeo toca; some com pausa, permanece visível
  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), HIDE_CONTROLS_DELAY_MS);
  }, []);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (isPlaying) scheduleHide();
  }, [isPlaying, scheduleHide]);

  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      scheduleHide();
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isPlaying, scheduleHide]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        seek(currentTime - 5);
        break;
      case 'ArrowRight':
        e.preventDefault();
        seek(currentTime + 5);
        break;
      case 'ArrowUp':
        e.preventDefault();
        changeVolume(Math.min(100, volume + 10));
        break;
      case 'ArrowDown':
        e.preventDefault();
        changeVolume(Math.max(0, volume - 10));
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'm':
      case 'M':
        toggleMute();
        break;
      default:
        break;
    }
  };

  const retry = () => setReloadKey((k) => k + 1);

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black overflow-hidden outline-none select-none ${
        fill ? 'h-full' : 'aspect-video rounded-xl'
      }`}
      style={isFullscreen ? { borderRadius: 0 } : undefined}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseMove={showControls}
      onTouchStart={showControls}
      onMouseLeave={() => isPlaying && setControlsVisible(false)}
    >
      {/* Único elemento de reprodução: o YT monta o iframe dentro deste div */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none [&_iframe]:w-full [&_iframe]:h-full" />

      {!isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-900">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-[3px] border-white/20 border-t-primary-500 rounded-full animate-spin" />
            <span className="text-white/50 text-xs font-medium">Carregando vídeo...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-900 px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-white/80 text-sm max-w-xs">{error}</p>
            <button
              onClick={retry}
              className="flex items-center gap-2 text-xs font-medium text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              <RotateCcw size={14} />
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {isReady && !error && !isPlaying && !buffering && (
        <button
          onClick={togglePlay}
          aria-label="Reproduzir"
          className="absolute inset-0 flex items-center justify-center cursor-pointer group"
        >
          <span className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Play size={26} className="text-primary-600 ml-1" fill="currentColor" />
          </span>
        </button>
      )}

      {isReady && !error && (
        <PlayerControls
          visible={controlsVisible}
          isPlaying={isPlaying}
          buffering={buffering}
          currentTime={currentTime}
          duration={duration}
          furthestTime={furthestTime}
          allowSeekForward={allowSeekForward}
          volume={volume}
          isMuted={isMuted}
          playbackRate={playbackRate}
          isFullscreen={isFullscreen}
          onTogglePlay={togglePlay}
          onSeek={seek}
          onVolumeChange={changeVolume}
          onToggleMute={toggleMute}
          onSetPlaybackRate={setRate}
          onToggleFullscreen={toggleFullscreen}
        />
      )}
    </div>
  );
}
