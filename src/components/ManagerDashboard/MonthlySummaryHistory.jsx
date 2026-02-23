import React from 'react'
import { FaCircleCheck } from "react-icons/fa6";

export const MonthlySummaryHistory = ({ totalExpenses, depositsData}) => {
    return (
        <div>
            {/* Expense Summary */}
            <div className='card bg-base-200'>
                <div className='p-8 flex flex-col gap-4'>
                    {/* Header */}
                    <div className='flex items-center justify-between'>
                        <h2 className='card-title'>Monthly Summary</h2>
                    </div>

                    {/* Stats */}
                    <div className='rounded-lg w-full mx-auto flex justify-center gap-4'>
                        <div className='p-4 w-full bg-base-100 rounded-xl text-center'> 
                            <div className='font-medium'>Deposit</div>
                            <div className='text-xl text-success'>
                                ৳{(depositsData?.reduce((sum, d) => sum + d.amount, 0) || 0)}
                            </div>
                        </div>

                        <div className='p-4 w-full bg-base-100 rounded-xl text-center'>
                            <div className=''>Expense</div>
                            <div className='text-xl text-error'>
                                ৳{totalExpenses}
                            </div>
                        </div>

                        <div className='p-4 w-full bg-base-100 rounded-xl text-center'>
                            <div className=''>Balance</div>
                            <div className={`text-xl font-bold ${(depositsData?.reduce((sum, d) => sum + d.amount, 0) || 0) - totalExpenses >= 0
                                ? 'text-success'
                                : 'text-error'
                                }`}>
                                ৳{((depositsData?.reduce((sum, d) => sum + d.amount, 0) || 0) - totalExpenses)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
