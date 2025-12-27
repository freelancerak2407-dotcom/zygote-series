'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { topicsAPI, contentAPI, mcqsAPI } from '@/lib/api';

export default function TopicEditPage() {
    const params = useParams();
    const router = useRouter();
    const [topic, setTopic] = useState(null);
    const [activeTab, setActiveTab] = useState('notes');
    const [notes, setNotes] = useState('');
    const [summary, setSummary] = useState('');
    const [mcqs, setMcqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadTopic();
    }, []);

    const loadTopic = async () => {
        try {
            const response = await topicsAPI.get(params.id);
            setTopic(response.data);

            // Load existing content based on active tab
            await loadTabContent(response.data);
        } catch (error) {
            alert('Failed to load topic');
        } finally {
            setLoading(false);
        }
    };

    const loadTabContent = async (topicData) => {
        try {
            if (activeTab === 'notes' && topicData.has_notes) {
                const response = await contentAPI.getNotes(params.id);
                setNotes(response.data?.content || '');
            } else if (activeTab === 'summary' && topicData.has_summary) {
                const response = await contentAPI.getSummary(params.id);
                setSummary(response.data?.content || '');
            } else if (activeTab === 'mcqs') {
                const response = await mcqsAPI.getByTopic(params.id);
                setMcqs(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load content');
        }
    };

    const handleSaveNotes = async () => {
        setSaving(true);
        try {
            await contentAPI.createNotes(params.id, { content: notes });
            alert('Notes saved successfully');
            loadTopic();
        } catch (error) {
            alert('Failed to save notes');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSummary = async () => {
        setSaving(true);
        try {
            await contentAPI.createSummary(params.id, { content: summary });
            alert('Summary saved successfully');
            loadTopic();
        } catch (error) {
            alert('Failed to save summary');
        } finally {
            setSaving(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (topic) {
            loadTabContent(topic);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading topic...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-2"
                >
                    ← Back to Topics
                </button>
                <h2 className="text-2xl font-bold text-gray-900">{topic?.title}</h2>
                <p className="text-gray-600 mt-1">{topic?.description}</p>

                {/* Completion Status */}
                <div className="flex gap-3 mt-4">
                    <StatusBadge label="Notes" completed={topic?.has_notes} />
                    <StatusBadge label="Summary" completed={topic?.has_summary} />
                    <StatusBadge label="Mind Map" completed={topic?.has_mindmap} />
                    <StatusBadge label="MCQs" completed={topic?.has_mcqs} />
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-4">
                    {[
                        { key: 'notes', label: 'Notes', icon: '📝' },
                        { key: 'summary', label: 'Summary', icon: '📋' },
                        { key: 'mindmap', label: 'Mind Map', icon: '🗺️' },
                        { key: 'mcqs', label: 'MCQs', icon: '❓' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`px-4 py-2 border-b-2 font-medium flex items-center gap-2 ${activeTab === tab.key
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {activeTab === 'notes' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="label">Notes Content (Markdown Supported)</label>
                            <button
                                onClick={handleSaveNotes}
                                disabled={saving}
                                className="btn-primary"
                            >
                                {saving ? 'Saving...' : 'Save Notes'}
                            </button>
                        </div>
                        <textarea
                            className="input-field font-mono text-sm"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="25"
                            placeholder="Enter notes content here...

# Heading 1
## Heading 2

**Bold text**
*Italic text*

- Bullet point
1. Numbered list"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Tip: Use Markdown formatting for better readability
                        </p>
                    </div>
                )}

                {activeTab === 'summary' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="label">Summary Content (Markdown Supported)</label>
                            <button
                                onClick={handleSaveSummary}
                                disabled={saving}
                                className="btn-primary"
                            >
                                {saving ? 'Saving...' : 'Save Summary'}
                            </button>
                        </div>
                        <textarea
                            className="input-field font-mono text-sm"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            rows="25"
                            placeholder="Enter summary content here..."
                        />
                    </div>
                )}

                {activeTab === 'mindmap' && (
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Mind Map Upload</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <div className="text-4xl mb-4">🗺️</div>
                            <p className="text-gray-600 mb-4">Upload mind map image</p>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="mindmap-upload"
                            />
                            <label htmlFor="mindmap-upload" className="btn-primary cursor-pointer">
                                Choose Image
                            </label>
                            <p className="text-xs text-gray-500 mt-4">
                                Supported formats: JPG, PNG, SVG
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'mcqs' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900">MCQs ({mcqs.length})</h3>
                            <button className="btn-primary">+ Add MCQ</button>
                        </div>

                        {mcqs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-4xl mb-4">❓</div>
                                <p>No MCQs yet. Add your first MCQ!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {mcqs.map((mcq, index) => (
                                    <div key={mcq.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-gray-900">
                                                {index + 1}. {mcq.question}
                                            </h4>
                                            <button className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-sm">
                                                Delete
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className={mcq.correct_answer === 'A' ? 'text-green-600 font-medium' : ''}>
                                                A. {mcq.option_a}
                                            </div>
                                            <div className={mcq.correct_answer === 'B' ? 'text-green-600 font-medium' : ''}>
                                                B. {mcq.option_b}
                                            </div>
                                            <div className={mcq.correct_answer === 'C' ? 'text-green-600 font-medium' : ''}>
                                                C. {mcq.option_c}
                                            </div>
                                            <div className={mcq.correct_answer === 'D' ? 'text-green-600 font-medium' : ''}>
                                                D. {mcq.option_d}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ label, completed }) {
    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${completed
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
        >
            {label} {completed ? '✓' : '○'}
        </span>
    );
}
