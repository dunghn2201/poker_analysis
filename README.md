# 🎯 Poker Analysis Pro

Công cụ phân tích poker hiện đại cho người mới và người chơi có kinh nghiệm. Tính toán equity, đưa ra gợi ý hành động với Monte Carlo simulation.

## ✨ Tính năng chính

### 🎯 Cho người mới (Beginner Mode)
- **Gợi ý hành động đơn giản**: Check/Fold/Bet/Raise với lý do dễ hiểu
- **Từ điển thuật ngữ**: Giải thích các khái niệm poker cơ bản (Việt/Anh)
- **Mẹo chơi**: Tips theo từng street với ví dụ cụ thể
- **Giải thích "tại sao"**: Phân tích EV và lý do cho từng quyết định

### 🎲 Cho người có kinh nghiệm (Pro Mode)
- **Chỉ số chi tiết**: Range analysis, equity %, pot odds, SPR, EV
- **Monte Carlo simulation**: Tính toán equity chính xác với 50k+ iterations
- **Leak detector**: Phát hiện lỗi thường gặp và đưa ra giải pháp
- **Range heatmap**: Phân tích range hero vs villain
- **Sizing recommendations**: Gợi ý bet sizing tối ưu (33%, 50%, 75%, 100%)

### 🎮 Tính năng khác
- **Dark mode**: Giao diện tối thân thiện với mắt
- **Export/Share**: Lưu và chia sẻ hand analysis
- **Quick analysis**: Phân tích nhanh trong thời gian thực
- **Board texture analysis**: Nhận diện dry/wet board
- **Position awareness**: Tính toán theo vị trí chơi

## 🏗️ Kiến trúc

### Frontend
- **Framework**: Next.js 15 + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (simplified for demo)
- **Charts**: Recharts (ready to implement)

### Backend
- **Runtime**: Node.js + Express
- **API**: RESTful endpoints với mock data
- **Equity Engine**: Monte Carlo simulation trong JavaScript
- **Real-time**: Web Workers cho heavy calculations

### Algorithms
- **Monte Carlo Equity**: 50,000+ iterations cho độ chính xác cao
- **Hand Evaluation**: 7-card poker hand ranking
- **EV Calculation**: Expected Value cho từng action
- **Range Construction**: Simplified GTO-based ranges

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+ 
- npm hoặc yarn
- Trình duyệt hiện đại (Chrome/Firefox/Safari/Edge)

### Bước 1: Clone và cài đặt
```bash
# Clone repository (nếu có)
git clone [repository-url]
cd poker_calculation

# Cài đặt dependencies
npm install
```

### Bước 2: Chạy Development
```bash
# Chạy frontend và backend cùng lúc
npm run dev:full

# Hoặc chạy riêng lẻ:
# Frontend (port 3000)
npm run dev

# Backend (port 3001) 
npm run backend
```

### Bước 3: Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/health
- **API Documentation**: http://localhost:3001/api (sẽ được bổ sung)

## 📊 API Endpoints

### POST /api/analyze
Phân tích hand poker và đưa ra gợi ý

**Request:**
```json
{
  "heroCards": ["As","Kd"],
  "board": ["7h","8h","2c",null,null],
  "positions": {"hero":"CO","villain":"BB"},
  "stacksBB": {"hero": 100, "villain": 120},
  "pot": 6,
  "street": "FLOP",
  "actionLog": [],
  "opponentProfile": "REG",
  "assumptions": {
    "foldEquity": 0.35,
    "sizingOptions": [0.33,0.5,0.75,1.0]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "action": "BET",
        "size": 0.5,
        "score": 0.58,
        "rationale": ["Strong equity: 46.2%", "Value betting for profit"]
      }
    ],
    "metrics": {
      "equity": 0.46,
      "potOdds": 0.33,
      "requiredEquity": 0.33,
      "spr": 5.2,
      "ev": {"call": 0.1, "bet_0.5": 0.6}
    },
    "confidence": "MEDIUM",
    "leaks": []
  }
}
```

### GET /api/glossary
Lấy từ điển thuật ngữ poker

### POST /api/report
Tạo báo cáo phân tích hand

## 🎯 Hướng dẫn sử dụng

### Bước 1: Nhập thông tin bài
1. **Hero Cards**: Chọn 2 lá bài của bạn
2. **Board**: Chọn bài chung (Flop/Turn/River)
3. **Positions**: Đặt vị trí Hero và Villain
4. **Stacks & Pot**: Nhập stack size và pot hiện tại
5. **Street**: Chọn street hiện tại
6. **Opponent Profile**: Chọn loại đối thủ (Nit/Reg/Loose/Whale)

### Bước 2: Cài đặt nâng cao
- **Fold Equity**: Điều chỉnh khả năng đối thủ fold (0-100%)
- **Mode**: Chuyển đổi giữa Beginner/Pro mode

### Bước 3: Phân tích
1. Nhấn **"Phân tích bài"**
2. Đợi kết quả (1-2 giây)
3. Xem gợi ý hành động và giải thích
4. Tham khảo chỉ số chi tiết (Pro mode)

### Bước 4: Học hỏi
- Đọc **rationale** để hiểu lý do
- Xem **Leak Detection** để cải thiện
- Sử dụng **Glossary** tra cứu thuật ngữ

## 📱 Screenshots & Demo

### Beginner Mode
- Giao diện đơn giản với gợi ý rõ ràng
- Giải thích từng bước và lý do
- Tooltip cho các thuật ngữ

### Pro Mode  
- Dashboard chi tiết với metrics
- Range analysis và heatmap
- Advanced statistics và EV calculation

## 🎓 Concepts & Algorithms

### Monte Carlo Simulation
```javascript
// Simplified equity calculation
function calculateEquity(heroCards, board, iterations = 50000) {
  let wins = 0;
  for (let i = 0; i < iterations; i++) {
    const completeBoard = dealRandomBoard(board);
    const villainCards = dealRandomHand();
    const heroHand = evaluateHand([...heroCards, ...completeBoard]);
    const villainHand = evaluateHand([...villainCards, ...completeBoard]);
    if (compareHands(heroHand, villainHand) > 0) wins++;
  }
  return wins / iterations;
}
```

### Expected Value Calculation
```javascript
// EV calculation for different actions
const callEV = equity * (pot + callSize) - callSize;
const betEV = foldEquity * pot + (1 - foldEquity) * (equity * newPot - betSize);
```

### Leak Detection Rules
- **Overcalling**: Required equity > Estimated equity + 10%
- **Under-betting**: Strong hands (equity > 70%) với bet size < 50%
- **Position awareness**: Playing too loose OOP
- **SPR mismatch**: Short stack với weak hands

## 🏆 Best Practices

### Cho người mới
1. **Học thuật ngữ cơ bản** trước khi bắt đầu
2. **Hiểu Pot Odds**: So sánh với equity để quyết định call/fold
3. **Quan sát position**: Vị trí càng muộn càng có lợi
4. **Bắt đầu với tight range**: Chơi ít tay nhưng mạnh

### Cho người có kinh nghiệm
1. **Phân tích range**: Không chỉ xem bài mình, nghĩ về range đối thủ
2. **Board texture**: Dry board khác wet board hoàn toàn  
3. **SPR awareness**: Stack depth ảnh hưởng đến strategy
4. **Balanced approach**: Cân bằng value bet và bluff

## 🔧 Development

### Project Structure
```
poker_calculation/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                # Utility functions & algorithms
│   ├── store/              # State management
│   └── types/              # TypeScript definitions
├── backend/                # Express API server
├── public/                 # Static assets
└── docs/                  # Documentation
```

### Scripts
```bash
npm run dev          # Start frontend (port 3000)
npm run backend      # Start backend (port 3001)  
npm run dev:full     # Start both frontend & backend
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests (to be implemented)
```

### Testing (Sẽ được bổ sung)
```bash
# Unit tests
npm run test:unit

# Integration tests  
npm run test:integration

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```bash
# Build image
docker build -t poker-analysis .

# Run container
docker run -p 3000:3000 poker-analysis
```

### Manual Deployment
```bash
# Build production
npm run build

# Start production server
npm start
```

## 📝 Roadmap

### Phase 1: ✅ Core Features
- [x] Basic hand analysis
- [x] Monte Carlo equity calculation  
- [x] Beginner/Pro modes
- [x] Poker glossary
- [x] Mock API backend

### Phase 2: 🚧 Enhanced Analysis
- [ ] Real GTO solver integration
- [ ] Advanced range analysis
- [ ] Multi-way pot support
- [ ] Tournament scenarios (ICM)

### Phase 3: 🔮 Advanced Features  
- [ ] Hand history import (PokerStars, etc.)
- [ ] Database integration
- [ ] User accounts & saved hands
- [ ] Mobile app (React Native)
- [ ] Multiplayer training mode

## ⚠️ Disclaimer

**Chỉ sử dụng cho mục đích giáo dục và học tập.**

- Công cụ này không bảo đảm thắng bài trong poker thực tế
- Kết quả phân tích chỉ mang tính tham khảo
- Poker có yếu tố may rủi và tâm lý học
- Chỉ chơi với số tiền bạn có thể mất được
- Tuân thủ luật pháp về cờ bạc tại địa phương

## 🤝 Contributing

Đóng góp cho dự án:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phát hành dưới [MIT License](LICENSE).

## 🙏 Credits

- **Monte Carlo Algorithm**: Dựa trên nghiên cứu poker mathematics
- **Hand Evaluation**: Cải tiến từ thuật toán poker hand ranking
- **UI/UX**: Lấy cảm hứng từ các poker tools hiện đại
- **Icons**: Lucide React và Emoji
- **Fonts**: Inter (Google Fonts)

## 📞 Support

Nếu gặp vấn đề hoặc có câu hỏi:

1. Kiểm tra [FAQ](#) (sẽ được bổ sung)
2. Tạo [GitHub Issue](#) 
3. Email: support@poker-analysis-pro.com (demo)

---

**Happy analyzing! 🎯🃏**

Built with ❤️ using Next.js, TypeScript & Monte Carlo simulation
