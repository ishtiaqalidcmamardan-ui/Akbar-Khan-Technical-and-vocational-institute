
import React, { memo } from 'react';
import { useEdit } from './EditContext';
import { contentService } from '../services/contentService';

interface FloatingToolbarProps {
  userRole?: string;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = memo(({ userRole }) => {
  const { isTextEditing, isImageEditing, toggleTextEditing, toggleImageEditing, setTextEditing, setImageEditing } = useEdit();

  // Safety exit: Do not render anything if the user is not an admin
  if (userRole !== 'admin') {
    return null;
  }

  const handleDeploy = async () => {
    if (confirm('Deploy all local changes to the cloud database? This will make edits visible to all visitors.')) {
      try {
        await contentService.deployToCloud();
        alert('Site successfully synchronized with cloud!');
      } catch (err) {
        alert('Cloud deployment failed. Ensure you are connected and Supabase is configured.');
      }
    }
  };

  const handleReset = () => {
    if (confirm('Reset all local drafts? This cannot be undone.')) {
      contentService.resetDefaults();
    }
  };

  const exitAllModes = () => {
    setTextEditing(false);
    setImageEditing(false);
  };

  return (
    <div className="fixed bottom-24 right-8 flex flex-col gap-4 z-[999] no-print">
      {/* Save / Deploy Cloud Action */}
      {(isTextEditing || isImageEditing) && (
        <>
          <button 
            onClick={handleDeploy}
            className="p-4 bg-emerald-600 text-white rounded-full shadow-2xl hover:bg-emerald-700 transition-all flex items-center justify-center group transform hover:scale-110 active:scale-90"
            title="Deploy to Cloud"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </button>
          
          <button 
            onClick={exitAllModes}
            className="p-4 bg-slate-900 text-white rounded-full shadow-2xl hover:bg-black transition-all flex items-center justify-center group transform hover:scale-110 active:scale-90"
            title="Finish All Edits"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </>
      )}

      <div className="w-px h-4 bg-slate-200 mx-auto opacity-50"></div>

      {/* Text Editing Toggle */}
      <button 
        onClick={toggleTextEditing}
        className={`p-4 rounded-full shadow-2xl transition-all flex items-center justify-center group transform hover:scale-110 active:scale-90 ${isTextEditing ? 'bg-amber-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
        title={isTextEditing ? "Exit Text Edit Mode" : "Activate Text Edit Mode"}
      >
        {isTextEditing ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )}
      </button>

      {/* Image Editing Toggle */}
      <button 
        onClick={toggleImageEditing}
        className={`p-4 rounded-full shadow-2xl transition-all flex items-center justify-center group transform hover:scale-110 active:scale-90 ${isImageEditing ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
        title={isImageEditing ? "Exit Image Edit Mode" : "Activate Image Edit Mode"}
      >
        {isImageEditing ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      <button 
        onClick={handleReset}
        className="p-4 bg-white text-rose-600 rounded-full shadow-2xl hover:bg-rose-50 transition-all flex items-center justify-center transform hover:scale-110 active:scale-90"
        title="Reset Local Drafts"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
});
