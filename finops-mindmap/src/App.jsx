import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Network, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Users, 
  HelpCircle, 
  Compass, 
  CheckCircle, 
  ExternalLink,
  BookOpen,
  Sliders,
  TrendingUp,
  Cpu,
  Info,
  Layers2,
  Minimize2,
  FolderTree,
  ListFilter
} from 'lucide-react';

// Dữ liệu cấu trúc chi tiết của FinOps Framework (Cập nhật mới nhất)
const finopsData = {
  id: "root",
  name: "FinOps Framework",
  nameVi: "Khung Quản trị Tài chính Đám mây (FinOps)",
  type: "root",
  description: "Mô hình vận hành và thực hành văn hóa giúp tối đa hóa giá trị kinh doanh của công nghệ, thúc đẩy quyết định dựa trên dữ liệu kịp thời và tạo trách nhiệm tài chính thông qua sự hợp tác giữa các nhóm kỹ thuật, tài chính và kinh doanh.",
  children: [
    {
      id: "principles",
      name: "Principles",
      nameVi: "6 Nguyên tắc Cốt lõi",
      type: "category",
      color: "from-blue-500 to-indigo-600",
      icon: "Compass",
      description: "Các nguyên tắc định hướng hành vi của tổ chức để thúc đẩy văn hóa FinOps lành mạnh và hiệu quả.",
      children: [
        {
          id: "p1",
          name: "Teams need to collaborate",
          nameVi: "Các bộ phận cần hợp tác",
          type: "principle",
          description: "Chi phí cloud không còn là việc riêng của một đội ngũ. Bộ phận Kỹ thuật kiểm soát tài nguyên, Tài chính làm chủ ngân sách và Sản phẩm quyết định tính năng. FinOps chỉ vận hành tốt khi các nhóm có chung một góc nhìn và tiếng nói chung về chi phí.",
          details: "Ví dụ: Khi kỹ thuật nâng cấp database khiến chi phí tăng 30% qua đêm, Kỹ thuật - Tài chính - Sản phẩm cần cùng nhìn thấy và đánh giá xem tính năng đó có tạo ra doanh thu tương xứng hay không thay vì đổ lỗi cho nhau sau 1 tháng."
        },
        {
          id: "p2",
          name: "Decisions are driven by business value",
          nameVi: "Quyết định dựa trên giá trị kinh doanh",
          type: "principle",
          description: "Chi tiêu nhiều hơn có thể là quyết định đúng nếu nó đem lại doanh thu vượt trội. Nguyên tắc này dịch chuyển tư duy từ 'cắt giảm chi phí thô' sang 'tối ưu hóa hiệu suất chi tiêu' (Unit Economics - Đơn vị kinh tế).",
          details: "Tập trung vào hiệu năng chi tiêu (ví dụ: chi phí xử lý trên mỗi giao dịch khách hàng) thay vì chỉ nhìn vào hóa đơn tổng thể."
        },
        {
          id: "p3",
          name: "Everyone takes ownership of cloud usage",
          nameVi: "Mọi người tự chịu trách nhiệm về sử dụng Cloud",
          type: "principle",
          description: "Các nhóm kỹ thuật và phát triển sản phẩm cần tự quản lý và chịu trách nhiệm về chi phí đối với tài nguyên họ tự tay khởi tạo ngay từ khâu thiết kế kiến trúc.",
          details: "Đặt mục tiêu chi phí trực tiếp cho các Product Team để họ coi chi phí là một metric kỹ thuật (tương tự như hiệu năng, độ trễ, bảo mật)."
        },
        {
          id: "p4",
          name: "FinOps reports should be accessible and timely",
          nameVi: "Báo cáo FinOps cần nhanh chóng, dễ tiếp cận",
          type: "principle",
          description: "Dữ liệu chi phí cần được cập nhật theo thời gian thực (real-time hoặc near real-time) để các đội ngũ có thể điều chỉnh ngay lập tức, tránh 'bất ngờ' cuối tháng.",
          details: "Tạo các bảng điều khiển (Dashboards) trực quan và hệ thống cảnh báo bất thường tự động gửi về các kênh chat của kỹ sư."
        },
        {
          id: "p5",
          name: "A centralized team drives FinOps",
          nameVi: "Nhóm FinOps tập trung thúc đẩy thực thi",
          type: "principle",
          description: "Một nhóm FinOps trung tâm (thường là Cloud Center of Excellence - CCoE) sẽ chuẩn hóa quy trình, đào tạo, đàm phán giá cả (Rate optimization) và điều phối chung.",
          details: "Nhóm tập trung không trực tiếp tối ưu hóa thay cho các đội ngũ mà đóng vai trò là bên hỗ trợ, đào tạo, quản lý mua trước gói giảm giá số lượng lớn (RIs, Savings Plans)."
        },
        {
          id: "p6",
          name: "Take advantage of variable cost model",
          nameVi: "Tận dụng mô hình chi phí biến đổi của Cloud",
          type: "principle",
          description: "Tận dụng đặc tính linh hoạt của cloud bằng cách điều chỉnh liên tục quy mô tài nguyên (Auto-scaling, tắt tài nguyên không dùng) thay vì mua sắm hạ tầng cố định.",
          details: "Coi chi phí biến đổi là một cơ hội kinh doanh để thử nghiệm nhanh và tối ưu liên tục theo thời gian thực."
        }
      ]
    },
    {
      id: "personas",
      name: "Personas",
      nameVi: "Vai trò Tham gia (Personas)",
      type: "category",
      color: "from-purple-500 to-pink-600",
      icon: "Users",
      description: "Các đối tượng/vai trò trong tổ chức cần tham gia và tương tác chặt chẽ với quy trình FinOps.",
      children: [
        {
          id: "pe1",
          name: "FinOps Practitioner",
          nameVi: "Người thực hành FinOps chuyên trách",
          type: "persona",
          description: "Trọng tâm của thực hành FinOps. Đóng vai trò là cầu nối kết nối giữa Kỹ thuật, Tài chính và Kinh doanh để hướng dẫn và chuẩn hóa cách thức tối ưu hóa.",
          details: "Nhiệm vụ chính: Thiết lập KPI, quản lý dữ liệu chi phí, tối ưu hóa mức giá (commitments), thúc đẩy thay đổi văn hóa doanh nghiệp."
        },
        {
          id: "pe2",
          name: "Engineering & Operations",
          nameVi: "Đội ngũ Kỹ thuật & Vận hành",
          type: "persona",
          description: "Những người trực tiếp thiết kế, xây dựng và vận hành hạ tầng trên cloud (DevOps, SRE, Cloud Architects).",
          details: "Nhiệm vụ chính: Thiết kế ứng dụng hiệu quả về chi phí, tối ưu hóa việc sử dụng (sizing, tắt bật hạ tầng), giám sát tải công việc."
        },
        {
          id: "pe3",
          name: "Finance / Procurement",
          nameVi: "Tài chính & Mua sắm",
          type: "persona",
          description: "Phụ trách quản lý ngân sách chung, dự báo tài chính, đối soát hóa đơn và đàm phán hợp đồng với nhà cung cấp.",
          details: "Nhiệm vụ chính: Lập ngân sách (Budgeting), Dự báo (Forecasting), đối chiếu hóa đơn và hỗ trợ tối ưu hóa gói cam kết dài hạn."
        },
        {
          id: "pe4",
          name: "Business / Product Owner",
          nameVi: "Chủ sản phẩm & Doanh nghiệp",
          type: "persona",
          description: "Những người quyết định việc đầu tư phát triển sản phẩm nào và chịu trách nhiệm về mặt doanh thu/giá trị kinh doanh của sản phẩm đó.",
          details: "Nhiệm vụ chính: Hiểu mối liên hệ giữa chi phí cloud và sự phát triển của sản phẩm, quyết định mức độ đầu tư dựa trên ROI."
        },
        {
          id: "pe5",
          name: "Executive",
          nameVi: "Ban lãnh đạo (Executives)",
          type: "persona",
          description: "Các lãnh đạo cấp cao (CIO, CTO, CFO) định hình định hướng chiến lược công nghệ và tài chính của toàn bộ doanh nghiệp.",
          details: "Nhiệm vụ chính: Đảm bảo văn hóa cộng tác trong công ty, căn chỉnh ngân sách đám mây phù hợp với mục tiêu tăng trưởng dài hạn."
        },
        {
          id: "pe6",
          name: "Allied / Intersecting Disciplines",
          nameVi: "Các bộ phận liên đới",
          type: "persona",
          description: "Các nhóm như ITAM (Quản lý tài sản CNTT), Security (Bảo mật), Procurement (Mua sắm) giao thoa với FinOps để đồng bộ quy trình quản trị doanh nghiệp.",
          details: "Đồng bộ hóa quản trị rủi ro, chính sách tuân thủ quy định và bảo mật đám mây với thực tiễn tài chính đám mây."
        }
      ]
    },
    {
      id: "phases",
      name: "Phases (Lifecycle)",
      nameVi: "3 Giai đoạn Vòng đời",
      type: "category",
      color: "from-teal-500 to-emerald-600",
      icon: "Layers",
      description: "Quy trình lặp đi lặp lại không ngừng giúp tổ chức cải thiện dần khả năng quản lý tài chính đám mây của mình.",
      children: [
        {
          id: "ph1",
          name: "Inform (Cung cấp thông tin)",
          nameVi: "Giai đoạn Inform (Thông tin)",
          type: "phase",
          description: "Tạo sự minh bạch hoàn toàn về chi phí đám mây thông qua việc phân bổ chính xác (Allocation), đo lường hiệu quả và xuất báo cáo trực quan cho các bên.",
          details: "Trọng tâm: Phân bổ thẻ tag/nhãn, cấu trúc tài khoản, phát hiện bất thường ngay lập tức, xây dựng các báo cáo phân tích ban đầu."
        },
        {
          id: "ph2",
          name: "Optimize (Tối ưu hóa)",
          nameVi: "Giai đoạn Optimize (Tối ưu hóa)",
          type: "phase",
          description: "Tìm kiếm các cơ hội tối ưu hóa chi tiêu bao gồm: giảm thiểu lãng phí tài nguyên (Usage Optimization) và cải thiện đơn giá mua sắm thông qua cam kết sử dụng (Rate Optimization).",
          details: "Trọng tâm: Right-sizing (thu gọn kích thước), tắt tài nguyên nhàn rỗi, cấu hình auto-scaling, mua RIs/Savings Plans."
        },
        {
          id: "ph3",
          name: "Operate (Vận hành & Duy trì)",
          nameVi: "Giai đoạn Operate (Vận hành)",
          type: "phase",
          description: "Tích hợp các hoạt động FinOps vào hoạt động kinh doanh hàng ngày của tổ chức, tự động hóa quy trình quản trị, thúc đẩy cải tiến liên tục.",
          details: "Trọng tâm: Thiết lập các quy trình tự động hóa kiểm soát, đào tạo văn hóa FinOps liên tục cho kỹ sư, đưa các KPI FinOps vào mục tiêu đánh giá định kỳ."
        }
      ]
    },
    {
      id: "domains",
      name: "Domains & Capabilities",
      nameVi: "Miền Kiến thức & Năng lực (2026)",
      type: "category",
      color: "from-amber-500 to-orange-600",
      icon: "BookOpen",
      description: "Hệ thống các miền chuyên môn chính và các Năng lực (Capabilities) cấu thành nên một phòng ban FinOps toàn diện.",
      children: [
        {
          id: "d1",
          name: "Understand Usage & Cost",
          nameVi: "Miền: Hiểu rõ Sử dụng & Chi phí",
          type: "domain",
          description: "Tập trung vào việc thu thập, xử lý và trực quan hóa dữ liệu chi tiết về chi phí và tài nguyên sử dụng.",
          children: [
            {
              id: "cap1",
              name: "Allocation",
              nameVi: "Phân bổ chi phí (Allocation)",
              type: "capability",
              description: "Phương pháp gắn nhãn (tagging), đặt tên tài nguyên và phân chia chi phí chính xác đến từng dự án, sản phẩm, hoặc phòng ban."
            },
            {
              id: "cap2",
              name: "Anomaly Management",
              nameVi: "Quản lý bất thường (Anomaly)",
              type: "capability",
              description: "Hệ thống phát hiện sớm các đột biến chi phí ngoài mong muốn để xử lý trước khi chúng gây thiệt hại lớn cho tài chính."
            },
            {
              id: "cap3",
              name: "Data Ingestion",
              nameVi: "Nhập dữ liệu chi phí (Data Ingestion)",
              type: "capability",
              description: "Thu thập và chuẩn hóa dữ liệu từ nhiều nhà cung cấp đám mây khác nhau (AWS, Azure, GCP, SaaS) về một hệ quản trị duy nhất (thường sử dụng chuẩn FOCUS)."
            },
            {
              id: "cap4",
              name: "Reporting & Analytics",
              nameVi: "Báo cáo & Phân tích",
              type: "capability",
              description: "Thiết lập hệ thống bảng điều khiển trực quan hóa chi tiêu theo cấu trúc phân cấp doanh nghiệp dễ hiểu."
            }
          ]
        },
        {
          id: "d2",
          name: "Quantify Business Value",
          nameVi: "Miền: Định lượng Giá trị Kinh doanh",
          type: "domain",
          description: "Kết nối dữ liệu đám mây với mục tiêu kinh doanh thực tế để đo lường ROI và định giá trị sản phẩm chính xác.",
          children: [
            {
              id: "cap5",
              name: "Planning & Estimating",
              nameVi: "Lập kế hoạch & Ước tính",
              type: "capability",
              description: "Ước tính chi phí của một dự án hạ tầng đám mây mới trước khi bắt tay vào triển khai thực tế."
            },
            {
              id: "cap6",
              name: "Forecasting",
              nameVi: "Dự báo chi tiêu (Forecasting)",
              type: "capability",
              description: "Sử dụng dữ liệu lịch sử và kế hoạch kinh doanh để dự báo chi tiêu cloud trong tương lai (tháng/quý/năm)."
            },
            {
              id: "cap7",
              name: "Budgeting",
              nameVi: "Lập ngân sách (Budgeting)",
              type: "capability",
              description: "Xây dựng các hạn mức ngân sách và kiểm soát việc chi tiêu theo kế hoạch đã cam kết."
            },
            {
              id: "cap8",
              name: "KPI & Benchmarking",
              nameVi: "Chỉ số KPI & Đối chuẩn (Mới 2026)",
              type: "capability",
              description: "Đánh giá hiệu suất sử dụng cloud bằng cách so sánh hiệu quả giữa các team nội bộ hoặc với các tiêu chuẩn ngành."
            },
            {
              id: "cap9",
              name: "Unit Economics",
              nameVi: "Kinh tế học đơn vị (Unit Economics)",
              type: "capability",
              description: "Liên kết chi phí đám mây với đơn vị đo lường kinh doanh như: chi phí trên 1 người dùng hoạt động, chi phí trên 1 đơn hàng."
            }
          ]
        },
        {
          id: "d3",
          name: "Optimize Usage & Cost",
          nameVi: "Miền: Tối ưu hóa Sử dụng & Chi phí",
          type: "domain",
          description: "Các hoạt động trực tiếp hành động nhằm tối ưu hạ tầng đám mây để đạt hiệu suất chi tiêu tốt nhất.",
          children: [
            {
              id: "cap10",
              name: "Rate Optimization",
              nameVi: "Tối ưu hóa đơn giá (Rate)",
              type: "capability",
              description: "Đàm phán chiết khấu, mua trước các gói cam kết sử dụng dài hạn như Reserved Instances (RIs) hoặc Savings Plans."
            },
            {
              id: "cap11",
              name: "Usage Optimization",
              nameVi: "Tối ưu hóa sử dụng (Usage - Cập nhật 2026)",
              type: "capability",
              description: "Thu gọn tài nguyên thừa (Right-sizing), thiết lập cơ chế tự động co giãn tải, giải phóng tài nguyên không dùng đến."
            },
            {
              id: "cap12",
              name: "Architecting & Workload Placement",
              nameVi: "Kiến trúc & Bố trí tải công việc",
              type: "capability",
              description: "Thiết kế hệ thống ứng dụng tối ưu chi phí ngay từ ban đầu (Serverless, Containerization, Spot Instances)."
            },
            {
              id: "cap13",
              name: "License Management",
              nameVi: "Quản lý bản quyền (License)",
              type: "capability",
              description: "Đồng bộ chi phí mua bản quyền phần mềm (OS, SQL Server, SaaS) chạy trên nền tảng cloud (BYOL)."
            }
          ]
        },
        {
          id: "d4",
          name: "Manage the FinOps Practice",
          nameVi: "Miền: Quản lý Thực hành FinOps",
          type: "domain",
          description: "Xây dựng văn hóa thực hành, quy trình tự động hóa và nâng cao năng lực cho toàn thể tổ chức.",
          children: [
            {
              id: "cap14",
              name: "FinOps Practice Operations",
              nameVi: "Vận hành Thực hành FinOps",
              type: "capability",
              description: "Thiết lập đội ngũ, điều phối các phiên làm việc định kỳ và quản lý các công việc hàng ngày của ban FinOps."
            },
            {
              id: "cap15",
              name: "FinOps Education & Enablement",
              nameVi: "Đào tạo & Khai phá năng lực",
              type: "capability",
              description: "Xây dựng giáo trình, thúc đẩy các chứng chỉ (Certified Practitioner) và giúp các nhóm tự lực tối ưu hóa."
            },
            {
              id: "cap16",
              name: "Governance, Policy & Risk",
              nameVi: "Quản trị, Chính sách & Rủi ro (Mới 2026)",
              type: "capability",
              description: "Thiết lập các chính sách ràng buộc tự động để hạn chế rủi ro chi tiêu vượt tầm kiểm soát mà không kìm hãm sự sáng tạo."
            },
            {
              id: "cap17",
              name: "Automation, Tools & Services",
              nameVi: "Tự động hóa, Công cụ & Dịch vụ",
              type: "capability",
              description: "Lựa chọn các công cụ chuyên dụng (gốc của Cloud provider hoặc bên thứ 3) và áp dụng script tự động hóa hạ tầng."
            },
            {
              id: "cap18",
              name: "Executive Strategy Alignment",
              nameVi: "Cân chỉnh Chiến lược Ban lãnh đạo (Mới 2026)",
              type: "capability",
              description: "Nối liền tầm nhìn tài chính đám mây với chiến lược phát triển kinh doanh dài hạn của tập đoàn và ban giám đốc."
            },
            {
              id: "cap19",
              name: "Intersecting Disciplines",
              nameVi: "Giao thoa các bộ phận liên đới",
              type: "capability",
              description: "Phối hợp nhịp nhàng các quy trình FinOps với các quy trình ITAM, ITSM, bảo mật (SecOps) và quản trị doanh nghiệp khác."
            }
          ]
        }
      ]
    },
    {
      id: "maturity",
      name: "Maturity Model",
      nameVi: "Mô hình Độ trưởng thành",
      type: "category",
      color: "from-rose-500 to-red-600",
      icon: "TrendingUp",
      description: "Các bước tiến hóa của tổ chức trong hành trình ứng dụng FinOps từ sơ khởi tới tự động hóa thông minh.",
      children: [
        {
          id: "m1",
          name: "Crawl (Bò - Sơ khởi)",
          nameVi: "Crawl (Giai đoạn Bò)",
          type: "maturity_stage",
          description: "Khả năng đo lường và báo cáo rất cơ bản. Chỉ mới phân bổ được một phần nhỏ chi phí thông qua thẻ nhãn cơ bản. Chưa có tự động hóa.",
          details: "Mục tiêu: Đạt được sự minh bạch tối thiểu và phát hiện được các lỗi lãng phí chi phí hiển nhiên nhất."
        },
        {
          id: "m2",
          name: "Walk (Đi - Phát triển)",
          nameVi: "Walk (Giai đoạn Đi)",
          type: "maturity_stage",
          description: "FinOps đã được hiểu và áp dụng rộng rãi khắp tổ chức. Đã xây dựng được các KPI đo lường tầm trung và xử lý được phần lớn các tình huống phức tạp.",
          details: "Mục tiêu: Đưa phân bổ chi phí lên trên 80% độ chính xác, thiết lập dự báo tin cậy và có chính sách tối ưu hóa rõ ràng."
        },
        {
          id: "m3",
          name: "Run (Chạy - Tự động hóa/Tối ưu)",
          nameVi: "Run (Giai đoạn Chạy)",
          type: "maturity_stage",
          description: "Mọi năng lực FinOps hoạt động trơn tru với độ phủ toàn doanh nghiệp. Tự động hóa (Automation) được tích hợp sâu để xử lý tối ưu hóa tự động theo thời gian thực.",
          details: "Mục tiêu: Tận dụng hoàn toàn 'Kinh tế học đơn vị' để dẫn dắt mọi quyết định kinh doanh một cách chủ động."
        }
      ]
    }
  ]
};

export default function App() {
  const [selectedNode, setSelectedNode] = useState(finopsData);
  const [expandedNodes, setExpandedNodes] = useState({
    root: true,
    principles: true,
    personas: false,
    phases: false,
    domains: false,
    maturity: false,
    d1: false,
    d2: false,
    d3: false,
    d4: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('mindmap'); // 'mindmap' | 'list'
  const [scale, setScale] = useState(1);
  const [panning, setPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const mapContainerRef = useRef(null);

  // Toggle thu gọn/mở rộng nút
  const toggleExpand = (id, e) => {
    if (e) e.stopPropagation();
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Reset góc nhìn thu phóng
  const handleResetZoom = () => {
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Thu phóng
  const handleZoom = (factor) => {
    setScale(prev => Math.max(0.5, Math.min(2, prev * factor)));
  };

  // Kéo di chuyển bản đồ (Pan)
  const handleMouseDown = (e) => {
    if (e.target.closest('.interactive-node-btn') || e.target.closest('.action-button')) return;
    setPanning(true);
    panStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e) => {
    if (!panning) return;
    setPanOffset({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y
    });
  };

  const handleMouseUp = () => {
    setPanning(false);
  };

  // Tìm kiếm nút trong dữ liệu
  const flatNodes = useMemo(() => {
    const list = [];
    const traverse = (node, parentName = "") => {
      list.push({ ...node, parentName });
      if (node.children) {
        node.children.forEach(child => traverse(child, node.nameVi || node.name));
      }
    };
    traverse(finopsData);
    return list;
  }, []);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return flatNodes.filter(node => 
      node.name.toLowerCase().includes(term) || 
      node.nameVi.toLowerCase().includes(term) ||
      (node.description && node.description.toLowerCase().includes(term))
    );
  }, [searchTerm, flatNodes]);

  const handleSelectNode = (node) => {
    setSelectedNode(node);
    
    // Nếu chuyển từ tìm kiếm, mở rộng các node cha nếu cần thiết
    if (node.id !== "root") {
      // Tìm đường dẫn từ gốc đến node được chọn để tự động mở rộng
      const expandPath = {};
      const findPath = (curr, targetId, path = []) => {
        if (curr.id === targetId) {
          path.forEach(id => { expandPath[id] = true; });
          return true;
        }
        if (curr.children) {
          for (const child of curr.children) {
            if (findPath(child, targetId, [...path, curr.id])) return true;
          }
        }
        return false;
      };
      findPath(finopsData, node.id);
      setExpandedNodes(prev => ({ ...prev, ...expandPath }));
    }
  };

  // Tự động điều chỉnh trạng thái thu gọn khi tìm kiếm có kết quả để hiển thị đầy đủ
  useEffect(() => {
    if (searchTerm.trim() !== '') {
      const allTrue = {};
      flatNodes.forEach(n => {
        if (n.children) allTrue[n.id] = true;
      });
      setExpandedNodes(prev => ({ ...prev, ...allTrue }));
    }
  }, [searchTerm, flatNodes]);

  const getBadgeColor = (type) => {
    switch (type) {
      case "root": return "bg-slate-700 text-slate-100";
      case "category": return "bg-indigo-100 text-indigo-800";
      case "domain": return "bg-amber-100 text-amber-800";
      case "capability": return "bg-emerald-100 text-emerald-800";
      case "principle": return "bg-blue-100 text-blue-800";
      case "persona": return "bg-purple-100 text-purple-800";
      case "phase": return "bg-teal-100 text-teal-800";
      case "maturity_stage": return "bg-rose-100 text-rose-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "root": return <Network className="w-5 h-5 text-indigo-400" />;
      case "category": return <FolderTree className="w-4 h-4 text-indigo-500" />;
      case "domain": return <BookOpen className="w-4 h-4 text-amber-500" />;
      case "capability": return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case "principle": return <Compass className="w-3.5 h-3.5 text-blue-500" />;
      case "persona": return <Users className="w-3.5 h-3.5 text-purple-500" />;
      case "phase": return <Layers className="w-3.5 h-3.5 text-teal-500" />;
      case "maturity_stage": return <TrendingUp className="w-3.5 h-3.5 text-rose-500" />;
      default: return <HelpCircle className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* HEADER BAR */}
      <header className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              FinOps Framework Interactive Mindmap
            </h1>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span>Bản đồ Tư duy Tương tác theo Chuẩn FinOps Foundation v2026</span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="text-indigo-400 font-semibold">Bản tiếng Việt</span>
            </p>
          </div>
        </div>

        {/* View Controls & Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setViewMode('mindmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'mindmap' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              Mindmap Trực quan
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'list' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Danh sách chi tiết
            </button>
          </div>

          <a 
            href="https://www.finops.org/framework/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
             Tài liệu gốc <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* LEFT COLUMN: CONTROLS & MINDMAP VIEW OR LIST VIEW */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900 border-r border-slate-800/80 overflow-hidden relative">
          
          {/* Search bar inside Workspace */}
          <div className="p-4 bg-slate-950/40 border-b border-slate-800/60 flex flex-col sm:flex-row gap-3 items-center z-10">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm Nguyên tắc, Vai trò, Miền kiến thức, Năng lực..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 hover:bg-slate-850 focus:bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300 font-semibold"
                >
                  Xóa
                </button>
              )}
            </div>

            {/* Hint Message */}
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span>Nhấn vào bất kỳ mục nào để xem giải thích chi tiết ở cột bên phải.</span>
            </div>
          </div>

          {/* Search Results Dropdown Overlay */}
          {searchTerm && searchResults.length > 0 && (
            <div className="absolute top-16 left-4 right-4 max-h-60 overflow-y-auto bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl z-30 p-2 divide-y divide-slate-900">
              <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2">
                Kết quả tìm thấy ({searchResults.length}):
              </div>
              {searchResults.map((node) => (
                <button
                  key={node.id}
                  onClick={() => {
                    handleSelectNode(node);
                    setSearchTerm(''); // clear search after click to view
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-indigo-950/40 hover:text-white rounded-lg transition-all flex items-start justify-between group"
                >
                  <div className="flex gap-2">
                    <span className="mt-0.5">{getIcon(node.type)}</span>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-indigo-300">{node.nameVi}</div>
                      <div className="text-xs text-slate-400">{node.name} • <span className="italic text-slate-500">Thuộc {node.parentName || "Gốc"}</span></div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getBadgeColor(node.type)}`}>
                    {node.type.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          )}

          {searchTerm && searchResults.length === 0 && (
            <div className="absolute top-16 left-4 right-4 bg-slate-950/95 border border-slate-800 rounded-xl p-4 text-center z-30 text-slate-400 text-sm">
              Không tìm thấy kết quả nào phù hợp với "{searchTerm}"
            </div>
          )}

          {/* VIEW: MINDMAP (EXPLORER TREE WITH DYNAMIC PATHS) */}
          {viewMode === 'mindmap' ? (
            <div 
              ref={mapContainerRef}
              className={`flex-1 overflow-hidden relative cursor-grab ${panning ? 'cursor-grabbing' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              
              {/* Floating Map Controls */}
              <div className="absolute bottom-6 right-6 flex items-center gap-2 z-20 bg-slate-950/80 border border-slate-800 rounded-xl p-2 shadow-xl backdrop-blur-md">
                <button 
                  onClick={() => handleZoom(1.15)} 
                  className="action-button p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-all" 
                  title="Phóng to"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleZoom(0.85)} 
                  className="action-button p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-all" 
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleResetZoom} 
                  className="action-button p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-all" 
                  title="Đặt lại chế độ xem"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Mindmap Canvas Wrapper */}
              <div 
                className="absolute inset-0 origin-center transition-transform duration-75 select-none"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
                  transformOrigin: '50% 50%'
                }}
              >
                {/* Visual Grid Lines for aesthetic */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b1a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b1a_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none"></div>

                {/* THE ACTUAL INTERACTIVE TREE STRUCT */}
                <div className="absolute top-1/2 left-10 -translate-y-1/2 flex items-center gap-12 py-10">
                  
                  {/* Root Node */}
                  <div className="flex items-center">
                    <div 
                      onClick={() => handleSelectNode(finopsData)}
                      className={`interactive-node-btn p-5 rounded-2xl border-2 cursor-pointer shadow-2xl transition-all w-72 ${
                        selectedNode.id === finopsData.id 
                          ? 'bg-gradient-to-tr from-indigo-600 to-purple-700 border-indigo-400 scale-105 ring-4 ring-indigo-500/30' 
                          : 'bg-slate-950 border-slate-800 hover:border-indigo-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400">
                          <Network className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">FRAMEWORK</div>
                          <h2 className="text-lg font-black text-white">{finopsData.name}</h2>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                        {finopsData.nameVi}
                      </p>
                    </div>

                    {/* Root Connector */}
                    <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-500 to-slate-700"></div>
                  </div>

                  {/* Level 1 Categories (Principles, Personas, Domains, Phases, Maturity) */}
                  <div className="flex flex-col gap-6 justify-center">
                    {finopsData.children.map((cat) => {
                      const isExpanded = expandedNodes[cat.id];
                      const isSelected = selectedNode.id === cat.id;

                      return (
                        <div key={cat.id} className="flex items-center relative py-1">
                          
                          {/* Anchor connector lines */}
                          <div className="absolute -left-12 top-0 bottom-0 w-12 flex flex-col justify-center pointer-events-none">
                            <div className="w-12 h-0.5 bg-slate-700"></div>
                          </div>

                          {/* Category Node Card */}
                          <div 
                            onClick={() => handleSelectNode(cat)}
                            className={`interactive-node-btn px-4 py-3 rounded-xl border cursor-pointer shadow-lg transition-all w-64 flex flex-col justify-between ${
                              isSelected 
                                ? 'bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/20 text-white font-semibold' 
                                : 'bg-slate-950/90 border-slate-800 hover:border-slate-700 text-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                                  {getIcon(cat.type)}
                                </span>
                                <div>
                                  <h3 className="text-sm font-bold text-white leading-tight">{cat.nameVi}</h3>
                                  <span className="text-[10px] text-slate-500 font-mono tracking-wide">{cat.name}</span>
                                </div>
                              </div>
                              
                              {cat.children && (
                                <button
                                  onClick={(e) => toggleExpand(cat.id, e)}
                                  className="action-button p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all ml-1"
                                >
                                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Category to Children Connector */}
                          {isExpanded && cat.children && (
                            <div className="w-12 h-0.5 bg-slate-700"></div>
                          )}

                          {/* Level 2 Sub-children (Child items of Category, e.g., actual principles, domains) */}
                          {isExpanded && cat.children && (
                            <div className="flex flex-col gap-3 ml-0 border-l border-slate-800 pl-4 py-2">
                              {cat.children.map((item) => {
                                const hasChildren = !!item.children;
                                const isSubExpanded = expandedNodes[item.id];
                                const isItemSelected = selectedNode.id === item.id;

                                return (
                                  <div key={item.id} className="flex items-center py-0.5 relative group">
                                    
                                    {/* Link line to parent */}
                                    <div className="absolute -left-4 w-4 h-0.5 bg-slate-800 pointer-events-none"></div>

                                    {/* Item Node */}
                                    <div 
                                      onClick={() => handleSelectNode(item)}
                                      className={`interactive-node-btn px-3 py-2 rounded-lg border text-left transition-all cursor-pointer text-xs ${
                                        hasChildren ? 'w-60' : 'w-64'
                                      } ${
                                        isItemSelected 
                                          ? 'bg-slate-800 border-indigo-500 text-white font-bold ring-1 ring-indigo-500/20' 
                                          : 'bg-slate-900 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 truncate">
                                          <span>{getIcon(item.type)}</span>
                                          <div className="truncate">
                                            <div className="font-semibold text-slate-200 truncate">{item.nameVi}</div>
                                            <div className="text-[9px] text-slate-500 truncate">{item.name}</div>
                                          </div>
                                        </div>

                                        {hasChildren && (
                                          <button
                                            onClick={(e) => toggleExpand(item.id, e)}
                                            className="action-button p-0.5 hover:bg-slate-700 rounded text-slate-400 transition-all ml-1"
                                          >
                                            {isSubExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Sub-sub children (e.g., Capabilities within Domains) */}
                                    {isSubExpanded && item.children && (
                                      <>
                                        <div className="w-6 h-0.5 bg-slate-800"></div>
                                        <div className="flex flex-col gap-2 border-l border-slate-800/80 pl-3 py-1">
                                          {item.children.map((subItem) => {
                                            const isSubItemSelected = selectedNode.id === subItem.id;
                                            return (
                                              <div key={subItem.id} className="flex items-center py-0.5 relative">
                                                <div className="absolute -left-3 w-3 h-0.5 bg-slate-800"></div>
                                                <div 
                                                  onClick={() => handleSelectNode(subItem)}
                                                  className={`interactive-node-btn px-3 py-1.5 rounded-md border text-left transition-all cursor-pointer text-xs w-56 truncate ${
                                                    isSubItemSelected 
                                                      ? 'bg-slate-800 border-indigo-500 text-white font-bold' 
                                                      : 'bg-slate-950 border-slate-800/60 hover:bg-slate-850 text-slate-300'
                                                  }`}
                                                >
                                                  <div className="flex items-center gap-1.5">
                                                    <span>{getIcon(subItem.type)}</span>
                                                    <span className="truncate" title={subItem.nameVi}>{subItem.nameVi}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </>
                                    )}

                                  </div>
                                );
                              })}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>
            </div>
          ) : (
            
            // VIEW: LIST / HIERARCHICAL SYSTEM (EASY SCROLLING LIST)
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Introduction Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex gap-3">
                <Layers2 className="w-10 h-10 text-indigo-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white">Chế độ xem Hệ thống danh sách FinOps</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Dưới đây là sơ đồ cây phân cấp có cấu trúc từ gốc tới các năng lực nhánh nhỏ. Bạn có thể nhấn vào bất kỳ thành phần nào để hiển thị bảng nghiên cứu chi tiết ở cột bên phải.
                  </p>
                </div>
              </div>

              {/* Recursive List Element */}
              <div className="space-y-4">
                {finopsData.children.map((cat) => (
                  <div key={cat.id} className="border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden">
                    
                    {/* Category Header (Fixed validateDOMNesting warning by replacing button with div) */}
                    <div
                      onClick={() => handleSelectNode(cat)}
                      className={`w-full text-left p-4 flex items-center justify-between hover:bg-slate-900 transition-all cursor-pointer ${
                        selectedNode.id === cat.id ? 'bg-indigo-950/20 border-l-4 border-indigo-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          {getIcon(cat.type)}
                        </span>
                        <div>
                          <h3 className="font-bold text-white text-sm sm:text-base">{cat.nameVi}</h3>
                          <p className="text-xs text-slate-500">{cat.name}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => toggleExpand(cat.id, e)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-all"
                      >
                        {expandedNodes[cat.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Category Children */}
                    {expandedNodes[cat.id] && cat.children && (
                      <div className="bg-slate-900/30 border-t border-slate-900 p-3 pl-8 space-y-2">
                        {cat.children.map((item) => (
                          <div key={item.id} className="border border-slate-800/60 rounded-lg bg-slate-950/30 overflow-hidden">
                            
                            {/* Sub-item Header (Fixed validateDOMNesting warning by replacing button with div) */}
                            <div
                              onClick={() => handleSelectNode(item)}
                              className={`w-full text-left p-3 flex items-center justify-between hover:bg-slate-900 transition-all cursor-pointer ${
                                selectedNode.id === item.id ? 'bg-indigo-950/20 border-l-2 border-indigo-500' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {getIcon(item.type)}
                                <div>
                                  <div className="text-xs sm:text-sm font-semibold text-slate-200">{item.nameVi}</div>
                                  <div className="text-[10px] text-slate-500">{item.name}</div>
                                </div>
                              </div>

                              {item.children && (
                                <button 
                                  onClick={(e) => toggleExpand(item.id, e)}
                                  className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-all"
                                >
                                  {expandedNodes[item.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>

                            {/* Inner Children (capabilities) */}
                            {expandedNodes[item.id] && item.children && (
                              <div className="bg-slate-900/60 p-2 border-t border-slate-900 pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {item.children.map((subItem) => (
                                  <button
                                    key={subItem.id}
                                    onClick={() => handleSelectNode(subItem)}
                                    className={`text-left p-2.5 rounded-md border transition-all text-xs flex items-center gap-2 ${
                                      selectedNode.id === subItem.id 
                                        ? 'bg-slate-800 border-indigo-500 text-white font-semibold' 
                                        : 'bg-slate-950 border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                                    }`}
                                  >
                                    {getIcon(subItem.type)}
                                    <div className="truncate">
                                      <div className="truncate text-slate-200 font-medium">{subItem.nameVi}</div>
                                      <div className="text-[9px] text-slate-500 truncate">{subItem.name}</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}

                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: INFORMATION SIDE PANEL (DETAIL INSPECTOR) */}
        <div className="w-full md:w-96 shrink-0 bg-slate-950 border-t md:border-t-0 border-slate-800 flex flex-col overflow-hidden max-h-[50vh] md:max-h-none">
          
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 backdrop-blur-md z-10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Chi tiết Yếu tố Chọn
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getBadgeColor(selectedNode.type)}`}>
              {selectedNode.type}
            </span>
          </div>

          {/* Panel Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Title Block */}
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white leading-tight">
                {selectedNode.nameVi}
              </h2>
              <div className="text-xs text-indigo-400 font-mono font-medium">
                {selectedNode.name}
              </div>
            </div>

            {/* Description Block */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2 leading-relaxed">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400" /> Mô tả khái niệm
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedNode.description || "Đang cập nhật nội dung chi tiết cho đề mục này."}
              </p>
            </div>

            {/* Specific details / Examples for Principles & Personas */}
            {selectedNode.details && (
              <div className="p-4 bg-indigo-950/20 rounded-xl border border-indigo-900/30 space-y-2 leading-relaxed">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  💡 Thực tế ứng dụng & Ví dụ
                </h4>
                <p className="text-sm text-indigo-200">
                  {selectedNode.details}
                </p>
              </div>
            )}

            {/* If it has children inside */}
            {selectedNode.children && selectedNode.children.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Các mục trực thuộc ({selectedNode.children.length}):
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedNode.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => handleSelectNode(child)}
                      className="w-full text-left p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800/80 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-2 justify-between"
                    >
                      <span className="truncate flex items-center gap-2">
                        {getIcon(child.type)}
                        <span className="truncate font-semibold">{child.nameVi}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic framework hints based on selected node */}
            {selectedNode.type === 'capability' && (
              <div className="bg-emerald-950/10 border border-emerald-900/20 p-4 rounded-xl space-y-2 text-xs text-emerald-300">
                <div className="font-bold flex items-center gap-1 text-emerald-400">
                  ⚡ Mẹo nâng cao năng lực (Capability Tip)
                </div>
                <p className="leading-relaxed">
                  Để phát triển năng lực này, tổ chức nên ứng dụng tuần tự theo mô hình độ trưởng thành <span className="underline font-bold">Crawl - Walk - Run</span>. Hãy bắt đầu bằng việc đo lường thủ công, sau đó chuẩn hóa quy trình rồi mới thực hiện tự động hóa bằng công cụ chuyên trách.
                </p>
              </div>
            )}

          </div>

          {/* Quick Mini Footer inside Side Panel */}
          <div className="p-4 bg-slate-950 border-t border-slate-900 text-[10px] text-slate-500 leading-relaxed text-center">
            FinOps® là thương hiệu đã đăng ký của FinOps Foundation. Trực quan hóa này tuân thủ các tài liệu Framework mở.
          </div>

        </div>

      </div>

    </div>
  );
}