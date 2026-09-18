import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Tag, ArrowRight, ExternalLink, ChevronDown, ChevronUp, Layers, HelpCircle, X } from 'lucide-react';
import { InteractiveGlossaryDictionaryData, GlossaryTerm } from '../types';

interface Props {
  config: InteractiveGlossaryDictionaryData;
}

export const InteractiveGlossaryDictionary: React.FC<Props> = ({ config }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);
  const [modalTerm, setModalTerm] = useState<GlossaryTerm | null>(null);

  const {
    widgetTitle = 'Kamus Glosarium & Istilah',
    widgetDescription = 'Panduan definisi istilah teknis dan konsep penting dari A sampai Z.',
    emptyStateText = 'Belum ada istilah yang ditambahkan dalam glosarium ini.',
    searchPlaceholder = 'Cari istilah, definisi, atau sinonim...',
    terms = []
  } = config || {};

  // Filter published terms
  const activeTerms = useMemo(() => {
    return terms.filter(t => t.isPublished !== false);
  }, [terms]);

  // Extract available letters (calculated dynamically)
  const availableLetters = useMemo(() => {
    const lettersSet = new Set<string>();
    activeTerms.forEach(t => {
      const firstChar = (t.term || '').trim().charAt(0).toUpperCase();
      if (/^[A-Z]$/.test(firstChar)) {
        lettersSet.add(firstChar);
      } else if (firstChar) {
        lettersSet.add('#');
      }
    });
    return Array.from(lettersSet).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });
  }, [activeTerms]);

  // Extract available categories
  const availableCategories = useMemo(() => {
    const catSet = new Set<string>();
    activeTerms.forEach(t => {
      if (t.category && t.category.trim()) {
        catSet.add(t.category.trim());
      }
    });
    return Array.from(catSet).sort();
  }, [activeTerms]);

  // Filtered terms based on search, letter, category
  const filteredTerms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return activeTerms.filter(t => {
      // Letter filter
      const firstChar = (t.term || '').trim().charAt(0).toUpperCase();
      const termLetter = /^[A-Z]$/.test(firstChar) ? firstChar : '#';
      if (selectedLetter !== 'ALL' && termLetter !== selectedLetter) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && (t.category || '').trim() !== selectedCategory) {
        return false;
      }

      // Search query
      if (q) {
        const matchesTerm = (t.term || '').toLowerCase().includes(q);
        const matchesShort = (t.shortDefinition || '').toLowerCase().includes(q);
        const matchesLong = (t.longDefinition || '').toLowerCase().includes(q);
        const matchesAlias = t.aliases?.some(a => a.toLowerCase().includes(q));
        const matchesCategory = (t.category || '').toLowerCase().includes(q);

        return matchesTerm || matchesShort || matchesLong || matchesAlias || matchesCategory;
      }

      return true;
    });
  }, [activeTerms, searchQuery, selectedLetter, selectedCategory]);

  // Group terms by Letter
  const groupedTerms = useMemo(() => {
    const groups: { [key: string]: GlossaryTerm[] } = {};

    filteredTerms.forEach(t => {
      const firstChar = (t.term || '').trim().charAt(0).toUpperCase();
      const letter = /^[A-Z]$/.test(firstChar) ? firstChar : '#';
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(t);
    });

    // Sort terms inside each group alphabetically
    Object.keys(groups).forEach(letter => {
      groups[letter].sort((a, b) => a.term.localeCompare(b.term));
    });

    // Sorted letters list
    const sortedLetters = Object.keys(groups).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });

    return { groups, sortedLetters };
  }, [filteredTerms]);

  const allAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

  const toggleExpand = (id: string) => {
    setExpandedTermId(prev => prev === id ? null : id);
  };

  const handleRelatedClick = (relatedId: string) => {
    const found = activeTerms.find(t => t.id === relatedId || t.slug === relatedId);
    if (found) {
      setModalTerm(found);
    }
  };

  if (!terms || terms.length === 0) {
    return null;
  }

  return (
    <div id="glossary-dictionary-widget" className="my-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-900/80 dark:to-slate-900 p-5 sm:p-7 shadow-sm transition-all duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kamus Glosarium A–Z</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {widgetTitle}
          </h2>
          {widgetDescription && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {widgetDescription}
            </p>
          )}
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-xs">
            <span className="block text-xl font-bold text-slate-900 dark:text-white">{activeTerms.length}</span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Istilah</span>
          </div>
        </div>
      </div>

      {/* Controls: Search Box & Category Filter */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              title="Bersihkan pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Dropdown (if categories exist) */}
        {availableCategories.length > 0 && (
          <div className="sm:w-56">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-3 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
            >
              <option value="ALL">Semua Kategori ({availableCategories.length})</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* A–Z Alphabet Bar */}
      <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <button
            onClick={() => setSelectedLetter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedLetter === 'ALL'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Semua A–Z
          </button>

          {allAlphabet.map(letter => {
            const hasTerms = availableLetters.includes(letter);
            const isSelected = selectedLetter === letter;

            return (
              <button
                key={letter}
                onClick={() => hasTerms && setSelectedLetter(letter)}
                disabled={!hasTerms}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center shrink-0 ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs scale-105'
                    : hasTerms
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700'
                    : 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-300 dark:text-slate-700 cursor-not-allowed border border-transparent'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(selectedLetter !== 'ALL' || selectedCategory !== 'ALL' || searchQuery) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Filter aktif:</span>
          {selectedLetter !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-medium">
              Huruf: {selectedLetter}
              <button onClick={() => setSelectedLetter('ALL')} className="hover:text-rose-950 dark:hover:text-rose-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCategory !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-medium">
              Kategori: {selectedCategory}
              <button onClick={() => setSelectedCategory('ALL')} className="hover:text-rose-950 dark:hover:text-rose-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-medium">
              Cari: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-slate-900 dark:hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => { setSelectedLetter('ALL'); setSelectedCategory('ALL'); setSearchQuery(''); }}
            className="text-rose-600 dark:text-rose-400 hover:underline font-medium ml-1"
          >
            Reset Semua
          </button>
        </div>
      )}

      {/* Terms Section List */}
      <div className="mt-8 space-y-10">
        {groupedTerms.sortedLetters.length > 0 ? (
          groupedTerms.sortedLetters.map(letter => {
            const letterTerms = groupedTerms.groups[letter];

            return (
              <section key={letter} id={`glossary-section-${letter}`} className="scroll-mt-20">
                {/* Letter Sticky Header */}
                <div className="sticky top-16 z-10 flex items-center gap-3 py-2 bg-gradient-to-r from-slate-100/90 via-slate-50/90 to-transparent dark:from-slate-800/90 dark:via-slate-900/90 backdrop-blur-xs px-3 rounded-xl border-l-4 border-rose-600 mb-4 shadow-xs">
                  <span className="text-xl font-black text-rose-600 dark:text-rose-400">{letter}</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    ({letterTerms.length} istilah)
                  </span>
                </div>

                {/* Terms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {letterTerms.map(term => {
                    const isExpanded = expandedTermId === term.id;
                    const hasLongDef = Boolean(term.longDefinition && term.longDefinition.trim());
                    const termSlugId = `term-${term.slug || term.id}`;

                    return (
                      <div
                        key={term.id}
                        id={termSlugId}
                        className="group flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-4 hover:border-rose-300 dark:hover:border-rose-700/60 hover:shadow-md transition-all duration-200 scroll-mt-24"
                      >
                        <div>
                          {/* Top Meta: Category & Aliases */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                              {term.term}
                            </h3>
                            {term.category && (
                              <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                {term.category}
                              </span>
                            )}
                          </div>

                          {/* Aliases */}
                          {term.aliases && term.aliases.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mb-2">
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Aka:</span>
                              {term.aliases.map(alias => (
                                <span key={alias} className="px-1.5 py-0.5 rounded text-[11px] bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                                  {alias}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Short Definition */}
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {term.shortDefinition}
                          </p>

                          {/* Expanded Long Definition */}
                          {isExpanded && hasLongDef && (
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 space-y-2 animate-fadeIn">
                              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-rose-500" />
                                <span>Penjelasan Lengkap:</span>
                              </div>
                              <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                                {term.longDefinition}
                              </div>

                              {/* Examples */}
                              {term.examples && term.examples.length > 0 && (
                                <div className="mt-3">
                                  <span className="font-semibold text-slate-900 dark:text-white block mb-1">Contoh Penggunaan:</span>
                                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                                    {term.examples.map((ex, idx) => (
                                      <li key={idx}>{ex}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Sources */}
                              {term.sources && term.sources.length > 0 && (
                                <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                                  <span>Referensi: </span>
                                  {term.sources.join(', ')}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Bottom Actions & Related Terms */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                          {/* Related terms */}
                          <div className="flex items-center gap-1 overflow-x-auto max-w-[65%]">
                            {term.relatedTermIds && term.relatedTermIds.length > 0 && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                <Layers className="w-3 h-3 shrink-0 text-slate-400" />
                                <span className="shrink-0">Terkait:</span>
                                {term.relatedTermIds.map(relId => {
                                  const relTerm = activeTerms.find(at => at.id === relId || at.slug === relId);
                                  return (
                                    <button
                                      key={relId}
                                      onClick={() => handleRelatedClick(relId)}
                                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-100 dark:bg-slate-700 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-300 text-[10px] font-medium transition-colors"
                                    >
                                      {relTerm ? relTerm.term : relId}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Expand Button */}
                          {hasLongDef && (
                            <button
                              onClick={() => toggleExpand(term.id)}
                              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                            >
                              <span>{isExpanded ? 'Sembunyikan' : 'Detail'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        ) : (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              Tidak ditemukan istilah yang cocok
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Coba kata kunci lain atau bersihkan filter abjad/kategori untuk melihat seluruh glosarium.
            </p>
            <button
              onClick={() => { setSelectedLetter('ALL'); setSelectedCategory('ALL'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl shadow-xs hover:bg-rose-700 transition-colors"
            >
              Tampilkan Semua Istilah
            </button>
          </div>
        )}
      </div>

      {/* Modal Quick Detail for Related Terms */}
      {modalTerm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 relative">
            <button
              onClick={() => setModalTerm(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                Glosarium Istilah
              </span>
              {modalTerm.category && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {modalTerm.category}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {modalTerm.term}
            </h3>

            {modalTerm.aliases && modalTerm.aliases.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span className="text-xs text-slate-400">Sinonim:</span>
                {modalTerm.aliases.map(a => (
                  <span key={a} className="px-2 py-0.5 rounded text-xs bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                    {a}
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              {modalTerm.shortDefinition}
            </p>

            {modalTerm.longDefinition && (
              <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700 max-h-48 overflow-y-auto mb-4 whitespace-pre-wrap">
                {modalTerm.longDefinition}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setModalTerm(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
