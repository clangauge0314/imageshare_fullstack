import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./Components/MainPage/MainPage";
import ImageShare1 from "./Components/ImageShare/ImageShare1";
import ImageShare2 from "./Components/ImageShare/ImageShare2";
import ImageShare3 from "./Components/ImageShare/ImageShare3";
import ContactUs from "./Components/ContactUs/ContactUs";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/file/20241028_203244_png" element={<ImageShare1 />} />
        <Route path="/file/20241028_102210_png" element={<ImageShare2 />} />
        <Route path="/file/20241023_125415_png" element={<ImageShare3 />} />
      </Routes>
    </Router>
  );
}

export default App;
