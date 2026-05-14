interface PromptTemplate {
  label: string
  category: string
  prompt: string
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    label: '商业海报 · 产品广告',
    category: '商业设计',
    prompt: 'Create a professional product advertising poster for {product}, modern minimalist design, clean layout with bold typography, premium feel, soft gradient background, high-end commercial photography style, 9:16 vertical composition',
  },
  {
    label: '信息图 · 科普百科卡',
    category: '信息图',
    prompt: '请根据【{topic}】生成一张高质量竖版「科普百科图」。包含标题区、核心知识区（3-5个要点，每点配图标）、数据可视化区、底部总结。风格：扁平化插画+信息图表，配色和谐统一，文字清晰可读，9:16竖版构图',
  },
  {
    label: '旅行插画 · 城市旅行海报',
    category: '插画设计',
    prompt: 'Vintage travel poster for {city}, retro illustration style, bold graphic design, iconic landmarks, warm sunset color palette, art deco typography, classic travel advertisement aesthetic, 3:4 vertical composition',
  },
  {
    label: 'UI Mockup · App 展示图',
    category: 'UI设计',
    prompt: 'Create a clean App UI mockup showcase for {app_name}, featuring a phone frame with modern interface design, floating UI elements, soft shadows, gradient background, professional presentation style, dribbble-quality design, 9:16 vertical',
  },
  {
    label: '角色设计 · 角色设定表',
    category: '角色设计',
    prompt: 'Character design sheet for {character}, showing multiple views (front, side, back), expression variations, color palette swatch, character name label, clean white background, professional concept art style, anime-influenced design',
  },
  {
    label: '摄影人像 · 杂志感人像',
    category: '摄影',
    prompt: 'Cinematic portrait photography, magazine editorial style, {subject}, dramatic lighting with rim light, shallow depth of field, professional studio quality, fashion photography aesthetic, rich color grading, 3:4 vertical composition',
  },
  {
    label: '新中式水墨山水海报',
    category: '国风设计',
    prompt: '新中式水墨山水海报，竖版9:16构图，东方极简美学风格，{theme}主题，大面积留白，淡雅水墨晕染，金色点缀，书法字体标题，意境悠远，高级质感',
  },
  {
    label: '科幻电影海报',
    category: '海报设计',
    prompt: 'Science fiction movie poster, {theme}, epic cinematic composition, dramatic lighting, futuristic cityscape, holographic elements, neon accents, bold title typography, dark atmospheric mood, 2:3 vertical poster format',
  },
  {
    label: '3D图标 · 应用图标设计',
    category: '3D设计',
    prompt: '3D app icon design for {app_name}, glossy rounded square shape, vibrant gradient, clay/soft 3D rendering style, clean and modern, centered composition, soft shadow, professional quality, iOS app store style',
  },
  {
    label: '美食摄影 · 食物广告',
    category: '摄影',
    prompt: 'Professional food photography, {dish_name}, overhead shot, styled plating, fresh ingredients scattered around, warm natural lighting, shallow depth of field, restaurant-quality presentation, appetizing colors, editorial food magazine style',
  },
  {
    label: '扁平插画 · 科技场景',
    category: '插画设计',
    prompt: 'Flat illustration of {scene}, isometric perspective, vibrant color palette, geometric shapes, clean lines, modern tech company style, dribbble-quality, minimal detail, soft shadows, 16:9 horizontal composition',
  },
  {
    label: '赛博朋克 · 夜景人像',
    category: '摄影',
    prompt: 'Cyberpunk night portrait, neon-lit city street, {subject}, rain reflections, holographic advertisements, purple and cyan color scheme, futuristic fashion, blade runner aesthetic, cinematic lighting, 9:16 vertical',
  },
  {
    label: '手绘地图 · 城市美食地图',
    category: '插画设计',
    prompt: 'Hand-drawn city food map illustration, {city} theme, cute food icons and landmarks, watercolor style, warm tones, dotted path routes, handwritten labels, playful and inviting design, vintage map aesthetic, 1:1 square composition',
  },
  {
    label: '极简logo · 品牌标识',
    category: '品牌设计',
    prompt: 'Minimalist logo design for {brand_name}, clean geometric shapes, single color or two-tone, scalable vector style, modern and timeless, centered on white background, professional brand identity, simple yet memorable',
  },
  {
    label: '社交媒体 · Instagram 故事',
    category: '社交媒体',
    prompt: 'Instagram story design for {purpose}, 9:16 vertical, trendy gradient background, modern sans-serif typography, minimal graphic elements, engaging layout, swipe-up CTA, vibrant and eye-catching, Gen Z aesthetic',
  },
  {
    label: '日系胶片人像',
    category: '摄影',
    prompt: 'Japanese Fuji film photography style portrait, {subject}, soft natural light, pastel color tones, slight film grain, dreamy bokeh background, gentle and warm mood, 35mm film aesthetic, 3:4 vertical composition',
  },
  {
    label: '韩系偶像证件照',
    category: '摄影',
    prompt: 'Korean idol portrait, professional headshot style, {subject}, flawless skin retouching, soft studio lighting, clean background, K-pop aesthetic, high fashion, 3:4 vertical composition, magazine cover quality',
  },
  {
    label: '产品爆炸视图',
    category: '3D设计',
    prompt: '3D product exploded view illustration, {product}, technical diagram style, floating components with subtle connecting lines, clean white background, isometric view, soft shadows, professional product visualization, labeled parts',
  },
  {
    label: '水彩插画 · 梦幻编辑',
    category: '插画设计',
    prompt: 'Dreamy watercolor editorial illustration, {theme}, soft washes of color, flowing organic shapes, ethereal atmosphere, delicate linework, pastel palette, artistic and poetic mood, magazine illustration quality, 3:4 vertical',
  },
  {
    label: '像素风 · 游戏场景',
    category: '游戏设计',
    prompt: 'Pixel art game scene, {scene_description}, 16-bit retro style, vibrant limited color palette, detailed tile work, nostalgic gaming aesthetic, side-scrolling view, animated sprite feel, 16:9 horizontal composition',
  },
]
