import { useState, useEffect } from 'react';
import { subjects as initialSubjects, subjectCategories as initialCategories } from '../../data/subjects';

export default function AdminSubjects({ globalSearch }) {
    const [subjects, setSubjects] = useState(() => {
        const stored = localStorage.getItem('adminSubjects');
        return stored ? JSON.parse(stored) : initialSubjects;
    });
    const [categories, setCategories] = useState(() => {
        const stored = localStorage.getItem('adminSubjectCategories');
        return stored ? JSON.parse(stored) : initialCategories;
    });
    const [editingSubject, setEditingSubject] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newSubject, setNewSubject] = useState({ id: '', en: '', ru: '', icon: '📚', color: '#3B82F6' });
    const [newCategory, setNewCategory] = useState({ id: '', en: '', ru: '', subjects: [] });
    const [activeTab, setActiveTab] = useState('subjects');

    useEffect(() => {
        localStorage.setItem('adminSubjects', JSON.stringify(subjects));
    }, [subjects]);

    useEffect(() => {
        localStorage.setItem('adminSubjectCategories', JSON.stringify(categories));
    }, [categories]);

    const handleAddSubject = () => {
        if (!newSubject.id || !newSubject.en) return;
        setSubjects([...subjects, { ...newSubject, id: newSubject.id.toLowerCase().replace(/\s+/g, '_') }]);
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

    const filteredSubjects = globalSearch
        ? subjects.filter(s => s.en.toLowerCase().includes(globalSearch.toLowerCase()) || s.ru.toLowerCase().includes(globalSearch.toLowerCase()))
        : subjects;

    const getCategoryForSubject = (subjectId) => {
        return categories.find(cat => cat.subjects.includes(subjectId));
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button className={`admin-filter-btn ${activeTab === 'subjects' ? 'active' : ''}`} onClick={() => setActiveTab('subjects')}>Subjects ({subjects.length})</button>
                <button className={`admin-filter-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Categories ({categories.length})</button>
            </div>

            {activeTab === 'subjects' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                        <button className="admin-btn primary" onClick={() => setShowAddModal(true)}>
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
        </div>
    );
}
