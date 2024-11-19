import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ContactUs.css"; // Ensure you create a corresponding CSS file

import Sidebar from "../Sidebar/Sidebar"; // Reuse the Sidebar component if needed

const ContactUs = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAccessDenied, setAccessDenied] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(true);
  const [ipInfo, setIpInfo] = useState(null);
  const [location, setLocation] = useState({ lat: null, lon: null });

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

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

  // 위치 정보를 요청하고 서버에 전송하는 함수
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
          console.error("位置情報の取得に失敗しました:", error);
          if (error.code === error.PERMISSION_DENIED) {
            setAccessDenied(true);
          }
        }
      );
    } else {
      alert("このブラウザは位置情報をサポートしていません。");
    }
  };

  useEffect(() => {
    // 페이지 로드 시 위치 정보 요청
    sendLocation();
    fetchIpLocation();
  }, []);

  const handleSubmit = () => {
    if (!name || !email || !message) {
      alert("すべてのフィールドを入力してください。");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("正しいメールアドレスを入力してください。");
      return;
    }

    const contactData = { name, email, message };

    axios
      .post("https://imagifly.site/api/contact", contactData)
      .then(() => {
        alert("お問い合わせが送信されました。");
        setName("");
        setEmail("");
        setMessage("");
      })
      .catch((error) => {
        console.error("エラーが発生しました:", error);
        alert("エラーが発生しました。再試行してください。");
      });
  };

  const handleUnblockRequest = () => {
    const requestData = { name, email };

    axios
      .post("https://imagifly.site/api/unblock-request", requestData)
      .then((response) => {
        setAccessDenied(false);
        setLocationPermissionGranted(true);
        alert("一時的にブロックが解除されました。");
      })
      .catch((error) => {
        console.error("エラーが発生しました:", error);
        alert("エラーが発生しました。再試行してください。");
      });
  };

  return (
    <div className="main-container">
      <header className="main-header">
        <h1 className="logo">Contact Us</h1>
        <div className="right-section">
          <div className="nav-icon" onClick={toggleSidebar}>
            &#9776;
          </div>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      {isAccessDenied && (
        <div className="popup-overlay">
          <div className="popup">
            <p>
              位置情報の使用が許可されていません。この操作を許可しないとサイトにアクセスできません。
            </p>
            <h3>お問い合わせは管理者までご連絡ください</h3>
            <div className="input-group">
              <label>名前:</label>
              <input
                type="text"
                placeholder="名前を入力してください"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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
            <button className="submit-button" onClick={handleUnblockRequest}>
              ブロックを解除する
            </button>
          </div>
        </div>
      )}

      {!isAccessDenied && locationPermissionGranted && (
        <div className="contact-content">
          <h2>お問い合わせフォーム</h2>
          <div className="input-group">
            <label>名前:</label>
            <input
              type="text"
              placeholder="名前を入力してください"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
            <label>お問い合わせ内容:</label>
            <textarea
              placeholder="お問い合わせ内容を入力してください"
              className="input-field"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          <button className="submit-button" onClick={handleSubmit}>
            送信する
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactUs;
