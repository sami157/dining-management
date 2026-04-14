import { Mail, Phone } from 'lucide-react';
import React from 'react';
import { getMealLabel } from '../utils/mealTypes';

const GeneralInfo = ({ managerList, isLoading }) => {
    if (isLoading) {
        return (
            <div className="p-2">
                <h2 className="text-2xl py-4 font-black tracking-tighter uppercase italic text-base-content">Managers</h2>
                <div className="flex flex-col gap-4 rounded-xl bg-base-200 p-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex items-center gap-4 animate-pulse">
                            <div className="h-11 w-11 rounded-full bg-base-100/80" />
                            <div className="flex flex-1 flex-col gap-2">
                                <div className="h-4 w-36 rounded-full bg-base-100/80" />
                                <div className="h-3 w-28 rounded-full bg-base-100/70" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!managerList || managerList.length === 0) {
        return <div className="text-center p-10 text-gray-500">No administrators found.</div>;
    }

    return (
        <div className="p-2">
            <h2 className="text-2xl py-4 font-black tracking-tighter uppercase italic text-base-content">Managers</h2>

            <div className="flex flex-col gap-4 bg-muted p-4 rounded-xl">
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
            <div className="tabs bg-muted tabs-box rounded-lg p-2">
                <input type="radio" name="my_tabs_6" className="tab font-bold rounded-md drop-shadow-xs shadow-none" aria-label={getMealLabel('morning')} defaultChecked/>
                <div className="tab-content bg-background rounded-md p-4 mt-2">Previous Day 10 PM</div>

                <input type="radio" name="my_tabs_6" className="tab font-bold rounded-md shadow-none" aria-label={getMealLabel('evening')} />
                <div className="tab-content bg-background rounded-md p-4 mt-2">Same Day 8 AM</div>

                <input type="radio" name="my_tabs_6" className="tab font-bold rounded-md drop-shadow-xs shadow-none" aria-label={getMealLabel('night')} />
                <div className="tab-content bg-background rounded-md p-4 mt-2">Same Day 2 PM</div>
            </div>
        </div>
    );
};

export default GeneralInfo;
