import React from 'react'
import Loading from '../Loading'

export const UserMonthlyStats = ({ finalizationData, finalizationLoading }) => {
    return (
        <div>
            {
                finalizationData ? 
                finalizationLoading ? <Loading/> :
                        <div className='flex flex-col gap-3'>
                            <h2 className='text-xl font-bold text-center'>Summary</h2>

                            {!finalizationData ? (
                                <p className='text-center text-base-content/60'>No finalization record for this month</p>
                            ) : (
                                <div className='bg-base-200 rounded-xl p-4 flex flex-col gap-3'>
                                    {/* Stats Grid */}
                                    <div className='grid grid-cols-2 gap-2 text-sm'>
                                        <div className='bg-base-100 rounded-lg p-3 text-center'>
                                            <div className='text-base-content/60'>Meal Rate</div>
                                            <div className='font-bold'>৳{finalizationData.mealRate?.toFixed(0)}</div>
                                        </div>
                                        <div className='bg-base-100 rounded-lg p-3 text-center'>
                                            <div className='text-base-content/60'>Meal Cost</div>
                                            <div className='font-bold text-error'>৳{finalizationData.mealCost?.toFixed(0)}</div>
                                        </div>
                                        <div className='bg-base-100 rounded-lg p-3 text-center'>
                                            <div className='text-base-content/60'>Mosque Fee</div>
                                            <div className='font-bold text-error'>৳{finalizationData.mosqueFee || 0}</div>
                                        </div>
                                        <div className='bg-base-100 rounded-lg p-3 text-center'>
                                            <div className='text-base-content/60'>Prev. Balance</div>
                                            <div className={`font-bold ${finalizationData.previousBalance >= 0 ? 'text-success' : 'text-error'}`}>
                                                ৳{finalizationData.previousBalance?.toFixed(0)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Closing Balance */}
                                    <div className={`rounded-lg p-3 text-center ${finalizationData.newBalance >= 0 ? 'bg-success/10' : 'bg-error/10'}`}>
                                        <div className='text-base-content/60 text-sm'>Closing Balance</div>
                                        <div className={`text-xl font-bold ${finalizationData.newBalance >= 0 ? 'text-success' : 'text-error'}`}>
                                            ৳{finalizationData.newBalance?.toFixed(0)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                : <p className='text-center text-base-content/60'>No finalization record for this month</p> 
            }
            {/* Finalization Summary */}
            
        </div>
    )
}
