import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import AuthForm from './authform'; // Ensure correct component import
import NotFound from './NotFound';
import Spinner from './Spinner';
import bgImage from './assets/images/bgImage.png';

function MainApp() {
  const [loading, setLoading] = useState(true);
  const [imageFit, setImageFit] = useState('cover');
  const [imagePosition, setImagePosition] = useState('center');
  const location = useLocation();

  useEffect(() => {
    const adjustImageStyle = () => {
      if (window.innerWidth <= 768) {
        setImageFit('contain');
        setImagePosition('center');
      } else {
        setImageFit('contain');
        setImagePosition('center');
      }
    };

    const preventScrolling = () => {
      document.body.style.overflow = 'hidden';
    };

    const disableRightClick = (event) => {
      event.preventDefault();
    };

    const blockDevToolsKeys = (event) => {
      if (
        event.key === 'F12' ||
        (event.ctrlKey && event.shiftKey && ['I', 'C', 'J'].includes(event.key)) ||
        (event.ctrlKey && event.key === 'U')
      ) {
        event.preventDefault();
      }
    };

    const detectDevToolsOpen = () => {
      const threshold = 160;
      const devToolsActive =
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold;

      // if (devToolsActive) {
      //   window.location.replace('about:blank');
      // }
    };

    const devToolsCheck = setInterval(detectDevToolsOpen, 500);
    adjustImageStyle();
    preventScrolling();
    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', blockDevToolsKeys);

    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 2000);

    window.addEventListener('resize', adjustImageStyle);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', blockDevToolsKeys);
      clearTimeout(timeoutId);
      window.removeEventListener('resize', adjustImageStyle);
      clearInterval(devToolsCheck);
    };
  }, []);

  return (
    <div className="MainApp" style={{ position: 'relative', height: '100vh', width: '100%' }}>
      {loading && <Spinner />}

      {/* ✅ Remove background image ONLY on /error page */}
      {location.pathname !== '/error' && (
        <img
          src={bgImage}
          alt="Background"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            width: '77%',
            height: '100%',
            objectFit: 'fill',
            objectPosition: imagePosition,
            filter: 'blur(3.5px)',
            zIndex: -1,
            transform: 'translate(-52%, -50%)',
          }}
        />
      )}

      <Routes>
        {!loading && (
          <>
            <Route path="/" element={<AuthForm style={{ marginTop: '100px' }} />} />
            <Route path="/error" element={<NotFound />} />
          </>
        )}
      </Routes>
    </div>
  );
}

function MainAppWrapper() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default MainAppWrapper;
