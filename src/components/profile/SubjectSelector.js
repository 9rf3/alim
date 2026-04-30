import { useState } from 'react';
import { subjects } from '../../data/subjects';

export default function SubjectSelector({ selected = [], onChange, label, maxSelect }) {
    const [search, setSearch] = useState('');

    const filtered = subjects.filter(s =>
        s.en.toLowerCase().includes(search.toLowerCase()) ||
        s.ru.toLowerCase().includes(search.toLowerCase())
    );

    const toggleSubject = (id) => {
        if (selected.includes(id)) {
            onChange(selected.filter(s => s !== id));
        } else {
            if (maxSelect && selected.length >= maxSelect) return;
            onChange([...selected, id]);
        }
    };

    return (
        <div className="form-group">
            {label && <label>{label}</label>}
            <input
                type="text"
                className="form-input"
                placeholder="Search subjects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 12 }}
            />
            <div className="subject-selector">
                {filtered.map(subject => {
                    const isSelected = selected.includes(subject.id);
                    return (
                        <div
                            key={subject.id}
                            className={`subject-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleSubject(subject.id)}
                        >
                            <span className="subject-option-icon">{subject.icon}</span>
                            <span>{subject.en}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
