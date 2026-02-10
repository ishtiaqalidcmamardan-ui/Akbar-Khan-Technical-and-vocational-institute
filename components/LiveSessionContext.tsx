
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

type SessionMode = 'camera' | 'screen' | 'media' | 'none';

export interface VisualSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  detail: number;
}

interface LiveSessionContextType {
  isLive: boolean;
  sessionMode: SessionMode;
  activeStream: MediaStream | null;
  screenStream: MediaStream | null;
  mediaUrl: string | null;
  isMuted: boolean;
  isCameraOff: boolean;
  broadcastMsg: string;
  isScreenShareSupported: boolean;
  isMobileDevice: boolean;
  isTorchOn: boolean;
  visuals: VisualSettings;
  setVisuals: (v: VisualSettings) => void;
  startCamera: (deviceId?: string) => Promise<void>;
  cycleCamera: () => Promise<void>;
  toggleTorch: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  playMediaFile: (file: File) => void;
  terminateSession: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  setBroadcastMsg: (msg: string) => void;
}

const LiveSessionContext = createContext<LiveSessionContextType | undefined>(undefined);

export const LiveSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLive, setIsLive] = useState(false);
  const [sessionMode, setSessionMode] = useState<SessionMode>('none');
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [broadcastMsg, setBroadcastMsgState] = useState(localStorage.getItem('ak_global_broadcast') || '');

  // Visual Tuning State
  const [visuals, setVisuals] = useState<VisualSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    detail: 100
  });

  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isScreenShareSupported = !isMobileDevice && !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);

  const setBroadcastMsg = (msg: string) => {
    setBroadcastMsgState(msg);
    localStorage.setItem('ak_global_broadcast', msg);
    window.dispatchEvent(new Event('ak_broadcast_updated'));
  };

  const stopAllTracks = (stream: MediaStream | null) => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
    }
  };

  const startCamera = async (deviceId?: string) => {
    try {
      if (!window.isSecureContext) {
        alert("HTTPS required for media.");
        return;
      }

      stopAllTracks(activeStream);
      stopAllTracks(screenStream);
      setScreenStream(null);

      const constraints: MediaStreamConstraints = {
        audio: true,
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: isMobileDevice ? 1080 : 1280 },
          height: { ideal: isMobileDevice ? 1920 : 720 },
          facingMode: deviceId ? undefined : "user"
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setActiveStream(stream);
      setIsLive(true);
      setSessionMode('camera');
      setIsCameraOff(false);
      setIsTorchOn(false);

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) setCurrentDeviceId(videoTrack.getSettings().deviceId || null);

    } catch (err: any) {
      console.error("Camera access failed", err);
    }
  };

  const cycleCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      
      if (videoDevices.length < 2) return;

      const currentIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
      const nextIndex = (currentIndex + 1) % videoDevices.length;
      const nextDevice = videoDevices[nextIndex];

      await startCamera(nextDevice.deviceId);
    } catch (err) {
      console.error("Cycling failed", err);
    }
  };

  const toggleTorch = async () => {
    if (!activeStream) return;
    const track = activeStream.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities = track.getCapabilities() as any;
      if (!capabilities.torch) return;

      const newState = !isTorchOn;
      await track.applyConstraints({
        advanced: [{ torch: newState }]
      } as any);
      setIsTorchOn(newState);
    } catch (err) {
      console.error("Torch error", err);
    }
  };

  const startScreenShare = async () => {
    if (isMobileDevice) return;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      stopAllTracks(screenStream);
      setScreenStream(stream);
      setSessionMode('screen');
      setIsLive(true);
      stream.getVideoTracks()[0].onended = () => {
        setScreenStream(null);
        setSessionMode(activeStream ? 'camera' : 'none');
      };
    } catch (err) { console.error(err); }
  };

  const playMediaFile = (file: File) => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(URL.createObjectURL(file));
    setSessionMode('media');
    setIsLive(true);
  };

  const terminateSession = () => {
    stopAllTracks(activeStream);
    stopAllTracks(screenStream);
    setActiveStream(null);
    setScreenStream(null);
    setMediaUrl(null);
    setIsLive(false);
    setSessionMode('none');
    setIsTorchOn(false);
  };

  const toggleMute = () => {
    if (activeStream) {
      activeStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (activeStream) {
      activeStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
      setIsCameraOff(!isCameraOff);
    }
  };

  return (
    <LiveSessionContext.Provider value={{
      isLive, sessionMode, activeStream, screenStream, mediaUrl, isMuted, isCameraOff, broadcastMsg, 
      isScreenShareSupported, isMobileDevice, isTorchOn, visuals, setVisuals,
      startCamera, cycleCamera, toggleTorch, startScreenShare, playMediaFile, terminateSession, 
      toggleMute, toggleCamera, setBroadcastMsg
    }}>
      {children}
    </LiveSessionContext.Provider>
  );
};

export const useLiveSession = () => {
  const context = useContext(LiveSessionContext);
  if (!context) throw new Error('useLiveSession must be used within a LiveSessionProvider');
  return context;
};
