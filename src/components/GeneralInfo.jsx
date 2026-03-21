import { Mail, Phone } from 'lucide-react';
import React from 'react';

const GeneralInfo = ({ managerList, isLoading }) => {
    if (isLoading) {
        return <div className="text-center p-10 font-semibold">Loading managers...</div>;
    }

    if (!managerList || managerList.length === 0) {
        return <div className="text-center p-10 text-gray-500">No administrators found.</div>;
    }

    return (
        <div className="p-2">
            <h2 className="text-2xl py-4 font-black tracking-tighter uppercase italic text-gray-800">Managers</h2>

            <div className="flex flex-col gap-4 bg-base-200 p-4 rounded-xl">
                {managerList.map((manager) => (
                    <div
                        key={manager._id || manager.id}
                        className="w-full duration-300"
                    >
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-content font-bold text-xl uppercase">
                                {manager.name?.toUpperCase().charAt(0) || 'A'}
                            </div>

                            <div className='flex flex-col'>
                                <div>
                                    <h3 className="uppercase font-semibold text-base-content/60">
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

            <h2 className="text-2xl py-4 font-black tracking-tighter uppercase italic text-gray-800">Meal Deadlines</h2>

            <div className="text-base-content/60 text-sm tracking-wide">
                <p><span className='font-bold uppercase'>Morning:</span> Previous Day 10 PM</p>
                <p><span className='font-bold uppercase'>Evening:</span> Same Day 10 AM</p>
                <p><span className='font-bold uppercase'>Night:</span> Same Day 2 PM</p>
            </div>
        </div>
    );
};

export default GeneralInfo;