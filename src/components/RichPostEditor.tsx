import React, { useState, useRef, useMemo, useEffect } from 'react';
import { marked } from 'marked';
import { applyAutoLinks, calculateReadTime, preprocessMarkdownLineBreaks, renderResponsiveVideoEmbeds } from '../lib/autolink';
import { sanitizeAndOptimizeImageUrl, sanitizeMarkdownImageUrls, getOptimizedImageUrl, getOptimizedAvatarUrl } from '../lib/imageUtils';
import { parseAndRenderReferences } from '../lib/referenceParser';
import { AutoLink, User, PostRevision, UserRole, PostStatus, SiteConfig } from '../types';
import SeoAuditWidget from './SeoAuditWidget';
import { 
  Bold, Italic, Strikethrough, Heading2, Heading3, 
  List, ListOrdered, CheckSquare, Quote, Code, Table, Minus, 
  Link as LinkIcon, Link2, Image as ImageIcon, Upload, Eye, Edit3, Columns, 
  Undo, Redo, Sparkles, CheckCircle2, RefreshCw, X, Copy, Check, FileText,
  Users, History, RotateCcw, Award, ShieldCheck, Send, AlertTriangle, AlertCircle, ThumbsUp, XCircle, Video, ShoppingBag, Maximize2, Minimize2,
  RemoveFormatting
} from 'lucide-react';

interface RichPostEditorProps {
  title: string;
  setTitle: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  markdown: string;
  setMarkdown: (val: string) => void;
  excerpt: string;
  setExcerpt: (val: string) => void;
  featuredImage: string;
  setFeaturedImage: (val: string) => void;
  metaTitle: string;
  setMetaTitle: (val: string) => void;
  metaDesc: string;
  setMetaDesc: (val: string) => void;
  tags: string;
  setTags: (val: string) => void;
  autoSaveStatus: 'saved' | 'saving' | 'dirty';
  isAiLoading: boolean;
  onAiGenerateMeta: () => void;
  onPublishSubmit: (status: PostStatus, rejectionReason?: string) => void;
  uploadingImage: boolean;
  onImageUpload: (file: File) => Promise<string | null>;
  autolinks: AutoLink[];
  writers?: User[];
  authorId?: number;
  setAuthorId?: (id: number) => void;
  coAuthorIds?: number[];
  setCoAuthorIds?: (ids: number[]) => void;
  revisions?: PostRevision[];
  onRestoreRevision?: (rev: PostRevision) => void;
  userRole?: UserRole;
  currentStatus?: PostStatus;
  rejectionReason?: string;
  currentLoggedInUserId?: number;
  postType?: 'article' | 'interactive_configurator' | 'interactive_showcase' | 'interactive_radar' | 'interactive_quiz' | 'interactive_timeline_slider' | 'interactive_battle_card' | 'interactive_quiz_router' | 'interactive_habit_simulator' | 'interactive_qa_column' | 'interactive_event_listing' | 'interactive_glossary_dictionary';
  setPostType?: (val: 'article' | 'interactive_configurator' | 'interactive_showcase' | 'interactive_radar' | 'interactive_quiz' | 'interactive_timeline_slider' | 'interactive_battle_card' | 'interactive_quiz_router' | 'interactive_habit_simulator' | 'interactive_qa_column' | 'interactive_event_listing' | 'interactive_glossary_dictionary') => void;
  interactiveConfigurator?: any;
  setInteractiveConfigurator?: (val: any) => void;
  interactiveShowcase?: any;
  setInteractiveShowcase?: (val: any) => void;
  interactiveRadar?: any;
  setInteractiveRadar?: (val: any) => void;
  interactiveQuiz?: any;
  setInteractiveQuiz?: (val: any) => void;
  interactiveTimelineSlider?: any;
  setInteractiveTimelineSlider?: (val: any) => void;
  interactiveBattleCard?: any;
  setInteractiveBattleCard?: (val: any) => void;
  interactiveQuizRouter?: any;
  setInteractiveQuizRouter?: (val: any) => void;
  interactiveHabitSimulator?: any;
  setInteractiveHabitSimulator?: (val: any) => void;
  interactiveQaColumn?: any;
  setInteractiveQaColumn?: (val: any) => void;
  interactiveEventListing?: any;
  setInteractiveEventListing?: (val: any) => void;
  interactiveGlossaryDictionary?: any;
  setInteractiveGlossaryDictionary?: (val: any) => void;
  disclaimerType?: 'none' | 'medical_psychology' | 'financial' | 'legal' | 'academic' | 'custom';
  setDisclaimerType?: (val: 'none' | 'medical_psychology' | 'financial' | 'legal' | 'academic' | 'custom') => void;
  customDisclaimerText?: string;
  setCustomDisclaimerText?: (val: string) => void;
  isZenMode?: boolean;
  setIsZenMode?: (val: boolean) => void;
  siteConfig?: SiteConfig;
}

export default function RichPostEditor({
  title,
  setTitle,
  slug,
  setSlug,
  category,
  setCategory,
  markdown,
  setMarkdown,
  excerpt,
  setExcerpt,
  featuredImage,
  setFeaturedImage,
  metaTitle,
  setMetaTitle,
  metaDesc,
  setMetaDesc,
  tags,
  setTags,
  autoSaveStatus,
  isAiLoading,
  onAiGenerateMeta,
  onPublishSubmit,
  uploadingImage,
  onImageUpload,
  autolinks,
  writers = [],
  authorId,
  setAuthorId,
  coAuthorIds = [],
  setCoAuthorIds,
  revisions = [],
  onRestoreRevision,
  userRole = 'writer',
  currentStatus = 'draft',
  rejectionReason = '',
  currentLoggedInUserId: currentLoggedInUserIdProp,
  postType = 'article',
  setPostType,
  interactiveConfigurator,
  setInteractiveConfigurator,
  interactiveShowcase,
  setInteractiveShowcase,
  interactiveRadar,
  setInteractiveRadar,
  interactiveQuiz,
  setInteractiveQuiz,
  interactiveTimelineSlider,
  setInteractiveTimelineSlider,
  interactiveBattleCard,
  setInteractiveBattleCard,
  interactiveQuizRouter,
  setInteractiveQuizRouter,
  interactiveHabitSimulator,
  setInteractiveHabitSimulator,
  interactiveQaColumn,
  setInteractiveQaColumn,
  interactiveEventListing,
  setInteractiveEventListing,
  interactiveGlossaryDictionary,
  setInteractiveGlossaryDictionary,
  disclaimerType = 'none',
  setDisclaimerType,
  customDisclaimerText = '',
  setCustomDisclaimerText,
  isZenMode = false,
  setIsZenMode,
  siteConfig,
}: RichPostEditorProps) {
  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  // Get currently logged-in user id
  const currentLoggedInUserId = useMemo(() => {
    if (currentLoggedInUserIdProp) return Number(currentLoggedInUserIdProp);
    try {
      const stored = localStorage.getItem('cms_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) return Number(parsed.id);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }, [currentLoggedInUserIdProp]);

  // Editor view modes: 'write' | 'split' | 'preview'
  const [viewMode, setViewMode] = useState<'write' | 'split' | 'preview'>('write');

  // Automatically switch view mode off 'split' on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'split') {
        setViewMode('write');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);
  
  // Textarea Ref
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Toggle to show all interactive formatting options
  const [showAllFormats, setShowAllFormats] = useState(false);

  // Modals state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const [showRefModal, setShowRefModal] = useState(false);
  const [refAuthor, setRefAuthor] = useState('');
  const [refTitle, setRefTitle] = useState('');
  const [refJournal, setRefJournal] = useState('');
  const [refYear, setRefYear] = useState('');
  const [refUrl, setRefUrl] = useState('');

  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showProductPickerModal, setShowProductPickerModal] = useState(false);
  const [pickerProducts, setPickerProducts] = useState<any[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  const handleOpenProductPicker = async () => {
    setShowProductPickerModal(true);
    setPickerLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setPickerProducts(data);
      }
    } catch (err) {
      console.error('Failed to load products for picker:', err);
    } finally {
      setPickerLoading(false);
    }
  };

  const handleSelectProductToInsert = (productSlug: string) => {
    applyFormatting('\n\n[produk:', ']\n\n', productSlug);
    setShowProductPickerModal(false);
  };
  const [videoPlatform, setVideoPlatform] = useState<'youtube' | 'tiktok' | 'instagram'>('youtube');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'unsplash' | 'url'>('upload');

  const handleUpdateConfigurator = (updates: any) => {
    if (setInteractiveConfigurator) {
      setInteractiveConfigurator({
        ...interactiveConfigurator,
        ...updates
      });
    }
  };

  const handleUpdateShowcase = (updates: any) => {
    if (setInteractiveShowcase) {
      setInteractiveShowcase({
        ...interactiveShowcase,
        ...updates
      });
    }
  };

  const handleUpdateRadar = (updates: any) => {
    if (setInteractiveRadar) {
      setInteractiveRadar({
        ...interactiveRadar,
        ...updates
      });
    }
  };

  const handleUpdateQuiz = (updates: any) => {
    if (setInteractiveQuiz) {
      setInteractiveQuiz({
        ...interactiveQuiz,
        ...updates
      });
    }
  };

  const handleUpdateTimelineSlider = (updates: any) => {
    if (setInteractiveTimelineSlider) {
      setInteractiveTimelineSlider({
        ...interactiveTimelineSlider,
        ...updates
      });
    }
  };

  const handleUpdateBattleCard = (updates: any) => {
    if (setInteractiveBattleCard) {
      setInteractiveBattleCard({
        ...interactiveBattleCard,
        ...updates
      });
    }
  };

  const handleUpdateQuizRouter = (updates: any) => {
    if (setInteractiveQuizRouter) {
      setInteractiveQuizRouter({
        ...interactiveQuizRouter,
        ...updates
      });
    }
  };

  const handleUpdateHabitSimulator = (updates: any) => {
    if (setInteractiveHabitSimulator) {
      setInteractiveHabitSimulator({
        ...interactiveHabitSimulator,
        ...updates
      });
    }
  };

  const handleUpdateQAColumn = (updates: any) => {
    if (setInteractiveQaColumn) {
      setInteractiveQaColumn({
        ...interactiveQaColumn,
        ...updates
      });
    }
  };

  const handleUpdateEventListing = (updates: any) => {
    if (setInteractiveEventListing) {
      setInteractiveEventListing({
        ...interactiveEventListing,
        ...updates
      });
    }
  };

  const handleUpdateGlossaryDictionary = (updates: any) => {
    if (setInteractiveGlossaryDictionary) {
      setInteractiveGlossaryDictionary({
        ...interactiveGlossaryDictionary,
        ...updates
      });
    }
  };
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string>('');
  const [unsplashSearch, setUnsplashSearch] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const UNSPLASH_PRESETS = [
    { label: 'Edukasi & Keluarga', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=65&fm=webp' },
    { label: 'Teknologi & Workspace', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=65&fm=webp' },
    { label: 'Gaya Hidup & Kesehatan', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=65&fm=webp' },
    { label: 'Nutrisi & Makanan', url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=65&fm=webp' },
    { label: 'Kreatif & Seni', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=65&fm=webp' },
    { label: 'Komunitas & Tim', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=65&fm=webp' },
    { label: 'Sekolah & Pendidikan', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=65&fm=webp' },
    { label: 'Kesehatan & Medis', url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=65&fm=webp' },
  ];

  // Undo / Redo History Stack with 3-minute / significance threshold
  const historyRef = useRef<string[]>([markdown]);
  const historyIndexRef = useRef<number>(0);
  const lastHistoryTimeRef = useRef<number>(Date.now());

  // Update undo stack
  const updateMarkdownWithHistory = (newVal: string, forceCheckpoint: boolean = false) => {
    setMarkdown(newVal);
    const lastVal = historyRef.current[historyIndexRef.current];
    if (lastVal === newVal) return;

    const now = Date.now();
    const elapsed = now - lastHistoryTimeRef.current;
    const minTimeMinutes = siteConfig?.history_min_time_minutes ?? 3;
    const minCharDiff = siteConfig?.history_min_char_diff ?? 25;
    const intervalMs = minTimeMinutes * 60 * 1000;
    
    const lengthDiff = Math.abs(newVal.length - lastVal.length);
    const hasNewlineChange = (newVal.match(/\n/g) || []).length !== (lastVal.match(/\n/g) || []).length;
    const isSignificant = forceCheckpoint || lengthDiff > minCharDiff || hasNewlineChange || elapsed >= intervalMs;

    if (isSignificant) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push(newVal);
      historyIndexRef.current = historyRef.current.length - 1;
      lastHistoryTimeRef.current = now;
    } else {
      historyRef.current[historyIndexRef.current] = newVal;
    }
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      setMarkdown(historyRef.current[historyIndexRef.current]);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      setMarkdown(historyRef.current[historyIndexRef.current]);
    }
  };

  // Selection-aware formatting wrapper
  const applyFormatting = (prefix: string, suffix: string = '', defaultText: string = 'Teks Baru') => {
    if (!textareaRef.current) {
      const updated = `${markdown}\n${prefix}${defaultText}${suffix}`;
      updateMarkdownWithHistory(updated);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let insertContent = '';
    let cursorStart = start;
    let cursorEnd = end;

    if (selectedText.length > 0) {
      insertContent = `${prefix}${selectedText}${suffix}`;
      cursorStart = start + prefix.length;
      cursorEnd = cursorStart + selectedText.length;
    } else {
      insertContent = `${prefix}${defaultText}${suffix}`;
      cursorStart = start + prefix.length;
      cursorEnd = cursorStart + defaultText.length;
    }

    const fullText = textarea.value.substring(0, start) + insertContent + textarea.value.substring(end);
    updateMarkdownWithHistory(fullText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(cursorStart, cursorEnd);
      }
    }, 10);
  };

  // Clean formatting from selected text
  const cleanFormatting = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (!selectedText) return;

    // Strip common markdown characters
    const cleaned = selectedText.replace(/[\*\_~`#>-]/g, '').trim();
    const fullText = textarea.value.substring(0, start) + cleaned + textarea.value.substring(end);
    updateMarkdownWithHistory(fullText);
  };

  // Insert Link Action
  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;
    const textToUse = linkText.trim() || 'Link Artikel';
    const formatted = `[${textToUse}](${linkUrl.trim()})`;
    
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const fullText = textarea.value.substring(0, start) + formatted + textarea.value.substring(end);
      updateMarkdownWithHistory(fullText);
    } else {
      updateMarkdownWithHistory(`${markdown}\n${formatted}`);
    }

    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
  };

  // Open Reference Modal (Prefills selected text if any)
  const handleOpenRefModal = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selected = textareaRef.current.value.substring(start, end).trim();
      if (selected) {
        setRefAuthor(selected);
      }
    }
    setShowRefModal(true);
  };

  // Insert Scientific Reference Action (E-E-A-T)
  const handleInsertReference = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const author = refAuthor.trim() || 'Prof. Suparman';
    const parts: string[] = [author];
    if (refTitle.trim()) {
      const cleanTitle = refTitle.trim().replace(/^["']|["']$/g, '');
      parts.push(`"${cleanTitle}"`);
    }
    if (refJournal.trim()) parts.push(refJournal.trim());
    if (refYear.trim()) parts.push(refYear.trim());
    if (refUrl.trim()) parts.push(refUrl.trim());

    const formatted = ` [ref: ${parts.join(', ')}]`;

    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const fullText = textarea.value.substring(0, start) + formatted + textarea.value.substring(end);
      updateMarkdownWithHistory(fullText);
    } else {
      updateMarkdownWithHistory(`${markdown}${formatted}`);
    }

    setShowRefModal(false);
    setRefAuthor('');
    setRefTitle('');
    setRefJournal('');
    setRefYear('');
    setRefUrl('');
  };

  // Insert Video Action
  const handleInsertVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;
    const formatted = `\n\n[${videoPlatform}:${videoUrl.trim()}]\n\n`;
    
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const fullText = textarea.value.substring(0, start) + formatted + textarea.value.substring(end);
      updateMarkdownWithHistory(fullText);
    } else {
      updateMarkdownWithHistory(`${markdown}\n${formatted}`);
    }

    setShowVideoModal(false);
    setVideoUrl('');
  };

  // Insert Image Action
  const handleInsertImage = (url: string, altText: string) => {
    if (!url) return;
    const sanitizedUrl = sanitizeAndOptimizeImageUrl(url, 'body');
    const formatted = `\n\n![${altText || 'Gambar Artikel'}](${sanitizedUrl})\n\n`;
    
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const fullText = textarea.value.substring(0, start) + formatted + textarea.value.substring(end);
      updateMarkdownWithHistory(fullText);
    } else {
      updateMarkdownWithHistory(`${markdown}${formatted}`);
    }

    setShowImageModal(false);
    setImageUrl('');
    setImageAlt('');
  };

  // Upload image file handler (Cloudinary + WebP + Max 3MB)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side File Size Validation (Max 3MB limit)
    const MAX_SIZE_BYTES = 3 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      alert(`Ukuran file "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas 3 MB. Silakan kompres gambar terlebih dahulu agar loading artikel tetap ringan.`);
      return;
    }

    const uploadedUrl = await onImageUpload(file);
    if (uploadedUrl) {
      setLastUploadedUrl(uploadedUrl);
      setImageUrl(uploadedUrl);
      const cleanAlt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setImageAlt(cleanAlt || 'Gambar Artikel');
    }
  };

  // Insert Table
  const insertTable = () => {
    const tableTemplate = `\n\n| Judul Kolom 1 | Judul Kolom 2 | Judul Kolom 3 |\n| --- | --- | --- |\n| Isi Baris 1 | Detail A | Catatan 1 |\n| Isi Baris 2 | Detail B | Catatan 2 |\n\n`;
    applyFormatting('', '', tableTemplate);
  };

  // HTML Preview Renderer with Auto-Links & Lazy Loaded Images
  const parsedPreviewHtml = useMemo(() => {
    if (!markdown) return '';
    const preparedMd = preprocessMarkdownLineBreaks(markdown);
    let rawHtml = marked.parse(preparedMd, { async: false, gfm: true, breaks: true }) as string;

    // Inject loading="lazy" and decoding="async" into <img> tags
    rawHtml = rawHtml.replace(/<img\s+/gi, '<img loading="lazy" decoding="async" ');

    // Render responsive videos
    rawHtml = renderResponsiveVideoEmbeds(rawHtml);

    // Inject id attributes into <h2> and <h3> tags for TOC
    rawHtml = rawHtml.replace(/<(h[23])>(.*?)<\/\1>/gi, (match, tag, content) => {
      const cleanText = content.replace(/<[^>]+>/g, '').trim();
      if (!cleanText || cleanText.length > 120) return match;
      const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return `<${tag} id="${id}" class="scroll-mt-24">${content}</${tag}>`;
    });

    // Parse inline scientific references ([ref:...], [referensi:...], [jurnal:...])
    // Supports optional URL/DOI at the end with automatic bibliography generation
    let refHeading = 'Referensi';
    try {
      const cachedConfig = typeof window !== 'undefined' ? localStorage.getItem('parenting_site_config') : null;
      if (cachedConfig) {
        const parsedConfig = JSON.parse(cachedConfig);
        if (parsedConfig && parsedConfig.reference_heading_label) {
          refHeading = parsedConfig.reference_heading_label;
        }
      }
    } catch (e) {
      console.warn('Could not parse cached config for references heading:', e);
    }
    rawHtml = parseAndRenderReferences(rawHtml, refHeading);

    return applyAutoLinks(rawHtml, autolinks);
  }, [markdown, autolinks]);

  // Article Real-time Statistics
  const stats = useMemo(() => {
    const text = markdown.trim();
    if (!text) return { words: 0, chars: 0, readTime: 1, paragraphs: 0 };
    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
    const readTime = calculateReadTime(text);
    return { words, chars, readTime, paragraphs };
  }, [markdown]);

  // ========================================================
  // MEDIUM-STYLE FLYING TOOLBAR (MELAYANG DI ATAS TEKS TERPILIH)
  // Tersedia di semua level: Author (Writer), Editor, Admin
  // ========================================================
  const [flyingToolbar, setFlyingToolbar] = useState<{
    visible: boolean;
    x: number;
    y: number;
    showBelow?: boolean;
    activeStates: {
      bold: boolean;
      italic: boolean;
      h2: boolean;
      h3: boolean;
      quote: boolean;
      pullquote: boolean;
      bulletList: boolean;
      numberedList: boolean;
    };
  }>({
    visible: false,
    x: 0,
    y: 0,
    showBelow: false,
    activeStates: {
      bold: false,
      italic: false,
      h2: false,
      h3: false,
      quote: false,
      pullquote: false,
      bulletList: false,
      numberedList: false,
    },
  });

  const [flyingLinkMode, setFlyingLinkMode] = useState(false);
  const [flyingLinkUrl, setFlyingLinkUrl] = useState('');
  const flyingToolbarRef = useRef<HTMLDivElement | null>(null);
  const flyingLinkInputRef = useRef<HTMLInputElement | null>(null);

  // Update Flying Toolbar Position & Active States
  const updateFlyingToolbar = (mouseClientX?: number, mouseClientY?: number) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      if (!flyingLinkMode) setFlyingToolbar(prev => ({ ...prev, visible: false }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Sembunyikan jika tidak ada teks yang disorot
    if (start === end || start === undefined || end === undefined) {
      if (!flyingLinkMode) setFlyingToolbar(prev => ({ ...prev, visible: false }));
      return;
    }

    const selectedText = textarea.value.substring(start, end).trim();
    if (selectedText.length === 0) {
      if (!flyingLinkMode) setFlyingToolbar(prev => ({ ...prev, visible: false }));
      return;
    }

    // Deteksi baris yang memuat teks seleksi
    const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = textarea.value.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = textarea.value.length;
    const fullLine = textarea.value.substring(lineStart, lineEnd);

    // Cek format aktif
    const isBold = (selectedText.startsWith('**') && selectedText.endsWith('**') && selectedText.length >= 4) ||
      (textarea.value.substring(Math.max(0, start - 2), start) === '**' && textarea.value.substring(end, end + 2) === '**');
    const isItalic = (selectedText.startsWith('*') && selectedText.endsWith('*') && !selectedText.startsWith('**') && selectedText.length >= 2) ||
      (textarea.value.substring(Math.max(0, start - 1), start) === '*' && textarea.value.substring(end, end + 1) === '*');
    const isH2 = fullLine.startsWith('## ') && !fullLine.startsWith('### ');
    const isH3 = fullLine.startsWith('### ') && !fullLine.startsWith('#### ');
    const isPullquote = fullLine.includes('pullquote') || fullLine.includes('blockquote class="pullquote"');
    const isQuote = (fullLine.startsWith('> ') || fullLine.includes('<blockquote')) && !isPullquote;
    const isBulletList = /^\s*[-*+]\s+/.test(fullLine);
    const isNumberedList = /^\s*\d+\.\s+/.test(fullLine);

    // Hitung posisi toolbar melayang di atas teks
    const rect = textarea.getBoundingClientRect();
    let posX = rect.left + rect.width / 2;
    let posY = rect.top;

    if (mouseClientX !== undefined && mouseClientY !== undefined) {
      posX = mouseClientX;
      posY = mouseClientY;
    } else {
      const textBefore = textarea.value.substring(0, start);
      const lines = textBefore.split('\n');
      const currentLineIndex = lines.length - 1;
      const lineHeight = 22;
      const calculatedY = rect.top + 24 + (currentLineIndex * lineHeight) - textarea.scrollTop;
      posY = Math.max(rect.top + 10, Math.min(rect.bottom - 10, calculatedY));
      posX = rect.left + Math.min(rect.width * 0.8, 60 + (lines[currentLineIndex]?.length || 0) * 8);
    }

    // Hindari toolbar terpotong di tepi layar
    const toolbarHalfWidth = 175;
    posX = Math.max(toolbarHalfWidth + 12, Math.min(window.innerWidth - toolbarHalfWidth - 12, posX));

    // Jika terlalu dekat dengan batas atas layar (< 75px), posisikan di bawah seleksi
    const showBelow = posY - 65 < 55;
    const finalY = showBelow ? posY + 35 : posY - 12;

    setFlyingToolbar({
      visible: true,
      x: posX,
      y: finalY,
      showBelow,
      activeStates: {
        bold: isBold,
        italic: isItalic,
        h2: isH2,
        h3: isH3,
        quote: isQuote,
        pullquote: isPullquote,
        bulletList: isBulletList,
        numberedList: isNumberedList,
      },
    });
  };

  // Tutup Flying Toolbar saat klik di luar area
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        flyingToolbarRef.current &&
        !flyingToolbarRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setFlyingToolbar(prev => ({ ...prev, visible: false }));
        setFlyingLinkMode(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // 1. Tombol B (Bold)
  const handleFlyingBold = () => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const text = ta.value.substring(s, e);
    if (!text) return;

    let replacement = '';
    let newStart = s;
    let newEnd = e;

    if (text.startsWith('**') && text.endsWith('**') && text.length >= 4) {
      replacement = text.slice(2, -2);
      newEnd = s + replacement.length;
    } else {
      replacement = `**${text}**`;
      newEnd = s + replacement.length;
    }

    const updated = ta.value.substring(0, s) + replacement + ta.value.substring(e);
    updateMarkdownWithHistory(updated);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newStart, newEnd);
        updateFlyingToolbar();
      }
    }, 10);
  };

  // 2. Tombol i (Italic)
  const handleFlyingItalic = () => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const text = ta.value.substring(s, e);
    if (!text) return;

    let replacement = '';
    let newStart = s;
    let newEnd = e;

    if (text.startsWith('*') && text.endsWith('*') && !text.startsWith('**') && text.length >= 2) {
      replacement = text.slice(1, -1);
      newEnd = s + replacement.length;
    } else {
      replacement = `*${text}*`;
      newEnd = s + replacement.length;
    }

    const updated = ta.value.substring(0, s) + replacement + ta.value.substring(e);
    updateMarkdownWithHistory(updated);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newStart, newEnd);
        updateFlyingToolbar();
      }
    }, 10);
  };

  // 3. Tombol H Besar (H2: ## )
  // Mengubah baris teks yang disorot menjadi sub-judul ## (atau kembali ke normal text jika diklik sekali lagi)
  const handleFlyingH2 = () => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
    let lineEnd = ta.value.indexOf('\n', e);
    if (lineEnd === -1) lineEnd = ta.value.length;

    const fullLine = ta.value.substring(lineStart, lineEnd);
    let newLine = '';

    if (fullLine.startsWith('## ') && !fullLine.startsWith('### ')) {
      // Toggle off: kembali ke teks normal tanpa markup
      newLine = fullLine.replace(/^##\s+/, '');
    } else {
      // Hapus heading lama jika ada lalu ubah ke ## (H2)
      newLine = `## ${fullLine.replace(/^#+\s*/, '')}`;
    }

    const updated = ta.value.substring(0, lineStart) + newLine + ta.value.substring(lineEnd);
    updateMarkdownWithHistory(updated);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(lineStart, lineStart + newLine.length);
        updateFlyingToolbar();
      }
    }, 10);
  };

  // 4. Tombol H Kecil (H3: ### )
  // Mengubah baris teks yang disorot menjadi sub-judul ### (atau kembali ke normal text jika diklik sekali lagi)
  const handleFlyingH3 = () => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
    let lineEnd = ta.value.indexOf('\n', e);
    if (lineEnd === -1) lineEnd = ta.value.length;

    const fullLine = ta.value.substring(lineStart, lineEnd);
    let newLine = '';

    if (fullLine.startsWith('### ') && !fullLine.startsWith('#### ')) {
      // Toggle off: kembali ke teks normal tanpa markup
      newLine = fullLine.replace(/^###\s+/, '');
    } else {
      // Hapus heading lama jika ada lalu ubah ke ### (H3)
      newLine = `### ${fullLine.replace(/^#+\s*/, '')}`;
    }

    const updated = ta.value.substring(0, lineStart) + newLine + ta.value.substring(lineEnd);
    updateMarkdownWithHistory(updated);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(lineStart, lineStart + newLine.length);
        updateFlyingToolbar();
      }
    }, 10);
  };

  // 5. Tombol Quote (Tanda Petik) - Siklus 3 Status:
  // Klik 1: Mengubah teks menjadi Blockquote biasa (> Teks)
  // Klik 2: Mengubahnya menjadi Pull Quote bergaya besar khas Medium (<blockquote class="pullquote">)
  // Klik 3: Mengembalikan menjadi teks paragraf normal
  const handleFlyingQuote = () => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
    let lineEnd = ta.value.indexOf('\n', e);
    if (lineEnd === -1) lineEnd = ta.value.length;

    const fullLine = ta.value.substring(lineStart, lineEnd);
    let newLine = '';

    if (fullLine.includes('pullquote') || fullLine.includes('<blockquote')) {
      // Status 3: Dari Pull Quote kembali ke normal
      newLine = fullLine
        .replace(/<blockquote class="pullquote">\s*/gi, '')
        .replace(/\s*<\/blockquote>/gi, '')
        .replace(/^>\s*/gm, '')
        .trim();
    } else if (fullLine.startsWith('> ')) {
      // Status 2: Dari Blockquote biasa ke Pull Quote bergaya besar
      const clean = fullLine.replace(/^>\s*/gm, '').trim();
      newLine = `<blockquote class="pullquote">\n${clean}\n</blockquote>`;
    } else {
      // Status 1: Dari teks biasa ke Blockquote biasa
      newLine = `> ${fullLine.trim()}`;
    }

    const updated = ta.value.substring(0, lineStart) + newLine + ta.value.substring(lineEnd);
    updateMarkdownWithHistory(updated);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(lineStart, lineStart + newLine.length);
        updateFlyingToolbar();
      }
    }, 10);
  };

  // 6. Tombol Daftar (List) - Siklus 3 Status:
  // Klik 1: Mengubah baris yang disorot menjadi Daftar Poin (Bullet List: - item)
  // Klik 2: Mengubah menjadi Daftar Angka (Numbered List: 1. item, 2. item, dst.)
  // Klik 3: Mengembalikan menjadi teks normal tanpa markup list
  const handleFlyingList = () => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
    let lineEnd = ta.value.indexOf('\n', e);
    if (lineEnd === -1) lineEnd = ta.value.length;

    const selectedBlock = ta.value.substring(lineStart, lineEnd);
    const lines = selectedBlock.split('\n');

    // Cek apakah blok saat ini sudah berupa numbered list atau bullet list
    const hasNumbered = lines.some(l => /^\s*\d+\.\s+/.test(l));
    const hasBullet = lines.some(l => /^\s*[-*+]\s+/.test(l));

    let newLines: string[] = [];

    if (hasNumbered) {
      // Siklus 3: Kembali ke teks normal tanpa markup list
      newLines = lines.map(line => line.replace(/^\s*\d+\.\s+/, ''));
    } else if (hasBullet) {
      // Siklus 2: Ubah dari bullet list menjadi daftar angka (1., 2., 3., dst.)
      let num = 1;
      newLines = lines.map(line => {
        const cleaned = line.replace(/^\s*[-*+]\s+/, '');
        if (cleaned.trim().length === 0) return line;
        return `${num++}. ${cleaned}`;
      });
    } else {
      // Siklus 1: Ubah menjadi daftar pin / bullet list (- item)
      newLines = lines.map(line => {
        if (line.trim().length === 0) return line;
        return `- ${line.replace(/^\s*#+\s*/, '').replace(/^\s*>\s*/, '').trim()}`;
      });
    }

    const replacement = newLines.join('\n');
    const updated = ta.value.substring(0, lineStart) + replacement + ta.value.substring(lineEnd);
    updateMarkdownWithHistory(updated);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(lineStart, lineStart + replacement.length);
        updateFlyingToolbar();
      }
    }, 10);
  };

  // 7. Tombol Penghapus Format ke Teks Normal Tanpa Markup
  const handleFlyingClearFormatting = () => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    if (s === e) return;

    // Cek apakah seleksi mencakup awal baris atau seluruh baris
    const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
    let lineEnd = ta.value.indexOf('\n', e);
    if (lineEnd === -1) lineEnd = ta.value.length;

    const isFullLineOrMulti =
      s === lineStart ||
      ta.value.substring(s, e).includes('\n') ||
      (s <= lineStart + 4 && /^[#>*\-+0-9. ]+$/.test(ta.value.substring(lineStart, s)));

    const targetStart = isFullLineOrMulti ? lineStart : s;
    const targetEnd = isFullLineOrMulti ? lineEnd : e;
    const rawText = ta.value.substring(targetStart, targetEnd);

    let cleaned = rawText
      // Hapus HTML blockquote / pullquote
      .replace(/<blockquote class="pullquote">\s*/gi, '')
      .replace(/<\/blockquote>/gi, '')
      .replace(/<\/?blockquote[^>]*>/gi, '')
      // Hapus link & gambar markdown
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Hapus format inline markdown
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/~~([^~]+)~~/g, '$1')
      .replace(/`([^`]+)`/g, '$1');

    if (isFullLineOrMulti) {
      cleaned = cleaned
        .split('\n')
        .map(line =>
          line
            .replace(/^#+\s*/, '')
            .replace(/^>\s*/, '')
            .replace(/^[-*+]\s+/, '')
            .replace(/^\d+\.\s+/, '')
            .replace(/^\[[ xX]\]\s+/, '')
        )
        .join('\n');
    }

    const updated = ta.value.substring(0, targetStart) + cleaned + ta.value.substring(targetEnd);
    updateMarkdownWithHistory(updated);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(targetStart, targetStart + cleaned.length);
        updateFlyingToolbar();
      }
    }, 10);
  };

  // 8. Tombol Link (Ikatan Rantai)
  const handleOpenFlyingLink = () => {
    setFlyingLinkMode(true);
    setFlyingLinkUrl('');
    setTimeout(() => {
      flyingLinkInputRef.current?.focus();
    }, 60);
  };

  const handleApplyFlyingLink = () => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const text = ta.value.substring(s, e).trim() || 'Link';
    let url = flyingLinkUrl.trim();

    if (url) {
      if (!/^https?:\/\//i.test(url) && !url.startsWith('#') && !url.startsWith('/')) {
        url = 'https://' + url;
      }
      const formatted = `[${text}](${url})`;
      const updated = ta.value.substring(0, s) + formatted + ta.value.substring(e);
      updateMarkdownWithHistory(updated);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(s, s + formatted.length);
        }
      }, 10);
    }

    setFlyingLinkMode(false);
    setFlyingLinkUrl('');
    setFlyingToolbar(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="space-y-6">

      {/* ======================================================== */}
      {/* MEDIUM-STYLE FLYING TOOLBAR (MELAYANG DI ATAS SELEKSI TEKS) */}
      {/* ======================================================== */}
      {flyingToolbar.visible && (
        <div
          ref={flyingToolbarRef}
          id="medium-flying-toolbar"
          style={{
            position: 'fixed',
            left: `${flyingToolbar.x}px`,
            top: `${flyingToolbar.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
          }}
          onMouseDown={(e) => {
            // Cegah textarea kehilangan fokus/seleksi saat tombol toolbar diklik
            if ((e.target as HTMLElement).tagName !== 'INPUT') {
              e.preventDefault();
            }
          }}
          className="flex items-center bg-[#242424] dark:bg-slate-950 text-white rounded-xl shadow-2xl ring-1 ring-white/10 px-2 py-1.5 transition-all duration-150 animate-in fade-in zoom-in-95"
        >
          {!flyingLinkMode ? (
            <div className="flex items-center gap-0.5">
              {/* Bold */}
              <button
                type="button"
                id="flying-btn-bold"
                onClick={handleFlyingBold}
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                  flyingToolbar.activeStates.bold
                    ? 'text-emerald-400 bg-white/15'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
                title="Tebalkan Teks (Bold)"
              >
                <strong className="font-black">B</strong>
              </button>

              {/* Italic */}
              <button
                type="button"
                id="flying-btn-italic"
                onClick={handleFlyingItalic}
                className={`w-8 h-8 rounded-lg flex items-center justify-center italic text-sm transition-colors ${
                  flyingToolbar.activeStates.italic
                    ? 'text-emerald-400 bg-white/15'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
                title="Miringkan Teks (Italic)"
              >
                <span className="font-serif italic text-base">i</span>
              </button>

              {/* Link */}
              <button
                type="button"
                id="flying-btn-link"
                onClick={handleOpenFlyingLink}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                title="Sisipkan Tautan (Link)"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>

              {/* H Besar (H2) */}
              <button
                type="button"
                id="flying-btn-h2"
                onClick={handleFlyingH2}
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-colors ${
                  flyingToolbar.activeStates.h2
                    ? 'text-emerald-400 bg-white/15'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
                title={
                  flyingToolbar.activeStates.h2
                    ? 'H2 Aktif (Klik lagi untuk kembali ke teks normal)'
                    : 'H Besar / Sub-judul (H2)'
                }
              >
                <span className="font-serif font-black text-base">H</span>
              </button>

              {/* H Kecil (H3) */}
              <button
                type="button"
                id="flying-btn-h3"
                onClick={handleFlyingH3}
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                  flyingToolbar.activeStates.h3
                    ? 'text-emerald-400 bg-white/15'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
                title={
                  flyingToolbar.activeStates.h3
                    ? 'H3 Aktif (Klik lagi untuk kembali ke teks normal)'
                    : 'H Kecil / Sub-judul Kecil (H3)'
                }
              >
                <span className="font-serif font-bold text-xs">H</span>
              </button>

              {/* Quote (Blockquote & Pull Quote) */}
              <button
                type="button"
                id="flying-btn-quote"
                onClick={handleFlyingQuote}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                  flyingToolbar.activeStates.quote || flyingToolbar.activeStates.pullquote
                    ? 'text-emerald-400 bg-white/15'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
                title={
                  flyingToolbar.activeStates.pullquote
                    ? 'Pull Quote Aktif (Klik untuk kembalikan ke teks biasa)'
                    : flyingToolbar.activeStates.quote
                    ? 'Blockquote Aktif (Klik untuk ubah jadi Pull Quote besar)'
                    : 'Kutipan (Klik 1x: Blockquote, Klik 2x: Pull Quote)'
                }
              >
                <span className="font-serif font-black text-base leading-none">&ldquo;&rdquo;</span>
              </button>

              {/* Divider */}
              <span className="w-px h-5 bg-white/20 mx-1"></span>

              {/* List / Daftar (Klik 1x: Poin Bullet, Klik 2x: Angka, Klik 3x: Normal) */}
              <button
                type="button"
                id="flying-btn-list"
                onClick={handleFlyingList}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                  flyingToolbar.activeStates.bulletList || flyingToolbar.activeStates.numberedList
                    ? 'text-emerald-400 bg-white/15'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
                title={
                  flyingToolbar.activeStates.numberedList
                    ? 'Daftar Angka Aktif (Klik lagi untuk kembali ke teks normal)'
                    : flyingToolbar.activeStates.bulletList
                    ? 'Daftar Poin Aktif (Klik lagi untuk ubah ke Daftar Angka)'
                    : 'Daftar (Klik 1x: Poin Bulat, Klik 2x: Angka, Klik 3x: Normal)'
                }
              >
                {flyingToolbar.activeStates.numberedList ? (
                  <ListOrdered className="w-3.5 h-3.5" />
                ) : (
                  <List className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Divider */}
              <span className="w-px h-5 bg-white/20 mx-1"></span>

              {/* Clear Formatting / Hapus Format Teks */}
              <button
                type="button"
                id="flying-btn-clear-format"
                onClick={handleFlyingClearFormatting}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-400 hover:bg-white/10 transition-colors"
                title="Hapus Semua Format (Kembali ke Teks Normal Tanpa Markup)"
              >
                <RemoveFormatting className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* INLINE LINK INPUT */
            <div className="flex items-center gap-1.5 px-1 py-0.5">
              <input
                ref={flyingLinkInputRef}
                type="url"
                value={flyingLinkUrl}
                onChange={(e) => setFlyingLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyFlyingLink();
                  } else if (e.key === 'Escape') {
                    setFlyingLinkMode(false);
                  }
                }}
                placeholder="Tempel URL tautan..."
                className="w-44 sm:w-56 px-2.5 py-1 text-xs bg-black/40 text-white rounded-lg border border-white/20 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={handleApplyFlyingLink}
                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                title="Terapkan Tautan"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setFlyingLinkMode(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Batal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Panah Segitiga Bawah / Atas (Arrow Pointer) */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 pointer-events-none ${
              flyingToolbar.showBelow
                ? '-top-1.5 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#242424] dark:border-b-slate-950'
                : '-bottom-1.5 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#242424] dark:border-t-slate-950'
            }`}
          />
        </div>
      )}
      
      {/* ------------------------------------------------------------- */}
      {/* EDITOR CONTROL BAR & STATUS (STICKY) */}
      {/* ------------------------------------------------------------- */}
      <div className={`sticky top-0 z-30 flex flex-col gap-2.5 p-3 sm:p-4 rounded-2xl md:rounded-3xl shadow-sm border transition-colors ${
        userRole === 'writer'
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-800'
          : 'bg-slate-900/95 backdrop-blur-md text-white border-slate-800 shadow-md'
      }`}>
        
        {/* BARIS ATAS: STATUS AUTOSAVE, ZEN MODE & TOMBOL AKSI UTAMA (SIMPAN DRAF, KIRIM, TERBITKAN) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
          {/* Sisi Kiri: Zen Mode & AutoSave */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-1.5">
              {setIsZenMode && (
                <button
                  type="button"
                  onClick={() => setIsZenMode(!isZenMode)}
                  title={isZenMode ? "Keluar dari Zen Mode (Tampilkan Sidebar)" : "Zen Mode (Sembunyikan Sidebar & Perluas Ruang Ketik)"}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center ${
                    isZenMode
                      ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                      : userRole === 'writer'
                        ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}
              {autoSaveStatus === 'saved' && (title && title.trim().length > 0) && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1 rounded-full truncate max-w-[260px]" title={title ? `Draf Tersimpan: "${title}"` : 'Draf Tersimpan'}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Draf Tersimpan{title ? `: "${title}"` : ''}</span>
                </span>
              )}
              {autoSaveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 px-3 py-1 rounded-full animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menyimpan draf...
                </span>
              )}
              {autoSaveStatus === 'dirty' && (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 px-3 py-1">
                  Perubahan belum disimpan...
                </span>
              )}
            </div>

            {/* Badge status artikel untuk mobile */}
            <span className={`sm:hidden px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
              currentStatus === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
              currentStatus === 'pending_approval' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
              currentStatus === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
              'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {currentStatus === 'published' ? 'Terbit' : currentStatus === 'pending_approval' ? 'Review' : currentStatus === 'rejected' ? 'Revisi' : 'Draf'}
            </span>
          </div>

          {/* Sisi Kanan: Save & Publish Role-Based Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* Simpan Draf (Soft Slate/Gray) */}
            <button
              type="button"
              onClick={() => onPublishSubmit('draft')}
              className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 text-xs font-bold transition-colors border border-slate-300/80 dark:border-slate-600 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Simpan Draf</span>
            </button>

            {/* Writer Specific Action (Emerald Green) */}
            {userRole === 'writer' && (
              <button
                type="button"
                onClick={() => onPublishSubmit('pending_approval')}
                className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim untuk Ditinjau 🚀</span>
              </button>
            )}

            {/* Editor & Admin Actions */}
            {(userRole === 'editor' || userRole === 'admin') && (
              <>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-xs font-bold transition-colors border border-rose-800/60 flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Tolak / Minta Revisi</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPublishSubmit('published')}
                  className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:from-emerald-500 hover:to-teal-500 shadow-md transition-colors flex items-center gap-1.5"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Setujui & Terbitkan ✅</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* BARIS KEDUA: TOMBOL STICKY TULIS DAN PRATINJAU DIBAWAHNYA (PALING SERING DIPAKAI PENULIS) */}
        <div className="w-full pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="grid grid-cols-2 md:flex md:items-center gap-2 w-full">
            {/* Tombol Tulis */}
            <button
              type="button"
              id="sticky-btn-tulis"
              onClick={() => setViewMode('write')}
              className={`w-full md:w-auto justify-center px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                viewMode === 'write'
                  ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-200 dark:ring-rose-950'
                  : userRole === 'writer'
                    ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Tulis</span>
            </button>

            {/* Tombol Bagi Layar (Split) - khusus layar tablet / desktop */}
            <button
              type="button"
              id="sticky-btn-split"
              onClick={() => setViewMode('split')}
              className={`hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'split'
                  ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-200 dark:ring-rose-950'
                  : userRole === 'writer'
                    ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Columns className="w-4 h-4" />
              <span>Bagi Layar</span>
            </button>

            {/* Tombol Pratinjau */}
            <button
              type="button"
              id="sticky-btn-pratinjau"
              onClick={() => setViewMode('preview')}
              className={`w-full md:w-auto justify-center px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                viewMode === 'preview'
                  ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-200 dark:ring-rose-950'
                  : userRole === 'writer'
                    ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Pratinjau</span>
            </button>
          </div>
        </div>
      </div>

      {/* REJECTION / WORKFLOW NOTIFICATION BANNER */}
      {currentStatus === 'rejected' && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-2xl p-4 flex items-start gap-3 text-rose-800 dark:text-rose-200 shadow-xs animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300">
              Artikel Perlu Revisi / Ditolak oleh Editor
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-200 leading-relaxed">
              {rejectionReason || 'Silakan tinjau kembali tata bahasa, sumber referensi, atau kelengkapan isi artikel ini sebelum mengajukan ulang.'}
            </p>
          </div>
        </div>
      )}

      {currentStatus === 'pending_approval' && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-center justify-between text-amber-900 dark:text-amber-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Send className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">Menunggu Ditinjau oleh Editor</h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-200/80">
                Artikel ini sudah dikirim dan saat ini berada di antrean moderasi Redaksi.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 px-2.5 py-1 rounded-full">
            Pending Approval
          </span>
        </div>
      )}

      {/* REJECTION REASON MODAL (FOR EDITORS / ADMINS) */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-sm font-bold">Minta Revisi / Tolak Artikel</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tuliskan catatan revisi atau alasan penolakan secara spesifik agar Penulis dapat memperbaiki artikel ini.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Catatan Revisi / Alasan Penolakan:
              </label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Contoh: Tolak artikel ini. Tambahkan referensi medis dan perbaiki penulisan istilah kesehatan."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  onPublishSubmit('rejected', rejectNote || 'Perlu perbaikan artikel.');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
              >
                Kirim Catatan Revisi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT EDITOR SECTION */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-6">
        
        {/* EDITOR AREA (FULL WIDTH) */}
        <div className="w-full space-y-4">
          <div className={`rounded-3xl p-5 sm:p-7 border transition-colors ${
            userRole === 'writer'
              ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100'
              : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-sm'
          } space-y-5`}>
            
            {/* TITLE FIELD */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Judul Artikel
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Panduan Lengkap & Strategi Terbaru..."
                className={`w-full px-4 py-3.5 rounded-2xl border text-lg font-extrabold transition-colors placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  userRole === 'writer'
                    ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-emerald-500/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-rose-500'
                }`}
              />
            </div>

            {/* SLUG & CATEGORY */}
            <div className={`grid grid-cols-1 ${userRole !== 'writer' ? 'sm:grid-cols-2' : ''} gap-4`}>
              {userRole !== 'writer' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="panduan-lengkap-strategi-terbaru"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Artikel
                </label>
                <input
                  type="text"
                  list="category-suggestions"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ketik atau pilih kategori (cth: Berita, Edukasi...)"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 ${
                    userRole === 'writer'
                      ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:ring-emerald-500/50'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:ring-rose-500'
                  }`}
                />
                <datalist id="category-suggestions">
                  <option value="Berita & Opini" />
                  <option value="Edukasi & Panduan" />
                  <option value="Kesehatan & Gizi" />
                  <option value="Gaya Hidup & Keluarga" />
                  <option value="Teknologi & Informasi" />
                  <option value="Pola Asuh" />
                  <option value="Umum" />
                </datalist>
              </div>
            </div>

            {/* POST TYPE SELECTION */}
            {setPostType && (
              <div className="pt-2">
                {!showAllFormats ? (
                  <div className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Format: <strong className="text-slate-700 dark:text-slate-300">
                        {postType === 'article' && '📝 Artikel Edukasi'}
                        {postType === 'interactive_configurator' && '🎛️ Widget Konfigurator'}
                        {postType === 'interactive_showcase' && '🏛️ Showcase Pilar'}
                        {postType === 'interactive_radar' && '🕸️ Roda Radar Profiling'}
                        {postType === 'interactive_quiz' && '🎓 Kuis IQ & Wawasan'}
                        {postType === 'interactive_timeline_slider' && '🎚️ Slider Skenario Waktu'}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAllFormats(true)}
                      className="font-extrabold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline transition-all flex items-center gap-1"
                    >
                      ✨ Ubah Format / Jenis Postingan
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Format / Jenis Postingan
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAllFormats(false)}
                        className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline transition-all flex items-center gap-1"
                      >
                        🙈 Sembunyikan Pilihan
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Default/Active Button: Artikel Edukasi */}
                      <button
                        type="button"
                        onClick={() => {
                          setPostType('article');
                          setShowAllFormats(false);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          postType === 'article'
                            ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">📝 Artikel Edukasi</div>
                        <div className="text-[10px] opacity-75 mt-0.5">Konten artikel standar dengan format Markdown penuh.</div>
                      </button>

                      {/* Configurator */}
                      <button
                        type="button"
                        onClick={() => {
                          setPostType('interactive_configurator');
                          setShowAllFormats(false);
                          if (!interactiveConfigurator) {
                            setInteractiveConfigurator({
                              title: 'Kalkulator Gizi & Pola Makan Anak',
                              description: 'Hitung kebutuhan nutrisi harian anak Anda berdasarkan usia, berat badan, dan aktivitas.',
                              criteria: [
                                { id: 'age', name: 'Usia Anak', placeholder: 'Pilih rentang usia...', options: ['6-12 bulan', '1-3 tahun', '4-6 tahun'] },
                                { id: 'weight', name: 'Berat Badan', placeholder: 'Pilih berat badan...', options: ['Ideal', 'Kurang', 'Berlebih'] },
                                { id: 'activity', name: 'Tingkat Aktivitas', placeholder: 'Pilih tingkat aktivitas...', options: ['Sangat Aktif', 'Normal', 'Kurang Aktif'] }
                              ],
                              recommendations: [
                                { age: '6-12 bulan', weight: 'Ideal', activity: 'Normal', recommendation: 'Lanjutkan ASI ditambah MPASI padat gizi seimbang dengan porsi kecil tapi sering.', title: 'Nutrisi ASI + MPASI Berimbang', category: 'Nutrisi' },
                                { age: '1-3 tahun', weight: 'Ideal', activity: 'Sangat Aktif', recommendation: 'Pastikan asupan protein 15g per hari dan karbohidrat yang cukup untuk mendukung energi eksploratifnya.', title: 'Asupan Protein & Energi Cukup', category: 'Nutrisi' }
                              ]
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          postType === 'interactive_configurator'
                            ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">🎛️ Widget Konfigurator</div>
                        <div className="text-[10px] opacity-75 mt-0.5">Widget interaktif dinamis dengan multi-kriteria kustom.</div>
                      </button>

                      {/* Showcase */}
                      <button
                        type="button"
                        onClick={() => {
                          setPostType('interactive_showcase');
                          setShowAllFormats(false);
                          if (!interactiveShowcase) {
                            setInteractiveShowcase({
                              title: '5 Pilar Pola Asuh Anak Hebat',
                              description: 'Jelajahi fondasi penting pengasuhan anak untuk membentuk kepribadian yang tangguh dan kreatif.',
                              pillars: [
                                {
                                  id: 'pillar-1',
                                  title: 'Komunikasi Penuh Welas Asih',
                                  icon: 'Heart',
                                  desc: 'Menghadirkan komunikasi yang berfokus pada empati, mendengarkan aktif tanpa menghakimi, dan menstabilkan regulasi emosi anak.',
                                  longDesc: 'Menghadirkan komunikasi yang berfokus pada empati, mendengarkan aktif tanpa menghakimi, dan menstabilkan regulasi emosi anak.',
                                  challengeTitle: 'TANTANGAN HARIAN KELUARGA',
                                  challenge: 'Tantangan Hari Ini: Dengarkan cerita si kecil selama 10 menit tanpa menyela atau memberi penilaian langsung.',
                                  tips: [
                                    'Gunakan kontak mata setinggi mata anak.',
                                    'Gunakan frasa empati seperti: "Ibu mengerti perasaanmu..."',
                                    'Dengarkan dengan saksama tanpa memegang gawai.'
                                  ],
                                  footnote: 'Membantu melatih koneksi emosional',
                                  methodology: 'Metodologi Ramah Anak'
                                },
                                {
                                  id: 'pillar-2',
                                  title: 'Waktu Berkualitas Terencana',
                                  icon: 'Clock',
                                  desc: 'Bukan tentang kuantitas jam, melainkan kehadiran penuh pikiran dan emosi (mindful presence) tanpa gangguan gadget.',
                                  longDesc: 'Bukan tentang kuantitas jam, melainkan kehadiran penuh pikiran dan emosi (mindful presence) tanpa gangguan gadget.',
                                  challengeTitle: 'TANTANGAN HARIAN KELUARGA',
                                  challenge: 'Tantangan Hari Ini: Matikan semua gawai selama 30 menit saat makan malam bersama keluarga.',
                                  tips: [
                                    'Buat rutinitas bebas layar harian.',
                                    'Lakukan satu aktivitas interaktif bersama anak seperti menggambar.',
                                    'Fokus pada pertukaran cerita ringan.'
                                  ],
                                  footnote: 'Meningkatkan rasa aman pada anak',
                                  methodology: 'Pengasuhan Responsif'
                                },
                                {
                                  id: 'pillar-3',
                                  title: 'Apresiasi & Dukungan Positif',
                                  icon: 'Award',
                                  desc: 'Memuji usaha dan proses belajar anak (growth mindset) alih-alih melulu fokus pada hasil akhir atau bakat bawaan.',
                                  longDesc: 'Memuji usaha dan proses belajar anak (growth mindset) alih-alih melulu fokus pada hasil akhir atau bakat bawaan.',
                                  challengeTitle: 'TANTANGAN HARIAN KELUARGA',
                                  challenge: 'Tantangan Hari Ini: Berikan pujian spesifik pada proses belajar anak saat merapikan mainannya sendiri.',
                                  tips: [
                                    'Ucapkan pujian yang spesifik: "Terima kasih sudah berusaha merapikan bukumu."',
                                    'Fokus pada kerja keras mereka, bukan hanya hasil.',
                                    'Dorong anak untuk berani mencoba kembali jika gagal.'
                                  ],
                                  footnote: 'Membentuk kepercayaan diri yang sehat',
                                  methodology: 'Penguatan Positif'
                                },
                                {
                                  id: 'pillar-4',
                                  title: 'Kesehatan Mental & Batasan Lembut',
                                  icon: 'Shield',
                                  desc: 'Menetapkan batasan aturan rumah secara konsisten, namun disampaikan dengan nada lembut, aman, dan penuh penjelasan logis.',
                                  longDesc: 'Menetapkan batasan aturan rumah secara konsisten, namun disampaikan dengan nada lembut, aman, dan penuh penjelasan logis.',
                                  challengeTitle: 'TANTANGAN HARIAN KELUARGA',
                                  challenge: 'Tantangan Hari Ini: Terapkan aturan batas layar (screen-time) dengan ketegasan yang ramah tanpa berteriak.',
                                  tips: [
                                    'Jelaskan alasan di balik aturan: \'Kita tidur cepat agar tubuhmu segar besok pagi.\'',
                                    'Berikan pilihan terbatas: \'Mau sikat gigi dulu atau ganti baju piyama dulu?\'',
                                    'Fokus pada solusi daripada sekadar menghukum kesalahan.'
                                  ],
                                  footnote: 'Membantu melatih regulasi diri',
                                  methodology: 'Metodologi Ramah Anak'
                                }
                              ]
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          postType === 'interactive_showcase'
                            ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">🏛️ Showcase Pilar</div>
                        <div className="text-[10px] opacity-75 mt-0.5">Showcase pilar asuh premium sesuai visual mockup figma.</div>
                      </button>

                      {/* Radar */}
                      <button
                        type="button"
                        onClick={() => {
                          setPostType('interactive_radar');
                          setShowAllFormats(false);
                          if (!interactiveRadar) {
                            setInteractiveRadar({
                              widgetTitle: 'Roda Radar Profiling Gaya Asuh',
                              widgetDescription: 'Geser slider pilar pengasuhan di bawah ini untuk melihat analisis profil asuh Anda secara instan pada grafik radar sebelah kanan.',
                              axes: [
                                { id: 'kesabaran', label: 'Kesabaran Menghadapi Anak', defaultValue: 5 },
                                { id: 'konsistensi', label: 'Konsistensi Aturan Rumah', defaultValue: 5 },
                                { id: 'komunikasi', label: 'Komunikasi Dua Arah', defaultValue: 9 },
                                { id: 'batasan_layar', label: 'Batasan Gadget (Screen-time)', defaultValue: 6 },
                                { id: 'nutrisi', label: 'Nutrisi & Pola Sehat', defaultValue: 9 }
                              ],
                              profiles: [
                                {
                                  profileName: 'Orang Tua Seimbang & Suportif (The Balanced Supporter)',
                                  minScores: { kesabaran: 5, konsistensi: 5, komunikasi: 5, batasan_layar: 5, nutrisi: 5 },
                                  description: 'Anda adalah pengasuh yang mengalir seimbang. Cukup baik dalam membagi peran antara bercanda, mendengarkan aktif, dan menjaga kebugaran tubuh sang buah hati.',
                                  primaryStrength: 'Menciptakan lingkungan keluarga yang harmonis dan demokratis.',
                                  criticalWeakness: 'Terkadang kurang tegas dalam situasi darurat atau terdesak.',
                                  actionSteps: [
                                    'Tetapkan konsekuensi logis secara konsisten tanpa tawar-menawar.',
                                    'Latih komunikasi tegas namun tetap penuh kasih.'
                                  ],
                                  cardThemeHex: '#FFF9F2'
                                },
                                {
                                  profileName: 'Orang Tua Penghibur yang Fleksibel (The Empathetic Companion)',
                                  minScores: { kesabaran: 7, konsistensi: 2, komunikasi: 8, batasan_layar: 2, nutrisi: 6 },
                                  description: 'Anda adalah sosok pendengar yang luar biasa hangat dan sabar. Anak merasa sangat aman bercerita kepada Anda. Namun, skor konsistensi dan batasan layar yang rendah menunjukkan Anda sering mengalah demi menghindari konflik instan.',
                                  primaryStrength: 'Tingkat empati yang tinggi membuat anak tumbuh dengan kecerdasan emosional yang matang dan rasa percaya diri yang kuat.',
                                  criticalWeakness: 'Anak rentan mengalami kebingungan aturan (disorientasi batasan) karena aturan rumah sering berubah tergantung situasi hati Anda.',
                                  actionSteps: [
                                    'Buat 3 aturan tertulis yang mutlak di rumah (misal: Tidak ada HP di meja makan) dan sepakati konsekuensinya bersama anak.',
                                    'Latih diri untuk berkata \'Tidak\' dengan nada lembut namun tetap teguh tanpa perlu merasa bersalah.'
                                  ],
                                  cardThemeHex: '#FEF5EE'
                                }
                              ]
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          postType === 'interactive_radar'
                            ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">🕸️ Roda Radar Profiling</div>
                        <div className="text-[10px] opacity-75 mt-0.5">Widget diagram radar interaktif N-axis dinamis real-time.</div>
                      </button>

                      {/* Quiz */}
                      <button
                        type="button"
                        onClick={() => {
                          setPostType('interactive_quiz');
                          setShowAllFormats(false);
                          if (!interactiveQuiz) {
                            setInteractiveQuiz({
                              widgetTitle: 'Uji Potensi Kognitif & Logika Psikologis',
                              widgetDescription: 'Asah daya analisis, logika, dan kemampuan berpikir deduktif Anda dengan tes ringan standar psikologi klinis di bawah ini.',
                              baseScore: 80,
                              pointsPerCorrect: 15,
                              questions: [
                                {
                                  id: 'q1',
                                  question: 'Perhatikan deret angka berikut: 2, 4, 8, 16, 32, ... Berapakah angka selanjutnya jika pola deret ini berlanjut secara logis?',
                                  category: 'Logika Numerik',
                                  options: [
                                    { text: '48', isCorrect: false },
                                    { text: '64', isCorrect: true },
                                    { text: '128', isCorrect: false },
                                    { text: '96', isCorrect: false }
                                  ]
                                },
                                {
                                  id: 'q2',
                                  question: 'Kaki berhubungan dengan Sepatu, sebagaimana Kepala berhubungan dengan...',
                                  category: 'Analogi Verbal',
                                  options: [
                                    { text: 'Sakit', isCorrect: false },
                                    { text: 'Topi', isCorrect: true },
                                    { text: 'Rambut', isCorrect: false },
                                    { text: 'Mata', isCorrect: false }
                                  ]
                                },
                                {
                                  id: 'q3',
                                  question: 'Jika semua mamalia menyusui anaknya, dan lumba-lumba adalah mamalia, kesimpulan deduktif yang mutlak adalah...',
                                  category: 'Penalaran Deduktif',
                                  options: [
                                    { text: 'Lumba-lumba pasti bernapas dengan paru-paru', isCorrect: false },
                                    { text: 'Lumba-lumba pasti menyusui anaknya', isCorrect: true },
                                    { text: 'Beberapa lumba-lumba tidak menyusui anaknya', isCorrect: false },
                                    { text: 'Lumba-lumba adalah sejenis ikan yang cerdas', isCorrect: false }
                                  ]
                                }
                              ]
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          postType === 'interactive_quiz'
                            ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">🎓 Kuis IQ & Wawasan Ringan</div>
                        <div className="text-[10px] opacity-75 mt-0.5">Komponen uji pemahaman bertingkat dengan kalkulasi skor otomatis.</div>
                      </button>

                      {/* Slider Skenario Waktu */}
                      <button
                        type="button"
                        onClick={() => {
                          setPostType('interactive_timeline_slider');
                          setShowAllFormats(false);
                          if (!interactiveTimelineSlider) {
                            setInteractiveTimelineSlider({
                              widgetTitle: 'Siklus Energi & Emosi Anak Sehari-hari',
                              widgetDescription: 'Geser slider di bawah ini untuk melihat bagaimana fluktuasi hormon biologis dan tingkat energi buah hati Anda berganti secara dinamis dari jam ke jam sepanjang hari.',
                              phases: [
                                {
                                  id: 'phase_1',
                                  label: 'Pagi Hari',
                                  timeLabel: '07:00 Pagi',
                                  fase: 'Pagi Hari (Kebasahan & Bangun Tanpa Drama)',
                                  kondisi_biologis_anak: 'Kadar kortisol (stres) anak alami kenaikan bertahap untuk membangunkan tubuh secara alami. Gula darah masih rendah.',
                                  tantangan_orang_tua: 'Anak merasa lemas, sering merengek, atau enggan beranjak dari tempat tidur.',
                                  visual_hex_color: '#FFFDF5',
                                  langkah_transisi_damai: [
                                    'Lakukan kontak fisik lembut: usapan di punggung atau pelukan hangat selama 2-3 menit sebelum mengajaknya bangun.',
                                    'Gunakan cahaya alami: buka tirai jendela kamar secara bertahap agar tubuhnya merespon sinyal pagi hari.',
                                    'Nyalakan musik instrumental ceria ber-volume rendah untuk menstimulasi mood positif.'
                                  ]
                                },
                                {
                                  id: 'phase_2',
                                  label: 'Siang Hari',
                                  timeLabel: '12:00 Siang',
                                  fase: 'Siang Hari (Jam Rawan Jam Bosan & Screen-Time)',
                                  kondisi_biologis_anak: 'Kadar gula darah mulai turun setelah energi pagi terkuras habis. Anak merasa lapar sekaligus lelah secara kognitif. Ini adalah puncak rawan kecanduan gadget (screen-time) demi mencari stimulan instan.',
                                  tantangan_orang_tua: 'Anak merengek meminta HP sambil berbaring lemas atau menolak makan siang sehat.',
                                  visual_hex_color: '#F9FBF9',
                                  langkah_transisi_damai: [
                                    'Sajikan potongan buah apel atau semangka dingin sebagai hidangan pembuka yang menyegarkan tubuh.',
                                    'Sediakan mainan sensorik mandiri (lego, playdough) di jangkauan pandangan mata anak.',
                                    'Terapkan ritual transisi tenang sebelum makan: cuci tangan bersama sambil menyanyi lagu lucu.'
                                  ]
                                },
                                {
                                  id: 'phase_3',
                                  label: 'Sore Hari',
                                  timeLabel: '17:00 Sore',
                                  fase: 'Sore Hari (Mandi & Persiapan Makan Malam)',
                                  kondisi_biologis_anak: 'Kadar kortisol (stres) anak mulai naik karena kelelahan setelah beraktivitas seharian, sementara gula darah mulai menurun. Ini adalah "jam rawan" tantrum.',
                                  tantangan_orang_tua: 'Menghadapi anak yang menolak mandi atau merengek meminta camilan manis sebelum makan malam.',
                                  visual_hex_color: '#FFF5F5',
                                  langkah_transisi_damai: [
                                    'Gunakan metode jembatan: "10 menit lagi kita balapan bebek di bak mandi yuk!", daripada langsung menyeret anak ke kamar mandi.',
                                    'Tawarkan pilihan terbatas yang terkontrol: "Mau mandi pakai sabun stroberi atau sabun melon harianmu?"',
                                    'Sediakan potongan buah kecil di meja sebagai pengganjal lapar yang aman sebelum makan malam utama.'
                                  ]
                                },
                                {
                                  id: 'phase_4',
                                  label: 'Malam Hari',
                                  timeLabel: '20:00 Malam',
                                  fase: 'Malam Hari (Ritual Tenang Sebelum Tidur)',
                                  kondisi_biologis_anak: 'Melatonin (hormon tidur) mulai diproduksi oleh kelenjar pineal seiring meredupnya cahaya sekitar. Suhu tubuh inti mulai menurun.',
                                  tantangan_orang_tua: 'Anak tiba-tiba aktif (second wind) atau menolak tidur karena masih ingin bermain.',
                                  visual_hex_color: '#F5F7FF',
                                  langkah_transisi_damai: [
                                    'Redupkan seluruh lampu rumah 1 jam sebelum tidur untuk memicu produksi melatonin secara maksimal.',
                                    'Bacakan 1 dongeng fabel favorit dengan intonasi suara yang lambat, berat, dan tenang.',
                                    'Lakukan teknik pernapasan balon bersama: tarik napas dalam dan hembuskan perlahan seolah meniup balon besar.'
                                  ]
                                }
                              ]
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          postType === 'interactive_timeline_slider'
                            ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">🎚️ Slider Skenario Waktu</div>
                        <div className="text-[10px] opacity-75 mt-0.5">Slider garis waktu horizontal untuk transisi fase dinamis.</div>
                      </button>

                      {/* Kartu Duel Komparasi */}
                      <button
                        type="button"
                        onClick={() => {
                          setPostType('interactive_battle_card');
                          setShowAllFormats(false);
                          if (!interactiveBattleCard) {
                            setInteractiveBattleCard({
                              widgetTitle: 'Susu Formula vs Air Susu Ibu (ASI): Analisis Objektif',
                              widgetDescription: 'Temukan perbandingan komparatif, ilmiah, dan objektif antara asupan ASI dan susu formula untuk tumbuh kembang anak.',
                              comparisonCriteria: ['Kandungan Nutrisi', 'Kemudahan Pemberian', 'Sistem Imunitas', 'Biaya Bulanan'],
                              optionA: {
                                name: 'Air Susu Ibu (ASI)',
                                badge: 'Standar Emas',
                                image: 'https://images.unsplash.com/photo-1594824813573-246434e33963?w=600&fit=crop&q=80',
                                summary: 'Nutrisi alami terlengkap yang diproduksi secara biologis oleh ibu, mengandung antibodi aktif yang tidak dapat ditiru oleh teknologi mana pun.',
                                strengths: [
                                  'Mengandung antibodi imunoglobulin aktif untuk kekebalan tubuh anak.',
                                  'Mudah dicerna dan meminimalkan risiko kembung atau sembelit.',
                                  'Mendukung bounding psikologis intim antara ibu dan buah hati.'
                                ],
                                weaknesses: [
                                  'Sangat bergantung pada kesehatan fisik, stres, dan nutrisi makanan ibu.',
                                  'Ibu harus selalu hadir secara fisik atau melakukan pompa ASI terjadwal.'
                                ],
                                bestFor: 'Sistem imun protektif & nutrisi biologis murni jangka panjang.',
                                rating: 5
                              },
                              optionB: {
                                name: 'Susu Formula (Sufor)',
                                badge: 'Alternatif Praktis',
                                image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&fit=crop&q=80',
                                summary: 'Asupan nutrisi alternatif hasil rekayasa ilmiah modern yang dirancang menyerupai ASI untuk menunjang kebutuhan gizi harian anak.',
                                strengths: [
                                  'Dapat diberikan oleh siapa saja (ayah, pengasuh, kakek-nenek).',
                                  'Memudahkan pemantauan takaran presisi volume susu yang dikonsumsi anak.',
                                  'Ibu tidak terikat waktu pompa atau pembatasan diet konsumsi harian.'
                                ],
                                weaknesses: [
                                  'Tidak mengandung antibodi hidup pelindung infeksi.',
                                  'Membutuhkan sterilisasi botol ekstra & pengeluaran biaya rutin.'
                                ],
                                bestFor: 'Ibu bekerja, kondisi medis khusus, atau pembagian peran pengasuhan fleksibel.',
                                rating: 4
                              },
                              verdictTitle: 'Keputusan Pengasuhan Cerdas',
                              verdictContent: 'ASI tetap merupakan asupan standar emas biologis utama untuk bayi 0-6 bulan. Namun, jika ada hambatan medis, susu formula modern adalah alternatif yang sangat aman dan mampu menopang tumbuh kembang fisik anak secara optimal tanpa mengurangi rasa cinta kasih ibu.'
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          postType === 'interactive_battle_card'
                            ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">⚔️ Kartu Duel Komparasi</div>
                        <div className="text-[10px] opacity-75 mt-0.5">Komparasi visual dua opsi atau pilar perbandingan pro & kontra.</div>
                      </button>

                      {/* Quiz Penentu Keputusan */}
                      <button
                        type="button"
                        onClick={() => {
                          setPostType('interactive_quiz_router');
                          setShowAllFormats(false);
                          if (!interactiveQuizRouter) {
                            setInteractiveQuizRouter({
                              widgetTitle: 'Evaluasi Gaya Pengasuhan (Parenting Style) Anda',
                              widgetDescription: 'Jawab 3 pertanyaan skenario harian berikut untuk memetakan jenis gaya pengasuhan dominan Anda dan temukan rekomendasi perbaikannya.',
                              questions: [
                                {
                                  id: 'q1',
                                  text: 'Bagaimana reaksi pertama Anda saat anak tidak sengaja menumpahkan segelas jus di karpet ruang tamu?',
                                  options: [
                                    { text: 'Marah seketika, menghukum anak, atau menyuruhnya masuk kamar.', targetOutcomeId: 'authoritarian' },
                                    { text: 'Menarik napas dalam, memvalidasi perasaannya, lalu mengajaknya membersihkan bersama.', targetOutcomeId: 'authoritative' },
                                    { text: 'Membiarkannya begitu saja atau langsung membersihkannya sendiri tanpa mengajak anak bicara.', targetOutcomeId: 'permissive' }
                                  ]
                                },
                                {
                                  id: 'q2',
                                  text: 'Bagaimana cara Anda membuat batasan aturan terkait screen-time (penggunaan HP/gadget) di rumah?',
                                  options: [
                                    { text: 'Membuat kesepakatan waktu bersama anak dengan konsekuensi logis yang jelas.', targetOutcomeId: 'authoritative' },
                                    { text: 'Melarang keras tanpa kompromi, mengunci HP, dan mengancam jika anak melanggar.', targetOutcomeId: 'authoritarian' },
                                    { text: 'Bebas kapan saja anak mau, asal anak tidak menangis atau mengganggu aktivitas Anda.', targetOutcomeId: 'permissive' }
                                  ]
                                },
                                {
                                  id: 'q3',
                                  text: 'Saat anak menolak makan sayur pada jam makan malam, apa tindakan yang paling sering Anda lakukan?',
                                  options: [
                                    { text: 'Menyuapinya dengan paksa atau mengancam tidak akan membelikan mainan.', targetOutcomeId: 'authoritarian' },
                                    { text: 'Tahu diri dan membiarkannya makan camilan manis kesukaannya agar perutnya terisi.', targetOutcomeId: 'permissive' },
                                    { text: 'Menghormati rasa kenyangnya, tapi tidak menyediakan camilan lain sampai jadwal makan berikutnya.', targetOutcomeId: 'authoritative' }
                                  ]
                                }
                              ],
                              outcomes: [
                                {
                                  id: 'authoritative',
                                  title: 'Gaya Demokratis (Authoritative Parenting)',
                                  description: 'Gaya pengasuhan paling ideal. Anda mampu memberikan batasan aturan yang tegas namun diimbangi dengan kehangatan emosi, komunikasi dua arah, dan validasi perasaan anak.',
                                  actionSteps: [
                                    'Pertahankan konsistensi kesepakatan konsekuensi di setiap situasi harian.',
                                    'Terus luangkan waktu 15 menit deep-talk dengan anak sebelum tidur malam.',
                                    'Apresiasi usaha positif anak, bukan sekadar menuntut hasil akhir sempurna.'
                                  ],
                                  badgeColor: '#10b981'
                                },
                                {
                                  id: 'authoritarian',
                                  title: 'Gaya Otoriter (Authoritarian Parenting)',
                                  description: 'Pengasuhan berfokus pada kepatuhan mutlak, hukuman fisik/verbal, dan minim kehangatan emosional. Anak rentan tumbuh menjadi pribadi yang cemas atau pemberontak di luar rumah.',
                                  actionSteps: [
                                    'Mulai kurangi intonasi suara keras dan ganti dengan kontak mata sejajar.',
                                    'Belajarlah memvalidasi emosi kecewa/sedih anak sebelum menuntut penjelasan.',
                                    'Berikan anak ruang untuk memilih pilihan sederhana (misal warna baju harian).'
                                  ],
                                  badgeColor: '#ef4444'
                                },
                                {
                                  id: 'permissive',
                                  title: 'Gaya Permisif (Permissive Parenting)',
                                  description: 'Sangat hangat dan penuh kasih sayang, namun minim batasan aturan atau kedisiplinan. Anak rentan tumbuh menjadi pribadi yang egois, sulit beradaptasi di sekolah, atau kecanduan gadget.',
                                  actionSteps: [
                                    'Buat jadwal rutinitas harian terstruktur (tidur, makan, belajar) bersama anak.',
                                    'Belajarlah mengatakan \'Tidak\' dengan ramah dan konsisten tanpa rasa bersalah.',
                                    'Terapkan konsekuensi logis saat kesepakatan aturan bersama dilanggar anak.'
                                  ],
                                  badgeColor: '#f59e0b'
                                }
                              ]
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          postType === 'interactive_quiz_router'
                            ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">🌳 Quiz Penentu Keputusan</div>
                        <div className="text-[10px] opacity-75 mt-0.5">Quiz diagnostik bertingkat untuk mencocokkan hasil rekomendasi profil secara instan.</div>
                      </button>

                      {/* Simulasi Kebiasaan */}
                      <button
                        type="button"
                        onClick={() => {
                          setPostType('interactive_habit_simulator');
                          setShowAllFormats(false);
                          if (!interactiveHabitSimulator) {
                            setInteractiveHabitSimulator({
                              widgetTitle: 'Simulasi Pembentukan Kebiasaan Membaca Buku pada Anak',
                              widgetDescription: 'Eksperimen pembentukan rutinitas membaca harian. Toggle kebiasaan sehat/buruk di bawah ini dan geser jumlah hari untuk mensimulasikan akumulasi dampaknya bagi kecerdasan kognitif anak.',
                              baselineScore: 50,
                              habits: [
                                {
                                  id: 'habit_1',
                                  label: 'Membaca Buku Dongeng 10 Menit',
                                  impactScore: 1.5,
                                  cue: 'Buku dongeng diletakkan di atas bantal tidur anak',
                                  response: 'Membacakan dongeng sebelum mematikan lampu kamar',
                                  reward: 'Anak tertidur dengan mood bahagia dan imajinasi kaya'
                                },
                                {
                                  id: 'habit_2',
                                  label: 'Screen-Time Gadget di Tempat Tidur',
                                  impactScore: -2,
                                  cue: 'HP di-charge di samping kasur anak',
                                  response: 'Anak bermain game/sosmed 1 jam sebelum tidur malam',
                                  reward: 'Stimulasi dopamin instan tapi memicu insomnia & kelelahan'
                                },
                                {
                                  id: 'habit_3',
                                  label: 'Deep Talk / Refleksi Harian 5 Menit',
                                  impactScore: 1,
                                  cue: 'Mandi sore & memakai minyak telon hangat',
                                  response: 'Mengobrol tentang momen paling berkesan hari ini',
                                  reward: 'Anak merasa dicintai, didengar, dan melatih kosakata baru'
                                }
                              ],
                              habitTips: [
                                'Jadikan buku terlihat mencolok (Visual Cue) dengan menaruhnya di area bermain utama anak.',
                                'Gunakan metode tumpuk habit: \'Setelah menyikat gigi malam (habit lama), kita akan langsung membaca 1 halaman buku bersama (habit baru)\'.',
                                'Fokus pada konsistensi durasi pendek (10 menit) terlebih dahulu, bukan tebalnya halaman buku.',
                                'Kurangi hambatan lingkungan dengan menjauhkan gadget dan mematikan TV 1 jam sebelum jam tidur malam anak.'
                              ]
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          postType === 'interactive_habit_simulator'
                            ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">⚡ Simulasi Kebiasaan</div>
                        <div className="text-[10px] opacity-75 mt-0.5">Simulator perilaku pembentukan kebiasaan harian dengan akumulasi skor.</div>
                      </button>

                      {/* Kolom Tanya Jawab / Advice Column */}
                      <button
                        type="button"
                        onClick={() => {
                          setPostType('interactive_qa_column');
                          setShowAllFormats(false);
                          if (!interactiveQaColumn) {
                            setInteractiveQaColumn({
                              widgetTitle: 'Kolom Tanya Jawab Klinis: Konsultasi Pola Asuh & Emosi',
                              widgetDescription: 'Tanyakan kecemasan Anda secara anonim. Tim psikolog klinis kami mengulas permasalahan Anda dengan kacamata klinis teruji.',
                              buttonText: 'Kirim Masalah Anda (Anonim)',
                              submissionPlaceholder: 'Tuliskan konflik anak, kecemasan hubungan pasutri, atau kelelahan mental pengasuhan yang Anda hadapi secara mendetail di sini...',
                              cases: [
                                {
                                  id: 'case_1',
                                  category: 'Komunikasi Anak',
                                  title: 'Anak Suka Menjawab dengan Kasar',
                                  senderAgeGender: 'Ibu (34 tahun)',
                                  questionText: 'Anak saya yang berumur 6 tahun belakangan ini sering sekali menjawab ucapan saya dengan nada ketus dan berteriak "Bukan urusan Ibu!". Bagaimana saya merespons ini tanpa ikut emosi?',
                                  expertName: 'Aisyah Siregar, M.Psi., Psikolog',
                                  expertTitle: 'Psikolog Klinis Anak & Keluarga',
                                  expertAvatar: '',
                                  analysisMarkdown: 'Sikap menantang pada usia 6 tahun sering kali merupakan tanda pencarian otonomi atau ekspresi ketidakmampuan meregulasi emosi frustrasi. Saat anak berteriak kasar, ia sedang mengetes batas kendali. Merespons dengan amarah hanya akan memvalidasi bahwa "teriakan" adalah bentuk komunikasi yang sah.',
                                  adviceSteps: [
                                    'Lakukan jeda napas 5 detik sebelum merespons agar emosi Anda stabil.',
                                    'Validasi emosi anak dengan tenang: "Ibu dengar kamu sedang kesal, tapi berbicara kasar tidak diperbolehkan."',
                                    'Diskusikan konsekuensi secara konsisten saat suasana hati anak sudah kembali tenang.',
                                    'Berikan pujian yang tulus saat anak mampu mengekspresikan penolakan dengan sopan.'
                                  ]
                                }
                              ]
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          postType === 'interactive_qa_column'
                            ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">💬 Kolom Tanya Jawab Ahli</div>
                        <div className="text-[10px] opacity-75 mt-0.5">Analisis klinis masalah & dilema pembaca oleh psikolog klinis berlisensi.</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (setPostType) setPostType('interactive_event_listing');
                          setShowAllFormats(false);
                          if (!interactiveEventListing && setInteractiveEventListing) {
                            setInteractiveEventListing({
                              eventTitle: title || 'Webinar & Lokakarya Eksklusif: Tren & Inovasi 2026',
                              eventType: 'webinar',
                              eventFormat: 'online',
                              startDate: '2026-10-25T09:00',
                              endDate: '2026-10-25T12:00',
                              timezone: 'WIB',
                              locationName: 'Zoom Webinar & YouTube Live',
                              locationAddress: '',
                              mapUrl: '',
                              onlineJoinUrl: 'https://zoom.us/j/1234567890',
                              quotaStatus: 'early_bird',
                              quotaCapacity: 100,
                              quotaRegistered: 65,
                              price: 'Gratis',
                              originalPrice: 'Rp 150.000',
                              registrationUrl: 'https://forms.gle/sample-event-registration',
                              registrationCtaText: 'Daftar Sekarang (Early Bird)',
                              registrationDeadline: '24 Oktober 2026, 23:59 WIB',
                              speakers: [
                                {
                                  name: 'Dr. Hendra Wijaya, M.Kom',
                                  role: 'Pakar Transformasi & Peneliti Senior',
                                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                                  bio: 'Praktisi dan peneliti dengan pengalaman lebih dari 15 tahun di bidang transformasi digital dan inovasi.'
                                }
                              ],
                              agenda: [
                                {
                                  time: '09:00 - 09:15',
                                  topic: 'Pembukaan & Pengantar Resmi Panitia',
                                  speaker: 'Tim Pelaksana'
                                },
                                {
                                  time: '09:15 - 10:45',
                                  topic: 'Sesi Materi Utama: Transformasi, Tren, dan Best Practices',
                                  speaker: 'Dr. Hendra Wijaya, M.Kom'
                                },
                                {
                                  time: '10:45 - 11:45',
                                  topic: 'Diskusi Interaktif & Tanya Jawab Langsung Peserta',
                                  speaker: 'Narasumber & Moderator'
                                },
                                {
                                  time: '11:45 - 12:00',
                                  topic: 'Penutupan, Sertifikat & Dokumentasi Bersama',
                                  speaker: 'Panitia'
                                }
                              ],
                              benefits: [
                                'E-Sertifikat Resmi Kehadiran',
                                'Slide Presentasi & Rangkuman Materi PDF',
                                'Akses Rekaman Video Sesi Penuh',
                                'Grup Diskusi & Komunitas Eksklusif'
                              ],
                              contactPersonPhone: '081234567890',
                              contactPersonName: 'Panitia Pendaftaran'
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          postType === 'interactive_event_listing'
                            ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">📅 Acara & Agenda / Webinar</div>
                        <div className="text-[10px] opacity-75 mt-0.5">Countdown, Google/iCal calendar, pembicara, kuota, rundown & Google Event Schema.</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (setPostType) setPostType('interactive_glossary_dictionary');
                          setShowAllFormats(false);
                          if (!interactiveGlossaryDictionary && setInteractiveGlossaryDictionary) {
                            setInteractiveGlossaryDictionary({
                              widgetTitle: title || 'Kamus Glosarium Istilah & Definisi A–Z',
                              widgetDescription: 'Glosarium istilah penting, singkatan, dan pustaka definisi terverifikasi.',
                              searchPlaceholder: 'Cari istilah, definisi, atau singkatan...',
                              autoLinkMaxPerTerm: 2,
                              minTermLength: 3,
                              caseSensitive: false,
                              categories: ['Umum', 'Medis & Kesehatan', 'Nutrisi', 'Psikologi'],
                              terms: [
                                {
                                  id: 'term-stunting',
                                  term: 'Stunting',
                                  slug: 'stunting',
                                  category: 'Medis & Kesehatan',
                                  shortDefinition: 'Kondisi gagal tumbuh pada anak balita akibat kekurangan gizi kronis.',
                                  longDefinition: 'Stunting adalah masalah gizi kronis yang disebabkan oleh kurangnya asupan gizi dalam jangka waktu yang lama, umumnya dimulai sejak masa kehamilan hingga anak berusia 2 tahun (1000 Hari Pertama Kehidupan).',
                                  aliases: ['Gagal Tumbuh Balita', 'Gizi Kronis Anak'],
                                  examples: ['Deteksi dini tinggi badan anak balita di posyandu.', 'Pencegahan stunting dengan pemberian ASI eksklusif dan MPASI tinggi protein.'],
                                  sources: ['WHO Nutrition Guidelines', 'Kementerian Kesehatan RI'],
                                  relatedTermIds: ['term-mpasi'],
                                  isPublished: true
                                },
                                {
                                  id: 'term-mpasi',
                                  term: 'MPASI',
                                  slug: 'mpasi',
                                  category: 'Nutrisi',
                                  shortDefinition: 'Makanan Pendamping Air Susu Ibu yang diberikan mulai usia 6 bulan.',
                                  longDefinition: 'MPASI (Makanan Pendamping ASI) adalah makanan atau minuman yang mengandung zat gizi yang diberikan kepada bayi berusia 6–24 bulan guna memenuhi kebutuhan gizi selain dari ASI.',
                                  aliases: ['Makanan Pendamping ASI'],
                                  examples: ['Pemberian MPASI adekuat yang kaya zat besi sejak usia 6 bulan.'],
                                  sources: ['Ikatan Dokter Anak Indonesia (IDAI)'],
                                  relatedTermIds: ['term-stunting'],
                                  isPublished: true
                                }
                              ]
                            });
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          postType === 'interactive_glossary_dictionary'
                            ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">📚 Kamus Glosarium & Istilah (A–Z)</div>
                        <div className="text-[10px] opacity-75 mt-0.5">Indeks A–Z, pencarian instan, filter kategori, auto-linking artikel, & DefinedTermSet Schema.</div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* INTERACTIVE FORM PANEL: CONFIGURATOR */}
            {postType === 'interactive_configurator' && interactiveConfigurator && (
              <div className="p-5 rounded-2xl border border-rose-100 dark:border-slate-800 bg-rose-500/[0.02] dark:bg-slate-900/50 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-base">🎛️</span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Pengaturan Widget Konfigurator Interaktif</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Judul Widget</label>
                    <input
                      type="text"
                      value={interactiveConfigurator.title || ''}
                      onChange={(e) => handleUpdateConfigurator({ title: e.target.value })}
                      placeholder="Cth: Kalkulator Gizi & Pola Makan Anak"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Deskripsi Widget</label>
                    <input
                      type="text"
                      value={interactiveConfigurator.description || ''}
                      onChange={(e) => handleUpdateConfigurator({ description: e.target.value })}
                      placeholder="Cth: Hitung kebutuhan nutrisi harian anak Anda..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                {/* CRITERIA SECTION */}
                <div className="space-y-3 pt-2">
                  <h5 className="font-extrabold text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider">Kriteria Pilihan (Maksimal 3)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(interactiveConfigurator.criteria || []).map((crit: any, critIdx: number) => (
                      <div key={crit.id || critIdx} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                          <span>Kriteria {critIdx + 1} ({crit.id})</span>
                        </div>
                        <input
                          type="text"
                          value={crit.name || ''}
                          onChange={(e) => {
                            const newCriteria = [...interactiveConfigurator.criteria];
                            newCriteria[critIdx] = { ...crit, name: e.target.value };
                            handleUpdateConfigurator({ criteria: newCriteria });
                          }}
                          placeholder="Nama Kriteria (Cth: Usia Anak)"
                          className="w-full px-2 py-1.5 rounded-lg border text-[11px] font-bold"
                        />
                        <input
                          type="text"
                          value={crit.placeholder || ''}
                          onChange={(e) => {
                            const newCriteria = [...interactiveConfigurator.criteria];
                            newCriteria[critIdx] = { ...crit, placeholder: e.target.value };
                            handleUpdateConfigurator({ criteria: newCriteria });
                          }}
                          placeholder="Placeholder (Cth: Pilih rentang usia...)"
                          className="w-full px-2 py-1.5 rounded-lg border text-[10px]"
                        />
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Pilihan (pisahkan koma)</label>
                          <input
                            type="text"
                            value={Array.isArray(crit.options) ? crit.options.join(', ') : ''}
                            onChange={(e) => {
                              const newCriteria = [...interactiveConfigurator.criteria];
                              newCriteria[critIdx] = { 
                                ...crit, 
                                options: e.target.value.split(',').map((v: string) => v.trim()).filter((v: string) => v !== '') 
                              };
                              handleUpdateConfigurator({ criteria: newCriteria });
                            }}
                            placeholder="Cth: Opsi A, Opsi B, Opsi C"
                            className="w-full px-2 py-1 rounded-lg border text-[10px] font-mono text-slate-800 dark:text-slate-100 bg-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RECOMMENDATIONS MAPPING */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-extrabold text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider">Hasil Rekomendasi Berdasarkan Pilihan</h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newRecs = [...(interactiveConfigurator.recommendations || [])];
                        const defaultMapping: any = {};
                        (interactiveConfigurator.criteria || []).forEach((c: any) => {
                          defaultMapping[c.id] = c.options?.[0] || '';
                        });
                        newRecs.push({
                          ...defaultMapping,
                          title: 'Rekomendasi Baru',
                          category: 'Tips',
                          recommendation: 'Tulis isi saran atau solusi interaktif di sini...'
                        });
                        handleUpdateConfigurator({ recommendations: newRecs });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px]"
                    >
                      + Tambah Aturan Hasil
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {(interactiveConfigurator.recommendations || []).map((rec: any, recIdx: number) => (
                      <div key={recIdx} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 relative group">
                        <button
                          type="button"
                          onClick={() => {
                            const newRecs = (interactiveConfigurator.recommendations || []).filter((_: any, idx: number) => idx !== recIdx);
                            handleUpdateConfigurator({ recommendations: newRecs });
                          }}
                          className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Hapus Rekomendasi"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        {/* Dropdowns to match criteria options */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                          {(interactiveConfigurator.criteria || []).map((crit: any) => (
                            <div key={crit.id} className="space-y-0.5">
                              <label className="block text-[9px] text-slate-400 font-bold">{crit.name}</label>
                              <select
                                value={rec[crit.id] || ''}
                                onChange={(e) => {
                                  const newRecs = [...interactiveConfigurator.recommendations];
                                  newRecs[recIdx] = { ...rec, [crit.id]: e.target.value };
                                  handleUpdateConfigurator({ recommendations: newRecs });
                                }}
                                className="w-full p-1 rounded-lg border text-[10px] font-semibold bg-white dark:bg-slate-800"
                              >
                                <option value="">Semua Opsi</option>
                                {(crit.options || []).map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>

                        {/* Title, Category, Content of Advice */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              value={rec.title || ''}
                              onChange={(e) => {
                                const newRecs = [...interactiveConfigurator.recommendations];
                                newRecs[recIdx] = { ...rec, title: e.target.value };
                                handleUpdateConfigurator({ recommendations: newRecs });
                              }}
                              placeholder="Judul Rekomendasi (Cth: Stimulasi Motorik Halus)"
                              className="w-full px-2.5 py-1.5 rounded-lg border text-[11px] font-bold"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={rec.category || ''}
                              onChange={(e) => {
                                const newRecs = [...interactiveConfigurator.recommendations];
                                newRecs[recIdx] = { ...rec, category: e.target.value };
                                handleUpdateConfigurator({ recommendations: newRecs });
                              }}
                              placeholder="Kategori (Cth: Stimulasi / Nutrisi)"
                              className="w-full px-2.5 py-1.5 rounded-lg border text-[11px] font-bold text-rose-600 dark:text-rose-400"
                            />
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          value={rec.recommendation || ''}
                          onChange={(e) => {
                            const newRecs = [...interactiveConfigurator.recommendations];
                            newRecs[recIdx] = { ...rec, recommendation: e.target.value };
                            handleUpdateConfigurator({ recommendations: newRecs });
                          }}
                          placeholder="Tuliskan saran rekomendasi spesifik atau tindakan nyata di sini..."
                          className="w-full p-2.5 rounded-lg border text-[10px] leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIVE FORM PANEL: PILLAR SHOWCASE */}
            {postType === 'interactive_showcase' && interactiveShowcase && (
              <div className="p-5 rounded-2xl border border-rose-100 dark:border-slate-800 bg-rose-500/[0.02] dark:bg-slate-900/50 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-base">🏛️</span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Pengaturan Showcase Pilar Interaktif</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Judul Showcase</label>
                    <input
                      type="text"
                      value={interactiveShowcase.title || ''}
                      onChange={(e) => handleUpdateShowcase({ title: e.target.value })}
                      placeholder="Cth: 5 Pilar Pola Asuh Anak Hebat"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Deskripsi Singkat</label>
                    <input
                      type="text"
                      value={interactiveShowcase.description || ''}
                      onChange={(e) => handleUpdateShowcase({ description: e.target.value })}
                      placeholder="Cth: Jelajahi fondasi penting pengasuhan anak..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                {/* PILLARS SECTION */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-extrabold text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider">Daftar Pilar / Tab Navigasi</h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newPillars = [...(interactiveShowcase.pillars || [])];
                        newPillars.push({
                          id: `pillar-${Date.now()}`,
                          title: 'Pilar Baru',
                          icon: 'Heart',
                          content: 'Tulis isi penjelasan pilar secara detail di sini...'
                        });
                        handleUpdateShowcase({ pillars: newPillars });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px]"
                    >
                      + Tambah Pilar Baru
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {(interactiveShowcase.pillars || []).map((pillar: any, pillIdx: number) => (
                      <div key={pillar.id || pillIdx} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 relative group">
                        <button
                          type="button"
                          onClick={() => {
                            const newPillars = (interactiveShowcase.pillars || []).filter((_: any, idx: number) => idx !== pillIdx);
                            handleUpdateShowcase({ pillars: newPillars });
                          }}
                          className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Hapus Pilar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Judul Pilar / Tab</label>
                            <input
                              type="text"
                              value={pillar.title || ''}
                              onChange={(e) => {
                                const newPillars = [...interactiveShowcase.pillars];
                                newPillars[pillIdx] = { ...pillar, title: e.target.value };
                                handleUpdateShowcase({ pillars: newPillars });
                              }}
                              placeholder="Cth: Komunikasi Empatis"
                              className="w-full px-2.5 py-1.5 rounded-lg border text-[11px] font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Simbol Ikon (Lucide)</label>
                            <select
                              value={pillar.icon || 'Heart'}
                              onChange={(e) => {
                                const newPillars = [...interactiveShowcase.pillars];
                                newPillars[pillIdx] = { ...pillar, icon: e.target.value };
                                handleUpdateShowcase({ pillars: newPillars });
                              }}
                              className="w-full p-1.5 rounded-lg border text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                            >
                              <option value="Heart">❤️ Heart</option>
                              <option value="Clock">🕒 Clock</option>
                              <option value="Shield">🛡️ Shield</option>
                              <option value="Zap">⚡ Zap</option>
                              <option value="Award">🏆 Award</option>
                              <option value="Users">👥 Users</option>
                              <option value="Brain">🧠 Brain</option>
                              <option value="Book">📖 Book</option>
                              <option value="Activity">📈 Activity</option>
                              <option value="Star">⭐️ Star</option>
                              <option value="FileText">📄 Document</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Deskripsi Singkat Tab (Kiri)</label>
                          <input
                            type="text"
                            value={pillar.desc || ''}
                            onChange={(e) => {
                              const newPillars = [...interactiveShowcase.pillars];
                              newPillars[pillIdx] = { ...pillar, desc: e.target.value };
                              handleUpdateShowcase({ pillars: newPillars });
                            }}
                            placeholder="Cth: Penjelasan ringkas untuk sub-bagian ini..."
                            className="w-full px-2.5 py-1.5 rounded-lg border text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Detail Penjelasan Utama (Kanan)</label>
                          <textarea
                            rows={3}
                            value={pillar.longDesc || pillar.content || ''}
                            onChange={(e) => {
                              const newPillars = [...interactiveShowcase.pillars];
                              newPillars[pillIdx] = { 
                                ...pillar, 
                                longDesc: e.target.value,
                                content: e.target.value 
                              };
                              handleUpdateShowcase({ pillars: newPillars });
                            }}
                            placeholder="Cth: Tulis rincian mendalam, pembahasan materi, analisis, atau detail pilar..."
                            className="w-full p-2.5 rounded-lg border text-[11px] leading-relaxed"
                          />
                        </div>

                        {/* CHALLENGE AND TIPS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div>
                            <label className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mb-0.5">Judul Kotak Highlight / Fokus</label>
                            <input
                              type="text"
                              value={pillar.challengeTitle || 'FOKUS / HIGHLIGHT UTAMA'}
                              onChange={(e) => {
                                const newPillars = [...interactiveShowcase.pillars];
                                newPillars[pillIdx] = { ...pillar, challengeTitle: e.target.value };
                                handleUpdateShowcase({ pillars: newPillars });
                              }}
                              placeholder="Cth: REKOMENDASI UTAMA / TARGET HARIAN"
                              className="w-full px-2 py-1 rounded-lg border text-[10px] font-bold"
                            />
                            <label className="block text-[9px] text-slate-400 font-bold mt-1.5 mb-0.5">Isi Kotak Highlight / Pesan Kunci</label>
                            <textarea
                              rows={2}
                              value={pillar.challenge || ''}
                              onChange={(e) => {
                                const newPillars = [...interactiveShowcase.pillars];
                                newPillars[pillIdx] = { ...pillar, challenge: e.target.value };
                                handleUpdateShowcase({ pillars: newPillars });
                              }}
                              placeholder="Cth: Berikan pesan kunci yang langsung menyoroti fokus bagian ini..."
                              className="w-full p-2 rounded-lg border text-[10px] leading-relaxed"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] text-rose-600 dark:text-rose-400 font-bold mb-0.5">Poin Rincian & Langkah Detail (Satu Per Baris)</label>
                            <textarea
                              rows={4}
                              value={Array.isArray(pillar.tips) ? pillar.tips.join('\n') : ''}
                              onChange={(e) => {
                                const newPillars = [...interactiveShowcase.pillars];
                                newPillars[pillIdx] = { 
                                  ...pillar, 
                                  tips: e.target.value.split('\n').map((v: string) => v.trim()).filter((v: string) => v !== '') 
                                };
                                handleUpdateShowcase({ pillars: newPillars });
                              }}
                              placeholder="Cth: Langkah pertama yang diperlukan&#10;Langkah kedua berikutnya&#10;Catatan pendukung tambahan"
                              className="w-full p-2 rounded-lg border text-[10px] leading-relaxed font-mono"
                            />
                          </div>
                        </div>

                        {/* FOOTNOTE AND METHODOLOGY */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Catatan Kaki Kiri Bawah (💡 Keterangan)</label>
                            <input
                              type="text"
                              value={pillar.footnote || ''}
                              onChange={(e) => {
                                const newPillars = [...interactiveShowcase.pillars];
                                newPillars[pillIdx] = { ...pillar, footnote: e.target.value };
                                handleUpdateShowcase({ pillars: newPillars });
                              }}
                              placeholder="Cth: Memberikan dampak efisiensi jangka panjang"
                              className="w-full px-2.5 py-1.5 rounded-lg border text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Label Klasifikasi Kanan Bawah (🏷️ Klasifikasi/Metode)</label>
                            <input
                              type="text"
                              value={pillar.methodology || ''}
                              onChange={(e) => {
                                const newPillars = [...interactiveShowcase.pillars];
                                newPillars[pillIdx] = { ...pillar, methodology: e.target.value };
                                handleUpdateShowcase({ pillars: newPillars });
                              }}
                              placeholder="Cth: Metodologi Ramah Anak"
                              className="w-full px-2.5 py-1.5 rounded-lg border text-[10px] font-bold text-teal-600 dark:text-teal-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIVE FORM PANEL: RADAR WHEEL / PROFILING ENGINE */}
            {postType === 'interactive_radar' && interactiveRadar && (
              <div className="p-5 rounded-2xl border border-rose-100 dark:border-slate-800 bg-rose-500/[0.02] dark:bg-slate-900/50 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-base">🕸️</span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Pengaturan Roda Radar Profiling Interaktif</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Judul Roda Radar / Widget</label>
                    <input
                      type="text"
                      value={interactiveRadar.widgetTitle || ''}
                      onChange={(e) => handleUpdateRadar({ widgetTitle: e.target.value })}
                      placeholder="Cth: Roda Radar Profiling Gaya Asuh"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Deskripsi Petunjuk/Analisis</label>
                    <input
                      type="text"
                      value={interactiveRadar.widgetDescription || ''}
                      onChange={(e) => handleUpdateRadar({ widgetDescription: e.target.value })}
                      placeholder="Cth: Geser slider pilar pengasuhan di bawah..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                {/* AXES DEFINITION */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <h5 className="font-extrabold text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider">Definisi Sumbu Radar (5-6 Sumbu Ideal)</h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newAxes = [...(interactiveRadar.axes || [])];
                        const uniqueId = `axis_${Date.now().toString().slice(-4)}`;
                        newAxes.push({
                          id: uniqueId,
                          label: 'Dimensi Baru',
                          defaultValue: 5
                        });
                        handleUpdateRadar({ axes: newAxes });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px]"
                    >
                      + Tambah Sumbu
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(interactiveRadar.axes || []).map((axis: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-100 dark:border-zinc-850 bg-white dark:bg-zinc-900/50 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-rose-500 uppercase">Sumbu #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newAxes = (interactiveRadar.axes || []).filter((_: any, i: number) => i !== idx);
                              handleUpdateRadar({ axes: newAxes });
                            }}
                            className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline"
                          >
                            Hapus
                          </button>
                        </div>
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-4">
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">ID Sumbu (Unik)</label>
                            <input
                              type="text"
                              value={axis.id || ''}
                              onChange={(e) => {
                                const newAxes = [...interactiveRadar.axes];
                                newAxes[idx] = { ...axis, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') };
                                handleUpdateRadar({ axes: newAxes });
                              }}
                              placeholder="Cth: kesabaran"
                              className="w-full px-2 py-1 rounded-lg border text-[10px] font-mono"
                            />
                          </div>
                          <div className="col-span-5">
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Nama Label Sumbu</label>
                            <input
                              type="text"
                              value={axis.label || ''}
                              onChange={(e) => {
                                const newAxes = [...interactiveRadar.axes];
                                newAxes[idx] = { ...axis, label: e.target.value };
                                handleUpdateRadar({ axes: newAxes });
                              }}
                              placeholder="Cth: Kesabaran"
                              className="w-full px-2 py-1 rounded-lg border text-[10px] font-bold"
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Nilai Awal (1-10)</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={axis.defaultValue ?? 5}
                              onChange={(e) => {
                                const newAxes = [...interactiveRadar.axes];
                                newAxes[idx] = { ...axis, defaultValue: parseInt(e.target.value) || 5 };
                                handleUpdateRadar({ axes: newAxes });
                              }}
                              className="w-full px-2 py-1 rounded-lg border text-[10px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PROFILING ENGINE RESULTS (PROFILES) */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <h5 className="font-extrabold text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider">Hasil Profiling & Rekomendasi Pintar</h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newProfiles = [...(interactiveRadar.profiles || [])];
                        newProfiles.push({
                          profileName: 'Profil Baru',
                          minScores: {},
                          description: 'Penjelasan umum profil di sini...',
                          primaryStrength: 'Kekuatan utama...',
                          criticalWeakness: 'Area perbaikan...',
                          actionSteps: ['Saran tindakan 1'],
                          cardThemeHex: '#FFF9F2'
                        });
                        handleUpdateRadar({ profiles: newProfiles });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px]"
                    >
                      + Tambah Profil Baru
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(interactiveRadar.profiles || []).map((profile: any, pIdx: number) => (
                      <div key={pIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 space-y-3 shadow-2xs">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                          <span className="text-[11px] font-black text-rose-500 uppercase">Profil Hasil #{pIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newProfiles = (interactiveRadar.profiles || []).filter((_: any, i: number) => i !== pIdx);
                              handleUpdateRadar({ profiles: newProfiles });
                            }}
                            className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline"
                          >
                            Hapus Profil Ini
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Nama Profil</label>
                            <input
                              type="text"
                              value={profile.profileName || ''}
                              onChange={(e) => {
                                const newProfiles = [...interactiveRadar.profiles];
                                newProfiles[pIdx] = { ...profile, profileName: e.target.value };
                                handleUpdateRadar({ profiles: newProfiles });
                              }}
                              placeholder="Cth: Orang Tua Seimbang & Suportif"
                              className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Warna Latar Belakang Kartu (HEX)</label>
                            <input
                              type="text"
                              value={profile.cardThemeHex || '#FFF9F2'}
                              onChange={(e) => {
                                const newProfiles = [...interactiveRadar.profiles];
                                newProfiles[pIdx] = { ...profile, cardThemeHex: e.target.value };
                                handleUpdateRadar({ profiles: newProfiles });
                              }}
                              placeholder="Cth: #FFF9F2"
                              className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Deskripsi Lengkap Profil</label>
                          <textarea
                            rows={2}
                            value={profile.description || ''}
                            onChange={(e) => {
                              const newProfiles = [...interactiveRadar.profiles];
                              newProfiles[pIdx] = { ...profile, description: e.target.value };
                              handleUpdateRadar({ profiles: newProfiles });
                            }}
                            placeholder="Tuliskan analisis profil di sini..."
                            className="w-full p-2.5 rounded-lg border text-[11px]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mb-0.5">💪 Kekuatan Utama</label>
                            <input
                              type="text"
                              value={profile.primaryStrength || ''}
                              onChange={(e) => {
                                const newProfiles = [...interactiveRadar.profiles];
                                newProfiles[pIdx] = { ...profile, primaryStrength: e.target.value };
                                handleUpdateRadar({ profiles: newProfiles });
                              }}
                              placeholder="Kekuatan utama profil ini..."
                              className="w-full px-2.5 py-1.5 rounded-lg border text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-rose-600 dark:text-rose-400 font-bold mb-0.5">⚠️ Area Perbaikan</label>
                            <input
                              type="text"
                              value={profile.criticalWeakness || ''}
                              onChange={(e) => {
                                const newProfiles = [...interactiveRadar.profiles];
                                newProfiles[pIdx] = { ...profile, criticalWeakness: e.target.value };
                                handleUpdateRadar({ profiles: newProfiles });
                              }}
                              placeholder="Kelemahan atau area perbaikan..."
                              className="w-full px-2.5 py-1.5 rounded-lg border text-[11px]"
                            />
                          </div>
                        </div>

                        {/* Minimum required scores list for matching */}
                        <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg space-y-2">
                          <label className="block text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">
                            Syarat Minimum Skor Sumbu Untuk Profil Ini
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(interactiveRadar.axes || []).map((axis: any) => {
                              const currentMin = profile.minScores?.[axis.id] ?? 1;
                              return (
                                <div key={axis.id} className="space-y-0.5">
                                  <label className="block text-[8px] text-slate-400 font-bold truncate">
                                    Min {axis.label}
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={currentMin}
                                    onChange={(e) => {
                                      const newProfiles = [...interactiveRadar.profiles];
                                      const minScores = { ...(profile.minScores || {}) };
                                      minScores[axis.id] = parseInt(e.target.value) || 1;
                                      newProfiles[pIdx] = { ...profile, minScores };
                                      handleUpdateRadar({ profiles: newProfiles });
                                    }}
                                    className="w-full px-2 py-1 rounded-md border text-[10px]"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-amber-600 dark:text-amber-400 font-bold mb-0.5">
                            Saran Praktis Tindakan Nyata (Satu Per Baris)
                          </label>
                          <textarea
                            rows={3}
                            value={Array.isArray(profile.actionSteps) ? profile.actionSteps.join('\n') : ''}
                            onChange={(e) => {
                              const newProfiles = [...interactiveRadar.profiles];
                              newProfiles[pIdx] = {
                                ...profile,
                                actionSteps: e.target.value.split('\n').map((v: string) => v.trim()).filter((v: string) => v !== '')
                              };
                              handleUpdateRadar({ profiles: newProfiles });
                            }}
                            placeholder="Cth: Kurangi waktu gawai anak&#10;Gunakan sanksi logis"
                            className="w-full p-2.5 rounded-lg border text-[11px] font-mono leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIVE FORM PANEL: QUIZ */}
            {postType === 'interactive_quiz' && interactiveQuiz && (
              <div className="p-5 rounded-2xl border border-rose-100 dark:border-slate-800 bg-rose-500/[0.02] dark:bg-slate-900/50 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-base">🎓</span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Pengaturan Kuis IQ & Wawasan Ringan</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Judul Kuis / Widget</label>
                    <input
                      type="text"
                      value={interactiveQuiz.widgetTitle || ''}
                      onChange={(e) => handleUpdateQuiz({ widgetTitle: e.target.value })}
                      placeholder="Cth: Uji Potensi Kognitif & Logika Psikologis"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Deskripsi Singkat / Petunjuk</label>
                    <input
                      type="text"
                      value={interactiveQuiz.widgetDescription || ''}
                      onChange={(e) => handleUpdateQuiz({ widgetDescription: e.target.value })}
                      placeholder="Cth: Asah daya analisis, logika, dan berpikir deduktif..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Skor Dasar (Base Score)</label>
                    <input
                      type="number"
                      value={interactiveQuiz.baseScore ?? 80}
                      onChange={(e) => handleUpdateQuiz({ baseScore: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Poin per Jawaban Benar</label>
                    <input
                      type="number"
                      value={interactiveQuiz.pointsPerCorrect ?? 15}
                      onChange={(e) => handleUpdateQuiz({ pointsPerCorrect: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                {/* QUESTIONS DEFINITION */}
                <div className="flex flex-col gap-4 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <h5 className="font-extrabold text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider">Daftar Soal Pilihan Ganda ({ (interactiveQuiz.questions || []).length } Soal)</h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newQuestions = [...(interactiveQuiz.questions || [])];
                        newQuestions.push({
                          id: `q_${Date.now().toString().slice(-4)}`,
                          question: 'Pertanyaan baru?',
                          category: 'Umum',
                          options: [
                            { text: 'Opsi A', isCorrect: true },
                            { text: 'Opsi B', isCorrect: false },
                            { text: 'Opsi C', isCorrect: false },
                            { text: 'Opsi D', isCorrect: false }
                          ]
                        });
                        handleUpdateQuiz({ questions: newQuestions });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px]"
                    >
                      + Tambah Soal
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(interactiveQuiz.questions || []).map((q: any, qIdx: number) => (
                      <div key={qIdx} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-850 bg-white dark:bg-zinc-900/40 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-indigo-500 uppercase">Pertanyaan #{qIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newQuestions = (interactiveQuiz.questions || []).filter((_: any, i: number) => i !== qIdx);
                              handleUpdateQuiz({ questions: newQuestions });
                            }}
                            className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline"
                          >
                            Hapus Soal
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Teks Pertanyaan</label>
                            <input
                              type="text"
                              value={q.question || ''}
                              onChange={(e) => {
                                const newQuestions = [...interactiveQuiz.questions];
                                newQuestions[qIdx] = { ...q, question: e.target.value };
                                handleUpdateQuiz({ questions: newQuestions });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg border text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Kategori / Sub-Topik</label>
                            <input
                              type="text"
                              value={q.category || ''}
                              onChange={(e) => {
                                const newQuestions = [...interactiveQuiz.questions];
                                newQuestions[qIdx] = { ...q, category: e.target.value };
                                handleUpdateQuiz({ questions: newQuestions });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg border text-xs"
                            />
                          </div>
                        </div>

                        {/* Options editor (4 options) */}
                        <div className="space-y-1.5">
                          <label className="block text-[9px] text-slate-400 font-black uppercase mb-1">Pilihan Jawaban (Pilih Bulatan untuk Jawaban Benar)</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(q.options || []).map((opt: any, oIdx: number) => (
                              <div key={oIdx} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30">
                                <input
                                  type="radio"
                                  name={`correct_radio_${qIdx}`}
                                  checked={!!opt.isCorrect}
                                  onChange={() => {
                                    const newQuestions = [...interactiveQuiz.questions];
                                    const newOpts = q.options.map((o: any, oi: number) => ({
                                      ...o,
                                      isCorrect: oi === oIdx
                                    }));
                                    newQuestions[qIdx] = { ...q, options: newOpts };
                                    handleUpdateQuiz({ questions: newQuestions });
                                  }}
                                  className="accent-indigo-600"
                                />
                                <span className="text-[10px] font-bold text-slate-400">{String.fromCharCode(65 + oIdx)}</span>
                                <input
                                  type="text"
                                  value={opt.text || ''}
                                  onChange={(e) => {
                                    const newQuestions = [...interactiveQuiz.questions];
                                    const newOpts = [...q.options];
                                    newOpts[oIdx] = { ...opt, text: e.target.value };
                                    newQuestions[qIdx] = { ...q, options: newOpts };
                                    handleUpdateQuiz({ questions: newQuestions });
                                  }}
                                  className="w-full px-2 py-1 bg-white dark:bg-zinc-900 border text-[11px] rounded"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIVE FORM PANEL: TIMELINE SLIDER */}
            {postType === 'interactive_timeline_slider' && interactiveTimelineSlider && (
              <div className="p-5 rounded-2xl border border-rose-100 dark:border-slate-800 bg-rose-500/[0.02] dark:bg-slate-900/50 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-base">🎚️</span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Pengaturan Slider Skenario Waktu</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Judul Slider / Widget</label>
                    <input
                      type="text"
                      value={interactiveTimelineSlider.widgetTitle || ''}
                      onChange={(e) => handleUpdateTimelineSlider({ widgetTitle: e.target.value })}
                      placeholder="Cth: Siklus Energi & Emosi Anak Sehari-hari"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Deskripsi Petunjuk Penggunaan</label>
                    <input
                      type="text"
                      value={interactiveTimelineSlider.widgetDescription || ''}
                      onChange={(e) => handleUpdateTimelineSlider({ widgetDescription: e.target.value })}
                      placeholder="Cth: Geser slider di bawah ini untuk melihat..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                {/* PHASES LIST DEFINITION */}
                <div className="flex flex-col gap-4 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-100 dark:border-slate-800">
                    <h5 className="font-extrabold text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Daftar Fase Skenario ({ (interactiveTimelineSlider.phases || []).length } Fase)
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newPhases = [...(interactiveTimelineSlider.phases || [])];
                        const uniqueId = `phase_${Date.now().toString().slice(-4)}`;
                        newPhases.push({
                          id: uniqueId,
                          label: 'Fase Baru',
                          timeLabel: '12:00 Baru',
                          fase: 'Detail Fase Baru (Ganti di sini)',
                          kondisi_biologis_anak: 'Penjelasan kondisi biologis/situasional detail...',
                          tantangan_orang_tua: 'Penjelasan tantangan yang dihadapi...',
                          visual_hex_color: '#fffbeb',
                          langkah_transisi_damai: [
                            'Langkah praktis pertama Anda',
                            'Langkah praktis kedua Anda'
                          ]
                        });
                        handleUpdateTimelineSlider({ phases: newPhases });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px]"
                    >
                      + Tambah Fase
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(interactiveTimelineSlider.phases || []).map((phase: any, pIdx: number) => (
                      <div key={pIdx} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-850 bg-white dark:bg-zinc-900/50 space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => {
                            const newPhases = (interactiveTimelineSlider.phases || []).filter((_: any, i: number) => i !== pIdx);
                            handleUpdateTimelineSlider({ phases: newPhases });
                          }}
                          className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                          title="Hapus Fase Ini"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="col-span-1">
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Label Singkat Tab</label>
                            <input
                              type="text"
                              value={phase.label || ''}
                              onChange={(e) => {
                                const newPhases = [...interactiveTimelineSlider.phases];
                                newPhases[pIdx] = { ...phase, label: e.target.value };
                                handleUpdateTimelineSlider({ phases: newPhases });
                              }}
                              placeholder="Cth: Pagi Hari"
                              className="w-full px-2 py-1 border text-[11px] rounded"
                            />
                          </div>

                          <div className="col-span-1">
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Label Jam / Waktu</label>
                            <input
                              type="text"
                              value={phase.timeLabel || ''}
                              onChange={(e) => {
                                const newPhases = [...interactiveTimelineSlider.phases];
                                newPhases[pIdx] = { ...phase, timeLabel: e.target.value };
                                handleUpdateTimelineSlider({ phases: newPhases });
                              }}
                              placeholder="Cth: 07:00 Pagi"
                              className="w-full px-2 py-1 border text-[11px] rounded"
                            />
                          </div>

                          <div className="col-span-1">
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Warna Pastel Hex</label>
                            <input
                              type="text"
                              value={phase.visual_hex_color || ''}
                              onChange={(e) => {
                                const newPhases = [...interactiveTimelineSlider.phases];
                                newPhases[pIdx] = { ...phase, visual_hex_color: e.target.value };
                                handleUpdateTimelineSlider({ phases: newPhases });
                              }}
                              placeholder="Cth: #FFFDF5"
                              className="w-full px-2 py-1 border text-[11px] rounded font-mono"
                            />
                          </div>

                          <div className="col-span-1">
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Judul Detail Fase</label>
                            <input
                              type="text"
                              value={phase.fase || ''}
                              onChange={(e) => {
                                const newPhases = [...interactiveTimelineSlider.phases];
                                newPhases[pIdx] = { ...phase, fase: e.target.value };
                                handleUpdateTimelineSlider({ phases: newPhases });
                              }}
                              placeholder="Cth: Pagi Hari (Bangun)"
                              className="w-full px-2 py-1 border text-[11px] rounded"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Kondisi Tubuh / Biologis</label>
                          <textarea
                            rows={2}
                            value={phase.kondisi_biologis_anak || ''}
                            onChange={(e) => {
                              const newPhases = [...interactiveTimelineSlider.phases];
                              newPhases[pIdx] = { ...phase, kondisi_biologis_anak: e.target.value };
                              handleUpdateTimelineSlider({ phases: newPhases });
                            }}
                            placeholder="Tuliskan fluktuasi hormon biologis atau kondisi situasional detail..."
                            className="w-full p-2 border text-[11px] leading-relaxed rounded text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Tantangan Utama</label>
                          <input
                            type="text"
                            value={phase.tantangan_orang_tua || ''}
                            onChange={(e) => {
                              const newPhases = [...interactiveTimelineSlider.phases];
                              newPhases[pIdx] = { ...phase, tantangan_orang_tua: e.target.value };
                              handleUpdateTimelineSlider({ phases: newPhases });
                            }}
                            placeholder="Tantangan spesifik..."
                            className="w-full px-2.5 py-1.5 border text-[11px] rounded text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Langkah Transisi Praktis (Satu Per Baris)</label>
                          <textarea
                            rows={3}
                            value={Array.isArray(phase.langkah_transisi_damai) ? phase.langkah_transisi_damai.join('\n') : ''}
                            onChange={(e) => {
                              const newPhases = [...interactiveTimelineSlider.phases];
                              newPhases[pIdx] = { 
                                ...phase, 
                                langkah_transisi_damai: e.target.value.split('\n').map((v: string) => v.trim()).filter((v: string) => v !== '') 
                              };
                              handleUpdateTimelineSlider({ phases: newPhases });
                            }}
                            placeholder="Cth: Lakukan kontak fisik lembut&#10;Gunakan cahaya alami"
                            className="w-full p-2.5 border text-[11px] font-mono leading-relaxed rounded text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIVE FORM PANEL: BATTLE CARD */}
            {postType === 'interactive_battle_card' && interactiveBattleCard && (
              <div className="p-5 rounded-3xl border border-[#f2ece0] dark:border-zinc-800 bg-[#faf9f6]/30 dark:bg-zinc-900/10 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-base">⚔️</span>
                  <h4 className="font-serif font-black text-xs text-slate-800 dark:text-slate-200">Pengaturan Kartu Duel Komparasi (Battle Card)</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Judul Komparasi</label>
                    <input
                      type="text"
                      value={interactiveBattleCard.widgetTitle || ''}
                      onChange={(e) => handleUpdateBattleCard({ widgetTitle: e.target.value })}
                      placeholder="Cth: Susu Formula vs ASI"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Deskripsi Ringkas</label>
                    <input
                      type="text"
                      value={interactiveBattleCard.widgetDescription || ''}
                      onChange={(e) => handleUpdateBattleCard({ widgetDescription: e.target.value })}
                      placeholder="Cth: Temukan perbandingan komparatif..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>

                {/* Comparison Criteria */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Metrik Perbandingan (Satu Per Baris)</label>
                  <textarea
                    rows={3}
                    value={Array.isArray(interactiveBattleCard.comparisonCriteria) ? interactiveBattleCard.comparisonCriteria.join('\n') : ''}
                    onChange={(e) => {
                      const criteria = e.target.value.split('\n').map(c => c.trim()).filter(c => c !== '');
                      handleUpdateBattleCard({ comparisonCriteria: criteria });
                    }}
                    placeholder="Kandungan Nutrisi&#10;Kemudahan Pemberian&#10;Sistem Imunitas"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-mono bg-white dark:bg-zinc-900"
                  />
                </div>

                {/* Option A & B Forms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Option A */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-850 space-y-3">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full block w-max">
                      Opsi Utama (A)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400">Nama Opsi</label>
                        <input
                          type="text"
                          value={interactiveBattleCard.optionA?.name || ''}
                          onChange={(e) => handleUpdateBattleCard({
                            optionA: { ...(interactiveBattleCard.optionA || {}), name: e.target.value }
                          })}
                          className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400">Badge Singkat</label>
                        <input
                          type="text"
                          value={interactiveBattleCard.optionA?.badge || ''}
                          onChange={(e) => handleUpdateBattleCard({
                            optionA: { ...(interactiveBattleCard.optionA || {}), badge: e.target.value }
                          })}
                          className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400">URL Gambar (Opsional)</label>
                      <input
                        type="text"
                        value={interactiveBattleCard.optionA?.image || ''}
                        onChange={(e) => handleUpdateBattleCard({
                          optionA: { ...(interactiveBattleCard.optionA || {}), image: e.target.value }
                        })}
                        className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400">Deskripsi Singkat</label>
                      <textarea
                        rows={2}
                        value={interactiveBattleCard.optionA?.summary || ''}
                        onChange={(e) => handleUpdateBattleCard({
                          optionA: { ...(interactiveBattleCard.optionA || {}), summary: e.target.value }
                        })}
                        className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Daftar Kelebihan / Pros (Satu Per Baris)</label>
                      <textarea
                        rows={3}
                        value={Array.isArray(interactiveBattleCard.optionA?.strengths) ? interactiveBattleCard.optionA.strengths.join('\n') : ''}
                        onChange={(e) => {
                          const strengths = e.target.value.split('\n').map(s => s.trim()).filter(s => s !== '');
                          handleUpdateBattleCard({
                            optionA: { ...(interactiveBattleCard.optionA || {}), strengths }
                          });
                        }}
                        className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Daftar Kekurangan / Cons (Satu Per Baris)</label>
                      <textarea
                        rows={3}
                        value={Array.isArray(interactiveBattleCard.optionA?.weaknesses) ? interactiveBattleCard.optionA.weaknesses.join('\n') : ''}
                        onChange={(e) => {
                          const weaknesses = e.target.value.split('\n').map(w => w.trim()).filter(w => w !== '');
                          handleUpdateBattleCard({
                            optionA: { ...(interactiveBattleCard.optionA || {}), weaknesses }
                          });
                        }}
                        className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400">Cocok Untuk</label>
                        <input
                          type="text"
                          value={interactiveBattleCard.optionA?.bestFor || ''}
                          onChange={(e) => handleUpdateBattleCard({
                            optionA: { ...(interactiveBattleCard.optionA || {}), bestFor: e.target.value }
                          })}
                          className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400">Rating (1-5)</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={interactiveBattleCard.optionA?.rating || 5}
                          onChange={(e) => handleUpdateBattleCard({
                            optionA: { ...(interactiveBattleCard.optionA || {}), rating: parseInt(e.target.value) || 5 }
                          })}
                          className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Option B */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-850 space-y-3">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full block w-max">
                      Opsi Pembanding (B)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400">Nama Opsi</label>
                        <input
                          type="text"
                          value={interactiveBattleCard.optionB?.name || ''}
                          onChange={(e) => handleUpdateBattleCard({
                            optionB: { ...(interactiveBattleCard.optionB || {}), name: e.target.value }
                          })}
                          className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400">Badge Singkat</label>
                        <input
                          type="text"
                          value={interactiveBattleCard.optionB?.badge || ''}
                          onChange={(e) => handleUpdateBattleCard({
                            optionB: { ...(interactiveBattleCard.optionB || {}), badge: e.target.value }
                          })}
                          className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400">URL Gambar (Opsional)</label>
                      <input
                        type="text"
                        value={interactiveBattleCard.optionB?.image || ''}
                        onChange={(e) => handleUpdateBattleCard({
                          optionB: { ...(interactiveBattleCard.optionB || {}), image: e.target.value }
                        })}
                        className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400">Deskripsi Singkat</label>
                      <textarea
                        rows={2}
                        value={interactiveBattleCard.optionB?.summary || ''}
                        onChange={(e) => handleUpdateBattleCard({
                          optionB: { ...(interactiveBattleCard.optionB || {}), summary: e.target.value }
                        })}
                        className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Daftar Kelebihan / Pros (Satu Per Baris)</label>
                      <textarea
                        rows={3}
                        value={Array.isArray(interactiveBattleCard.optionB?.strengths) ? interactiveBattleCard.optionB.strengths.join('\n') : ''}
                        onChange={(e) => {
                          const strengths = e.target.value.split('\n').map(s => s.trim()).filter(s => s !== '');
                          handleUpdateBattleCard({
                            optionB: { ...(interactiveBattleCard.optionB || {}), strengths }
                          });
                        }}
                        className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Daftar Kekurangan / Cons (Satu Per Baris)</label>
                      <textarea
                        rows={3}
                        value={Array.isArray(interactiveBattleCard.optionB?.weaknesses) ? interactiveBattleCard.optionB.weaknesses.join('\n') : ''}
                        onChange={(e) => {
                          const weaknesses = e.target.value.split('\n').map(w => w.trim()).filter(w => w !== '');
                          handleUpdateBattleCard({
                            optionB: { ...(interactiveBattleCard.optionB || {}), weaknesses }
                          });
                        }}
                        className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400">Cocok Untuk</label>
                        <input
                          type="text"
                          value={interactiveBattleCard.optionB?.bestFor || ''}
                          onChange={(e) => handleUpdateBattleCard({
                            optionB: { ...(interactiveBattleCard.optionB || {}), bestFor: e.target.value }
                          })}
                          className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400">Rating (1-5)</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={interactiveBattleCard.optionB?.rating || 4}
                          onChange={(e) => handleUpdateBattleCard({
                            optionB: { ...(interactiveBattleCard.optionB || {}), rating: parseInt(e.target.value) || 4 }
                          })}
                          className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verdict Summary Panel */}
                <div className="p-4 rounded-2xl bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/40 space-y-3">
                  <div className="font-bold text-xs text-rose-800 dark:text-rose-400">Rekomendasi Verdict & Keputusan Tim Medis</div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Judul Verdict</label>
                      <input
                        type="text"
                        value={interactiveBattleCard.verdictTitle || ''}
                        onChange={(e) => handleUpdateBattleCard({ verdictTitle: e.target.value })}
                        className="w-full px-2.5 py-1.5 border text-xs rounded bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Isi Keputusan / Rekomendasi Medis</label>
                      <textarea
                        rows={3}
                        value={interactiveBattleCard.verdictContent || ''}
                        onChange={(e) => handleUpdateBattleCard({ verdictContent: e.target.value })}
                        className="w-full p-2.5 border text-xs rounded bg-white dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIVE FORM PANEL: QUIZ ROUTER */}
            {postType === 'interactive_quiz_router' && interactiveQuizRouter && (
              <div className="p-5 rounded-3xl border border-[#f2ece0] dark:border-zinc-800 bg-[#faf9f6]/30 dark:bg-zinc-900/10 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-base">🌳</span>
                  <h4 className="font-serif font-black text-xs text-slate-800 dark:text-slate-200">Pengaturan Quiz Penentu Keputusan (Quiz Router)</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Judul Kuis</label>
                    <input
                      type="text"
                      value={interactiveQuizRouter.widgetTitle || ''}
                      onChange={(e) => handleUpdateQuizRouter({ widgetTitle: e.target.value })}
                      placeholder="Cth: Evaluasi Parenting Style Anda"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Deskripsi Petunjuk</label>
                    <input
                      type="text"
                      value={interactiveQuizRouter.widgetDescription || ''}
                      onChange={(e) => handleUpdateQuizRouter({ widgetDescription: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1 border-b border-dashed">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Pertanyaan Evaluasi ({ (interactiveQuizRouter.questions || []).length })</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newQ = [...(interactiveQuizRouter.questions || [])];
                        newQ.push({
                          id: `q${Date.now().toString().slice(-4)}`,
                          text: 'Pertanyaan baru?',
                          options: [
                            { text: 'Pilihan opsi A', targetOutcomeId: 'authoritative' },
                            { text: 'Pilihan opsi B', targetOutcomeId: 'authoritarian' },
                            { text: 'Pilihan opsi C', targetOutcomeId: 'permissive' }
                          ]
                        });
                        handleUpdateQuizRouter({ questions: newQ });
                      }}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px]"
                    >
                      + Tambah Pertanyaan
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(interactiveQuizRouter.questions || []).map((q: any, qIdx: number) => (
                      <div key={q.id || qIdx} className="p-4 rounded-xl border bg-white dark:bg-zinc-900 space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => {
                            const newQ = (interactiveQuizRouter.questions || []).filter((_: any, i: number) => i !== qIdx);
                            handleUpdateQuizRouter({ questions: newQ });
                          }}
                          className="absolute top-3 right-3 text-red-500 hover:text-red-700 font-bold text-xs"
                        >
                          Hapus
                        </button>
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Pertanyaan {qIdx + 1}</label>
                          <input
                            type="text"
                            value={q.text || ''}
                            onChange={(e) => {
                              const newQ = [...interactiveQuizRouter.questions];
                              newQ[qIdx] = { ...q, text: e.target.value };
                              handleUpdateQuizRouter({ questions: newQ });
                            }}
                            className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950"
                          />
                        </div>

                        {/* Options editor */}
                        <div className="space-y-1">
                          <label className="block text-[9px] text-slate-400 font-bold">Pilihan Jawaban & Hasil Penargetan Profil</label>
                          <div className="space-y-1.5">
                            {(q.options || []).map((opt: any, oIdx: number) => (
                              <div key={oIdx} className="grid grid-cols-3 gap-2 items-center">
                                <div className="col-span-2">
                                  <input
                                    type="text"
                                    value={opt.text || ''}
                                    onChange={(e) => {
                                      const newQ = [...interactiveQuizRouter.questions];
                                      const newOpts = [...q.options];
                                      newOpts[oIdx] = { ...opt, text: e.target.value };
                                      newQ[qIdx] = { ...q, options: newOpts };
                                      handleUpdateQuizRouter({ questions: newQ });
                                    }}
                                    placeholder={`Pilihan ${oIdx + 1}`}
                                    className="w-full px-2 py-1 border text-[11px] rounded bg-white dark:bg-zinc-950"
                                  />
                                </div>
                                <div className="col-span-1">
                                  <select
                                    value={opt.targetOutcomeId || ''}
                                    onChange={(e) => {
                                      const newQ = [...interactiveQuizRouter.questions];
                                      const newOpts = [...q.options];
                                      newOpts[oIdx] = { ...opt, targetOutcomeId: e.target.value };
                                      newQ[qIdx] = { ...q, options: newOpts };
                                      handleUpdateQuizRouter({ questions: newQ });
                                    }}
                                    className="w-full px-2 py-1 border text-[11px] rounded bg-white dark:bg-zinc-950 font-bold text-slate-700"
                                  >
                                    {(interactiveQuizRouter.outcomes || []).map((out: any) => (
                                      <option key={out.id} value={out.id}>{out.id}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outcomes Definition */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1 border-b border-dashed">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Profil Hasil Diagnosis ({ (interactiveQuizRouter.outcomes || []).length })</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {(interactiveQuizRouter.outcomes || []).map((out: any, oIdx: number) => (
                      <div key={out.id || oIdx} className="p-4 rounded-xl border bg-white dark:bg-zinc-900 space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold">ID Profil (Kunci Penargetan)</label>
                            <input
                              type="text"
                              value={out.id || ''}
                              disabled
                              className="w-full px-2 py-1 border text-xs rounded bg-slate-50 dark:bg-zinc-950/40 text-slate-400 cursor-not-allowed font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold">Nama Profil</label>
                            <input
                              type="text"
                              value={out.title || ''}
                              onChange={(e) => {
                                const newOut = [...interactiveQuizRouter.outcomes];
                                newOut[oIdx] = { ...out, title: e.target.value };
                                handleUpdateQuizRouter({ outcomes: newOut });
                              }}
                              className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold">Warna Aksen Hex</label>
                            <input
                              type="text"
                              value={out.badgeColor || '#10b981'}
                              onChange={(e) => {
                                const newOut = [...interactiveQuizRouter.outcomes];
                                newOut[oIdx] = { ...out, badgeColor: e.target.value };
                                handleUpdateQuizRouter({ outcomes: newOut });
                              }}
                              className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950 font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold">Penjelasan Diagnostik</label>
                          <textarea
                            rows={2}
                            value={out.description || ''}
                            onChange={(e) => {
                              const newOut = [...interactiveQuizRouter.outcomes];
                              newOut[oIdx] = { ...out, description: e.target.value };
                              handleUpdateQuizRouter({ outcomes: newOut });
                            }}
                            className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold">Langkah Tindakan Nyata (Satu Per Baris)</label>
                          <textarea
                            rows={3}
                            value={Array.isArray(out.actionSteps) ? out.actionSteps.join('\n') : ''}
                            onChange={(e) => {
                              const steps = e.target.value.split('\n').map(s => s.trim()).filter(s => s !== '');
                              const newOut = [...interactiveQuizRouter.outcomes];
                              newOut[oIdx] = { ...out, actionSteps: steps };
                              handleUpdateQuizRouter({ outcomes: newOut });
                            }}
                            className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950 font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIVE FORM PANEL: HABIT SIMULATOR */}
            {postType === 'interactive_habit_simulator' && interactiveHabitSimulator && (
              <div className="p-5 rounded-3xl border border-[#f2ece0] dark:border-zinc-800 bg-[#faf9f6]/30 dark:bg-zinc-900/10 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-base">⚡</span>
                  <h4 className="font-serif font-black text-xs text-slate-800 dark:text-slate-200">Pengaturan Simulator Kebiasaan (Habit Simulator)</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Judul Simulator</label>
                    <input
                      type="text"
                      value={interactiveHabitSimulator.widgetTitle || ''}
                      onChange={(e) => handleUpdateHabitSimulator({ widgetTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Deskripsi Petunjuk</label>
                    <input
                      type="text"
                      value={interactiveHabitSimulator.widgetDescription || ''}
                      onChange={(e) => handleUpdateHabitSimulator({ widgetDescription: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Skor Awal Baseline (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={interactiveHabitSimulator.baselineScore || 50}
                      onChange={(e) => handleUpdateHabitSimulator({ baselineScore: parseInt(e.target.value) || 50 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>

                {/* Habits List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1 border-b border-dashed">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Daftar Kebiasaan ({ (interactiveHabitSimulator.habits || []).length })</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newH = [...(interactiveHabitSimulator.habits || [])];
                        newH.push({
                          id: `habit_${Date.now().toString().slice(-4)}`,
                          label: 'Kebiasaan Baru',
                          impactScore: 1,
                          cue: 'Pemicu kebiasaan',
                          response: 'Tindakan yang diambil',
                          reward: 'Reward positif yang didapat'
                        });
                        handleUpdateHabitSimulator({ habits: newH });
                      }}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px]"
                    >
                      + Tambah Kebiasaan
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(interactiveHabitSimulator.habits || []).map((habit: any, hIdx: number) => (
                      <div key={habit.id || hIdx} className="p-4 rounded-xl border bg-white dark:bg-zinc-900 space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => {
                            const newH = (interactiveHabitSimulator.habits || []).filter((_: any, i: number) => i !== hIdx);
                            handleUpdateHabitSimulator({ habits: newH });
                          }}
                          className="absolute top-3 right-3 text-red-500 hover:text-red-700 font-bold text-xs"
                        >
                          Hapus
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold">Nama Kebiasaan</label>
                            <input
                              type="text"
                              value={habit.label || ''}
                              onChange={(e) => {
                                const newH = [...interactiveHabitSimulator.habits];
                                newH[hIdx] = { ...habit, label: e.target.value };
                                handleUpdateHabitSimulator({ habits: newH });
                              }}
                              className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold">Dampak Skor harian</label>
                            <input
                              type="number"
                              step="0.5"
                              value={habit.impactScore || 0}
                              onChange={(e) => {
                                const newH = [...interactiveHabitSimulator.habits];
                                newH[hIdx] = { ...habit, impactScore: parseFloat(e.target.value) || 0 };
                                handleUpdateHabitSimulator({ habits: newH });
                              }}
                              className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[8px] text-slate-400 font-bold">Cue / Pemicu</label>
                            <input
                              type="text"
                              value={habit.cue || ''}
                              onChange={(e) => {
                                const newH = [...interactiveHabitSimulator.habits];
                                newH[hIdx] = { ...habit, cue: e.target.value };
                                handleUpdateHabitSimulator({ habits: newH });
                              }}
                              className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] text-slate-400 font-bold">Response / Rutinitas</label>
                            <input
                              type="text"
                              value={habit.response || ''}
                              onChange={(e) => {
                                const newH = [...interactiveHabitSimulator.habits];
                                newH[hIdx] = { ...habit, response: e.target.value };
                                handleUpdateHabitSimulator({ habits: newH });
                              }}
                              className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] text-slate-400 font-bold">Reward / Hadiah</label>
                            <input
                              type="text"
                              value={habit.reward || ''}
                              onChange={(e) => {
                                const newH = [...interactiveHabitSimulator.habits];
                                newH[hIdx] = { ...habit, reward: e.target.value };
                                handleUpdateHabitSimulator({ habits: newH });
                              }}
                              className="w-full px-2 py-1 border text-xs rounded bg-white dark:bg-zinc-950"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Habit tips list */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tips Skenario Pembentukan Habit (Satu Per Baris)</label>
                  <textarea
                    rows={4}
                    value={Array.isArray(interactiveHabitSimulator.habitTips) ? interactiveHabitSimulator.habitTips.join('\n') : ''}
                    onChange={(e) => {
                      const tips = e.target.value.split('\n').map(t => t.trim()).filter(t => t !== '');
                      handleUpdateHabitSimulator({ habitTips: tips });
                    }}
                    placeholder="Tuliskan saran pembentukan habit..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-mono bg-white dark:bg-zinc-900"
                  />
                </div>
              </div>
            )}

            {/* INTERACTIVE FORM PANEL: CLINICAL Q&A ADVICE COLUMN */}
            {postType === 'interactive_qa_column' && interactiveQaColumn && (
              <div className="p-5 rounded-2xl border border-rose-100 dark:border-slate-800 bg-rose-500/[0.02] dark:bg-slate-900/50 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-base">💬</span>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Pengaturan Widget Kolom Tanya Jawab & Konsultasi Ahli</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Judul Widget</label>
                    <input
                      type="text"
                      value={interactiveQaColumn.widgetTitle || ''}
                      onChange={(e) => handleUpdateQAColumn({ widgetTitle: e.target.value })}
                      placeholder="e.g., Kolom Tanya Jawab Klinis: Konsultasi Pola Asuh & Emosi"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Deskripsi Pendek Widget</label>
                    <input
                      type="text"
                      value={interactiveQaColumn.widgetDescription || ''}
                      onChange={(e) => handleUpdateQAColumn({ widgetDescription: e.target.value })}
                      placeholder="e.g., Tanyakan kecemasan Anda secara anonim. Tim psikolog klinis kami mengulas permasalahan Anda..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Label Tombol Submit Curhat</label>
                    <input
                      type="text"
                      value={interactiveQaColumn.buttonText || ''}
                      onChange={(e) => handleUpdateQAColumn({ buttonText: e.target.value })}
                      placeholder="e.g., Kirim Masalah Anda (Anonim)"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Placeholder Formulir Submit Curhat</label>
                    <input
                      type="text"
                      value={interactiveQaColumn.submissionPlaceholder || ''}
                      onChange={(e) => handleUpdateQAColumn({ submissionPlaceholder: e.target.value })}
                      placeholder="e.g., Tuliskan konflik anak atau kecemasan hubungan pasutri..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Daftar Kasus Tanya Jawab ({ (interactiveQaColumn.cases || []).length })</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newCases = [...(interactiveQaColumn.cases || [])];
                        newCases.push({
                          id: `case_${Date.now()}`,
                          category: 'Kesehatan Mental Ibu',
                          title: 'Keluhan Baru Editor',
                          senderAgeGender: 'Ibu (30 tahun) - Anonim',
                          questionText: 'Tuliskan keluh kesah pembaca di sini...',
                          expertName: 'Aisyah Siregar, M.Psi., Psikolog',
                          expertTitle: 'Psikolog Klinis Anak & Keluarga',
                          expertAvatar: '',
                          analysisMarkdown: 'Tuliskan analisis psikologis/penilaian klinis mendalam di sini...',
                          adviceSteps: [
                            'Rencana aksi atau saran praktis langkah 1.',
                            'Rencana aksi atau saran praktis langkah 2.'
                          ]
                        });
                        handleUpdateQAColumn({ cases: newCases });
                      }}
                      className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      + Tambah Kasus Tanya Jawab
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(interactiveQaColumn.cases || []).map((qaCase: any, cIdx: number) => (
                      <div key={qaCase.id || cIdx} className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950/20 space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => {
                            const newCases = (interactiveQaColumn.cases || []).filter((_: any, i: number) => i !== cIdx);
                            handleUpdateQAColumn({ cases: newCases });
                          }}
                          className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 text-xs font-bold"
                          title="Hapus Kasus"
                        >
                          Hapus
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold">Kategori Kasus</label>
                            <input
                              type="text"
                              value={qaCase.category || ''}
                              onChange={(e) => {
                                const newCases = [...interactiveQaColumn.cases];
                                newCases[cIdx] = { ...qaCase, category: e.target.value };
                                handleUpdateQAColumn({ cases: newCases });
                              }}
                              className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold">Judul Singkat Kasus</label>
                            <input
                              type="text"
                              value={qaCase.title || ''}
                              onChange={(e) => {
                                const newCases = [...interactiveQaColumn.cases];
                                newCases[cIdx] = { ...qaCase, title: e.target.value };
                                handleUpdateQAColumn({ cases: newCases });
                              }}
                              className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold">Usia & Gender Pengirim</label>
                            <input
                              type="text"
                              value={qaCase.senderAgeGender || ''}
                              onChange={(e) => {
                                const newCases = [...interactiveQaColumn.cases];
                                newCases[cIdx] = { ...qaCase, senderAgeGender: e.target.value };
                                handleUpdateQAColumn({ cases: newCases });
                              }}
                              className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold">Dilema & Pertanyaan Pengirim</label>
                          <textarea
                            rows={3}
                            value={qaCase.questionText || ''}
                            onChange={(e) => {
                              const newCases = [...interactiveQaColumn.cases];
                              newCases[cIdx] = { ...qaCase, questionText: e.target.value };
                              handleUpdateQAColumn({ cases: newCases });
                            }}
                            className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold">Nama Psikolog / Ahli</label>
                            <input
                              type="text"
                              value={qaCase.expertName || ''}
                              onChange={(e) => {
                                const newCases = [...interactiveQaColumn.cases];
                                newCases[cIdx] = { ...qaCase, expertName: e.target.value };
                                handleUpdateQAColumn({ cases: newCases });
                              }}
                              className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold">Gelar / Kredensial Ahli</label>
                            <input
                              type="text"
                              value={qaCase.expertTitle || ''}
                              onChange={(e) => {
                                const newCases = [...interactiveQaColumn.cases];
                                newCases[cIdx] = { ...qaCase, expertTitle: e.target.value };
                                handleUpdateQAColumn({ cases: newCases });
                              }}
                              className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold">URL Foto Profil Ahli (Opsional)</label>
                            <input
                              type="text"
                              value={qaCase.expertAvatar || ''}
                              onChange={(e) => {
                                const newCases = [...interactiveQaColumn.cases];
                                newCases[cIdx] = { ...qaCase, expertAvatar: e.target.value };
                                handleUpdateQAColumn({ cases: newCases });
                              }}
                              className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold">Analisis Mendalam Psikolog (Markdown/Teks Bebas)</label>
                          <textarea
                            rows={4}
                            value={qaCase.analysisMarkdown || ''}
                            onChange={(e) => {
                              const newCases = [...interactiveQaColumn.cases];
                              newCases[cIdx] = { ...qaCase, analysisMarkdown: e.target.value };
                              handleUpdateQAColumn({ cases: newCases });
                            }}
                            className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold">Saran Praktis & Rencana Aksi (Satu Per Baris)</label>
                          <textarea
                            rows={3}
                            value={Array.isArray(qaCase.adviceSteps) ? qaCase.adviceSteps.join('\n') : ''}
                            onChange={(e) => {
                              const steps = e.target.value.split('\n').map(s => s.trim()).filter(s => s !== '');
                              const newCases = [...interactiveQaColumn.cases];
                              newCases[cIdx] = { ...qaCase, adviceSteps: steps };
                              handleUpdateQAColumn({ newCases: newCases });
                            }}
                            placeholder="Lakukan mediasi sebelum tidur malam..."
                            className="w-full p-2 border text-xs rounded font-mono bg-white dark:bg-zinc-950"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIVE FORM PANEL: EVENT LISTING */}
            {postType === 'interactive_event_listing' && interactiveEventListing && (
              <div className="p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-500/[0.02] dark:bg-indigo-950/20 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/40">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-sm">📅</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Konfigurasi Acara & Agenda / Webinar</h4>
                      <p className="text-[11px] text-slate-500">Mendukung countdown live, Google & iCal calendar, tracking kuota, rundown, dan Schema.org/Event SEO.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    ✓ Schema.org Event Active
                  </span>
                </div>

                {/* BASIC INFO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Judul Acara / Webinar</label>
                    <input
                      type="text"
                      value={interactiveEventListing.eventTitle || ''}
                      onChange={(e) => handleUpdateEventListing({ eventTitle: e.target.value })}
                      placeholder="e.g., Webinar Eksklusif: Tren & Inovasi 2026"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Tipe Acara</label>
                    <select
                      value={interactiveEventListing.eventType || 'webinar'}
                      onChange={(e) => handleUpdateEventListing({ eventType: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                    >
                      <option value="webinar">Webinar Online</option>
                      <option value="workshop">Workshop & Pelatihan</option>
                      <option value="seminar">Seminar Umum</option>
                      <option value="conference">Konferensi / Simposium</option>
                      <option value="live_qa">Sesi Tanya Jawab Langsung</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Format Acara</label>
                    <select
                      value={interactiveEventListing.eventFormat || 'online'}
                      onChange={(e) => handleUpdateEventListing({ eventFormat: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                    >
                      <option value="online">Virtual / Online Penuh</option>
                      <option value="offline">Tatap Muka / Tatap Muka Fisik</option>
                      <option value="hybrid">Hybrid (Fisik & Daring)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Zona Waktu</label>
                    <select
                      value={interactiveEventListing.timezone || 'WIB'}
                      onChange={(e) => handleUpdateEventListing({ timezone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                    >
                      <option value="WIB">WIB (Waktu Indonesia Barat - UTC+7)</option>
                      <option value="WITA">WITA (Waktu Indonesia Tengah - UTC+8)</option>
                      <option value="WIT">WIT (Waktu Indonesia Timur - UTC+9)</option>
                      <option value="UTC">UTC (Universal Time)</option>
                    </select>
                  </div>
                </div>

                {/* DATE & TIME */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 space-y-3">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Jadwal & Durasi Waktu</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Waktu Mulai (start_date)</label>
                      <input
                        type="datetime-local"
                        value={interactiveEventListing.startDate || ''}
                        onChange={(e) => handleUpdateEventListing({ startDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Waktu Selesai (end_date)</label>
                      <input
                        type="datetime-local"
                        value={interactiveEventListing.endDate || ''}
                        onChange={(e) => handleUpdateEventListing({ endDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                </div>

                {/* LOCATION & ACCESS */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 space-y-3">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Lokasi & Tautan Akses</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Nama Tempat / Ruang Virtual</label>
                      <input
                        type="text"
                        value={interactiveEventListing.locationName || ''}
                        onChange={(e) => handleUpdateEventListing({ locationName: e.target.value })}
                        placeholder="e.g., Zoom Meeting & Gedung Graha Sabha"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Tautan Virtual (Zoom / Google Meet)</label>
                      <input
                        type="url"
                        value={interactiveEventListing.onlineJoinUrl || ''}
                        onChange={(e) => handleUpdateEventListing({ onlineJoinUrl: e.target.value })}
                        placeholder="https://zoom.us/j/1234567890"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Alamat Fisik Lengkap (Jika Offline / Hybrid)</label>
                      <input
                        type="text"
                        value={interactiveEventListing.locationAddress || ''}
                        onChange={(e) => handleUpdateEventListing({ locationAddress: e.target.value })}
                        placeholder="Jl. M.H. Thamrin No. 1, Jakarta Pusat"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Tautan Peta (Google Maps)</label>
                      <input
                        type="url"
                        value={interactiveEventListing.mapUrl || ''}
                        onChange={(e) => handleUpdateEventListing({ mapUrl: e.target.value })}
                        placeholder="https://maps.google.com/..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                </div>

                {/* QUOTA, PRICING & REGISTRATION */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 space-y-3">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Kuota, Tiket & Pendaftaran</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Status Kuota</label>
                      <select
                        value={interactiveEventListing.quotaStatus || 'open'}
                        onChange={(e) => handleUpdateEventListing({ quotaStatus: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900 font-medium"
                      >
                        <option value="early_bird">🌟 Early Bird</option>
                        <option value="open">🟢 Pendaftaran Dibuka</option>
                        <option value="limited">🟡 Kuota Terbatas</option>
                        <option value="sold_out">🔴 Kuota Habis (Sold Out)</option>
                        <option value="closed">⚪ Pendaftaran Ditutup</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Kapasitas Kuota Kursi</label>
                      <input
                        type="number"
                        min="0"
                        value={interactiveEventListing.quotaCapacity ?? 100}
                        onChange={(e) => handleUpdateEventListing({ quotaCapacity: parseInt(e.target.value) || 0 })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Jumlah Terdaftar</label>
                      <input
                        type="number"
                        min="0"
                        value={interactiveEventListing.quotaRegistered ?? 0}
                        onChange={(e) => handleUpdateEventListing({ quotaRegistered: parseInt(e.target.value) || 0 })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Batas Akhir Pendaftaran</label>
                      <input
                        type="text"
                        value={interactiveEventListing.registrationDeadline || ''}
                        onChange={(e) => handleUpdateEventListing({ registrationDeadline: e.target.value })}
                        placeholder="24 Oktober 2026, 23:59 WIB"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Harga Tiket</label>
                      <input
                        type="text"
                        value={interactiveEventListing.price || 'Gratis'}
                        onChange={(e) => handleUpdateEventListing({ price: e.target.value })}
                        placeholder="Gratis / Rp 99.000"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Harga Asli (Coret)</label>
                      <input
                        type="text"
                        value={interactiveEventListing.originalPrice || ''}
                        onChange={(e) => handleUpdateEventListing({ originalPrice: e.target.value })}
                        placeholder="Rp 250.000"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">URL Formulir Pendaftaran</label>
                      <input
                        type="url"
                        value={interactiveEventListing.registrationUrl || ''}
                        onChange={(e) => handleUpdateEventListing({ registrationUrl: e.target.value })}
                        placeholder="https://forms.gle/..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Teks Tombol Registrasi</label>
                      <input
                        type="text"
                        value={interactiveEventListing.registrationCtaText || ''}
                        onChange={(e) => handleUpdateEventListing({ registrationCtaText: e.target.value })}
                        placeholder="Daftar Sekarang (Early Bird)"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                </div>

                {/* CONTACT PERSON & BENEFITS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 space-y-3">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Narahubung & Bantuan Panitia</h5>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Nomor WhatsApp Panitia</label>
                      <input
                        type="text"
                        value={interactiveEventListing.contactPersonPhone || ''}
                        onChange={(e) => handleUpdateEventListing({ contactPersonPhone: e.target.value })}
                        placeholder="081234567890"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Nama Kontak Panitia</label>
                      <input
                        type="text"
                        value={interactiveEventListing.contactPersonName || ''}
                        onChange={(e) => handleUpdateEventListing({ contactPersonName: e.target.value })}
                        placeholder="e.g., Tim Pelaksana Acara"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 space-y-2">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Fasilitas & Keuntungan Peserta</h5>
                    <label className="block text-[10px] text-slate-500">Tuliskan satu fasilitas per baris:</label>
                    <textarea
                      rows={4}
                      value={Array.isArray(interactiveEventListing.benefits) ? interactiveEventListing.benefits.join('\n') : ''}
                      onChange={(e) => {
                        const list = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
                        handleUpdateEventListing({ benefits: list });
                      }}
                      placeholder="E-Sertifikat Resmi Bernomor SKP&#10;Akses Rekaman Video Penuh Selamanya&#10;Slide Materi PDF Lengkap&#10;Grup Diskusi & Komunitas"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900 font-mono"
                    />
                  </div>
                </div>

                {/* SPEAKERS / NARASUMBER */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Daftar Narasumber & Pembicara</h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newSpeakers = [
                          ...(interactiveEventListing.speakers || []),
                          {
                            name: '',
                            role: '',
                            avatar: '',
                            bio: ''
                          }
                        ];
                        handleUpdateEventListing({ speakers: newSpeakers });
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 transition-all"
                    >
                      + Tambah Narasumber
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(interactiveEventListing.speakers || []).map((spk: any, sIdx: number) => (
                      <div key={sIdx} className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 relative">
                        <button
                          type="button"
                          onClick={() => {
                            const newSpeakers = (interactiveEventListing.speakers || []).filter((_: any, i: number) => i !== sIdx);
                            handleUpdateEventListing({ speakers: newSpeakers });
                          }}
                          className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 text-xs font-bold"
                          title="Hapus Narasumber"
                        >
                          ✕ Hapus
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pr-16">
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold">Nama Lengkap & Gelar</label>
                            <input
                              type="text"
                              value={spk.name || ''}
                              onChange={(e) => {
                                const newSpeakers = [...interactiveEventListing.speakers];
                                newSpeakers[sIdx] = { ...spk, name: e.target.value };
                                handleUpdateEventListing({ speakers: newSpeakers });
                              }}
                              placeholder="Dr. Hendra Wijaya, M.Kom"
                              className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold">Jabatan / Keahlian</label>
                            <input
                              type="text"
                              value={spk.role || ''}
                              onChange={(e) => {
                                const newSpeakers = [...interactiveEventListing.speakers];
                                newSpeakers[sIdx] = { ...spk, role: e.target.value };
                                handleUpdateEventListing({ speakers: newSpeakers });
                              }}
                              placeholder="Pakar Transformasi & Peneliti Senior"
                              className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 font-bold">URL Foto Avatar</label>
                            <input
                              type="url"
                              value={spk.avatar || ''}
                              onChange={(e) => {
                                const newSpeakers = [...interactiveEventListing.speakers];
                                newSpeakers[sIdx] = { ...spk, avatar: e.target.value };
                                handleUpdateEventListing({ speakers: newSpeakers });
                              }}
                              placeholder="https://..."
                              className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 font-bold">Bio / Pengantar Singkat</label>
                          <input
                            type="text"
                            value={spk.bio || ''}
                            onChange={(e) => {
                              const newSpeakers = [...interactiveEventListing.speakers];
                              newSpeakers[sIdx] = { ...spk, bio: e.target.value };
                              handleUpdateEventListing({ speakers: newSpeakers });
                            }}
                            placeholder="Pengalaman 15 tahun di bidang transformasi digital dan inovasi..."
                            className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AGENDA & RUNDOWN */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Susunan Acara (Rundown Agenda)</h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newAgenda = [
                          ...(interactiveEventListing.agenda || []),
                          {
                            time: '',
                            topic: '',
                            speaker: ''
                          }
                        ];
                        handleUpdateEventListing({ agenda: newAgenda });
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 transition-all"
                    >
                      + Tambah Sesi Agenda
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(interactiveEventListing.agenda || []).map((ag: any, aIdx: number) => (
                      <div key={aIdx} className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center relative">
                        <div className="sm:col-span-3">
                          <label className="block text-[9px] text-slate-400 font-bold">Waktu</label>
                          <input
                            type="text"
                            value={ag.time || ''}
                            onChange={(e) => {
                              const newAgenda = [...interactiveEventListing.agenda];
                              newAgenda[aIdx] = { ...ag, time: e.target.value };
                              handleUpdateEventListing({ agenda: newAgenda });
                            }}
                            placeholder="09:00 - 10:30"
                            className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <label className="block text-[9px] text-slate-400 font-bold">Topik / Aktivitas</label>
                          <input
                            type="text"
                            value={ag.topic || ''}
                            onChange={(e) => {
                              const newAgenda = [...interactiveEventListing.agenda];
                              newAgenda[aIdx] = { ...ag, topic: e.target.value };
                              handleUpdateEventListing({ agenda: newAgenda });
                            }}
                            placeholder="Pemaparan Utama & Diskusi Sesi 1"
                            className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[9px] text-slate-400 font-bold">Pembicara / PIC</label>
                          <input
                            type="text"
                            value={ag.speaker || ''}
                            onChange={(e) => {
                              const newAgenda = [...interactiveEventListing.agenda];
                              newAgenda[aIdx] = { ...ag, speaker: e.target.value };
                              handleUpdateEventListing({ agenda: newAgenda });
                            }}
                            placeholder="Dr. Hendra Wijaya, M.Kom"
                            className="w-full p-2 border text-xs rounded bg-white dark:bg-zinc-950"
                          />
                        </div>
                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const newAgenda = (interactiveEventListing.agenda || []).filter((_: any, i: number) => i !== aIdx);
                              handleUpdateEventListing({ agenda: newAgenda });
                            }}
                            className="text-rose-500 hover:text-rose-700 text-xs font-bold pt-3"
                            title="Hapus Sesi"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIVE FORM PANEL: GLOSSARY DICTIONARY */}
            {postType === 'interactive_glossary_dictionary' && interactiveGlossaryDictionary && (
              <div className="p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-500/[0.02] dark:bg-indigo-950/20 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/40">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-sm">📚</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Konfigurasi Kamus Glosarium Istilah (A–Z)</h4>
                      <p className="text-[11px] text-slate-500">Modul istilah A–Z interaktif, auto-linking otomatis di seluruh artikel, dan DefinedTermSet Schema.org.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                    ✓ DefinedTermSet Schema Active
                  </span>
                </div>

                {/* GENERAL WIDGET CONFIG */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Judul Modul Glosarium</label>
                    <input
                      type="text"
                      value={interactiveGlossaryDictionary.widgetTitle || ''}
                      onChange={(e) => handleUpdateGlossaryDictionary({ widgetTitle: e.target.value })}
                      placeholder="e.g., Kamus Istilah & Definisi Terlengkap"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Placeholder Pencarian</label>
                    <input
                      type="text"
                      value={interactiveGlossaryDictionary.searchPlaceholder || ''}
                      onChange={(e) => handleUpdateGlossaryDictionary({ searchPlaceholder: e.target.value })}
                      placeholder="e.g., Cari istilah, kata kunci, atau singkatan..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Deskripsi Singkat Modul</label>
                    <input
                      type="text"
                      value={interactiveGlossaryDictionary.widgetDescription || ''}
                      onChange={(e) => handleUpdateGlossaryDictionary({ widgetDescription: e.target.value })}
                      placeholder="e.g., Pustaka istilah medis, pengasuhan, dan kesehatan balita terverifikasi pakar."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>

                {/* AUTO-LINKING SETTINGS */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Pengaturan Auto-Linking Situs (Auto Tooltip Ingestion)</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-medium mb-1">Maks. Link Per Istilah</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={interactiveGlossaryDictionary.autoLinkMaxPerTerm ?? 2}
                        onChange={(e) => handleUpdateGlossaryDictionary({ autoLinkMaxPerTerm: parseInt(e.target.value) || 2 })}
                        className="w-full p-2 border text-xs rounded-lg bg-slate-50 dark:bg-zinc-950"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-medium mb-1">Min. Panjang Istilah (Karakter)</label>
                      <input
                        type="number"
                        min={2}
                        max={20}
                        value={interactiveGlossaryDictionary.minTermLength ?? 3}
                        onChange={(e) => handleUpdateGlossaryDictionary({ minTermLength: parseInt(e.target.value) || 3 })}
                        className="w-full p-2 border text-xs rounded-lg bg-slate-50 dark:bg-zinc-950"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="caseSensitiveCheck"
                        checked={!!interactiveGlossaryDictionary.caseSensitive}
                        onChange={(e) => handleUpdateGlossaryDictionary({ caseSensitive: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <label htmlFor="caseSensitiveCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Peka Huruf Besar/Kecil (Case Sensitive)
                      </label>
                    </div>
                  </div>
                </div>

                {/* LIST OF TERMS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Daftar Istilah ({interactiveGlossaryDictionary.terms?.length || 0})</h5>
                      <p className="text-[10px] text-slate-500">Kelola definisi, sinonim/alias, contoh penggunaan, dan referensi rujukan.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newTerm = {
                          id: `term-${Date.now()}`,
                          term: '',
                          slug: '',
                          category: interactiveGlossaryDictionary.categories?.[0] || 'Umum',
                          shortDefinition: '',
                          longDefinition: '',
                          aliases: [],
                          examples: [],
                          sources: [],
                          isPublished: true
                        };
                        handleUpdateGlossaryDictionary({
                          terms: [...(interactiveGlossaryDictionary.terms || []), newTerm]
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-sm"
                    >
                      + Tambah Istilah
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(interactiveGlossaryDictionary.terms || []).map((t: any, tIdx: number) => (
                      <div key={t.id || tIdx} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 relative shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                          <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                            #{tIdx + 1} {t.term ? t.term : '(Istilah Baru)'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (interactiveGlossaryDictionary.terms || []).filter((_: any, i: number) => i !== tIdx);
                              handleUpdateGlossaryDictionary({ terms: updated });
                            }}
                            className="text-rose-500 hover:text-rose-700 text-xs font-bold px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/40"
                          >
                            Hapus Istilah
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-1">Nama Istilah / Kata Kunci *</label>
                            <input
                              type="text"
                              value={t.term || ''}
                              onChange={(e) => {
                                const terms = [...interactiveGlossaryDictionary.terms];
                                const val = e.target.value;
                                const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                terms[tIdx] = { ...t, term: val, slug: t.slug || slug };
                                handleUpdateGlossaryDictionary({ terms });
                              }}
                              placeholder="e.g., Stunting"
                              className="w-full p-2 border text-xs rounded-lg bg-slate-50 dark:bg-zinc-950 font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-1">Slug URL / Anchor ID</label>
                            <input
                              type="text"
                              value={t.slug || ''}
                              onChange={(e) => {
                                const terms = [...interactiveGlossaryDictionary.terms];
                                terms[tIdx] = { ...t, slug: e.target.value };
                                handleUpdateGlossaryDictionary({ terms });
                              }}
                              placeholder="e.g., stunting"
                              className="w-full p-2 border text-xs rounded-lg bg-slate-50 dark:bg-zinc-950"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-1">Kategori</label>
                            <input
                              type="text"
                              value={t.category || ''}
                              onChange={(e) => {
                                const terms = [...interactiveGlossaryDictionary.terms];
                                terms[tIdx] = { ...t, category: e.target.value };
                                handleUpdateGlossaryDictionary({ terms });
                              }}
                              placeholder="e.g., Medis & Kesehatan"
                              className="w-full p-2 border text-xs rounded-lg bg-slate-50 dark:bg-zinc-950"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold mb-1">Definisi Ringkas (Tooltip Text - Maks. 200 Karakter) *</label>
                          <textarea
                            rows={2}
                            value={t.shortDefinition || ''}
                            onChange={(e) => {
                              const terms = [...interactiveGlossaryDictionary.terms];
                              terms[tIdx] = { ...t, shortDefinition: e.target.value };
                              handleUpdateGlossaryDictionary({ terms });
                            }}
                            placeholder="Kondisi gagal tumbuh pada anak balita akibat kekurangan gizi kronis..."
                            className="w-full p-2 border text-xs rounded-lg bg-slate-50 dark:bg-zinc-950"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold mb-1">Definisi Lengkap & Penjelasan Rinci</label>
                          <textarea
                            rows={3}
                            value={t.longDefinition || ''}
                            onChange={(e) => {
                              const terms = [...interactiveGlossaryDictionary.terms];
                              terms[tIdx] = { ...t, longDefinition: e.target.value };
                              handleUpdateGlossaryDictionary({ terms });
                            }}
                            placeholder="Penjelasan mendalam, penyebab, pencegahan, dan fakta medis..."
                            className="w-full p-2 border text-xs rounded-lg bg-slate-50 dark:bg-zinc-950"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-1">Sinonim / Alias (Pisahkan dengan koma)</label>
                            <input
                              type="text"
                              value={(t.aliases || []).join(', ')}
                              onChange={(e) => {
                                const terms = [...interactiveGlossaryDictionary.terms];
                                const aliases = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                terms[tIdx] = { ...t, aliases };
                                handleUpdateGlossaryDictionary({ terms });
                              }}
                              placeholder="Gagal Tumbuh, Gizi Kronis"
                              className="w-full p-2 border text-xs rounded-lg bg-slate-50 dark:bg-zinc-950"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-1">Sumber & Referensi Rujukan (Pisahkan dengan koma)</label>
                            <input
                              type="text"
                              value={(t.sources || []).join(', ')}
                              onChange={(e) => {
                                const terms = [...interactiveGlossaryDictionary.terms];
                                const sources = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                terms[tIdx] = { ...t, sources };
                                handleUpdateGlossaryDictionary({ terms });
                              }}
                              placeholder="WHO Nutrition, Kemenkes RI"
                              className="w-full p-2 border text-xs rounded-lg bg-slate-50 dark:bg-zinc-950"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="checkbox"
                            id={`pub-${t.id || tIdx}`}
                            checked={t.isPublished !== false}
                            onChange={(e) => {
                              const terms = [...interactiveGlossaryDictionary.terms];
                              terms[tIdx] = { ...t, isPublished: e.target.checked };
                              handleUpdateGlossaryDictionary({ terms });
                            }}
                            className="rounded text-indigo-600"
                          />
                          <label htmlFor={`pub-${t.id || tIdx}`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Publikasikan Istilah Ini (Tampilkan di Kamus & Auto-Linking)
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* PROFESSIONAL WYSIWYG MARKDOWN TOOLBAR */}
            {/* ------------------------------------------------------------- */}
            
            {/* MOBILE FLOATING / TOUCH-FRIENDLY TOOLBAR (< MD) */}
            <div className="md:hidden border border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 p-1.5 flex items-center justify-between gap-1 overflow-x-auto shadow-sm">
              <button
                type="button"
                onClick={() => applyFormatting('**', '**', 'teks tebal')}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold shadow-xs active:bg-slate-200 shrink-0"
                title="Cetak Tebal / Bold"
              >
                <Bold className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('*', '*', 'teks miring')}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold shadow-xs active:bg-slate-200 shrink-0"
                title="Cetak Miring / Italic"
              >
                <Italic className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('## ', '', 'Subjudul Bagian')}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-sm shadow-xs active:bg-slate-200 shrink-0"
                title="Subjudul H2"
              >
                <Heading2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('- ', '', 'Poin item')}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold shadow-xs active:bg-slate-200 shrink-0"
                title="Daftar Poin"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs active:bg-emerald-200 shrink-0"
                title="Sisipkan Gambar"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 font-bold shadow-xs active:bg-purple-200 shrink-0"
                title="Sisipkan Video (YouTube, TikTok, Instagram)"
              >
                <Video className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleOpenProductPicker}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold shadow-xs active:bg-rose-200 shrink-0"
                title="Sisipkan Kotak Produk Penawaran"
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (textareaRef.current) {
                    const start = textareaRef.current.selectionStart;
                    const end = textareaRef.current.selectionEnd;
                    setLinkText(textareaRef.current.value.substring(start, end));
                  }
                  setShowLinkModal(true);
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold shadow-xs active:bg-rose-200 shrink-0"
                title="Sisipkan Tautan"
              >
                <LinkIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleOpenRefModal}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold shadow-xs active:bg-amber-200 shrink-0"
                title="💡 Tips Sitasi / Referensi: Tulis [ref: Nama Penulis, Judul Artikel, Nama Jurnal, Tahun] atau tambahkan URL/DOI di akhir jika ada. Tautan dan nomor catatan kaki [1] akan dibuat otomatis!"
              >
                <span className="text-base">📚</span>
              </button>
              <button
                type="button"
                onClick={handleUndo}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold shadow-xs active:bg-slate-200 shrink-0"
                title="Undo"
              >
                <Undo className="w-5 h-5" />
              </button>
            </div>

            {/* DESKTOP FULL TOOLBAR (>= MD) */}
            <div className="flex flex-wrap items-center justify-between gap-1 border-b-2 border-slate-400 dark:border-slate-600 pb-2 bg-slate-200 dark:bg-slate-900 p-2 rounded-t-lg shadow-sm">
              {/* Group 1: Text Formatting */}
              <div className="flex items-center gap-0.5 pr-2 border-r-2 border-slate-300 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => applyFormatting('**', '**', 'teks tebal')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold transition-colors shadow-2xs"
                  title="Cetak Tebal / Bold (**teks**)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('*', '*', 'teks miring')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold transition-colors shadow-2xs"
                  title="Cetak Miring / Italic (*teks*)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('~~', '~~', 'teks dicoret')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold transition-colors shadow-2xs"
                  title="Coret / Strikethrough (~~teks~~)"
                >
                  <Strikethrough className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleFlyingClearFormatting}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold transition-colors shadow-2xs"
                  title="Hapus Semua Format (Normal Teks Tanpa Markup)"
                >
                  <RemoveFormatting className="w-4 h-4" />
                </button>
              </div>

              {/* Group 2: Headings */}
              <div className="flex items-center gap-0.5 px-2 border-r-2 border-slate-300 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => applyFormatting('## ', '', 'Subjudul Bagian (H2)')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-extrabold transition-colors text-xs shadow-2xs"
                  title="Subjudul Bagian (H2)"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('### ', '', 'Subjudul Kecil (H3)')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-extrabold transition-colors text-xs shadow-2xs"
                  title="Subjudul Kecil (H3)"
                >
                  <Heading3 className="w-4 h-4" />
                </button>
              </div>

              {/* Group 3: Lists & Structuring */}
              <div className="flex items-center gap-0.5 px-2 border-r-2 border-slate-300 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => applyFormatting('- ', '', 'Poin item')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold transition-colors shadow-2xs"
                  title="Daftar Poin / Bullet List (-)"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('1. ', '', 'Langkah pertama')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold transition-colors shadow-2xs"
                  title="Daftar Angka / Numbered List (1.)"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('- [ ] ', '', 'Tugas selesai')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold transition-colors shadow-2xs"
                  title="Checklist (- [ ])"
                >
                  <CheckSquare className="w-4 h-4" />
                </button>
              </div>

              {/* Group 4: Insert Blocks */}
              <div className="flex items-center gap-0.5 px-2 border-r-2 border-slate-300 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => applyFormatting('> ', '', 'Kutipan mutiara atau inspirasi')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold transition-colors shadow-2xs"
                  title="Kutipan / Blockquote (>)"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('```\n', '\n```', 'kode_atau_skrip')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold transition-colors shadow-2xs"
                  title="Blok Kode (```)"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={insertTable}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold transition-colors shadow-2xs"
                  title="Sisipkan Tabel Markdown"
                >
                  <Table className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('\n\n---\n\n', '')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold transition-colors shadow-2xs"
                  title="Garis Pemisah Horizontal (---)"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              {/* Group 5: Action Buttons (High Contrast Colors) */}
              <div className="flex items-center gap-1 pl-2">
                <button
                  type="button"
                  onClick={() => {
                    if (textareaRef.current) {
                      const start = textareaRef.current.selectionStart;
                      const end = textareaRef.current.selectionEnd;
                      setLinkText(textareaRef.current.value.substring(start, end));
                    }
                    setShowLinkModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-sky-100 border border-sky-500 dark:bg-sky-950 dark:border-sky-600 text-sky-950 dark:text-sky-100 font-extrabold text-xs hover:bg-sky-200 transition-colors flex items-center gap-1 shadow-2xs"
                  title="Sisipkan Hyperlink Tautan"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Tautan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-500 dark:bg-emerald-950 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 font-extrabold text-xs hover:bg-emerald-200 transition-colors flex items-center gap-1 shadow-2xs"
                  title="Sisipkan / Upload Gambar Artikel"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Gambar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-purple-100 border border-purple-500 dark:bg-purple-950 dark:border-purple-600 text-purple-950 dark:text-purple-100 font-extrabold text-xs hover:bg-purple-200 transition-colors flex items-center gap-1 shadow-2xs"
                  title="Sisipkan Video (YouTube, TikTok, Instagram)"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenProductPicker}
                  className="px-2.5 py-1 rounded-lg bg-blue-100 border border-blue-500 dark:bg-blue-950 dark:border-blue-600 text-blue-950 dark:text-blue-100 font-extrabold text-xs hover:bg-blue-200 transition-colors flex items-center gap-1 shadow-2xs"
                  title="Sisipkan Kotak Produk Penawaran"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Produk</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenRefModal}
                  className="px-2.5 py-1 rounded-lg bg-amber-200 border border-amber-600 dark:bg-amber-900 dark:border-amber-500 text-amber-950 dark:text-amber-100 font-extrabold text-xs hover:bg-amber-300 transition-colors flex items-center gap-1 shadow-2xs"
                  title="💡 Tips Sitasi / Referensi: Tulis [ref: Nama Penulis, Judul Artikel, Nama Jurnal, Tahun] atau tambahkan URL/DOI di akhir jika ada."
                >
                  <span>📚</span>
                  <span>Referensi</span>
                </button>
              </div>

              {/* Group 6: History & Status */}
              <div className="flex items-center gap-1 border-l-2 border-slate-300 dark:border-slate-600 pl-2">
                <button
                  type="button"
                  onClick={handleUndo}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                  title="Undo (Urungkan)"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                  title="Redo (Ulangi)"
                >
                  <Redo className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleFlyingClearFormatting}
                  className="px-2 py-1 text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:text-rose-700 bg-slate-300 dark:bg-slate-700 rounded border border-slate-400 dark:border-slate-600"
                  title="Bersihkan Format pada Teks Terpilih"
                >
                  Bersihkan
                </button>
                <span
                  id="flying-toolbar-status-badge"
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100 border border-emerald-500 shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Flying Toolbar Aktif</span>
                </span>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* EDITOR VIEWPORTS (WRITE / SPLIT / PREVIEW) */}
            {/* ------------------------------------------------------------- */}
            <div className="min-h-[420px]">
              
              {/* WRITE MODE */}
              {viewMode === 'write' && (
                <div>
                  <textarea
                    ref={textareaRef}
                    rows={18}
                    value={markdown}
                    onChange={(e) => updateMarkdownWithHistory(e.target.value)}
                    onMouseUp={(e) => updateFlyingToolbar(e.clientX, e.clientY)}
                    onKeyUp={(e) => {
                      if (e.key === 'Shift' || e.key.startsWith('Arrow')) {
                        updateFlyingToolbar();
                      }
                    }}
                    onSelect={() => updateFlyingToolbar()}
                    onScroll={() => {
                      if (flyingToolbar.visible && !flyingLinkMode) {
                        setFlyingToolbar(prev => ({ ...prev, visible: false }));
                      }
                    }}
                    placeholder="Tulis artikel lengkap dengan format markdown di sini..."
                    className={`w-full p-4 sm:p-6 rounded-2xl border font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 ${
                      userRole === 'writer'
                        ? 'bg-white dark:bg-slate-900/90 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:ring-emerald-500/50'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-rose-500'
                    }`}
                  />
                </div>
              )}

              {/* SPLIT VIEW MODE (EDITOR LEFT, PREVIEW RIGHT) */}
              {viewMode === 'split' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Editor Markdown
                    </div>
                    <textarea
                      ref={textareaRef}
                      rows={18}
                      value={markdown}
                      onChange={(e) => updateMarkdownWithHistory(e.target.value)}
                      onMouseUp={(e) => updateFlyingToolbar(e.clientX, e.clientY)}
                      onKeyUp={(e) => {
                        if (e.key === 'Shift' || e.key.startsWith('Arrow')) {
                          updateFlyingToolbar();
                        }
                      }}
                      onSelect={() => updateFlyingToolbar()}
                      onScroll={() => {
                        if (flyingToolbar.visible && !flyingLinkMode) {
                          setFlyingToolbar(prev => ({ ...prev, visible: false }));
                        }
                      }}
                      placeholder="Tulis konten artikel di sini..."
                      className={`w-full p-4 rounded-2xl border font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 ${
                        userRole === 'writer'
                          ? 'bg-white dark:bg-slate-900/90 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:ring-emerald-500/50'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-rose-500'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 mb-1 flex items-center justify-between">
                      <span>Pratinjau Hasil Real-Time (Live)</span>
                      <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        Tautan Otomatis Aktif
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-[440px] overflow-y-auto article-body max-w-none text-slate-800 dark:text-slate-200">
                      <div dangerouslySetInnerHTML={{ __html: parsedPreviewHtml || '<p class="text-slate-400 italic">Pratinjau artikel akan muncul di sini saat Anda mengetik...</p>' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* FULL PREVIEW MODE */}
              {viewMode === 'preview' && (
                <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
                  <div className="border-b pb-4">
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-bold text-xs">
                      {category}
                    </span>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                      {title || 'Judul Artikel'}
                    </h1>
                    {excerpt && (
                      <p className="text-slate-600 italic border-l-4 border-rose-500 pl-3 py-1 mt-2 text-sm">
                        "{excerpt}"
                      </p>
                    )}
                  </div>

                  {featuredImage && (
                    <img
                      src={featuredImage}
                      alt={title}
                      width={800}
                      height={320}
                      loading="lazy"
                      decoding="async"
                      className="w-full max-h-80 object-cover rounded-2xl"
                    />
                  )}

                  <div
                    className="article-body max-w-none text-slate-800 dark:text-slate-200"
                    dangerouslySetInnerHTML={{ __html: parsedPreviewHtml }}
                  />
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CONTENT EDITOR STATS BAR */}
            {/* ------------------------------------------------------------- */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-4">
                <span>📝 <strong>{stats.words}</strong> Kata</span>
                <span>•</span>
                <span>🔤 <strong>{stats.chars}</strong> Karakter</span>
                <span>•</span>
                <span>📄 <strong>{stats.paragraphs}</strong> Paragraf</span>
              </div>
              <div>
                ⏱️ Estimasi Waktu Baca: <strong className="text-rose-600">{stats.readTime} Menit</strong>
              </div>
            </div>

            {/* TIPS REFERENSI ILMIAH (E-E-A-T) */}
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="text-base shrink-0">💡</span>
                <div className="space-y-1">
                  <span className="font-extrabold block text-amber-950 dark:text-amber-100">Tips Sitasi / Referensi:</span>
                  <p className="leading-relaxed font-medium">
                    Tulis <code className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 font-mono text-[11px] text-amber-950 dark:text-amber-200 font-bold">[ref: Nama Penulis, Judul Artikel, Nama Jurnal, Tahun]</code> atau tambahkan URL/DOI di akhir jika ada. Tautan dan nomor catatan kaki [1] akan dibuat otomatis!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/30 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-amber-200/60 dark:border-amber-900/30">
                  <div className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                    <span>1. Format Tanpa URL (Termudah):</span>
                    <button 
                      type="button"
                      onClick={() => applyFormatting('', '', ' [ref: Prof. Suparman, "Pola Makan Balita", Jurnal Kesehatan, 2026]')}
                      className="text-[10px] text-rose-600 dark:text-rose-400 font-bold hover:underline"
                    >
                      + Sisipkan
                    </button>
                  </div>
                  <code className="block font-mono text-[10px] text-slate-600 dark:text-slate-400 break-all select-all">
                    [ref: Prof. Suparman, "Pola Makan Balita", Jurnal Kesehatan, 2026]
                  </code>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-amber-200/60 dark:border-amber-900/30">
                  <div className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                    <span>2. Format Dengan URL/DOI:</span>
                    <button 
                      type="button"
                      onClick={() => applyFormatting('', '', ' [ref: Prof. Suparman, "Pola Makan Balita", Jurnal Kesehatan, 2026, https://doi.org/10.1016/j.kesehatan.2026]')}
                      className="text-[10px] text-rose-600 dark:text-rose-400 font-bold hover:underline"
                    >
                      + Sisipkan
                    </button>
                  </div>
                  <code className="block font-mono text-[10px] text-slate-600 dark:text-slate-400 break-all select-all">
                    [ref: Prof. Suparman, "Pola Makan Balita", Jurnal Kesehatan, 2026, https://doi.org/10.1016/j.kesehatan.2026]
                  </code>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ASSISTANT, METADATA, & REVISIONS SECTIONS STACKED BELOW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* LEFT BOTTOM ROW: AI & METADATA */}
          <div className="space-y-6">
          
          {/* AI GEMINI ASSISTANT CARD */}
          {userRole !== 'writer' && (
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-3xl p-6 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                  AI Content Assistant
                </span>
              </div>
              <p className="text-xs text-rose-100 leading-relaxed">
                Otomatis buatkan Meta Title, Meta Description, Ringkasan, & Tag SEO menggunakan Gemini AI.
              </p>
              <button
                type="button"
                onClick={onAiGenerateMeta}
                disabled={isAiLoading || !title}
                className="w-full py-2.5 rounded-xl bg-white text-rose-600 font-bold text-xs shadow-sm hover:bg-rose-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isAiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-rose-600" />}
                <span>Generate SEO Meta dengan AI</span>
              </button>
            </div>
          )}

          {/* METADATA & EXCERPT CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {userRole === 'writer' ? 'Ringkasan & Gambar Sampul' : 'Meta SEO & Gambar Sampul'}
            </h4>

            {/* FEATURED IMAGE */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  URL Gambar Sampul (Featured Image) {userRole === 'writer' && <span className="text-[10px] font-normal text-slate-400 ml-1">(opsional)</span>}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setImageTab('upload');
                    setShowImageModal(true);
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload / Pilih Gambar</span>
                </button>
              </div>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(sanitizeAndOptimizeImageUrl(e.target.value, 'featured'))}
                onBlur={(e) => setFeaturedImage(sanitizeAndOptimizeImageUrl(e.target.value, 'featured'))}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono"
              />
              {featuredImage && (
                <div className="relative mt-2">
                  <img
                    src={featuredImage}
                    alt="Preview"
                    width={400}
                    height={128}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedImage('')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
                    title="Hapus gambar sampul"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* EXCERPT */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Ringkasan Artikel (Excerpt) {userRole === 'writer' && <span className="text-[10px] font-normal text-slate-400 ml-1">(opsional)</span>}
              </label>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Ringkasan singkat artikel untuk kartu di halaman depan..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs leading-relaxed"
              />
            </div>

            {/* META TITLE & META DESC FOR NON-WRITER */}
            {userRole !== 'writer' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Meta Title SEO
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Judul khusus untuk Google Search..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Meta Description SEO
                  </label>
                  <textarea
                    rows={2}
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                    placeholder="Deskripsi pencarian Google..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </>
            )}

            {/* TAGS */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Topik / Tag (Pisahkan dengan koma) {userRole === 'writer' && <span className="text-[10px] font-normal text-slate-400 ml-1">(opsional)</span>}
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="pola asuh, balita, gizi anak"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>

            {/* PENGATURAN DISCLAIMER (E-E-A-T COMPLIANT) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Disclaimer Penegasan Konten {userRole === 'writer' && <span className="text-[10px] font-normal text-slate-400 ml-1">(opsional)</span>}
              </label>
              <select
                value={disclaimerType}
                onChange={(e) => setDisclaimerType && setDisclaimerType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900"
              >
                <option value="none">Tanpa Disclaimer (Default)</option>
                <option value="medical_psychology">Kesehatan / Medis / Psikologi</option>
                <option value="financial">Keuangan / Investasi / Tips Finansial</option>
                <option value="legal">Hukum / Peraturan / Legalitas</option>
                <option value="academic">Akademik / Ujian / Pendidikan</option>
                <option value="custom">Kustom (Tulis Teks Sendiri)</option>
              </select>

              {disclaimerType === 'custom' && (
                <div className="mt-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                    Isi Teks Disclaimer Kustom
                  </label>
                  <textarea
                    rows={3}
                    value={customDisclaimerText}
                    onChange={(e) => setCustomDisclaimerText && setCustomDisclaimerText(e.target.value)}
                    placeholder="Tuliskan catatan disclaimer hukum/medis/akademis kustom Anda di sini..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900"
                  />
                </div>
              )}

              {disclaimerType !== 'none' && disclaimerType !== 'custom' && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 leading-relaxed">
                  <span className="font-semibold block mb-0.5 text-slate-600 dark:text-slate-400">Pratinjau Disclaimer:</span>
                  {disclaimerType === 'medical_psychology' && "Hasil evaluasi interaktif dan informasi dalam artikel ini dirancang sebagai instrumen refleksi diri dan edukasi mandiri. Konten ini tidak menggantikan diagnosis, pemeriksaan medis, atau konsultasi resmi dengan psikolog klinis, dokter, atau tenaga ahli kesehatan terlisensi."}
                  {disclaimerType === 'financial' && "Seluruh informasi keuangan, tips investasi, dan kalkulasi di dalam artikel ini bersifat edukatif saja dan tidak boleh ditafsirkan sebagai nasihat keuangan resmi atau ajakan berinvestasi. Hubungi penasihat keuangan bersertifikasi sebelum mengambil keputusan."}
                  {disclaimerType === 'legal' && "Konten ini dipublikasikan untuk tujuan informasi umum dan bantuan pembelajaran mandiri. Informasi hukum di sini tidak membentuk hubungan penasihat-klien dan bukan merupakan konsultasi hukum formal resmi. Hubungi penasihat hukum profesional jika Anda memerlukan bantuan khusus."}
                  {disclaimerType === 'academic' && "Naskah, kisi-kisi soal, naskah ujian, atau materi tes yang disajikan di halaman ini disiapkan untuk simulasi pendidikan dan latihan mandiri saja. Kelulusan, penilaian akhir, atau evaluasi akademik formal sepenuhnya mengikuti keputusan resmi dari institusi penyelenggara terkait."}
                </div>
              )}
            </div>

          </div>
          </div>

          {/* RIGHT BOTTOM ROW: SEO AUDITOR, AUTHORS & REVISIONS */}
          <div className="space-y-6">

          {/* REAL-TIME AUTO IN-PAGE SEO AUDITOR WIDGET */}
          {userRole !== 'writer' && (
            <SeoAuditWidget
              title={title}
              metaTitle={metaTitle}
              setMetaTitle={setMetaTitle}
              metaDesc={metaDesc}
              setMetaDesc={setMetaDesc}
              markdown={markdown}
              featuredImage={featuredImage}
              tags={tags}
              onAutoOptimizeMeta={() => {
                if (title) {
                  setMetaTitle(`${title} | ${siteConfig?.site_name || 'Blog'}`);
                }
                const plainText = (excerpt || markdown || '').replace(/<[^>]+>/g, '').replace(/[#*`_~]/g, ' ').trim();
                const truncated = plainText.length > 155 ? plainText.substring(0, 155) + '...' : plainText;
                if (truncated) {
                  setMetaDesc(truncated);
                }
              }}
            />
          )}

          {/* MULTI-AUTHOR & CREDENTIALS CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-600" />
              <span>Menulis Bersama (Co-Author) <span className="text-[10px] font-normal text-slate-400 ml-1">(opsional)</span></span>
            </h4>

            {/* PRIMARY AUTHOR */}
            {setAuthorId && writers.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Penulis Utama (Primary Author)
                </label>
                {userRole === 'writer' ? (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    {writers.find(w => w.id === authorId)?.name || 'Penulis Aktif'}
                  </div>
                ) : (
                  <select
                    value={authorId || ''}
                    onChange={(e) => setAuthorId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    {writers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} {w.title ? `(${w.title})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* CO-AUTHORS MULTI-SELECT IN COLLAPSIBLE ACCORDION */}
            {setCoAuthorIds && writers.length > 1 && (
              <details className="group pt-2 border-t border-slate-100 dark:border-slate-800">
                <summary className="text-[11px] font-bold text-slate-600 dark:text-slate-400 cursor-pointer flex items-center justify-between hover:text-rose-600 transition-colors">
                  <span>👥 Tambah Penulis Bersama / Co-Author <span className="text-[10px] font-normal text-slate-400 ml-1">(opsional)</span></span>
                  <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 mt-3">
                  {writers
                    .filter((w) => Number(w.id) !== Number(authorId) && Number(w.id) !== Number(currentLoggedInUserId))
                    .map((w) => {
                      const safeList = Array.isArray(coAuthorIds) ? coAuthorIds : [];
                      const isChecked = safeList.includes(w.id);
                      return (
                        <label
                          key={w.id}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 font-bold'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCoAuthorIds([...safeList, w.id]);
                              } else {
                                setCoAuthorIds(safeList.filter((id) => id !== w.id));
                              }
                            }}
                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                          />
                          <img
                            src={getOptimizedAvatarUrl(w.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', 24, 60)}
                            alt={w.name}
                            width={24}
                            height={24}
                            loading="lazy"
                            decoding="async"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="truncate">
                            <span className="text-xs font-bold block">{w.name}</span>
                            <span className="text-[10px] text-slate-500 block truncate">{w.title || w.role}</span>
                          </div>
                        </label>
                      );
                    })}
                </div>
              </details>
            )}
          </div>

          {/* REVISION HISTORY CARD (HISTORI REVISI MAX 3 VERSI) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <History className="w-4 h-4 text-amber-500" />
                <span>Versi Tulisan Sebelumnya dan Pulihkan {userRole === 'writer' && <span className="text-[10px] font-normal text-slate-400 ml-1">(opsional)</span>}</span>
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold">
                {revisions.length}/3 Versi
              </span>
            </div>

            {revisions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Belum ada histori revisi disimpan. Revisi tersimpan otomatis saat artikel diperbarui (maksimal 3 versi terkini).
              </p>
            ) : (
              <div className="space-y-3">
                {revisions.map((rev, idx) => {
                  const dateFormatted = new Date(rev.updatedAt || rev.timestamp).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div
                      key={rev.id || idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" /> Versi #{revisions.length - idx} ({dateFormatted})
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          Oleh {rev.updatedByName}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
                        "{rev.title}"
                      </p>
                      {onRestoreRevision && (
                        <button
                          type="button"
                          onClick={() => onRestoreRevision(rev)}
                          className="w-full py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-sm transition-colors flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Kembalikan ke Versi Ini (Rollback)</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
      </div>

      {/* BOTTOM ACTION BAR FOR CONVENIENT SAVING / PUBLISHING */}
      <div className="flex flex-col gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick Tulis & Pratinjau toggle at bottom bar */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={() => setViewMode('write')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'write'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Tulis</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'preview'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* Simpan Draf */}
            <button
              type="button"
              onClick={() => onPublishSubmit('draft')}
              className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 text-xs font-bold transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Simpan Draf</span>
            </button>

            {/* Writer Specific Action */}
            {userRole === 'writer' && (
              <button
                type="button"
                onClick={() => onPublishSubmit('pending_approval')}
                className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim untuk Ditinjau 🚀</span>
              </button>
            )}

            {/* Editor & Admin Actions */}
            {(userRole === 'editor' || userRole === 'admin') && (
              <>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-2xl bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-xs font-bold border border-rose-800/60 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Tolak / Minta Revisi</span>
                </button>

                <button
                  type="button"
                  onClick={() => onPublishSubmit('published')}
                  className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg transition-colors flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Setujui & Terbitkan ✅</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status Artikel at the very bottom after all buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start gap-3">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Status Artikel:
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
            currentStatus === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
            currentStatus === 'pending_approval' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
            currentStatus === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}>
            {currentStatus === 'published' ? 'Terbit ✅' :
             currentStatus === 'pending_approval' ? 'Menunggu Ditinjau ⏳' :
             currentStatus === 'rejected' ? 'Perlu Revisi ❌' : 'Draf 📝'}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL INSERT LINK */}
      {/* ------------------------------------------------------------- */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-rose-600" />
                <span>Sisipkan Tautan Hyperlink</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teks Tautan (Anchor Text)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Contoh: Baca panduan pola asuh balita"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL Tujuan (Link)
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://domain-anda.com/baca/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
                >
                  Sisipkan Tautan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL INSERT SCIENTIFIC REFERENCE (E-E-A-T) */}
      {/* ------------------------------------------------------------- */}
      {showRefModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-base">📚</span>
                <span>Sisipkan Referensi Ilmiah (E-E-A-T)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowRefModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tooltip Tips Box */}
            <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <span className="text-sm shrink-0">💡</span>
              <p className="leading-relaxed font-medium">
                <strong>Tips Sitasi / Referensi:</strong> Tulis <code>[ref: Nama Penulis, Judul Artikel, Nama Jurnal, Tahun]</code> atau tambahkan URL/DOI di akhir jika ada. Tautan dan nomor catatan kaki [1] akan dibuat otomatis!
              </p>
            </div>

            {/* Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-bold mr-1">Contoh Cepat:</span>
              <button
                type="button"
                onClick={() => {
                  setRefAuthor('Prof. Suparman');
                  setRefTitle('Pola Makan Balita');
                  setRefJournal('Jurnal Kesehatan');
                  setRefYear('2026');
                  setRefUrl('');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Tanpa URL (Termudah)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRefAuthor('Prof. Suparman');
                  setRefTitle('Pola Makan Balita');
                  setRefJournal('Jurnal Kesehatan');
                  setRefYear('2026');
                  setRefUrl('https://doi.org/10.1016/j.kesehatan.2026');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Dengan DOI / URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setRefAuthor('');
                  setRefTitle('');
                  setRefJournal('');
                  setRefYear('');
                  setRefUrl('');
                }}
                className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
              >
                Reset
              </button>
            </div>

            <form onSubmit={handleInsertReference} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Penulis / Institusi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={refAuthor}
                  onChange={(e) => setRefAuthor(e.target.value)}
                  placeholder="Contoh: Prof. Suparman atau Suparman et al."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Artikel / Publikasi <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={refTitle}
                  onChange={(e) => setRefTitle(e.target.value)}
                  placeholder="Contoh: Pola Makan Balita Sehat"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Jurnal / Penerbit <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={refJournal}
                    onChange={(e) => setRefJournal(e.target.value)}
                    placeholder="Contoh: Jurnal Kesehatan"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tahun Terbit <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={refYear}
                    onChange={(e) => setRefYear(e.target.value)}
                    placeholder="Contoh: 2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL Tautan atau Nomor DOI <span className="text-slate-400 font-normal">(Opsional - boleh dikosongkan)</span>
                </label>
                <input
                  type="text"
                  value={refUrl}
                  onChange={(e) => setRefUrl(e.target.value)}
                  placeholder="Contoh: https://doi.org/10.1016/... atau 10.1016/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Jika dikosongkan, referensi tetap tampil elegan dan kredibel tanpa tautan biru.
                </p>
              </div>

              {/* Tag Live Preview */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px]">
                <span className="text-slate-400 block mb-0.5 font-bold">Kode Tag yang Akan Disisipkan:</span>
                <code className="font-mono text-rose-600 dark:text-rose-400 font-bold break-all">
                  {`[ref: ${[
                    refAuthor.trim() || 'Prof. Suparman',
                    refTitle.trim() ? `"${refTitle.trim().replace(/^["']|["']$/g, '')}"` : '',
                    refJournal.trim(),
                    refYear.trim(),
                    refUrl.trim()
                  ].filter(Boolean).join(', ')}]`}
                </code>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRefModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-sm flex items-center gap-1.5"
                >
                  <span>Sisipkan Referensi</span>
                  <span>✨</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL INSERT IMAGE */}
      {/* ------------------------------------------------------------- */}
      {showImageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Sisipkan Gambar Artikel</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB MODE SWITCHER */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  imageTab === 'upload' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageTab('unsplash')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  imageTab === 'unsplash' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Galeri Unsplash
              </button>
              <button
                type="button"
                onClick={() => setImageTab('url')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  imageTab === 'url' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                URL Direct
              </button>
            </div>

            {/* TAB 1: UPLOAD FILE CLOUDINARY */}
            {imageTab === 'upload' && (
              <div className="space-y-4 py-1">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <span>☁️ Upload Gambar ke Server Cloudinary</span>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    <li><b>Format Output:</b> Otomatis dikonversi ke format <b>WebP</b> ultra-ringan.</li>
                    <li><b>Dimensi Maksimal:</b> Selebar layar tablet (<b>1024px</b>) agar ramah seluler.</li>
                    <li><b>Batas Ukuran File:</b> Maksimal <b>3 MB</b> per gambar.</li>
                    <li><b>Lazy Loading:</b> Otomatis diterapkan saat artikel dirender.</li>
                  </ul>
                  <div className="pt-1.5 text-[10px] text-slate-500 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span><b>Keamanan Terjamin:</b> API Secret disimpan aman di Server-Side (`/api/upload-cloudinary`), tidak pernah diekspos ke browser / GitHub.</span>
                  </div>
                </div>

                <label className="cursor-pointer block border-2 border-dashed border-rose-300 dark:border-rose-900 rounded-2xl p-6 text-center hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors">
                  <Upload className="w-8 h-8 text-rose-500 mx-auto mb-2 animate-bounce" />
                  <span className="text-xs font-bold text-rose-600 block">
                    {uploadingImage ? 'Mengunggah & Mengonversi ke WebP...' : 'Pilih File Gambar (PNG, JPG, WebP)'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Maksimal 3 MB • Otomatis Resizing & Optimasi WebP
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>

                {imageUrl && (
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Gambar Berhasil Diunggah (.webp)</span>
                      </span>
                      <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded-full font-mono">
                        webp ready
                      </span>
                    </div>

                    <div className="relative group overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-800 bg-black/5">
                      <img
                        src={imageUrl}
                        alt="Uploaded WebP"
                        width={400}
                        height={144}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-36 object-cover rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Deskripsi / Alt Text Gambar (SEO Friendly)
                      </label>
                      <input
                        type="text"
                        value={imageAlt}
                        onChange={(e) => setImageAlt(e.target.value)}
                        placeholder="Contoh: Ilustrasi pendukung artikel"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleInsertImage(imageUrl, imageAlt || 'Gambar Artikel')}
                        className="col-span-2 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>Sisipkan Langsung ke Body Artikel</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const markdownTag = `![${imageAlt || 'Gambar Artikel'}](${imageUrl})`;
                          navigator.clipboard.writeText(markdownTag);
                          setCopyFeedback('markdown');
                          setTimeout(() => setCopyFeedback(null), 2500);
                        }}
                        className="py-2 px-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copyFeedback === 'markdown' ? '✓ Tersalin!' : 'Salin Markdown'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(imageUrl);
                          setCopyFeedback('url');
                          setTimeout(() => setCopyFeedback(null), 2500);
                        }}
                        className="py-2 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>{copyFeedback === 'url' ? '✓ URL Tersalin!' : 'Salin URL WebP'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFeaturedImage(imageUrl);
                          setShowImageModal(false);
                        }}
                        className="col-span-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 mt-1"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Jadikan Gambar Sampul Artikel (Featured Image)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: GALERI UNSPLASH */}
            {imageTab === 'unsplash' && (
              <div className="space-y-3 py-1">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Pilih foto bebas royalti Unsplash atau ketik kata kunci custom:
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={unsplashSearch}
                    onChange={(e) => setUnsplashSearch(e.target.value)}
                    placeholder="Cari kata kunci (cth: baby, mother, toddler)..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                  />
                  {unsplashSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        const searchUrl = `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80`;
                        setImageUrl(searchUrl);
                        setImageAlt(unsplashSearch);
                      }}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
                    >
                      Pilih
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  {UNSPLASH_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setImageUrl(preset.url);
                        setImageAlt(preset.label);
                      }}
                      className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-colors ${
                        imageUrl === preset.url ? 'border-rose-500 ring-2 ring-rose-200' : 'border-transparent hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={getOptimizedImageUrl(preset.url, { width: 200, height: 80, quality: 55 })}
                        alt={preset.label}
                        width={200}
                        height={80}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5">
                        <span className="text-[10px] font-bold text-white block truncate">{preset.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {imageUrl && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-2">
                    <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block">Gambar Terpilih: {imageAlt || 'Unsplash Image'}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleInsertImage(imageUrl, imageAlt || 'Gambar Unsplash')}
                        className="flex-1 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        📌 Sisipkan ke Body
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFeaturedImage(sanitizeAndOptimizeImageUrl(imageUrl, 'featured'));
                          setShowImageModal(false);
                        }}
                        className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        🖼️ Jadikan Sampul
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: URL DIRECT */}
            {imageTab === 'url' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleInsertImage(imageUrl, imageAlt);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    URL Gambar
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Deskripsi / Alt Text
                  </label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Contoh: Ilustrasi balita bermain sensory play"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>

                {imageUrl && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Pratinjau Gambar:</span>
                    <img
                      src={imageUrl}
                      alt="Preview"
                      width={400}
                      height={112}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-28 object-cover rounded-xl border"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowImageModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImage(sanitizeAndOptimizeImageUrl(imageUrl, 'featured'));
                      setShowImageModal(false);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900"
                  >
                    Jadikan Sampul
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
                  >
                    Sisipkan Gambar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL INSERT VIDEO */}
      {/* ------------------------------------------------------------- */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-600" />
                <span>Sisipkan Video Responsive</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Platform Video
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  {(['youtube', 'tiktok', 'instagram'] as const).map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => setVideoPlatform(platform)}
                      className={`py-1.5 rounded-lg capitalize transition-colors ${
                        videoPlatform === platform
                          ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat URL Video atau ID Video
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder={
                    videoPlatform === 'youtube'
                      ? 'https://www.youtube.com/watch?v=...'
                      : videoPlatform === 'tiktok'
                      ? 'https://www.tiktok.com/@username/video/...'
                      : 'https://www.instagram.com/p/...'
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono"
                  required
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                  Tempelkan URL video lengkap. Pemutar video akan ditampilkan secara responsif dan ramah seluler.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700"
                >
                  Sisipkan Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL PICK PRODUCT TO INSERT */}
      {/* ------------------------------------------------------------- */}
      {showProductPickerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-shrink-0">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-rose-600" />
                <span>Pilih Produk Jualan untuk Disematkan</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowProductPickerModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {pickerLoading ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-bold">Memuat daftar produk...</p>
                </div>
              ) : pickerProducts.length === 0 ? (
                <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs font-bold text-slate-500">Belum ada produk jualan yang dibuat.</p>
                  <p className="text-[11px] text-slate-400">Silakan buat produk terlebih dahulu di menu "Jualan / Produk" Portal Admin.</p>
                </div>
              ) : (
                pickerProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProductToInsert(prod.slug)}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-rose-500 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 cursor-pointer transition-all flex items-center gap-4 group"
                  >
                    <img src={prod.imageUrl} alt={prod.title} className="w-14 h-14 object-cover rounded-xl flex-shrink-0 bg-slate-200" />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-rose-600">
                        {prod.title}
                      </h4>
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-black">
                        Rp {Number(prod.price).toLocaleString('id-ID')}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">Slug: {prod.slug}</p>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      Pilih & Sisipkan
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end pt-2 flex-shrink-0 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowProductPickerModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
