import { useState, useEffect } from 'react';
import { getAllUsers, getUserById, updateUserById, banUser, unbanUser, deleteUserById } from '../../services/firestore';

export default function AdminUsers({ globalSearch }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [filter, setFilter] = useState('all');
    const [editForm, setEditForm] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const allUsers = await getAllUsers();
            setUsers(allUsers.filter(u => u.status !== 'deleted'));
        } catch (err) {
            console.error('[AdminUsers] Error loading users:', err);
            setError('Failed to load users: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    const handleBan = async (user) => {
        clearMessages();
        setActionLoading(`ban-${user.id}`);
        try {
            if (user.status === 'banned') {
                await unbanUser(user.id);
                setSuccess(`${user.fullName || user.email} has been unbanned`);
            } else {
                await banUser(user.id);
                setSuccess(`${user.fullName || user.email} has been banned`);
            }
            await loadUsers();
        } catch (err) {
            console.error('[AdminUsers] Ban error:', err);
            setError('Failed to update user status: ' + (err.message || 'Unknown error'));
        } finally {
            setActionLoading(null);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const handleDelete = async (user) => {
        clearMessages();
        setActionLoading(`delete-${user.id}`);
        try {
            await deleteUserById(user.id);
            setSuccess(`${user.fullName || user.email} has been deleted`);
            setShowDeleteConfirm(null);
            await loadUsers();
        } catch (err) {
            console.error('[AdminUsers] Delete error:', err);
            setError('Failed to delete user: ' + (err.message || 'Unknown error'));
        } finally {
            setActionLoading(null);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const openEditModal = async (user) => {
        clearMessages();
        try {
            const fullUser = await getUserById(user.id);
            setEditingUser(fullUser);
            setEditForm({
                fullName: fullUser?.fullName || '',
                email: fullUser?.email || '',
                age: fullUser?.age || '',
                role: fullUser?.role || 'student',
                bio: fullUser?.bio || '',
                status: fullUser?.status || 'active',
                subjects: fullUser?.subjects || [],
            });
        } catch (err) {
            console.error('[AdminUsers] Load user error:', err);
            setError('Failed to load user details: ' + (err.message || 'Unknown error'));
        }
    };

    const saveEdit = async () => {
        if (!editingUser) return;
        clearMessages();
        setActionLoading('save');
        try {
            await updateUserById(editingUser.id, {
                fullName: editForm.fullName,
                age: editForm.age ? Number(editForm.age) : null,
                role: editForm.role,
                bio: editForm.bio,
                status: editForm.status,
                subjects: editForm.subjects,
            });
            setSuccess('User updated successfully');
            setEditingUser(null);
            await loadUsers();
        } catch (err) {
            console.error('[AdminUsers] Save error:', err);
            setError('Failed to save changes: ' + (err.message || 'Unknown error'));
        } finally {
            setActionLoading(null);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const viewUserDetails = async (user) => {
        clearMessages();
        try {
            const fullUser = await getUserById(user.id);
            setSelectedUser(fullUser);
        } catch (err) {
            console.error('[AdminUsers] View error:', err);
            setError('Failed to load user details: ' + (err.message || 'Unknown error'));
        }
    };

    const filteredUsers = users.filter(user => {
        if (filter === 'banned' && user.status !== 'banned') return false;
        if (filter !== 'all' && filter !== 'banned' && user.role !== filter) return false;
        if (globalSearch) {
            const search = globalSearch.toLowerCase();
            return (
                user.fullName?.toLowerCase().includes(search) ||
                user.email?.toLowerCase().includes(search) ||
                user.role?.toLowerCase().includes(search)
            );
        }
        return true;
    });

    const formatDate = (ts) => {
        if (!ts) return 'N/A';
        try {
            const date = ts.toDate ? ts.toDate() : new Date(ts);
            return date.toLocaleDateString();
        } catch {
            return 'N/A';
        }
    };

    const roleLabels = {
        admin: 'Admin',
        teacher: 'Teacher',
        student: 'Student',
    };

    return (
        <div>
            {error && (
                <div className="admin-error-banner" style={{
                    padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #EF4444',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    color: '#EF4444',
                    fontSize: '14px',
                }}>
                    {error}
                </div>
            )}
            {success && (
                <div className="admin-success-banner" style={{
                    padding: '12px 16px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid #10B981',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    color: '#10B981',
                    fontSize: '14px',
                }}>
                    {success}
                </div>
            )}

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <div className="admin-table-title">All Users ({filteredUsers.length})</div>
                    <div className="admin-table-filters">
                        <button className={`admin-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                        <button className={`admin-filter-btn ${filter === 'student' ? 'active' : ''}`} onClick={() => setFilter('student')}>Students</button>
                        <button className={`admin-filter-btn ${filter === 'teacher' ? 'active' : ''}`} onClick={() => setFilter('teacher')}>Teachers</button>
                        <button className={`admin-filter-btn ${filter === 'banned' ? 'active' : ''}`} onClick={() => setFilter('banned')}>Banned</button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Loading users...
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="admin-user-cell-avatar">
                                                    {user.photoURL ? (
                                                        <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                    ) : (
                                                        (user.fullName?.[0] || user.email?.[0] || 'U').toUpperCase()
                                                    )}
                                                </div>
                                                <div className="admin-user-cell-info">
                                                    <div className="admin-user-cell-name">{user.fullName || 'N/A'}</div>
                                                    <div className="admin-user-cell-email">{user.email || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`admin-role-badge ${user.role || 'student'}`}>
                                                {roleLabels[user.role] || user.role || 'student'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`admin-status-badge ${user.status || 'active'}`}>
                                                {user.status || 'active'}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748B' }}>{formatDate(user.createdAt)}</td>
                                        <td>
                                            <div className="admin-actions-cell">
                                                <button className="admin-action-btn view" onClick={() => viewUserDetails(user)} title="View">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                </button>
                                                <button className="admin-action-btn edit" onClick={() => openEditModal(user)} title="Edit">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                </button>
                                                <button
                                                    className="admin-action-btn ban"
                                                    onClick={() => handleBan(user)}
                                                    title={user.status === 'banned' ? 'Unban' : 'Ban'}
                                                    disabled={actionLoading === `ban-${user.id}`}
                                                >
                                                    {actionLoading === `ban-${user.id}` ? (
                                                        <div className="mini-spinner" style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                                                    ) : (
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                                    )}
                                                </button>
                                                <button
                                                    className="admin-action-btn delete"
                                                    onClick={() => setShowDeleteConfirm(user)}
                                                    title="Delete"
                                                    disabled={actionLoading === `delete-${user.id}`}
                                                >
                                                    {actionLoading === `delete-${user.id}` ? (
                                                        <div className="mini-spinner" style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                                                    ) : (
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedUser && (
                <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">User Profile</h3>
                            <button className="admin-modal-close" onClick={() => setSelectedUser(null)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-gradient)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#fff',
                                    flexShrink: 0,
                                    overflow: 'hidden',
                                }}>
                                    {selectedUser.photoURL ? (
                                        <img src={selectedUser.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        (selectedUser.fullName?.[0] || selectedUser.email?.[0] || 'U').toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                        {selectedUser.fullName || 'No name set'}
                                    </div>
                                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        {selectedUser.email}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Role</div>
                                    <div style={{ fontSize: '14px', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{selectedUser.role || 'Not set'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Status</div>
                                    <span className={`admin-status-badge ${selectedUser.status || 'active'}`}>
                                        {selectedUser.status || 'active'}
                                    </span>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Age</div>
                                    <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{selectedUser.age || 'Not set'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Joined</div>
                                    <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{formatDate(selectedUser.createdAt)}</div>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Subjects</div>
                                    <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                                        {selectedUser.subjects?.length > 0 ? selectedUser.subjects.join(', ') : 'None'}
                                    </div>
                                </div>
                                {selectedUser.bio && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Bio</div>
                                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{selectedUser.bio}</div>
                                    </div>
                                )}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>User ID</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{selectedUser.id}</div>
                                </div>
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
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">Edit User</h3>
                            <button className="admin-modal-close" onClick={() => setEditingUser(null)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Full Name</label>
                                <input
                                    value={editForm.fullName}
                                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        value={editForm.age}
                                        onChange={e => setEditForm({ ...editForm, age: e.target.value })}
                                        placeholder="Age"
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>Role</label>
                                    <select
                                        value={editForm.role}
                                        onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                    >
                                        <option value="student">Student</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="admin-form-group">
                                <label>Status</label>
                                <select
                                    value={editForm.status}
                                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="banned">Banned</option>
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label>Bio</label>
                                <textarea
                                    value={editForm.bio}
                                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                    placeholder="User bio..."
                                    style={{ minHeight: '80px' }}
                                />
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                            <button
                                className="admin-btn primary"
                                onClick={saveEdit}
                                disabled={actionLoading === 'save'}
                            >
                                {actionLoading === 'save' ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="admin-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="admin-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title" style={{ color: '#EF4444' }}>Delete User</h3>
                            <button className="admin-modal-close" onClick={() => setShowDeleteConfirm(null)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                                Are you sure you want to delete <strong style={{ color: '#fff' }}>{showDeleteConfirm.fullName || showDeleteConfirm.email}</strong>?
                                This will mark the account as deleted and they will lose access to the platform.
                            </p>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                            <button
                                className="admin-btn danger"
                                onClick={() => handleDelete(showDeleteConfirm)}
                                disabled={actionLoading === `delete-${showDeleteConfirm.id}`}
                            >
                                {actionLoading === `delete-${showDeleteConfirm.id}` ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
