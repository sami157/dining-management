import { useState } from 'react'
import { format } from 'date-fns';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { IoIosAddCircle } from "react-icons/io";
import useAxiosSecure from '../../hooks/useAxiosSecure';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';



const MemberInfoTable = ({ usersData, depositsData, balancesData, monthFinalized, refetchDeposits, currentMonth }) => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [depositAmount, setDepositAmount] = useState('');
    const [depositNotes, setDepositNotes] = useState('');
    const [editingDeposit, setEditingDeposit] = useState(false);

    // Open deposit modal
    const openDepositModal = (user, existingDeposit = null) => {
        setSelectedUser(user);
        if (existingDeposit) {
            setEditingDeposit(existingDeposit);
            setDepositAmount(existingDeposit.amount);
            setDepositNotes(existingDeposit.notes);
        } else {
            setEditingDeposit(null);
            setDepositAmount('');
            setDepositNotes('');
        }
        setShowDepositModal(true);
    };

    // Handle deposit submission
    const handleDepositSubmit = async () => {
        if (!depositAmount || depositAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            if (editingDeposit) {
                // Update existing deposit
                toast.promise(
                    async () => {
                        await axiosSecure.put(`/finance/deposits/${editingDeposit._id}`, {
                            amount: parseFloat(depositAmount),
                            notes: depositNotes
                        });
                        setShowDepositModal(false);
                        refetchDeposits();
                    },
                    {
                        loading: 'Updating deposit',
                        success: 'Deposit updated successfully',
                        error: 'Failed to update deposit',
                    }
                )
            } else {
                // Add new deposit
                toast.promise(
                    async () => {
                        await axiosSecure.post('/finance/deposits/add', {
                            userId: selectedUser._id.toString(),
                            amount: parseFloat(depositAmount),
                            month: currentMonth,
                            notes: depositNotes
                        });
                        setShowDepositModal(false);
                        refetchDeposits();
                    },
                    {
                        loading: 'Adding deposit',
                        success: 'Deposit added successfully',
                        error: 'Failed to add deposit',
                    }
                )
            }
            queryClient.invalidateQueries(['allBalances']);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save deposit');
        }
    };

    // Get user balance
    const getUserBalance = (userId) => {
        const balance = balancesData?.find(b => b.userId === userId);
        return balance?.balance || 0;
    };

    // Delete deposit
    const handleDeleteDeposit = async (depositId) => {
        if (!confirm('Are you sure you want to delete this deposit?')) return;

        try {
            await axiosSecure.delete(`/finance/deposits/${depositId}`);
            toast.success('Deposit deleted successfully');
            refetchDeposits();
            queryClient.invalidateQueries(['allBalances']);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete deposit');
        }
    };
    return (
        <div className='w-full'>
            {/* Member List with Balances and Deposit Actions */}
            <div>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-semibold'>Member Information</h2>
                </div>

                <div className='overflow-x-auto'>
                    <table className='table table-sm'>
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th className='text-center'>Balance</th>
                                <th className='text-center'>Deposit</th>
                                <th className='text-center'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersData?.map((user) => {
                                const userDeposits = depositsData?.filter(d => d.userId === user._id.toString()) || [];
                                const monthlyDeposits = userDeposits.reduce((sum, d) => sum + d.amount, 0);

                                return (
                                    <tr key={user._id}>
                                        <td>
                                            <div className='flex flex-col'>
                                                <span className='font-medium'>{user.name}</span>
                                                <span className='text-xs text-gray-500'>{user.mobile}</span>
                                            </div>
                                        </td>
                                        <td className='text-center'>
                                            <span className={`font-bold ${getUserBalance(user._id) < 0 ? 'text-error' : 'text-success'}`}>
                                                ৳{getUserBalance(user._id).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className='text-center'>৳{monthlyDeposits.toFixed(2)}</td>
                                        <td className='flex justify-center'>
                                            <button
                                                onClick={() => openDepositModal(user)} disabled={monthFinalized}
                                                className='rounded-full font-semibold text-primary-content flex gap-2 bg-primary cursor-pointer items-center px-2 py-2 disabled:cursor-not-allowed disabled:bg-primary/10 disabled:text-primary-content/50'
                                            >
                                                <div className='flex gap-2 items-center'>
                                                    <IoIosAddCircle className='text-2xl' />
                                                    <p>Deposit</p>
                                                </div>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Recent Deposits */}
                <div className='mt-6'>
                    <h3 className='text-lg font-semibold mb-3'>Recent Deposits</h3>
                    <div className='overflow-x-auto'>
                        <table className='table table-xs'>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Member</th>
                                    <th>Amount</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {depositsData?.slice(0, 10).map((deposit) => (
                                    <tr key={deposit._id}>
                                        <td>{format(new Date(deposit.depositDate), 'dd MMM')}</td>
                                        <td>{deposit.userName}</td>
                                        <td className='font-medium'>৳{deposit.amount.toFixed(2)}</td>
                                        <td className='text-xs'>{deposit.notes || '-'}</td>
                                        <td>
                                            <div className='flex gap-1'>
                                                <button
                                                    onClick={() => {
                                                        const user = usersData?.find(u => u._id.toString() === deposit.userId);
                                                        if (user) openDepositModal(user, deposit);
                                                    }}
                                                    className='btn btn-xs btn-ghost'
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDeposit(deposit._id)}
                                                    className='btn btn-xs btn-ghost text-error'
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">
                            {editingDeposit ? 'Edit Deposit' : 'Add Deposit'} - {selectedUser?.name}
                        </h3>

                        <div className='flex flex-col gap-3'>
                            <div>
                                <label className='label'>Amount (৳)</label>
                                <input
                                    type="number"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className='input input-bordered w-full'
                                    placeholder='Enter amount'
                                />
                            </div>

                            <div>
                                <label className='label'>Notes (Optional)</label>
                                <textarea
                                    value={depositNotes}
                                    onChange={(e) => setDepositNotes(e.target.value)}
                                    className='textarea textarea-bordered w-full'
                                    placeholder='Add notes'
                                />
                            </div>
                        </div>

                        <div className="modal-action">
                            <button onClick={handleDepositSubmit} className='btn btn-primary'>
                                {editingDeposit ? 'Update' : 'Add'} Deposit
                            </button>
                            <button onClick={() => setShowDepositModal(false)} className='btn'>
                                Cancel
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setShowDepositModal(false)}></div>
                </div>
            )}
        </div>
    )
}

export default MemberInfoTable
