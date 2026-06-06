import { Phone } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';
import { getMealLabel } from '../utils/mealTypes';

const ManagerListSkeleton = () => (
    <motion.div
        layout
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="p-2 overflow-hidden"
    >
        <h2 className="text-2xl py-4 font-black tracking-tighter uppercase italic text-base-content">Managers</h2>

        <div className="flex flex-col gap-4 bg-base-200 p-4 rounded-xl" aria-label="Loading managers">
            {['Manager 1', 'Manager 2'].map((name) => (
                <div key={name} className="w-full">
                    <div className="flex gap-4 items-center">
                        <div className="flex flex-col">
                            <div>
                                <p className="skeleton skeleton-text h-5 w-36 text-sm font-black uppercase tracking-tight text-base-content/60 flex items-center">
                                    {name}
                                </p>
                            </div>
                            <div className="text-sm flex items-center gap-0.5 text-base-content/50">
                                <span><Phone size={16} /></span>
                                <p className="skeleton skeleton-text text-xs font-medium w-28">
                                    01XXXXXXXXX
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <h2 className="text-2xl py-4 font-black tracking-tighter uppercase italic text-base-content">Meal Deadlines</h2>
        <div className="tabs tabs-box p-2">
            <p className="skeleton skeleton-text h-10 w-full text-sm font-bold flex items-center justify-center">
                Loading
            </p>
            <p className="skeleton skeleton-text h-14 w-full text-sm font-medium flex items-center justify-center mt-2">
                Loading
            </p>
        </div>
    </motion.div>
);

const GeneralInfo = ({ managerList, isLoading }) => {
    if (isLoading) {
        return (
            <motion.div layout transition={{ duration: 0.25, ease: 'easeInOut' }}>
                <ManagerListSkeleton />
            </motion.div>
        );
    }

    if (!managerList || managerList.length === 0) {
        return (
            <motion.div layout transition={{ duration: 0.25, ease: 'easeInOut' }} className="text-center p-10 text-gray-500 overflow-hidden">
                No administrators found.
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="p-2 overflow-hidden"
        >
            <h2 className="text-2xl py-4 font-black tracking-tighter uppercase italic text-base-content">Managers</h2>

            <motion.div
                layout
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="flex flex-col gap-4 bg-base-200 p-4 rounded-xl overflow-hidden"
            >
                {managerList.map((manager) => (
                    <motion.div
                        layout
                        key={manager._id || manager.id}
                        className="w-full duration-300"
                    >
                        <div className="flex gap-4 items-center">
                            {/* <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-content font-black text-xl uppercase">
                                {manager.name?.toUpperCase().charAt(0) || 'A'}
                            </div> */}

                            <div className='flex flex-col'>
                                <div>
                                    <h3 className="uppercase font-black tracking-tight text-base-content/60">
                                        {manager.name}
                                    </h3>
                                </div>

                                <div className="text-sm flex items-center gap-0.5 text-base-content/50">
                                    <span><Phone size={16} /></span>
                                    <span className="font-medium text-center"></span> {manager.mobile}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <h2 className="text-2xl py-4 font-black tracking-tighter uppercase italic text-base-content">Meal Deadlines</h2>
            {/* name of each tab group should be unique */}
            <div className="tabs tabs-box rounded-2xl p-2">
                <input type="radio" name="my_tabs_6" className="tab font-bold" aria-label={getMealLabel('morning')} defaultChecked/>
                <div className="tab-content bg-base-100 border-base-200 p-4 mt-2">Previous Day 10 PM</div>

                <input type="radio" name="my_tabs_6" className="tab font-bold" aria-label={getMealLabel('evening')} />
                <div className="tab-content bg-base-100 border-base-200 p-4 mt-2">Same Day 8 AM</div>

                <input type="radio" name="my_tabs_6" className="tab font-bold" aria-label={getMealLabel('night')} />
                <div className="tab-content bg-base-100 border-base-200 p-4 mt-2">Same Day 2 PM</div>
            </div>
        </motion.div>
    );
};

export default GeneralInfo;
