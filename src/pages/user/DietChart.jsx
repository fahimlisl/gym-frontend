import { useEffect, useState, useRef, useCallback } from "react";
import api from "../../api/axios.api.js";

function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent]   = useState(startIndex);
  const touchStartX             = useRef(0);
  const touchStartY             = useRef(0);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowRight")  setCurrent(c => (c + 1) % images.length);
      if (e.key === "ArrowLeft")   setCurrent(c => (c - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 50 && dy < 80) {
      if (dx > 0) setCurrent(c => (c + 1) % images.length);
      else        setCurrent(c => (c - 1 + images.length) % images.length);
    }
    if (e.changedTouches[0].clientY - touchStartY.current > 100 && Math.abs(dx) < 30) {
      onClose();
    }
  };

  const prev = () => setCurrent(c => (c - 1 + images.length) % images.length);
  const next = () => setCurrent(c => (c + 1) % images.length);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-white/60 text-sm font-medium">
          {images.length > 1 ? `${current + 1} / ${images.length}` : ""}
        </span>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative overflow-hidden px-2">
        <img
          key={current}
          src={images[current].photo}
          alt={`Diet plan ${current + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg select-none"
          draggable={false}
          style={{ animation: "fadeIn 0.18s ease" }}
        />

        {images.length > 1 && (
          <>
            <button onClick={prev}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors items-center justify-center text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button onClick={next}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors items-center justify-center text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          </>
        )}
      </div>

      <div className="shrink-0 pb-8 pt-4 flex flex-col items-center gap-3">
        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${
                  i === current ? "w-5 h-1.5 bg-red-500" : "w-1.5 h-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        )}
        <p className="text-white/25 text-xs md:hidden">
          {images.length > 1 ? "Swipe to navigate · " : ""}Swipe down to close
        </p>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

export default function DietChart() {
  const [diet,           setDiet]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [touchStart,     setTouchStart]     = useState(0);
  const [touchEnd,       setTouchEnd]       = useState(0);
  const [loadedImages,   setLoadedImages]   = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [ptStatus, setPtStatus] = useState(null); // "active" | "expired" | "none"

  useEffect(() => {
    const checkPTAndFetchDiet = async () => {
      try {
        setLoading(true);
        const profileRes = await api.get("/user/getProfile");
        const pt = profileRes.data.data?.personalTraning;
        const latestPT = pt?.subscription?.[pt.subscription.length - 1];
        const status = latestPT?.status?.toLowerCase() || "none";
        setPtStatus(status);

        if (status === "expired" || status === "none") {
          setLoading(false);
          return;
        }

        const res = await api.get("/user/diet/my");
        setDiet(res.data.data);
      } catch (err) {
        console.error("Failed to load diet:", err);
      } finally {
        setLoading(false);
      }
    };
    checkPTAndFetchDiet();
  }, []);

  useEffect(() => {
    if (!diet?.photos) return;
    const images = diet.photos.filter(photo => !isPdf(photo.photo));
    if (images.length === 0) return;

    const indicesToPreload = [
      currentIndex,
      (currentIndex + 1) % images.length,
      (currentIndex - 1 + images.length) % images.length,
    ];

    indicesToPreload.forEach(index => {
      if (!loadedImages[index]) {
        const img = new Image();
        img.src = images[index].photo;
        img.onload = () => setLoadedImages(prev => ({ ...prev, [index]: true }));
      }
    });
  }, [currentIndex, diet?.photos, loadedImages]);

  const handleTouchStart = (e) => { setTouchStart(e.targetTouches[0].clientX); };
  const handleTouchMove  = (e) => { setTouchEnd(e.targetTouches[0].clientX);   };
  const handleTouchEnd   = () => {
    if (!touchStart || !touchEnd) return;
    const diff = touchStart - touchEnd;
    if (diff > 50)  nextImage();
    if (diff < -50) prevImage();
    setTouchStart(0);
    setTouchEnd(0);
  };

  const go = useCallback((idx) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(idx);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [isTransitioning]);

  const nextImage = () => { if (!diet?.photos || isTransitioning) return; go((currentIndex + 1) % images.length); };
  const prevImage = () => { if (!diet?.photos || isTransitioning) return; go((currentIndex - 1 + images.length) % images.length); };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/10 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (ptStatus === "expired" || ptStatus === "none") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">
            {ptStatus === "expired" ? "PT EXPIRED" : "NO PERSONAL TRAINING"}
          </h2>
          <p className="text-neutral-400 text-sm">
            {ptStatus === "expired"
              ? "Renew your personal training plan to view your diet plan."
              : "You don't have a personal training plan assigned yet. Contact your trainer to get started."}
          </p>
        </div>
      </div>
    );
  }

  if (!diet || !diet.photos || diet.photos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🥗</div>
          <h2 className="text-xl font-bold text-white mb-2">No Diet Plan Yet</h2>
          <p className="text-neutral-400 text-sm">Your admin hasn't uploaded a diet plan yet.</p>
        </div>
      </div>
    );
  }

  const isPdf = (url) =>
    url?.toLowerCase().includes(".pdf") || url?.toLowerCase().includes("pdf");

  const getPdfUrl = (url) => url?.replace("/upload/", "/upload/fl_inline/") ?? url;

  const images = diet.photos.filter(photo => !isPdf(photo.photo));
  const pdfs   = diet.photos.filter(photo =>  isPdf(photo.photo));

  if (images.length === 0 && pdfs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-xl font-bold text-white mb-2">No Valid Files</h2>
          <p className="text-neutral-400 text-sm">No images or PDFs available.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {lightboxOpen && (
        <Lightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black p-4 md:p-6">
        <div className="max-w-5xl mx-auto">

          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">Diet Plan</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${diet.status === "approved" ? "bg-green-500" : "bg-yellow-500"}`} />
              <span className={`text-sm capitalize ${diet.status === "approved" ? "text-green-400" : "text-yellow-400"}`}>
                {diet.status}
              </span>
            </div>
          </div>

          {images.length > 0 && (
            <div className="mb-6">
              <div
                className="relative rounded-xl overflow-hidden bg-neutral-900/50"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="relative flex items-center justify-center min-h-[50vh] md:min-h-[70vh]">
                  {!loadedImages[currentIndex] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white/10 border-t-red-600 rounded-full animate-spin" />
                    </div>
                  )}

                  <button
                    className="w-full h-full flex items-center justify-center"
                    onClick={() => openLightbox(currentIndex)}
                    title="Tap to view fullscreen"
                  >
                    <img
                      src={images[currentIndex].photo}
                      alt={`Diet plan ${currentIndex + 1}`}
                      className={`w-full h-auto max-h-[70vh] object-contain rounded-xl transition-opacity duration-300 ${
                        loadedImages[currentIndex] ? "opacity-100" : "opacity-0"
                      }`}
                      onLoad={() => setLoadedImages(prev => ({ ...prev, [currentIndex]: true }))}
                      draggable={false}
                    />
                  </button>

                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white/70 text-[10px] px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>
                    Tap to zoom
                  </div>
                </div>

                {images.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); prevImage(); }} disabled={isTransitioning}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-all hidden md:block disabled:opacity-50">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); nextImage(); }} disabled={isTransitioning}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-all hidden md:block disabled:opacity-50">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </>
                )}

                {images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {images.map((_, idx) => (
                      <button key={idx}
                        onClick={(e) => { e.stopPropagation(); go(idx); }}
                        className={`transition-all h-2 rounded-full ${
                          idx === currentIndex ? "w-6 bg-red-600" : "w-2 bg-white/50 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <p className="text-center text-neutral-500 text-xs mt-3">
                  {currentIndex + 1} / {images.length} · Tap image to view fullscreen
                </p>
              )}
            </div>
          )}

          {pdfs.length > 0 && (
            <div className={images.length > 0 ? "mt-8" : ""}>
              <h2 className="text-white text-lg font-semibold mb-3">Documents</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pdfs.map((pdf, index) => (
                  <a key={index} href={getPdfUrl(pdf.photo)} target="_blank" rel="noopener noreferrer"
                    className="block bg-neutral-800 border border-white/10 rounded-xl overflow-hidden hover:border-red-600/50 transition-all duration-200 group">
                    <div className="flex items-center justify-between p-4 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl group-hover:scale-110 transition-transform duration-200">📄</div>
                        <div>
                          <p className="text-white text-sm font-semibold">PDF Document {index + 1}</p>
                          <p className="text-neutral-400 text-xs">Tap to open</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-neutral-600 text-xs mt-8">
            Last updated:{" "}
            {new Date(diet.updatedAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>
      </div>
    </>
  );
}