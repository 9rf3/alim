import { useState, useEffect } from 'react';
import { subjects as initialSubjects, subjectCategories as initialCategories } from '../../data/subjects';
import { elements as initialElements, reactions as initialReactions } from '../../data/subjects';

export default function AdminSubjects({ globalSearch }) {
    const [subjects, setSubjects] = useState(() => {
        const stored = localStorage.getItem('adminSubjects');
        return stored ? JSON.parse(stored) : initialSubjects;
    });
    const [categories, setCategories] = useState(() => {
        const stored = localStorage.getItem('adminSubjectCategories');
        return stored ? JSON.parse(stored) : initialCategories;
    });
    const [elements, setElements] = useState(() => {
        const stored = localStorage.getItem('adminChemicalElements');
        return stored ? JSON.parse(stored) : initialElements;
    });
    const [reactions, setReactions] = useState(() => {
        const stored = localStorage.getItem('adminChemicalReactions');
        return stored ? JSON.parse(stored) : initialReactions;
    });
    const [editingSubject, setEditingSubject] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showElementModal, setShowElementModal] = useState(false);
    const [showReactionModal, setShowReactionModal] = useState(false);
    const [newSubject, setNewSubject] = useState({ id: '', en: '', ru: '', icon: '📚', color: '#3B82F6' });
    const [newCategory, setNewCategory] = useState({ id: '', en: '', ru: '', subjects: [] });
    const [newElement, setNewElement] = useState({ symbol: '', name: '', nameRu: '', number: '', color: '#3B82F6' });
    const [newReaction, setNewReaction] = useState({ elements: [], result: '', resultRu: '', description: '', descriptionRu: '' });
    const [activeTab, setActiveTab] = useState('subjects');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        localStorage.setItem('adminSubjects', JSON.stringify(subjects));
    }, [subjects]);

    useEffect(() => {
        localStorage.setItem('adminSubjectCategories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('adminChemicalElements', JSON.stringify(elements));
    }, [elements]);

    useEffect(() => {
        localStorage.setItem('adminChemicalReactions', JSON.stringify(reactions));
    }, [reactions]);

    const handleAddSubject = () => {
        setFormError('');
        if (!newSubject.id || !newSubject.en) return;
        const id = newSubject.id.toLowerCase().replace(/\s+/g, '_');
        if (subjects.some(s => s.id === id)) {
            setFormError('Subject with this ID already exists');
            return;
        }
        setSubjects([...subjects, { ...newSubject, id }]);
        setNewSubject({ id: '', en: '', ru: '', icon: '📚', color: '#3B82F6' });
        setShowAddModal(false);
    };

    const handleDeleteSubject = (id) => {
        setSubjects(subjects.filter(s => s.id !== id));
        setCategories(categories.map(cat => ({
            ...cat,
            subjects: cat.subjects.filter(s => s !== id)
        })));
    };

    const handleSaveEdit = () => {
        setSubjects(subjects.map(s => s.id === editingSubject.id ? editingSubject : s));
        setEditingSubject(null);
    };

    const handleAddCategory = () => {
        if (!newCategory.id || !newCategory.en) return;
        setCategories([...categories, { ...newCategory, id: newCategory.id.toLowerCase().replace(/\s+/g, '_') }]);
        setNewCategory({ id: '', en: '', ru: '', subjects: [] });
        setShowCategoryModal(false);
    };

    const handleDeleteCategory = (id) => {
        setCategories(categories.filter(c => c.id !== id));
    };

    const handleAddElement = () => {
        setFormError('');
        if (!newElement.symbol || !newElement.name || !newElement.number) return;
        const symbol = newElement.symbol.toUpperCase();
        if (elements.some(e => e.symbol === symbol)) {
            setFormError('Element with this symbol already exists');
            return;
        }
        setElements([...elements, { ...newElement, symbol, number: parseInt(newElement.number) }]);
        setNewElement({ symbol: '', name: '', nameRu: '', number: '', color: '#3B82F6' });
        setShowElementModal(false);
    };

    const handleDeleteElement = (symbol) => {
        setElements(elements.filter(e => e.symbol !== symbol));
        setReactions(reactions.filter(r => !r.elements.includes(symbol)));
    };

    const handleAddReaction = () => {
        setFormError('');
        if (newReaction.elements.length < 2 || !newReaction.result) return;
        const exists = reactions.some(r => 
            r.elements.length === newReaction.elements.length &&
            r.elements.every(e => newReaction.elements.includes(e))
        );
        if (exists) {
            setFormError('This reaction combination already exists');
            return;
        }
        setReactions([...reactions, { ...newReaction, id: `reaction_${Date.now()}` }]);
        setNewReaction({ elements: [], result: '', resultRu: '', description: '', descriptionRu: '' });
        setShowReactionModal(false);
    };

    const handleDeleteReaction = (id) => {
        setReactions(reactions.filter(r => r.id !== id));
    };

    const toggleElementSelection = (symbol) => {
        setNewReaction(prev => ({
            ...prev,
            elements: prev.elements.includes(symbol)
                ? prev.elements.filter(e => e !== symbol)
                : [...prev.elements, symbol]
        }));
    };

    const filteredSubjects = globalSearch
        ? subjects.filter(s => s.en.toLowerCase().includes(globalSearch.toLowerCase()) || s.ru.toLowerCase().includes(globalSearch.toLowerCase()))
        : subjects;

    const getCategoryForSubject = (subjectId) => {
        return categories.find(cat => cat.subjects.includes(subjectId));
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                <button className={`admin-filter-btn ${activeTab === 'subjects' ? 'active' : ''}`} onClick={() => setActiveTab('subjects')}>Subjects ({subjects.length})</button>
                <button className={`admin-filter-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Categories ({categories.length})</button>
                <button className={`admin-filter-btn ${activeTab === 'elements' ? 'active' : ''}`} onClick={() => setActiveTab('elements')}>Elements ({elements.length})</button>
                <button className={`admin-filter-btn ${activeTab === 'reactions' ? 'active' : ''}`} onClick={() => setActiveTab('reactions')}>Reactions ({reactions.length})</button>
            </div>

            {activeTab === 'subjects' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                        <button className="admin-btn primary" onClick={() => { setFormError(''); setShowAddModal(true); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add Subject
                        </button>
                    </div>

                    <div className="subjects-grid">
                        {filteredSubjects.map(subject => {
                            const category = getCategoryForSubject(subject.id);
                            return (
                                <div key={subject.id} className="subject-card">
                                    <div className="subject-card-header">
                                        <div className="subject-card-icon">{subject.icon}</div>
                                        <div className="subject-card-actions">
                                            <button className="admin-action-btn edit" onClick={() => setEditingSubject({ ...subject })}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            </button>
                                            <button className="admin-action-btn delete" onClick={() => handleDeleteSubject(subject.id)}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="subject-card-name">{subject.en}</div>
                                    <div className="subject-card-id">{subject.id}</div>
                                    <div className="subject-card-meta">
                                        <div className="subject-card-stat">RU: <span>{subject.ru}</span></div>
                                        {category && <div className="subject-card-stat">Category: <span>{category.en}</span></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'categories' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                        <button className="admin-btn primary" onClick={() => setShowCategoryModal(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add Category
                        </button>
                    </div>

                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Subjects</th>
                                    <th>Subject Count</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat.id}>
                                        <td>
                                            <div className="admin-user-cell-info">
                                                <div className="admin-user-cell-name">{cat.en}</div>
                                                <div className="admin-user-cell-email">{cat.ru}</div>
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: 400 }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                {cat.subjects.map(sId => {
                                                    const s = subjects.find(sub => sub.id === sId);
                                                    return s ? <span key={sId} style={{ padding: '2px 8px', background: 'rgba(59,130,246,0.1)', borderRadius: 6, fontSize: 12, color: '#60A5FA' }}>{s.icon} {s.en}</span> : null;
                                                })}
                                            </div>
                                        </td>
                                        <td><span style={{ color: '#60A5FA', fontWeight: 600 }}>{cat.subjects.length}</span></td>
                                        <td>
                                            <div className="admin-actions-cell">
                                                <button className="admin-action-btn delete" onClick={() => handleDeleteCategory(cat.id)}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'elements' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                        <button className="admin-btn primary" onClick={() => { setFormError(''); setShowElementModal(true); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add Element
                        </button>
                    </div>

                    <div className="subjects-grid">
                        {elements.map(el => (
                            <div key={el.symbol} className="subject-card" style={{ position: 'relative' }}>
                                <div className="subject-card-header">
                                    <div className="subject-card-icon" style={{ background: `linear-gradient(135deg, ${el.color}, ${el.color}80)`, fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                                        {el.symbol}
                                    </div>
                                    <div className="subject-card-actions">
                                        <button className="admin-action-btn delete" onClick={() => handleDeleteElement(el.symbol)}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="subject-card-name">{el.name}</div>
                                <div className="subject-card-id">#{el.number}</div>
                                <div className="subject-card-meta">
                                    <div className="subject-card-stat">RU: <span>{el.nameRu || '—'}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'reactions' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                        <button className="admin-btn primary" onClick={() => { setFormError(''); setShowReactionModal(true); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add Reaction
                        </button>
                    </div>

                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Elements</th>
                                    <th>Result</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reactions.map(r => (
                                    <tr key={r.id}>
                                        <td>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {r.elements.map(el => {
                                                    const element = elements.find(e => e.symbol === el);
                                                    return element ? (
                                                        <span key={el} style={{ padding: '4px 10px', background: `${element.color}20`, border: `1px solid ${element.color}40`, borderRadius: 8, fontSize: 13, color: element.color, fontWeight: 600 }}>
                                                            {element.symbol}
                                                        </span>
                                                    ) : null;
                                                })}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: '#10B981' }}>{r.result}</span>
                                            {r.resultRu && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.resultRu}</div>}
                                        </td>
                                        <td style={{ maxWidth: 300, fontSize: 13, color: 'var(--text-secondary)' }}>{r.description}</td>
                                        <td>
                                            <div className="admin-actions-cell">
                                                <button className="admin-action-btn delete" onClick={() => handleDeleteReaction(r.id)}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="admin-modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">Add New Subject</h3>
                            <button className="admin-modal-close" onClick={() => setShowAddModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            {formError && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#EF4444', fontSize: 13, marginBottom: 16 }}>{formError}</div>}
                            <div className="admin-form-group">
                                <label>Subject ID (auto-generated)</label>
                                <input value={newSubject.id} onChange={e => setNewSubject({ ...newSubject, id: e.target.value })} placeholder="e.g. biology" />
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>English Name</label>
                                    <input value={newSubject.en} onChange={e => setNewSubject({ ...newSubject, en: e.target.value })} placeholder="e.g. Biology" />
                                </div>
                                <div className="admin-form-group">
                                    <label>Russian Name</label>
                                    <input value={newSubject.ru} onChange={e => setNewSubject({ ...newSubject, ru: e.target.value })} placeholder="e.g. Биология" />
                                </div>
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Icon (emoji)</label>
                                    <input value={newSubject.icon} onChange={e => setNewSubject({ ...newSubject, icon: e.target.value })} placeholder="📚" />
                                </div>
                                <div className="admin-form-group">
                                    <label>Color (hex)</label>
                                    <input type="color" value={newSubject.color} onChange={e => setNewSubject({ ...newSubject, color: e.target.value })} style={{ height: 42, padding: 4, cursor: 'pointer' }} />
                                </div>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="admin-btn primary" onClick={handleAddSubject}>Add Subject</button>
                        </div>
                    </div>
                </div>
            )}

            {editingSubject && (
                <div className="admin-modal-overlay" onClick={() => setEditingSubject(null)}>
                    <div className="admin-modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">Edit Subject</h3>
                            <button className="admin-modal-close" onClick={() => setEditingSubject(null)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Subject ID</label>
                                <input value={editingSubject.id} disabled style={{ opacity: 0.5 }} />
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>English Name</label>
                                    <input value={editingSubject.en} onChange={e => setEditingSubject({ ...editingSubject, en: e.target.value })} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Russian Name</label>
                                    <input value={editingSubject.ru} onChange={e => setEditingSubject({ ...editingSubject, ru: e.target.value })} />
                                </div>
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Icon</label>
                                    <input value={editingSubject.icon} onChange={e => setEditingSubject({ ...editingSubject, icon: e.target.value })} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Color</label>
                                    <input type="color" value={editingSubject.color} onChange={e => setEditingSubject({ ...editingSubject, color: e.target.value })} style={{ height: 42, padding: 4, cursor: 'pointer' }} />
                                </div>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn secondary" onClick={() => setEditingSubject(null)}>Cancel</button>
                            <button className="admin-btn primary" onClick={handleSaveEdit}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {showCategoryModal && (
                <div className="admin-modal-overlay" onClick={() => setShowCategoryModal(false)}>
                    <div className="admin-modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">Add Category</h3>
                            <button className="admin-modal-close" onClick={() => setShowCategoryModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Category ID</label>
                                <input value={newCategory.id} onChange={e => setNewCategory({ ...newCategory, id: e.target.value })} placeholder="e.g. sciences" />
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>English Name</label>
                                    <input value={newCategory.en} onChange={e => setNewCategory({ ...newCategory, en: e.target.value })} placeholder="e.g. Sciences" />
                                </div>
                                <div className="admin-form-group">
                                    <label>Russian Name</label>
                                    <input value={newCategory.ru} onChange={e => setNewCategory({ ...newCategory, ru: e.target.value })} placeholder="e.g. Науки" />
                                </div>
                            </div>
                            <div className="admin-form-group">
                                <label>Subjects (comma-separated IDs)</label>
                                <input value={newCategory.subjects.join(', ')} onChange={e => setNewCategory({ ...newCategory, subjects: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="math, physics, chemistry" />
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn secondary" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                            <button className="admin-btn primary" onClick={handleAddCategory}>Add Category</button>
                        </div>
                    </div>
                </div>
            )}

            {showElementModal && (
                <div className="admin-modal-overlay" onClick={() => setShowElementModal(false)}>
                    <div className="admin-modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">Add Chemical Element</h3>
                            <button className="admin-modal-close" onClick={() => setShowElementModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            {formError && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#EF4444', fontSize: 13, marginBottom: 16 }}>{formError}</div>}
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Symbol</label>
                                    <input value={newElement.symbol} onChange={e => setNewElement({ ...newElement, symbol: e.target.value.toUpperCase() })} placeholder="e.g. H" maxLength={3} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Atomic Number</label>
                                    <input type="number" value={newElement.number} onChange={e => setNewElement({ ...newElement, number: e.target.value })} placeholder="e.g. 1" min="1" />
                                </div>
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>English Name</label>
                                    <input value={newElement.name} onChange={e => setNewElement({ ...newElement, name: e.target.value })} placeholder="e.g. Hydrogen" />
                                </div>
                                <div className="admin-form-group">
                                    <label>Russian Name</label>
                                    <input value={newElement.nameRu} onChange={e => setNewElement({ ...newElement, nameRu: e.target.value })} placeholder="e.g. Водород" />
                                </div>
                            </div>
                            <div className="admin-form-group">
                                <label>Card Color</label>
                                <input type="color" value={newElement.color} onChange={e => setNewElement({ ...newElement, color: e.target.value })} style={{ height: 42, padding: 4, cursor: 'pointer', width: '100%' }} />
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn secondary" onClick={() => setShowElementModal(false)}>Cancel</button>
                            <button className="admin-btn primary" onClick={handleAddElement}>Add Element</button>
                        </div>
                    </div>
                </div>
            )}

            {showReactionModal && (
                <div className="admin-modal-overlay" onClick={() => setShowReactionModal(false)}>
                    <div className="admin-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">Add Chemical Reaction</h3>
                            <button className="admin-modal-close" onClick={() => setShowReactionModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            {formError && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#EF4444', fontSize: 13, marginBottom: 16 }}>{formError}</div>}
                            <div className="admin-form-group">
                                <label>Select Elements (click to toggle)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                                    {elements.map(el => (
                                        <button
                                            key={el.symbol}
                                            onClick={() => toggleElementSelection(el.symbol)}
                                            style={{
                                                padding: '6px 12px',
                                                background: newReaction.elements.includes(el.symbol) ? `${el.color}30` : 'rgba(255,255,255,0.05)',
                                                border: `1px solid ${newReaction.elements.includes(el.symbol) ? el.color : 'rgba(255,255,255,0.1)'}`,
                                                borderRadius: 8,
                                                color: newReaction.elements.includes(el.symbol) ? el.color : 'var(--text-secondary)',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                fontSize: 13,
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {el.symbol} {el.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Result (formula)</label>
                                    <input value={newReaction.result} onChange={e => setNewReaction({ ...newReaction, result: e.target.value })} placeholder="e.g. H₂O" />
                                </div>
                                <div className="admin-form-group">
                                    <label>Result (Russian)</label>
                                    <input value={newReaction.resultRu} onChange={e => setNewReaction({ ...newReaction, resultRu: e.target.value })} placeholder="e.g. Вода" />
                                </div>
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Description (English)</label>
                                    <input value={newReaction.description} onChange={e => setNewReaction({ ...newReaction, description: e.target.value })} placeholder="e.g. Hydrogen + Oxygen = Water" />
                                </div>
                                <div className="admin-form-group">
                                    <label>Description (Russian)</label>
                                    <input value={newReaction.descriptionRu} onChange={e => setNewReaction({ ...newReaction, descriptionRu: e.target.value })} placeholder="e.g. Водород + Кислород = Вода" />
                                </div>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn secondary" onClick={() => setShowReactionModal(false)}>Cancel</button>
                            <button className="admin-btn primary" onClick={handleAddReaction}>Add Reaction</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
