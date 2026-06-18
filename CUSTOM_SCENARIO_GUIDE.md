# Hướng dẫn: User tự tạo kịch bản mới qua AI

## Tổng quan

Hệ thống hiện tại có sẵn 6 kịch bản mẫu được phân vào 3 domain:
- **Professional** (0): Email khiếu nại, Phỏng vấn xin việc, Thuyết phục team
- **Academic** (1): Biện luận & Đàm phán
- **Social** (2): Gọi món Cà phê, Làm theo Chỉ dẫn, Điều tra Hiện trường

User có thể yêu cầu AI tạo kịch bản mới tùy chỉnh dựa trên nhu cầu học tập cụ thể.

## Cách thức hoạt động

### Option 1: Sử dụng endpoint API có sẵn (Khuyến nghị)

Backend đã có đầy đủ infrastructure để lưu custom scenarios qua hệ thống **Moderator NPCs Management** và **Admin Shop Items CRUD**.

**API Endpoints hiện có:**

1. **Moderator NPCs** (`/Moderator/npcs`):
   - `GET /Moderator/npcs` - Lấy danh sách NPC
   - `POST /Moderator/npcs` - Tạo NPC mới
   - `PUT /Moderator/npcs/:id` - Cập nhật NPC

2. **Admin Missions** (cần thêm endpoint cho custom missions):
   - Hiện tại chưa có, cần phát triển thêm

### Option 2: Phát triển tính năng "Custom Scenario Builder"

#### Frontend - UI Components

**1. CustomScenarioBuilder.tsx** (component mới)

```tsx
interface ScenarioRequest {
  domain: number; // 0=Professional, 1=Academic, 2=Social
  situation: string; // "Tôi cần viết email từ chối offer"
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  grammarTarget?: string; // "Conditional sentences", "Present Perfect"
}

interface GeneratedScenario {
  title: string;
  description: string;
  goal: string;
  npcName: string;
  npcEmoji: string;
  npcPersonality: string;
  startSuspicion: number;
  xpReward: number;
  minTurnsToComplete: number;
  minAverageScore: number;
}
```

**2. Form layout:**
```
┌─────────────────────────────────────────┐
│  Tạo Kịch Bản Cá Nhân                    │
├─────────────────────────────────────────┤
│ Domain: [Dropdown: Professional/Academic/Social] │
│ Tình huống: [Textarea - mô tả nhu cầu]          │
│ Độ khó: [Radio: Beginner/Intermediate/Advanced] │
│ Mục tiêu ngữ pháp: [Text - optional]           │
│                                          │
│ [🧠 Tạo với AI] [💾 Lưu Draft]           │
└─────────────────────────────────────────┘
```

#### Backend - API Endpoint cần thêm

**POST `/Mission/generate-custom`**

Request:
```json
{
  "domain": 0,
  "userDescription": "Tôi cần viết email từ chối offer công việc một cách lịch sự",
  "difficulty": "Intermediate",
  "grammarTarget": "Polite requests, Conditional sentences"
}
```

Response:
```json
{
  "success": true,
  "scenario": {
    "title": "Email Từ Chối Offer Công Việc",
    "description": "Bạn đang nhận được offer từ công ty A nhưng muốn từ chối để chọn công ty B. Hãy viết email từ chối một cách chuyên nghiệp, giữ good relationship.",
    "goal": "Viết email từ chối offer một cách lịch sự và chuyên nghiệp",
    "npcName": "Mr. Harrison",
    "npcEmoji": "👔",
    "npcPersonality": "Professional, understanding, slightly disappointed",
    "startSuspicion": 10,
    "xpReward": 350,
    "minTurnsToComplete": 5,
    "minAverageScore": 60,
    "grammarTarget": "Polite requests, Conditional sentences (I would appreciate..., If I were...)"
  }
}
```

#### Prompt AI mẫu (nếu dùng OpenAI/Claude API)

```python
system_prompt = """
Bạn là một Instructional Designer chuyên tạo kịch bản học tiếng Anh.
Tạo scenario cho app học tiếng Anh qua chat với NPC.
"""

user_prompt = f"""
Tạo một kịch bản học tiếng Anh với các thông tin sau:

Domain: {domain} (0=Professional, 1=Academic, 2=Social)
Tình huống người dùng mô tả: {userDescription}
Độ khó: {difficulty}
Mục tiêu ngữ pháp: {grammarTarget or 'tự do'}

Hãy trả về JSON với các fields:
- title: ngắn gọn, hấp dẫn
- description: mô tả chi tiết background (2-3 câu)
- goal: nhiệm vụ cụ thể user cần hoàn thành (1 câu)
- npcName: tên NPC (phù hợp với tình huống)
- npcEmoji: emoji đại diện (chọn 1 từ list: 👔📚☕👨‍💼👩‍💼👨‍🎓👩‍🎓🧑‍🎓)
- npcPersonality: tính cách NPC (3-5 từ)
- startSuspicion: 10-20 (beginner), 15-25 (intermediate), 20-30 (advanced)
- xpReward: 150-250 (beginner), 250-400 (intermediate), 400-600 (advanced)
- minTurnsToComplete: 5-8
- minAverageScore: 50 (beginner), 65 (intermediate), 75 (advanced)
- grammarTarget: gợi ý ngữ pháp cụ thể

QUAN TRỌNG: Trả về CHỈ JSON, không có markdown, không có text khác.
"""
```

### Option 3: Quick & Dirty - Hướng dẫn user tự tạo prompt

Nếu chưa có infrastructure AI, có thể hướng dẫn user tự viết prompt và gửi cho admin/moderator:

**Template user gửi cho support:**

```
Domain: [Professional/Academic/Social]
Tình huống mong muốn:
[Ví dụ: Tôi cần luyện viết email xin nghỉ phép]

Độ khó: [Beginner/Intermediate/Advanced]
Mục tiêu ngữ pháp (nếu có):
[Ví dụ: Formal email structure, Polite requests]
```

**Workflow thủ công:**
1. User điền form trên website (có thể dùng Google Form)
2. Admin nhận notification
3. Admin dùng ChatGPT/Claude để generate scenario theo prompt template
4. Admin tạo mission mới trong database qua:
   - API `POST /Moderator/npcs` (tạo NPC)
   - Database trực tiếp (tạo Mission record) hoặc admin panel
5. User nhận email thông báo scenario đã sẵn sàng

## Triển khai từng bước (Implementation Plan)

### Phase 1: Frontend UI (1-2 days)
- Tạo `CustomScenarioBuilder.tsx` component
- Add route `/custom-scenario` trong `App.tsx`
- Tạo form với các input như mô tả ở trên
- Validate form và hiển thị loading state

### Phase 2: Backend AI Service (2-3 days)
- Tạo `CustomScenarioService.cs` trong backend
- Integrate với OpenAI API hoặc Claude API
- Implement prompt engineering như mẫu trên
- Validate response và handle errors

### Phase 3: API Endpoint (1 day)
- Tạo `POST /Mission/generate-custom` controller
- Save generated scenario vào database (Mission table)
- Return generated scenario to frontend
- Add approval workflow (optional) - admin must approve before publish

### Phase 4: Preview & Edit (1-2 days)
- Trước khi lưu, user xem preview scenario
- User có thể chỉnh sửa các fields (title, description, goal)
- User save → tạo mission mới với `createdByUserId`
- Status = "Pending" (chờ admin duyệt) hoặc auto-approve

### Phase 5: Integration với Mission List (0.5 day)
- Custom missions xuất hiện trong `/courses` page
- Đánh dấu "Custom" badge trên card
- Có thể lọc/filter theo "Custom" vs "Official"

## Technical Notes

### Domain Mapping

MissionDto.domain values:
- `0` = Professional (Kỹ năng Công việc)
- `1` = Academic (Học thuật)  
- `2` = Social (Giao tiếp Xã hội)

### MissionDto fields cần điền khi tạo mới

```csharp
public class MissionCreateDto
{
    public string Title { get; set; }
    public string Goal { get; set; }
    public string Description { get; set; }
    public int StartSuspicion { get; set; } = 10;
    public string Stage { get; set; } // e.g., "CUSTOM_001"
    public string Difficulty { get; set; } // "Beginner", "Intermediate", "Advanced"
    public int XpReward { get; set; }
    public string ImageUrl { get; set; } // default image hoặc user upload
    public int NpcId { get; set; } // link to ModeratorNpc
    public int Domain { get; set; } // 0,1,2
    public string GrammarTarget { get; set; }
    public string WritingObjective { get; set; }
    public int MinTurnsToComplete { get; set; } = 5;
    public int MinAverageScore { get; set; } = 60;
    public int ApprovalStatus { get; set; } = 0; // 0=Pending, 1=Approved, 2=Rejected
}
```

### Database considerations

- Missions table đã có `CreatedByUserId` và `ApprovalStatus`
- Có thể dùng luôn `ModeratorNpcs` table cho NPC custom
- Cần thêm `IsCustom` flag nếu muốn phân biệt rõ ràng

## Testing Checklist

- [ ] Frontend form validate đầy đủ
- [ ] AI generation trả về JSON hợp lệ
- [ ] Scenario được save vào database đúng
- [ ] Mission xuất hiện trong list (với filter domain)
- [ ] Lock logic vẫn hoạt động với custom missions
- [ ] Premium lock áp dụng cho custom missions (optional)

## Security & Moderation

- Custom scenarios phải qua approval trước khi public
- Rate limiting: max 3 generation/ngày cho non-premium
- Content moderation: check AI output có offensive content không
- User reporting system nếu custom scenario có vấn đề

## Future Enhancements

1. **Template Library**: User chọn từ template có sẵn thay vì viết từ scratch
2. **Community Shared**: User publish custom scenario, người khác có thể dùng
3. **AI Tutoring**: AI đóng vai coach gợi ý improvement cho user's own writing
4. **Scenario Rating**: Rating system cho custom scenarios
5. **Bulk Generation**: Generate 3 variations cùng lúc để user chọn

---

## Quick Start cho Developer

1. Clone repo và npm install
2. Tạo file `.env` với `VITE_API_URL` nếu cần
3. Chạy backend: `dotnet run` (port 5251)
4. Chạy frontend: `npm run dev` (port 5173)
5. Test với user đã login → /courses → xem domain categorization
6. Test lock/unlock logic với các user khác nhau (premium vs non-premium)

---

**Liên hệ:** Nếu cần hỗ trợ thêm, xem file `CLAUDE.md` để hiểu architecture tổng thể.