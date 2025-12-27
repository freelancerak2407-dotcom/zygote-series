'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { subjectsAPI, topicsAPI } from '@/lib/api';

export default function TopicsPage() {
    const router = useRouter();
    const [topics, setTopics] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        subjectId: '',
        title: '',
        description: '',
        isFreeSample: false,
        displayOrder: 1,
    });

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            // Load all subjects from all tracks
            const response = await subjectsAPI.getByTrack('all'); // You might need to adjust this
            setSubjects(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load subjects');
            setLoading(false);
        }
    };

    const loadTopics = async (subjectId) => {
        try {
            const response = await topicsAPI.getBySubject(subjectId);
            setTopics(response.data || []);
        } catch (error) {
            console.error('Failed to load topics');
        }
    };

    const handleSubjectChange = (subjectId) => {
        setSelectedSubject(subjectId);
        if (subjectId !== 'all') {
            loadTopics(subjectId);
        } else {
            setTopics([]);
        }
    };

    const handleCreate = () => {
        setFormData({
            subjectId: selectedSubject !== 'all' ? selectedSubject : subjects[0]?.id || '',
            title: '',
            description: '',
            isFreeSample: false,
            displayOrder: topics.length + 1,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await topicsAPI.create(formData);
            alert('Topic created successfully');
            setShowModal(false);
            loadTopics(formData.subjectId);
        } catch (error) {
            alert('Failed to create topic');
        }
    };

    const handleEdit = (topicId) => {
        router.push(`/admin/topics/${topicId}/edit`);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this topic?')) return;

        try {
            await topicsAPI.delete(id);
            alert('Topic deleted successfully');
            loadTopics(selectedSubject);
        } catch (error) {
            alert('Failed to delete topic');
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Topics</h2>
                    <p className="text-gray-600">Manage topics and their content</p>
                </div>
                <button onClick={handleCreate} className="btn-primary">
                    + Add Topic
                </button>
            </div>

            {/* Subject Filter */}
            <div className="mb-6">
                <label className="label">Filter by Subject</label>
                <select
                    className="input-field max-w-xs"
                    value={selectedSubject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                >
                    <option value="all">Select a subject</option>
                    {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                            {subject.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Topics List */}
            <div className="space-y-3">
                {topics.map((topic) => (
                    <div key={topic.id} className="card">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{topic.title}</h3>
                                    {topic.is_free_sample && (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                            FREE SAMPLE
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 text-sm mb-3">{topic.description}</p>

                                {/* Completion Status */}
                                <div className="flex gap-3 text-sm">
                                    <CompletionBadge label="Notes" completed={topic.has_notes} />
                                    <CompletionBadge label="Summary" completed={topic.has_summary} />
                                    <CompletionBadge label="Mind Map" completed={topic.has_mindmap} />
                                    <CompletionBadge label="MCQs" completed={topic.has_mcqs} />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(topic.id)}
                                    className="btn-primary text-sm"
                                >
                                    Edit Content
                                </button>
                                <button
                                    onClick={() => handleDelete(topic.id)}
                                    className="text-red-600 hover:bg-red-50 px-3 py-2 rounded transition-colors text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {topics.length === 0 && selectedSubject !== 'all' && (
                    <div className="text-center py-12 text-gray-500">
                        No topics found. Create your first topic!
                    </div>
                )}

                {selectedSubject === 'all' && (
                    <div className="text-center py-12 text-gray-500">
                        Please select a subject to view topics
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Create Topic</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Subject</label>
                                <select
                                    className="input-field"
                                    value={formData.subjectId}
                                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Topic Title</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Cardiovascular System"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Description</label>
                                <textarea
                                    className="input-field"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description"
                                    rows="3"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="freeSample"
                                    checked={formData.isFreeSample}
                                    onChange={(e) => setFormData({ ...formData, isFreeSample: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="freeSample" className="text-sm text-gray-700">
                                    Free Sample Topic
                                </label>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function CompletionBadge({ label, completed }) {
    return (
        <span
            className={`px-2 py-1 rounded text-xs font-medium ${completed
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
        >
            {label} {completed ? '✓' : '○'}
        </span>
    );
}
