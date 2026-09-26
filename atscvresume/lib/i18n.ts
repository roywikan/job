export const locales = ["en", "es", "id"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  id: "Bahasa Indonesia",
}

export const localeShort: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  id: "ID",
}

export const ogLocales: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  id: "id_ID",
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

const en = {
  meta: {
    title: "ATS-Friendly Resume Builder",
    description:
      "Create a free resume optimized for Applicant Tracking Systems (ATS). Fill in the form and generate a clean, professionally formatted resume.",
  },
  header: {
    appName: "ATS Resume",
    portalTitle: "Job.Web.ID - Job Portal",
    language: "Language",
  },
  page: {
    title: "ATS-Friendly Resume Builder",
    intro:
      "Create a resume optimized for Applicant Tracking Systems. Fill out the form below and click generate to create a professionally formatted, ATS-friendly resume.",
  },
  form: {
    tabForm: "Form",
    tabPreview: "Preview",
    personalInfo: "Personal Information",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    location: "Location",
    linkedin: "LinkedIn (optional)",
    namePlaceholder: "John Doe",
    emailPlaceholder: "john.doe@example.com",
    phonePlaceholder: "(123) 456-7890",
    locationPlaceholder: "City, State",
    linkedinPlaceholder: "linkedin.com/in/johndoe",
    summaryTitle: "Professional Summary",
    summaryLabel: "Write a concise summary of your professional background (3-5 sentences)",
    summaryPlaceholder: "Experienced software developer with 5+ years of expertise in web development...",
    summaryTip: "Tip: Include relevant keywords from the job description to improve ATS matching.",
    workTitle: "Work Experience",
    addExperience: "Add Experience",
    experience: "Experience",
    remove: "Remove",
    company: "Company",
    companyPlaceholder: "Company Name",
    position: "Position",
    positionPlaceholder: "Job Title",
    startDate: "Start Date",
    endDate: "End Date",
    datePlaceholder: "MM/YYYY",
    endDatePlaceholder: "MM/YYYY or Present",
    jobDescription: "Job Description",
    jobDescriptionPlaceholder: "Describe your role and responsibilities...",
    achievements: "Key Achievements (use bullet points)",
    achievementsPlaceholder:
      "• Increased sales by 20%\n• Led a team of 5 developers\n• Implemented new system that reduced costs by 15%",
    achievementsTip: "Tip: Use quantifiable achievements with metrics when possible.",
    educationTitle: "Education",
    addEducation: "Add Education",
    educationItem: "Education",
    institution: "Institution",
    institutionPlaceholder: "University Name",
    degree: "Degree",
    degreePlaceholder: "Bachelor of Science",
    field: "Field of Study",
    fieldPlaceholder: "Computer Science",
    graduationDate: "Graduation Date",
    additionalInfo: "Additional Information (optional)",
    additionalInfoPlaceholder: "Relevant coursework, honors, activities...",
    skillsTitle: "Skills",
    skillsLabel: "List your relevant skills (separate with commas or use bullet points)",
    skillsPlaceholder: "JavaScript, React, Node.js, Project Management, Team Leadership",
    skillsTip: "Tip: Include both technical and soft skills relevant to the position.",
    generate: "Generate ATS-Friendly Resume",
  },
  preview: {
    heading: "Your ATS-Friendly Resume",
    print: "Print",
    downloadPdf: "Download PDF",
    downloadAlert: "In a real application, this would generate and download a PDF version of your resume.",
    tabPreview: "Preview",
    tabTips: "ATS Tips",
    yourName: "Your Name",
    resume: "Resume",
    summary: "Professional Summary",
    work: "Work Experience",
    education: "Education",
    skills: "Skills",
    degreeIn: " in ",
    tipsTitle: "ATS Optimization Tips",
    tips: [
      {
        title: "Keywords",
        body: "Your resume includes keywords that match the job description. ATS systems scan for these keywords to determine relevance.",
      },
      {
        title: "Formatting",
        body: "This resume uses a clean, simple format that ATS systems can easily parse. Avoid tables, headers/footers, and complex formatting that might confuse ATS.",
      },
      {
        title: "File Format",
        body: "When downloading, save as a PDF or .docx file as these are most compatible with ATS systems.",
      },
      {
        title: "Quantifiable Achievements",
        body: "Including metrics and numbers in your achievements helps both ATS and human reviewers understand your impact.",
      },
      {
        title: "Job Title Alignment",
        body: "When possible, match your job titles to those in the job description (if accurate to your experience).",
      },
    ],
  },
}

export type Dictionary = typeof en

const es: Dictionary = {
  meta: {
    title: "Creador de Currículum Compatible con ATS",
    description:
      "Crea gratis un currículum optimizado para Sistemas de Seguimiento de Candidatos (ATS). Completa el formulario y genera un currículum limpio y profesional.",
  },
  header: {
    appName: "CV ATS",
    portalTitle: "Job.Web.ID - Portal de Empleo",
    language: "Idioma",
  },
  page: {
    title: "Creador de Currículum Compatible con ATS",
    intro:
      "Crea un currículum optimizado para Sistemas de Seguimiento de Candidatos. Completa el formulario y haz clic en generar para crear un currículum profesional y compatible con ATS.",
  },
  form: {
    tabForm: "Formulario",
    tabPreview: "Vista previa",
    personalInfo: "Información Personal",
    fullName: "Nombre completo",
    email: "Correo electrónico",
    phone: "Teléfono",
    location: "Ubicación",
    linkedin: "LinkedIn (opcional)",
    namePlaceholder: "Juan Pérez",
    emailPlaceholder: "juan.perez@ejemplo.com",
    phonePlaceholder: "+34 600 123 456",
    locationPlaceholder: "Ciudad, País",
    linkedinPlaceholder: "linkedin.com/in/juanperez",
    summaryTitle: "Resumen Profesional",
    summaryLabel: "Escribe un resumen conciso de tu trayectoria profesional (3-5 oraciones)",
    summaryPlaceholder: "Desarrollador de software con más de 5 años de experiencia en desarrollo web...",
    summaryTip: "Consejo: Incluye palabras clave de la oferta de empleo para mejorar la coincidencia con el ATS.",
    workTitle: "Experiencia Laboral",
    addExperience: "Añadir experiencia",
    experience: "Experiencia",
    remove: "Eliminar",
    company: "Empresa",
    companyPlaceholder: "Nombre de la empresa",
    position: "Puesto",
    positionPlaceholder: "Título del puesto",
    startDate: "Fecha de inicio",
    endDate: "Fecha de fin",
    datePlaceholder: "MM/AAAA",
    endDatePlaceholder: "MM/AAAA o Actualidad",
    jobDescription: "Descripción del puesto",
    jobDescriptionPlaceholder: "Describe tu función y responsabilidades...",
    achievements: "Logros clave (usa viñetas)",
    achievementsPlaceholder:
      "• Aumenté las ventas un 20%\n• Lideré un equipo de 5 desarrolladores\n• Implementé un sistema que redujo costes un 15%",
    achievementsTip: "Consejo: Usa logros cuantificables con métricas siempre que sea posible.",
    educationTitle: "Educación",
    addEducation: "Añadir educación",
    educationItem: "Educación",
    institution: "Institución",
    institutionPlaceholder: "Nombre de la universidad",
    degree: "Título",
    degreePlaceholder: "Grado en Ciencias",
    field: "Área de estudio",
    fieldPlaceholder: "Informática",
    graduationDate: "Fecha de graduación",
    additionalInfo: "Información adicional (opcional)",
    additionalInfoPlaceholder: "Asignaturas relevantes, honores, actividades...",
    skillsTitle: "Habilidades",
    skillsLabel: "Enumera tus habilidades relevantes (separadas por comas o con viñetas)",
    skillsPlaceholder: "JavaScript, React, Node.js, Gestión de proyectos, Liderazgo de equipos",
    skillsTip: "Consejo: Incluye habilidades técnicas y blandas relevantes para el puesto.",
    generate: "Generar currículum compatible con ATS",
  },
  preview: {
    heading: "Tu currículum compatible con ATS",
    print: "Imprimir",
    downloadPdf: "Descargar PDF",
    downloadAlert: "En una aplicación real, esto generaría y descargaría una versión PDF de tu currículum.",
    tabPreview: "Vista previa",
    tabTips: "Consejos ATS",
    yourName: "Tu nombre",
    resume: "Currículum",
    summary: "Resumen Profesional",
    work: "Experiencia Laboral",
    education: "Educación",
    skills: "Habilidades",
    degreeIn: " en ",
    tipsTitle: "Consejos de optimización para ATS",
    tips: [
      {
        title: "Palabras clave",
        body: "Tu currículum incluye palabras clave que coinciden con la oferta de empleo. Los sistemas ATS buscan estas palabras para determinar la relevancia.",
      },
      {
        title: "Formato",
        body: "Este currículum usa un formato limpio y sencillo que los ATS pueden leer fácilmente. Evita tablas, encabezados/pies de página y formatos complejos.",
      },
      {
        title: "Formato de archivo",
        body: "Al descargar, guarda en PDF o .docx, ya que son los formatos más compatibles con los sistemas ATS.",
      },
      {
        title: "Logros cuantificables",
        body: "Incluir métricas y cifras en tus logros ayuda tanto al ATS como a los reclutadores a entender tu impacto.",
      },
      {
        title: "Alineación del puesto",
        body: "Cuando sea posible, adapta tus títulos de puesto a los de la oferta de empleo (si reflejan tu experiencia real).",
      },
    ],
  },
}

const id: Dictionary = {
  meta: {
    title: "Pembuat CV Ramah ATS",
    description:
      "Buat CV gratis yang dioptimalkan untuk Applicant Tracking System (ATS). Isi formulir dan hasilkan CV yang rapi dan profesional.",
  },
  header: {
    appName: "CV ATS",
    portalTitle: "Job.Web.ID - Portal Kerja Indonesia",
    language: "Bahasa",
  },
  page: {
    title: "Pembuat CV Ramah ATS",
    intro:
      "Buat CV yang dioptimalkan untuk Applicant Tracking System. Isi formulir di bawah ini lalu klik buat untuk menghasilkan CV profesional yang ramah ATS.",
  },
  form: {
    tabForm: "Formulir",
    tabPreview: "Pratinjau",
    personalInfo: "Informasi Pribadi",
    fullName: "Nama Lengkap",
    email: "Email",
    phone: "Telepon",
    location: "Lokasi",
    linkedin: "LinkedIn (opsional)",
    namePlaceholder: "Budi Santoso",
    emailPlaceholder: "budi.santoso@contoh.com",
    phonePlaceholder: "+62 812 3456 7890",
    locationPlaceholder: "Kota, Provinsi",
    linkedinPlaceholder: "linkedin.com/in/budisantoso",
    summaryTitle: "Ringkasan Profesional",
    summaryLabel: "Tulis ringkasan singkat tentang latar belakang profesional Anda (3-5 kalimat)",
    summaryPlaceholder: "Pengembang perangkat lunak berpengalaman lebih dari 5 tahun di bidang pengembangan web...",
    summaryTip: "Tips: Sertakan kata kunci yang relevan dari deskripsi lowongan untuk meningkatkan kecocokan ATS.",
    workTitle: "Pengalaman Kerja",
    addExperience: "Tambah Pengalaman",
    experience: "Pengalaman",
    remove: "Hapus",
    company: "Perusahaan",
    companyPlaceholder: "Nama Perusahaan",
    position: "Posisi",
    positionPlaceholder: "Jabatan",
    startDate: "Tanggal Mulai",
    endDate: "Tanggal Selesai",
    datePlaceholder: "BB/TTTT",
    endDatePlaceholder: "BB/TTTT atau Sekarang",
    jobDescription: "Deskripsi Pekerjaan",
    jobDescriptionPlaceholder: "Jelaskan peran dan tanggung jawab Anda...",
    achievements: "Pencapaian Utama (gunakan poin)",
    achievementsPlaceholder:
      "• Meningkatkan penjualan sebesar 20%\n• Memimpin tim yang terdiri dari 5 pengembang\n• Menerapkan sistem baru yang menekan biaya 15%",
    achievementsTip: "Tips: Gunakan pencapaian yang terukur dengan angka jika memungkinkan.",
    educationTitle: "Pendidikan",
    addEducation: "Tambah Pendidikan",
    educationItem: "Pendidikan",
    institution: "Institusi",
    institutionPlaceholder: "Nama Universitas",
    degree: "Gelar",
    degreePlaceholder: "Sarjana (S1)",
    field: "Bidang Studi",
    fieldPlaceholder: "Ilmu Komputer",
    graduationDate: "Tanggal Lulus",
    additionalInfo: "Informasi Tambahan (opsional)",
    additionalInfoPlaceholder: "Mata kuliah relevan, penghargaan, kegiatan...",
    skillsTitle: "Keahlian",
    skillsLabel: "Sebutkan keahlian Anda yang relevan (pisahkan dengan koma atau gunakan poin)",
    skillsPlaceholder: "JavaScript, React, Node.js, Manajemen Proyek, Kepemimpinan Tim",
    skillsTip: "Tips: Sertakan keahlian teknis maupun soft skill yang relevan dengan posisi.",
    generate: "Buat CV Ramah ATS",
  },
  preview: {
    heading: "CV Ramah ATS Anda",
    print: "Cetak",
    downloadPdf: "Unduh PDF",
    downloadAlert: "Pada aplikasi sebenarnya, fitur ini akan membuat dan mengunduh versi PDF dari CV Anda.",
    tabPreview: "Pratinjau",
    tabTips: "Tips ATS",
    yourName: "Nama Anda",
    resume: "CV",
    summary: "Ringkasan Profesional",
    work: "Pengalaman Kerja",
    education: "Pendidikan",
    skills: "Keahlian",
    degreeIn: " - ",
    tipsTitle: "Tips Optimasi ATS",
    tips: [
      {
        title: "Kata Kunci",
        body: "CV Anda memuat kata kunci yang sesuai dengan deskripsi lowongan. Sistem ATS memindai kata kunci ini untuk menentukan relevansi.",
      },
      {
        title: "Format",
        body: "CV ini menggunakan format yang bersih dan sederhana sehingga mudah dibaca ATS. Hindari tabel, header/footer, dan format rumit yang dapat membingungkan ATS.",
      },
      {
        title: "Format File",
        body: "Saat mengunduh, simpan dalam format PDF atau .docx karena paling kompatibel dengan sistem ATS.",
      },
      {
        title: "Pencapaian Terukur",
        body: "Menyertakan angka dan metrik dalam pencapaian membantu ATS maupun perekrut memahami dampak kerja Anda.",
      },
      {
        title: "Kesesuaian Jabatan",
        body: "Jika memungkinkan, sesuaikan nama jabatan Anda dengan yang ada di deskripsi lowongan (selama sesuai dengan pengalaman Anda).",
      },
    ],
  },
}

const dictionaries: Record<Locale, Dictionary> = { en, es, id }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
