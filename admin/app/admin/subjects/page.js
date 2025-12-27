'use client';

import { useState, useEffect } from 'react';
import { tracksAPI, subjectsAPI } from '@/lib/api';

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [selectedTrack, setSelectedTrack] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [formData, setFormData] = useState({
        trackId: '',
        name: '',
        description: '',
        colorCode: '#2563EB',
        isFree Trial: false,
        displayOrder: 1,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const tracksRes = await tracksAPI.getAll();
            setTracks(tracksRes.data || []);

            if (tracksRes.data?.length > 0) {
                loadSubjects(tracksRes.data[0].id);
            }
        } catch (error) {
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const loadSubjects = async (trackId) => {
        try {
            const response = await subjectsAPI.getByTrack(trackId);
            setSubjects(response.data || []);
        } catch (error) {
            console.error('Failed to load subjects');
        }
    };

    const handleTrackChange = (trackId) => {
        setSelectedTrack(trackId);
        if (trackId !== 'all') {
            loadSubjects(trackId);
        }
    };

    const handleCreate = () => {
        setEditingSubject(null);
        setFormData({
            trackId: tracks[0]?.id || '',
            name: '',
            description: '',
            colorCode: '#2563EB',
            isFreeTrial: false,
            displayOrder: subjects.length + 1,
        });
        setShowModal(true);
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setFormData({
            trackId: subject.track_id,
            name: subject.name,
            description: subject.description,
            colorCode: subject.color_code,
            isFreeTrial: subject.is_free_trial,
            displayOrder: subject.display_order,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSubject) {
                await subjectsAPI.update(editingSubject.id, formData);
                alert('Subject updated successfully');
            } else {
                await subjectsAPI.create(formData);
                alert('Subject created successfully');
            }
            setShowModal(false);
            loadSubjects(formData.trackId);
        } catch (error) {
            alert('Failed to save subject');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this subject?')) return;

        try {
            await subjectsAPI.delete(id);
            alert('Subject deleted successfully');
            loadSubjects(selectedTrack);
        } catch (error) {
            alert('Failed to delete subject');
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
                    <h2 className="text-2xl font-bold text-gray-900">Subjects</h2>
                    <p className="text-gray-600">Manage subjects by track</p>
                </div>
                <button onClick={handleCreate} className="btn-primary">
                    + Add Subject
                </button>
            </div>

            {/* Track Filter */}
            <div className="mb-6">
                <label className="label">Filter by Track</label>
                <select
                    className="input-field max-w-xs"
                    value={selectedTrack}
                    onChange={(e) => handleTrackChange(e.target.value)}
                >
                    <option value="all">All Tracks</option>
                    {tracks.map((track) => (
                        <option key={track.id} value={track.id}>
                            {track.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Subjects List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((subject) => (
                    <div
                        key={subject.id}
                        className="card border-l-4"
                        style={{ borderLeftColor: subject.color_code }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                                    {subject.is_free_trial && (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                            FREE
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{subject.description}</p>
                                <p className="text-xs text-gray-500">Order: {subject.display_order}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(subject)}
                                    className="text-primary-600 hover:bg-primary-50 px-3 py-1 rounded transition-colors text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(subject.id)}
                                    className="text-red-600 hover:bg-red-50 px-3 py-1 rounded transition-colors text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {subjects.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-gray-500">
                        No subjects found. Create your first subject!
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {editingSubject ? 'Edit Subject' : 'Create Subject'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Track</label>
                                <select
                                    className="input-field"
                                    value={formData.trackId}
                                    onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Track</option>
                                    {tracks.map((track) => (
                                        <option key={track.id} value={track.id}>
                                            {track.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Subject Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Anatomy"
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
                            <div>
                                <label className="label">Color Code</label>
                                <input
                                    type="color"
                                    className="input-field h-12"
                                    value={formData.colorCode}
                                    onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="freeTrial"
                                    checked={formData.isFreeTrial}
                                    onChange={(e) => setFormData({ ...formData, isFreeTrial: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="freeTrial" className="text-sm text-gray-700">
                                    Free Trial Subject
                                </label>
                            </div>
                            <div>
                                <label className="label">Display Order</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                    min="1"
                                    required
                                />
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
                                    {editingSubject ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
