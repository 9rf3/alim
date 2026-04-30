export const subjects = [
    { id: 'math', ru: 'Математика', en: 'Mathematics', icon: '📐', color: '#3B82F6' },
    { id: 'physics', ru: 'Физика', en: 'Physics', icon: '⚛️', color: '#8B5CF6' },
    { id: 'chemistry', ru: 'Химия', en: 'Chemistry', icon: '🧪', color: '#10B981' },
    { id: 'biology', ru: 'Биология', en: 'Biology', icon: '🧬', color: '#059669' },
    { id: 'english', ru: 'Английский', en: 'English', icon: '📖', color: '#F59E0B' },
    { id: 'history', ru: 'История', en: 'History', icon: '🏛️', color: '#92400E' },
    { id: 'programming', ru: 'Программирование', en: 'Programming', icon: '💻', color: '#6366F1' },
    { id: 'art', ru: 'Искусство', en: 'Art', icon: '🎨', color: '#EC4899' },
    { id: 'music', ru: 'Музыка', en: 'Music', icon: '🎵', color: '#F472B6' },
    { id: 'geography', ru: 'География', en: 'Geography', icon: '🌍', color: '#14B8A6' },
    { id: 'literature', ru: 'Литература', en: 'Literature', icon: '📚', color: '#A78BFA' },
    { id: 'economics', ru: 'Экономика', en: 'Economics', icon: '📊', color: '#34D399' },
    { id: 'philosophy', ru: 'Философия', en: 'Philosophy', icon: '🤔', color: '#7C3AED' },
    { id: 'psychology', ru: 'Психология', en: 'Psychology', icon: '🧠', color: '#F97316' },
    { id: 'law', ru: 'Право', en: 'Law', icon: '⚖️', color: '#64748B' },
    { id: 'medicine', ru: 'Медицина', en: 'Medicine', icon: '🏥', color: '#EF4444' },
    { id: 'languages', ru: 'Языки', en: 'Languages', icon: '🗣️', color: '#06B6D4' },
    { id: 'design', ru: 'Дизайн', en: 'Design', icon: '✏️', color: '#D946EF' },
    { id: 'sport', ru: 'Спорт', en: 'Sport', icon: '⚽', color: '#22C55E' },
    { id: 'astronomy', ru: 'Астрономия', en: 'Astronomy', icon: '🔭', color: '#1E40AF' },
];

export const subjectCategories = [
    { id: 'stem', ru: 'Наука и технологии', en: 'Science & Technology', subjects: ['math', 'physics', 'chemistry', 'biology', 'programming', 'astronomy'] },
    { id: 'humanities', ru: 'Гуманитарные науки', en: 'Humanities', subjects: ['history', 'literature', 'philosophy', 'psychology', 'law'] },
    { id: 'languages', ru: 'Языки', en: 'Languages', subjects: ['english', 'languages'] },
    { id: 'arts', ru: 'Искусство', en: 'Arts', subjects: ['art', 'music', 'design'] },
    { id: 'social', ru: 'Социальные науки', en: 'Social Sciences', subjects: ['economics', 'psychology', 'geography', 'law'] },
    { id: 'health', ru: 'Здоровье', en: 'Health', subjects: ['biology', 'medicine', 'sport'] },
];

export function getSubjectById(id) {
    return subjects.find(s => s.id === id) || null;
}

export function getSubjectName(id, lang = 'en') {
    const subject = getSubjectById(id);
    if (!subject) return id;
    return lang === 'ru' ? subject.ru : subject.en;
}
