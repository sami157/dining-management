import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useAxiosSecure from '../hooks/useAxiosSecure';
import { PenLine, X } from 'lucide-react';

const buildingOptions = [
    { value: 'vip', label: 'VIP Building', aliases: ['vip', 'vip building'] },
    { value: 'engineer', label: "Engineers' Building", aliases: ['engineer', 'engineers', "engineers' building", 'engineers building'] },
    { value: 'mjvc', label: 'MJVC Building', aliases: ['mjvc', 'mjvc building'] },
];

const normalizeBuildingValue = (building) => {
    const normalized = String(building || '').trim().toLowerCase();
    return buildingOptions.find((option) => option.aliases.includes(normalized))?.value || 'vip';
};

export const UserProfile = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm();

    const { data: userData, isLoading } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const response = await axiosSecure.get('/users/profile');
            return response.data.user;
        }
    });

    useEffect(() => {
        if (userData) {
            reset({
                name: userData.name || '',
                mobile: userData.mobile || '',
                building: normalizeBuildingValue(userData.building),
                room: userData.room || '',
                designation: userData.designation || '',
                department: userData.department || '',
            });
        }
    }, [reset, userData]);

    const updateProfile = useMutation({
        mutationFn: async (formData) => {
            const payload = {
                name: formData.name,
                mobile: formData.mobile,
                building: formData.building,
                room: formData.room,
                designation: formData.designation,
                department: formData.department,
            };

            const response = await axiosSecure.put('/users/profile', payload);
            return response.data;
        },
        onSuccess: async () => {
            toast.success('Profile updated');
            setIsEditing(false);
            await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            await queryClient.invalidateQueries({ queryKey: ['userData'] });
        },
        onError: () => {
            toast.error('Failed to update profile');
        }
    });

    const onSubmit = (formData) => {
        updateProfile.mutate(formData);
    };

    const handleCancel = () => {
        if (userData) {
            reset({
                name: userData.name || '',
                mobile: userData.mobile || '',
                building: normalizeBuildingValue(userData.building),
                room: userData.room || '',
                designation: userData.designation || '',
                department: userData.department || '',
            });
        }
        setIsEditing(false);
    };

    return (
        <div className="p-4 md:p-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Profile</h1>
                        <p className="text-sm text-base-content/50">
                            {isEditing ? 'Update your member information.' : 'View your member information.'}
                        </p>
                    </div>

                    {!isEditing && (
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => setIsEditing(true)}
                            disabled={isLoading}
                        >
                            <PenLine size={16} />
                            Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-base-100 border border-base-300 rounded-xl p-4 md:p-6">
                    <fieldset className="fieldset grid grid-cols-1 md:grid-cols-2 gap-x-4" disabled={isLoading || updateProfile.isPending || !isEditing}>
                        <label className="label">Name</label>
                        <label className="label hidden md:block">Mobile Number</label>

                        <div>
                            <input
                                {...register('name', { required: 'Name is required' })}
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="Name"
                            />
                            {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="label md:hidden">Mobile Number</label>
                            <input
                                {...register('mobile', {
                                    required: 'Mobile number is required',
                                    minLength: { value: 11, message: '11 digit mobile number is required' },
                                    maxLength: { value: 11, message: '11 digit mobile number is required' },
                                })}
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="01700000000"
                            />
                            {errors.mobile && <p className="text-error text-sm mt-1">{errors.mobile.message}</p>}
                        </div>

                        <label className="label">Building</label>
                        <label className="label hidden md:block">Room</label>

                        <select
                            {...register('building', { required: 'Building name is required' })}
                            className="select select-bordered w-full"
                        >
                            {buildingOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {errors.building && <p className="text-error text-sm mt-1">{errors.building.message}</p>}

                        <div>
                            <label className="label md:hidden">Room</label>
                            <input
                                {...register('room', {
                                    setValueAs: (value) => value?.toUpperCase?.() || value,
                                    pattern: {
                                        value: /^(\d{3}(-[A-Z])?)?$/,
                                        message: 'Use format like 110 or 201-A'
                                    }
                                })}
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="110"
                            />
                            {errors.room && <p className="text-error text-sm mt-1">{errors.room.message}</p>}
                        </div>

                        <label className="label">Designation</label>
                        <label className="label hidden md:block">Department</label>

                        <input {...register('designation')} type="text" className="input input-bordered w-full" placeholder="Designation" />

                        <div>
                            <label className="label md:hidden">Department</label>
                            <input {...register('department')} type="text" className="input input-bordered w-full" placeholder="Department" />
                        </div>

                    </fieldset>

                    {isEditing && (
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" className="btn btn-ghost" onClick={handleCancel} disabled={updateProfile.isPending}>
                            <X size={16} />
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isLoading || updateProfile.isPending || !isDirty}>
                            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                    )}
                </form>
            </div>
        </div>
    );
};
