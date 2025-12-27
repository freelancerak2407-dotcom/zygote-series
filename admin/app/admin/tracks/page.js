'use client';

import { useState, useEffect } from 'react';
import { tracksAPI } from '@/lib/api';

export default function TracksPage() {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTrack, setEditingTrack] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        yearNumber: 1,
        displayOrder: 1,
    });

    useEffect(() => {
        loadTracks();
    }, []);

    const loadTracks = async () => {
        try {
            const response = await tracksAPI.getAll();
            setTracks(response.data || []);
        } catch (error) {
            alert('Failed to load tracks');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTrack(null);
        setFormData({
            name: '',
            description: '',
            yearNumber: tracks.length + 1,
            displayOrder: tracks.length + 1,
        });
        setShowModal(true);
    };

    const handleEdit = (track) => {
        setEditingTrack(track);
        setFormData({
            name: track.name,
            description: track.description,
            yearNumber: track.year_number,
            displayOrder: track.display_order,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTrack) {
                await tracksAPI.update(editingTrack.id, formData);
                alert('Track updated successfully');
            } else {
                await tracksAPI.create(formData);
                alert('Track created successfully');
            }
            setShowModal(false);
            loadTracks();
        } catch (error) {
            alert('Failed to save track');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this track?')) return;

        try {
            await tracksAPI.delete(id);
            alert('Track deleted successfully');
            loadTracks();
        } catch (error) {
            alert('Failed to delete track');
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
                    <h2 className="text-2xl font-bold text-gray-900">MBBS Tracks</h2>
                    <p className="text-gray-600">Manage academic year tracks</p>
                </div>
                <button onClick={handleCreate} className="btn-primary">
                    + Add Track
                </button>
            </div>

            {/* Tracks List */}
            <div className="space-y-4">
                {tracks.map((track) => (
                    <div key={track.id} className="card">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{track.name}</h3>
                                <p className="text-gray-600 mt-1">{track.description}</p>
                                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                    <span>Year: {track.year_number}</span>
                                    <span>Order: {track.display_order}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(track)}
                                    className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(track.id)}
                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {tracks.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No tracks found. Create your first track!
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">
                            {editingTrack ? 'Edit Track' : 'Create Track'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Track Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., First Year MBBS"
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Year Number</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.yearNumber}
                                        onChange={(e) => setFormData({ ...formData, yearNumber: parseInt(e.target.value) })}
                                        min="1"
                                        required
                                    />
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
                                    {editingTrack ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
