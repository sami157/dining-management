import { Mail, Phone } from 'lucide-react';
import React from 'react';
import { getMealLabel } from '../utils/mealTypes';

const GeneralInfo = ({ managerList, isLoading }) => {
    if (isLoading) {
        return <div className="text-center p-10 font-semibold">Loading managers...</div>;
    }

    if (!managerList || managerList.length === 0) {
        return <div className="text-center p-10 text-gray-500">No administrators found.</div>;
    }

    return (
        <div className="p-2">
            <h2 className="text-2xl py-4 font-black tracking-tighter uppercase italic text-base-content">Managers</h2>

            <div className="flex flex-col gap-4 bg-base-200 p-4 rounded-xl">
                {managerList.map((manager) => (
                    <div
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
                    </div>
                ))}
            </div>

            <h2 className="text-2xl py-4 font-black tracking-tighter uppercase italic text-base-content">Meal Deadlines</h2>
            {/* name of each tab group should be unique */}
            <div className="tabs tabs-box p-2">
                <input type="radio" name="my_tabs_6" className="tab font-bold drop-shadow-xs shadow-none" aria-label={getMealLabel('morning')} defaultChecked/>
                <div className="tab-content bg-base-100 drop-shadow-xs border-base-200 p-4 mt-2">Previous Day 10 PM</div>

                <input type="radio" name="my_tabs_6" className="tab font-bold drop-shadow-xs shadow-none" aria-label={getMealLabel('evening')} />
                <div className="tab-content bg-base-100 drop-shadow-xs border-base-200 p-4 mt-2">Same Day 8 AM</div>

                <input type="radio" name="my_tabs_6" className="tab font-bold drop-shadow-xs shadow-none" aria-label={getMealLabel('night')} />
                <div className="tab-content bg-base-100 drop-shadow-xs border-base-200 p-4 mt-2">Same Day 2 PM</div>
            </div>
        </div>
    );
};

export default GeneralInfo;
