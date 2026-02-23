import React from 'react'
import { FaCircleCheck } from "react-icons/fa6";

export const MonthlySummaryHistory = ({ totalExpenses, depositsData, finalizationData }) => {
    return (
        <div className='flex flex-col gap-4'>
            <div>
                {/* Expense Summary */}
                <div className='card bg-base-200'>
                    <div className='p-8 flex flex-col gap-4'>
                        <div className='flex items-center justify-between'>
                            <h2 className='card-title'>Monthly Summary</h2>
                        </div>

                        <div className='rounded-lg w-full mx-auto grid grid-cols-2 justify-center gap-4'>
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
                                <div className=''>Meals</div>
                                <div className='text-xl font-bold'>
                                    {finalizationData?.totalMealsServed || 0}
                                </div>
                            </div>

                            <div className='p-4 w-full bg-base-100 rounded-xl text-center'>
                                <div className=''>Meal Rate</div>
                                <div className='text-xl font-bold'>
                                    ৳{finalizationData?.mealRate?.toFixed(0) || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}