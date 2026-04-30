import { useState, useEffect } from 'react';
import { getSubjectName } from '../../data/subjects';

export default function AdminUsers({ globalSearch }) {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [filter, setFilter] = useState('all');
    const [editForm, setEditForm] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        const authData = localStorage.getItem('authUser');
        const profileData = localStorage.getItem('userProfile');
        const allUsers = [];

        if (authData) {
            const auth = JSON.parse(authData);
            const profile = profileData ? JSON.parse(profileData) : {};
            allUsers.push({
                ...auth,
                ...profile,
                status: profile.banned ? 'banned' : 'active',
                registeredAt: profile.completedAt || new Date().toISOString(),
            });
        }

        const storedUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        allUsers.push(...storedUsers);

        if (allUsers.length === 0) {
            allUsers.push(
                { uid: '1', displayName: 'John Student', email: 'john@example.com', role: 'student', age: 20, subjectsToStudy: ['math', 'programming'], status: 'active', bio: 'Studying computer science', registeredAt: '2026-04-15T10:00:00Z' },
                { uid: '2', displayName: 'Dr. Sarah Teacher', email: 'sarah@example.com', role: 'teacher', age: 35, subjectsToTeach: ['math', 'physics'], coursePrice: '$50/course', experience: '10 years', availability: 'Mon-Fri 18:00-21:00', status: 'active', bio: 'PhD in Mathematics', registeredAt: '2026-04-10T08:00:00Z' },
                { uid: '3', displayName: 'Mike Learner', email: 'mike@example.com', role: 'student', age: 22, subjectsToStudy: ['english', 'history'], status: 'active', bio: '', registeredAt: '2026-04-20T14:00:00Z' },
            );
            localStorage.setItem('adminUsers', JSON.stringify(allUsers.slice(1)));
        }

        setUsers(allUsers);
    };

    const filteredUsers = users.filter(user => {
        if (filter !== 'all' && user.role !== filter) return false;
        if (globalSearch) {
            const search = globalSearch.toLowerCase();
            return (
                user.displayName?.toLowerCase().includes(search) ||
                user.email?.toLowerCase().includes(search) ||
                user.role?.toLowerCase().includes(search)
            );
        }
        return true;
    });

    const handleDelete = (user) => {
        const updated = users.filter(u => u.uid !== user.uid);
        setUsers(updated);
        localStorage.setItem('adminUsers', JSON.stringify(updated.filter(u => u.uid !== '1')));
        setShowDeleteConfirm(null);
    };

    const handleBan = (user) => {
        const updated = users.map(u =>
            u.uid === user.uid
                ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' }
                : u
        );
        setUsers(updated);
        localStorage.setItem('adminUsers', JSON.stringify(updated.filter(u => u.uid !== '1')));
    };
    const openEditModal = (user) => {
        setEditingUser(user);
        setEditForm({
            displayName: user.displayName || '',
            email: user.email || '',
            age: user.age || '',
            role: user.role || 'student',
            bio: user.bio || '',
            status: user.status || 'active',
            subjects: user.role === 'teacher'
                ? (user.subjectsToTeach || [])
                : (user.subjectsToStudy || []),
            coursePrice: user.coursePrice || '',
            experience: user.experience || '',
            availability: user.availability || '',
        });
    };

    const saveEdit = () => {
        if (!editingUser) return;

        const updated = users.map(u => {
            if (u.uid === editingUser.uid) {
                return {
                    ...u,
                    ...editForm,
                    subjectsToStudy: editForm.role === 'student' ? editForm.subjects : u.subjectsToStudy,
                    subjectsToTeach: editForm.role === 'teacher' ? editForm.subjects : u.subjectsToTeach,
                };
            }
            return u;
        });
        setUsers(updated);
        localStorage.setItem('adminUsers', JSON.stringify(updated.filter(u => u.uid !== '1')));
        setEditingUser(null);
    };

    const viewUserDetails = (user) => {
        setSelectedUser(user);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <div>
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <div className="admin-table-title">All Users ({filteredUsers.length})</div>
                    <div className="admin-table-filters">
                        <button className={`admin-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                        <button className={`admin-filter-btn ${filter === 'student' ? 'active' : ''}`} onClick={() => setFilter('student')}>Students</button>
                        <button className={`admin-filter-btn ${filter === 'teacher' ? 'active' : ''}`} onClick={() => setFilter('teacher')}>Teachers</button>
                    </div>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Age</th>
                            <th>Subjects</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => {
                            const subjects = user.role === 'teacher'
                                ? (user.subjectsToTeach || [])
                                : (user.subjectsToStudy || []);
                            return (
                                <tr key={user.uid}>
                                    <td>
                                        <div className="admin-user-cell">
                                            <div className="admin-user-cell-avatar">
                                                {user.photoURL ? <img src={user.photoURL} alt="" /> : (user.displayName?.[0] || 'U')}
                                            </div>
                                            <div className="admin-user-cell-info">
                                                <div className="admin-user-cell-name">{user.displayName || 'N/A'}</div>
                                                <div className="admin-user-cell-email">{user.email || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className={`admin-role-badge ${user.role}`}>{user.role || 'N/A'}</span></td>
                                    <td>{user.age || '—'}</td>
                                    <td>{subjects.length > 0 ? subjects.map(s => getSubjectName(s, 'en')).join(', ') : '—'}</td>
                                    <td><span className={`admin-status-badge ${user.status || 'active'}`}>{user.status || 'active'}</span></td>
                                    <td style={{ color: '#64748B' }}>{formatDate(user.registeredAt)}</td>
                                    <td>
                                        <div className="admin-actions-cell">
                                            <button className="admin-action-btn view" onClick={() => viewUserDetails(user)} title="View">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                            </button>
                                            <button className="admin-action-btn edit" onClick={() => openEditModal(user)} title="Edit">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            </button>
                                            <button className="admin-action-btn ban" onClick={() => handleBan(user)} title={user.status === 'banned' ? 'Unban' : 'Ban'}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                            </button>
                                            <button className="admin-action-btn delete" onClick={() => setShowDeleteConfirm(user)} title="Delete">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {selectedUser && (
                <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">User Profile — {selectedUser.displayName}</h3>
                            <button className="admin-modal-close" onClick={() => setSelectedUser(null)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div><strong style={{ color: '#94a3b8', fontSize: 12 }}>Name</strong><p style={{ color: '#fff', marginTop: 4 }}>{selectedUser.displayName}</p></div>
                                <div><strong style={{ color: '#94a3b8', fontSize: 12 }}>Email</strong><p style={{ color: '#fff', marginTop: 4 }}>{selectedUser.email}</p></div>
                                <div><strong style={{ color: '#94a3b8', fontSize: 12 }}>Role</strong><p style={{ color: '#fff', marginTop: 4, textTransform: 'capitalize' }}>{selectedUser.role}</p></div>
                                <div><strong style={{ color: '#94a3b8', fontSize: 12 }}>Age</strong><p style={{ color: '#fff', marginTop: 4 }}>{selectedUser.age || 'N/A'}</p></div>
                                <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#94a3b8', fontSize: 12 }}>Bio</strong><p style={{ color: '#cbd5e1', marginTop: 4 }}>{selectedUser.bio || 'No bio set'}</p></div>
                                <div><strong style={{ color: '#94a3b8', fontSize: 12 }}>Subjects</strong><p style={{ color: '#fff', marginTop: 4 }}>{(selectedUser.role === 'teacher' ? selectedUser.subjectsToTeach : selectedUser.subjectsToStudy)?.map(s => getSubjectName(s, 'en')).join(', ') || 'None'}</p></div>
                                <div><strong style={{ color: '#94a3b8', fontSize: 12 }}>Status</strong><p style={{ marginTop: 4 }}><span className={`admin-status-badge ${selectedUser.status || 'active'}`}>{selectedUser.status || 'active'}</span></p></div>
                                {selectedUser.role === 'teacher' && (
                                    <>
                                        <div><strong style={{ color: '#94a3b8', fontSize: 12 }}>Experience</strong><p style={{ color: '#fff', marginTop: 4 }}>{selectedUser.experience || 'N/A'}</p></div>
                                        <div><strong style={{ color: '#94a3b8', fontSize: 12 }}>Course Price</strong><p style={{ color: '#fff', marginTop: 4 }}>{selectedUser.coursePrice || 'N/A'}</p></div>
                                        <div><strong style={{ color: '#94a3b8', fontSize: 12 }}>Availability</strong><p style={{ color: '#fff', marginTop: 4 }}>{selectedUser.availability || 'N/A'}</p></div>
                                    </>
                                )}
                                <div><strong style={{ color: '#94a3b8', fontSize: 12 }}>Registered</strong><p style={{ color: '#fff', marginTop: 4 }}>{formatDate(selectedUser.registeredAt)}</p></div>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn secondary" onClick={() => setSelectedUser(null)}>Close</button>
                            <button className="admin-btn primary" onClick={() => { setSelectedUser(null); openEditModal(selectedUser); }}>Edit User</button>
                        </div>
                    </div>
                </div>
            )}

            {editingUser && (
                <div className="admin-modal-overlay" onClick={() => setEditingUser(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">Edit User</h3>
                            <button className="admin-modal-close" onClick={() => setEditingUser(null)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Full Name</label>
                                    <input value={editForm.displayName} onChange={e => setEditForm({ ...editForm, displayName: e.target.value })} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Email</label>
                                    <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                                </div>
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Age</label>
                                    <input type="number" value={editForm.age} onChange={e => setEditForm({ ...editForm, age: e.target.value })} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Role</label>
                                    <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                                        <option value="student">Student</option>
                                        <option value="teacher">Teacher</option>
                                    </select>
                                </div>
                            </div>
                            <div className="admin-form-group">
                                <label>Bio</label>
                                <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
                            </div>
                            <div className="admin-form-group">
                                <label>Status</label>
                                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                                    <option value="active">Active</option>
                                    <option value="banned">Banned</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                            <button className="admin-btn primary" onClick={saveEdit}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="admin-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="admin-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title" style={{ color: '#FCA5A5' }}>Delete User</h3>
                            <button className="admin-modal-close" onClick={() => setShowDeleteConfirm(null)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <p style={{ color: '#cbd5e1' }}>Are you sure you want to delete <strong style={{ color: '#fff' }}>{showDeleteConfirm.displayName}</strong>? This action cannot be undone.</p>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                            <button className="admin-btn danger" onClick={() => handleDelete(showDeleteConfirm)}>Delete User</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
