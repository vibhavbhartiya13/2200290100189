import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StockPage from './pages/Stock Page/StockPage';
import Map from './pages/Correlation Heatmap/Map'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StockPage />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </Router>
  );
}
export default App;